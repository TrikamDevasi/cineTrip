import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../lib/alert';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Plus,
  Trash2,
  X,
  Star,
  Armchair,
  Utensils,
  StickyNote,
  Info,
  RefreshCw,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import TicketCard from '../../components/TicketCard';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import InteractiveSeatMap from '../../components/ui/InteractiveSeatMap';
import NetworkStatusBanner from '../../components/ui/NetworkStatusBanner';
import DataSourceBadge from '../../components/DataSourceBadge';
import { getImageUri } from '../../services/tmdb';
import { cinemaService } from '../../services/cinema';
import { getCurrentCity } from '../../services/location';
import { getDeviceContacts, PRESET_SQUAD } from '../../services/contacts';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const SNACK_OPTIONS = [
  'Giant Caramel Popcorn',
  'Loaded Cheese Nachos',
  'Cold Brew Coffee',
  'Cherry ICEE',
  'Gourmet Hot Dog',
  'Dark Chocolate Bites',
];

const buildDateOptions = () => {
  const options = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    options.push({
      iso,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    });
  }
  return options;
};

const DATE_OPTIONS = buildDateOptions();
const providerAvailable = Boolean(cinemaService.isProviderAvailable);

/**
 * Parse a showtime slot time string into a Date object for today.
 * Supports 12-hour formats ("7:30 PM", "11:00 AM") and 24-hour formats ("19:30", "07:30").
 * Returns null if parsing fails.
 */
function parseSlotTime(timeStr) {
  try {
    const str = timeStr.trim().toUpperCase();
    const base = new Date();
    const ampm = str.includes('AM') || str.includes('PM');
    if (ampm) {
      const isPM = str.includes('PM');
      const clean = str.replace(/AM|PM/g, '').trim();
      const [h, m] = clean.split(':').map(Number);
      let hour = h;
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
      base.setHours(hour, m || 0, 0, 0);
    } else {
      const [h, m] = str.split(':').map(Number);
      base.setHours(h, m || 0, 0, 0);
    }
    return base;
  } catch {
    return null;
  }
}

export default function PlannerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'plans'
  const [movieModalVisible, setMovieModalVisible] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [contactsList, setContactsList] = useState(PRESET_SQUAD);
  const [customFriendName, setCustomFriendName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    draft,
    plans,
    isLoading,
    fetchPlans,
    setDraftMovie,
    setDraftCinema,
    setDraftDateTime,
    setDraftShowtime,
    setDraftNotes,
    toggleDraftFriend,
    addDraftFriend,
    removeDraftFriend,
    addPlan,
    resetDraft,
    deletePlan,
  } = usePlannerStore();

  const { snapshot: catalog, canBook, getAvailability, refresh: refreshCatalog } = useMovieCatalog();

  const scrollRef = useRef(null);
  const stepY = useRef({});

  // Guided progress: each step reports whether its inputs are complete.
  const step1Done = Boolean(draft.movie);
  const step2Done = providerAvailable ? Boolean(draft.cinema && draft.date && draft.showtime) : Boolean(draft.movie);
  const step3Done = step2Done; // seats / snacks / squad / notes are all optional
  const stepsDone = [step1Done, step2Done, step3Done].filter(Boolean).length;

  const jumpToStep = (index) => {
    const y = stepY.current[index];
    if (scrollRef.current && y != null) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  };

  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [cinemaLoading, setCinemaLoading] = useState(false);
  const [showtimesLoading, setShowtimesLoading] = useState(false);

  useEffect(() => {
    loadContacts();
    if (isAuthenticated) {
      fetchPlans();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (providerAvailable) {
      loadNearbyCinemas();
    }
  }, []);

  useEffect(() => {
    if (providerAvailable && draft.movie && draft.cinema && draft.date) {
      loadShowtimes();
    } else {
      setShowtimes([]);
    }
  }, [draft.movie, draft.cinema, draft.date]);

  const loadNearbyCinemas = async () => {
    setCinemaLoading(true);
    try {
      const loc = await getCurrentCity();
      const list = await cinemaService.getNearbyCinemas(loc && loc.coordinates);
      setCinemas(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('Failed to load cinemas:', e.message);
      setCinemas([]);
    } finally {
      setCinemaLoading(false);
    }
  };

  const loadShowtimes = async () => {
    setShowtimesLoading(true);
    try {
      const list = await cinemaService.getShowtimes(
        draft.movie.id,
        draft.cinema.id,
        draft.date
      );
      const allSlots = Array.isArray(list) ? list : [];

      // Filter out expired slots when the selected date is today.
      const todayIso = new Date().toISOString().split('T')[0];
      const isToday = draft.date === todayIso;
      let filtered = allSlots;
      if (isToday) {
        const now = new Date();
        filtered = allSlots.filter((slot) => {
          if (!slot.time) return true; // keep if no time string
          // Expect slot.time like "7:30 PM" or "19:30"
          const parsed = parseSlotTime(slot.time);
          return parsed ? parsed > now : true;
        });
      }
      setShowtimes(filtered);
    } catch (e) {
      console.warn('Failed to load showtimes:', e.message);
      setShowtimes([]);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const loadContacts = async () => {
    const contacts = await getDeviceContacts();
    setContactsList(contacts && contacts.length > 0 ? contacts : PRESET_SQUAD);
  };

  const handleSelectMovie = (movie) => {
    setDraftMovie(movie);
    setMovieModalVisible(false);
  };

  const handleSelectCinema = (cinema) => {
    setDraftCinema(cinema);
  };

  const handleSelectShowtime = (slot) => {
    setDraftShowtime(slot);
  };

  const handleSelectDate = (iso) => {
    setDraftDateTime(iso, draft.time, draft.slotName);
  };

  const handleToggleSnack = (snack) => {
    const currentSnacks = draft.snacks || [];
    const exists = currentSnacks.includes(snack);
    const updated = exists
      ? currentSnacks.filter((s) => s !== snack)
      : [...currentSnacks, snack];
    setDraftNotes({ snacks: updated });
  };

  const handleAddCustomFriend = () => {
    if (!customFriendName.trim()) return;
    const newFriend = {
      id: `custom-${Date.now()}`,
      name: customFriendName.trim(),
      status: 'invited',
    };
    addDraftFriend(newFriend);
    setCustomFriendName('');
  };

  const handleSavePlan = async () => {
    if (!draft.movie) {
      showAlert('Select a Movie', 'Please pick a movie to plan your trip in Step 1.');
      return;
    }

    if (!canBook(draft.movie)) {
      showAlert(
        'Not Currently In Theatres',
        'Only films verified as now playing can be planned for a movie night. Browse "Now in Theaters" to pick from what is actually screening.'
      );
      return;
    }

    let bookingStatus = 'plan';
    let bookingRef = '';

    if (providerAvailable) {
      if (!draft.cinema) {
        showAlert('Select a Theatre', 'Pick a theatre for your screening.');
        return;
      }
      if (!draft.showtime) {
        showAlert('Select a Showtime', `Pick a showtime for ${draft.movie.title} on ${draft.date}.`);
        return;
      }
      const booking = await cinemaService.createBooking({
        movieId: draft.movie.id,
        cinemaId: draft.cinema.id,
        showtimeId: draft.showtimeId,
        seats: draft.seats || '',
        date: draft.date,
        time: draft.time,
      });
      if (!booking || !booking.success) {
        showAlert('Booking Unavailable', 'The showtime provider could not confirm this booking right now.');
        return;
      }
      bookingStatus = 'confirmed';
      bookingRef = booking.bookingRef || '';
    }

    setIsSaving(true);
    try {
      const newPlan = await addPlan({
        movie: draft.movie,
        cinema: providerAvailable ? draft.cinema : null,
        date: draft.date || DATE_OPTIONS[0].iso,
        time: providerAvailable && draft.time ? draft.time : '',
        slotName: providerAvailable ? draft.slotName || '' : '',
        showtimeId: providerAvailable ? draft.showtimeId || '' : '',
        friends: draft.friends || [],
        notes: draft.notes || '',
        seats: draft.seats || '',
        bookingRef,
        bookingStatus,
        snacks: draft.snacks || [],
      });

      setIsSaving(false);

      if (bookingStatus === 'confirmed') {
        showAlert('Movie Night Locked In! ðŸŽ¬', `Your trip for "${draft.movie.title}" is confirmed.`, [
          {
            text: 'View Pass',
            onPress: () => router.push(`/ticket/${newPlan._id || newPlan.id}`),
          },
          {
            text: 'View Schedule',
            onPress: () => setActiveTab('plans'),
          },
        ]);
      } else {
        showAlert(
          'Movie Night Plan Saved ðŸŽ¬',
          'Saved as a personal plan. Live ticketing will be enabled once a showtime provider is connected â€” this is not a confirmed booking yet.',
          [
            {
              text: 'View Plan',
              onPress: () => router.push(`/ticket/${newPlan._id || newPlan.id}`),
            },
            {
              text: 'View Schedule',
              onPress: () => setActiveTab('plans'),
            },
          ]
        );
      }
    } catch (err) {
      setIsSaving(false);
      showAlert('Error', err.message || 'Failed to save trip plan.');
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* Network / Offline Sync Status Banner */}
      <NetworkStatusBanner
        isOffline={plans.some((p) => p._id && p._id.startsWith('plan-local-'))}
        isSyncing={isLoading}
      />

      {/* Mode Switcher Tabs */}
      <View style={styles.modeTabsWrapper}>
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'builder' && styles.modeTabActive]}
            onPress={() => setActiveTab('builder')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'builder' }}
            accessibilityLabel="Switch to Trip Builder"
          >
            <Film
              size={16}
              color={activeTab === 'builder' ? '#07090E' : colors.textSecondary}
              strokeWidth={2.2}
            />
            <Text style={[styles.modeTabText, activeTab === 'builder' && styles.modeTabTextActive]}>
              Trip Builder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'plans' && styles.modeTabActive]}
            onPress={() => setActiveTab('plans')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'plans' }}
            accessibilityLabel={`Active plans. ${plans.length} scheduled.`}
          >
            <Calendar
              size={16}
              color={activeTab === 'plans' ? '#07090E' : colors.textSecondary}
              strokeWidth={2.2}
            />
            <Text style={[styles.modeTabText, activeTab === 'plans' && styles.modeTabTextActive]}>
              My Passes ({plans.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'plans' ? (
        /* SAVED PLANS TAB */
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.plansHeader}>
            <Text style={styles.sectionTitle}>Your Scheduled Trips</Text>
            <Text style={styles.sectionSubtitle}>
              Active movie passes and squad reservations
            </Text>
          </View>

          {plans.length === 0 ? (
            <EmptyState
              icon="Ticket"
              title="No Active Movie Nights"
              description="Use the 3-step Trip Builder to schedule your next theatrical experience."
              actionLabel="Start Planning"
              onAction={() => setActiveTab('builder')}
              actionIcon="Plus"
            />
          ) : (
            plans.map((p) => (
              <View key={p._id || p.id} style={styles.planCardWrapper}>
                <TicketCard plan={p} />
                <View style={styles.planActionsRow}>
                  <Button
                    title="Cancel Plan"
                    icon="Trash2"
                    variant="danger"
                    size="sm"
                    onPress={() => {
                      showAlert('Cancel Trip', 'Are you sure you want to remove this trip plan?', [
                        { text: 'Keep Plan' },
                        { text: 'Cancel Trip', style: 'destructive', onPress: () => deletePlan(p._id || p.id) },
                      ]);
                    }}
                    accessibilityLabel={`Cancel trip plan for ${p.movie ? p.movie.title : 'movie'}`}
                  />
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* STREAMLINED 3-STEP TRIP BUILDER */
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* GUIDED PROGRESS HEADER */}
            <View style={styles.progressWrap}>
              <View style={styles.progressRow}>
                {[
                  { n: 1, label: 'Movie', done: step1Done },
                  { n: 2, label: 'Cinema & Time', done: step2Done },
                  { n: 3, label: 'Seats & Squad', done: step3Done },
                ].map((s) => (
                  <TouchableOpacity
                    key={s.n}
                    style={styles.progressStep}
                    onPress={() => jumpToStep(s.n)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to step ${s.n}: ${s.label}${s.done ? ', complete' : ''}`}
                  >
                    <View style={[styles.progressDot, s.done && styles.progressDotDone]}>
                      {s.done ? (
                        <Check size={14} color="#07090E" strokeWidth={3} />
                      ) : (
                        <Text style={styles.progressDotText}>{s.n}</Text>
                      )}
                    </View>
                    <Text style={[styles.progressLabel, s.done && styles.progressLabelDone]} numberOfLines={1}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.progressSummary}>
                {stepsDone === 3
                  ? 'All set â€” ready to lock in!'
                  : `${stepsDone} of 3 steps complete`}
              </Text>
            </View>

            {/* â•â•â•â•â•â•â•â•â• STEP 1: CHOOSE MOVIE â•â•â•â•â•â•â•â•â• */}
            <View style={styles.stepCard} onLayout={(e) => { stepY.current[1] = e.nativeEvent.layout.y; }}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <View style={styles.stepHeaderTitles}>
                  <Text style={styles.stepTitle}>Choose Movie</Text>
                  <Text style={styles.stepSubtitle}>Select what you want to watch</Text>
                </View>
              </View>

              {draft.movie ? (
                <View style={styles.selectedMovieCard}>
                  <Image
                    source={{ uri: getImageUri(draft.movie.poster_path, 'w342') }}
                    style={styles.selectedPoster}
                  />
                  <View style={styles.selectedMovieInfo}>
                    <Text style={styles.selectedMovieTitle} numberOfLines={2}>
                      {draft.movie.title}
                    </Text>
                    <View style={styles.selectedMovieMetaRow}>
                      <Clock size={14} color={colors.textSecondary} strokeWidth={2} />
                      <Text style={styles.selectedMovieMeta}>
                        {draft.movie.runtime || 165} min
                      </Text>
                      <Star size={14} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} style={{ marginLeft: 8 }} />
                      <Text style={styles.selectedMovieMeta}>
                        {draft.movie.vote_average ? draft.movie.vote_average.toFixed(1) : '8.2'}
                      </Text>
                    </View>
                    <View style={styles.formatRow}>
                      {(draft.movie.formats || ['IMAX Laser', 'Dolby Cinema']).map((f, idx) => (
                        <FormatBadge key={idx} format={f} size="small" />
                      ))}
                    </View>
                    <View style={{ marginTop: SPACING.xs }}>
                      <Button
                        title="Change Movie"
                        variant="surface"
                        size="sm"
                        onPress={() => setMovieModalVisible(true)}
                        accessibilityLabel="Change selected movie"
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptyMoviePicker}
                  onPress={() => setMovieModalVisible(true)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Tap to select a movie"
                >
                  <Film size={22} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.emptyMoviePickerTitle}>Select Movie from Catalog</Text>
                  <Text style={styles.emptyMoviePickerSub}>Only films verified as playing now can be planned</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* â•â•â•â•â•â•â•â•â• STEP 2: CINEMA & SHOWTIME â•â•â•â•â•â•â•â•â• */}
            <View style={styles.stepCard} onLayout={(e) => { stepY.current[2] = e.nativeEvent.layout.y; }}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={styles.stepHeaderTitles}>
                  <Text style={styles.stepTitle}>Cinema & Showtime</Text>
                  <Text style={styles.stepSubtitle}>Pick theater format and convenient time slot</Text>
                </View>
              </View>

              {/* Date Selection */}
              <Text style={styles.subStepLabel}>CHOOSE DATE</Text>
              <View style={styles.dateChipsRow}>
                {DATE_OPTIONS.map((d) => {
                  const isSelected = draft.date === d.iso;
                  return (
                    <TouchableOpacity
                      key={d.iso}
                      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                      onPress={() => handleSelectDate(d.iso)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Select date ${d.label}`}
                    >
                      <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {providerAvailable ? (
                <>
                  {/* Cinema Selection (real provider data) */}
                  <Text style={[styles.subStepLabel, styles.cinemasLabel]}>SELECT THEATER & AUDITORIUM</Text>
                  {cinemaLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : cinemas.length === 0 ? (
                    <Text style={styles.noDataText}>
                      No verified theatres found for this location.
                    </Text>
                  ) : (
                    <View style={styles.cinemasList}>
                      {cinemas.map((cinema) => {
                        const isSelected = draft.cinema?.id === cinema.id;
                        return (
                          <TouchableOpacity
                            key={cinema.id}
                            style={[styles.cinemaOption, isSelected && styles.cinemaOptionSelected]}
                            onPress={() => handleSelectCinema(cinema)}
                            activeOpacity={0.75}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={`${cinema.name}, format ${cinema.screenType}`}
                          >
                            <View style={styles.cinemaLeft}>
                              <View style={styles.cinemaTitleRow}>
                                <Text style={[styles.cinemaName, isSelected && styles.cinemaNameSelected]}>
                                  {cinema.name}
                                </Text>
                                {isSelected && (
                                  <View style={styles.selectedCheckIcon}>
                                    <Check size={14} color={colors.primary} strokeWidth={2.5} />
                                  </View>
                                )}
                              </View>
                              <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                              <View style={styles.cinemaBadgeRow}>
                                {cinema.screenType && <FormatBadge format={cinema.screenType} size="small" />}
                                {cinema.distanceKm != null && (
                                  <Text style={styles.cinemaDistance}>{cinema.distanceKm} km away</Text>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  {/* Showtimes (real provider data) */}
                  {draft.movie && draft.cinema && (
                    <>
                      <Text style={[styles.subStepLabel, styles.cinemasLabel]}>
                        AVAILABLE SHOWTIMES â€” {draft.date}
                      </Text>
                      {showtimesLoading ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                      ) : showtimes.length === 0 ? (
                        <Text style={styles.noDataText}>
                          No verified showtimes for this movie, theatre and date. Try another date.
                        </Text>
                      ) : (
                        <View style={styles.timeSlotsGrid}>
                          {showtimes.map((slot) => {
                            const isSelected = draft.time === slot.time;
                            return (
                              <TouchableOpacity
                                key={slot.id || slot.time}
                                style={[styles.timeSlotCard, isSelected && styles.timeSlotCardSelected]}
                                onPress={() => handleSelectShowtime(slot)}
                                activeOpacity={0.75}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: isSelected }}
                                accessibilityLabel={`${slot.time}, ${slot.label || 'Show'}`}
                              >
                                <View style={styles.timeSlotTop}>
                                  <Text style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeSelected]}>
                                    {slot.time}
                                  </Text>
                                  {isSelected && <Check size={14} color={colors.primary} strokeWidth={2.5} />}
                                </View>
                                {slot.label ? (
                                  <Text style={[styles.timeSlotLabel, isSelected && styles.timeSlotLabelSelected]}>
                                    {slot.label}
                                  </Text>
                                ) : null}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </>
                  )}

                  <View style={styles.providerBadgeRow}>
                    <DataSourceBadge source={cinemaService.dataSource} label={cinemaService.sourceLabel} />
                  </View>
                </>
              ) : (
                <View style={styles.unavailableCard}>
                  <Info size={18} color={colors.textMuted} strokeWidth={2} style={{ marginBottom: 6 }} />
                  <Text style={styles.unavailableTitle}>Live showtimes aren't available for this location yet</Text>
                  <Text style={styles.unavailableText}>
                    CineTrip needs a ticketing provider for your area to show real cinemas, showtimes
                    and seats. Until then you can still plan your movie night â€” it will be saved as a
                    personal plan, not a confirmed booking.
                  </Text>
                </View>
              )}
            </View>

            {/* â•â•â•â•â•â•â•â•â• STEP 3: SEATS, SNACKS & SQUAD â•â•â•â•â•â•â•â•â• */}
            <View style={styles.stepCard} onLayout={(e) => { stepY.current[3] = e.nativeEvent.layout.y; }}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <View style={styles.stepHeaderTitles}>
                  <Text style={styles.stepTitle}>Seats, Concessions & Squad</Text>
                  <Text style={styles.stepSubtitle}>Customize seats, invite friends and add snacks</Text>
                </View>
              </View>

              {/* Seat Selection */}
              <Text style={styles.subStepLabel}>AUDITORIUM SEAT SELECTION</Text>
              {(!providerAvailable || !cinemaService.capabilities?.seats) && (
                <Text style={styles.demoNote}>
                  PREVIEW SEAT LAYOUT â€” Seat inventory is illustrative only. Real-time seat availability
                  will appear once a verified ticketing provider is connected for this theatre.
                </Text>
              )}
              <InteractiveSeatMap
                demo={!providerAvailable || !cinemaService.capabilities?.seats}
                selectedSeats={draft.seats ? draft.seats.split(', ').filter(Boolean) : []}
                onSeatsChange={(newSeats) => {
                  setDraftNotes({ seats: newSeats.join(', ') });
                }}
                maxSeats={6}
                ticketPrice={providerAvailable ? (draft.showtime && draft.showtime.price) || 350 : 350}
              />

              {/* Snacks Concession Selector */}
              <Text style={[styles.subStepLabel, { marginTop: SPACING.lg }]}>THEATER REFRESHMENTS</Text>
              <View style={styles.snacksWrap}>
                {SNACK_OPTIONS.map((snack) => {
                  const isSelected = (draft.snacks || []).includes(snack);
                  return (
                    <Chip
                      key={snack}
                      label={snack}
                      selected={isSelected}
                      onPress={() => handleToggleSnack(snack)}
                      accessibilityLabel={`Toggle snack ${snack}`}
                    />
                  );
                })}
              </View>

              {/* Squad & Companions Hub */}
              <View style={styles.squadSectionHeader}>
                <Text style={styles.subStepLabel}>MOVIE SQUAD INVITATIONS</Text>
                <TouchableOpacity
                  onPress={() => setContactsModalVisible(true)}
                  style={styles.addSquadBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Add squad companions"
                >
                  <Plus size={14} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.addSquadBtnText}>Manage Squad</Text>
                </TouchableOpacity>
              </View>

              {(draft.friends || []).length > 0 ? (
                <View style={styles.selectedFriendsList}>
                  {draft.friends.map((friend) => (
                    <View key={friend.id} style={styles.friendTag}>
                      <Text style={styles.friendTagName}>{friend.name}</Text>
                      <TouchableOpacity
                        onPress={() => removeDraftFriend(friend.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${friend.name}`}
                      >
                        <X size={14} color={colors.textMuted} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.emptySquadPicker}
                  onPress={() => setContactsModalVisible(true)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel="Invite companions from contacts"
                >
                  <Users size={18} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.emptySquadText}>Tap to invite friends from your address book</Text>
                </TouchableOpacity>
              )}

              {/* Trip Notes */}
              <Text style={[styles.subStepLabel, { marginTop: SPACING.md }]}>NOTES & PARKING (OPTIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g., Meet at theater lobby 15 min before trailers..."
                placeholderTextColor={colors.textMuted}
                value={draft.notes || ''}
                onChangeText={(text) => setDraftNotes({ notes: text })}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* DOMINANT FINAL CTA */}
            <View style={styles.finalCtaWrapper}>
              <Button
                title={
                  isSaving
                    ? providerAvailable
                      ? 'Locking In Movie Night...'
                      : 'Saving Movie Night Plan...'
                    : providerAvailable
                    ? 'Lock In Movie Night ðŸŽ¬'
                    : 'Save Movie Night Plan'
                }
                variant="primary"
                size="lg"
                loading={isSaving}
                onPress={handleSavePlan}
                accessibilityLabel={
                  providerAvailable
                    ? 'Lock in movie night and generate digital pass'
                    : 'Save movie night plan'
                }
              />
              {!providerAvailable && (
                <Text style={styles.ctaNote}>
                  Personal plan only â€” no live booking until a showtime provider is connected.
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* MOVIE SELECTION MODAL */}
      <Modal
        visible={movieModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMovieModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Film</Text>
            <IconButton
              icon="X"
              variant="surface"
              onPress={() => setMovieModalVisible(false)}
              accessibilityLabel="Close movie selector"
            />
          </View>

          {catalog.loading && catalog.movies.length === 0 ? (
            <View style={styles.modalCenter}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : catalog.movies.length === 0 ? (
            <View style={styles.modalList}>
              <EmptyState
                icon="Film"
                title="No Verified Screenings"
                description={
                  catalog.error
                    ? "We couldn't reach the movie catalog. Check your connection and try again."
                    : "We couldn't verify what is currently in theatres right now. Add a TMDB API key or check back shortly."
                }
                actionLabel="Retry"
                actionIcon="RefreshCw"
                onAction={() => refreshCatalog()}
              />
            </View>
          ) : (
            <FlatList
              data={catalog.movies}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalMovieItem}
                  onPress={() => handleSelectMovie(item)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.title}`}
                >
                  <Image
                    source={{ uri: getImageUri(item.poster_path, 'w185') }}
                    style={styles.modalMoviePoster}
                  />
                  <View style={styles.modalMovieInfo}>
                    <Text style={styles.modalMovieTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.modalMetaRow}>
                      {item.vote_average ? (
                        <>
                          <Star size={12} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
                          <Text style={styles.modalRating}>{item.vote_average.toFixed(1)}</Text>
                        </>
                      ) : null}
                      <Text style={styles.modalStatusText}>
                        {getAvailability(item).label.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* SQUAD CONTACTS MODAL */}
      <Modal
        visible={contactsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setContactsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Squad Members</Text>
            <IconButton
              icon="X"
              variant="surface"
              onPress={() => setContactsModalVisible(false)}
              accessibilityLabel="Close contacts selector"
            />
          </View>

          <View style={styles.customAddRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Add companion by name..."
              placeholderTextColor={colors.textMuted}
              value={customFriendName}
              onChangeText={setCustomFriendName}
              onSubmitEditing={handleAddCustomFriend}
            />
            <Button
              title="Add"
              variant="primary"
              size="md"
              onPress={handleAddCustomFriend}
              accessibilityLabel="Add custom companion"
            />
          </View>

          <FlatList
            data={contactsList}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const isSelected = (draft.friends || []).some((f) => f.id === item.id);
              return (
                <TouchableOpacity
                  style={[styles.contactItem, isSelected && styles.contactItemSelected]}
                  onPress={() => toggleDraftFriend(item)}
                  activeOpacity={0.75}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${item.name}, ${isSelected ? 'Selected' : 'Not selected'}`}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phone || 'Cinephile Squad'}</Text>
                  </View>
                  <View style={[styles.contactCheck, isSelected && styles.contactCheckActive]}>
                    {isSelected && <Check size={14} color="#07090E" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={styles.modalFooter}>
            <Button
              title="Done Selecting"
              variant="primary"
              size="lg"
              onPress={() => setContactsModalVisible(false)}
              accessibilityLabel="Confirm squad selections"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modeTabsWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
  },
  modeTabText: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  modeTabTextActive: {
    color: '#07090E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  progressWrap: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressStep: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressDotText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  progressLabelDone: {
    color: colors.primary,
    fontWeight: '600',
  },
  progressSummary: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  plansHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  planCardWrapper: {
    marginBottom: SPACING.md,
  },
  planActionsRow: {
    paddingHorizontal: SPACING.lg,
    alignItems: 'flex-end',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  stepCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    marginRight: SPACING.sm,
  },
  stepBadgeText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },
  stepHeaderTitles: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  selectedMovieCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  selectedPoster: {
    width: 75,
    height: 110,
    borderRadius: RADIUS.xs,
    backgroundColor: colors.backgroundSecondary,
  },
  selectedMovieInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  selectedMovieTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  selectedMovieMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  selectedMovieMeta: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyMoviePicker: {
    minHeight: 96,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: 4,
  },
  emptyMoviePickerTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  emptyMoviePickerSub: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  subStepLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: SPACING.sm,
  },
  cinemasLabel: {
    marginTop: SPACING.md,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dateChip: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  dateChipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  dateChipText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  dateChipTextSelected: {
    color: colors.primary,
  },
  noDataText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  providerBadgeRow: {
    marginTop: SPACING.md,
  },
  unavailableCard: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: SPACING.sm,
  },
  unavailableTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  unavailableText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  demoNote: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  cinemasList: {
    gap: SPACING.sm,
  },
  cinemaOption: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 56,
  },
  cinemaOptionSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  cinemaLeft: {
    flex: 1,
  },
  cinemaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cinemaName: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  cinemaNameSelected: {
    color: colors.primary,
  },
  selectedCheckIcon: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cinemaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: SPACING.sm,
  },
  cinemaDistance: {
    ...TYPOGRAPHY.captionBold,
    color: colors.primary,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlotCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 60,
    justifyContent: 'center',
  },
  timeSlotCardSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  timeSlotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotTime: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  timeSlotTimeSelected: {
    color: colors.primary,
  },
  timeSlotLabel: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timeSlotLabelSelected: {
    color: colors.text,
  },
  snacksWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  squadSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  addSquadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 38,
    paddingHorizontal: SPACING.xs,
  },
  addSquadBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },
  selectedFriendsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  friendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  friendTagName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: colors.text,
  },
  emptySquadPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: SPACING.sm,
    minHeight: 46,
  },
  emptySquadText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  finalCtaWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  ctaNote: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
  },
  modalList: {
    padding: SPACING.lg,
  },
  modalMovieItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalMoviePoster: {
    width: 55,
    height: 80,
    borderRadius: RADIUS.xs,
    backgroundColor: colors.surface,
  },
  modalMovieInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  modalMovieTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
    marginBottom: 4,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  modalRating: {
    ...TYPOGRAPHY.captionBold,
    color: '#E5A93C',
  },
  modalStatusText: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    color: colors.primary,
    letterSpacing: 0.5,
    marginLeft: 'auto',
  },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAddRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 44,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 54,
  },
  contactItemSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarText: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.primary,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactName: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  contactPhone: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  contactCheck: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
});

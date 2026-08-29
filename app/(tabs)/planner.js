import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { FALLBACK_MOVIES, getImageUri } from '../../services/tmdb';
import { cinemaService } from '../../services/cinema';
import { SAMPLE_CINEMAS } from '../../services/location';
import { getDeviceContacts, PRESET_SQUAD } from '../../services/contacts';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';


const TIME_SLOTS = [
  { time: '11:00 AM', label: 'Morning Matinee', badge: 'Save 20%' },
  { time: '03:30 PM', label: 'Afternoon Show', badge: 'Popular' },
  { time: '07:30 PM', label: 'Prime Evening', badge: 'Recommended' },
  { time: '10:45 PM', label: 'Late Night Owl', badge: 'Atmospheric' },
];

const SNACK_OPTIONS = [
  'Giant Caramel Popcorn',
  'Loaded Cheese Nachos',
  'Cold Brew Coffee',
  'Cherry ICEE',
  'Gourmet Hot Dog',
  'Dark Chocolate Bites',
];

const SEAT_OPTIONS = [
  'Row F (Center Prime)',
  'Row E (Front-Center)',
  'Row G (Back Royal)',
  'VIP Recliner Row D',
  'General Admission',
];

export default function PlannerScreen() {
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
    setDraftNotes,
    toggleDraftFriend,
    addDraftFriend,
    removeDraftFriend,
    addPlan,
    resetDraft,
    deletePlan,
  } = usePlannerStore();

  useEffect(() => {
    loadContacts();
    if (isAuthenticated) {
      fetchPlans();
    }
  }, [isAuthenticated]);

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

  const handleSelectTime = (slot) => {
    setDraftDateTime(draft.date || 'Today', slot.time, slot.label);
  };

  const handleSelectSeat = (seat) => {
    setDraftNotes({ seats: seat });
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
      Alert.alert('Select a Movie', 'Please pick a movie to plan your trip in Step 1.');
      return;
    }

    setIsSaving(true);
    try {
      const newPlan = await addPlan({
        movie: draft.movie,
        cinema: draft.cinema || SAMPLE_CINEMAS[0],
        date: draft.date || 'Tonight',
        time: draft.time || '07:30 PM',
        slotName: draft.slotName || 'Prime Evening',
        friends: draft.friends || [],
        notes: draft.notes || '',
        seats: draft.seats || 'Row F (Center Prime)',
        bookingRef: draft.bookingRef || `CIN-${Math.floor(10000 + Math.random() * 90000)}`,
        snacks: draft.snacks || [],
      });

      setIsSaving(false);
      Alert.alert(
        'Movie Night Locked In! 🎬',
        `Your trip for "${draft.movie.title}" is confirmed.`,
        [
          {
            text: 'View Pass',
            onPress: () => router.push(`/ticket/${newPlan._id || newPlan.id}`),
          },
          {
            text: 'View Schedule',
            onPress: () => setActiveTab('plans'),
          },
        ]
      );
    } catch (err) {
      setIsSaving(false);
      Alert.alert('Error', err.message || 'Failed to save trip plan.');
    }
  };

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
              size={18}
              color={activeTab === 'builder' ? '#07090E' : COLORS.textSecondary}
              strokeWidth={2}
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
              size={18}
              color={activeTab === 'plans' ? '#07090E' : COLORS.textSecondary}
              strokeWidth={2}
            />
            <Text style={[styles.modeTabText, activeTab === 'plans' && styles.modeTabTextActive]}>
              My Schedule ({plans.length})
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
                      Alert.alert('Cancel Trip', 'Are you sure you want to remove this trip plan?', [
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
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ═════════ STEP 1: CHOOSE MOVIE ═════════ */}
            <View style={styles.stepCard}>
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
                      <Clock size={16} color={COLORS.textSecondary} strokeWidth={2} />
                      <Text style={styles.selectedMovieMeta}>
                        {draft.movie.runtime || 165} min
                      </Text>
                      <Star size={16} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} style={{ marginLeft: 8 }} />
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
                  <Film size={24} color={COLORS.primary} strokeWidth={2} />
                  <Text style={styles.emptyMoviePickerTitle}>Select Movie from Catalog</Text>
                  <Text style={styles.emptyMoviePickerSub}>Browse Now Playing, IMAX & Trending films</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ═════════ STEP 2: CINEMA & SHOWTIME (CONSOLIDATED) ═════════ */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={styles.stepHeaderTitles}>
                  <Text style={styles.stepTitle}>Cinema & Showtime</Text>
                  <Text style={styles.stepSubtitle}>Pick theater format and convenient time slot</Text>
                </View>
              </View>

              {/* Cinema Selection */}
              <Text style={styles.subStepLabel}>SELECT THEATER & AUDITORIUM</Text>
              <View style={styles.cinemasList}>
                {SAMPLE_CINEMAS.map((cinema) => {
                  const isSelected = draft.cinema?.id === cinema.id || (!draft.cinema && cinema.id === '1');
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
                              <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                        <View style={styles.cinemaBadgeRow}>
                          <FormatBadge format={cinema.screenType} size="small" />
                          <Text style={styles.cinemaDistance}>{cinema.distance || '2.4 km away'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Showtimes */}
              <Text style={[styles.subStepLabel, { marginTop: SPACING.md }]}>AVAILABLE SHOWTIMES</Text>
              <View style={styles.timeSlotsGrid}>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = draft.time === slot.time || (!draft.time && slot.time === '07:30 PM');
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[styles.timeSlotCard, isSelected && styles.timeSlotCardSelected]}
                      onPress={() => handleSelectTime(slot)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${slot.time}, ${slot.label}`}
                    >
                      <View style={styles.timeSlotTop}>
                        <Text style={[styles.timeSlotTime, isSelected && styles.timeSlotTimeSelected]}>
                          {slot.time}
                        </Text>
                        {isSelected && <Check size={16} color={COLORS.primary} strokeWidth={2.5} />}
                      </View>
                      <Text style={[styles.timeSlotLabel, isSelected && styles.timeSlotLabelSelected]}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ═════════ STEP 3: SEATS, SNACKS & SQUAD ═════════ */}
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <View style={styles.stepHeaderTitles}>
                  <Text style={styles.stepTitle}>Seats, Concessions & Squad</Text>
                  <Text style={styles.stepSubtitle}>Customize seats, invite friends and add snacks</Text>
                </View>
              </View>

              {/* Real Interactive Seat Selection */}
              <Text style={styles.subStepLabel}>AUDITORIUM SEAT SELECTION</Text>
              <InteractiveSeatMap
                selectedSeats={draft.seats ? draft.seats.split(', ').filter(Boolean) : ['F4', 'F5']}
                onSeatsChange={(newSeats) => {
                  setDraftNotes({ seats: newSeats.join(', ') });
                }}
                maxSeats={6}
                ticketPrice={350}
              />


              {/* Snacks Concession Selector */}
              <Text style={[styles.subStepLabel, { marginTop: SPACING.md }]}>THEATER REFRESHMENTS</Text>
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
                  <Plus size={16} color={COLORS.primary} strokeWidth={2} />
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
                        <X size={16} color={COLORS.textMuted} strokeWidth={2} />
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
                  <Users size={20} color={COLORS.textSecondary} strokeWidth={2} />
                  <Text style={styles.emptySquadText}>Tap to invite friends from your address book</Text>
                </TouchableOpacity>
              )}

              {/* Trip Notes */}
              <Text style={[styles.subStepLabel, { marginTop: SPACING.md }]}>NOTES & PARKING (OPTIONAL)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g., Meet at theater lobby 15 min before trailers..."
                placeholderTextColor={COLORS.textMuted}
                value={draft.notes || ''}
                onChangeText={(text) => setDraftNotes({ notes: text })}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* DOMINANT FINAL CTA */}
            <View style={styles.finalCtaWrapper}>
              <Button
                title={isSaving ? 'Locking In Movie Night...' : 'Lock In Movie Night 🎬'}
                variant="primary"
                size="lg"
                loading={isSaving}
                onPress={handleSavePlan}
                accessibilityLabel="Lock in movie night and generate digital pass"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* ═════════ MOVIE SELECTION MODAL ═════════ */}
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

          <FlatList
            data={FALLBACK_MOVIES}
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
                    <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
                    <Text style={styles.modalRating}>
                      {item.vote_average ? item.vote_average.toFixed(1) : '8.0'}
                    </Text>
                  </View>
                  <View style={styles.formatRow}>
                    {(item.formats || ['IMAX Laser']).map((fmt, idx) => (
                      <FormatBadge key={idx} format={fmt} size="small" />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* ═════════ SQUAD CONTACTS MODAL ═════════ */}
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
              placeholderTextColor={COLORS.textMuted}
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
                    {isSelected && <Check size={16} color="#07090E" strokeWidth={3} />}
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modeTabsWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs + 2,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
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
  plansHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  stepBadgeText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  stepHeaderTitles: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  stepSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  selectedMovieCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  selectedPoster: {
    width: 80,
    height: 120,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundElevated,
  },
  selectedMovieInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'space-between',
  },
  selectedMovieTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 16,
    color: COLORS.text,
  },
  selectedMovieMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  selectedMovieMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyMoviePicker: {
    minHeight: 110,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0, 240, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  emptyMoviePickerTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  emptyMoviePickerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  subStepLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  cinemasList: {
    gap: SPACING.sm,
  },
  cinemaOption: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 56,
  },
  cinemaOptionSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: COLORS.primary,
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
    color: COLORS.text,
  },
  cinemaNameSelected: {
    color: COLORS.primary,
  },
  selectedCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cinemaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs + 2,
    gap: SPACING.sm,
  },
  cinemaDistance: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '700',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlotCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 64,
    justifyContent: 'center',
  },
  timeSlotCardSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: COLORS.primary,
  },
  timeSlotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSlotTime: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.text,
  },
  timeSlotTimeSelected: {
    color: COLORS.primary,
  },
  timeSlotLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeSlotLabelSelected: {
    color: COLORS.text,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
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
    minHeight: 44,
    paddingHorizontal: SPACING.xs,
  },
  addSquadBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  selectedFriendsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  friendTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: SPACING.sm,
    minHeight: 44,
  },
  friendTagName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  emptySquadPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: SPACING.sm,
    minHeight: 48,
  },
  emptySquadText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  finalCtaWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  modalList: {
    padding: SPACING.lg,
  },
  modalMovieItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalMoviePoster: {
    width: 60,
    height: 90,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
  },
  modalMovieInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  modalMovieTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  modalRating: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  customAddRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  customInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 44,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 56,
  },
  contactItemSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: COLORS.primary,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  contactPhone: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contactCheck: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
});

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Wrench,
  Ticket,
  Plus,
  PlusCircle,
  Check,
  CheckCircle2,
  Trash2,
  Volume2,
  ArrowLeftRight,
  X,
  Star,
  User,
  Utensils,
  MapPin,
  Clock,
  Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import TicketCard from '../../components/TicketCard';
import FormatBadge from '../../components/FormatBadge';
import EmptyState from '../../components/ui/EmptyState';
import { FALLBACK_MOVIES, getImageUri } from '../../services/tmdb';
import { SAMPLE_CINEMAS } from '../../services/location';
import { getDeviceContacts, PRESET_SQUAD } from '../../services/contacts';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const TIME_SLOTS = [
  { time: '11:00', label: 'Morning Matinee', badge: 'Save 20%' },
  { time: '15:30', label: 'Afternoon Show', badge: 'Popular' },
  { time: '19:30', label: 'Prime Evening', badge: 'Recommended' },
  { time: '22:45', label: 'Late Night Owl', badge: 'Atmospheric' },
];

const SNACK_OPTIONS = [
  'Giant Caramel Popcorn',
  'Loaded Cheese Nachos',
  'Cold Brew Coffee',
  'Cherry ICEE',
  'Gourmet Hot Dog',
  'Dark Chocolate Bites',
];

export default function PlannerScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'plans'
  const [movieModalVisible, setMovieModalVisible] = useState(false);
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
    setContactsList(contacts);
  };

  const handleSelectMovie = (movie) => {
    setDraftMovie(movie);
    setMovieModalVisible(false);
  };

  const handleSelectCinema = (cinema) => {
    setDraftCinema(cinema);
  };

  const handleSelectTime = (slot) => {
    setDraftDateTime(draft.date, slot.time, slot.label);
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
      Alert.alert('Select a Movie', 'Please pick a movie to plan your trip.');
      return;
    }
    setIsSaving(true);
    try {
      const newPlan = await addPlan({
        movie: draft.movie,
        cinema: draft.cinema,
        date: draft.date,
        time: draft.time,
        slotName: draft.slotName,
        friends: draft.friends,
        notes: draft.notes,
        seats: draft.seats,
        bookingRef: draft.bookingRef || `CIN-${Math.floor(10000 + Math.random() * 90000)}`,
        snacks: draft.snacks,
      });

      setIsSaving(false);
      Alert.alert(
        'Trip Plan Locked In!',
        `Your movie night for "${draft.movie.title}" has been saved. Ready to view your ticket pass?`,
        [
          {
            text: 'View Ticket',
            onPress: () => router.push(`/ticket/${newPlan._id || newPlan.id}`),
          },
          {
            text: 'Manage Plans',
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

      {/* Mode Switcher Tab */}
      <View style={styles.modeTabsWrapper}>
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'builder' && styles.modeTabActive]}
            onPress={() => setActiveTab('builder')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Switch to Trip Builder"
            accessibilityState={{ selected: activeTab === 'builder' }}
          >
            <Wrench
              size={15}
              color={activeTab === 'builder' ? '#07090E' : COLORS.textSecondary}
              strokeWidth={2}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeTabText, activeTab === 'builder' && styles.modeTabTextActive]}>
              Trip Builder
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'plans' && styles.modeTabActive]}
            onPress={() => setActiveTab('plans')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Switch to active plans. ${plans.length} plans available.`}
            accessibilityState={{ selected: activeTab === 'plans' }}
          >
            <Ticket
              size={15}
              color={activeTab === 'plans' ? '#07090E' : COLORS.textSecondary}
              strokeWidth={2}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.modeTabText, activeTab === 'plans' && styles.modeTabTextActive]}>
              Active Plans ({plans.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'plans' ? (
        /* MY SAVED PLANS LIST */
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.plansHeader}>
            <Text style={styles.sectionTitle}>Your Theatrical Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Manage active bookings and digital passes
            </Text>
          </View>

          {plans.length === 0 ? (
            <EmptyState
              icon="Ticket"
              title="No Active Movie Nights"
              description="Use the Trip Builder to pick a film, cinema, and squad!"
              actionLabel="Create New Plan"
              onAction={() => setActiveTab('builder')}
              actionIcon="Plus"
            />
          ) : (
            plans.map((p) => (
              <View key={p._id || p.id} style={styles.planCardWrapper}>
                <TicketCard plan={p} />
                <TouchableOpacity
                  style={styles.deletePlanBtn}
                  onPress={() => {
                    Alert.alert('Cancel Trip', 'Are you sure you want to remove this trip plan?', [
                      { text: 'Keep' },
                      { text: 'Remove', style: 'destructive', onPress: () => deletePlan(p._id || p.id) },
                    ]);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Cancel trip plan for ${p.movie ? p.movie.title : 'movie'}`}
                >
                  <Trash2 size={13} color={COLORS.danger} strokeWidth={2} />
                  <Text style={styles.deletePlanText}>Cancel Plan</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        /* TRIP BUILDER MULTI-STEP FLOW */
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* STEP 1: CHOOSE MOVIE */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Featured Movie</Text>
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
                    <Clock size={11} color={COLORS.textSecondary} strokeWidth={2} />
                    <Text style={styles.selectedMovieMeta}>
                      {draft.movie.runtime || 165} min
                    </Text>
                    <Star size={11} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} style={{ marginLeft: 6 }} />
                    <Text style={styles.selectedMovieMeta}>
                      {draft.movie.vote_average ? draft.movie.vote_average.toFixed(1) : '8.2'}
                    </Text>
                  </View>
                  <View style={styles.formatRow}>
                    {(draft.movie.formats || ['IMAX Laser', 'Dolby Cinema']).map((f, idx) => (
                      <FormatBadge key={idx} format={f} size="small" />
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.changeMovieBtn}
                    onPress={() => setMovieModalVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Change selected film"
                  >
                    <ArrowLeftRight size={13} color={COLORS.primary} strokeWidth={2} />
                    <Text style={styles.changeMovieText}>Change Film</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.pickMoviePlaceholder}
                onPress={() => setMovieModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Select a movie for trip builder"
              >
                <PlusCircle size={24} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.pickMovieText}>Select a Movie to Experience</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* STEP 2: CHOOSE CINEMA & SCREEN */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Select Cinema & Screen Format</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cinemaScroll}>
              {SAMPLE_CINEMAS.map((c) => {
                const isSelected = draft.cinema && draft.cinema.id === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.cinemaPickCard, isSelected && styles.cinemaPickCardActive]}
                    onPress={() => handleSelectCinema(c)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Select cinema: ${c.name}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.cinemaPickTop}>
                      <FormatBadge format={c.screenType} size="small" />
                      <Text style={styles.cinemaDist}>{c.distanceKm} km</Text>
                    </View>
                    <Text style={styles.cinemaPickName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.cinemaPickAddress} numberOfLines={1}>
                      {c.address}
                    </Text>
                    <View style={styles.soundRow}>
                      <Volume2 size={11} color={COLORS.secondary} strokeWidth={2} />
                      <Text style={styles.cinemaPickSound}>{c.sound}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.selectedCheck}>
                        <CheckCircle2 size={15} color={COLORS.primary} strokeWidth={2.2} />
                        <Text style={styles.selectedCheckText}>Selected Screen</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* STEP 3: SHOWTIME SLOTS */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Showtime Slot</Text>
            </View>

            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = draft.time === slot.time;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    style={[styles.slotItem, isSelected && styles.slotItemActive]}
                    onPress={() => handleSelectTime(slot)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Select showtime slot: ${slot.time} (${slot.label})`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.slotTimeRow}>
                      <Text style={[styles.slotTime, isSelected && styles.slotTimeActive]}>
                        {slot.time}
                      </Text>
                      <View style={styles.slotBadge}>
                        <Text style={styles.slotBadgeText}>{slot.badge}</Text>
                      </View>
                    </View>
                    <Text style={[styles.slotLabel, isSelected && styles.slotLabelActive]}>
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* STEP 4: SQUAD INVITES */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Invite Movie Squad ({draft.friends ? draft.friends.length : 0})</Text>
            </View>

            <Text style={styles.fieldSublabel}>Tap friends to add/remove from this night:</Text>
            <View style={styles.friendsChipsRow}>
              {contactsList.map((friend) => {
                const isInvited = draft.friends && draft.friends.some((f) => f.name === friend.name);
                return (
                  <TouchableOpacity
                    key={friend.id || friend.name}
                    style={[styles.friendChip, isInvited && styles.friendChipActive]}
                    onPress={() => toggleDraftFriend(friend)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Invite friend: ${friend.name}`}
                    accessibilityState={{ selected: isInvited }}
                  >
                    <User size={12} color={isInvited ? '#07090E' : COLORS.primary} strokeWidth={2} style={{ marginRight: 4 }} />
                    <Text style={[styles.friendName, isInvited && styles.friendNameActive]}>
                      {friend.name}
                    </Text>
                    {isInvited && (
                      <Check size={12} color="#07090E" strokeWidth={2.4} style={{ marginLeft: 4 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Friend Name Input */}
            <View style={styles.addFriendRow}>
              <TextInput
                style={styles.addFriendInput}
                placeholder="Add friend by name..."
                placeholderTextColor={COLORS.textMuted}
                value={customFriendName}
                onChangeText={setCustomFriendName}
              />
              <TouchableOpacity
                style={styles.addFriendBtn}
                onPress={handleAddCustomFriend}
                accessibilityRole="button"
                accessibilityLabel="Add friend by name"
              >
                <Plus size={18} color="#07090E" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>

          {/* STEP 5: SEATS, SNACKS & NOTES */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>5</Text>
              </View>
              <Text style={styles.stepTitle}>Seats, Snacks & Notes</Text>
            </View>

            <Text style={styles.inputLabel}>Reserved Seats (e.g. Row F, Seats 14-16)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter seat numbers or prime viewing row"
              placeholderTextColor={COLORS.textMuted}
              value={draft.seats}
              onChangeText={(seats) => setDraftNotes({ seats })}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Cinema Snacks & Refreshments</Text>
            <View style={styles.snacksGrid}>
              {SNACK_OPTIONS.map((snack) => {
                const isSelected = draft.snacks && draft.snacks.includes(snack);
                return (
                  <TouchableOpacity
                    key={snack}
                    style={[styles.snackChip, isSelected && styles.snackChipActive]}
                    onPress={() => handleToggleSnack(snack)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Select snack: ${snack}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Utensils size={11} color={isSelected ? COLORS.secondary : COLORS.textSecondary} strokeWidth={2} style={{ marginRight: 4 }} />
                    <Text style={[styles.snackChipText, isSelected && styles.snackChipTextActive]}>
                      {snack}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Trip Notes & Meetup Details</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="e.g. Meet at the lobby cafe 30 mins early for pre-show discussions"
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={draft.notes}
              onChangeText={(notes) => setDraftNotes({ notes })}
            />
          </View>

          {/* LOCK IN PLAN CTA */}
          <TouchableOpacity
            style={styles.lockInBtn}
            onPress={handleSavePlan}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Lock in movie night plan and generate ticket pass"
          >
            <Ticket size={20} color="#07090E" strokeWidth={2.2} />
            <Text style={styles.lockInBtnText}>Lock In Movie Night & Generate Pass</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* MOVIE SELECTION MODAL */}
      <Modal visible={movieModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Movie to Plan</Text>
              <TouchableOpacity
                onPress={() => setMovieModalVisible(false)}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close movie selector modal"
              >
                <X size={20} color={COLORS.text} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={FALLBACK_MOVIES}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalMovieItem}
                  onPress={() => handleSelectMovie(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Select movie: ${item.title}`}
                >
                  <Image
                    source={{ uri: getImageUri(item.poster_path, 'w185') }}
                    style={styles.modalMoviePoster}
                  />
                  <View style={styles.modalMovieInfo}>
                    <Text style={styles.modalMovieTitle}>{item.title}</Text>
                    <View style={styles.modalMovieMetaRow}>
                      <Text style={styles.modalMovieYear}>
                        {item.release_date ? item.release_date.split('-')[0] : '2026'}
                      </Text>
                      <Star size={11} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} style={{ marginLeft: 6, marginRight: 2 }} />
                      <Text style={styles.modalMovieRating}>
                        {item.vote_average.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.formatRow}>
                      {(item.formats || ['IMAX Laser']).slice(0, 2).map((f, i) => (
                        <FormatBadge key={i} format={f} size="small" />
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  modeTabsWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: '#07090E',
  },

  // Steps
  stepCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.subtle,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#07090E',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Selected Movie
  selectedMovieCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 10,
  },
  selectedPoster: {
    width: 70,
    height: 105,
    borderRadius: RADIUS.sm,
  },
  selectedMovieInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  selectedMovieTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedMovieMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedMovieMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 3,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  changeMovieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: RADIUS.xs,
    alignSelf: 'flex-start',
    gap: 4,
  },
  changeMovieText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pickMoviePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 24,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderStyle: 'dashed',
    gap: 8,
  },
  pickMovieText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Cinema selection
  cinemaScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  cinemaPickCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  cinemaPickCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  cinemaPickTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cinemaDist: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cinemaPickName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cinemaPickAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  cinemaPickSound: {
    fontSize: 11,
    color: COLORS.secondary,
  },
  selectedCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 5,
  },
  selectedCheckText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Slots
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  slotItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  slotTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  slotTimeActive: {
    color: COLORS.primary,
  },
  slotBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  slotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  slotLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  slotLabelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },

  // Squad
  fieldSublabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  friendsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  friendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  friendChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  friendNameActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  addFriendRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  addFriendInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: 8,
  },
  addFriendBtn: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  snacksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  snackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  snackChipActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: COLORS.secondary,
  },
  snackChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  snackChipTextActive: {
    color: COLORS.secondary,
    fontWeight: '800',
  },

  // Lock In CTA
  lockInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: 15,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.glowCyan,
  },
  lockInBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#07090E',
    letterSpacing: 0.4,
  },

  // Plans List
  plansHeader: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  planCardWrapper: {
    marginBottom: SPACING.sm,
  },
  deletePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: 5,
  },
  deletePlanText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMovieItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 8,
    marginBottom: 10,
  },
  modalMoviePoster: {
    width: 50,
    height: 75,
    borderRadius: RADIUS.xs,
  },
  modalMovieInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  modalMovieTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalMovieMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  modalMovieYear: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalMovieRating: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Pencil,
  Ticket,
  Camera,
  Bookmark,
  Bell,
  Calendar,
  LogOut,
  LogIn,
  Palette,
  Moon,
  Sun,
  Shield,
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import Chip from '../../components/ui/Chip';
import { FALLBACK_GENRES } from '../../services/tmdb';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const FORMAT_OPTIONS = [
  'IMAX 70mm & Laser',
  'Dolby Cinema',
  '4DX Immersive',
  'ScreenX 270°',
  'PVR Director\'s Cut',
];

const CHAIN_OPTIONS = [
  'PVR INOX',
  'IMAX Laser Network',
  'AMC Theatres',
  'Cinepolis VIP',
  'Regal Cinemas',
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const {
    userName,
    userHandle,
    city,
    preferredChain,
    preferredFormat,
    favoriteGenres,
    notificationsEnabled,
    autoExportCalendar,
    updateProfile,
    toggleGenre,
  } = usePreferencesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName || '');
  const [editCity, setEditCity] = useState(city || '');

  const plans = usePlannerStore((s) => s.plans);
  const memories = useMemoryStore((s) => s.memories);
  const watchlist = useWatchlistStore((s) => s.watchlist);

  const plansCount = plans.length;
  const watchlistCount = watchlist.length;
  const memoriesCount = memories.length;

  const imaxCount = memories.filter((m) => (m.experienceType || '').includes('IMAX')).length;
  const dolbyCount = memories.filter((m) => (m.experienceType || '').includes('Dolby')).length;
  const uniqueTheaters = new Set(memories.map((m) => m.cinemaName).filter(Boolean)).size;
  const avgRating = memories.length > 0
    ? (memories.reduce((acc, m) => acc + (m.rating || 5), 0) / memories.length).toFixed(1)
    : '5.0';

  const handleSaveProfile = () => {
    updateProfile({ userName: editName.trim() || 'Cinephile', city: editCity.trim() || 'Mumbai' });
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your cinephile preferences have been saved.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of CineTrip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* PROFILE IDENTITY CARD */}
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <User size={28} color={COLORS.primary} strokeWidth={2} />
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your Name"
                  placeholderTextColor={COLORS.textMuted}
                />
                <TextInput
                  style={styles.editInput}
                  value={editCity}
                  onChangeText={setEditCity}
                  placeholder="Home City"
                  placeholderTextColor={COLORS.textMuted}
                />
                <View style={styles.editButtonsRow}>
                  <Button
                    title="Cancel"
                    variant="surface"
                    size="sm"
                    onPress={() => setIsEditing(false)}
                    accessibilityLabel="Cancel editing"
                  />
                  <Button
                    title="Save Changes"
                    variant="primary"
                    size="sm"
                    onPress={handleSaveProfile}
                    accessibilityLabel="Save profile changes"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>{userName || 'Cinephile Enthusiast'}</Text>
                <Text style={styles.userHandle}>
                  {userHandle ? `${userHandle} • ` : ''}{city || 'Mumbai Metro'}
                </Text>

                <View style={styles.editTriggerRow}>
                  <Button
                    title="Edit Profile"
                    icon="Pencil"
                    variant="surface"
                    size="sm"
                    onPress={() => {
                      setEditName(userName || '');
                      setEditCity(city || '');
                      setIsEditing(true);
                    }}
                    accessibilityLabel="Edit profile details"
                  />
                </View>
              </View>
            )}
          </View>

          {/* CINEPHILE ACTIVITY METRICS */}
          <View style={styles.statsCard}>
            <TouchableOpacity
              style={styles.statBox}
              onPress={() => router.push('/(tabs)/planner')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${plansCount} planned movie nights`}
            >
              <Ticket size={18} color={COLORS.primary} strokeWidth={2.2} />
              <Text style={styles.statNum}>{plansCount}</Text>
              <Text style={styles.statTxt}>Passes</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statBox}
              onPress={() => router.push('/(tabs)/watchlist')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${watchlistCount} movies in watchlist`}
            >
              <Bookmark size={18} color="#E5A93C" strokeWidth={2.2} />
              <Text style={styles.statNum}>{watchlistCount}</Text>
              <Text style={styles.statTxt}>Watchlist</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            <TouchableOpacity
              style={styles.statBox}
              onPress={() => router.push('/(tabs)/memories')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${memoriesCount} memories in journal`}
            >
              <Camera size={18} color={COLORS.accentGreen} strokeWidth={2.2} />
              <Text style={styles.statNum}>{memoriesCount}</Text>
              <Text style={styles.statTxt}>Memories</Text>
            </TouchableOpacity>
          </View>

          {/* CINEPHILE PASSPORT & MILESTONES */}
          <View style={styles.sectionCard}>
            <View style={styles.passportHeader}>
              <Text style={styles.sectionTitle}>THEATRICAL MILESTONES</Text>
              <Text style={styles.passportBadge}>PASSPORT</Text>
            </View>

            <View style={styles.milestonesGrid}>
              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneVal}>{imaxCount}</Text>
                <Text style={styles.milestoneLbl}>IMAX Screenings</Text>
              </View>
              <View style={styles.milestoneDivider} />

              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneVal}>{dolbyCount}</Text>
                <Text style={styles.milestoneLbl}>Dolby Experiences</Text>
              </View>
              <View style={styles.milestoneDivider} />

              <View style={styles.milestoneItem}>
                <Text style={styles.milestoneVal}>{uniqueTheaters}</Text>
                <Text style={styles.milestoneLbl}>Theaters Visited</Text>
              </View>
              <View style={styles.milestoneDivider} />

              <View style={styles.milestoneItem}>
                <Text style={[styles.milestoneVal, { color: COLORS.primary }]}>{avgRating} ★</Text>
                <Text style={styles.milestoneLbl}>Avg Rating</Text>
              </View>
            </View>
          </View>

          {/* PREFERRED FORMATS */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>PREFERRED FORMAT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {FORMAT_OPTIONS.map((fmt) => (
                <Chip
                  key={fmt}
                  label={fmt}
                  selected={preferredFormat === fmt}
                  onPress={() => updateProfile({ preferredFormat: fmt })}
                  accessibilityLabel={`Preferred format ${fmt}`}
                />
              ))}
            </ScrollView>
          </View>

          {/* PREFERRED THEATER CHAIN */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>FAVORITE THEATER CHAIN</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
              {CHAIN_OPTIONS.map((chain) => (
                <Chip
                  key={chain}
                  label={chain}
                  selected={preferredChain === chain}
                  onPress={() => updateProfile({ preferredChain: chain })}
                  accessibilityLabel={`Preferred theater chain ${chain}`}
                />
              ))}
            </ScrollView>
          </View>

          {/* FAVORITE GENRES */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>FAVORITE GENRES</Text>
            <View style={styles.chipsWrap}>
              {FALLBACK_GENRES.map((genre) => {
                const isSelected = favoriteGenres.includes(genre.id);
                return (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    selected={isSelected}
                    onPress={() => toggleGenre(genre.id)}
                    accessibilityLabel={`Toggle genre ${genre.name}`}
                  />
                );
              })}
            </View>
          </View>

          {/* APP PREFERENCES */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>APP PREFERENCES</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingSub}>Opening night drops & showtime reminders</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => updateProfile({ notificationsEnabled: val })}
                trackColor={{ false: COLORS.surface, true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingLabel}>Calendar Sync</Text>
                <Text style={styles.settingSub}>Auto-add booked movie nights to system calendar</Text>
              </View>
              <Switch
                value={autoExportCalendar}
                onValueChange={(val) => updateProfile({ autoExportCalendar: val })}
                trackColor={{ false: COLORS.surface, true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* ACCOUNT & SIGN OUT */}
          <View style={styles.accountSection}>
            {isAuthenticated ? (
              <Button
                title="Sign Out of CineTrip"
                icon="LogOut"
                variant="danger"
                size="lg"
                onPress={handleLogout}
                accessibilityLabel="Sign out of account"
              />
            ) : (
              <Button
                title="Sign In / Create Account"
                icon="LogIn"
                variant="primary"
                size="lg"
                onPress={() => router.push('/(auth)/login')}
                accessibilityLabel="Sign in to your account"
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  userHandle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  editTriggerRow: {
    marginTop: SPACING.xs,
  },
  editForm: {
    width: '100%',
    gap: SPACING.sm,
  },
  editInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    minHeight: 44,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  editButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 70,
    minHeight: 44,
    justifyContent: 'center',
  },
  statNum: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: 2,
  },
  statTxt: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.cardBorder,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionTitle: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  passportBadge: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  milestonesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneVal: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.text,
  },
  milestoneLbl: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  milestoneDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.cardBorder,
  },
  horizontalChips: {
    flexDirection: 'row',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 48,
  },
  settingTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  settingSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  accountSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
});
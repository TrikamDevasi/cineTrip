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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import FormatBadge from '../../components/FormatBadge';
import { FALLBACK_GENRES } from '../../services/tmdb';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

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
    themeMode,
    setThemeMode,
    updateProfile,
    toggleGenre,
  } = usePreferencesStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editCity, setEditCity] = useState(city);

  const plansCount = usePlannerStore((s) => s.plans.length);
  const watchlistCount = useWatchlistStore((s) => s.watchlist.length);
  const memoriesCount = useMemoryStore((s) => s.memories.length);

  const handleSaveProfile = () => {
    updateProfile({ userName: editName, city: editCity });
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
      <Header showSearch={false} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User size={32} color={COLORS.primary} strokeWidth={2} />
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
              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleSaveProfile}
                accessibilityRole="button"
                accessibilityLabel="Save profile changes"
              >
                <Text style={styles.saveEditText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName || 'Cinephile User'}</Text>
              <Text style={styles.userHandle}>
                {userHandle ? `${userHandle} • ` : ''}{city || 'Mumbai Metro'}
              </Text>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => {
                  setEditName(userName);
                  setEditCity(city);
                  setIsEditing(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Edit profile information"
              >
                <Pencil size={13} color={COLORS.primary} strokeWidth={2} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Dashboard */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/(tabs)/planner')}
            accessibilityRole="button"
            accessibilityLabel={`${plansCount} active movie plans`}
          >
            <Ticket size={20} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.statNumber}>{plansCount}</Text>
            <Text style={styles.statTitle}>Active Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/(tabs)/memories')}
            accessibilityRole="button"
            accessibilityLabel={`${memoriesCount} logged movie memories`}
          >
            <Camera size={20} color={COLORS.accentPink} strokeWidth={2} />
            <Text style={styles.statNumber}>{memoriesCount}</Text>
            <Text style={styles.statTitle}>Memories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            onPress={() => router.push('/(tabs)/watchlist')}
            accessibilityRole="button"
            accessibilityLabel={`${watchlistCount} saved watchlist movies`}
          >
            <Bookmark size={20} color={COLORS.secondary} strokeWidth={2} />
            <Text style={styles.statNumber}>{watchlistCount}</Text>
            <Text style={styles.statTitle}>Watchlist</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Cinema Format Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Preferred Cinema Format</Text>
          <Text style={styles.sectionSubtitle}>Select your go-to auditorium experience</Text>
          <View style={styles.optionsWrap}>
            {FORMAT_OPTIONS.map((fmt) => {
              const isSelected = preferredFormat === fmt;
              return (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => updateProfile({ preferredFormat: fmt })}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Preferred format: ${fmt}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Cinema Chain Preference */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Favorite Cinema Chain</Text>
          <Text style={styles.sectionSubtitle}>Primary theater network for booking</Text>
          <View style={styles.optionsWrap}>
            {CHAIN_OPTIONS.map((chain) => {
              const isSelected = preferredChain === chain;
              return (
                <TouchableOpacity
                  key={chain}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => updateProfile({ preferredChain: chain })}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Favorite chain: ${chain}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {chain}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Favorite Genres */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Favorite Genres</Text>
          <Text style={styles.sectionSubtitle}>Customizes movie recommendations</Text>
          <View style={styles.optionsWrap}>
            {FALLBACK_GENRES.map((g) => {
              const isSelected = favoriteGenres.includes(g.name);
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.optionChip, isSelected && styles.optionChipActive]}
                  onPress={() => toggleGenre(g.name)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle favorite genre: ${g.name}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: App Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>App Settings</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <View style={styles.settingLabelRow}>
                <Bell size={15} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.switchTitle}>Movie Night Reminders</Text>
              </View>
              <Text style={styles.switchDesc}>Get alerted 2 hours before showtime</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(val) => updateProfile({ notificationsEnabled: val })}
              trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={styles.switchTexts}>
              <View style={styles.settingLabelRow}>
                <Calendar size={15} color={COLORS.secondary} strokeWidth={2} style={{ marginRight: 6 }} />
                <Text style={styles.switchTitle}>Sync to Device Calendar</Text>
              </View>
              <Text style={styles.switchDesc}>Automatically export planned tickets</Text>
            </View>
            <Switch
              value={autoExportCalendar}
              onValueChange={(val) => updateProfile({ autoExportCalendar: val })}
              trackColor={{ false: COLORS.surface, true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Appearance */}
        <View style={styles.sectionCard}>
          <View style={styles.settingLabelRow}>
            <Palette size={16} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 6 }} />
            <Text style={styles.sectionHeader}>Theme Appearance</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Choose your preferred visual theme</Text>
          <View style={styles.optionsWrap}>
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System Default', icon: Shield },
            ].map((theme) => {
              const isSelected = themeMode === theme.id;
              const IconComp = theme.icon;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeChip, isSelected && styles.themeChipActive]}
                  onPress={() => setThemeMode(theme.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Theme: ${theme.label}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <IconComp
                    size={14}
                    color={isSelected ? '#07090E' : COLORS.textSecondary}
                    strokeWidth={2}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Account Actions */}
        {isAuthenticated ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Sign out of account"
          >
            <LogOut size={18} color={COLORS.danger} strokeWidth={2} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginPromptBtn}
            onPress={() => router.push('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Sign in to sync your data"
          >
            <LogIn size={18} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.loginPromptText}>Sign In to Sync Your Data</Text>
          </TouchableOpacity>
        )}

        {/* Version info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>CineTrip Mobile • Version 1.0.0 (Build 54)</Text>
          <Text style={styles.footerSubText}>Designed for Film Lovers & Theatrical Connoisseurs</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 10,
    ...SHADOWS.glowCyan,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userHandle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    marginTop: 10,
    gap: 6,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  editForm: {
    width: '100%',
    marginTop: 6,
  },
  editInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  saveEditBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  saveEditText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07090E',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  statBox: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  statTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Sections
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  optionChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optionChipTextActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  themeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Switches
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  switchTexts: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  footerInfo: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  footerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  loginPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryMuted,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  loginPromptText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

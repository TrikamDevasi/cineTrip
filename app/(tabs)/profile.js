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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  'PVR Director’s Cut',
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
    userAvatar,
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
            <Text style={styles.avatarEmoji}>{userAvatar || '🍿'}</Text>
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
              <TouchableOpacity style={styles.saveEditBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveEditText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userHandle}>{userHandle} • {city}</Text>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => {
                  setEditName(userName);
                  setEditCity(city);
                  setIsEditing(true);
                }}
              >
                <Ionicons name="create-outline" size={13} color={COLORS.primary} />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats Dashboard */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="ticket-confirmation" size={20} color={COLORS.primary} />
            <Text style={styles.statNumber}>{plansCount}</Text>
            <Text style={styles.statTitle}>Active Plans</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="camera" size={20} color={COLORS.accentPink} />
            <Text style={styles.statNumber}>{memoriesCount}</Text>
            <Text style={styles.statTitle}>Memories</Text>
          </View>

          <View style={styles.statBox}>
            <Ionicons name="bookmark" size={20} color={COLORS.secondary} />
            <Text style={styles.statNumber}>{watchlistCount}</Text>
            <Text style={styles.statTitle}>Watchlist</Text>
          </View>
        </View>

        {/* Theatrical Format Preference */}
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
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {fmt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferred Cinema Chain */}
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
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {chain}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Favorite Genres */}
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
                >
                  <Text style={[styles.optionChipText, isSelected && styles.optionChipTextActive]}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences Toggles */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>App Settings</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTexts}>
              <Text style={styles.switchTitle}>Movie Night Reminders</Text>
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
              <Text style={styles.switchTitle}>Sync to Device Calendar</Text>
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

        {/* Logout */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.loginPromptBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="log-in-outline" size={18} color={COLORS.primary} />
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
  avatarEmoji: {
    fontSize: 32,
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
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    marginTop: 10,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  editForm: {
    width: '100%',
    marginTop: 6,
  },
  editInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  saveEditBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
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
    backgroundColor: 'rgba(239,68,68,0.08)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
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

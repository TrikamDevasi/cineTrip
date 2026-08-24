import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Film, MapPin, Search, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function Header({ showSearch = true, onSearchPress }) {
  const router = useRouter();
  const city = usePreferencesStore((s) => s.city);
  const userName = usePreferencesStore((s) => s.userName);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <Film size={20} color={COLORS.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.brandText}>
            CINE<Text style={styles.brandAccent}>TRIP</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => router.push('/map')}
          accessibilityRole="button"
          accessibilityLabel={`Current location: ${city || 'Select city'}. Tap to view cinema map.`}
          activeOpacity={0.7}
        >
          <MapPin size={13} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {city || 'Mumbai Metro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress || (() => router.push('/(tabs)/discover'))}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Search movies and cinemas"
          >
            <Search size={18} color={COLORS.text} strokeWidth={2} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={userName ? `Profile for ${userName}` : 'View profile and settings'}
        >
          <User size={18} color={COLORS.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  left: {
    flexDirection: 'column',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    marginLeft: 8,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Film, MapPin, Search, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from './ui/IconButton';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export default function Header({ showSearch = true, onSearchPress }) {
  const router = useRouter();
  const city = usePreferencesStore((s) => s.city);
  const userName = usePreferencesStore((s) => s.userName);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrapper}>
            <Film size={18} color={COLORS.primary} strokeWidth={2} />
          </View>
          <Text style={styles.brandText}>
            Cine<Text style={styles.brandAccent}>Trip</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => router.push('/map')}
          accessibilityRole="button"
          accessibilityLabel={`Current location: ${city || 'Select city'}. Tap to view cinema map.`}
          activeOpacity={0.7}
        >
          <MapPin size={14} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {city || 'Mumbai Metro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.right}>
        {showSearch && (
          <IconButton
            icon="Search"
            variant="surface"
            size={20}
            onPress={onSearchPress || (() => router.push('/(tabs)/discover'))}
            accessibilityLabel="Search movies and cinemas"
            style={{ marginRight: SPACING.sm }}
          />
        )}

        <IconButton
          icon="User"
          variant="surface"
          size={20}
          color={COLORS.primary}
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityLabel={userName ? `Profile for ${userName}` : 'View profile and settings'}
        />
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
    paddingBottom: SPACING.sm,
    backgroundColor: '#07090E',
  },
  left: {
    flexDirection: 'column',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0, 240, 255, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.35)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  brandText: {
    ...TYPOGRAPHY.h2,
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    minHeight: 24,
    gap: 5,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
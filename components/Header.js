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
            <Film size={16} color={COLORS.primary} strokeWidth={2.2} />
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
          activeOpacity={0.75}
        >
          <MapPin size={12} color={COLORS.primary} strokeWidth={2} />
          <Text style={styles.locationText} numberOfLines={1}>
            {city || 'Local Metro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.right}>
        {showSearch && (
          <IconButton
            icon="Search"
            variant="surface"
            size={18}
            onPress={onSearchPress || (() => router.push('/(tabs)/discover'))}
            accessibilityLabel="Search movies and cinemas"
            style={{ marginRight: SPACING.sm }}
          />
        )}

        <IconButton
          icon="User"
          variant="surface"
          size={18}
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
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  left: {
    flexDirection: 'column',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  brandText: {
    ...TYPOGRAPHY.h1,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
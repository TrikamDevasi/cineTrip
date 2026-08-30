import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MapPin, Search, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from './ui/IconButton';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

const logoImg = require('../assets/images/logo.png');

export default function Header({ showSearch = true, onSearchPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const city = usePreferencesStore((s) => s.city);
  const userName = usePreferencesStore((s) => s.userName);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <TouchableOpacity
          style={styles.brandRow}
          onPress={() => router.push('/landing')}
          activeOpacity={0.8}
          accessibilityLabel="CineTrip Home & Story"
        >
          <View style={styles.brandIconWrapper}>
            <Image source={logoImg} style={styles.brandLogoImg} resizeMode="contain" />
          </View>
          <Text style={styles.brandText}>
            Cine<Text style={styles.brandAccent}>Trip</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => router.push('/map')}
          accessibilityRole="button"
          accessibilityLabel={`Current location: ${city || 'Select city'}. Tap to view cinema map.`}
          activeOpacity={0.75}
        >
          <MapPin size={12} color={colors.primary} strokeWidth={2} />
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
          color={colors.primary}
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityLabel={userName ? `Profile for ${userName}` : 'View profile and settings'}
        />
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: colors.background,
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
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: '#07090E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    overflow: 'hidden',
  },
  brandLogoImg: {
    width: 28,
    height: 28,
  },
  brandText: {
    ...TYPOGRAPHY.h1,
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.3,
  },
  brandAccent: {
    color: colors.primary,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
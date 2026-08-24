import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function Header({ showSearch = true, onSearchPress }) {
  const router = useRouter();
  const city = usePreferencesStore((s) => s.city);
  const userAvatar = usePreferencesStore((s) => s.userAvatar);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="movie-roll" size={24} color={COLORS.primary} />
          <Text style={styles.brandText}>
            CINE<Text style={styles.brandAccent}>TRIP</Text>
          </Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={12} color={COLORS.secondary} />
          <Text style={styles.locationText}>{city || 'Mumbai Metro'}</Text>
        </View>
      </View>

      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress || (() => router.push('/(tabs)/discover'))}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={19} color={COLORS.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.avatarEmoji}>{userAvatar || '🍿'}</Text>
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
  brandText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 3,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  avatarEmoji: {
    fontSize: 18,
  },
});

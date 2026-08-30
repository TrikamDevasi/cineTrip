import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

const SOURCE_META = (colors) => ({
  LIVE: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.14)' },
  CACHED: { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.14)' },
  DEMO: { color: '#A78BFA', bg: 'rgba(139, 92, 246, 0.16)' },
  UNAVAILABLE: { color: colors.textMuted, bg: 'rgba(148, 163, 184, 0.14)' },
});

/**
 * Small pill that tells users exactly where the data on screen came from:
 * LIVE (fresh source), CACHED (previous fetch, offline), DEMO (sample data)
 * or UNAVAILABLE (no connected provider). Never claims data is real when it
 * is not.
 */
export default function DataSourceBadge({ source = 'UNAVAILABLE', label, style }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const meta = SOURCE_META(colors)[source] || SOURCE_META(colors).UNAVAILABLE;
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg, borderColor: meta.color }, style]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.text, { color: meta.color }]}>{label || source}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    letterSpacing: 0.6,
  },
});
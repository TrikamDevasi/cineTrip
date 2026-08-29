import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export default function FormatBadge({ format = 'IMAX Laser', size = 'medium', style }) {
  const isSmall = size === 'small';
  
  let bg = 'rgba(0, 240, 255, 0.1)';
  let text = COLORS.primary;
  let border = 'rgba(0, 240, 255, 0.25)';

  const fLower = (format || '').toLowerCase();
  if (fLower.includes('imax')) {
    bg = 'rgba(0, 114, 206, 0.15)';
    text = '#38BDF8';
    border = 'rgba(56, 189, 248, 0.35)';
  } else if (fLower.includes('dolby')) {
    bg = 'rgba(255, 19, 82, 0.14)';
    text = '#FB7185';
    border = 'rgba(251, 113, 133, 0.35)';
  } else if (fLower.includes('4dx')) {
    bg = 'rgba(16, 185, 129, 0.14)';
    text = '#34D399';
    border = 'rgba(52, 211, 153, 0.35)';
  } else if (fLower.includes('3d') || fLower.includes('laser')) {
    bg = 'rgba(139, 92, 246, 0.15)';
    text = '#A78BFA';
    border = 'rgba(167, 139, 250, 0.35)';
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
        isSmall && styles.badgeSmall,
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Format: ${format}`}
    >
      <Text style={[styles.text, { color: text }]} numberOfLines={1}>
        {format}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: SPACING.xs + 2,
    marginBottom: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
  },
});

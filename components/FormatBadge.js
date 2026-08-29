import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export default function FormatBadge({ format = 'IMAX Laser', size = 'medium', style }) {
  const isSmall = size === 'small';
  
  let bg = 'rgba(229, 169, 60, 0.12)';
  let text = '#FBBF24';
  let border = 'rgba(251, 191, 36, 0.3)';

  const fLower = (format || '').toLowerCase();
  if (fLower.includes('imax')) {
    bg = 'rgba(124, 58, 237, 0.16)';
    text = '#C4B5FD';
    border = 'rgba(196, 181, 253, 0.35)';
  } else if (fLower.includes('dolby')) {
    bg = 'rgba(225, 29, 72, 0.16)';
    text = '#FDA4AF';
    border = 'rgba(253, 164, 175, 0.35)';
  } else if (fLower.includes('4dx')) {
    bg = 'rgba(5, 150, 105, 0.16)';
    text = '#6EE7B7';
    border = 'rgba(110, 231, 183, 0.35)';
  } else if (fLower.includes('screenx') || fLower.includes('270')) {
    bg = 'rgba(2, 132, 199, 0.16)';
    text = '#7DD3FC';
    border = 'rgba(125, 211, 252, 0.35)';
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: 6,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  text: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    letterSpacing: 0.6,
  },
});

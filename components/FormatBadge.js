import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function FormatBadge({ format = 'IMAX Laser', size = 'medium' }) {
  const isSmall = size === 'small';
  
  let bg = COLORS.primaryMuted;
  let text = COLORS.primary;
  let border = 'rgba(0, 240, 255, 0.3)';

  const fLower = format.toLowerCase();
  if (fLower.includes('imax')) {
    bg = 'rgba(0, 114, 206, 0.2)';
    text = '#38BDF8';
    border = 'rgba(56, 189, 248, 0.4)';
  } else if (fLower.includes('dolby')) {
    bg = 'rgba(255, 19, 82, 0.18)';
    text = '#FB7185';
    border = 'rgba(251, 113, 133, 0.4)';
  } else if (fLower.includes('4dx')) {
    bg = 'rgba(16, 185, 129, 0.18)';
    text = '#34D399';
    border = 'rgba(52, 211, 153, 0.4)';
  } else if (fLower.includes('3d') || fLower.includes('laser')) {
    bg = 'rgba(139, 92, 246, 0.2)';
    text = '#A78BFA';
    border = 'rgba(167, 139, 250, 0.4)';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, isSmall && styles.badgeSmall]}>
      <Text style={[styles.text, { color: text }, isSmall && styles.textSmall]} numberOfLines={1}>
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
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 9,
  },
});

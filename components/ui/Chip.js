import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

/**
 * Standardized Chip Component for filters, categories and tags
 */
export default function Chip({
  label,
  selected = false,
  onPress,
  icon,
  badge,
  style,
  textStyle,
  accessibilityLabel,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chipContainer,
        selected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel || label}
    >
      <View style={styles.contentRow}>
        {selected ? (
          <View style={styles.iconWrapper}>
            <Check size={14} color={COLORS.primary} strokeWidth={2.5} />
          </View>
        ) : icon ? (
          <View style={styles.iconWrapper}>{icon}</View>
        ) : null}

        <Text
          style={[
            styles.label,
            selected ? styles.labelSelected : styles.labelUnselected,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {badge ? (
          <View style={[styles.badge, selected && styles.badgeSelected]}>
            <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    minHeight: 38,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.cardBorder,
  },
  chipSelected: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 6,
  },
  label: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 13,
  },
  labelUnselected: {
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  badge: {
    marginLeft: 6,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeSelected: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  badgeTextSelected: {
    color: '#07090E',
  },
});

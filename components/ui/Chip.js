import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

/**
 * Standardized Chip Component for filters and options
 * Has minimum 44px touch target, clear active indicator (check icon), and typography tokens.
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
            <Check size={16} color={COLORS.primary} strokeWidth={2.5} />
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
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  chipUnselected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.cardBorder,
  },
  chipSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderColor: COLORS.primary,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: SPACING.xs + 2,
  },
  label: {
    ...TYPOGRAPHY.bodyBold,
  },
  labelUnselected: {
    color: COLORS.textSecondary,
  },
  labelSelected: {
    color: COLORS.text,
  },
  badge: {
    marginLeft: SPACING.xs + 2,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.25)',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  badgeTextSelected: {
    color: COLORS.primary,
  },
});

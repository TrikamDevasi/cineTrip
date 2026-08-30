import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
            <Check size={14} color={colors.primary} strokeWidth={2.5} />
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

const createStyles = (colors) => StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
  },
  chipSelected: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
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
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
  },
  badge: {
    marginLeft: 6,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeSelected: {
    backgroundColor: colors.primary,
  },
  badgeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.textMuted,
  },
  badgeTextSelected: {
    color: '#07090E',
  },
});

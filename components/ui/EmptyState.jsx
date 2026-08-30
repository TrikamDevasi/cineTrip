import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import Button from './Button';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING, ICON_SIZES } from '../../constants/theme';

export default function EmptyState({
  icon = 'Film',
  title = 'No Items Found',
  description,
  reason,
  nextStep,
  actionLabel,
  onAction,
  actionIcon,
  style,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={ICON_SIZES.lg} color={colors.primary} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}

      {(reason || nextStep) && (
        <View style={styles.breakdown}>
          {reason ? (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownTag}>WHY</Text>
              <Text style={styles.breakdownText}>{reason}</Text>
            </View>
          ) : null}
          {nextStep ? (
            <View style={[styles.breakdownRow, styles.breakdownRowLast]}>
              <Text style={styles.breakdownTag}>WHAT NEXT</Text>
              <Text style={styles.breakdownText}>{nextStep}</Text>
            </View>
          ) : null}
        </View>
      )}

      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          icon={actionIcon}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: SPACING.lg,
  },
  breakdown: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  breakdownRowLast: {
    marginBottom: 0,
  },
  breakdownTag: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    color: colors.primary,
    letterSpacing: 1,
    width: 58,
    paddingTop: 2,
  },
  breakdownText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  actionBtn: {
    minWidth: 180,
  },
});

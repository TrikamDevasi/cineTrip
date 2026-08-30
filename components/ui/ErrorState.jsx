import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import Button from './Button';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'We encountered an error loading this information.',
  reason,
  nextStep,
  onRetry,
  retryLabel = 'Try Again',
  style,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AlertCircle size={28} color={colors.danger} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

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

      {onRetry ? (
        <Button
          title={retryLabel}
          icon="RefreshCw"
          onPress={onRetry}
          variant="surface"
          size="md"
          style={styles.retryBtn}
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
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: colors.dangerSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
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
    color: colors.danger,
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
  retryBtn: {
    minWidth: 160,
  },
});

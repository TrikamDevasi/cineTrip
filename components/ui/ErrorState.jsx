import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import Button from './Button';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

export default function ErrorState({
  title = 'Something Went Wrong',
  message = 'We encountered an error loading this information.',
  onRetry,
  retryLabel = 'Try Again',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <AlertCircle size={28} color={COLORS.danger} strokeWidth={2} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.dangerSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: SPACING.lg,
  },
  retryBtn: {
    minWidth: 160,
  },
});

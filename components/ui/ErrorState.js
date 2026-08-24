import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import Button from './Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

/**
 * Standardized Error State Component
 *
 * @param {string|React.Component} icon - Lucide icon name (default 'AlertCircle')
 * @param {string} title - Error title
 * @param {string} message - Error description message
 * @param {Function} onRetry - Optional retry action handler
 * @param {string} retryLabel - Retry button text (default 'Try Again')
 */
export default function ErrorState({
  icon = 'AlertCircle',
  title = 'Something went wrong',
  message = 'Please check your connection and try again.',
  onRetry,
  retryLabel = 'Try Again',
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={ICON_SIZES.illustration} color={COLORS.danger} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Button
          title={retryLabel}
          icon="RefreshCw"
          onPress={onRetry}
          variant="primary"
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
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.lg,
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: 4,
  },
});

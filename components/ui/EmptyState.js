import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import Button from './Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

/**
 * Standardized Empty State Component
 *
 * @param {string|React.Component} icon - Lucide icon name or component (e.g. 'Film', 'Bookmark', 'Camera')
 * @param {string} title - Main empty state title
 * @param {string} description - Supporting explanatory text
 * @param {string} actionLabel - Optional CTA button label
 * @param {Function} onAction - Optional CTA button action handler
 * @param {string|React.Component} actionIcon - Optional CTA button icon
 */
export default function EmptyState({
  icon = 'Film',
  title = 'No Items Found',
  description,
  actionLabel,
  onAction,
  actionIcon,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={ICON_SIZES.illustration} color={COLORS.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
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
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.lg,
    maxWidth: 280,
  },
  actionBtn: {
    marginTop: 4,
  },
});

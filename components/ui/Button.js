import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

/**
 * Standardized Luxury Cinematic Button Component
 *
 * @param {string} title - Button label text
 * @param {string|React.Component} icon - Lucide icon name or component
 * @param {string} iconPosition - 'left' | 'right'
 * @param {string} variant - 'primary' | 'secondary' | 'surface' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Loading state with spinner
 * @param {boolean} disabled - Disabled state
 * @param {string} accessibilityLabel - Accessibility label (defaults to title)
 */
export default function Button({
  title,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  ...props
}) {
  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary':
        return '#07090E'; // High contrast black on golden amber
      case 'secondary':
        return COLORS.text;
      case 'surface':
        return COLORS.text;
      case 'outline':
        return COLORS.primary;
      case 'ghost':
        return COLORS.textSecondary;
      case 'danger':
        return '#FFFFFF';
      default:
        return '#07090E';
    }
  };

  const sizeStyle = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const textSizeStyle = size === 'sm' ? styles.textSm : size === 'lg' ? styles.textLg : styles.textMd;
  const textColor = disabled ? COLORS.textMuted : getTextColor();

  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'surface':
        return styles.surface;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const iconSize = size === 'sm' ? ICON_SIZES.xs : size === 'lg' ? ICON_SIZES.md : ICON_SIZES.sm;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessible={true}
      activeOpacity={0.82}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        sizeStyle,
        getVariantStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#07090E' : COLORS.primary}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginRight: size === 'sm' ? 4 : 6 }}
            />
          )}

          {title ? (
            <Text style={[styles.textBase, textSizeStyle, { color: textColor }, textStyle]}>
              {title}
            </Text>
          ) : null}

          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={iconSize}
              color={textColor}
              style={{ marginLeft: size === 'sm' ? 4 : 6 }}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  sizeSm: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minHeight: 34,
  },
  sizeMd: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    minHeight: 44,
  },
  sizeLg: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    minHeight: 52,
    borderRadius: RADIUS.md,
  },
  textBase: {
    ...TYPOGRAPHY.bodyBold,
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 12,
    lineHeight: 16,
  },
  textMd: {
    fontSize: 14,
    lineHeight: 18,
  },
  textLg: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    paddingVertical: 2,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.focus,
  },
  secondary: {
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  surface: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.danger,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  disabled: {
    opacity: 0.45,
  },
});
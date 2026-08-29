import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import { COLORS, RADIUS, SHADOWS } from '../../constants/theme';

/**
 * Standardized Button Component
 *
 * @param {string} title - Button label text
 * @param {string|React.Component} icon - Lucide icon name or component
 * @param {string} iconPosition - 'left' | 'right'
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'surface'
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
        return '#07090E';
      case 'secondary':
        return '#07090E';
      case 'outline':
        return COLORS.primary;
      case 'ghost':
        return COLORS.text;
      case 'danger':
        return COLORS.danger;
      case 'surface':
        return COLORS.text;
      default:
        return '#07090E';
    }
  };

  const sizeStyle = size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;
  const textColor = disabled ? COLORS.textMuted : getTextColor(variant);
  const iconColor = textColor;

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return [sizeStyle, styles.secondary];
      case 'outline':
        return [sizeStyle, styles.outline];
      case 'ghost':
        return [sizeStyle, styles.ghost];
      case 'danger':
        return [sizeStyle, styles.danger];
      case 'surface':
        return [sizeStyle, styles.surface];
      case 'primary':
      default:
        return [sizeStyle, styles.primary];
    }
  };

  const getIconColor = () => iconColor;

  const iconSize = size === 'sm' ? ICON_SIZES.sm : size === 'lg' ? ICON_SIZES.lg : ICON_SIZES.md;


  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessible={true}
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        getContainerStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              <Icon name={icon} size={iconSize} color={getIconColor()} />
            </View>
          )}
          {title ? (
            <Text
              style={[
                styles.title,
                size === 'sm' ? styles.titleSm : size === 'lg' ? styles.titleLg : styles.titleMd,
                { color: textColor },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              <Icon name={icon} size={iconSize} color={getIconColor()} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44, // 44px standard touch target
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  title: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  titleSm: {
    fontSize: 12,
  },
  titleMd: {
    fontSize: 14,
    fontWeight: '800',
  },
  titleLg: {
    fontSize: 15,
    fontWeight: '800',
  },

  // Sizes
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  sizeMd: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 46,
  },
  sizeLg: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.focus,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.focus,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  surface: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabled: {
    opacity: 0.5,
  },
});
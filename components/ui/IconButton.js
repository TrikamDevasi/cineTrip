import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import { COLORS, RADIUS } from '../../constants/theme';

/**
 * Standardized Accessible Icon-Only Button
 * Enforces minimum 44x44 practical touch target.
 *
 * @param {string|React.Component} icon - Lucide icon name or component
 * @param {number} size - Icon size inside button (default 20)
 * @param {string} color - Icon color
 * @param {string} accessibilityLabel - Required accessibility label
 * @param {string} variant - 'default' | 'surface' | 'primary' | 'ghost' | 'danger'
 */
export default function IconButton({
  icon,
  size = ICON_SIZES.base,
  color = COLORS.text,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  disabled = false,
  variant = 'surface',
  style,
  ...props
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'ghost':
        return styles.ghost;
      case 'danger':
        return styles.danger;
      case 'surface':
      default:
        return styles.surface;
    }
  };

  const getVariantColor = () => {
    if (color !== COLORS.text) return color;
    switch (variant) {
      case 'primary':
        return '#07090E';
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.text;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessible={true}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        getVariantStyle(),
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      <Icon name={icon} size={size} color={getVariantColor()} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  disabled: {
    opacity: 0.4,
  },
});

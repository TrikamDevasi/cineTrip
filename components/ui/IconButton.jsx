import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon, { ICON_SIZES } from './Icon';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, SHADOWS } from '../../constants/theme';

/**
 * Standardized Accessible Icon-Only Button
 * Enforces minimum 44x44 practical touch target.
 *
 * @param {string|React.Component} icon - Lucide icon name or component
 * @param {number} size - Icon size inside button (default 18)
 * @param {string} color - Icon color
 * @param {string} accessibilityLabel - Required accessibility label
 * @param {string} variant - 'surface' | 'primary' | 'ghost' | 'danger' | 'amber'
 */
export default function IconButton({
  icon,
  size = ICON_SIZES.sm,
  color,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  disabled = false,
  variant = 'surface',
  style,
  ...props
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
      case 'amber':
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
    if (color != null) return color;
    switch (variant) {
      case 'primary':
      case 'amber':
        return '#07090E';
      case 'danger':
        return colors.danger;
      default:
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessible={true}
      activeOpacity={0.75}
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

const createStyles = (colors) => StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.focus,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  disabled: {
    opacity: 0.35,
  },
});

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { COLORS } from '../../constants/theme';

/**
 * Standardized icon size scale:
 * 12 -> metadata / badges
 * 16 -> compact controls / tags
 * 18 -> secondary actions / form icons
 * 20 -> standard controls / buttons
 * 24 -> primary controls / headers
 * 28-32 -> prominent action / modal hero
 * 40+ -> empty state illustration
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 18,
  base: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  hero: 48,
  illustration: 56,
};

export const ICON_STROKE_WIDTH = 2;

/**
 * Central Icon Component
 * Maps a string name or direct icon component to a standardized Lucide icon.
 *
 * @param {string|React.Component} name - Lucide icon name (PascalCase or camelCase) or Icon component
 * @param {number|string} size - Size in pixels or key from ICON_SIZES ('xs', 'sm', 'md', 'base', 'lg', 'xl', 'hero')
 * @param {string} color - Theme color (defaults to COLORS.text)
 * @param {number} strokeWidth - Standard stroke width (default 2)
 */
export default function Icon({
  name,
  size = 20,
  color = COLORS.text,
  strokeWidth = ICON_STROKE_WIDTH,
  style,
  ...props
}) {
  if (!name) return null;

  // Resolve size from token or number
  const resolvedSize = typeof size === 'string' ? ICON_SIZES[size] || 20 : size;

  // If passed directly as a Lucide component
  if (typeof name === 'function' || (typeof name === 'object' && name.$$typeof)) {
    const Component = name;
    return (
      <Component
        size={resolvedSize}
        color={color}
        strokeWidth={strokeWidth}
        style={style}
        {...props}
      />
    );
  }

  // If passed as string, format to PascalCase
  const formattedName =
    typeof name === 'string'
      ? name.charAt(0).toUpperCase() + name.slice(1)
      : '';

  const IconComponent = LucideIcons[formattedName] || LucideIcons[name] || LucideIcons.HelpCircle;

  return (
    <IconComponent
      size={resolvedSize}
      color={color}
      strokeWidth={strokeWidth}
      style={style}
      {...props}
    />
  );
}

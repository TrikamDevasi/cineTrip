import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { COLORS, ICON_SIZES, ICON_STROKE_WIDTH } from '../../constants/theme';

export { ICON_SIZES, ICON_STROKE_WIDTH };

export default function Icon({
  name,
  size = 'md',
  color = COLORS.text,
  strokeWidth = ICON_STROKE_WIDTH,
  style,
  ...props
}) {
  if (!name) return null;

  // Resolve size from token or numeric value
  const resolvedSize = typeof size === 'number' ? size : (ICON_SIZES[size] || ICON_SIZES.md);


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
export const COLORS = {
  // Backgrounds
  background: '#07090E',
  backgroundElevated: '#0D1322',
  card: '#131B2E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderGlow: 'rgba(0, 240, 255, 0.25)',
  surface: '#1A233A',
  surfaceHighlight: '#222F4C',

  // Primary & Accents
  primary: '#00F0FF',       // Neon Cyan
  primaryMuted: 'rgba(0, 240, 255, 0.15)',
  secondary: '#FFB800',     // Cinema Gold
  secondaryMuted: 'rgba(255, 184, 0, 0.15)',
  accentPink: '#FF2E63',    // Neon Crimson / Pop
  accentPinkMuted: 'rgba(255, 46, 99, 0.15)',
  accentPurple: '#8B5CF6',  // IMAX Violet
  accentPurpleMuted: 'rgba(139, 92, 246, 0.15)',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Formats
  formatImax: '#0072CE',
  formatDolby: '#FF1352',
  format4DX: '#10B981',
  formatLaser: '#8B5CF6',

  // Typography
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textTertiary: '#475569',

  // Overlays
  overlayDark: 'rgba(7, 9, 14, 0.85)',
  overlayGradient: ['transparent', 'rgba(7, 9, 14, 0.6)', 'rgba(7, 9, 14, 0.95)', '#07090E'],
  heroGradient: ['transparent', 'rgba(7, 9, 14, 0.3)', 'rgba(7, 9, 14, 0.95)'],
};

export const LIGHT_COLORS = {
  // Backgrounds
  background: '#F8FAFC',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  cardBorderGlow: 'rgba(0, 180, 200, 0.25)',
  surface: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',

  // Primary & Accents
  primary: '#0891B2',       // Deep Cyan
  primaryMuted: 'rgba(8, 145, 178, 0.15)',
  secondary: '#D97706',     // Amber
  secondaryMuted: 'rgba(217, 119, 6, 0.15)',
  accentPink: '#E11D48',
  accentPinkMuted: 'rgba(225, 29, 72, 0.15)',
  accentPurple: '#7C3AED',
  accentPurpleMuted: 'rgba(124, 58, 237, 0.15)',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',

  // Formats
  formatImax: '#0072CE',
  formatDolby: '#FF1352',
  format4DX: '#10B981',
  formatLaser: '#8B5CF6',

  // Typography
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textTertiary: '#CBD5E1',

  // Overlays
  overlayDark: 'rgba(15, 23, 42, 0.7)',
  overlayGradient: ['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.8)', '#0F172A'],
  heroGradient: ['transparent', 'rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.8)'],
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  h2: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  h3: { fontSize: 18, fontWeight: '700', letterSpacing: 0.2 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
  bodyMedium: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.4 },
  badge: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 26,
  xxl: 36,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};

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

export const SHADOWS = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  glowCyan: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowGold: {
    shadowColor: '#FFB800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
};



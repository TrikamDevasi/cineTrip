export const COLORS = {
  // The definitive CineTrip palette — neon is an accent, not the entire design
  primary: '#00F0FF',          // Neon cyan — primary accent & focus
  secondary: '#FFB800',        // Cinema gold — rating & secondary highlights
  accentPink: '#FF2E63',       // Neon crimson — subtle highlights
  accentPurple: '#8B5CF6',     // IMAX violet — format highlights

  // Dark Neutrals (CineTrip core identity)
  background: '#07090E',       // Pure deep cinema black
  backgroundElevated: '#0D1322',// Layer 1 elevation
  card: '#131B2E',             // Card containers
  cardBorder: 'rgba(255, 255, 255, 0.08)', // Subtle structural borders
  surface: '#1A233A',          // Elevated interactive surfaces
  surfaceHighlight: '#232E4A', // Hover / active surfaces

  // Text Hierarchy
  text: '#FFFFFF',             // High-contrast primary text
  textSecondary: '#94A3B8',    // Supporting metadata & descriptions
  textMuted: '#64748B',        // Captions, placeholders & inactive states

  // Status & Feedback
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Formats
  formatImax: '#0072CE',
  formatDolby: '#FF1352',
  format4DX: '#10B981',
  formatLaser: '#8B5CF6',

  // Overlays
  overlayDark: 'rgba(7, 9, 14, 0.85)',
  overlayGradient: ['transparent', 'rgba(7, 9, 14, 0.6)', 'rgba(7, 9, 14, 0.95)', '#07090E'],
  heroGradient: ['transparent', 'rgba(7, 9, 14, 0.3)', 'rgba(7, 9, 14, 0.9)', '#07090E'],
};

export const LIGHT_COLORS = {
  background: '#F8FAFC',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  surface: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',

  primary: '#0891B2',
  secondary: '#D97706',
  accentPink: '#E11D48',
  accentPurple: '#7C3AED',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',

  formatImax: '#0072CE',
  formatDolby: '#FF1352',
  format4DX: '#10B981',
  formatLaser: '#8B5CF6',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  overlayDark: 'rgba(15, 23, 42, 0.7)',
  overlayGradient: ['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.8)', '#0F172A'],
  heroGradient: ['transparent', 'rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.8)'],
};

export const TYPOGRAPHY = {
  // Standardized typography scale — minimum readable text is 12px for badges/captions, 14px for body
  h1: { fontSize: 28, fontWeight: '900', letterSpacing: 0.3, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '800', letterSpacing: 0.2, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700', letterSpacing: 0.1, lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2, lineHeight: 16 },
  badge: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
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
  sm: 16,   // Inline / micro-controls
  md: 20,   // Button icons / action items
  lg: 24,   // Navigation tabs / screen headers
  xl: 48,   // Empty state & illustration icons
  xxl: 56,  // Large feature headers
};

export const ICON_STROKE_WIDTH = 2;

// Restrained elevation shadows (NO neon glow floods on every element)
export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  focus: {
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
};




/**
 * CineTrip Premium Cinematic Design System Tokens
 * Luxury Entertainment + Theatrical Ambiance + Modern Mobile Usability
 */

export const COLORS = {
  // Brand Accents (Warm Cinematic Amber & Gold + Refined Accents)
  primary: '#E5A93C',           // Warm Cinematic Amber / Marquee Gold
  primaryHover: '#F5B94E',      // Lighter Gold on active press
  primarySubtle: 'rgba(229, 169, 60, 0.14)',
  primaryGlow: 'rgba(229, 169, 60, 0.28)',

  secondary: '#D4AF37',         // Champagne Gold for ratings & milestones
  secondarySubtle: 'rgba(212, 175, 55, 0.12)',

  accentViolet: '#8B5CF6',      // IMAX 70mm & Special format accent
  accentCrimson: '#E11D48',     // Dolby Cinema & Premiere badges
  accentCyan: '#06B6D4',        // Digital Pass & Turnstile accents
  accentGreen: '#10B981',       // Success & Confirmed RSVP

  // Theatrical Dark Neutrals (Pure Cinema Onyx & Graphite Layers)
  background: '#07090E',        // Deep pitch cinema black
  backgroundSecondary: '#0C0F17',// Layer 0.5 subtle contrast
  card: '#121722',              // Layer 1 card containers
  cardElevated: '#171E2D',      // Layer 2 floating cards
  cardBorder: 'rgba(255, 255, 255, 0.08)', // Crisp structural border
  cardBorderActive: 'rgba(229, 169, 60, 0.35)', // Amber focus border

  surface: '#171E2D',           // Interactive surface (inputs, buttons)
  surfaceElevated: '#1E2638',   // Elevated chips, modal bodies
  surfaceHighlight: '#263148',  // Pressed / active selection

  // Text Hierarchy (Warm High-Contrast)
  text: '#F8FAFC',              // Warm White (98% contrast)
  textSecondary: '#94A3B8',     // Slate Secondary (body metadata)
  textMuted: '#64748B',         // Subtle Captions / Disabled
  textInverse: '#07090E',       // Dark text on gold buttons

  // Feedback States
  success: '#10B981',
  successSubtle: 'rgba(16, 185, 129, 0.14)',
  warning: '#F59E0B',
  warningSubtle: 'rgba(245, 158, 11, 0.14)',
  danger: '#EF4444',
  dangerSubtle: 'rgba(239, 68, 68, 0.14)',

  // Theatrical Format Tags
  formatImax: '#7C3AED',
  formatDolby: '#E11D48',
  format4DX: '#059669',
  formatLaser: '#E5A93C',
  formatScreenX: '#0284C7',

  // Overlays & Gradients
  overlayDark: 'rgba(7, 9, 14, 0.88)',
  overlayGradient: ['transparent', 'rgba(7, 9, 14, 0.65)', 'rgba(7, 9, 14, 0.95)', '#07090E'],
  heroGradient: ['rgba(7, 9, 14, 0.15)', 'transparent', 'rgba(7, 9, 14, 0.75)', '#07090E'],
  ticketPerforation: 'rgba(255, 255, 255, 0.12)',
};

export const LIGHT_COLORS = {
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.08)',
  cardBorderActive: 'rgba(217, 119, 6, 0.4)',

  surface: '#F1F5F9',
  surfaceElevated: '#E2E8F0',
  surfaceHighlight: '#CBD5E1',

  primary: '#D97706',
  primaryHover: '#B45309',
  primarySubtle: 'rgba(217, 119, 6, 0.12)',
  primaryGlow: 'rgba(217, 119, 6, 0.25)',

  secondary: '#B45309',
  secondarySubtle: 'rgba(180, 83, 9, 0.1)',

  accentViolet: '#7C3AED',
  accentCrimson: '#BE123C',
  accentCyan: '#0891B2',
  accentGreen: '#059669',

  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  success: '#059669',
  successSubtle: 'rgba(5, 150, 105, 0.14)',
  warning: '#D97706',
  warningSubtle: 'rgba(217, 119, 6, 0.14)',
  danger: '#DC2626',
  dangerSubtle: 'rgba(220, 38, 38, 0.14)',

  formatImax: '#7C3AED',
  formatDolby: '#BE123C',
  format4DX: '#059669',
  formatLaser: '#D97706',
  formatScreenX: '#0284C7',

  overlayDark: 'rgba(15, 23, 42, 0.75)',
  overlayGradient: ['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.85)', '#0F172A'],
  heroGradient: ['transparent', 'rgba(15, 23, 42, 0.2)', 'rgba(15, 23, 42, 0.85)'],
  ticketPerforation: 'rgba(0, 0, 0, 0.12)',
};

export const TYPOGRAPHY = {
  displayLarge: { fontSize: 30, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36 },
  displayMedium: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, lineHeight: 30 },
  h1: { fontSize: 22, fontWeight: '800', letterSpacing: -0.2, lineHeight: 28 },
  h2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.1, lineHeight: 24 },
  h3: { fontSize: 16, fontWeight: '700', letterSpacing: 0, lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  bodyBold: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2, lineHeight: 16 },
  badge: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  ticketMono: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const ICON_SIZES = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 36,
  xxl: 48,
};

export const ICON_STROKE_WIDTH = 2;

import { Platform } from 'react-native';

export const SHADOWS = {
  card: Platform.select({
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.35)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    },
  }),
  modal: Platform.select({
    web: {
      boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.6)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 12,
    },
  }),
  focus: Platform.select({
    web: {
      boxShadow: '0px 0px 8px rgba(229, 169, 60, 0.35)',
    },
    default: {
      shadowColor: '#E5A93C',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
};

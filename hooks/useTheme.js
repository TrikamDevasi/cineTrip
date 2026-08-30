import { usePreferencesStore } from '../store/usePreferencesStore';
import { useColorScheme } from 'react-native';
import { COLORS, LIGHT_COLORS } from '../constants/theme';

/**
 * Returns the active theme palette and mode.
 * Respects:
 * 1. User's explicit preference from store (dark/light/system)
 * 2. System color scheme for 'system' preference
 *
 * The returned `colors` palette is reactive: since this hook subscribes to the
 * preferences store (zustand) and `useColorScheme()`, any change to the theme
 * mode or the OS scheme re-renders the consumer and swaps the active palette.
 *
 * Screens that want to fully support light/dark should build their styles from
 * `colors` (e.g. `createStyles(colors)`) rather than the static `COLORS`.
 */
export const useTheme = () => {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const systemScheme = useColorScheme();

  let isDark = true; // default to dark
  if (themeMode === 'light') {
    isDark = false;
  } else if (themeMode === 'system') {
    isDark = systemScheme !== 'light';
  }

  const colors = isDark ? COLORS : LIGHT_COLORS;

  return {
    colors,
    themeMode,
    setThemeMode,
    isDark,
    isLight: !isDark,
  };
};

// Backwards-compatible alias
export const useThemeColors = () => useTheme().colors;

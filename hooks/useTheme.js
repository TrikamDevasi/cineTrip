import { usePreferencesStore } from '../store/usePreferencesStore';
import { useColorScheme } from 'react-native';

/**
 * Returns the active theme mode and whether dark mode is active.
 * Respects:
 * 1. User's explicit preference from store (dark/light/system)
 * 2. System color scheme for 'system' preference
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

  return {
    themeMode,
    setThemeMode,
    isDark,
    isLight: !isDark,
  };
};

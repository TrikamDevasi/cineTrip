import { Alert, Platform } from 'react-native';

const isWeb = typeof Platform !== 'undefined' && Platform.OS === 'web';

/**
 * Cross-platform alert/confirm.
 *
 * React Native Web's `Alert.alert` is a no-op, so on web we fall back to the
 * browser's native `window.alert` / `window.confirm`. On native it delegates
 * straight to React Native's `Alert.alert`.
 *
 * Supported button patterns (mirrors the native `Alert` API):
 *   - Confirm dialog (`style: 'destructive'` + optional cancel): maps to
 *     `window.confirm`; runs the destructive button's `onPress` if OK'd.
 *   - Info / success dialog (optionally with an OK button that performs an
 *     action like navigation): maps to `window.alert`; runs the default
 *     button's `onPress` after the dialog is dismissed.
 */
export function showAlert(title, message, buttons) {
  if (!isWeb || typeof window === 'undefined') {
    Alert.alert(title, message, buttons);
    return;
  }

  const list = Array.isArray(buttons) ? buttons : [];
  const destructive = list.find((b) => b && b.style === 'destructive');
  const defaultAction = list.find((b) => b && (!b.style || b.style === 'default'));

  if (destructive) {
    const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
    if (confirmed && destructive.onPress) destructive.onPress();
    return;
  }

  window.alert(message ? `${title}\n\n${message}` : title);
  if (defaultAction && defaultAction.onPress) defaultAction.onPress();
}

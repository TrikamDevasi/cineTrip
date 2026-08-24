import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cinetrip_auth_token';

// In-memory fallback
let memoryToken = null;

/**
 * Store JWT token securely with web fallback
 */
export const saveToken = async (token) => {
  memoryToken = token;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(TOKEN_KEY, token);
      }
      return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.warn('Token save fallback:', error.message);
  }
};

/**
 * Retrieve stored JWT token with web fallback
 */
export const getToken = async () => {
  if (memoryToken) return memoryToken;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(TOKEN_KEY);
        if (val) memoryToken = val;
        return val;
      }
      return memoryToken;
    }
    const val = await SecureStore.getItemAsync(TOKEN_KEY);
    if (val) memoryToken = val;
    return val;
  } catch (error) {
    console.warn('Token get fallback:', error.message);
    return memoryToken;
  }
};

/**
 * Remove stored JWT token on logout with web fallback
 */
export const removeToken = async () => {
  memoryToken = null;
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('Token remove fallback:', error.message);
  }
};

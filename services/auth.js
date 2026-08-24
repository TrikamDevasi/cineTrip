import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'cinetrip_auth_token';

/**
 * Store JWT token securely
 */
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.warn('SecureStore save failed:', error.message);
    // Fallback to memory only — do not use AsyncStorage for JWT
  }
};

/**
 * Retrieve stored JWT token
 */
export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('SecureStore get failed:', error.message);
    return null;
  }
};

/**
 * Remove stored JWT token on logout
 */
export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.warn('SecureStore remove failed:', error.message);
  }
};

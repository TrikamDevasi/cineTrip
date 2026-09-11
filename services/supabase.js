import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isBrowser = typeof window !== 'undefined';

// Safe cross-platform storage adapter for Supabase (Mobile, Web, and Node/SSR)
const customStorage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      if (isBrowser && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      if (isBrowser && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      if (isBrowser && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

// Publishable (anon) Supabase credentials — read from environment variables.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: isBrowser || Platform.OS !== 'web',
    persistSession: true,
    detectSessionInUrl: isBrowser && Platform.OS === 'web',
  },
});

export default supabase;


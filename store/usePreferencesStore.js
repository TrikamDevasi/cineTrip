import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { getToken } from '../services/auth';

export const usePreferencesStore = create(
  persist(
    (set, get) => ({
      userName: '',
      userHandle: '',
      userAvatar: '',
      city: '',
      preferredChain: '',
      preferredFormat: 'IMAX Laser',
      favoriteGenres: [],
      notificationsEnabled: true,
      autoExportCalendar: false,
      themeMode: 'dark', // 'dark' | 'light' | 'system'

      /**
       * Populate profile from authenticated user object
       */
      setFromUser: (user) => {
        if (!user) return;
        set({
          userName: user.name || '',
          userHandle: user.email ? `@${user.email.split('@')[0]}` : '',
          userAvatar: user.profile?.avatar || '',
          city: user.profile?.city || '',
          preferredChain: user.profile?.preferredChain || '',
          preferredFormat: user.profile?.preferredFormat || 'IMAX Laser',
          favoriteGenres: user.profile?.favoriteGenres || [],
          notificationsEnabled: user.profile?.notificationsEnabled ?? true,
          autoExportCalendar: user.profile?.autoExportCalendar ?? false,
          themeMode: user.profile?.themeMode || 'dark',
        });
      },

      updateProfile: async (profileData) => {
        // Update local state immediately
        set((state) => ({ ...state, ...profileData }));

        // Only attempt backend sync if user is authenticated with a token
        try {
          const token = await getToken();
          if (!token) return;

          const payload = {};
          if (profileData.userName) payload.name = profileData.userName;

          const profileFields = [
            'city', 'userAvatar', 'preferredFormat', 'preferredChain',
            'favoriteGenres', 'notificationsEnabled', 'autoExportCalendar', 'themeMode',
          ];

          const profilePayload = {};
          profileFields.forEach((field) => {
            if (profileData[field] !== undefined) {
              const backendKey = field === 'userAvatar' ? 'avatar' : field;
              profilePayload[backendKey] = profileData[field];
            }
          });

          if (Object.keys(profilePayload).length > 0) {
            payload.profile = profilePayload;
          }

          if (Object.keys(payload).length > 0) {
            await api.put('/api/profile', payload);
          }
        } catch (error) {
          // Gracefully suppress network failure for background preference sync
          if (!error.isNetworkError) {
            console.warn('Profile sync failed:', error.message);
          }
        }
      },

      toggleGenre: async (genre) => {
        const state = get();
        const exists = state.favoriteGenres.includes(genre);
        const favoriteGenres = exists
          ? state.favoriteGenres.filter((g) => g !== genre)
          : [...state.favoriteGenres, genre];

        set({ favoriteGenres });

        try {
          const token = await getToken();
          if (token) {
            await api.put('/api/profile', { profile: { favoriteGenres } });
          }
        } catch {
          // Silent local fallback
        }
      },

      setThemeMode: async (themeMode) => {
        set({ themeMode });
        try {
          const token = await getToken();
          if (token) {
            await api.put('/api/profile', { profile: { themeMode } });
          }
        } catch {
          // Silent local fallback
        }
      },

      clearProfile: () =>
        set({
          userName: '',
          userHandle: '',
          userAvatar: '',
          city: '',
          preferredChain: '',
          preferredFormat: 'IMAX Laser',
          favoriteGenres: [],
          notificationsEnabled: true,
          autoExportCalendar: false,
          themeMode: 'dark',
        }),
    }),
    {
      name: 'cinetrip-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

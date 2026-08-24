import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

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
        set((state) => ({ ...state, ...profileData }));

        try {
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
          console.warn('Profile sync failed:', error.message);
        }
      },

      toggleGenre: (genre) =>
        set((state) => {
          const exists = state.favoriteGenres.includes(genre);
          const favoriteGenres = exists
            ? state.favoriteGenres.filter((g) => g !== genre)
            : [...state.favoriteGenres, genre];
          api.put('/api/profile', { profile: { favoriteGenres } }).catch(() => {});
          return { favoriteGenres };
        }),

      setThemeMode: (themeMode) => {
        set({ themeMode });
        api.put('/api/profile', { profile: { themeMode } }).catch(() => {});
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

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useWatchlistStore = create(
  persist(
    (set, get) => ({
      watchlist: [],
      isLoading: false,
      error: null,
      isSynced: false,

      fetchWatchlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get('/api/watchlist');
          const watchlist = data.data.map((item) => ({
            ...item.movieData,
            _id: item._id,
            preferredFormat: item.preferredFormat,
            addedAt: item.addedAt,
          }));
          set({ watchlist, isLoading: false, isSynced: true });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      addToWatchlist: async (movie, preferredFormat = 'IMAX Laser') => {
        const { watchlist } = get();
        if (watchlist.some((m) => m.id === movie.id)) return;

        const newItem = { ...movie, addedAt: Date.now(), preferredFormat };
        set({ watchlist: [newItem, ...watchlist] });

        try {
          await api.post('/api/watchlist', {
            movieId: movie.id,
            movieData: movie,
            preferredFormat,
          });
        } catch (error) {
          if (!error.isNetworkError) {
            set({ watchlist });
          }
        }
      },

      removeFromWatchlist: async (movieId) => {
        const previous = get().watchlist;
        set({ watchlist: previous.filter((m) => m.id !== movieId) });

        try {
          await api.delete(`/api/watchlist/${movieId}`);
        } catch (error) {
          if (!error.isNetworkError) {
            set({ watchlist: previous });
          }
        }
      },

      toggleWatchlist: async (movie) => {
        const { watchlist } = get();
        if (watchlist.some((m) => m.id === movie.id)) {
          await get().removeFromWatchlist(movie.id);
        } else {
          await get().addToWatchlist(movie);
        }
      },

      isInWatchlist: (movieId) => get().watchlist.some((m) => m.id === movieId),

      clearWatchlist: () => set({ watchlist: [], isSynced: false }),
    }),
    {
      name: 'cinetrip-watchlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ watchlist: state.watchlist }),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RECENT = 12;
const MAX_SEARCHES = 8;

const summarizeMovie = (movie) => {
  if (!movie) return null;
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average,
    release_date: movie.release_date,
    genre_ids: movie.genre_ids || (movie.genres || []).map((g) => g.id),
    runtime: movie.runtime,
    overview: movie.overview,
  };
};

const summarizeCinema = (cinema) => {
  if (!cinema) return null;
  return {
    id: cinema.id,
    name: cinema.name,
    address: cinema.address,
    screenType: cinema.screenType,
    features: cinema.features || [],
    latitude: cinema.latitude,
    longitude: cinema.longitude,
    city: cinema.city,
    brand: cinema.brand,
  };
};

export const useActivityStore = create(
  persist(
    (set, get) => ({
      recentMovies: [], // most recently viewed movie summaries (newest first)
      recentSearches: [], // recent search queries (newest first)
      favoriteCinemaIds: [], // ids of favorite cinemas

      recordMovieView: (movie) => {
        const summary = summarizeMovie(movie);
        if (!summary || !summary.id) return;
        const remaining = get().recentMovies.filter((m) => Number(m.id) !== Number(summary.id));
        set({ recentMovies: [summary, ...remaining].slice(0, MAX_RECENT) });
      },

      recordSearch: (query) => {
        const q = (query || '').trim();
        if (!q) return;
        const remaining = get().recentSearches.filter((s) => s.toLowerCase() !== q.toLowerCase());
        set({ recentSearches: [q, ...remaining].slice(0, MAX_SEARCHES) });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
      clearRecentMovies: () => set({ recentMovies: [] }),

      isFavoriteCinema: (cinemaId) => get().favoriteCinemaIds.some((id) => String(id) === String(cinemaId)),
      toggleFavoriteCinema: (cinema) => {
        if (!cinema || cinema.id == null) return;
        const id = String(cinema.id);
        const current = get().favoriteCinemaIds;
        const exists = current.some((cid) => String(cid) === id);
        set({
          favoriteCinemaIds: exists
            ? current.filter((cid) => String(cid) !== id)
            : [cinema.id, ...current],
        });
      },
    }),
    {
      name: 'cinetrip-activity-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

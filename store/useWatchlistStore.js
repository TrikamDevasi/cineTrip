import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Watchlist store — Zustand as optimistic local cache, synced to MongoDB.
 *
 * Pattern:
 *  1. All mutations update local state IMMEDIATELY (optimistic UI).
 *  2. The mutation is then mirrored to the /api/watchlist DB endpoint.
 *  3. On login, call hydrateFromDB() to merge DB state into local state.
 *
 * Requires user to be signed in for DB sync. Local-only operations
 * (add/remove) still work for guests; they just won't persist across devices.
 */

async function syncAdd(movie) {
  try {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mediaId: movie.id,
        mediaType: movie.media_type || "movie",
        title: movie.title || movie.name,
        posterPath: movie.poster_path,
        backdropPath: movie.backdrop_path,
        voteAverage: movie.vote_average,
        releaseDate: movie.release_date || movie.first_air_date,
        genres: movie.genre_ids || [],
      }),
    });
  } catch (err) {
    console.warn("[Watchlist] DB sync (add) failed:", err.message);
  }
}

async function syncRemove(movieId, mediaType = "movie") {
  try {
    await fetch(
      `/api/watchlist?mediaId=${movieId}&mediaType=${mediaType}`,
      { method: "DELETE" }
    );
  } catch (err) {
    console.warn("[Watchlist] DB sync (remove) failed:", err.message);
  }
}

const useWatchlistStore = create(
  persist(
    (set, get) => ({
      watchlist: [],

      /** Add a movie/series — updates local state then mirrors to DB */
      addToWatchlist: (movie) => {
        const { watchlist } = get();
        if (!watchlist.find((m) => m.id === movie.id)) {
          set({ watchlist: [...watchlist, { ...movie, addedAt: Date.now() }] });
          syncAdd(movie);
        }
      },

      /** Remove by TMDB id — updates local state then mirrors to DB */
      removeFromWatchlist: (movieId, mediaType = "movie") => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter((m) => m.id !== movieId) });
        syncRemove(movieId, mediaType);
      },

      /** Returns true if a movie/series is in the local watchlist */
      isInWatchlist: (movieId) => get().watchlist.some((m) => m.id === movieId),

      /**
       * Hydrate local state from MongoDB after sign-in.
       * Merges DB items with any local-only items the user added as a guest.
       * DB items take precedence for conflicts (same mediaId).
       */
      hydrateFromDB: async () => {
        try {
          const res = await fetch("/api/watchlist");
          if (!res.ok) return;
          const { items } = await res.json();
          if (!Array.isArray(items)) return;

          const { watchlist: local } = get();

          // Build a map from DB items (DB wins on conflict)
          const dbMap = new Map(items.map((item) => [item.mediaId, {
            id: item.mediaId,
            media_type: item.mediaType,
            title: item.title,
            poster_path: item.posterPath,
            backdrop_path: item.backdropPath,
            vote_average: item.voteAverage,
            release_date: item.releaseDate,
            genre_ids: item.genres,
            addedAt: new Date(item.addedAt).getTime(),
          }]));

          // Add local-only items that aren't in the DB yet
          local.forEach((item) => {
            if (!dbMap.has(item.id)) {
              dbMap.set(item.id, item);
              // Sync the local-only item to DB in the background
              syncAdd(item);
            }
          });

          set({ watchlist: Array.from(dbMap.values()) });
        } catch (err) {
          console.warn("[Watchlist] Hydration from DB failed:", err.message);
        }
      },
    }),
    {
      name: "cinephiles-watchlist",
    }
  )
);

export default useWatchlistStore;

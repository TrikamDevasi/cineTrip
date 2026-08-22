"use client";

import { create } from "zustand";

const useSeriesStore = create((set, get) => ({
  seriesList: [],
  loading: false,
  error: null,

  fetchSeriesList: async (userId) => {
    set({ loading: true });
    try {
      const res = await fetch(
        `/api/series/list${userId ? `?userId=${userId}` : ""}`
      );
      const data = await res.json();
      if (data.success) {
        set({ seriesList: data.data, loading: false });
      } else {
        set({ error: data.error, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addSeries: async (seriesData) => {
    try {
      const res = await fetch("/api/series/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seriesData),
      });
      const data = await res.json();
      if (data.success) {
        const { seriesList } = get();
        set({ seriesList: [data.data, ...seriesList] });
      }
    } catch (err) {
      console.error("Failed to add series:", err);
    }
  },

  removeSeries: async (tmdbId) => {
    try {
      const res = await fetch(`/api/series/${tmdbId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const { seriesList } = get();
        set({
          seriesList: seriesList.filter((s) => s.tmdbId !== tmdbId),
        });
      }
    } catch (err) {
      console.error("Failed to remove series:", err);
    }
  },

  updateSeriesProgress: async (tmdbId, updates) => {
    try {
      const res = await fetch(`/api/series/${tmdbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        const { seriesList } = get();
        set({
          seriesList: seriesList.map((s) =>
            s.tmdbId === tmdbId ? { ...s, ...updates } : s
          ),
        });
      }
    } catch (err) {
      console.error("Failed to update series:", err);
    }
  },

  isInSeriesList: (tmdbId) => {
    return get().seriesList.some((s) => s.tmdbId === tmdbId);
  },
}));

export default useSeriesStore;

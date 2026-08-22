import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserPreferencesStore = create(
  persist(
    (set) => ({
      userName: "Trikam Devasi",
      userHandle: "@trikamdevasi",
      userAvatar: "🍿",
      city: "Mumbai",
      preferredChain: "PVR INOX",
      preferredFormat: "IMAX Laser 3D",
      favoriteGenres: ["Sci-Fi", "Action", "Drama", "Thriller"],
      notificationsEnabled: true,
      autoExportCalendar: true,

      updateProfile: (profileData) =>
        set((state) => ({
          ...state,
          ...profileData,
        })),

      toggleGenre: (genre) =>
        set((state) => {
          const exists = state.favoriteGenres.includes(genre);
          return {
            favoriteGenres: exists
              ? state.favoriteGenres.filter((g) => g !== genre)
              : [...state.favoriteGenres, genre],
          };
        }),
    }),
    {
      name: "cinetrip-user-preferences",
    }
  )
);

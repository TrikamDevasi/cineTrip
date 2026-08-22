import { create } from "zustand";
import { persist } from "zustand/middleware";

const INITIAL_MEMORIES = [
  {
    _id: "mem-1",
    movie: {
      id: 157336,
      title: "Interstellar",
      poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
      backdrop_path: "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
      release_date: "2014-11-05",
    },
    watchedDate: "2026-06-15",
    experienceType: "theatrical",
    cinemaName: "IMAX 70mm - Laser Dome",
    rating: 5,
    story: "Watching the docking scene on the massive 70mm screen with Hans Zimmer's organ score blasting was unreal! Everyone in the theater held their breath.",
    favoriteMoment: "The Miller's planet giant wave sequence and the spinning docking maneuver.",
    companions: [
      { name: "Alex Chen", avatar: "🚀" },
      { name: "Dev Patel", avatar: "✨" },
    ],
    snackHighlight: "Giant Salted Popcorn & Cold Brew",
    createdAt: "2026-06-15T22:00:00Z",
  },
  {
    _id: "mem-2",
    movie: {
      id: 872585,
      title: "Oppenheimer",
      poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      backdrop_path: "/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg",
      release_date: "2023-07-19",
    },
    watchedDate: "2026-04-20",
    experienceType: "theatrical",
    cinemaName: "PVR Directors Cut",
    rating: 5,
    story: "Midnight premiere night. The silence during the Trinity test explosion gave everyone goosebumps in the auditorium.",
    favoriteMoment: "The foot-stomp victory speech countdown.",
    companions: [
      { name: "Sarah Miller", avatar: "💥" },
    ],
    snackHighlight: "Truffle Fries & Nacho Dip",
    createdAt: "2026-04-20T23:30:00Z",
  },
];

export const useMemoryStore = create(
  persist(
    (set) => ({
      memories: INITIAL_MEMORIES,

      addMemory: (memory) =>
        set((state) => ({
          memories: [
            {
              _id: memory._id || `mem-${Date.now()}`,
              createdAt: new Date().toISOString(),
              ...memory,
            },
            ...state.memories,
          ],
        })),

      deleteMemory: (memoryId) =>
        set((state) => ({
          memories: state.memories.filter((m) => m._id !== memoryId),
        })),
    }),
    {
      name: "cinetrip-memories-storage",
    }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_DRAFT = {
  movie: null,
  cinema: {
    name: "IMAX Laser - Grand Theater",
    brand: "IMAX",
    screenType: "IMAX Laser 3D",
    city: "Mumbai",
    address: "Phoenix Palladium, High Street Mall",
  },
  date: new Date().toISOString().split("T")[0],
  time: "19:30",
  slotName: "Evening Show",
  friends: [
    { id: "1", name: "Alex Chen", avatar: "🍿", status: "accepted" },
    { id: "2", name: "Sarah Miller", avatar: "✨", status: "invited" },
  ],
  notes: "Book row F or G middle seats!",
  seats: "Row F, Seats 12-14",
  bookingRef: "",
};

export const usePlannerStore = create(
  persist(
    (set, get) => ({
      draft: DEFAULT_DRAFT,
      plans: [
        {
          _id: "demo-plan-1",
          movie: {
            id: 693134,
            title: "Dune: Part Two",
            poster_path: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
            backdrop_path: "/xOMo8BRK7PfcJv9JCnx7s520b2e.jpg",
            runtime: 166,
            vote_average: 8.2,
            genres: ["Science Fiction", "Adventure"],
          },
          cinema: {
            name: "PVR INOX IMAX with Laser",
            brand: "IMAX",
            screenType: "IMAX Laser 3D",
            city: "Mumbai",
            address: "Phoenix Palladium, Lower Parel",
          },
          date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          time: "19:30",
          slotName: "Evening Show (Prime)",
          friends: [
            { name: "Alex Chen", avatar: "🍿", status: "accepted" },
            { name: "Sarah Miller", avatar: "✨", status: "accepted" },
            { name: "Dev Patel", avatar: "🥤", status: "invited" },
          ],
          notes: "Grab nachos & caramel popcorn before show starts!",
          seats: "Row H, 14-16 (Prime View)",
          status: "upcoming",
          bookingRef: "CIN-88429",
          createdAt: new Date().toISOString(),
        },
      ],

      setDraftMovie: (movie) =>
        set((state) => ({
          draft: { ...state.draft, movie },
        })),

      setDraftCinema: (cinema) =>
        set((state) => ({
          draft: { ...state.draft, cinema: { ...state.draft.cinema, ...cinema } },
        })),

      setDraftDateTime: (date, time, slotName) =>
        set((state) => ({
          draft: { ...state.draft, date, time, slotName: slotName || state.draft.slotName },
        })),

      setDraftNotes: (notes, seats, bookingRef) =>
        set((state) => ({
          draft: { ...state.draft, notes, seats, bookingRef },
        })),

      addDraftFriend: (friend) =>
        set((state) => ({
          draft: {
            ...state.draft,
            friends: [...state.draft.friends, friend],
          },
        })),

      removeDraftFriend: (friendName) =>
        set((state) => ({
          draft: {
            ...state.draft,
            friends: state.draft.friends.filter((f) => f.name !== friendName),
          },
        })),

      resetDraft: () => set({ draft: DEFAULT_DRAFT }),

      addPlan: (newPlan) =>
        set((state) => ({
          plans: [
            {
              _id: newPlan._id || `plan-${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: "upcoming",
              ...newPlan,
            },
            ...state.plans,
          ],
        })),

      updatePlanStatus: (planId, status) =>
        set((state) => ({
          plans: state.plans.map((p) => (p._id === planId ? { ...p, status } : p)),
        })),

      deletePlan: (planId) =>
        set((state) => ({
          plans: state.plans.filter((p) => p._id !== planId),
        })),
    }),
    {
      name: "cinetrip-planner-storage",
    }
  )
);

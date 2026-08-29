import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const DEFAULT_DRAFT = {
  movie: null,
  cinema: null,
  showtime: null,
  showtimeId: '',
  date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  time: '',
  slotName: '',
  friends: [],
  notes: '',
  seats: '',
  bookingRef: '',
  bookingStatus: 'plan',
  snacks: [],
};

export const usePlannerStore = create(
  persist(
    (set, get) => ({
      draft: DEFAULT_DRAFT,
      plans: [],
      isLoading: false,
      error: null,
      isSynced: false,

      fetchPlans: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get('/api/plans');
          const serverPlans = data.data.map((p) => ({ ...p, _id: p._id || p.id }));
          const currentLocalUnsynced = get().plans.filter((p) => p._id && p._id.startsWith('plan-local-'));
          
          // Merge server plans while keeping pending local offline plans
          set({ plans: [...currentLocalUnsynced, ...serverPlans], isLoading: false, isSynced: true });

          // Background sync pending offline plans to server
          if (currentLocalUnsynced.length > 0) {
            for (const localPlan of currentLocalUnsynced) {
              try {
                const { _id, ...planPayload } = localPlan;
                const res = await api.post('/api/plans', planPayload);
                if (res.data) {
                  set((state) => ({
                    plans: state.plans.map((p) => (p._id === _id ? res.data : p)),
                  }));
                }
              } catch (syncErr) {
                // Keep local if still offline
              }
            }
          }
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },


      // Draft management
      setDraftMovie: (movie) =>
        set((state) => ({ draft: { ...state.draft, movie } })),

      setDraftCinema: (cinema) =>
        set((state) => ({
          draft: { ...state.draft, cinema: { ...state.draft.cinema, ...cinema } },
        })),

      setDraftDateTime: (date, time, slotName) =>
        set((state) => ({
          draft: {
            ...state.draft,
            date: date || state.draft.date,
            time: time || state.draft.time,
            slotName: slotName || state.draft.slotName,
          },
        })),

      setDraftShowtime: (showtime) =>
        set((state) => ({
          draft: {
            ...state.draft,
            showtime,
            showtimeId: (showtime && (showtime.id || showtime.showtimeId)) || '',
            time: (showtime && showtime.time) || state.draft.time,
            slotName: (showtime && (showtime.label || showtime.slotName)) || state.draft.slotName,
          },
        })),

      setDraftNotes: ({ notes, seats, bookingRef, snacks }) =>
        set((state) => ({
          draft: {
            ...state.draft,
            notes: notes !== undefined ? notes : state.draft.notes,
            seats: seats !== undefined ? seats : state.draft.seats,
            bookingRef: bookingRef !== undefined ? bookingRef : state.draft.bookingRef,
            snacks: snacks !== undefined ? snacks : state.draft.snacks,
          },
        })),

      toggleDraftFriend: (friend) =>
        set((state) => {
          const exists = state.draft.friends.some((f) => f.name === friend.name);
          return {
            draft: {
              ...state.draft,
              friends: exists
                ? state.draft.friends.filter((f) => f.name !== friend.name)
                : [...state.draft.friends, { ...friend, status: 'invited' }],
            },
          };
        }),

      addDraftFriend: (friend) =>
        set((state) => ({
          draft: { ...state.draft, friends: [...state.draft.friends, friend] },
        })),

      removeDraftFriend: (friendName) =>
        set((state) => ({
          draft: {
            ...state.draft,
            friends: state.draft.friends.filter((f) => f.name !== friendName),
          },
        })),

      resetDraft: () => set({ draft: DEFAULT_DRAFT }),

      addPlan: async (newPlanData) => {
        const tempId = `plan-local-${Date.now()}`;
        const newPlan = {
          _id: tempId,
          createdAt: new Date().toISOString(),
          status: 'upcoming',
          bookingStatus: 'plan',
          ...newPlanData,
        };

        // Optimistic add
        set((state) => ({ plans: [newPlan, ...state.plans] }));

        try {
          const data = await api.post('/api/plans', newPlanData);
          const savedPlan = data.data;
          set((state) => ({
            plans: state.plans.map((p) => (p._id === tempId ? savedPlan : p)),
          }));
          return savedPlan;
        } catch (error) {
          if (error.isNetworkError) {
            return newPlan; // Offline — keep local version
          }
          set((state) => ({
            plans: state.plans.filter((p) => p._id !== tempId),
          }));
          throw error;
        }
      },

      updatePlanStatus: async (planId, status) => {
        set((state) => ({
          plans: state.plans.map((p) => (p._id === planId ? { ...p, status } : p)),
        }));

        if (!planId.startsWith('plan-local-')) {
          try {
            await api.put(`/api/plans/${planId}`, { status });
          } catch (error) {
            console.warn('Plan status update failed:', error.message);
          }
        }
      },

      deletePlan: async (planId) => {
        const previous = get().plans;
        set((state) => ({ plans: state.plans.filter((p) => p._id !== planId) }));

        if (!planId.startsWith('plan-local-')) {
          try {
            await api.delete(`/api/plans/${planId}`);
          } catch (error) {
            if (!error.isNetworkError) {
              set({ plans: previous });
            }
          }
        }
      },

      getPlanById: (planId) => get().plans.find((p) => p._id === planId),

      clearPlans: () => set({ plans: [], isSynced: false }),
    }),
    {
      name: 'cinetrip-planner-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ plans: state.plans, draft: state.draft }),
    }
  )
);

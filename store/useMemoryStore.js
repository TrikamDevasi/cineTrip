import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const useMemoryStore = create(
  persist(
    (set, get) => ({
      memories: [],
      isLoading: false,
      error: null,
      page: 1,
      hasNextPage: false,
      total: 0,
      isSynced: false, // true once we've successfully fetched from backend

      /**
       * Fetch memories from backend (authenticated users)
       * Falls back to local state if backend is unavailable
       */
      fetchMemories: async (pageNum = 1) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get(`/api/memories?page=${pageNum}&limit=20`);
          const memories = data.data.map((m) => ({
            ...m,
            _id: m._id || m.id,
          }));

          if (pageNum === 1) {
            set({
              memories,
              page: 1,
              hasNextPage: data.hasNextPage,
              total: data.total,
              isLoading: false,
              isSynced: true,
            });
          } else {
            set((state) => ({
              memories: [...state.memories, ...memories],
              page: pageNum,
              hasNextPage: data.hasNextPage,
              total: data.total,
              isLoading: false,
            }));
          }
        } catch (error) {
          // Network error — keep existing local state
          set({ isLoading: false, error: error.message });
        }
      },

      loadNextPage: () => {
        const { page, hasNextPage, isLoading, fetchMemories } = get();
        if (!isLoading && hasNextPage) {
          fetchMemories(page + 1);
        }
      },

      /**
       * Add memory — optimistically updates local state, then syncs to backend
       */
      addMemory: async (memoryData) => {
        const tempId = `mem-local-${Date.now()}`;
        const newMemory = {
          _id: tempId,
          createdAt: new Date().toISOString(),
          ...memoryData,
        };

        // Optimistic add
        set((state) => ({ memories: [newMemory, ...state.memories] }));

        try {
          const data = await api.post('/api/memories', memoryData);
          const savedMemory = { ...data.data, _id: data.data._id };
          // Replace temp entry with real backend entry
          set((state) => ({
            memories: state.memories.map((m) =>
              m._id === tempId ? savedMemory : m
            ),
          }));
          return { success: true, memory: savedMemory };
        } catch (error) {
          if (error.isNetworkError) {
            // Keep local version with temp ID for offline use
            return { success: true, memory: newMemory, offline: true };
          }
          // Roll back optimistic add on backend error
          set((state) => ({
            memories: state.memories.filter((m) => m._id !== tempId),
          }));
          return { success: false, error: error.message };
        }
      },

      /**
       * Delete memory from backend and local state
       */
      deleteMemory: async (memoryId) => {
        // Optimistic remove
        const previous = get().memories;
        set((state) => ({
          memories: state.memories.filter((m) => m._id !== memoryId),
        }));

        // Only call backend if it's a real (non-local-only) ID
        if (!memoryId.startsWith('mem-local-')) {
          try {
            await api.delete(`/api/memories/${memoryId}`);
            return { success: true };
          } catch (error) {
            if (!error.isNetworkError) {
              // Rollback on backend rejection
              set({ memories: previous });
              return { success: false, error: error.message };
            }
          }
        }
        return { success: true };
      },

      /**
       * Update memory
       */
      updateMemory: async (memoryId, updatedData) => {
        const previous = get().memories;
        set((state) => ({
          memories: state.memories.map((m) =>
            m._id === memoryId ? { ...m, ...updatedData } : m
          ),
        }));

        if (!memoryId.startsWith('mem-local-')) {
          try {
            const data = await api.put(`/api/memories/${memoryId}`, updatedData);
            set((state) => ({
              memories: state.memories.map((m) =>
                m._id === memoryId ? data.data : m
              ),
            }));
            return { success: true };
          } catch (error) {
            set({ memories: previous });
            return { success: false, error: error.message };
          }
        }
        return { success: true };
      },

      clearMemories: () => set({ memories: [], isSynced: false, page: 1, hasNextPage: false }),
    }),
    {
      name: 'cinetrip-memories-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the memories array — not loading/error state
      partialize: (state) => ({ memories: state.memories }),
    }
  )
);

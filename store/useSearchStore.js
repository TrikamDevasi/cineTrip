import { create } from "zustand";

const useSearchStore = create((set) => ({
  query: "",
  setQuery: (q) => set({ query: q }),
}));

export default useSearchStore;

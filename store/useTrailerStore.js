import { create } from "zustand";

const useTrailerStore = create((set) => ({
  videoKey: null,
  openTrailer: (key) => set({ videoKey: key }),
  closeTrailer: () => set({ videoKey: null }),
}));

export default useTrailerStore;

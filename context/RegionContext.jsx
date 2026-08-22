"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { REGIONS } from "@/components/RegionSwitcher";

// Build a Set of valid codes from the single source of truth in RegionSwitcher
const VALID_REGION_CODES = new Set(REGIONS.map((r) => r.code));
const DEFAULT_REGION = "IN";

const RegionContext = createContext({ region: DEFAULT_REGION, setRegion: () => {} });

export function RegionProvider({ children }) {
  const [region, setRegionState] = useState(DEFAULT_REGION);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cinephiles-region");
      if (saved && VALID_REGION_CODES.has(saved)) {
        setRegionState(saved);
      }
    } catch {
      // localStorage unavailable (SSR, private browsing with strict settings)
    }
  }, []);

  function setRegion(r) {
    // Only accept codes from the validated list — unknown codes fall back to default
    const validated = VALID_REGION_CODES.has(r) ? r : DEFAULT_REGION;
    setRegionState(validated);
    try {
      localStorage.setItem("cinephiles-region", validated);
    } catch {
      // Ignore write failures
    }
  }

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export const useRegion = () => useContext(RegionContext);

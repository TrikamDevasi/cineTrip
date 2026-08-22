"use client";
import { Globe } from "lucide-react";
import { useRegion } from "@/context/RegionContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * All TMDB-supported regions exposed in the switcher.
 * To add more, append to this list — validation is in RegionContext.
 */
export const REGIONS = [
  { code: "IN", label: "India",          flag: "🇮🇳" },
  { code: "US", label: "United States",  flag: "🇺🇸" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", label: "Australia",      flag: "🇦🇺" },
  { code: "CA", label: "Canada",         flag: "🇨🇦" },
  { code: "DE", label: "Germany",        flag: "🇩🇪" },
  { code: "FR", label: "France",         flag: "🇫🇷" },
  { code: "JP", label: "Japan",          flag: "🇯🇵" },
  { code: "KR", label: "South Korea",    flag: "🇰🇷" },
  { code: "SG", label: "Singapore",      flag: "🇸🇬" },
  { code: "AE", label: "UAE",            flag: "🇦🇪" },
  { code: "BR", label: "Brazil",         flag: "🇧🇷" },
  { code: "MX", label: "Mexico",         flag: "🇲🇽" },
];

export default function RegionSwitcher() {
  const { region, setRegion } = useRegion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSwitch = (code) => {
    setRegion(code);

    // Update the URL so server components (like the homepage) can re-fetch with the new region
    const params = new URLSearchParams(searchParams);
    params.set("region", code);
    router.push(`${pathname}?${params.toString()}`);
  };

  const current = REGIONS.find((r) => r.code === region);

  return (
    <div className="region-switcher-wrapper">
      <Globe size={14} className="region-globe-icon" />
      <span className="region-label">MARKET:</span>

      {/* Native select for accessible multi-region support */}
      <select
        className="region-select"
        value={region}
        onChange={(e) => handleSwitch(e.target.value)}
        aria-label="Select market region"
        style={{
          background: "var(--color-surface-2)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-pill)",
          color: "var(--color-text-primary)",
          fontSize: "0.75rem",
          fontWeight: 600,
          fontFamily: "inherit",
          padding: "4px 28px 4px 10px",
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          minHeight: "auto",
          minWidth: "auto",
        }}
      >
        {REGIONS.map(({ code, flag, label }) => (
          <option key={code} value={code}>
            {flag} {label}
          </option>
        ))}
      </select>
    </div>
  );
}

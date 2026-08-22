const TRAKT_BASE = "https://api.trakt.tv";

const TRAKT_HEADERS = {
  "Content-Type": "application/json",
  "trakt-api-key": process.env.TRAKT_CLIENT_ID,
  "trakt-api-version": "2",
  "User-Agent": "CinephilesWatch/1.0",
};

async function fetchTrakt(endpoint, params = "") {
  try {
    const res = await fetch(`${TRAKT_BASE}${endpoint}${params}`, {
      headers: TRAKT_HEADERS,
      next: { revalidate: 3600 }, // ISR cache — 1 hour
    });
    if (!res.ok) {
      console.error(`Trakt ${res.status} on ${endpoint}`);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.error(`Trakt fetch failed for ${endpoint}:`, error.message);
    return null;
  }
}

// ── Public movie endpoints (no OAuth needed) ──
export const getTraktTrending    = () => fetchTrakt("/movies/trending",    "?limit=20&extended=full");
export const getTraktPopular     = () => fetchTrakt("/movies/popular",     "?limit=20&extended=full");
export const getTraktAnticipated = () => fetchTrakt("/movies/anticipated", "?limit=20&extended=full");
export const getTraktBoxOffice   = () => fetchTrakt("/movies/boxoffice",   "?extended=full");
export const getTraktRelated     = (id) => fetchTrakt(`/movies/${id}/related`,  "?limit=12&extended=full");
export const getTraktRatings     = (id) => fetchTrakt(`/movies/${id}/ratings`);
export const getTraktStats       = (id) => fetchTrakt(`/movies/${id}/stats`);

// Bridge: resolve TMDB ID → Trakt slug/ID
export async function getTraktIdFromTMDB(tmdbId) {
  const data = await fetchTrakt(`/search/tmdb/${tmdbId}`, "?type=movie");
  return data?.[0]?.movie?.ids ?? null;
}

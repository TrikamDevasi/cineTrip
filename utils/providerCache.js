// utils/providerCache.js
// Session-level cache for TMDB watch providers

const providerCache = {};

/**
 * Fetch watch providers for a movie (cached per session)
 * Providers are OPTIONAL data — failures must NOT break pages
 *
 * @param {number} movieId - TMDB movie ID
 * @param {string} region - Country code (default: IN)
 * @param {string} apiKey - TMDB API key
 * @returns {Object} { streaming, rent, buy }
 */
export async function getProviders(movieId, region = "IN", apiKey) {
  const key = `${movieId}_${region}`;

  // Return from cache if exists
  if (providerCache[key]) {
    return providerCache[key];
  }

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${apiKey}`,
      { cache: "no-store" }
    );

    // ⛔ Guard: TMDB may return 404 / reset connection
    if (!res.ok) {
      const empty = { streaming: [], rent: [], buy: [] };
      providerCache[key] = empty;
      return empty;
    }

    const data = await res.json();
    const result = data.results?.[region] || {};

    const payload = {
      streaming: result.flatrate || [],
      rent: result.rent || [],
      buy: result.buy || [],
    };

    providerCache[key] = payload;
    return payload;
  } catch {
    // 🔕 SILENT FAIL (network errors like ECONNRESET are expected)
    const empty = { streaming: [], rent: [], buy: [] };
    providerCache[key] = empty;
    return empty;
  }
}

/**
 * Optional helper to clear cache (debug only)
 */
export function clearProviderCache() {
  Object.keys(providerCache).forEach((k) => delete providerCache[k]);
}

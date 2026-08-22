import https from "https";

// Reuse TCP connections — prevents ECONNRESET from connection thrashing
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 10,
});

const TMDB_BASE = "https://api.themoviedb.org/3";

// TMDB_API_TOKEN is server-only (no NEXT_PUBLIC_ prefix) — never bundled to the client.
// If you only have an API key (not a Bearer token), set TMDB_API_KEY in .env.local.
// Client components must call an internal /api/tmdb/* route — never TMDB directly.
const TMDB_API_TOKEN = process.env.TMDB_API_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_TOKEN && !TMDB_API_KEY) {
  // Warn at startup rather than throwing so the build doesn't fail in CI
  console.warn(
    "[TMDB] Neither TMDB_API_TOKEN nor TMDB_API_KEY is set. " +
    "TMDB requests will fail. Add one of these to .env.local."
  );
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options });
      if (res.ok) return res;
      // Don't retry 404 — item genuinely doesn't exist
      if (res.status === 404) return res;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      const isLast = i === retries - 1;
      if (isLast) throw err;
      const delay = (i + 1) * 1000;
      console.warn(
        `[TMDB] Attempt ${i + 1} failed (${err.message}), retrying in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function fetchTMDB(endpoint, params = {}, revalidateSec = 3600) {
  const url = new URL(`${TMDB_BASE}${endpoint}`);

  const headers = {
    Accept: "application/json",
  };

  if (TMDB_API_TOKEN) {
    headers.Authorization = `Bearer ${TMDB_API_TOKEN}`;
  } else if (TMDB_API_KEY) {
    url.searchParams.set("api_key", TMDB_API_KEY);
  } else {
    throw new Error(
      "No TMDB credentials found. Set TMDB_API_TOKEN (preferred) or TMDB_API_KEY in .env.local."
    );
  }

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      url.searchParams.set(k, String(v));
    }
  });

  const res = await fetchWithRetry(url.toString(), {
    headers,
    next: { revalidate: revalidateSec },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`TMDB ${res.status} on ${endpoint}`);
  }
  return res.json();
}

// Movies
export const getTrending = (page = 1) => fetchTMDB("/trending/movie/week", { page });
export const getPopular = (page = 1) => fetchTMDB("/movie/popular", { page });
export const getTopRated = (page = 1) => fetchTMDB("/movie/top_rated", { page });
export const getUpcoming = (page = 1) => fetchTMDB("/movie/upcoming", { page });
export const getNowPlaying = (page = 1) => fetchTMDB("/movie/now_playing", { page });

export const getMovieDetails = (id) =>
  fetchTMDB(`/movie/${id}`, {
    append_to_response: "videos,credits,similar,recommendations,watch/providers,release_dates",
  });

export const getMovieWatchProviders = (id) => fetchTMDB(`/movie/${id}/watch/providers`);
export const getMovieCredits = (id) => fetchTMDB(`/movie/${id}/credits`);
export const getSimilarMovies = (id) => fetchTMDB(`/movie/${id}/similar`);
export const getMovieRecommendations = (id) => fetchTMDB(`/movie/${id}/recommendations`);

// TV Series
export const getTrendingSeries = (page = 1) => fetchTMDB("/trending/tv/week", { page });
export const getPopularSeries = (page = 1) => fetchTMDB("/tv/popular", { page });
export const getTopRatedSeries = (page = 1) => fetchTMDB("/tv/top_rated", { page });
export const getOnTheAirSeries = (page = 1) => fetchTMDB("/tv/on_the_air", { page });

export const getSeriesDetails = (id) =>
  fetchTMDB(`/tv/${id}`, {
    append_to_response: "videos,credits,similar,recommendations,watch/providers,aggregate_credits",
  });

// Person (Cast / Crew / Director)
export const getPersonDetails = (id) =>
  fetchTMDB(`/person/${id}`, {
    append_to_response: "movie_credits,tv_credits,combined_credits,external_ids,images",
  });

// Search & Discover
export const searchMovies = (q, page = 1) => fetchTMDB("/search/movie", { query: q, page });
export const searchSeries = (q, page = 1) => fetchTMDB("/search/tv", { query: q, page });
export const searchPerson = (q, page = 1) => fetchTMDB("/search/person", { query: q, page });
export const multiSearch = (q, page = 1) => fetchTMDB("/search/multi", { query: q, page });

export const discoverMovies = (params = {}) => fetchTMDB("/discover/movie", params);
export const discoverSeries = (params = {}) => fetchTMDB("/discover/tv", params);

// Genres & Configuration
export const getMovieGenres = () => fetchTMDB("/genre/movie/list");
export const getSeriesGenres = () => fetchTMDB("/genre/tv/list");

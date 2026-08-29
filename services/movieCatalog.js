import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNowPlayingMovies } from './tmdb';
import APP_CONFIG from '../constants/config';

/**
 * Verifiable "currently in theatres" movie catalog.
 *
 * The source of truth for theatrical eligibility is the live TMDB
 * /movie/now_playing list. It is fetched on demand, cached locally with a
 * timestamp, and never substituted with hardcoded movies. When the list
 * cannot be verified (no API key, offline, no cached copy) the catalog is
 * empty and NO movie is bookable — the UI surfaces an honest empty state.
 */

const CACHE_KEY = 'cinetrip:now-playing-catalog.v1';

const emptySnapshot = () => ({
  movies: [],
  ids: new Set(),
  fetchedAt: null, // epoch ms of the data served (live or cached)
  isLive: false, // served from a fresh TMDB response
  isCached: false, // served from the local cache because live fetch failed
  isStale: false, // cached data is older than the freshness window
  error: null,
  loading: false,
  hasData: false,
  dataSource: null, // 'LIVE' | 'CACHED' | null
});

let state = emptySnapshot();
let inFlight = null;

function makeSnapshot(overrides = {}) {
  const next = {
    movies: state.movies,
    ids: state.ids,
    fetchedAt: state.fetchedAt,
    isLive: state.isLive,
    isCached: state.isCached,
    isStale: state.isStale,
    error: state.error,
    loading: state.loading,
  };
  const finalState = { ...next, ...overrides };
  return {
    ...finalState,
    hasData: finalState.movies.length > 0,
    dataSource: finalState.isLive ? 'LIVE' : finalState.isCached ? 'CACHED' : null,
  };
}

function isFresh(fetchedAt) {
  return Boolean(fetchedAt) && Date.now() - fetchedAt < APP_CONFIG.NOW_PLAYING_CACHE_TTL_MS;
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.movies) || !parsed.fetchedAt) return null;
    return { movies: parsed.movies, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

async function writeCache(movies, fetchedAt) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ movies, fetchedAt }));
  } catch {
    // Cache is best-effort.
  }
}

function dedupeByTmdbId(movies) {
  const seen = new Set();
  const unique = [];
  for (const m of movies) {
    const id = Number(m && m.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    unique.push(m);
  }
  return unique;
}

async function doLoad() {
  state = { ...state, loading: true, error: null };
  try {
    const pages = await Promise.all(
      Array.from({ length: APP_CONFIG.NOW_PLAYING_PAGES }, (_, i) => getNowPlayingMovies(i + 1))
    );
    const movies = dedupeByTmdbId(pages.flat().filter(Boolean));

    if (movies.length === 0) {
      // Live endpoint empty (unconfigured key, region, or API failure) —
      // fall back to a previous successfully fetched snapshot.
      const cached = await readCache();
      if (cached && cached.movies.length > 0) {
        state = {
          ...state,
          movies: cached.movies,
          ids: new Set(cached.movies.map((m) => Number(m.id))),
          fetchedAt: cached.fetchedAt,
          isLive: false,
          isCached: true,
          isStale: !isFresh(cached.fetchedAt),
          loading: false,
        };
        return makeSnapshot();
      }
      state = { ...state, loading: false, movies: [], ids: new Set(), hasData: false };
      return makeSnapshot();
    }

    const fetchedAt = Date.now();
    state = {
      movies,
      ids: new Set(movies.map((m) => Number(m.id))),
      fetchedAt,
      isLive: true,
      isCached: false,
      isStale: false,
      error: null,
      loading: false,
    };
    writeCache(movies, fetchedAt);
    return makeSnapshot();
  } catch (err) {
    const cached = await readCache();
    if (cached && cached.movies.length > 0) {
      state = {
        ...state,
        movies: cached.movies,
        ids: new Set(cached.movies.map((m) => Number(m.id))),
        fetchedAt: cached.fetchedAt,
        isLive: false,
        isCached: true,
        isStale: !isFresh(cached.fetchedAt),
        error: err.message,
        loading: false,
      };
    } else {
      state = { ...state, error: err.message, loading: false, movies: [], ids: new Set() };
    }
    return makeSnapshot();
  }
}

function refreshIfStale(snapshot) {
  if (snapshot.hasData && snapshot.fetchedAt && !isFresh(snapshot.fetchedAt) && !snapshot.loading && !inFlight) {
    inFlight = doLoad().finally(() => {
      inFlight = null;
    });
  }
  return snapshot;
}

/**
 * Ensure the now-playing catalog is loaded.
 * Returns the current snapshot; resolves immediately if data is fresh.
 */
export async function ensureNowPlayingLoaded({ forceRefresh = false } = {}) {
  const snapshot = makeSnapshot();
  if (forceRefresh) return doLoad();
  if (snapshot.loading) return snapshot;
  if (snapshot.hasData) return refreshIfStale(snapshot);
  if (inFlight) return inFlight;
  inFlight = doLoad().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export function getNowPlayingSnapshot() {
  return makeSnapshot();
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Compute the theatrical availability for a single movie.
 *
 * @returns {{ status: 'NOW_PLAYING'|'UPCOMING'|'NOT_PLAYING'|'DISCOVERABLE'|'UNKNOWN', canBook: boolean, label: string }}
 */
export function getMovieAvailability(movie) {
  const id = toNumber(movie && movie.id);
  const snapshot = makeSnapshot();

  if (!id || !snapshot.hasData) {
    return {
      status: 'UNKNOWN',
      canBook: false,
      label: 'Availability not verified',
    };
  }

  if (snapshot.ids.has(id)) {
    return { status: 'NOW_PLAYING', canBook: true, label: 'In Theatres' };
  }

  // A release date in the future means it has not opened yet.
  const releaseDate = movie.release_date ? new Date(`${movie.release_date}T00:00:00`) : null;
  if (releaseDate && !Number.isNaN(releaseDate.getTime()) && releaseDate >= startOfToday()) {
    return { status: 'UPCOMING', canBook: false, label: 'Coming Soon' };
  }

  // Released but NOT in the live now-playing set → not verified as currently
  // playing. Never present these as bookable.
  if (releaseDate && !Number.isNaN(releaseDate.getTime())) {
    return { status: 'NOT_PLAYING', canBook: false, label: 'Not currently playing' };
  }

  return { status: 'DISCOVERABLE', canBook: false, label: 'Browse only' };
}

export function isMovieNowPlaying(movie) {
  const snapshot = makeSnapshot();
  if (!snapshot.hasData) return false;
  const id = toNumber(movie && movie.id);
  return id ? snapshot.ids.has(id) : false;
}
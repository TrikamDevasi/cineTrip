/**
 * Central app configuration.
 *
 * DEMO_MODE gates all sample / simulated data (fallback movie catalog,
 * sample theatres, simulated showtimes & seat maps) behind an explicit flag.
 * In a normal (`DEMO_MODE=false`) build the app presents ONLY data it can
 * verify from a real source: live TMDB "now playing" for movies, and a real
 * cinema/showtime provider for theatres. If no provider is configured, the UI
 * truthfully explains that live showtimes aren't available yet instead of
 * fabricating them.
 */
const APP_CONFIG = {
  /** When true, sample/demo data is enabled for development builds. */
  DEMO_MODE: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',

  /**
   * Cinema & showtime provider. Valid values:
   *  - 'none' (default): NoopCinemaProvider — no live theatres/showtimes.
   *    UI explains live ticketing is unavailable rather than faking data.
   *  - 'mock' / 'demo': MockCinemaProvider — simulated data, only honored
   *    while DEMO_MODE is also enabled.
   * Real providers (e.g. 'vista', 'fandango') plug in via
   * services/cinema/index.js when an integration is added.
   */
  CINEMA_PROVIDER: (process.env.EXPO_PUBLIC_CINEMA_PROVIDER || 'none').toLowerCase(),

  /** How long a successfully fetched "now playing" list is considered fresh. */
  NOW_PLAYING_CACHE_TTL_MS: 12 * 60 * 60 * 1000,

  /** Number of TMDB /movie/now_playing pages to fetch for the catalog. */
  NOW_PLAYING_PAGES: 3,
};

export default APP_CONFIG;
import APP_CONFIG from '../../constants/config';
import { noopCinemaProvider } from './noopCinemaProvider';
import { mockCinemaProvider } from './mockCinemaProvider';
import { overpassCinemaProvider } from './overpassCinemaProvider';

/**
 * Provider resolution:
 *  - DEMO_MODE enabled  → MockCinemaProvider (simulated data for development).
 *  - Otherwise          → the real provider named by EXPO_PUBLIC_CINEMA_PROVIDER,
 *                          or NoopCinemaProvider when none is configured.
 *
 * Real providers (e.g. 'vista', 'fandango') are registered here when an
 * integration is added. The app never fabricates theatre/showtime data in
 * production — it reports an explicit "unavailable" state instead.
 */
function resolveProvider() {
  const provider = APP_CONFIG.CINEMA_PROVIDER;
  if (APP_CONFIG.DEMO_MODE && (provider === 'none' || provider === 'mock' || provider === 'demo')) {
    return mockCinemaProvider;
  }
  if (provider === 'osm' || provider === 'overpass') {
    return overpassCinemaProvider;
  }
  // Future real providers:
  // if (provider === 'vista') return vistaCinemaProvider;
  return noopCinemaProvider;
}

const cinemaService = resolveProvider();

/**
 * Look up a single cinema by id from the provider's verified nearby set.
 * Never fabricates a cinema — returns null if the provider cannot supply it,
 * if it isn't found within range, or if a live lookup fails.
 */
cinemaService.getCinemaById = async function getCinemaById(cinemaId, location) {
  if (!cinemaId) return null;
  try {
    // Prefer a coords-provided lookup; fall back to provider default.
    const list = await this.getNearbyCinemas(location);
    if (!Array.isArray(list)) return null;
    return list.find((c) => String(c.id) === String(cinemaId)) || null;
  } catch {
    return null;
  }
};

export { cinemaService };
export default cinemaService;
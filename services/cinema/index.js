import APP_CONFIG from '../../constants/config';
import { noopCinemaProvider } from './noopCinemaProvider';
import { mockCinemaProvider } from './mockCinemaProvider';

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
  // Future real providers:
  // if (provider === 'vista') return vistaCinemaProvider;
  return noopCinemaProvider;
}

const cinemaService = resolveProvider();

export { cinemaService };
export default cinemaService;
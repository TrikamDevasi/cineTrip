import { mockCinemaProvider } from './mockCinemaProvider';

// In future enterprise deployments, switch to LiveCinemaProvider (e.g. Vista / Fandango API)
export const cinemaService = mockCinemaProvider;
export default cinemaService;

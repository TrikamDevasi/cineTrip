import { CinemaProvider } from './cinemaProvider';

/**
 * Default cinema provider used when no live ticketing/showtime provider is
 * configured (and DEMO_MODE is off). It deliberately returns NO data and marks
 * itself unavailable so the UI can truthfully explain that live showtimes
 * require a connected provider — instead of fabricating theatres/showtimes.
 */
export class NoopCinemaProvider extends CinemaProvider {
  constructor() {
    super();
    this.dataSource = 'UNAVAILABLE';
    this.isLiveSource = false;
    this.isConfigured = false;
    this.isProviderAvailable = false;
    this.sourceLabel = 'No live ticketing provider connected';
    this.unavailableReason =
      'Live showtimes are not available for this location yet. Connect a ticketing provider to see real cinemas, showtimes and seats.';
  }

  async getNearbyCinemas() {
    return [];
  }

  async getShowtimes() {
    return [];
  }

  async getSeatMap() {
    return null;
  }

  async createBooking() {
    return {
      success: false,
      status: 'unavailable',
      message: this.unavailableReason,
    };
  }

  async getBookingStatus() {
    return { status: 'unavailable' };
  }
}

export const noopCinemaProvider = new NoopCinemaProvider();
export default noopCinemaProvider;
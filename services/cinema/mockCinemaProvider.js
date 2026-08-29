import { CinemaProvider } from './cinemaProvider';
import { SAMPLE_CINEMAS, getDistanceKm } from '../location';

export class MockCinemaProvider extends CinemaProvider {
  constructor() {
    super();
    this.dataSource = 'REGIONAL SCHEDULE';
    this.isLiveSource = false;
    this.sourceLabel = 'Regional Theater Schedule (Sample)';
    this.isProviderAvailable = true;
    this.capabilities = {
      cinemas: true,
      showtimes: true,
      seats: true,
      booking: true,
    };
  }

  async getNearbyCinemas(location) {
    if (!location || !location.latitude || !location.longitude) {
      return SAMPLE_CINEMAS;
    }

    return SAMPLE_CINEMAS.map((cinema, idx) => {
      // Approximate realistic distance based on user coordinates
      const mockLat = location.latitude + (idx === 0 ? 0.015 : idx === 1 ? -0.022 : 0.035);
      const mockLng = location.longitude + (idx === 0 ? -0.012 : idx === 1 ? 0.018 : -0.025);
      const dist = getDistanceKm(location.latitude, location.longitude, mockLat, mockLng);

      return {
        ...cinema,
        latitude: mockLat,
        longitude: mockLng,
        distance: `${dist} km`,
        distanceKm: parseFloat(dist),
      };
    });
  }

  async getShowtimes(movieId, cinemaId, date) {
    // Generate realistic time slots with availability metadata
    return [
      {
        id: 'slot-1',
        time: '11:00 AM',
        label: 'Morning Matinee',
        badge: 'Save 20%',
        format: 'IMAX Laser 3D',
        availableSeats: 48,
        totalSeats: 64,
        isSimulated: true,
      },
      {
        id: 'slot-2',
        time: '03:30 PM',
        label: 'Afternoon Show',
        badge: 'Filling Fast',
        format: 'IMAX Laser 3D',
        availableSeats: 22,
        totalSeats: 64,
        isSimulated: true,
      },
      {
        id: 'slot-3',
        time: '07:30 PM',
        label: 'Prime Evening',
        badge: 'Recommended',
        format: 'IMAX Laser 3D',
        availableSeats: 14,
        totalSeats: 64,
        isSimulated: true,
      },
      {
        id: 'slot-4',
        time: '10:45 PM',
        label: 'Late Night Owl',
        badge: 'Atmospheric',
        format: 'IMAX Laser 3D',
        availableSeats: 39,
        totalSeats: 64,
        isSimulated: true,
      },
    ];
  }

  async getSeatMap(showtimeId) {
    return {
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      seatsPerRow: 8,
      occupiedSeats: ['F4', 'F5', 'E3', 'D6'],
      primeRows: ['E', 'F'],
      reclinerRows: ['D'],
      isLiveAvailability: false,
    };
  }

  async createBooking(bookingPayload) {
    return {
      success: true,
      bookingRef: `CT-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'confirmed',
      dataSource: 'USER CREATED',
      issuedAt: new Date().toISOString(),
    };
  }

  async getBookingStatus(bookingRef) {
    return {
      bookingRef,
      status: 'valid',
      verified: true,
    };
  }
}

export const mockCinemaProvider = new MockCinemaProvider();

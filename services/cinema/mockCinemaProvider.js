import { CinemaProvider } from './cinemaProvider';
import { SAMPLE_CINEMAS, getDistanceKm } from '../location';

/**
 * Demo-only simulated cinema data backing. All output here is fabricated for
 * development and is gated behind DEMO_MODE. Showtimes, prices and seat maps
 * are derived deterministically from (movie, cinema, date) + a per-showtime
 * seed so the same selection yields a stable, realistic-looking schedule.
 */

const DEFAULT_ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const DEFAULT_SEATS_PER_ROW = 8;
const PRIME_ROWS = ['E', 'F', 'G'];
const RECLINER_ROWS = ['D'];

const FORMATS_BY_CINEMA = {
  'cinema-1': 'IMAX Laser 3D',
  'cinema-2': 'Dolby Vision + Atmos',
  'cinema-3': 'PVR Gold Class 4K',
  'cinema-4': '4DX Immersive Motion',
  'cinema-5': 'ScreenX Multi-Projection',
};

const BASE_PRICES = {
  'cinema-1': 420,
  'cinema-2': 390,
  'cinema-3': 540,
  'cinema-4': 460,
  'cinema-5': 350,
};

const SHOWTIME_TEMPLATES = [
  { time: '10:10 AM', label: 'Early Bird', badge: 'Save 25%', priceFactor: 0.7, occupancyBias: 0.3 },
  { time: '12:45 PM', label: 'Midday Matinee', badge: null, priceFactor: 0.85, occupancyBias: 0.4 },
  { time: '03:30 PM', label: 'Afternoon Show', badge: 'Filling Fast', priceFactor: 1.0, occupancyBias: 0.65 },
  { time: '06:15 PM', label: 'Prime Evening', badge: 'Recommended', priceFactor: 1.0, occupancyBias: 0.7 },
  { time: '08:45 PM', label: 'Evening Blockbuster', badge: 'Houseful Soon', priceFactor: 1.15, occupancyBias: 0.85 },
  { time: '11:00 PM', label: 'Late Night Owl', badge: 'Atmospheric', priceFactor: 0.9, occupancyBias: 0.35 },
];

// Deterministic PRNG so schedules are stable for a given key.
function seededRandom(seed) {
  let s = Math.abs(Math.floor(seed)) % 2147483647;
  if (s <= 0) s = 987654321;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function cinemaSeed(cinemaId) {
  const digits = String(cinemaId).replace(/\D/g, '');
  const n = Number(digits) || 1;
  return (n * 7919) + String(cinemaId).length * 31;
}

function selectedTemplates(cinemaId, movieId, date, maxCount) {
  const seed = cinemaSeed(cinemaId) + Number(movieId || 0) * 17 + (date ? date.split('-').join('').length : 7);
  const rnd = seededRandom(seed);
  // Pick a stable-but-varied subset of the showtime templates (3-5 slots).
  const count = 3 + Math.floor(rnd() * 3);
  const indices = [...SHOWTIME_TEMPLATES.keys()]
    .sort(() => rnd() - 0.5)
    .slice(0, Math.min(count, maxCount || SHOWTIME_TEMPLATES.length))
    .sort((a, b) => a - b);
  return indices.map((i) => SHOWTIME_TEMPLATES[i]);
}

function occupiedSeatsFor(showtimeId) {
  const rnd = seededRandom(showtimeId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
  const total = DEFAULT_ROWS.length * DEFAULT_SEATS_PER_ROW;
  // 15%-55% of the auditorium occupied, dotting the grid pseudo-randomly.
  const count = Math.round(total * (0.15 + rnd() * 0.4));
  const occupied = new Set();
  while (occupied.size < count) {
    const row = DEFAULT_ROWS[Math.floor(rnd() * DEFAULT_ROWS.length)];
    const seat = 1 + Math.floor(rnd() * DEFAULT_SEATS_PER_ROW);
    occupied.add(`${row}${seat}`);
  }
  return [...occupied];
}

function makeSlot(template, cinemaId, index, seed) {
  const basePrice = BASE_PRICES[cinemaId] || 400;
  const price = Math.round((basePrice * template.priceFactor) / 10) * 10;
  const total = DEFAULT_ROWS.length * DEFAULT_SEATS_PER_ROW;
  const occupiedCount = Math.round(total * template.occupancyBias * (0.8 + seededRandom(seed)() * 0.4));
  const id = `slot-${cinemaId.split('-')[1]}-${index}-${seed}`;
  return {
    id,
    time: template.time,
    label: template.label,
    badge: template.badge,
    format: FORMATS_BY_CINEMA[cinemaId] || 'Standard 2D',
    price,
    availableSeats: total - occupiedCount,
    totalSeats: total,
    isSimulated: true,
  };
}

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
    if (!cinemaId) return [];
    const templates = selectedTemplates(cinemaId, movieId, date);
    const seed = String(cinemaId).split('-')[1] || 1;
    return templates.map((t, idx) => makeSlot(t, cinemaId, idx + 1, seed * 100 + idx));
  }

  async getSeatMap(showtimeId) {
    if (!showtimeId) {
      return {
        rows: DEFAULT_ROWS,
        seatsPerRow: DEFAULT_SEATS_PER_ROW,
        occupiedSeats: ['F4', 'F5', 'E3', 'D6'],
        primeRows: PRIME_ROWS,
        reclinerRows: RECLINER_ROWS,
        isLiveAvailability: false,
      };
    }
    return {
      rows: DEFAULT_ROWS,
      seatsPerRow: DEFAULT_SEATS_PER_ROW,
      occupiedSeats: occupiedSeatsFor(showtimeId),
      primeRows: PRIME_ROWS,
      reclinerRows: RECLINER_ROWS,
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
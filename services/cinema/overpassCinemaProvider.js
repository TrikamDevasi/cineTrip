import { CinemaProvider } from './cinemaProvider';

/**
 * OverpassCinemaProvider
 *
 * Fetches REAL nearby cinemas from the OpenStreetMap Overpass API.
 * - No API key required
 * - Completely free
 * - Global coverage (especially strong in India)
 * - Returns real cinema names, addresses, and coordinates
 *
 * Showtimes and seat maps are NOT available from OSM — those require a
 * dedicated ticketing API. This provider sets capabilities accordingly.
 */

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const DEFAULT_RADIUS_METERS = 10000; // 10 km radius

/**
 * Build an Overpass QL query for cinemas near a coordinate.
 */
function buildQuery(lat, lon, radiusM = DEFAULT_RADIUS_METERS) {
  return `
[out:json][timeout:25];
(
  node["amenity"="cinema"](around:${radiusM},${lat},${lon});
  way["amenity"="cinema"](around:${radiusM},${lat},${lon});
  relation["amenity"="cinema"](around:${radiusM},${lat},${lon});
);
out center;
`.trim();
}

/**
 * Extract human-readable address from OSM tags.
 */
function buildAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
  if (tags['addr:street']) parts.push(tags['addr:street']);
  if (tags['addr:suburb'] || tags['addr:quarter']) parts.push(tags['addr:suburb'] || tags['addr:quarter']);
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (parts.length > 0) return parts.join(', ');
  if (tags['addr:full']) return tags['addr:full'];
  return null;
}

/**
 * Normalize an Overpass element (node/way/relation) into a CineTrip cinema object.
 */
function normalizeElement(el, index) {
  const tags = el.tags || {};
  const lat = el.type === 'node' ? el.lat : el.center?.lat;
  const lon = el.type === 'node' ? el.lon : el.center?.lon;

  if (!lat || !lon) return null;

  const name = tags.name || tags['name:en'] || `Cinema ${index + 1}`;
  const address = buildAddress(tags) || tags.description || 'Address not listed';
  const screenType = tags['cinema:type'] || tags['screen_type'] || tags['imax'] === 'yes' ? 'IMAX' : '4DX' === tags['screen:4dx'] ? '4DX' : 'Standard';
  const website = tags.website || tags['contact:website'] || null;
  const phone = tags.phone || tags['contact:phone'] || null;
  const openingHours = tags.opening_hours || null;
  const operator = tags.operator || null;

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    address,
    latitude: lat,
    longitude: lon,
    screenType: typeof screenType === 'string' ? screenType : 'Standard',
    website,
    phone,
    openingHours,
    operator,
    dataSource: 'OSM',
    // Showtimes/seats require a separate ticketing API — not from OSM
    hasLiveShowtimes: false,
    hasLiveSeats: false,
  };
}

export class OverpassCinemaProvider extends CinemaProvider {
  constructor() {
    super();
    this.dataSource = 'LIVE';
    this.isLiveSource = true;
    this.isProviderAvailable = true;
    this.sourceLabel = 'OpenStreetMap Venues';
    this.capabilities = {
      cinemas: true,      // ✅ Real cinema locations from OSM
      showtimes: false,   // ❌ OSM does not have showtimes
      seats: false,       // ❌ OSM does not have seat data
      booking: false,     // ❌ OSM does not support bookings
    };
    this._cache = null;
    this._cacheKey = null;
    this._cacheTs = 0;
    this._CACHE_TTL_MS = 10 * 60 * 1000; // 10 minute cache
  }

  /**
   * Fetch nearby cinemas from Overpass API.
   * Tries multiple endpoints for resilience.
   */
  async getNearbyCinemas(location) {
    if (!location || !location.latitude || !location.longitude) {
      return [];
    }

    const { latitude: lat, longitude: lon } = location;
    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;

    // Return cache if fresh and for the same location
    if (this._cache && this._cacheKey === cacheKey && Date.now() - this._cacheTs < this._CACHE_TTL_MS) {
      return this._cache;
    }

    const query = buildQuery(lat, lon);
    const body = `data=${encodeURIComponent(query)}`;

    let lastError = null;
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CineTripApp/1.0',
            'Accept': 'application/json'
          },
          body,
          signal: AbortSignal.timeout ? AbortSignal.timeout(20000) : undefined,
        });

        if (!response.ok) {
          throw new Error(`Overpass HTTP ${response.status}`);
        }

        const data = await response.json();
        const elements = data.elements || [];

        const cinemas = elements
          .map((el, idx) => normalizeElement(el, idx))
          .filter(Boolean);

        // Cache the result
        this._cache = cinemas;
        this._cacheKey = cacheKey;
        this._cacheTs = Date.now();

        return cinemas;
      } catch (err) {
        lastError = err;
        console.warn(`[Overpass] Endpoint ${endpoint} failed:`, err.message);
      }
    }

    console.error('[Overpass] All endpoints failed:', lastError?.message);
    return [];
  }

  /**
   * Showtimes are not available from OSM.
   * Returns empty array with a clear indicator.
   */
  async getShowtimes(movieId, cinemaId, date) {
    return [];
  }

  /**
   * Seat maps are not available from OSM.
   */
  async getSeatMap(showtimeId) {
    return null;
  }

  /**
   * Booking is not supported via OSM.
   */
  async createBooking(bookingPayload) {
    throw new Error('Booking is not supported by the OpenStreetMap provider. Connect a ticketing API to enable bookings.');
  }

  async getBookingStatus(bookingRef) {
    return { bookingRef, status: 'unknown', verified: false };
  }
}

export const overpassCinemaProvider = new OverpassCinemaProvider();

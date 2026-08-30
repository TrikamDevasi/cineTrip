import * as Location from 'expo-location';

/**
 * DEMO-ONLY sample theatres used by MockCinemaProvider when DEMO_MODE is
 * enabled. These are fabricated (names, addresses, distances) and must never
 * be rendered as real theatres in production flows.
 */
export const SAMPLE_CINEMAS = [
  {
    id: 'cinema-1',
    name: 'PVR INOX IMAX with Laser',
    brand: 'IMAX',
    screenType: 'IMAX Laser 3D',
    address: 'Phoenix Palladium, Lower Parel',
    city: 'Mumbai',
    distanceKm: 2.4,
    rating: 4.9,
    sound: '12-Channel IMAX Audio',
    seating: 'Luxury Recliners',
  },
  {
    id: 'cinema-2',
    name: 'Dolby Cinema at AMC CityCenter',
    brand: 'Dolby',
    screenType: 'Dolby Vision + Atmos',
    address: 'Metro Hub 4th Floor',
    city: 'Mumbai',
    distanceKm: 4.1,
    rating: 4.8,
    sound: 'Dolby Atmos 64-Channel',
    seating: 'Signature Power Plush',
  },
  {
    id: 'cinema-3',
    name: 'PVR Director\'s Cut',
    brand: 'PVR',
    screenType: 'PVR Gold Class 4K',
    address: 'Grand Hyatt Plaza, BKC',
    city: 'Mumbai',
    distanceKm: 6.8,
    rating: 4.9,
    sound: 'Meyer Sound EXP',
    seating: 'Full Recliner & Gourmet Service',
  },
  {
    id: 'cinema-4',
    name: 'Cinepolis 4DX & VIP Lounge',
    brand: '4DX',
    screenType: '4DX Immersive Motion',
    address: 'Viviana Mall, Level 3',
    city: 'Mumbai',
    distanceKm: 8.5,
    rating: 4.7,
    sound: 'JBL Line Array',
    seating: 'Motion & Environmental FX',
  },
  {
    id: 'cinema-5',
    name: 'Regal ScreenX 270° Panoramic',
    brand: 'Regal',
    screenType: 'ScreenX Multi-Projection',
    address: 'Infinity Mall, Andheri West',
    city: 'Mumbai',
    distanceKm: 11.2,
    rating: 4.6,
    sound: 'Dolby 7.1 Surround',
    seating: 'Stadium Ergonomic',
  },
];

/**
 * Resolve the user's current city and coordinates.
 * Returns location facts only — cinema discovery is delegated to the cinema
 * provider so no fabricated theatres/distance ever reach production.
 */
export async function getCurrentCity() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { city: null, coordinates: null, permissionGranted: false };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let city = null;
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        city = reverse[0].city || reverse[0].subregion || reverse[0].name || null;
      }
    } catch (e) {
      console.warn('Reverse geocode warning:', e.message);
    }

    return {
      city,
      coordinates: location.coords,
      permissionGranted: true,
    };
  } catch (error) {
    console.warn('Location service error:', error.message);
    return { city: null, coordinates: null, permissionGranted: false };
  }
}

/**
 * Get the last known device location without requesting fresh GPS fix.
 * Faster but may be stale.
 */
export async function getLastKnownLocation() {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getLastKnownPositionAsync({});
    return pos?.coords || null;
  } catch {
    return null;
  }
}

/**
 * Watch device location with automatic subscription management.
 * Always call the returned unsubscribe() when done to prevent memory leaks.
 *
 * @param {Function} onUpdate - Callback receiving coords
 * @returns {Function} unsubscribe - Call this in useEffect cleanup
 */
export async function watchLocation(onUpdate) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted for watching');
      return () => {};
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 15,
      },
      (pos) => {
        if (onUpdate) onUpdate(pos.coords);
      }
    );

    // Return cleanup function
    return () => subscription.remove();
  } catch (error) {
    console.warn('watchLocation error:', error.message);
    return () => {};
  }
}

/**
 * Reverse geocode coordinates to a human-readable address string.
 */
export async function reverseGeocode(coords) {
  try {
    const results = await Location.reverseGeocodeAsync(coords);
    if (results && results.length > 0) {
      const r = results[0];
      return [r.street, r.district || r.subregion, r.city].filter(Boolean).join(', ')
        || r.name
        || 'Unknown Location';
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Geocode a free-text place/address query into coordinates using the
 * OpenStreetMap Nominatim public API. No API key required; works on web and
 * native. Returns { latitude, longitude, label } or null when nothing is found.
 */
export async function geocodeAddress(query) {
  if (!query || !query.trim()) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query.trim())}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CineTrip (React Native Expo app)' },
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;
    const hit = results[0];
    const latitude = parseFloat(hit.lat);
    const longitude = parseFloat(hit.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return {
      latitude,
      longitude,
      label: hit.display_name || query.trim(),
    };
  } catch (e) {
    console.warn('Geocode error:', e.message);
    return null;
  }
}

/**
 * Calculate distance in km between two lat/lng coordinates (Haversine formula).
 * Returns null when coordinates are missing — never a fabricated value.
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d.toFixed(1);
}


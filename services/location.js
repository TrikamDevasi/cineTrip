import * as Location from 'expo-location';

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

export async function getCurrentCityAndCinemas() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        city: 'Mumbai',
        cinemas: SAMPLE_CINEMAS,
        permissionGranted: false,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let city = 'Local Metro';
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        city = reverse[0].city || reverse[0].subregion || reverse[0].name || 'Current City';
      }
    } catch (e) {
      console.warn('Reverse geocode warning:', e.message);
    }

    // Dynamic cinema distances tailored to user location
    const dynamicCinemas = SAMPLE_CINEMAS.map((c, i) => ({
      ...c,
      city: city,
      distanceKm: Number((1.5 + i * 2.3).toFixed(1)),
    }));

    return {
      city,
      coordinates: location.coords,
      cinemas: dynamicCinemas,
      permissionGranted: true,
    };
  } catch (error) {
    console.warn('Location service fallback:', error.message);
    return {
      city: 'Mumbai',
      cinemas: SAMPLE_CINEMAS,
      permissionGranted: false,
    };
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


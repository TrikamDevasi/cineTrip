import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

/**
 * Reusable location hook with:
 * - permission handling
 * - current position
 * - live watching with cleanup
 * - last known position
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const subscriptionRef = useRef(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Location permission denied.');
        setIsLoading(false);
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(pos.coords);

      // Reverse geocode
      try {
        const [geo] = await Location.reverseGeocodeAsync(pos.coords);
        if (geo) {
          const addr = [geo.street, geo.district || geo.subregion, geo.city]
            .filter(Boolean)
            .join(', ');
          setAddress(addr || geo.name || 'Current Location');
        }
      } catch {}

      setIsLoading(false);
      return pos.coords;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  }, [requestPermission]);

  const getLastKnownLocation = useCallback(async () => {
    try {
      const pos = await Location.getLastKnownPositionAsync();
      return pos?.coords || null;
    } catch {
      return null;
    }
  }, []);

  const startWatching = useCallback(async (onUpdate) => {
    const granted = await requestPermission();
    if (!granted) return;

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
    }

    setIsWatching(true);
    subscriptionRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 5000, distanceInterval: 10 },
      (pos) => {
        setLocation(pos.coords);
        if (onUpdate) onUpdate(pos.coords);
      }
    );
  }, [requestPermission]);

  const stopWatching = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsWatching(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  return {
    location,
    address,
    permissionStatus,
    isLoading,
    error,
    isWatching,
    requestPermission,
    getCurrentLocation,
    getLastKnownLocation,
    startWatching,
    stopWatching,
  };
};

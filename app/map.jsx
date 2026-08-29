import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  MapPin,
  LocateFixed,
  Navigation,
  ChevronRight,
  ArrowLeft,
  Ticket,
  AlertTriangle,
  Compass,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import FormatBadge from '../components/FormatBadge';
import EmptyState from '../components/ui/EmptyState';
import { useLocation } from '../hooks/useLocation';
import { cinemaService } from '../services/cinema';
import { getDistanceKm } from '../services/location';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { usePlannerStore } from '../store/usePlannerStore';
import APP_CONFIG from '../constants/config';

let MapView, Marker;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch {
  MapView = null;
}

export default function MapScreen() {
  const router = useRouter();
  const setDraftCinema = usePlannerStore((s) => s.setDraftCinema);
  const { location: deviceCoords, getCurrentLocation, getLastKnownLocation, permissionStatus } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [bypassLocation, setBypassLocation] = useState(false);
  const [highlightedCinema, setHighlightedCinema] = useState(null);
  const mapRef = useRef(null);

  const providerAvailable = Boolean(cinemaService.isProviderAvailable);
  const isDemo = APP_CONFIG.DEMO_MODE;

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    setCinemaLoading(true);
    let coords = await getCurrentLocation();
    if (!coords) {
      coords = await getLastKnownLocation();
    }

    if (!coords) {
      setLocationDenied(true);
      setCinemaLoading(false);
      return;
    }

    setLocationDenied(false);
    setSelectedLocation(coords);
    await fetchNearbyTheaters(coords);
  };

  const fetchNearbyTheaters = async (coords) => {
    setCinemaLoading(true);
    try {
      const list = await cinemaService.getNearbyCinemas(coords);
      
      // Calculate distances dynamically and sort from closest to furthest
      const processed = (Array.isArray(list) ? list : [])
        .map((cinema) => {
          if (cinema.latitude && cinema.longitude && coords) {
            const dist = getDistanceKm(coords.latitude, coords.longitude, cinema.latitude, cinema.longitude);
            return {
              ...cinema,
              distanceKm: dist ? parseFloat(dist) : null,
            };
          }
          return cinema;
        })
        .filter((cinema) => cinema.latitude != null && cinema.longitude != null)
        .sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });

      setCinemas(processed);
    } catch (e) {
      console.warn('Failed to load cinemas:', e.message);
      setCinemas([]);
    } finally {
      setCinemaLoading(false);
    }
  };

  const handleRetryLocation = async () => {
    setLocationDenied(false);
    initLocation();
  };

  const handleBypassLocation = () => {
    setBypassLocation(true);
    setSelectedLocation({ latitude: 19.076, longitude: 72.8777 }); // Default preview coordinates
    fetchNearbyTheaters({ latitude: 19.076, longitude: 72.8777 });
  };

  const handleGoToMyLocation = () => {
    if (deviceCoords) {
      setSelectedLocation(deviceCoords);
      if (mapRef.current && Platform.OS !== 'web') {
        try {
          mapRef.current.animateToRegion({
            latitude: deviceCoords.latitude,
            longitude: deviceCoords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }, 800);
        } catch (err) {
          console.warn('Map focus error:', err.message);
        }
      }
    } else {
      initLocation();
    }
  };

  const handleSelectCinemaForTrip = (cinema) => {
    setDraftCinema(cinema);
    router.push('/(tabs)/planner');
  };

  const handleFocusCinemaOnMap = (cinema) => {
    setHighlightedCinema(cinema);
    if (mapRef.current && Platform.OS !== 'web') {
      try {
        mapRef.current.animateToRegion({
          latitude: cinema.latitude,
          longitude: cinema.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 600);
      } catch (err) {
        console.warn('Map zoom to cinema error:', err.message);
      }
    }
  };

  // Construct standard maps preview URL for Web platform
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const activeLat = selectedLocation?.latitude || 19.076;
  const activeLon = selectedLocation?.longitude || 72.8777;

  // OpenStreetMap embed coordinates bounding box
  const bbox = `${activeLon - 0.01},${activeLat - 0.01},${activeLon + 0.01},${activeLat + 0.01}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${activeLat},${activeLon}`;
  const embedUrl = googleMapsApiKey 
    ? `https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=cinema&center=${activeLat},${activeLon}&zoom=14`
    : osmEmbedUrl;

  // Show Location Permission Denied Overlay
  if (locationDenied && !bypassLocation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon="ArrowLeft" variant="surface" onPress={() => router.back()} />
          <Text style={styles.headerTitle}>Auditorium Locator</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.errorIconCircle}>
            <AlertTriangle size={32} color={COLORS.warning} />
          </View>
          <Text style={styles.errorHeading}>Location access is required</Text>
          <Text style={styles.errorDescription}>
            CineTrip uses your device GPS to locate nearby independent theaters, verify screening formats, and calculate accurate distances.
          </Text>
          <View style={styles.errorActionCol}>
            <Button
              title="Enable Location Services"
              icon="LocateFixed"
              variant="primary"
              onPress={handleRetryLocation}
              style={{ width: '100%', marginBottom: SPACING.sm }}
            />
            <Button
              title="Browse Without Location"
              icon="Compass"
              variant="surface"
              onPress={handleBypassLocation}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <IconButton icon="ArrowLeft" variant="surface" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Auditorium Locator</Text>
        <IconButton icon="LocateFixed" variant="surface" onPress={handleGoToMyLocation} />
      </View>

      {/* Map Split Layout */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            style={styles.webMapFrame}
            allowFullScreen
            loading="lazy"
            title="Interactive Map Display"
          />
        ) : MapView ? (
          <MapView
            ref={mapRef}
            style={styles.nativeMap}
            initialRegion={{
              latitude: activeLat,
              longitude: activeLon,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Your Location"
                pinColor={COLORS.primary}
              />
            )}
            {cinemas.map((c) => (
              <Marker
                key={c.id}
                coordinate={{ latitude: c.latitude, longitude: c.longitude }}
                title={c.name}
                description={c.address}
                pinColor={highlightedCinema?.id === c.id ? COLORS.primary : COLORS.accentCyan}
                onPress={() => setHighlightedCinema(c)}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.radarFallback}>
            <MapPin size={40} color={COLORS.primary} />
            <Text style={styles.radarText}>Radar searching for nearby Auditoriums...</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet Cinema List */}
      <ScrollView
        style={styles.sheetScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetContent}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeading}>
            {isDemo ? 'SAMPLE THEATRES (DEMO MODE)' : 'VERIFIED THEATRES NEARBY'}
          </Text>
          {isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO</Text>
            </View>
          )}
        </View>

        {cinemaLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Fetching theater metadata...</Text>
          </View>
        ) : cinemas.length === 0 ? (
          <EmptyState
            icon="MapPin"
            title="No verified cinemas found nearby"
            description="We couldn't locate any active partner cinemas in this area. Switch to Demo Mode or search another location."
            actionLabel="Try Again"
            actionIcon="RefreshCw"
            onAction={initLocation}
          />
        ) : (
          cinemas.map((cinema) => {
            const isHighlighted = highlightedCinema?.id === cinema.id;
            return (
              <TouchableOpacity
                key={cinema.id}
                style={[
                  styles.cinemaCard,
                  isHighlighted && styles.highlightedCard,
                ]}
                activeOpacity={0.9}
                onPress={() => handleFocusCinemaOnMap(cinema)}
              >
                <View style={styles.cardTop}>
                  <View style={styles.titleCol}>
                    <Text style={styles.cinemaName}>{cinema.name}</Text>
                    <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                  </View>
                  {cinema.distanceKm != null && (
                    <Text style={styles.distanceBadge}>{cinema.distanceKm.toFixed(1)} km</Text>
                  )}
                </View>

                <View style={styles.formatRow}>
                  {cinema.screenType ? (
                    <FormatBadge format={cinema.screenType} size="small" />
                  ) : null}
                  {cinema.features && cinema.features[0] ? (
                    <FormatBadge format={cinema.features[0]} size="small" />
                  ) : null}
                </View>

                <View style={styles.actionRow}>
                  <Button
                    title="Plan Movie Night Here"
                    icon="Ticket"
                    variant={isHighlighted ? 'primary' : 'surface'}
                    size="sm"
                    onPress={() => handleSelectCinemaForTrip(cinema)}
                  />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  errorHeading: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  errorActionCol: {
    width: '100%',
    maxWidth: 320,
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#07090e',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  webMapFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  nativeMap: {
    width: '100%',
    height: '100%',
  },
  radarFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sheetHeading: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  demoBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  demoBadgeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    color: COLORS.primary,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  cinemaCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  highlightedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardElevated,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cinemaName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  actionRow: {
    marginTop: SPACING.xs,
    alignItems: 'flex-start',
  },
});

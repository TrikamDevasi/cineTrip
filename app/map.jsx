import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import FormatBadge from '../components/FormatBadge';
import EmptyState from '../components/ui/EmptyState';
import { useLocation } from '../hooks/useLocation';
import { cinemaService } from '../services/cinema';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { usePlannerStore } from '../store/usePlannerStore';

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
  const { location, getCurrentLocation, getLastKnownLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const mapRef = useRef(null);
  const providerAvailable = Boolean(cinemaService.isProviderAvailable);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    let coords = await getCurrentLocation();
    if (!coords) {
      coords = await getLastKnownLocation();
    }
    // Default fallback to Mumbai center if no coordinates
    if (!coords) {
      coords = { latitude: 19.076, longitude: 72.8777 };
    }
    setSelectedLocation(coords);
    if (mapRef.current && Platform.OS !== 'web') {
      try {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      } catch (err) {
        console.warn('Map animation error:', err.message);
      }
    }
    loadCinemas(coords);
  };

  const loadCinemas = async (coords) => {
    if (!providerAvailable) {
      setCinemas([]);
      setCinemaLoading(false);
      return;
    }
    setCinemaLoading(true);
    try {
      const list = await cinemaService.getNearbyCinemas(coords);
      setCinemas(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('Failed to load cinemas:', e.message);
      setCinemas([]);
    } finally {
      setCinemaLoading(false);
    }
  };

  const handleGoToMyLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setSelectedLocation(coords);
      if (mapRef.current && Platform.OS !== 'web') {
        try {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 800);
        } catch (err) {
          console.warn('Map center error:', err.message);
        }
      }
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    const q = text.toLowerCase();
    const results = cinemas.filter(
      (c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)
    );
    setSearchResults(results);
  };

  const handleSelectSearchResult = (result) => {
    setSearchQuery(result.name);
    setSearchResults([]);
    setSelectedLocation({ latitude: result.latitude, longitude: result.longitude });
    setSelectedAddress(result.address);
    if (mapRef.current && Platform.OS !== 'web') {
      try {
        mapRef.current.animateToRegion({
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 600);
      } catch (err) {
        console.warn('Map zoom error:', err.message);
      }
    }
  };

  const handleSelectCinemaForTrip = (cinema) => {
    setDraftCinema(cinema);
    router.push('/(tabs)/planner');
  };

  // Construct iframe embed source URL for Web platform
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const lat = selectedLocation?.latitude || 19.076;
  const lon = selectedLocation?.longitude || 72.8777;
  const mapCenter = `${lat},${lon}`;
  const queryParam = searchQuery ? encodeURIComponent(searchQuery) : 'cinema';
  
  // Calculate bounding box for OpenStreetMap fallback embed
  const bbox = `${lon - 0.015},${lat - 0.015},${lon + 0.015},${lat + 0.015}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  
  const embedUrl = googleMapsApiKey ? `https://www.google.com/maps/embed/v1/search?key=${googleMapsApiKey}&q=${queryParam}&center=${mapCenter}&zoom=13` : osmEmbedUrl;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Auditorium Locator</Text>
        <IconButton
          icon="LocateFixed"
          variant="surface"
          onPress={handleGoToMyLocation}
          accessibilityLabel="Center on current location"
        />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.primary} strokeWidth={2.2} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search IMAX & certified theaters..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X size={16} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsDropdown}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <MapPin size={16} color={COLORS.primary} strokeWidth={2} />
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Interactive Map Visual Section */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            style={styles.webMapFrame}
            allowFullScreen
            loading="lazy"
            title="Google Maps Locator"
          />
        ) : MapView ? (
          <MapView
            ref={mapRef}
            style={styles.nativeMap}
            initialRegion={{
              latitude: selectedLocation?.latitude || 19.076,
              longitude: selectedLocation?.longitude || 72.8777,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
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
                pinColor={COLORS.accentCyan}
              />
            ))}
          </MapView>
        ) : (
          // Elegant placeholder radar locator if Maps failed to initialize on Native
          <View style={styles.radarFallback}>
            <MapPin size={40} color={COLORS.primary} strokeWidth={1.5} style={styles.pulseRadar} />
            <Text style={styles.radarText}>Radar searching for nearby Auditoriums...</Text>
            {selectedLocation && (
              <Text style={styles.coordsText}>
                Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Cinema Auditoriums List */}
      <ScrollView
        style={styles.cinemaListScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.cinemaListContent}
      >
        <Text style={styles.listHeading}>
          {providerAvailable ? 'VERIFIED THEATRES NEARBY' : 'THEATRE LISTINGS'}
        </Text>

        {cinemaLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Loading verified theatres…</Text>
          </View>
        ) : !cinemas.length ? (
          <EmptyState
            icon="MapPin"
            title="Live theatres aren't connected yet"
            description={
              providerAvailable
                ? 'No verified cinemas were returned for your area.'
                : 'CineTrip requires a cinema partner integration to display live auditoriums and showtimes in your area.'
            }
            actionLabel="Browse Movies"
            actionIcon="Compass"
            onAction={() => router.push('/(tabs)/discover')}
          />
        ) : (
          cinemas.map((cinema) => (
            <View key={cinema.id} style={styles.cinemaCard}>
              <View style={styles.cinemaCardHeader}>
                <View style={styles.cinemaTitleCol}>
                  <Text style={styles.cinemaName}>{cinema.name}</Text>
                  <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                </View>
                {cinema.distanceKm != null && (
                  <Text style={styles.distanceBadge}>{cinema.distanceKm} km</Text>
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

              <View style={styles.cardActionRow}>
                <Button
                  title="Plan Movie Night Here"
                  icon="Ticket"
                  variant="primary"
                  size="sm"
                  onPress={() => handleSelectCinemaForTrip(cinema)}
                  accessibilityLabel={`Plan movie night at ${cinema.name}`}
                />
              </View>
            </View>
          ))
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
  searchSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  searchResultsDropdown: {
    position: 'absolute',
    top: 48,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.xs,
    ...SHADOWS.modal,
    zIndex: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  searchResultName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  searchResultAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapContainer: {
    height: 260,
    backgroundColor: '#0d0f14',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
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
    padding: SPACING.lg,
  },
  pulseRadar: {
    marginBottom: SPACING.sm,
    opacity: 0.85,
  },
  radarText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  coordsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  cinemaListScroll: {
    flex: 1,
  },
  cinemaListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  listHeading: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
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
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cinemaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cinemaTitleCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cinemaName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: 2,
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  distanceBadge: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.sm,
  },
  cardActionRow: {
    marginTop: SPACING.xs,
    alignItems: 'flex-start',
  },
});

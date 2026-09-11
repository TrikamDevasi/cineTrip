import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../lib/alert';
import {
  Search,
  X,
  MapPin,
  AlertTriangle,
  List,
  Map,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import FormatBadge from '../components/FormatBadge';
import EmptyState from '../components/ui/EmptyState';
import { useLocation } from '../hooks/useLocation';
import { cinemaService } from '../services/cinema';
import { getDistanceKm, geocodeAddress } from '../services/location';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { usePlannerStore } from '../store/usePlannerStore';
import APP_CONFIG from '../constants/config';
import { goBack } from '../lib/navigation';

export default function MapScreen() {
  const { colors } = useTheme();
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
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
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

  const focusMapOnCoords = (coords, zoom = 15) => {
    if (mapRef.current && Platform.OS !== 'web') {
      try {
        mapRef.current.injectJavaScript(
          `if (window.focusLocation) { window.focusLocation(${coords.latitude}, ${coords.longitude}, ${zoom}); } true;`
        );
      } catch (err) {
        console.warn('Map focus error:', err.message);
      }
    }
  };

  const handleAddressSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    const result = await geocodeAddress(query);
    if (!result) {
      showAlert('Location not found', `We couldn't find "${searchQuery}". Try a city, landmark, or full address.`);
      return;
    }

    const coords = { latitude: result.latitude, longitude: result.longitude };
    setLocationDenied(false);
    setBypassLocation(false);
    setSelectedLocation(coords);
    focusMapOnCoords(coords);
    await fetchNearbyTheaters(coords);
  };

  const handleGoToMyLocation = () => {
    if (deviceCoords) {
      setSelectedLocation(deviceCoords);
      focusMapOnCoords(deviceCoords);
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
        mapRef.current.injectJavaScript(
          `if (window.selectCinema) { window.selectCinema('${cinema.id}'); } true;`
        );
      } catch (err) {
        console.warn('Map zoom to cinema error:', err.message);
      }
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_CINEMA') {
        const found = cinemas.find((c) => String(c.id) === String(data.id));
        if (found) {
          setHighlightedCinema(found);
        }
      }
    } catch {
      // ignore non-JSON messages
    }
  };

  // Support web iframe message reception
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleWebMessage = (e) => {
        try {
          const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data && data.type === 'SELECT_CINEMA') {
            const found = cinemas.find((c) => String(c.id) === String(data.id));
            if (found) setHighlightedCinema(found);
          }
        } catch {}
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, [cinemas]);

  const activeLat = selectedLocation?.latitude || 19.076;
  const activeLon = selectedLocation?.longitude || 72.8777;

  // Always use OpenStreetMap embed on web — zero-cost, no API key required.
  const bbox = `${activeLon - 0.01},${activeLat - 0.01},${activeLon + 0.01},${activeLat + 0.01}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${activeLat},${activeLon}`;

  const leafletHtml = useMemo(
    () => generateLeafletHtml(activeLat, activeLon, cinemas, highlightedCinema?.id),
    [activeLat, activeLon, cinemas, highlightedCinema?.id]
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Show Location Permission Denied Overlay
  if (locationDenied && !bypassLocation) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <IconButton icon="ArrowLeft" variant="surface" onPress={() => goBack(router, '/(tabs)')} />
          <Text style={styles.headerTitle}>Auditorium Locator</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <View style={styles.errorIconCircle}>
            <AlertTriangle size={32} color={colors.warning} />
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
        <IconButton icon="ArrowLeft" variant="surface" onPress={() => goBack(router, '/(tabs)')} />
        <Text style={styles.headerTitle}>Auditorium Locator</Text>
        <IconButton icon="LocateFixed" variant="surface" onPress={handleGoToMyLocation} />
      </View>

      {/* Address Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search an address, city, or landmark..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={handleAddressSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Map / List Toggle */}
      <View style={styles.viewToggleRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'map' }}
            accessibilityLabel="Show map view"
          >
            <Map size={15} color={viewMode === 'map' ? '#07090E' : colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.viewToggleText, viewMode === 'map' && styles.viewToggleTextActive]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.viewToggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: viewMode === 'list' }}
            accessibilityLabel="Show list view"
          >
            <List size={15} color={viewMode === 'list' ? '#07090E' : colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Split Layout */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <iframe
              srcDoc={leafletHtml}
              style={styles.webMapFrame}
              title="Interactive Map Display"
            />
          ) : (
            <WebView
              ref={mapRef}
              style={styles.nativeMap}
              originWhitelist={['*']}
              source={{ html: leafletHtml }}
              onMessage={handleWebViewMessage}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.radarFallback}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.radarText}>Loading interactive map...</Text>
                </View>
              )}
            />
          )}
        </View>
      )}

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
            <ActivityIndicator color={colors.primary} size="large" />
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

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
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
    color: colors.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorDescription: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
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
    borderBottomColor: colors.cardBorder,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    height: 44,
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: colors.text,
    paddingVertical: 0,
  },
  viewToggleRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  viewToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  viewToggleText: {
    ...TYPOGRAPHY.captionBold,
    color: colors.textSecondary,
  },
  viewToggleTextActive: {
    color: '#07090E',
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
    color: colors.textMuted,
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
    color: colors.textMuted,
  },
  demoBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  demoBadgeText: {
    ...TYPOGRAPHY.badge,
    fontSize: 9,
    color: colors.primary,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: SPACING.md,
  },
  cinemaCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  highlightedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.cardElevated,
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
    color: colors.text,
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distanceBadge: {
    ...TYPOGRAPHY.captionBold,
    color: colors.primary,
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

function generateLeafletHtml(lat, lon, cinemaList, selectedCinemaId) {
  const safeCinemaData = JSON.stringify(
    (cinemaList || []).map((c) => ({
      id: String(c.id || ''),
      name: String(c.name || 'Cinema').replace(/'/g, "\\'"),
      address: String(c.address || '').replace(/'/g, "\\'"),
      lat: Number(c.latitude),
      lon: Number(c.longitude),
      screenType: c.screenType || '',
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #07090e; }
    .leaflet-popup-content-wrapper {
      background: #121824;
      color: #f1f5f9;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .leaflet-popup-content { margin: 8px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; }
    .leaflet-popup-tip { background: #121824; }
    .popup-title { font-weight: bold; color: #e5a93c; margin-bottom: 2px; }
    .popup-addr { color: #94a3b8; font-size: 11px; }
    .user-marker {
      width: 16px;
      height: 16px;
      background: #3b82f6;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
    }
    .cinema-pin {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e5a93c;
      color: #000;
      border-radius: 50%;
      border: 2px solid #fff;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
    .cinema-pin.selected {
      background: #22d3ee;
      transform: scale(1.15);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var userIcon = L.divIcon({ className: 'user-marker-container', html: '<div class="user-marker"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
    L.marker([${lat}, ${lon}], { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>');

    var cinemas = ${safeCinemaData};
    var markers = {};
    cinemas.forEach(function(c) {
      if (!c.lat || !c.lon) return;
      var isSel = c.id === '${selectedCinemaId || ''}';
      var pinHtml = '<div class="cinema-pin' + (isSel ? ' selected' : '') + '">🎬</div>';
      var icon = L.divIcon({ className: 'custom-cinema-icon', html: pinHtml, iconSize: [28, 28], iconAnchor: [14, 14] });
      var marker = L.marker([c.lat, c.lon], { icon: icon }).addTo(map);
      marker.bindPopup('<div class="popup-title">' + c.name + '</div><div class="popup-addr">' + c.address + '</div>');
      marker.on('click', function() {
        var payload = JSON.stringify({ type: 'SELECT_CINEMA', id: c.id });
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(payload);
        } else if (window.parent && window.parent !== window) {
          window.parent.postMessage(payload, '*');
        }
      });
      markers[c.id] = marker;
    });

    window.focusLocation = function(targetLat, targetLon, zoom) {
      map.setView([targetLat, targetLon], zoom || 15);
    };

    window.selectCinema = function(id) {
      if (markers[id]) {
        markers[id].openPopup();
        map.panTo(markers[id].getLatLng());
      }
    };
  </script>
</body>
</html>`;
}

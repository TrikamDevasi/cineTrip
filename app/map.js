import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocation } from '../hooks/useLocation';
import { SAMPLE_CINEMAS } from '../services/location';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

// MapView is conditionally imported — requires native dev build
let MapView, Marker, PROVIDER_GOOGLE;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} catch {
  MapView = null;
}

export default function MapScreen() {
  const router = useRouter();
  const { location, address, isLoading, error, getCurrentLocation, getLastKnownLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cinemas, setCinemas] = useState(SAMPLE_CINEMAS);
  const mapRef = useRef(null);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setSelectedLocation(coords);
      // Move map to current location
      if (mapRef.current && coords) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } else {
      // Try last known
      const last = await getLastKnownLocation();
      if (last) setSelectedLocation(last);
    }
  };

  const handleGoToMyLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 800);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter cinemas as search results
    const results = SAMPLE_CINEMAS.filter((c) =>
      c.name.toLowerCase().includes(text.toLowerCase()) ||
      c.address.toLowerCase().includes(text.toLowerCase())
    );
    setSearchResults(results);
  };

  const handleSelectSearchResult = (result) => {
    setSearchQuery(result.name);
    setSelectedAddress(`${result.name}, ${result.address}`);
    setSearchResults([]);
    // For demo, we use a fake offset from user location
    if (location) {
      const fakeCoords = {
        latitude: location.latitude + (Math.random() - 0.5) * 0.02,
        longitude: location.longitude + (Math.random() - 0.5) * 0.02,
      };
      setSelectedLocation(fakeCoords);
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...fakeCoords,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 800);
      }
    }
  };

  const handleSaveLocation = () => {
    if (!selectedLocation) {
      Alert.alert('No Location', 'Please select a location on the map first.');
      return;
    }
    Alert.alert(
      'Location Saved',
      `📍 ${selectedAddress || address || 'Current Location'}\nCoords: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const coordStr = location
    ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
    : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveLocation}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cinemas or places..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <View style={styles.searchDropdown}>
          {searchResults.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={styles.searchResultItem}
              onPress={() => handleSelectSearchResult(r)}
            >
              <Ionicons name="location-outline" size={15} color={COLORS.primary} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{r.name}</Text>
                <Text style={styles.resultAddr}>{r.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Map or Fallback */}
      {isLoading && !location ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : error && !location ? (
        <View style={styles.errorBox}>
          <Ionicons name="location-outline" size={40} color={COLORS.textMuted} />
          <Text style={styles.errorTitle}>Location Unavailable</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={initLocation}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : MapView ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.latitude || 19.076,
              longitude: location?.longitude || 72.877,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={(e) => {
              setSelectedLocation(e.nativeEvent.coordinate);
              setSelectedAddress('');
            }}
          >
            {location && (
              <Marker coordinate={location} title="You are here" pinColor={COLORS.primary} />
            )}
            {selectedLocation && selectedLocation !== location && (
              <Marker coordinate={selectedLocation} title={selectedAddress || 'Selected'} pinColor={COLORS.secondary} />
            )}
            {cinemas.map((c, i) => {
              if (!location) return null;
              const markerCoord = {
                latitude: location.latitude + (i - 2) * 0.008,
                longitude: location.longitude + (i - 2) * 0.012,
              };
              return (
                <Marker
                  key={c.id}
                  coordinate={markerCoord}
                  title={c.name}
                  description={c.screenType}
                  pinColor="#8B5CF6"
                />
              );
            })}
          </MapView>

          {/* My Location Button */}
          <TouchableOpacity style={styles.myLocationBtn} onPress={handleGoToMyLocation}>
            <Ionicons name="locate" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Fallback when react-native-maps is not available */
        <View style={styles.fallbackContainer}>
          <View style={styles.fallbackMap}>
            <MaterialCommunityIcons name="map-marker-radius" size={56} color={COLORS.primary} />
            <Text style={styles.fallbackTitle}>Map View</Text>
            <Text style={styles.fallbackSubtitle}>
              Full map requires a native development build.
              {'\n'}Your current location data:
            </Text>
            {coordStr && (
              <View style={styles.coordBadge}>
                <Ionicons name="navigate" size={14} color={COLORS.primary} />
                <Text style={styles.coordText}>{coordStr}</Text>
              </View>
            )}
            {address && <Text style={styles.addrText}>{address}</Text>}
          </View>
        </View>
      )}

      {/* Location Info Banner */}
      {location && (
        <View style={styles.locationBanner}>
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {selectedAddress || address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
          </Text>
          <TouchableOpacity onPress={handleGoToMyLocation}>
            <Ionicons name="navigate" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Nearby Cinemas List */}
      <ScrollView style={styles.cinemaList} showsVerticalScrollIndicator={false}>
        <Text style={styles.cinemaListTitle}>Nearby Premium Screens</Text>
        {cinemas.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.cinemaItem}
            onPress={() => {
              setSelectedAddress(`${c.name}, ${c.address}`);
              Alert.alert(c.name, `${c.screenType}\n${c.address}\n${c.distanceKm} km away`);
            }}
          >
            <View style={styles.cinemaItemLeft}>
              <Text style={styles.cinemaItemName}>{c.name}</Text>
              <Text style={styles.cinemaItemAddr}>{c.address}</Text>
              <Text style={styles.cinemaItemType}>{c.screenType}</Text>
            </View>
            <View style={styles.cinemaItemRight}>
              <Text style={styles.cinemaDistText}>{c.distanceKm} km</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  saveBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: '#07090E' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg, marginBottom: 6,
    paddingHorizontal: 12, height: 44,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  searchDropdown: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: 4, zIndex: 10,
  },
  searchResultItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderColor: COLORS.cardBorder,
  },
  resultName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  resultAddr: { fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
  loadingBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: { color: COLORS.textSecondary, fontSize: 13 },
  errorBox: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl, gap: 12,
  },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  errorSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  retryText: { fontSize: 13, fontWeight: '700', color: '#07090E' },
  mapContainer: { height: 300, position: 'relative' },
  map: { ...StyleSheet.absoluteFillObject },
  myLocationBtn: {
    position: 'absolute', right: 16, bottom: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.glowCyan,
  },
  fallbackContainer: {
    height: 220,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.backgroundElevated,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  fallbackMap: { alignItems: 'center', padding: SPACING.lg },
  fallbackTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginTop: 8 },
  fallbackSubtitle: {
    fontSize: 12, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4,
  },
  coordBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.xs, marginTop: 8,
  },
  coordText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
  addrText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  locationBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg, marginVertical: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
    gap: 8,
  },
  locationText: { flex: 1, fontSize: 12, color: COLORS.textSecondary },
  cinemaList: { flex: 1, paddingHorizontal: SPACING.lg },
  cinemaListTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', marginVertical: 10 },
  cinemaItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cinemaItemLeft: { flex: 1 },
  cinemaItemName: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  cinemaItemAddr: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  cinemaItemType: { fontSize: 11, color: COLORS.primary, marginTop: 2, fontWeight: '600' },
  cinemaItemRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cinemaDistText: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },
});

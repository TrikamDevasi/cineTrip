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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  MapPin,
  LocateFixed,
  Navigation,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import FormatBadge from '../components/FormatBadge';
import { useLocation } from '../hooks/useLocation';
import { SAMPLE_CINEMAS } from '../services/location';
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
  const { location, address, isLoading, error, getCurrentLocation, getLastKnownLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cinemas] = useState(SAMPLE_CINEMAS);
  const mapRef = useRef(null);

  useEffect(() => {
    initLocation();
  }, []);

  const initLocation = async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setSelectedLocation(coords);
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }
    } else {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Cinema Map & Screens</Text>
        <IconButton
          icon="LocateFixed"
          variant="surface"
          color={COLORS.primary}
          onPress={handleGoToMyLocation}
          accessibilityLabel="Recenter map to my location"
        />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.primary} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search theaters, cities, IMAX..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => { setSearchQuery(''); setSearchResults([]); }}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <X size={16} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {/* Live Search Results Dropdown */}
        {searchResults.length > 0 && (
          <View style={styles.dropdownResults}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => handleSelectSearchResult(item)}
                accessibilityRole="button"
                accessibilityLabel={`Select cinema ${item.name}`}
              >
                <MapPin size={16} color={COLORS.secondary} strokeWidth={2} style={{ marginRight: SPACING.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dropdownTitle}>{item.name}</Text>
                  <Text style={styles.dropdownSub}>{item.address}</Text>
                </View>
                <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Map or Fallback View */}
      <View style={styles.mapContainer}>
        {MapView && location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="My Location"
              pinColor={COLORS.primary}
            />

            {cinemas.map((c, i) => (
              <Marker
                key={c.id}
                coordinate={{
                  latitude: location.latitude + (i === 0 ? 0.01 : i === 1 ? -0.012 : 0.008),
                  longitude: location.longitude + (i === 0 ? -0.008 : i === 1 ? 0.015 : -0.018),
                }}
                title={c.name}
                description={c.screenType}
                pinColor={COLORS.secondary}
              />
            ))}
          </MapView>
        ) : (
          <View style={styles.mapFallback}>
            <MapPin size={48} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.mapFallbackTitle}>Auditorium Locator</Text>
            <Text style={styles.mapFallbackSub}>
              {address ? `Located near ${address}` : 'GPS coordinates resolved. Showing nearby certified auditoriums.'}
            </Text>
          </View>
        )}
      </View>

      {/* Nearby Screens List */}
      <View style={styles.bottomListWrapper}>
        <Text style={styles.bottomListTitle}>NEARBY CERTIFIED SCREENS</Text>
        <ScrollView style={styles.bottomScroll} showsVerticalScrollIndicator={false}>
          {cinemas.map((cinema) => (
            <View key={cinema.id} style={styles.cinemaItem}>
              <View style={styles.cinemaItemLeft}>
                <Text style={styles.cinemaItemName}>{cinema.name}</Text>
                <Text style={styles.cinemaItemAddress}>{cinema.address}</Text>
                <View style={styles.badgeRow}>
                  <FormatBadge format={cinema.screenType || 'IMAX Laser'} size="small" />
                  <Text style={styles.cinemaDistance}>{cinema.distance || '2.4 km away'}</Text>
                </View>
              </View>

              <Button
                title="Plan Here"
                icon="Ticket"
                variant="primary"
                size="sm"
                onPress={() => {
                  setDraftCinema(cinema);
                  router.push('/(tabs)/planner');
                }}
                accessibilityLabel={`Plan movie night at ${cinema.name}`}
              />
            </View>
          ))}
        </ScrollView>
      </View>
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
    borderBottomColor: COLORS.cardBorder,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  clearBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownResults: {
    position: 'absolute',
    top: 56,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    zIndex: 20,
    ...SHADOWS.modal,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dropdownTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  dropdownSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.backgroundElevated,
  },
  mapFallbackTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  mapFallbackSub: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  bottomListWrapper: {
    height: 220,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  bottomListTitle: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  bottomScroll: {
    flex: 1,
  },
  cinemaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cinemaItemLeft: {
    flex: 1,
  },
  cinemaItemName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  cinemaItemAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: SPACING.sm,
  },
  cinemaDistance: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});

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
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 600);
    }
  };

  const handleSelectCinemaForTrip = (cinema) => {
    setDraftCinema(cinema);
    router.push('/(tabs)/planner');
  };

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
  cinemaListScroll: {
    flex: 1,
  },
  cinemaListContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
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

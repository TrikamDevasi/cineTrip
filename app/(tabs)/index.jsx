import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Film, MapPin, ChevronRight, Ticket, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import HeroBanner from '../../components/HeroBanner';
import MovieCard from '../../components/MovieCard';
import TicketCard from '../../components/TicketCard';
import SectionHeader from '../../components/SectionHeader';
import FormatBadge from '../../components/FormatBadge';
import DataSourceBadge from '../../components/DataSourceBadge';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton, CinemaCardSkeleton } from '../../components/ui/Skeleton';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { cinemaService } from '../../services/cinema';
import { getCurrentCity } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [cinemas, setCinemas] = useState([]);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const plans = usePlannerStore((s) => s.plans);
  const nextPlan = plans && plans.length > 0 ? plans[0] : null;
  const updateProfile = usePreferencesStore((s) => s.updateProfile);
  const { snapshot: catalog, refresh: refreshCatalog } = useMovieCatalog();
  const providerAvailable = Boolean(cinemaService.isProviderAvailable);

  const nowPlaying = catalog.movies;
  const loading = catalog.loading || cinemaLoading;

  const loadCinemas = async () => {
    if (!providerAvailable) {
      setCinemas([]);
      setCinemaLoading(false);
      return;
    }
    setCinemaLoading(true);
    try {
      const loc = await getCurrentCity();
      if (loc && loc.city) {
        updateProfile({ city: loc.city });
      }
      const list = await cinemaService.getNearbyCinemas(loc && loc.coordinates);
      setCinemas(Array.isArray(list) ? list : []);
    } catch (e) {
      console.warn('Failed to load cinemas:', e.message);
      setCinemas([]);
    } finally {
      setCinemaLoading(false);
    }
  };

  useEffect(() => {
    loadCinemas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshCatalog(), loadCinemas()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* GROUP 1: SPOTLIGHT HERO PREMIERE */}
        {loading ? (
          <View style={styles.heroSkeletonWrap}>
            <MovieCardSkeleton width="100%" />
          </View>
        ) : (
          <HeroBanner movies={nowPlaying.slice(0, 4)} />
        )}

        {/* ACTIVE UPCOMING TICKET (Conditional) */}
        {nextPlan && (
          <View style={styles.activePlanContainer}>
            <View style={styles.activePlanHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.activePlanTitle}>UPCOMING PASS</Text>
            </View>
            <TicketCard plan={nextPlan} />
          </View>
        )}

        {/* GROUP 2: NOW IN THEATERS CAROUSEL */}
        <SectionHeader
          title="Now in Theaters"
          subtitle={
            !catalog.hasData
              ? 'No verified screenings right now'
              : catalog.isCached
              ? 'Cached from an earlier check — pull to refresh'
              : 'Verified from live movie listings'
          }
          icon="Film"
          actionText={catalog.hasData ? 'See All' : undefined}
          onAction={() => router.push('/(tabs)/discover')}
        />

        <View style={styles.sourceBadgeRow}>
          <DataSourceBadge
            source={catalog.dataSource || 'UNAVAILABLE'}
            label={
              catalog.dataSource
                ? `${catalog.dataSource} — now playing`
                : 'No movie catalog connected'
            }
          />
        </View>

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            <MovieCardSkeleton />
            <MovieCardSkeleton />
            <MovieCardSkeleton />
          </ScrollView>
        ) : nowPlaying.length === 0 ? (
          <EmptyState
            icon="Film"
            title="No Verified Screenings"
            description={
              catalog.error
                ? "We couldn't reach the movie catalog. Check your connection and try again."
                : 'Nothing is verified as currently in theatres right now. Connect a movie catalog (TMDB) to see what is really playing.'
            }
            actionLabel="Retry"
            actionIcon="RefreshCw"
            onAction={() => refreshCatalog()}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={nowPlaying}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => <MovieCard movie={item} />}
          />
        )}

        {/* GROUP 3: PREMIUM SCREENS NEAR YOU */}
        <SectionHeader
          title="Theatres Near You"
          subtitle={
            providerAvailable
              ? 'Verified from your showtime provider'
              : 'Live theatres require a ticketing provider'
          }
          icon="MapPin"
          actionText="Map"
          onAction={() => router.push('/map')}
        />

        {loading ? (
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <CinemaCardSkeleton />
            <CinemaCardSkeleton />
          </View>
        ) : providerAvailable && cinemas.length > 0 ? (
          <View style={styles.cinemaContainer}>
            {cinemas.slice(0, 3).map((cinema) => (
              <TouchableOpacity
                key={cinema.id}
                style={styles.cinemaCard}
                activeOpacity={0.8}
                onPress={() => router.push('/map')}
                accessibilityRole="button"
                accessibilityLabel={`${cinema.name}, format ${cinema.screenType}, located at ${cinema.address}`}
              >
                <View style={styles.cinemaLeft}>
                  <View style={styles.cinemaTitleRow}>
                    <Text style={styles.cinemaName} numberOfLines={1}>
                      {cinema.name}
                    </Text>
                    {cinema.distanceKm != null && (
                      <Text style={styles.distanceBadge}>{cinema.distanceKm} km</Text>
                    )}
                  </View>
                  <Text style={styles.cinemaAddress} numberOfLines={1}>
                    {cinema.address}
                  </Text>
                  <View style={styles.cinemaFormatsRow}>
                    {cinema.screenType ? <FormatBadge format={cinema.screenType} size="small" /> : null}
                    {cinema.features && cinema.features[0] ? (
                      <FormatBadge format={cinema.features[0]} size="small" />
                    ) : null}
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="MapPin"
            title="Live theatres aren't available here yet"
            description="CineTrip needs a ticketing provider for your area to list real cinemas and showtimes. Sample theatres are never shown as real."
            actionLabel="Open Map"
            actionIcon="MapPin"
            onAction={() => router.push('/map')}
          />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  heroSkeletonWrap: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  activePlanContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  activePlanTitle: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sourceBadgeRow: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  cinemaContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  cinemaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  cinemaLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cinemaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cinemaName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  distanceBadge: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  cinemaFormatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
});

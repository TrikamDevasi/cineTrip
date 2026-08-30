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
import { Film, MapPin, ChevronRight, Ticket, Sparkles, Compass, Calendar, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import HeroBanner from '../../components/HeroBanner';
import MovieCard from '../../components/MovieCard';
import TicketCard from '../../components/TicketCard';
import SectionHeader from '../../components/SectionHeader';
import FormatBadge from '../../components/FormatBadge';
import DataSourceBadge from '../../components/DataSourceBadge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton, CinemaCardSkeleton } from '../../components/ui/Skeleton';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { cinemaService } from '../../services/cinema';
import { getCurrentCity } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
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

  const styles = createStyles(colors);

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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* GROUP 1: SPOTLIGHT HERO PREMIERE */}
        {loading ? (
          <View style={styles.heroSkeletonWrap}>
            <MovieCardSkeleton width="100%" />
          </View>
        ) : nowPlaying.length > 0 ? (
          <HeroBanner movies={nowPlaying.slice(0, 4)} />
        ) : null}

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

        {/* GROUP 2: NOW IN THEATERS SECTION */}
        <SectionHeader
          title="Now in Theaters"
          subtitle={
            !catalog.hasData
              ? 'Connect TMDB for live theatrical catalog'
              : catalog.isCached
              ? 'Cached snapshot — pull down to refresh'
              : 'Verified theatrical discovery'
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
                ? `${catalog.dataSource} — movie catalog`
                : 'Live movie metadata unconfigured'
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
          <View style={styles.unconnectedNoticeCard}>
            <View style={styles.noticeIconCircle}>
              <Film size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.noticeTitle}>Live cinema listings aren't connected yet</Text>
            <Text style={styles.noticeDescription}>
              Movie metadata is available via TMDB, but theatre-specific showtimes require a supported cinema provider.
            </Text>
            <View style={styles.noticeActionRow}>
              <Button
                title="Browse Movies"
                icon="Compass"
                variant="primary"
                size="sm"
                onPress={() => router.push('/(tabs)/discover')}
                accessibilityLabel="Browse Movies in Discover"
              />
              <Button
                title="View Upcoming"
                icon="Calendar"
                variant="surface"
                size="sm"
                onPress={() => router.push('/(tabs)/discover')}
                accessibilityLabel="View Upcoming Releases"
              />
            </View>
          </View>
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
              : 'Theatre showtimes require a ticketing provider'
          }
          icon="MapPin"
          actionText="Map"
          onAction={() => router.push('/map')}
        />

        <View style={styles.sourceBadgeRow}>
          <DataSourceBadge
            source={cinemaService.dataSource || 'UNAVAILABLE'}
            label={
              cinemaService.dataSource
                ? `${cinemaService.dataSource} — showtime provider`
                : 'Cinema ticketing provider unconfigured'
            }
          />
        </View>

        {cinemaLoading ? (
          <View style={styles.cinemaSkeletonWrap}>
            <CinemaCardSkeleton />
            <CinemaCardSkeleton />
          </View>
        ) : cinemas.length === 0 ? (
          <View style={styles.unconnectedNoticeCard}>
            <View style={styles.noticeIconCircle}>
              <MapPin size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.noticeTitle}>Live Theatres Not Connected</Text>
            <Text style={styles.noticeDescription}>
              CineTrip requires a cinema partner API integration to display live local auditoriums and showtimes in your city.
            </Text>
            <View style={styles.noticeActionRow}>
              <Button
                title="Explore Map & Locations"
                icon="MapPin"
                variant="surface"
                size="sm"
                onPress={() => router.push('/map')}
                accessibilityLabel="Explore Map"
              />
            </View>
          </View>
        ) : (
          cinemas.slice(0, 3).map((cinema) => (
            <TouchableOpacity
              key={cinema.id}
              style={styles.cinemaCard}
              activeOpacity={0.8}
              onPress={() => {
                usePlannerStore.getState().setDraftCinema(cinema);
                router.push('/(tabs)/planner');
              }}
              accessibilityLabel={`${cinema.name}, format ${cinema.screenType}`}
            >
              <View style={styles.cinemaCardTop}>
                <View style={styles.cinemaInfoCol}>
                  <Text style={styles.cinemaName}>{cinema.name}</Text>
                  <Text style={styles.cinemaAddress}>{cinema.address}</Text>
                </View>
                {cinema.distanceKm != null && (
                  <Text style={styles.distanceText}>{cinema.distanceKm} km</Text>
                )}
              </View>

              <View style={styles.cinemaMetaRow}>
                {cinema.screenType ? <FormatBadge format={cinema.screenType} size="small" /> : null}
                {cinema.features && cinema.features[0] ? (
                  <FormatBadge format={cinema.features[0]} size="small" />
                ) : null}
              </View>
            </TouchableOpacity>
          ))
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  heroSkeletonWrap: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
  },
  activePlanContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  activePlanTitle: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  sourceBadgeRow: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  cinemaSkeletonWrap: {
    paddingHorizontal: SPACING.lg,
  },
  cinemaCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  cinemaCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  cinemaInfoCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cinemaName: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  cinemaAddress: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distanceText: {
    ...TYPOGRAPHY.captionBold,
    color: colors.primary,
  },
  cinemaMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  unconnectedNoticeCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    marginVertical: SPACING.xs,
    ...SHADOWS.card,
  },
  noticeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    marginBottom: SPACING.sm,
  },
  noticeTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  noticeDescription: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: SPACING.md,
  },
  noticeActionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

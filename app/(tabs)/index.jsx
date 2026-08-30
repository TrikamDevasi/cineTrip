import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Film,
  MapPin,
  ChevronRight,
  Ticket,
  Sparkles,
  Compass,
  Calendar,
  Bookmark,
  Camera,
  Clapperboard,
  Star,
  Clock,
  Wand2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import HeroBanner from '../../components/HeroBanner';
import MovieCard from '../../components/MovieCard';
import TicketCard from '../../components/TicketCard';
import MemoryCard from '../../components/MemoryCard';
import SectionHeader from '../../components/SectionHeader';
import FormatBadge from '../../components/FormatBadge';
import DataSourceBadge from '../../components/DataSourceBadge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton, CinemaCardSkeleton, MemoryCardSkeleton } from '../../components/ui/Skeleton';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { getUpcomingMovies } from '../../services/tmdb';
import { cinemaService } from '../../services/cinema';
import { getCurrentCity } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { greetingForHour, firstName, countdownTo, isMovieDay } from '../../services/personalization';

const QUICK_ACTIONS = [
  { id: 'discover', label: 'Discover', icon: Compass, route: '/(tabs)/discover' },
  { id: 'pass', label: 'My Pass', icon: Ticket, route: '/(tabs)/planner' },
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark, route: '/(tabs)/watchlist' },
  { id: 'cinemas', label: 'Cinemas', icon: MapPin, route: '/map' },
  { id: 'memories', label: 'Memories', icon: Camera, route: '/(tabs)/memories' },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [cinemas, setCinemas] = useState([]);
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(new Date());

  const userName = usePreferencesStore((s) => s.userName);
  const city = usePreferencesStore((s) => s.city);
  const updateProfile = usePreferencesStore((s) => s.updateProfile);

  const plans = usePlannerStore((s) => s.plans);
  const memories = useMemoryStore((s) => s.memories);
  const watchlist = useWatchlistStore((s) => s.watchlist);

  const { snapshot: catalog, refresh: refreshCatalog } = useMovieCatalog();
  const providerAvailable = Boolean(cinemaService.isProviderAvailable);

  const { recentMovies } = useActivityStore();

  const nowPlaying = catalog.movies;
  const loading = catalog.loading || cinemaLoading;

  // Derived stats — only from real stored user data
  const stats = useMemo(() => {
    const uniqueTheaters = new Set(memories.map((m) => m.cinemaName).filter(Boolean)).size;
    const rated = memories.filter((m) => Number(m.rating) > 0);
    const avg = rated.length
      ? (rated.reduce((sum, m) => sum + Number(m.rating), 0) / rated.length).toFixed(1)
      : null;
    return {
      passes: plans.length,
      watchlist: watchlist.length,
      screenings: memories.length,
      theaters: uniqueTheaters,
      avgRating: avg,
    };
  }, [plans, watchlist, memories]);

  // Pick the single most important plan: an upcoming confirmed pass first,
  // otherwise the nearest upcoming plan (sorted by date).
  const nextPlan = useMemo(() => {
    if (!plans || plans.length === 0) return null;
    const sorted = [...plans].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const confirmed = sorted.find((p) => p.bookingRef && p.bookingStatus !== 'plan' && p.status !== 'cancelled');
    const upcomingPlan = sorted.find((p) => p.status !== 'cancelled');
    return confirmed || upcomingPlan || null;
  }, [plans]);

  const loadCinemas = async () => {
    if (!providerAvailable) {
      setCinemas([]);
      setCinemaLoading(false);
      return;
    }
    setCinemaLoading(true);
    try {
      const loc = await getCurrentCity();
      if (loc && loc.city) updateProfile({ city: loc.city });
      const list = await cinemaService.getNearbyCinemas(loc && loc.coordinates);
      setCinemas(Array.isArray(list) ? list : []);
    } catch (e) {
      setCinemas([]);
    } finally {
      setCinemaLoading(false);
    }
  };

  const loadUpcoming = async () => {
    setUpcomingLoading(true);
    try {
      const list = await getUpcomingMovies(1);
      setUpcoming(Array.isArray(list) ? list.slice(0, 10) : []);
    } catch {
      setUpcoming([]);
    } finally {
      setUpcomingLoading(false);
    }
  };

  // Live clock tick for countdown/movie-day sections
  useEffect(() => {
    if (!nextPlan) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [nextPlan]);

  useEffect(() => {
    loadCinemas();
    loadUpcoming();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshCatalog(), loadCinemas(), loadUpcoming()]);
    setRefreshing(false);
  };

  const styles = createStyles(colors);
  const greeting = `${greetingForHour(now)}, ${firstName(userName)}`;
  const movieDayPlan = nextPlan && isMovieDay(nextPlan) ? nextPlan : null;
  const countdown = nextPlan ? countdownTo(nextPlan, now) : null;
  const hasStats = stats.passes > 0 || stats.watchlist > 0 || stats.screenings > 0;

  const openPlanTicket = (plan) => {
    if (plan) router.push(`/ticket/${plan._id || plan.id}`);
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
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* HERO SPOTLIGHT */}
        {loading ? (
          <View style={styles.heroSkeletonWrap}>
            <MovieCardSkeleton width="100%" />
          </View>
        ) : nowPlaying.length > 0 ? (
          <HeroBanner movies={nowPlaying.slice(0, 4)} />
        ) : null}

        {/* PERSONALIZED GREETING + PLAN CTA */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingTitle}>{greeting}</Text>
          <Text style={styles.greetingSubtitle}>What's your next movie night?</Text>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => router.push(action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Icon size={20} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PRIMARY PLAN CTA */}
        <View style={styles.planCtaCard}>
          <View style={styles.planCtaTop}>
            <View style={styles.planCtaIconCircle}>
              <Wand2 size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.planCtaText}>
              <Text style={styles.planCtaTitle}>Plan a Movie Night</Text>
              <Text style={styles.planCtaDesc}>Movie → Cinema → Seats → Squad</Text>
            </View>
          </View>
          <Button
            title="Start Planning"
            icon="Ticket"
            variant="primary"
            size="md"
            onPress={() => router.push('/(tabs)/planner')}
            accessibilityLabel="Start planning a movie night"
          />
        </View>

        {/* MOVIE DAY / COUNTDOWN (validated screening only) */}
        {movieDayPlan ? (
          <View style={styles.movieDayCard}>
            <View style={styles.movieDayHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.movieDayBadge}>MOVIE DAY</Text>
            </View>
            <Text style={styles.movieDayTitle}>{movieDayPlan.movie?.title}</Text>
            <View style={styles.movieDayMeta}>
              {movieDayPlan.cinema?.name ? (
                <Text style={styles.movieDayMetaText}>{movieDayPlan.cinema.name}</Text>
              ) : null}
              {movieDayPlan.time ? (
                <Text style={styles.movieDayMetaText}> • {movieDayPlan.time}</Text>
              ) : null}
              {movieDayPlan.cinema?.screenType ? (
                <Text style={styles.movieDayMetaText}> • {movieDayPlan.cinema.screenType}</Text>
              ) : null}
            </View>
            {countdown && countdown.state === 'live' && (
              <Text style={styles.countdownText}>STARTS IN {countdown.text}</Text>
            )}
            <View style={styles.movieDayActions}>
              <Button
                title="Open Pass"
                icon="QrCode"
                variant="primary"
                size="sm"
                onPress={() => openPlanTicket(movieDayPlan)}
              />
              <Button
                title="Directions"
                icon="MapPin"
                variant="surface"
                size="sm"
                onPress={() =>
                  router.push({ pathname: '/cinema/[id]', params: { id: movieDayPlan.cinema?.id, fromPlan: '1' } })
                }
              />
            </View>
          </View>
        ) : nextPlan ? (
          <View style={styles.activePlanContainer}>
            <View style={styles.activePlanHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.activePlanTitle}>
                {isMovieDay(nextPlan) ? 'MOVIE DAY' : 'UPCOMING PASS'}
              </Text>
              {countdown && countdown.state !== 'ended' && (
                <Text style={styles.countdownInline}>{countdown.text}</Text>
              )}
            </View>
            <TicketCard plan={nextPlan} onPress={() => openPlanTicket(nextPlan)} />
          </View>
        ) : null}

        {/* NOW PLAYING */}
        <SectionHeader
          title="Now Playing"
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

        {/* COMING SOON */}
        {upcoming.length > 0 && (
          <>
            <SectionHeader
              title="Coming Soon"
              subtitle="Upcoming theatrical releases"
              icon="Calendar"
              actionText="Discover"
              onAction={() => router.push('/(tabs)/discover')}
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={upcoming}
              keyExtractor={(item) => `up-${item.id}`}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => <MovieCard movie={item} />}
            />
          </>
        )}

        {/* CONTINUE EXPLORING — recently viewed */}
        {recentMovies.length > 0 && (
          <>
            <SectionHeader
              title="Continue Exploring"
              subtitle="Pick up where you left off"
              icon="Clock"
            />
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recentMovies}
              keyExtractor={(item) => `recent-${item.id}`}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => <MovieCard movie={item} />}
            />
          </>
        )}

        {/* YOUR CINEMA STATS */}
        {hasStats && (
          <>
            <SectionHeader title="Your Cinema Stats" subtitle="From your saved activity" icon="Star" />
            <View style={styles.statsCard}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.passes}</Text>
                <Text style={styles.statLabel}>Passes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.screenings}</Text>
                <Text style={styles.statLabel}>Screenings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.theaters}</Text>
                <Text style={styles.statLabel}>Theaters</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.avgRating ? `${stats.avgRating}★` : '—'}</Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
          </>
        )}

        {/* RECENT MEMORIES */}
        {memories.length > 0 && (
          <>
            <SectionHeader
              title="Recent Memories"
              subtitle="Your latest screenings"
              icon="Clapperboard"
              actionText="Journal"
              onAction={() => router.push('/(tabs)/memories')}
            />
            {memories.slice(0, 2).map((mem) => (
              <MemoryCard key={mem._id || mem.id} memory={mem} />
            ))}
          </>
        )}

        {/* THEATRES NEAR YOU */}
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
              onPress={() =>
                router.push({ pathname: '/cinema/[id]', params: { id: cinema.id } })
              }
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xxl * 2 },
  heroSkeletonWrap: { paddingHorizontal: SPACING.lg, marginVertical: SPACING.sm },

  greetingBlock: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  greetingTitle: { ...TYPOGRAPHY.h2, color: colors.text },
  greetingSubtitle: { ...TYPOGRAPHY.body, color: colors.textSecondary, marginTop: 2 },

  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 3,
    minHeight: 60,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionLabel: { ...TYPOGRAPHY.caption, color: colors.textSecondary, fontWeight: '600' },

  planCtaCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  planCtaTop: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  planCtaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  planCtaText: { flex: 1 },
  planCtaTitle: { ...TYPOGRAPHY.h3, color: colors.text },
  planCtaDesc: { ...TYPOGRAPHY.caption, color: colors.textSecondary, marginTop: 2 },

  movieDayCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  movieDayHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginRight: 6 },
  movieDayBadge: { ...TYPOGRAPHY.badge, fontSize: 10, color: colors.primary, letterSpacing: 0.8 },
  movieDayTitle: { ...TYPOGRAPHY.h2, color: colors.text, marginBottom: 4 },
  movieDayMeta: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md },
  movieDayMetaText: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
  countdownText: {
    ...TYPOGRAPHY.ticketMono,
    color: colors.primary,
    fontSize: 18,
    marginBottom: SPACING.md,
  },
  movieDayActions: { flexDirection: 'row', gap: SPACING.sm },

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
  activePlanTitle: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  countdownInline: {
    ...TYPOGRAPHY.ticketMono,
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: SPACING.sm,
  },

  sourceBadgeRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs },
  horizontalList: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs },
  cinemaSkeletonWrap: { paddingHorizontal: SPACING.lg },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { ...TYPOGRAPHY.h2, color: colors.primary },
  statLabel: { ...TYPOGRAPHY.caption, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.cardBorder },

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
  cinemaInfoCol: { flex: 1, marginRight: SPACING.sm },
  cinemaName: { ...TYPOGRAPHY.bodyBold, color: colors.text },
  cinemaAddress: { ...TYPOGRAPHY.caption, color: colors.textSecondary, marginTop: 2 },
  distanceText: { ...TYPOGRAPHY.captionBold, color: colors.primary },
  cinemaMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },

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
  noticeTitle: { ...TYPOGRAPHY.h3, color: colors.text, textAlign: 'center', marginBottom: 4 },
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

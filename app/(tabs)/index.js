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
import { MovieCardSkeleton, CinemaCardSkeleton } from '../../components/ui/Skeleton';
import {
  getTrendingMovies,
  getNowPlayingMovies,
  FALLBACK_MOVIES,
} from '../../services/tmdb';
import { getCurrentCityAndCinemas, SAMPLE_CINEMAS } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const plans = usePlannerStore((s) => s.plans);
  const nextPlan = plans && plans.length > 0 ? plans[0] : null;
  const updateProfile = usePreferencesStore((s) => s.updateProfile);

  const loadData = async () => {
    try {
      const [trend, now, loc] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getCurrentCityAndCinemas(),
      ]);

      setTrending(trend && trend.length > 0 ? trend : FALLBACK_MOVIES);
      setNowPlaying(now && now.length > 0 ? now : FALLBACK_MOVIES);

      if (loc && loc.cinemas && loc.cinemas.length > 0) {
        setCinemas(loc.cinemas);
        if (loc.city) {
          updateProfile({ city: loc.city });
        }
      } else {
        setCinemas(SAMPLE_CINEMAS);
      }
    } catch (e) {
      setTrending(FALLBACK_MOVIES);
      setNowPlaying(FALLBACK_MOVIES);
      setCinemas(SAMPLE_CINEMAS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
          <HeroBanner movies={trending.slice(0, 4)} />
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
          subtitle="IMAX 70mm, Laser & Dolby Cinema screenings"
          icon="Film"
          actionText="See All"
          onAction={() => router.push('/(tabs)/discover')}
        />

        {loading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            <MovieCardSkeleton />
            <MovieCardSkeleton />
            <MovieCardSkeleton />
          </ScrollView>
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
          title="Certified Auditoriums"
          subtitle="Nearest IMAX Laser, Dolby Atmos & 4DX theaters"
          icon="MapPin"
          actionText="Map"
          onAction={() => router.push('/map')}
        />

        {loading ? (
          <View style={{ paddingHorizontal: SPACING.lg }}>
            <CinemaCardSkeleton />
            <CinemaCardSkeleton />
          </View>
        ) : (
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
                    <Text style={styles.distanceBadge}>{cinema.distance || '2.1 km'}</Text>
                  </View>
                  <Text style={styles.cinemaAddress} numberOfLines={1}>
                    {cinema.address}
                  </Text>
                  <View style={styles.cinemaFormatsRow}>
                    <FormatBadge format={cinema.screenType || 'IMAX Laser'} size="small" />
                    {cinema.features && cinema.features[0] && (
                      <FormatBadge format={cinema.features[0]} size="small" />
                    )}
                  </View>
                </View>
                <ChevronRight size={18} color={COLORS.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
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

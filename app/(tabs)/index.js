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
import { Navigation, Volume2, Armchair, ArrowRight, ChevronRight, Ticket } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import HeroBanner from '../../components/HeroBanner';
import MovieCard from '../../components/MovieCard';
import TicketCard from '../../components/TicketCard';
import MoodSelector from '../../components/MoodSelector';
import SectionHeader from '../../components/SectionHeader';
import FormatBadge from '../../components/FormatBadge';
import {
  getTrendingMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  FALLBACK_MOVIES,
} from '../../services/tmdb';
import { getCurrentCityAndCinemas } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const [trending, setTrending] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const plans = usePlannerStore((s) => s.plans);
  const nextPlan = plans && plans.length > 0 ? plans[0] : null;
  const updateProfile = usePreferencesStore((s) => s.updateProfile);

  const loadData = async () => {
    try {
      const [trend, now, up, loc] = await Promise.all([
        getTrendingMovies(),
        getNowPlayingMovies(),
        getUpcomingMovies(),
        getCurrentCityAndCinemas(),
      ]);

      setTrending(trend && trend.length > 0 ? trend : FALLBACK_MOVIES);
      setNowPlaying(now && now.length > 0 ? now : FALLBACK_MOVIES);
      setUpcoming(up && up.length > 0 ? up : FALLBACK_MOVIES);

      if (loc && loc.cinemas) {
        setCinemas(loc.cinemas);
        if (loc.city) {
          updateProfile({ city: loc.city });
        }
      }
    } catch (e) {
      console.warn('Home data load error:', e.message);
      setTrending(FALLBACK_MOVIES);
      setNowPlaying(FALLBACK_MOVIES);
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

  const filteredNowPlaying = selectedMood
    ? nowPlaying.filter((m) => m.mood === selectedMood || (m.genres && m.genres.some(g => g.name === 'Action' || g.name === 'Sci-Fi')))
    : nowPlaying;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Spotlight Hero Carousel */}
        <HeroBanner movies={trending.slice(0, 4)} />

        {/* Active Trip Banner if upcoming plan exists */}
        {nextPlan && (
          <View style={styles.activePlanWrapper}>
            <View style={styles.activePlanHeader}>
              <View style={styles.pulseDot} />
              <Text style={styles.activePlanLabel}>UPCOMING MOVIE NIGHT</Text>
            </View>
            <TicketCard plan={nextPlan} />
          </View>
        )}

        {/* Quick Cinephile Mood Filter */}
        <SectionHeader
          title="Match Your Mood"
          subtitle="Discover films matching your night's vibe"
          icon="Sparkles"
        />
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={(mood) => setSelectedMood(mood)}
        />

        {/* Now Playing In Theaters */}
        <SectionHeader
          title="Now in Theaters"
          subtitle="Showing in IMAX, Dolby & 4DX"
          icon="Film"
          actionText="Explore"
          onAction={() => router.push('/(tabs)/discover')}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredNowPlaying}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => <MovieCard movie={item} />}
        />

        {/* Nearby Premium Screens */}
        <SectionHeader
          title="Premium Screens Near You"
          subtitle="Certified IMAX Laser, Dolby Atmos & VIP Lounges"
          icon="MapPin"
          actionText="Map"
          onAction={() => router.push('/map')}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {cinemas.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.cinemaCard}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/planner')}
              accessibilityRole="button"
              accessibilityLabel={`Select cinema: ${c.name}, ${c.distanceKm} kilometers away`}
            >
              <View style={styles.cinemaTop}>
                <FormatBadge format={c.screenType} size="small" />
                <View style={styles.distBadge}>
                  <Navigation size={12} color={COLORS.primary} strokeWidth={2} />
                  <Text style={styles.distText}>{c.distanceKm} km</Text>
                </View>
              </View>

              <Text style={styles.cinemaCardName} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.cinemaCardAddress} numberOfLines={1}>
                {c.address}
              </Text>

              <View style={styles.cinemaFeatures}>
                <View style={styles.featRow}>
                  <Volume2 size={12} color={COLORS.secondary} strokeWidth={2} />
                  <Text style={styles.featText}>{c.sound}</Text>
                </View>
                <View style={styles.featRow}>
                  <Armchair size={12} color={COLORS.primary} strokeWidth={2} />
                  <Text style={styles.featText}>{c.seating}</Text>
                </View>
              </View>

              <View style={styles.bookScreenBtn}>
                <Text style={styles.bookScreenText}>Select Screen</Text>
                <ArrowRight size={12} color="#07090E" strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Theatrical Events */}
        <SectionHeader
          title="Anticipated Releases"
          subtitle="Lock in your calendar for advance tickets"
          icon="Calendar"
          actionText="All"
          onAction={() => router.push('/(tabs)/discover')}
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcoming}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => <MovieCard movie={item} />}
        />

        {/* Bottom Quick Action Banner */}
        <TouchableOpacity
          style={styles.ctaBanner}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/planner')}
          accessibilityRole="button"
          accessibilityLabel="Organize a Movie Night. Invite squad, pick seats, get your pass."
        >
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconBadge}>
              <Ticket size={24} color={COLORS.primary} strokeWidth={2} />
            </View>
            <View style={styles.ctaTexts}>
              <Text style={styles.ctaTitle}>Organize a Movie Night</Text>
              <Text style={styles.ctaSubtitle}>Invite squad, pick seats, get your pass</Text>
            </View>
          </View>
          <View style={styles.ctaArrow}>
            <ChevronRight size={18} color="#07090E" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  activePlanWrapper: {
    marginTop: SPACING.md,
  },
  activePlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  activePlanLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 1,
  },
  horizontalList: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },

  // Cinema Cards
  cinemaCard: {
    width: 220,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'space-between',
    ...SHADOWS.subtle,
  },
  cinemaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  distText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  cinemaCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cinemaCardAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  cinemaFeatures: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 6,
    marginVertical: 6,
    gap: 4,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bookScreenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
    marginTop: 4,
    gap: 4,
  },
  bookScreenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#07090E',
  },

  // CTA Banner
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    ...SHADOWS.glowCyan,
  },
  ctaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ctaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTexts: {
    marginLeft: 12,
    flex: 1,
  },
  ctaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ctaSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

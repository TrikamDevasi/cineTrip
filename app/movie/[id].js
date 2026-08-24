import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, Bookmark, Star, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormatBadge from '../../components/FormatBadge';
import { getMovieDetails, getImageUri, FALLBACK_MOVIES } from '../../services/tmdb';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const isInWatchlist = useWatchlistStore((s) => (movie ? s.isInWatchlist(movie.id) : false));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    const data = await getMovieDetails(id);
    setMovie(data || FALLBACK_MOVIES[0]);
    setLoading(false);
  };

  const handlePlanTrip = () => {
    if (!movie) return;
    setDraftMovie(movie);
    router.push('/(tabs)/planner');
  };

  const handleShare = async () => {
    if (!movie) return;
    try {
      await Share.share({
        message: `Check out "${movie.title}" on CineTrip! Let's plan a movie night!`,
      });
    } catch (e) {}
  };

  if (loading || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const cast = movie.credits && movie.credits.cast ? movie.credits.cast.slice(0, 8) : [];
  const formats = movie.formats || ['IMAX Laser', 'Dolby Cinema', '4DX'];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.2';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const runtime = movie.runtime ? `${movie.runtime} min` : '165 min';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Backdrop Section */}
        <View style={styles.backdropWrapper}>
          <Image
            source={{ uri: getImageUri(movie.backdrop_path || movie.poster_path, 'w780') }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={COLORS.overlayGradient}
            style={styles.backdropGradient}
          />

          {/* Floating Navigation Header */}
          <SafeAreaView style={styles.navHeader} edges={['top']}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.navActions}>
              <TouchableOpacity
                style={[styles.iconCircle, { marginRight: 10 }]}
                onPress={handleShare}
                accessibilityRole="button"
                accessibilityLabel={`Share ${movie.title}`}
              >
                <Share2 size={18} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => toggleWatchlist(movie)}
                accessibilityRole="button"
                accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
                accessibilityState={{ selected: isInWatchlist }}
              >
                <Bookmark
                  size={18}
                  color={isInWatchlist ? COLORS.primary : '#FFFFFF'}
                  fill={isInWatchlist ? COLORS.primary : 'transparent'}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Poster & Main Meta Card */}
        <View style={styles.metaCard}>
          <Image
            source={{ uri: getImageUri(movie.poster_path, 'w342') }}
            style={styles.posterImage}
          />

          <View style={styles.metaInfo}>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
              <Text style={styles.yearText}>{year} • {runtime}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {movie.title}
            </Text>

            {movie.tagline ? (
              <Text style={styles.tagline} numberOfLines={2}>
                "{movie.tagline}"
              </Text>
            ) : null}

            <View style={styles.genreRow}>
              {(movie.genres || []).slice(0, 3).map((g, i) => (
                <View key={i} style={styles.genreChip}>
                  <Text style={styles.genreChipText}>{g.name || g}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Theatrical Formats Available */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Formats</Text>
          <View style={styles.formatsWrap}>
            {formats.map((fmt, idx) => (
              <FormatBadge key={idx} format={fmt} size="medium" />
            ))}
          </View>
        </View>

        {/* Synopsis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.overviewText}>
            {movie.overview || 'Experience this cinematic masterpiece in premium certified theaters with custom audio and crystal clear projection.'}
          </Text>
        </View>

        {/* Cast & Crew */}
        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
              {cast.map((actor) => (
                <View key={actor.id} style={styles.castCard}>
                  <Image
                    source={{ uri: getImageUri(actor.profile_path, 'w185') }}
                    style={styles.castPhoto}
                  />
                  <Text style={styles.actorName} numberOfLines={1}>
                    {actor.name}
                  </Text>
                  <Text style={styles.characterName} numberOfLines={1}>
                    {actor.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.watchlistToggleBtn}
          onPress={() => toggleWatchlist(movie)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
        >
          <Bookmark
            size={18}
            color={isInWatchlist ? COLORS.primary : '#FFFFFF'}
            fill={isInWatchlist ? COLORS.primary : 'transparent'}
            strokeWidth={2}
          />
          <Text style={[styles.watchlistToggleText, isInWatchlist && { color: COLORS.primary }]}>
            {isInWatchlist ? 'Saved' : 'Watchlist'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.planMovieBtn}
          onPress={handlePlanTrip}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel={`Plan movie night for ${movie.title}`}
        >
          <Ticket size={18} color="#07090E" strokeWidth={2.2} />
          <Text style={styles.planMovieBtnText}>Plan Movie Night</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  backdropWrapper: {
    width: '100%',
    height: 280,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  navHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  navActions: {
    flexDirection: 'row',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Meta Card
  metaCard: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: -60,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  posterImage: {
    width: 100,
    height: 150,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  metaInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  yearText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  genreChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginRight: 6,
    marginTop: 4,
  },
  genreChipText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formatsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overviewText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },

  // Cast
  castScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  castCard: {
    width: 90,
    marginRight: 12,
    alignItems: 'center',
  },
  castPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.surface,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actorName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  characterName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Bottom Floating Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    backgroundColor: 'rgba(10, 14, 24, 0.96)',
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  watchlistToggleBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 48,
    minWidth: 64,
  },
  watchlistToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  planMovieBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 6,
    minHeight: 48,
    ...SHADOWS.glowCyan,
  },
  planMovieBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#07090E',
    letterSpacing: 0.3,
  },
});

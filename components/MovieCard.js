import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Star, Ticket, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getImageUri } from '../services/tmdb';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { usePlannerStore } from '../store/usePlannerStore';
import FormatBadge from './FormatBadge';
import AnimatedPressable from './ui/AnimatedPressable';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MovieCard({ movie, layout = 'vertical', width }) {
  const router = useRouter();
  const isInWatchlist = useWatchlistStore((s) => (movie ? s.isInWatchlist(movie.id) : false));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

  if (!movie) return null;

  const handlePlanTrip = (e) => {
    e.stopPropagation();
    setDraftMovie(movie);
    router.push('/(tabs)/planner');
  };

  const handleToggleWatchlist = (e) => {
    e.stopPropagation();
    toggleWatchlist(movie);
  };

  const handlePressCard = () => {
    router.push(`/movie/${movie.id}`);
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const formats = movie.formats || ['IMAX Laser', 'Dolby Cinema'];

  // Calculate dynamic card width for responsive carousel/grid
  const cardWidth = width || Math.min(160, (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2.2);

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        activeOpacity={0.85}
        onPress={handlePressCard}
        accessibilityLabel={`${movie.title}, rated ${rating}`}
      >
        <Image
          source={{ uri: getImageUri(movie.poster_path, 'w342') }}
          style={styles.horizontalPoster}
        />
        <View style={styles.horizontalContent}>
          <View style={styles.topMetaRow}>
            <View style={styles.ratingBadge}>
              <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <Text style={styles.yearText}>{year}</Text>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>

          <View style={styles.formatRow}>
            {formats.slice(0, 2).map((fmt, idx) => (
              <FormatBadge key={idx} format={fmt} size="small" />
            ))}
          </View>

          <View style={styles.horizontalActionRow}>
            <TouchableOpacity
              style={styles.quickPlanBtn}
              onPress={handlePlanTrip}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Plan movie night for ${movie.title}`}
            >
              <Ticket size={16} color="#07090E" strokeWidth={2} />
              <Text style={styles.quickPlanText}>Plan Night</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={handleToggleWatchlist}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
            >
              {isInWatchlist ? (
                <BookmarkCheck size={18} color={COLORS.primary} strokeWidth={2} />
              ) : (
                <Bookmark size={18} color={COLORS.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedPressable
      style={[styles.verticalCard, { width: cardWidth }]}
      onPress={handlePressCard}
      accessibilityRole="button"
      accessibilityLabel={`${movie.title}, rated ${rating}`}
    >

      <View style={styles.posterContainer}>
        <Image
          source={{ uri: getImageUri(movie.poster_path, 'w342') }}
          style={styles.verticalPoster}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(7, 9, 14, 0.8)']}
          style={styles.posterGradient}
        />

        {/* Floating Watchlist Action */}
        <TouchableOpacity
          style={styles.floatingBookmark}
          onPress={handleToggleWatchlist}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
        >
          {isInWatchlist ? (
            <BookmarkCheck size={18} color={COLORS.primary} strokeWidth={2} />
          ) : (
            <Bookmark size={18} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>

        {/* Rating pill */}
        <View style={styles.floatingRating}>
          <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
          <Text style={styles.floatingRatingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.verticalContent}>
        <Text style={styles.verticalTitle} numberOfLines={1}>
          {movie.title}
        </Text>
        <Text style={styles.verticalSubtitle} numberOfLines={1}>
          {year} • {movie.genres && movie.genres[0] ? (movie.genres[0].name || movie.genres[0]) : 'Cinema'}
        </Text>

        <TouchableOpacity
          style={styles.verticalPlanBtn}
          onPress={handlePlanTrip}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Plan movie night for ${movie.title}`}
        >
          <Ticket size={14} color={COLORS.primary} strokeWidth={2} />
          <Text style={styles.verticalPlanText}>Plan Night</Text>
        </TouchableOpacity>
      </View>
    </AnimatedPressable>
  );
}


const styles = StyleSheet.create({
  verticalCard: {
    marginRight: SPACING.md,
    backgroundColor: '#0F1524',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    ...SHADOWS.card,
  },
  posterContainer: {
    width: '100%',
    height: 210,
    position: 'relative',
    backgroundColor: '#172033',
  },
  verticalPoster: {
    width: '100%',
    height: '100%',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  floatingBookmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(7, 9, 14, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  floatingRating: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 24, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 4,
  },
  floatingRatingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verticalContent: {
    padding: 12,
  },
  verticalTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verticalSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 8,
  },
  verticalPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    borderRadius: RADIUS.sm,
    paddingVertical: 7,
    minHeight: 34,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    gap: 5,
  },
  verticalPlanText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: COLORS.primary,
  },
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#0F1524',
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    ...SHADOWS.card,
  },
  horizontalPoster: {
    width: 100,
    height: 145,
    backgroundColor: COLORS.surface,
  },
  horizontalContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  topMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.text,
  },
  yearText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    color: COLORS.text,
    marginVertical: 2,
  },
  formatRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: 4,
  },
  horizontalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  quickPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.xs,
    minHeight: 38,
    gap: 6,
  },
  quickPlanText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: '#07090E',
  },
  bookmarkBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});
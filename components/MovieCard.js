import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Star, Bookmark, BookmarkCheck, Ticket } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import FormatBadge from './FormatBadge';
import AnimatedPressable from './ui/AnimatedPressable';
import { getImageUri } from '../services/tmdb';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min((SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2, 175);

export default function MovieCard({
  movie,
  layout = 'vertical', // 'vertical' | 'horizontal'
  onPress,
  cardWidth = CARD_WIDTH,
}) {
  const router = useRouter();
  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(movie.id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

  if (!movie) return null;

  const handlePressCard = () => {
    if (onPress) {
      onPress(movie);
    } else {
      router.push(`/movie/${movie.id}`);
    }
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(movie);
  };

  const handlePlanTrip = () => {
    setDraftMovie(movie);
    router.push('/(tabs)/planner');
  };

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.2';
  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';
  const formats = movie.formats || ['IMAX Laser', 'Dolby Cinema', '4DX'];

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
              <Star size={11} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
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
              <Ticket size={14} color="#07090E" strokeWidth={2.2} />
              <Text style={styles.quickPlanText}>Plan Night</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={handleToggleWatchlist}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
            >
              {isInWatchlist ? (
                <BookmarkCheck size={16} color={COLORS.primary} strokeWidth={2} />
              ) : (
                <Bookmark size={16} color={COLORS.textSecondary} strokeWidth={2} />
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
            <BookmarkCheck size={16} color={COLORS.primary} strokeWidth={2.2} />
          ) : (
            <Bookmark size={16} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>

        {/* Rating pill */}
        <View style={styles.floatingRating}>
          <Star size={11} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
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
          <Ticket size={13} color={COLORS.primary} strokeWidth={2.2} />
          <Text style={styles.verticalPlanText}>Plan Night</Text>
        </TouchableOpacity>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  verticalCard: {
    marginRight: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  posterContainer: {
    width: '100%',
    height: 205,
    position: 'relative',
    backgroundColor: COLORS.surface,
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
    height: 55,
  },
  floatingBookmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingRating: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 3,
  },
  floatingRatingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: '#FFFFFF',
  },
  verticalContent: {
    padding: 10,
  },
  verticalTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.text,
  },
  verticalSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  verticalPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySubtle,
    borderRadius: RADIUS.xs,
    paddingVertical: 6,
    minHeight: 32,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.28)',
    gap: 4,
  },
  verticalPlanText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  horizontalPoster: {
    width: 95,
    height: 140,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 3,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.text,
  },
  yearText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  title: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    color: COLORS.text,
    marginVertical: 2,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 2,
  },
  horizontalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  quickPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    minHeight: 34,
    gap: 5,
  },
  quickPlanText: {
    ...TYPOGRAPHY.captionBold,
    fontSize: 12,
    color: '#07090E',
  },
  bookmarkBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});
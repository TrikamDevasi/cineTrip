import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, Ticket, Bookmark, BookmarkCheck, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getImageUri } from '../services/tmdb';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { usePlannerStore } from '../store/usePlannerStore';
import FormatBadge from './FormatBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function MovieCard({ movie, layout = 'vertical', width = 160 }) {
  const router = useRouter();
  const isInWatchlist = useWatchlistStore((s) => s.isInWatchlist(movie.id));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

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

  if (layout === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        activeOpacity={0.85}
        onPress={handlePressCard}
        accessibilityRole="button"
        accessibilityLabel={`${movie.title}, rated ${rating}, released in ${year}`}
      >
        <Image
          source={{ uri: getImageUri(movie.poster_path, 'w342') }}
          style={styles.horizontalPoster}
        />
        <View style={styles.horizontalContent}>
          <View style={styles.ratingRow}>
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
              <Ticket size={13} color="#07090E" strokeWidth={2.2} />
              <Text style={styles.quickPlanText}>Plan Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={handleToggleWatchlist}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
            >
              {isInWatchlist ? (
                <BookmarkCheck size={16} color={COLORS.primary} strokeWidth={2.2} />
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
    <TouchableOpacity
      style={[styles.verticalCard, { width }]}
      activeOpacity={0.85}
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
          colors={['rgba(7, 9, 14, 0.0)', 'rgba(7, 9, 14, 0.85)']}
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
          <Star size={11} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
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
          <Calendar size={13} color={COLORS.primary} strokeWidth={2} />
          <Text style={styles.verticalPlanText}>Plan Night</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  verticalCard: {
    marginRight: 14,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  posterContainer: {
    width: '100%',
    height: 220,
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
    height: 60,
  },
  floatingBookmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  floatingRating: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 3,
  },
  floatingRatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verticalContent: {
    padding: 10,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  verticalSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  verticalPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 7,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 5,
  },
  verticalPlanText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    marginHorizontal: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  horizontalPoster: {
    width: 100,
    height: 145,
    backgroundColor: COLORS.surface,
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  ratingRow: {
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
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  yearText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  horizontalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  quickPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.xs,
    gap: 5,
  },
  quickPlanText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#07090E',
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});

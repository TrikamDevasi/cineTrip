import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      >
        <Image
          source={{ uri: getImageUri(movie.poster_path, 'w342') }}
          style={styles.horizontalPoster}
        />
        <View style={styles.horizontalContent}>
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.secondary} />
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
            >
              <Ionicons name="ticket" size={13} color="#000" />
              <Text style={styles.quickPlanText}>Plan Trip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarkBtn}
              onPress={handleToggleWatchlist}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isInWatchlist ? COLORS.primary : COLORS.textSecondary}
              />
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
    >
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: getImageUri(movie.poster_path, 'w342') }}
          style={styles.verticalPoster}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(7, 9, 14, 0.0)', 'rgba(7, 9, 14, 0.8)']}
          style={styles.posterGradient}
        />

        {/* Floating Watchlist Action */}
        <TouchableOpacity
          style={styles.floatingBookmark}
          onPress={handleToggleWatchlist}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInWatchlist ? 'bookmark' : 'bookmark-outline'}
            size={14}
            color={isInWatchlist ? COLORS.primary : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* Rating pill */}
        <View style={styles.floatingRating}>
          <Ionicons name="star" size={11} color={COLORS.secondary} />
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
        >
          <Ionicons name="calendar-outline" size={12} color={COLORS.primary} />
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
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingRating: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  floatingRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 3,
  },
  verticalContent: {
    padding: 10,
  },
  verticalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
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
    backgroundColor: COLORS.primaryMuted,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  verticalPlanText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginHorizontal: SPACING.lg,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOWS.subtle,
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
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    marginLeft: 3,
  },
  yearText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: 4,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 2,
  },
  horizontalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  quickPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    marginRight: 10,
  },
  quickPlanText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#07090E',
    marginLeft: 4,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Ticket, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getImageUri } from '../services/tmdb';
import { usePlannerStore } from '../store/usePlannerStore';
import FormatBadge from './FormatBadge';
import Button from './ui/Button';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = Math.min(SCREEN_WIDTH - SPACING.lg * 2, 480);

export default function HeroBanner({ movies = [] }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex] || movies[0];

  const handlePlanNight = () => {
    setDraftMovie(currentMovie);
    router.push('/(tabs)/planner');
  };

  const handleOpenDetails = () => {
    router.push(`/movie/${currentMovie.id}`);
  };

  const handleScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / HERO_WIDTH);
    if (slide !== activeIndex && slide >= 0 && slide < movies.length) {
      setActiveIndex(slide);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
      >
        {movies.map((movie) => (
          <View
            key={movie.id}
            style={styles.heroCard}
          >
            <Image
              source={{ uri: getImageUri(movie.backdrop_path || movie.poster_path, 'w780') }}
              style={styles.backdropImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={COLORS.overlayGradient}
              style={styles.gradientOverlay}
            />

            <View style={styles.contentOverlay}>
              <View style={styles.topBadgeRow}>
                <View style={styles.featuredBadge}>
                  <Sparkles size={14} color={COLORS.secondary} strokeWidth={2} />
                  <Text style={styles.featuredText}>SPOTLIGHT</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
                  <Text style={styles.ratingText}>
                    {movie.vote_average ? movie.vote_average.toFixed(1) : '8.2'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/movie/${movie.id}`)}
              >
                <Text style={styles.movieTitle} numberOfLines={2}>
                  {movie.title}
                </Text>

                {movie.tagline ? (
                  <Text style={styles.movieTagline} numberOfLines={1}>
                    "{movie.tagline}"
                  </Text>
                ) : null}
              </TouchableOpacity>

              <View style={styles.formatRow}>
                {(movie.formats || ['IMAX Laser', 'Dolby Cinema', '4DX']).slice(0, 3).map((fmt, i) => (
                  <FormatBadge key={i} format={fmt} size="small" />
                ))}
              </View>

              <View style={styles.ctaRow}>
                <View style={styles.planBtnWrap}>
                  <Button
                    title="Plan Movie Night"
                    icon="Ticket"
                    variant="primary"
                    size="md"
                    onPress={handlePlanNight}
                    accessibilityLabel={`Plan movie night for ${movie.title}`}
                  />
                </View>

                <Button
                  title="Details"
                  icon="Info"
                  variant="surface"
                  size="md"
                  onPress={handleOpenDetails}
                  accessibilityLabel={`View details for ${movie.title}`}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Subtle Pagination Indicators */}
      {movies.length > 1 && (
        <View style={styles.dotsContainer}>
          {movies.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  heroCard: {
    width: HERO_WIDTH,
    height: 380,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    marginRight: SPACING.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  topBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.14)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    gap: 4,
  },
  featuredText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.secondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.text,
  },
  movieTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    color: COLORS.text,
    marginBottom: 4,
  },
  movieTagline: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  planBtnWrap: {
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    width: 16,
    backgroundColor: COLORS.primary,
  },
});

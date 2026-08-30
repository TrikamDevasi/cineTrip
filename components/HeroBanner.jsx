import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Ticket, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getImageUri } from '../services/tmdb';
import { usePlannerStore } from '../store/usePlannerStore';
import { useMovieCatalog } from '../hooks/useMovieCatalog';
import FormatBadge from './FormatBadge';
import Button from './ui/Button';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = Math.min(SCREEN_WIDTH - SPACING.lg * 2, 460);

export default function HeroBanner({ movies = [] }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);
  const { getAvailability } = useMovieCatalog();

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[activeIndex] || movies[0];
  const canPlanNight = getAvailability(currentMovie).canBook;

  const handlePlanNight = () => {
    if (!canPlanNight) return;
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
              colors={['rgba(7, 9, 14, 0.1)', 'transparent', 'rgba(7, 9, 14, 0.72)', '#07090E']}
              locations={[0, 0.28, 0.7, 1]}
              style={styles.gradientOverlay}
            />

            <View style={styles.contentOverlay}>
              <View style={styles.topBadgeRow}>
                <View style={styles.featuredBadge}>
                  <Sparkles size={12} color="#E5A93C" strokeWidth={2.5} />
                  <Text style={styles.featuredText}>SPOTLIGHT</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
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
                {(movie.formats || []).slice(0, 3).map((fmt, i) => (
                  <FormatBadge key={i} format={fmt} size="small" />
                ))}
              </View>

              <View style={styles.ctaRow}>
                {canPlanNight && (
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
                )}

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

const createStyles = (colors) => StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  heroCard: {
    width: HERO_WIDTH,
    height: 390,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
    marginRight: SPACING.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    backgroundColor: 'rgba(229, 169, 60, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    gap: 4,
  },
  featuredText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: '#E5A93C',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: colors.text,
  },
  movieTitle: {
    ...TYPOGRAPHY.displayMedium,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  movieTagline: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});

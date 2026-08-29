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
              colors={['rgba(7, 9, 14, 0.1)', 'transparent', 'rgba(7, 9, 14, 0.75)', '#07090E']}
              locations={[0, 0.3, 0.72, 1]}
              style={styles.gradientOverlay}
            />

            <View style={styles.contentOverlay}>
              <View style={styles.topBadgeRow}>
                <View style={styles.featuredBadge}>
                  <Sparkles size={13} color="#FFB800" strokeWidth={2.2} />
                  <Text style={styles.featuredText}>SPOTLIGHT</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={13} color="#FFB800" fill="#FFB800" strokeWidth={1.5} />
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
    marginVertical: SPACING.sm,
  },
  scrollContainer: {
    paddingHorizontal: SPACING.lg,
  },
  heroCard: {
    width: HERO_WIDTH,
    height: 400,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    position: 'relative',
    marginRight: SPACING.md,
    backgroundColor: '#0F1524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
    backgroundColor: 'rgba(255, 184, 0, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    gap: 5,
  },
  featuredText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFB800',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 24, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  movieTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 25,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  movieTagline: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: '#CBD5E1',
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});

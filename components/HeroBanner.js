import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Star, Ticket, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getImageUri } from '../services/tmdb';
import { usePlannerStore } from '../store/usePlannerStore';
import FormatBadge from './FormatBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

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
          <TouchableOpacity
            key={movie.id}
            activeOpacity={0.92}
            style={styles.heroCard}
            onPress={() => router.push(`/movie/${movie.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Featured premiere: ${movie.title}`}
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
                  <Sparkles size={12} color={COLORS.secondary} strokeWidth={2.2} />
                  <Text style={styles.featuredText}>PREMIERE SPOTLIGHT</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Star size={12} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
                  <Text style={styles.ratingText}>
                    {movie.vote_average ? movie.vote_average.toFixed(1) : '8.2'}
                  </Text>
                </View>
              </View>

              <Text style={styles.movieTitle} numberOfLines={2}>
                {movie.title}
              </Text>

              {movie.tagline ? (
                <Text style={styles.movieTagline} numberOfLines={1}>
                  "{movie.tagline}"
                </Text>
              ) : null}

              <View style={styles.formatRow}>
                {(movie.formats || ['IMAX Laser', 'Dolby Cinema', '4DX']).slice(0, 3).map((fmt, i) => (
                  <FormatBadge key={i} format={fmt} size="small" />
                ))}
              </View>

              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={styles.planTripBtn}
                  onPress={handlePlanNight}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Plan movie night for ${movie.title}`}
                >
                  <Ticket size={16} color="#07090E" strokeWidth={2.2} />
                  <Text style={styles.planTripText}>Plan Movie Night</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={handleOpenDetails}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${movie.title}`}
                >
                  <Info size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.detailsText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
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
    marginRight: SPACING.lg,
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
    marginBottom: 8,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  movieTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    gap: 6,
    ...SHADOWS.glowCyan,
  },
  planTripText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#07090E',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    gap: 6,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    backgroundColor: COLORS.primary,
  },
});

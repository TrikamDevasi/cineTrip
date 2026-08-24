import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
                  <MaterialCommunityIcons name="star-shooting" size={13} color={COLORS.secondary} />
                  <Text style={styles.featuredText}>PREMIERE SPOTLIGHT</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={COLORS.secondary} />
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
                >
                  <Ionicons name="ticket" size={16} color="#07090E" />
                  <Text style={styles.planTripText}>Plan Movie Night</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={handleOpenDetails}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.detailsText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {movies.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
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
    height: 320,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    position: 'relative',
    marginRight: movies => (movies ? 0 : 0),
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
    top: 0,
    bottom: 0,
  },
  contentOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.lg,
    justifyContent: 'flex-end',
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
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  movieTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTripBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    marginRight: 10,
    ...SHADOWS.glowCyan,
  },
  planTripText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#07090E',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

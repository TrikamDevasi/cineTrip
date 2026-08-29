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
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Star, Ticket, Clock, Calendar, Film } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { getMovieDetails, getImageUri } from '../../services/tmdb';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isInWatchlist = useWatchlistStore((s) => (movie ? s.isInWatchlist(movie.id) : false));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);
  const { getAvailability } = useMovieCatalog();

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    setNotFound(false);
    const data = await getMovieDetails(id);
    if (!data) {
      setNotFound(true);
      setMovie(null);
    } else {
      setMovie(data);
    }
    setLoading(false);
  };

  const handlePlanNight = () => {
    if (!movie) return;
    const availability = getAvailability(movie);
    if (!availability.canBook) return;
    setDraftMovie(movie);
    router.push('/(tabs)/planner');
  };

  const handleShare = async () => {
    if (!movie) return;
    try {
      await Share.share({
        message: `🎬 Check out "${movie.title}" on CineTrip! Let's plan a movie night!`,
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (notFound || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Movie not found, or the catalog is unavailable.</Text>
        <View style={{ marginTop: SPACING.md }}>
          <Button
            title="Go Back"
            variant="surface"
            size="md"
            onPress={() => router.back()}
          />
        </View>
      </View>
    );
  }

  const cast = movie.credits && movie.credits.cast ? movie.credits.cast.slice(0, 8) : [];
  const formats = movie.formats || [];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const runtime = movie.runtime ? `${movie.runtime} min` : '';
  const genres = movie.genres ? movie.genres.map(g => (typeof g === 'object' ? g.name : g)).join(' • ') : '';
  const availability = getAvailability(movie);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 1. BACKDROP SECTION WITH FLOATING CONTROLS */}
        <View style={styles.backdropWrapper}>
          <Image
            source={{ uri: getImageUri(movie.backdrop_path || movie.poster_path, 'w780') }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(7, 9, 14, 0.2)', 'transparent', 'rgba(7, 9, 14, 0.75)', '#07090E']}
            locations={[0, 0.3, 0.75, 1]}
            style={styles.backdropGradient}
          />

          <SafeAreaView style={styles.navHeader} edges={['top']}>
            <IconButton
              icon="ArrowLeft"
              variant="surface"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            />

            <View style={styles.navActions}>
              <IconButton
                icon="Share2"
                variant="surface"
                onPress={handleShare}
                accessibilityLabel={`Share ${movie.title}`}
                style={{ marginRight: SPACING.sm }}
              />

              <IconButton
                icon={isInWatchlist ? "BookmarkCheck" : "Bookmark"}
                variant="surface"
                color={isInWatchlist ? COLORS.primary : COLORS.text}
                onPress={() => toggleWatchlist(movie)}
                accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              />
            </View>
          </SafeAreaView>
        </View>

        {/* 2. POSTER + TITLE & METADATA SECTION */}
        <View style={styles.mainInfoSection}>
          <View style={styles.posterAndHeaderRow}>
            <Image
              source={{ uri: getImageUri(movie.poster_path, 'w342') }}
              style={styles.posterImage}
            />

            <View style={styles.titleColumn}>
              <Text style={styles.movieTitle}>
                {movie.title}
              </Text>

              {movie.tagline ? (
                <Text style={styles.tagline} numberOfLines={2}>
                  "{movie.tagline}"
                </Text>
              ) : null}

              {rating || year || runtime ? (
                <View style={styles.metaRow}>
                  {rating && (
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
                      <Text style={styles.ratingText}>{rating}</Text>
                    </View>
                  )}
                  {year ? (
                    <React.Fragment>
                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={styles.metaText}>{year}</Text>
                    </React.Fragment>
                  ) : null}
                  {runtime ? (
                    <React.Fragment>
                      <Text style={styles.metaDivider}>•</Text>
                      <Text style={styles.metaText}>{runtime}</Text>
                    </React.Fragment>
                  ) : null}
                </View>
              ) : null}

              {genres ? (
                <Text style={styles.genreText} numberOfLines={1}>
                  {genres}
                </Text>
              ) : null}
            </View>
          </View>

          {/* 3. PRIMARY CTA ACTION BAR */}
          <View style={styles.actionBlock}>
            <View style={styles.primaryActionWrap}>
              {availability.canBook ? (
                <Button
                  title="Plan Movie Night"
                  icon="Ticket"
                  variant="primary"
                  size="lg"
                  onPress={handlePlanNight}
                  accessibilityLabel={`Plan movie night for ${movie.title}`}
                />
              ) : (
                <Button
                  title={availability.status === 'UPCOMING' ? 'Coming Soon' : availability.label}
                  icon="Ticket"
                  variant="primary"
                  size="lg"
                  disabled
                  accessibilityLabel={`${movie.title} is not bookable`}
                />
              )}
            </View>

            <Button
              title={isInWatchlist ? "Saved" : "Save"}
              icon={isInWatchlist ? "BookmarkCheck" : "Bookmark"}
              variant={isInWatchlist ? "secondary" : "surface"}
              size="lg"
              onPress={() => toggleWatchlist(movie)}
              accessibilityLabel={isInWatchlist ? "Remove from watchlist" : "Save to watchlist"}
            />
          </View>

          {/* 4. THEATRICAL FORMAT AVAILABILITY */}
          {formats.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>AVAILABLE FORMATS</Text>
              <View style={styles.formatsWrap}>
                {formats.map((fmt, idx) => (
                  <FormatBadge key={idx} format={fmt} size="medium" />
                ))}
              </View>
            </View>
          )}

          {/* 5. SYNOPSIS */}
          {movie.overview ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>SYNOPSIS</Text>
              <Text style={styles.overviewText}>{movie.overview}</Text>
            </View>
          ) : null}

          {/* 6. CAST & CHARACTERS */}
          {cast.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>TOP CAST</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
                {cast.map((actor, idx) => (
                  <View key={idx} style={styles.castItem}>
                    {actor.profile_path ? (
                      <Image
                        source={{ uri: getImageUri(actor.profile_path, 'w185') }}
                        style={styles.castAvatar}
                      />
                    ) : (
                      <View style={styles.castAvatarPlaceholder}>
                        <Text style={styles.castAvatarInitial}>{actor.name.charAt(0)}</Text>
                      </View>
                    )}
                    <Text style={styles.castName} numberOfLines={1}>{actor.name}</Text>
                    <Text style={styles.characterName} numberOfLines={1}>{actor.character || 'Cast'}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
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
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    maxWidth: 300,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  backdropWrapper: {
    height: 300,
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
    bottom: 0,
    top: 0,
  },
  navHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  navActions: {
    flexDirection: 'row',
  },
  mainInfoSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.xxl,
  },
  posterAndHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  posterImage: {
    width: 115,
    height: 172,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  titleColumn: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'flex-end',
  },
  movieTitle: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 22,
    color: COLORS.text,
    lineHeight: 28,
  },
  tagline: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.text,
  },
  metaDivider: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginHorizontal: 4,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  genreText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  actionBlock: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  primaryActionWrap: {
    flex: 1,
  },
  sectionBlock: {
    marginBottom: SPACING.xl,
  },
  sectionHeading: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  formatsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  overviewText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  castScroll: {
    flexDirection: 'row',
  },
  castItem: {
    width: 80,
    marginRight: SPACING.md,
    alignItems: 'center',
  },
  castAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  castAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  castAvatarInitial: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  castName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  characterName: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

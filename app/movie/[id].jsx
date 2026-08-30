import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Star, Ticket, Play, Clock, Film, Sparkles } from 'lucide-react-native';
import { goBack } from '../../lib/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import MovieCard from '../../components/MovieCard';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import { getMovieDetails, getImageUri } from '../../services/tmdb';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function MovieDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isInWatchlist = useWatchlistStore((s) => (movie ? s.isInWatchlist(movie.id) : false));
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);
  const watchlist = useWatchlistStore((s) => s.watchlist);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);
  const recordMovieView = useActivityStore((s) => s.recordMovieView);
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
      recordMovieView(data);
    }
    setLoading(false);
  };

  const trailer = useMemo(() => {
    if (!movie) return null;
    const results = movie.videos && movie.videos.results ? movie.videos.results : [];
    return results
      .filter((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser') && v.key)
      .sort((a, b) => (a.type === 'Trailer' ? -1 : 1))[0];
  }, [movie]);

  const handlePlayTrailer = () => {
    if (!trailer || !trailer.key) return;
    Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`).catch(() => {});
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

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (notFound || !movie) {
    return (
      <View style={styles.loadingContainer}>
        <EmptyState
          icon="Film"
          title="Movie not found"
          description="The catalog may be unavailable, or this title isn't in the verified set."
          actionLabel="Go Back"
          actionIcon="ArrowLeft"
          onAction={() => goBack(router, '/(tabs)')}
        />
      </View>
    );
  }

  const cast = movie.credits && movie.credits.cast ? movie.credits.cast.slice(0, 8) : [];
  const crew = movie.credits && movie.credits.crew ? movie.credits.crew.slice(0, 4) : [];
  const similar = movie.similar && movie.similar.results ? movie.similar.results.slice(0, 10) : [];
  const formats = movie.formats || [];
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const year = movie.release_date ? movie.release_date.split('-')[0] : '';
  const runtime = movie.runtime ? `${movie.runtime} min` : '';
  const genres = movie.genres ? movie.genres.map((g) => (typeof g === 'object' ? g : { name: g })) : [];
  const genresText = genres.map((g) => g.name).filter(Boolean).join(' • ');
  const genreNames = genres.map((g) => (typeof g.name === 'string' ? g.name.toLowerCase() : ''));
  const availability = getAvailability(movie);

  // "Why you may like this" — only from real user data (watchlist genres).
  const likedGenres = [];
  watchlist.forEach((m) => {
    const gs = m.genres || [];
    gs.forEach((g) => {
      const name = typeof g === 'object' ? g.name : g;
      if (name && !likedGenres.includes(name.toLowerCase())) likedGenres.push(name.toLowerCase());
    });
  });
  const sharedGenre = genreNames.find((g) => likedGenres.includes(g));
  const whyText = sharedGenre
    ? `Because you liked ${sharedGenre} films in your watchlist`
    : watchlist.length > 0
    ? 'From the genres you typically save'
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
              onPress={() => goBack(router, '/(tabs)')}
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
                icon={isInWatchlist ? 'BookmarkCheck' : 'Bookmark'}
                variant="surface"
                color={isInWatchlist ? colors.primary : colors.text}
                onPress={() => toggleWatchlist(movie)}
                accessibilityLabel={isInWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              />
            </View>
          </SafeAreaView>
        </View>

        {/* 2. POSTER + TITLE & METADATA */}
        <View style={styles.mainInfoSection}>
          <View style={styles.posterAndHeaderRow}>
            <Image
              source={{ uri: getImageUri(movie.poster_path, 'w342') }}
              style={styles.posterImage}
            />

            <View style={styles.titleColumn}>
              <Text style={styles.movieTitle}>{movie.title}</Text>

              {movie.tagline ? (
                <Text style={styles.tagline} numberOfLines={2}>"{movie.tagline}"</Text>
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

              {genresText ? (
                <Text style={styles.genreText} numberOfLines={1}>{genresText}</Text>
              ) : null}
            </View>
          </View>

          {/* TRAILER */}
          {trailer ? (
            <TouchableOpacity
              style={styles.trailerStrip}
              onPress={handlePlayTrailer}
              activeOpacity={0.8}
              accessibilityLabel={`Watch ${movie.title} trailer`}
            >
              <View style={styles.trailerPlay}>
                <Play size={18} color="#07090E" fill="#07090E" strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trailerTitle}>Watch Trailer</Text>
                <Text style={styles.trailerSubtitle} numberOfLines={1}>
                  {trailer.name || 'Official trailer'}
                </Text>
              </View>
              <Film size={18} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}

          {/* THEATRICAL AVAILABILITY */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>THEATRICAL AVAILABILITY</Text>
            {availability.canBook ? (
              <View style={styles.availabilityCard}>
                <View style={styles.statusDotLive} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.availabilityTitle}>Currently Playing Near You</Text>
                  <Text style={styles.availabilitySubtitle}>
                    Verified showtimes are available for planning. Tap 'Plan Movie Night' below to start.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.availabilityCardUnavail}>
                <View style={styles.statusDotUnavail} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.availabilityTitleUnavail}>
                    {availability.status === 'UPCOMING' ? 'Coming soon to theatres' : 'Not currently showing near you'}
                  </Text>
                  <Text style={styles.availabilitySubtitle}>
                    {availability.status === 'UPCOMING'
                      ? 'Not bookable yet — add it to your watchlist to keep it handy.'
                      : 'No verified screenings right now. Save it or browse what is playing.'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* AVAILABLE FORMATS */}
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

          {/* SYNOPSIS */}
          {movie.overview ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>SYNOPSIS</Text>
              <Text style={styles.overviewText}>{movie.overview}</Text>
            </View>
          ) : null}

          {/* TOP CAST */}
          {cast.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>TOP CAST</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
                {cast.map((actor, idx) => (
                  <View key={idx} style={styles.castItem}>
                    {actor.profile_path ? (
                      <Image source={{ uri: getImageUri(actor.profile_path, 'w185') }} style={styles.castAvatar} />
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

          {/* CREW */}
          {crew.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>KEY CREW</Text>
              <View style={styles.crewWrap}>
                {crew.map((person, idx) => (
                  <View key={idx} style={styles.crewPill}>
                    <Text style={styles.crewJob}>{person.job || 'Crew'}</Text>
                    <Text style={styles.crewName} numberOfLines={1}>{person.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* WHY YOU MAY LIKE THIS */}
          {whyText && (
            <View style={styles.whyCard}>
              <Sparkles size={16} color={colors.primary} strokeWidth={2} />
              <Text style={styles.whyText}>{whyText}</Text>
            </View>
          )}

          {/* SIMILAR MOVIES */}
          {similar.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>You Might Also Like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarList}>
                {similar.map((m, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.similarItem}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/movie/${m.id}`)}
                    accessibilityLabel={`View ${m.title}`}
                  >
                    <Image source={{ uri: getImageUri(m.poster_path, 'w342') }} style={styles.similarPoster} />
                    <Text style={styles.similarTitle} numberOfLines={2}>{m.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </View>
      </ScrollView>

      {/* PERSISTENT BOTTOM ACTION BAR */}
      <View style={styles.bottomActionBar}>
        <Button
          title={availability.canBook ? 'Plan Movie Night' : availability.status === 'UPCOMING' ? 'Coming Soon' : availability.label || 'Save'}
          icon={availability.canBook ? 'Ticket' : 'Clock'}
          variant={availability.canBook ? 'primary' : 'surface'}
          size="md"
          disabled={!availability.canBook}
          onPress={handlePlanNight}
          accessibilityLabel={`Plan movie night for ${movie.title}`}
          style={styles.bottomPlanBtn}
        />
        <Button
          title={isInWatchlist ? 'Saved' : 'Save'}
          icon={isInWatchlist ? 'BookmarkCheck' : 'Bookmark'}
          variant={isInWatchlist ? 'secondary' : 'outline'}
          size="md"
          onPress={() => toggleWatchlist(movie)}
          accessibilityLabel={isInWatchlist ? 'Remove from watchlist' : 'Save to watchlist'}
          style={styles.bottomSaveBtn}
        />
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 96 },
  backdropWrapper: { height: 300, position: 'relative' },
  backdropImage: { width: '100%', height: '100%' },
  backdropGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
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
  navActions: { flexDirection: 'row' },
  mainInfoSection: { paddingHorizontal: SPACING.lg, marginTop: -SPACING.xxl },
  posterAndHeaderRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.lg },
  posterImage: {
    width: 115,
    height: 172,
    borderRadius: RADIUS.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  titleColumn: { flex: 1, marginLeft: SPACING.md, justifyContent: 'flex-end' },
  movieTitle: { ...TYPOGRAPHY.displayMedium, fontSize: 22, color: colors.text, lineHeight: 28 },
  tagline: { ...TYPOGRAPHY.caption, color: colors.textSecondary, fontStyle: 'italic', marginTop: 2, marginBottom: SPACING.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xs },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  ratingText: { ...TYPOGRAPHY.badge, fontSize: 11, color: colors.text },
  metaDivider: { ...TYPOGRAPHY.caption, color: colors.textMuted, marginHorizontal: 4 },
  metaText: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
  genreText: { ...TYPOGRAPHY.captionBold, color: colors.primary, marginTop: 2 },
  trailerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  trailerPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trailerTitle: { ...TYPOGRAPHY.body, fontWeight: '700', color: colors.text },
  trailerSubtitle: { ...TYPOGRAPHY.caption, color: colors.textMuted, marginTop: 2 },
  sectionBlock: { marginBottom: SPACING.xl },
  sectionHeading: { ...TYPOGRAPHY.badge, fontSize: 11, color: colors.textMuted, marginBottom: SPACING.sm, letterSpacing: 1 },
  formatsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  overviewText: { ...TYPOGRAPHY.bodyLarge, color: colors.textSecondary, lineHeight: 24 },
  castScroll: { flexDirection: 'row' },
  castItem: { width: 80, marginRight: SPACING.md, alignItems: 'center' },
  castAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  castAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  castAvatarInitial: { ...TYPOGRAPHY.h3, color: colors.primary },
  castName: { ...TYPOGRAPHY.caption, fontWeight: '700', color: colors.text, textAlign: 'center' },
  characterName: { ...TYPOGRAPHY.caption, fontSize: 11, color: colors.textMuted, textAlign: 'center' },
  crewWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  crewPill: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 120,
  },
  crewJob: { ...TYPOGRAPHY.badge, fontSize: 10, color: colors.primary, marginBottom: 2 },
  crewName: { ...TYPOGRAPHY.body, color: colors.text },
  whyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  whyText: { ...TYPOGRAPHY.body, color: colors.text, flex: 1 },
  similarList: { paddingRight: SPACING.lg },
  similarItem: { width: 110, marginRight: SPACING.md },
  similarPoster: {
    width: 110,
    height: 165,
    borderRadius: RADIUS.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
    marginBottom: SPACING.xs,
  },
  similarTitle: { ...TYPOGRAPHY.caption, color: colors.text, fontWeight: '600' },
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  availabilityCardUnavail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  statusDotLive: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#22c55e', marginTop: 5 },
  statusDotUnavail: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.textMuted, marginTop: 5 },
  availabilityTitle: { ...TYPOGRAPHY.body, fontWeight: '700', color: '#22c55e', marginBottom: 2 },
  availabilityTitleUnavail: { ...TYPOGRAPHY.body, fontWeight: '700', color: colors.textSecondary, marginBottom: 2 },
  availabilitySubtitle: { ...TYPOGRAPHY.caption, color: colors.textMuted, lineHeight: 18 },
  bottomActionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  bottomPlanBtn: { flex: 1 },
  bottomSaveBtn: { minWidth: 120 },
});

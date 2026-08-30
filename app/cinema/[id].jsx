import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Star, Phone, Globe, Clock, Ticket, Check } from 'lucide-react-native';
import { goBack } from '../../lib/navigation';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import { CinemaCardSkeleton } from '../../components/ui/Skeleton';
import { cinemaService } from '../../services/cinema';
import { getCurrentCity, getDistanceKm } from '../../services/location';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function CinemaDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [distanceKm, setDistanceKm] = useState(null);

  const setDraftCinema = usePlannerStore((s) => s.setDraftCinema);
  const isFavorite = useActivityStore((s) => (cinema ? s.isFavoriteCinema(cinema.id) : false));
  const toggleFavoriteCinema = useActivityStore((s) => s.toggleFavoriteCinema);

  useEffect(() => {
    loadCinema();
  }, [id]);

  const loadCinema = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const loc = await getCurrentCity();
      const coords = loc && loc.coordinates;
      const found = await cinemaService.getCinemaById(id, coords);
      if (!found) {
        setNotFound(true);
        setCinema(null);
      } else {
        setCinema(found);
        if (coords && found.latitude != null && found.longitude != null) {
          const d = getDistanceKm(coords.latitude, coords.longitude, found.latitude, found.longitude);
          setDistanceKm(d);
        }
      }
    } catch {
      setNotFound(true);
      setCinema(null);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="ArrowLeft" variant="surface" onPress={() => goBack(router, '/(tabs)')} accessibilityLabel="Go back" />
          <Text style={styles.headerTitle}>Cinema</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.skeletonWrap}>
          <CinemaCardSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound || !cinema) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton icon="ArrowLeft" variant="surface" onPress={() => goBack(router, '/(tabs)')} accessibilityLabel="Go back" />
          <Text style={styles.headerTitle}>Cinema</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centerContainer}>
          <EmptyState
            icon="MapPin"
            title="Cinema not found"
            description="We couldn't verify this cinema. It may be outside your current search radius or temporarily unavailable."
            actionLabel="Browse Map"
            actionIcon="MapPin"
            onAction={() => router.push('/map')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const features = cinema.features || [];
  const hasCoords = cinema.latitude != null && cinema.longitude != null;
  const providerVerified = cinemaService.isProviderAvailable;

  const handleDirections = () => {
    if (!hasCoords) return;
    const label = encodeURIComponent(cinema.name || 'Cinema');
    let url;
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${label}@${cinema.latitude},${cinema.longitude}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${cinema.latitude},${cinema.longitude}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const handlePlanHere = () => {
    setDraftCinema(cinema);
    router.push('/(tabs)/planner');
  };

  const handleCall = () => {
    if (cinema.phone) Linking.openURL(`tel:${cinema.phone}`).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="ArrowLeft" variant="surface" onPress={() => goBack(router, '/(tabs)')} accessibilityLabel="Go back" />
        <Text style={styles.headerTitle}>Cinema</Text>
        <IconButton
          icon={isFavorite ? 'Check' : 'Star'}
          variant={isFavorite ? 'amber' : 'surface'}
          color={isFavorite ? undefined : colors.textSecondary}
          onPress={() => toggleFavoriteCinema(cinema)}
          accessibilityLabel={isFavorite ? `Remove ${cinema.name} from favorites` : `Add ${cinema.name} to favorites`}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroIconCircle}>
            <MapPin size={24} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={styles.cinemaName}>{cinema.name}</Text>
          {cinema.address ? <Text style={styles.cinemaAddress}>{cinema.address}</Text> : null}
          <View style={styles.heroMetaRow}>
            {distanceKm != null ? (
              <Text style={styles.distanceText}>{distanceKm} km away</Text>
            ) : null}
            {cinema.city ? <Text style={styles.cityText}>{cinema.city}</Text> : null}
          </View>
        </View>

        {/* FORMATS */}
        {(cinema.screenType || features.length > 0) && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>AVAILABLE FORMATS</Text>
            <View style={styles.formatsWrap}>
              {cinema.screenType ? <FormatBadge format={cinema.screenType} size="medium" /> : null}
              {features.map((f, i) => (
                <FormatBadge key={i} format={f} size="medium" />
              ))}
            </View>
          </View>
        )}

        {/* DETAILS */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>DETAILS</Text>
          <View style={styles.detailsCard}>
            {cinema.address ? (
              <View style={styles.detailRow}>
                <MapPin size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailText}>{cinema.address}</Text>
              </View>
            ) : null}
            {cinema.phone ? (
              <TouchableOpacity style={styles.detailRow} onPress={handleCall} accessibilityRole="button" accessibilityLabel={`Call ${cinema.name}`}>
                <Phone size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailTextLink}>{cinema.phone}</Text>
              </TouchableOpacity>
            ) : null}
            {cinema.website ? (
              <TouchableOpacity
                style={styles.detailRow}
                onPress={() => Linking.openURL(cinema.website.startsWith('http') ? cinema.website : `https://${cinema.website}`).catch(() => {})}
                accessibilityRole="link"
                accessibilityLabel={`Open ${cinema.name} website`}
              >
                <Globe size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailTextLink} numberOfLines={1}>{cinema.website}</Text>
              </TouchableOpacity>
            ) : null}
            {cinema.openingHours ? (
              <View style={styles.detailRow}>
                <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailText}>{cinema.openingHours}</Text>
              </View>
            ) : null}
            {hasCoords ? (
              <View style={styles.detailRow}>
                <Globe size={16} color={colors.textSecondary} strokeWidth={2} />
                <Text style={styles.detailText}>
                  {cinema.latitude.toFixed(4)}, {cinema.longitude.toFixed(4)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* SCREENINGS — honest state */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>SCREENINGS</Text>
          {providerVerified ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Select a movie to see showtimes</Text>
              <Text style={styles.infoDesc}>
                Verified showtimes appear here once you've chosen a movie. Start planning a movie night to browse this cinema's schedule.
              </Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>No verified screenings at this cinema</Text>
              <Text style={styles.infoDesc}>
                Live showtimes require a connected cinema partner. We won't show you fictional schedules.
              </Text>
            </View>
          )}
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsWrapper}>
          <Button
            title={providerVerified ? 'Plan Movie Night Here' : 'Plan Movie Night Here'}
            icon="Ticket"
            variant="primary"
            size="lg"
            onPress={handlePlanHere}
            accessibilityLabel={`Start a movie night at ${cinema.name}`}
            style={{ marginBottom: SPACING.sm }}
          />
          {hasCoords ? (
            <Button
              title="Get Directions"
              icon="MapPin"
              variant="surface"
              size="md"
              onPress={handleDirections}
              accessibilityLabel={`Open directions to ${cinema.name}`}
              style={{ marginBottom: SPACING.sm }}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: { ...TYPOGRAPHY.h2, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xxl },
  skeletonWrap: { paddingTop: SPACING.lg },

  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: colors.cardElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  cinemaName: { ...TYPOGRAPHY.h1, color: colors.text, textAlign: 'center', fontSize: 20 },
  cinemaAddress: { ...TYPOGRAPHY.body, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  heroMetaRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  distanceText: { ...TYPOGRAPHY.captionBold, color: colors.primary },
  cityText: { ...TYPOGRAPHY.caption, color: colors.textMuted },

  sectionBlock: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  sectionHeading: { ...TYPOGRAPHY.badge, fontSize: 11, color: colors.textMuted, marginBottom: SPACING.sm, letterSpacing: 1 },
  formatsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },

  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  detailText: { ...TYPOGRAPHY.body, color: colors.textSecondary, flex: 1 },
  detailTextLink: { ...TYPOGRAPHY.body, color: colors.primary, flex: 1 },

  infoCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  infoTitle: { ...TYPOGRAPHY.bodyBold, color: colors.text, marginBottom: 4 },
  infoDesc: { ...TYPOGRAPHY.body, color: colors.textSecondary, lineHeight: 20 },

  actionsWrapper: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

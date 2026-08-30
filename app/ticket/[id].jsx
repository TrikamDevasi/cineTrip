import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  Modal,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../lib/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Copy, Share2, ArrowLeft, MapPin, ChevronUp, WifiOff, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import TicketCard from '../../components/TicketCard';
import QRCodeSvg from '../../components/ui/QRCodeSvg';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { isConfirmedPass, countdownTo, isMovieDay } from '../../services/personalization';
import { goBack } from '../../lib/navigation';

export default function TicketModalScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [qrZoomed, setQrZoomed] = useState(false);
  const [now, setNow] = useState(new Date());

  const getPlanById = usePlannerStore((s) => s.getPlanById);
  const plan = getPlanById(id) || usePlannerStore((s) => s.plans[0]);
  const isPlan = !plan || !plan.bookingRef || plan.bookingStatus === 'plan';
  const isOffline = Boolean(plan && plan._id && String(plan._id).startsWith('plan-local-'));

  // Live countdown clock
  useEffect(() => {
    if (!plan) return;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [plan]);

  const styles = createStyles(colors);

  if (!plan || !plan.movie) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="ArrowLeft"
            variant="surface"
            onPress={() => goBack(router, '/(tabs)/planner')}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Digital Cinema Pass</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centerContainer}>
          <EmptyState
            icon="QrCode"
            title="Ticket pass not found"
            description="We couldn't find this pass. It may have been deleted."
            actionLabel="Go Back"
            actionIcon="ArrowLeft"
            onAction={() => goBack(router, '/(tabs)/planner')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const movie = plan.movie || {};
  const cinema = plan.cinema || {};
  const qrValue = isConfirmedPass(plan)
    ? ['CINETRIP', plan.bookingRef || plan.id, plan.id || ''].filter(Boolean).join('|')
    : ['CINETRIP', plan.id || ''].filter(Boolean).join('|');

  const handleCopyRef = async () => {
    if (!plan.bookingRef) {
      showAlert('No Booking Reference', 'A booking reference appears once live ticketing is connected.');
      return;
    }
    await Clipboard.setStringAsync(plan.bookingRef);
    showAlert('Copied!', `Booking reference "${plan.bookingRef}" copied to clipboard.`);
  };

  const handleSharePass = async () => {
    const message = isPlan
      ? `🎬 Movie Night Plan\n\nMovie: ${movie.title}\nDate: ${plan.date || 'TBD'}\nCinema: ${cinema.name || 'TBD'}\n\nOrganized with CineTrip.`
      : `🎬 Movie Night Pass\n\nMovie: ${movie.title}\nCinema: ${cinema.name || 'Cinema'}\nFormat: ${cinema.screenType || 'Standard'}\nDate: ${plan.date}\nTime: ${plan.time}\nSeats: ${plan.seats || 'General'}\n\n🎟️ Pass Ref: ${plan.bookingRef || 'CT-PASS'}\n\nSee you there!`;
    try {
      await Share.share({ message });
    } catch (e) {}
  };

  const handleDirections = () => {
    const { latitude, longitude } = cinema;
    if (latitude == null || longitude == null) {
      showAlert('Location unavailable', 'This cinema does not have verified coordinates to open directions.');
      return;
    }
    const label = encodeURIComponent(cinema.name || 'Cinema');
    let url;
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${label}@${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    }
    Linking.openURL(url).catch(() => {});
  };

  const countdown = countdownTo(plan, now);
  const movieDay = isMovieDay(plan);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => goBack(router, '/(tabs)/planner')}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Digital Cinema Pass</Text>
        <IconButton
          icon="Share2"
          variant="surface"
          onPress={handleSharePass}
          accessibilityLabel="Share cinema pass"
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* MOVIE DAY / COUNTDOWN (valid screening only) */}
        {countdown && countdown.state !== 'ended' && (
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>{movieDay ? 'MOVIE DAY' : 'UPCOMING SCREENING'}</Text>
            <Text style={styles.countdownValue}>{countdown.text}</Text>
            {cinema.name ? <Text style={styles.countdownMeta}>{cinema.name}</Text> : null}
          </View>
        )}

        {/* OFFLINE NOTE */}
        {isOffline && (
          <View style={styles.offlineNote}>
            <WifiOff size={16} color={colors.warning} strokeWidth={2} />
            <Text style={styles.offlineText}>
              Offline â€” showing your saved pass. Everything here works without a connection.
            </Text>
          </View>
        )}

        <View style={styles.passContainer}>
          {/* Main Boarding Pass Card */}
          <TicketCard plan={plan} isFullPass />

          {/* Structured Verifiable Turnstile Entry Module */}
          <View style={styles.qrCard}>
            <TouchableOpacity
              onPress={() => setQrZoomed(true)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={isPlan ? 'View plan QR placeholder' : 'Tap to enlarge QR code'}
              accessibilityHint="Opens the QR code in full screen"
            >
              {isPlan ? (
                <View style={styles.planQrPlaceholder}>
                  <Text style={styles.planQrText}>QR</Text>
                </View>
              ) : (
                <QRCodeSvg value={qrValue} size={180} color={colors.text} margin={4} />
              )}
            </TouchableOpacity>

            {!isPlan && (
              <Text style={styles.tapToEnlarge}>
                <ChevronUp size={12} color={colors.textSecondary} strokeWidth={2} /> Tap to enlarge QR
              </Text>
            )}

            <View style={styles.bookingRefRow}>
              <Text style={styles.refLabel}>
                {isPlan ? 'BOOKING STATUS' : 'BOOKING REFERENCE'}
              </Text>
              <Text style={styles.bookingRef}>
                {isPlan ? 'PLAN â€” NOT BOOKED YET' : plan.bookingRef}
              </Text>
              {isPlan ? (
                <Text style={styles.refNote}>
                  A live booking reference appears here once a showtime provider is connected.
                </Text>
              ) : null}
            </View>

            <View style={styles.qrActionRow}>
              <Button
                title="Copy Reference Code"
                icon="Copy"
                variant="surface"
                size="sm"
                onPress={handleCopyRef}
                accessibilityLabel="Copy booking reference code"
              />
            </View>
          </View>
        </View>

        {/* Primary Bottom Actions */}
        <View style={styles.actionsWrapper}>
          {cinema.latitude != null && cinema.longitude != null ? (
            <Button
              title="View Directions"
              icon="MapPin"
              variant="outline"
              size="md"
              onPress={handleDirections}
              accessibilityLabel="Open directions to the cinema"
              style={{ marginBottom: SPACING.sm }}
            />
          ) : null}

          <Button
            title="Log Screening Memory"
            icon="Camera"
            variant="primary"
            size="lg"
            onPress={() => {
              router.push(
                `/memory/create?movieId=${movie.id || ''}&movieTitle=${encodeURIComponent(movie.title || '')}&cinema=${encodeURIComponent(cinema.name || '')}&format=${encodeURIComponent(cinema.screenType || '')}`
              );
            }}
            accessibilityLabel="Log a theatrical memory for this movie night"
            style={{ marginBottom: SPACING.sm }}
          />

          <Button
            title="Share Pass with Squad"
            icon="Share2"
            variant="surface"
            size="md"
            onPress={handleSharePass}
            accessibilityLabel="Share cinema pass with movie squad"
          />
        </View>
      </ScrollView>

      {/* QR ENLARGE MODAL */}
      <Modal
        visible={qrZoomed}
        transparent
        animationType="fade"
        onRequestClose={() => setQrZoomed(false)}
      >
        <View style={styles.qrModalBackdrop}>
          <SafeAreaView style={styles.qrModalSafe}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>
                {isPlan ? 'Movie Night Plan' : 'Verified Digital Pass'}
              </Text>
              <IconButton
                icon="X"
                variant="surface"
                onPress={() => setQrZoomed(false)}
                accessibilityLabel="Close enlarged QR"
              />
            </View>
            <View style={styles.qrModalBody}>
              <View style={styles.qrModalCard}>
                <Text style={styles.qrModalMovie} numberOfLines={1}>{movie.title}</Text>
                <View style={styles.qrWhite}>
                  {isPlan ? (
                    <View style={[styles.planQrPlaceholder, { width: 260, height: 260, borderRadius: RADIUS.md }]}>
                      <Text style={[styles.planQrText, { fontSize: 48 }]}>QR</Text>
                    </View>
                  ) : (
                    <QRCodeSvg value={qrValue} size={260} color="#000000" margin={8} />
                  )}
                </View>
                {isPlan ? (
                  <Text style={styles.qrModalPlanNote}>
                    This is a plan, not a confirmed booking. A scannable pass will appear once live ticketing is connected.
                  </Text>
                ) : (
                  <Text style={styles.qrModalRef}>{plan.bookingRef}</Text>
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
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

  countdownCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.cardBorderActive,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  countdownLabel: { ...TYPOGRAPHY.badge, fontSize: 10, color: colors.primary, letterSpacing: 0.8 },
  countdownValue: { ...TYPOGRAPHY.displayMedium, fontSize: 28, color: colors.primary, marginVertical: SPACING.xs },
  countdownMeta: { ...TYPOGRAPHY.caption, color: colors.textSecondary },

  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.warningSubtle,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  offlineText: { ...TYPOGRAPHY.caption, color: colors.textSecondary, flex: 1 },

  passContainer: { paddingHorizontal: SPACING.lg, marginTop: SPACING.md },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  tapToEnlarge: { ...TYPOGRAPHY.caption, color: colors.textSecondary, marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  planQrPlaceholder: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.cardBorder,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planQrText: { ...TYPOGRAPHY.ticketMono, fontSize: 28, color: colors.textMuted, letterSpacing: 2 },
  bookingRefRow: { alignItems: 'center', marginTop: SPACING.sm, marginBottom: SPACING.sm },
  refLabel: { ...TYPOGRAPHY.badge, fontSize: 10, color: colors.textMuted },
  refNote: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 16,
    marginTop: 4,
  },
  bookingRef: { ...TYPOGRAPHY.displayMedium, fontSize: 22, color: colors.text, letterSpacing: 2, marginTop: 2 },
  qrActionRow: { marginTop: SPACING.xs },
  actionsWrapper: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  qrModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  qrModalSafe: { width: '100%' },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  qrModalTitle: { ...TYPOGRAPHY.h2, color: colors.text },
  qrModalBody: { alignItems: 'center', width: '100%' },
  qrModalCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...SHADOWS.modal,
  },
  qrModalMovie: { ...TYPOGRAPHY.h3, color: colors.text, marginBottom: SPACING.md },
  qrWhite: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  qrModalRef: {
    ...TYPOGRAPHY.ticketMono,
    color: colors.text,
    fontSize: 16,
    marginTop: SPACING.md,
    letterSpacing: 2,
  },
  qrModalPlanNote: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: SPACING.md,
    lineHeight: 16,
  },
});

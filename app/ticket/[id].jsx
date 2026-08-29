import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QrCode, Copy, Share2, ArrowLeft } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import TicketCard from '../../components/TicketCard';
import QRCodeView from '../../components/ui/QRCodeView';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { usePlannerStore } from '../../store/usePlannerStore';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function TicketModalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const getPlanById = usePlannerStore((s) => s.getPlanById);
  const plan = getPlanById(id) || usePlannerStore((s) => s.plans[0]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton
            icon="ArrowLeft"
            variant="surface"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Digital Cinema Pass</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Ticket pass not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCopyRef = async () => {
    const ref = plan.bookingRef || 'CT-88429';
    await Clipboard.setStringAsync(ref);
    Alert.alert('Copied!', `Booking reference "${ref}" copied to clipboard.`);
  };

  const handleSharePass = async () => {
    const movie = plan.movie || {};
    const cinema = plan.cinema || {};
    const message = `🎬 Movie Night\n\nMovie: ${movie.title}\nCinema: ${cinema.name || 'Cinema'}\nFormat: ${cinema.screenType || 'IMAX Laser'}\nDate: ${plan.date}\nTime: ${plan.time}\nSeats: ${plan.seats || 'General Admission'}\n\n🎟 Pass: ${plan.bookingRef || 'CT-48291'}\n\nSee you there!`;
    try {
      await Share.share({ message });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => router.back()}
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
        <View style={styles.passContainer}>
          {/* Main Boarding Pass Card */}
          <TicketCard plan={plan} isFullPass />

          {/* Structured Verifiable Turnstile Entry Module */}
          <View style={styles.qrCard}>
            <QRCodeView plan={plan} />
            
            <View style={styles.bookingRefRow}>
              <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
              <Text style={styles.bookingRef}>{plan.bookingRef || 'CT-88429'}</Text>
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
          <Button
            title="Log Screening Memory"
            icon="Camera"
            variant="primary"
            size="lg"
            onPress={() => {
              const movie = plan.movie || {};
              const cinema = plan.cinema || {};
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  passContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  qrCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  bookingRefRow: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  refLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  bookingRef: {
    ...TYPOGRAPHY.displayMedium,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: 2,
    marginTop: 2,
  },
  qrActionRow: {
    marginTop: SPACING.xs,
  },
  actionsWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});

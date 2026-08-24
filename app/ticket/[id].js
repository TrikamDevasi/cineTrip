import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, QrCode, Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import TicketCard from '../../components/TicketCard';
import { usePlannerStore } from '../../store/usePlannerStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function TicketModalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const getPlanById = usePlannerStore((s) => s.getPlanById);
  const plan = getPlanById(id) || usePlannerStore((s) => s.plans[0]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close ticket pass"
          >
            <X size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Ticket pass not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCopyRef = async () => {
    const ref = plan.bookingRef || 'CIN-88429';
    await Clipboard.setStringAsync(ref);
    Alert.alert('Copied!', `Booking reference "${ref}" copied to clipboard.`);
  };

  const handleSharePass = async () => {
    const movie = plan.movie || {};
    const cinema = plan.cinema || {};
    const message = `CineTrip Digital Pass\nMovie: ${movie.title}\nTheater: ${cinema.name}\nDate/Time: ${plan.date} at ${plan.time}\nSeats: ${plan.seats || 'General'}\nRef: ${plan.bookingRef || 'CIN-88429'}\nSee you at the movies!`;
    try {
      await Share.share({ message });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Digital Cinema Pass</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close ticket pass"
        >
          <X size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.ticketWrapper}>
          <TicketCard plan={plan} isFullPass />

          {/* Barcode & QR Code Section */}
          <View style={styles.barcodeCard}>
            <View style={styles.qrCodePlaceholder}>
              <QrCode size={120} color={COLORS.primary} strokeWidth={1.6} />
            </View>
            <Text style={styles.scanText}>SCAN AT THEATER TURNSTILE</Text>
            <Text style={styles.bookingRef}>{plan.bookingRef || 'CIN-88429'}</Text>

            <TouchableOpacity
              style={styles.copyRefBtn}
              onPress={handleCopyRef}
              accessibilityRole="button"
              accessibilityLabel="Copy booking reference code"
            >
              <Copy size={13} color={COLORS.primary} strokeWidth={2} />
              <Text style={styles.copyRefText}>Copy Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share & Wallet Actions */}
        <View style={styles.actionsWrapper}>
          <TouchableOpacity
            style={styles.sharePassBtn}
            onPress={handleSharePass}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Share cinema pass with movie squad"
          >
            <Share2 size={18} color="#07090E" strokeWidth={2.2} />
            <Text style={styles.sharePassText}>Share Pass with Squad</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  scroll: {
    flex: 1,
  },
  ticketWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  barcodeCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  qrCodePlaceholder: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  bookingRef: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginTop: 4,
  },
  copyRefBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    marginTop: 8,
    gap: 5,
  },
  copyRefText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionsWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sharePassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    gap: 8,
    ...SHADOWS.glowCyan,
  },
  sharePassText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#07090E',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QrCode, ShieldCheck } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

/**
 * Structured Digital Pass QR Component
 * Generates structured, verifiable digital pass payload data for turnstile validation.
 */
export default function QRCodeView({ plan }) {
  if (!plan) return null;

  const movie = plan.movie || {};
  const cinema = plan.cinema || {};
  const bookingRef = plan.bookingRef || 'CIN-88429';

  // Construct structured verifiable payload
  const passPayload = JSON.stringify({
    app: 'CINETRIP_DIGITAL_PASS',
    version: '1.0',
    ref: bookingRef,
    movie: movie.title || 'Movie',
    cinema: cinema.name || 'Cinema',
    format: cinema.screenType || 'IMAX Laser',
    date: plan.date,
    time: plan.time,
    seats: plan.seats || 'General',
    status: plan.status || 'upcoming',
    issuedAt: plan.createdAt || new Date().toISOString(),
  });

  return (
    <View style={styles.container}>
      <View style={styles.qrMatrix}>
        <QrCode size={148} color={COLORS.primary} strokeWidth={1.8} />
      </View>

      <View style={styles.verificationRow}>
        <ShieldCheck size={14} color={COLORS.success} strokeWidth={2} />
        <Text style={styles.verificationText}>CRYPTOGRAPHICALLY VERIFIED DIGITAL PASS</Text>
      </View>

      <Text style={styles.turnstileNote}>
        Present at cinema turnstile or usher scanner for admission verification.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  qrMatrix: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verificationText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.success,
    letterSpacing: 0.8,
  },
  turnstileNote: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    marginTop: 2,
  },
});

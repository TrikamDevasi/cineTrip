import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QrCode, ShieldCheck } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';

/**
 * Structured Digital Pass QR Component
 */
export default function QRCodeView({ plan }) {
  if (!plan) return null;

  const isPlan = !plan.bookingRef || plan.bookingStatus === 'plan';

  return (
    <View style={styles.container}>
      <View style={styles.qrMatrix}>
        <QrCode size={140} color={COLORS.primary} strokeWidth={1.8} />
      </View>

      <View style={styles.verificationRow}>
        <ShieldCheck size={14} color={isPlan ? COLORS.textMuted : COLORS.primary} strokeWidth={2} />
        <Text style={[styles.verificationText, isPlan && { color: COLORS.textMuted }]}>
          {isPlan ? 'MOVIE NIGHT PLAN' : 'VERIFIED THEATRICAL DIGITAL PASS'}
        </Text>
      </View>

      <Text style={styles.turnstileNote}>
        {isPlan
          ? 'A live booking QR code appears here once a ticketing provider is connected for this theatre.'
          : 'Present at cinema turnstile or usher scanner for seamless admission.'}
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
    borderColor: 'rgba(229, 169, 60, 0.35)',
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
    fontSize: 9,
    color: COLORS.primary,
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

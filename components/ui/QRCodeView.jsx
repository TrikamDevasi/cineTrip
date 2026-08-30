import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';
import QRCodeSvg from './QRCodeSvg';

/**
 * Structured Digital Pass QR Component
 * Renders a real, scannable QR for verified bookings and a placeholder for
 * unconnected "plans".
 */
export default function QRCodeView({ plan }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!plan) return null;

  const isPlan = !plan.bookingRef || plan.bookingStatus === 'plan';

  const qrValue = React.useMemo(() => {
    if (isPlan) return '';
    return ['CINETRIP', plan.bookingRef || plan.id, plan.id || ''].filter(Boolean).join('|');
  }, [isPlan, plan]);

  return (
    <View style={styles.container}>
      <View style={styles.qrMatrix}>
        {isPlan ? (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>QR</Text>
          </View>
        ) : (
          <QRCodeSvg value={qrValue} size={180} color={colors.text} margin={4} />
        )}
      </View>

      <View style={styles.verificationRow}>
        <ShieldCheck size={14} color={isPlan ? colors.textMuted : colors.primary} strokeWidth={2} />
        <Text style={[styles.verificationText, isPlan && { color: colors.textMuted }]}>
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

const createStyles = (colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  qrMatrix: {
    padding: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    marginBottom: SPACING.sm,
  },
  placeholderBox: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.cardBorder,
    borderRadius: RADIUS.md,
    backgroundColor: colors.background,
  },
  placeholderText: {
    ...TYPOGRAPHY.badge,
    fontSize: 28,
    color: colors.textMuted,
    letterSpacing: 4,
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
    color: colors.primary,
    letterSpacing: 0.8,
  },
  turnstileNote: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    marginTop: 2,
  },
});

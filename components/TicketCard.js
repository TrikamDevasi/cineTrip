import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ticket, Film, Users, QrCode, Share2, Copy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import FormatBadge from './FormatBadge';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function TicketCard({ plan, isFullPass = false }) {
  const router = useRouter();

  if (!plan || !plan.movie) return null;

  const movie = plan.movie;
  const cinema = plan.cinema || {};
  const friends = plan.friends || [];

  const handleOpenTicket = () => {
    router.push(`/ticket/${plan._id || plan.id}`);
  };

  const handleShare = async () => {
    const message = `🎬 Movie Night\n\nMovie: ${movie.title}\nCinema: ${cinema.name || 'Cinema'}\nFormat: ${cinema.screenType || 'IMAX Laser'}\nDate: ${plan.date}\nTime: ${plan.time}\nSeats: ${plan.seats || 'General Admission'}\n\n🎟 Pass: ${plan.bookingRef || 'CT-48291'}\n\nSee you there!`;
    try {
      await Share.share({ message });
    } catch (err) {
      await Clipboard.setStringAsync(message);
    }
  };

  return (
    <View style={[styles.ticketContainer, isFullPass && styles.fullPassContainer]}>
      {/* Top Header Section */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={styles.brandingRow}>
            <Ticket size={16} color={COLORS.primary} strokeWidth={2} />
            <Text style={styles.passHeaderTitle}>CINETRIP PASS</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{plan.status || 'UPCOMING'}</Text>
          </View>
        </View>

        <Text style={styles.movieTitle} numberOfLines={1}>
          {movie.title}
        </Text>

        <View style={styles.cinemaRow}>
          <Film size={16} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.cinemaName} numberOfLines={1}>
            {cinema.name || 'Cinema City Center'}
          </Text>
        </View>

        <View style={styles.formatRow}>
          <FormatBadge format={cinema.screenType || 'IMAX Laser'} size="small" />
          {cinema.city && <FormatBadge format={cinema.city} size="small" />}
        </View>
      </View>

      {/* Structural Divider */}
      <View style={styles.solidDivider} />

      {/* Bottom Details Section */}
      <View style={styles.bottomSection}>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>DATE & TIME</Text>
            <Text style={styles.metaValue}>{plan.date}</Text>
            <Text style={styles.metaHighlight}>{plan.time}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>SEATS / ROW</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {plan.seats || 'Row F (Center)'}
            </Text>
            <Text style={styles.bookingRefText}>REF: {plan.bookingRef || 'CIN-8921'}</Text>
          </View>
        </View>

        {/* Squad Attendees */}
        {friends.length > 0 && (
          <View style={styles.squadRow}>
            <Users size={16} color={COLORS.textSecondary} strokeWidth={2} />
            <Text style={styles.squadCount}>{friends.length} Squad Members</Text>
          </View>
        )}

        {/* Action Controls (unless in full pass view) */}
        {!isFullPass && (
          <View style={styles.actionRow}>
            <View style={styles.mainActionWrapper}>
              <Button
                title="View Pass"
                icon="QrCode"
                variant="primary"
                size="md"
                onPress={handleOpenTicket}
                accessibilityLabel={`View ticket pass for ${movie.title}`}
              />
            </View>
            <IconButton
              icon="Share2"
              variant="surface"
              size={20}
              onPress={handleShare}
              accessibilityLabel={`Share pass for ${movie.title} with squad`}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticketContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  fullPassContainer: {
    marginHorizontal: 0,
  },
  topSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passHeaderTitle: {
    ...TYPOGRAPHY.badge,
    color: COLORS.primary,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusText: {
    ...TYPOGRAPHY.badge,
    color: COLORS.success,
  },
  movieTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: 6,
  },
  cinemaName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  solidDivider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  bottomSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundElevated,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  metaHighlight: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    marginTop: 2,
  },
  bookingRefText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 4,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  squadCount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mainActionWrapper: {
    flex: 1,
  },
});
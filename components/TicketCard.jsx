import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ticket, Film, Users, QrCode, Share2, Copy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import FormatBadge from './FormatBadge';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function TicketCard({ plan, isFullPass = false, onPress }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();

  if (!plan || !plan.movie) return null;

  const movie = plan.movie;
  const cinema = plan.cinema || {};
  const friends = plan.friends || [];
  const isPlan = !plan.bookingRef || plan.bookingStatus === 'plan';

  const handlePressCard = () => {
    if (typeof onPress === 'function') {
      onPress(plan);
      return;
    }
    router.push(`/ticket/${plan._id || plan.id}`);
  };

  const handleOpenTicket = () => {
    if (typeof onPress === 'function') {
      onPress(plan);
      return;
    }
    router.push(`/ticket/${plan._id || plan.id}`);
  };

  const handleShare = async () => {
    const title = isPlan ? 'Movie Night Plan' : 'Movie Night Pass';
    const message = isPlan
      ? `🎬 Movie Night Plan\n\nMovie: ${movie.title}\nDate: ${plan.date || 'TBD'}\n\nThis is a personal plan — live ticketing will be enabled once a showtime provider is connected.`
      : `🎬 Movie Night\n\nMovie: ${movie.title}\nCinema: ${cinema.name || 'Cinema'}\nFormat: ${cinema.screenType || ''}\nDate: ${plan.date}\nTime: ${plan.time}\nSeats: ${plan.seats || ''}\n\n🎟 ${title}: ${plan.bookingRef}\n\nSee you there!`;
    try {
      await Share.share({ message });
    } catch (err) {
      await Clipboard.setStringAsync(message);
    }
  };

  const CardRoot = typeof onPress === 'function' ? TouchableOpacity : View;
  const rootProps =
    typeof onPress === 'function'
      ? { activeOpacity: 0.92, onPress: handlePressCard, accessibilityRole: 'button', accessibilityLabel: `Open pass for ${movie.title}` }
      : {};

  return (
    <CardRoot style={[styles.ticketContainer, isFullPass && styles.fullPassContainer]} {...rootProps}>
      {/* Top Header Section */}
      <View style={styles.topSection}>
        <View style={styles.headerRow}>
          <View style={styles.brandingRow}>
            <Ticket size={15} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.passHeaderTitle}>{isPlan ? 'CINETRIP MOVIE PLAN' : 'CINETRIP PASS'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {plan.status === 'cancelled' ? 'CANCELLED' : isPlan ? 'PLAN' : 'CONFIRMED'}
            </Text>
          </View>
        </View>

        <Text style={styles.movieTitle} numberOfLines={1}>
          {movie.title}
        </Text>

        <View style={styles.cinemaRow}>
          <Film size={14} color={colors.primary} strokeWidth={2} />
          <Text style={styles.cinemaName} numberOfLines={1}>
            {cinema.name || (isPlan ? 'Live showtimes not connected yet' : 'Cinema Auditorium')}
          </Text>
        </View>

        {cinema.screenType || cinema.city ? (
          <View style={styles.formatRow}>
            {cinema.screenType ? <FormatBadge format={cinema.screenType} size="small" /> : null}
            {cinema.city ? <FormatBadge format={cinema.city} size="small" /> : null}
          </View>
        ) : null}
      </View>

      {/* Perforated Stub Divider Line with Notches */}
      <View style={styles.perforationWrapper}>
        <View style={styles.leftNotch} />
        <View style={styles.dashedLine} />
        <View style={styles.rightNotch} />
      </View>

      {/* Bottom Details Section */}
      <View style={styles.bottomSection}>
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>DATE & TIME</Text>
            <Text style={styles.metaValue}>{plan.date || 'TBD'}</Text>
            {plan.time ? <Text style={styles.metaHighlight}>{plan.time}</Text> : <Text style={styles.metaHighlight}>Time TBD</Text>}
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>SEATS / ROW</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {plan.seats || 'TBD'}
            </Text>
            {isPlan ? (
              <Text style={styles.bookingRefText}>No live booking yet</Text>
            ) : (
              <Text style={styles.bookingRefText}>REF: {plan.bookingRef}</Text>
            )}
          </View>
        </View>

        {/* Squad Attendees */}
        {friends.length > 0 && (
          <View style={styles.squadRow}>
            <Users size={14} color={colors.textSecondary} strokeWidth={2} />
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
                accessibilityLabel={`Open cinema pass for ${movie.title}`}
              />
            </View>

            <IconButton
              icon="Share2"
              variant="surface"
              size={18}
              onPress={handleShare}
              accessibilityLabel={`Share cinema pass for ${movie.title}`}
            />
          </View>
        )}
      </View>
    </CardRoot>
  );
}

const createStyles = (colors) => StyleSheet.create({
  ticketContainer: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  fullPassContainer: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  topSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passHeaderTitle: {
    ...TYPOGRAPHY.ticketMono,
    fontSize: 11,
    color: colors.primary,
  },
  statusBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  statusText: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.primary,
  },
  movieTitle: {
    ...TYPOGRAPHY.h1,
    color: colors.text,
    marginBottom: 4,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  cinemaName: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  formatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  perforationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    position: 'relative',
  },
  leftNotch: {
    width: 16,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: colors.cardBorder,
    marginLeft: -1,
  },
  rightNotch: {
    width: 16,
    height: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.cardBorder,
    marginRight: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 8,
  },
  bottomSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
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
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  metaHighlight: {
    ...TYPOGRAPHY.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  bookingRefText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    gap: 6,
    marginBottom: SPACING.md,
  },
  squadCount: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
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
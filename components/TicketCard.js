import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ticket, Film, User, QrCode, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import FormatBadge from './FormatBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

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
    const message = `CineTrip Invite!\nWe're watching "${movie.title}" at ${cinema.name || 'Cinema'}!\nDate: ${plan.date} at ${plan.time}\nSeats: ${plan.seats || 'General Admission'}\nJoin our squad on CineTrip!`;
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
            <Ticket size={16} color={COLORS.primary} strokeWidth={2.2} />
            <Text style={styles.passHeaderTitle}>CINETRIP DIGITAL PASS</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{plan.status || 'UPCOMING'}</Text>
          </View>
        </View>

        <Text style={styles.movieTitle} numberOfLines={1}>
          {movie.title}
        </Text>

        <View style={styles.cinemaRow}>
          <Film size={13} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.cinemaName} numberOfLines={1}>
            {cinema.name || 'IMAX Laser Experience'}
          </Text>
        </View>

        <View style={styles.formatRow}>
          <FormatBadge format={cinema.screenType || 'IMAX Laser 3D'} size="small" />
          <FormatBadge format={cinema.city || 'Mumbai'} size="small" />
        </View>
      </View>

      {/* Perforated Notch Divider */}
      <View style={styles.notchDivider}>
        <View style={styles.leftNotch} />
        <View style={styles.dashedLine} />
        <View style={styles.rightNotch} />
      </View>

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
            <Text style={styles.squadLabel}>SQUAD:</Text>
            <View style={styles.avatarList}>
              {friends.slice(0, 5).map((f, i) => (
                <View key={i} style={styles.avatarBubble}>
                  <User size={12} color={COLORS.primary} strokeWidth={2} />
                </View>
              ))}
            </View>
            <Text style={styles.squadCount}>{friends.length} watching</Text>
          </View>
        )}

        {/* Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewPassBtn}
            onPress={handleOpenTicket}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`View digital pass for ${movie.title}`}
          >
            <QrCode size={14} color="#07090E" strokeWidth={2.2} />
            <Text style={styles.viewPassText}>View Ticket Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Share pass for ${movie.title} with squad`}
          >
            <Share2 size={16} color={COLORS.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
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
    marginBottom: 8,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.2,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.8,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5,
  },
  cinemaName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 6,
  },

  // Perforation
  notchDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: COLORS.card,
  },
  leftNotch: {
    width: 14,
    height: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: COLORS.background,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
  },
  rightNotch: {
    width: 14,
    height: 20,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: COLORS.background,
  },

  // Bottom section
  bottomSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 1,
  },
  bookingRefText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  squadLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginRight: 6,
  },
  avatarList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  squadCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  viewPassText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07090E',
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
});

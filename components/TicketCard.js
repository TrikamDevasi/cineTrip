import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    router.push(`/ticket/${plan._id}`);
  };

  const handleShare = async () => {
    const message = `🎬 CineTrip Invite!\nWe're watching "${movie.title}" at ${cinema.name || 'Cinema'}!\n📅 Date: ${plan.date} at ${plan.time}\n💺 Seats: ${plan.seats || 'General Admission'}\nJoin our squad on CineTrip!`;
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
            <MaterialCommunityIcons name="ticket-confirmation" size={16} color={COLORS.primary} />
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
          <Ionicons name="film-outline" size={13} color={COLORS.secondary} />
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
              {friends.map((f, i) => (
                <View key={i} style={styles.avatarBubble}>
                  <Text style={styles.avatarEmoji}>{f.avatar || '🍿'}</Text>
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
          >
            <Ionicons name="qr-code-outline" size={14} color="#07090E" />
            <Text style={styles.viewPassText}>View Ticket Pass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={16} color={COLORS.primary} />
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
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorderGlow,
    overflow: 'hidden',
    ...SHADOWS.glowCyan,
  },
  fullPassContainer: {
    marginHorizontal: 0,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
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
  },
  passHeaderTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
    marginLeft: 5,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cinemaName: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 5,
    fontWeight: '600',
  },
  formatRow: {
    flexDirection: 'row',
    marginTop: 2,
  },

  // Perforation Notch
  notchDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    backgroundColor: COLORS.card,
    position: 'relative',
  },
  leftNotch: {
    width: 14,
    height: 24,
    backgroundColor: COLORS.background,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  rightNotch: {
    width: 14,
    height: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  bottomSection: {
    padding: SPACING.lg,
    paddingTop: 8,
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
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  metaHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 1,
  },
  bookingRefText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  squadLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  avatarList: {
    flexDirection: 'row',
    marginRight: 8,
  },
  avatarBubble: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -6,
    borderWidth: 1.5,
    borderColor: COLORS.card,
  },
  avatarEmoji: {
    fontSize: 13,
  },
  squadCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  viewPassBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    marginRight: 10,
  },
  viewPassText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07090E',
    marginLeft: 6,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Star, Sparkles, User, Utensils } from 'lucide-react-native';
import FormatBadge from './FormatBadge';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function MemoryCard({ memory, onDelete }) {
  if (!memory) return null;

  const movie = memory.movie || {};
  const rating = memory.rating || 5;

  return (
    <View style={styles.card}>
      {/* Photo header if present */}
      {memory.photoUri && (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: memory.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.photoDateBadge}>
            <Calendar size={12} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.photoDateText}>{memory.watchedDate || 'Recently'}</Text>
          </View>
        </View>
      )}

      <View style={styles.content}>
        {/* Top title & rating */}
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {movie.title || 'Movie Experience'}
            </Text>
            <View style={styles.cinemaRow}>
              <MapPin size={12} color={COLORS.secondary} strokeWidth={2} />
              <Text style={styles.cinemaText} numberOfLines={1}>
                {memory.cinemaName || 'Theatrical Premiere'}
              </Text>
            </View>
          </View>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={13}
                color={COLORS.secondary}
                fill={s <= rating ? COLORS.secondary : 'transparent'}
                strokeWidth={1.5}
                style={{ marginLeft: 2 }}
              />
            ))}
          </View>
        </View>

        {/* Experience format */}
        <View style={styles.formatRow}>
          <FormatBadge format={memory.experienceType || 'IMAX Laser'} size="small" />
        </View>

        {/* Story */}
        {memory.story ? (
          <Text style={styles.storyText}>{memory.story}</Text>
        ) : null}

        {/* Highlight Quote */}
        {memory.favoriteMoment ? (
          <View style={styles.highlightBox}>
            <Sparkles size={14} color={COLORS.accentPink} strokeWidth={2.2} />
            <Text style={styles.highlightText} numberOfLines={2}>
              <Text style={styles.highlightBold}>Highlight: </Text>
              {memory.favoriteMoment}
            </Text>
          </View>
        ) : null}

        {/* Bottom companions & snacks */}
        <View style={styles.footerRow}>
          {memory.companions && memory.companions.length > 0 && (
            <View style={styles.companionsRow}>
              <Text style={styles.footerLabel}>Squad: </Text>
              {memory.companions.map((c, idx) => (
                <View key={idx} style={styles.avatarTag}>
                  <User size={10} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 3 }} />
                  <Text style={styles.companionName}>{c.name}</Text>
                </View>
              ))}
            </View>
          )}

          {memory.snackHighlight ? (
            <View style={styles.snackRow}>
              <Utensils size={12} color={COLORS.secondary} strokeWidth={2} />
              <Text style={styles.snackText} numberOfLines={1}>
                {memory.snackHighlight}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  photoContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: COLORS.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoDateBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  photoDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  cinemaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  formatRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  storyText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginVertical: 6,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 99, 0.1)',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.25)',
    marginVertical: 8,
    gap: 6,
  },
  highlightBold: {
    fontWeight: '700',
    color: COLORS.accentPink,
  },
  highlightText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 6,
  },
  companionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 8,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  avatarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginRight: 5,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  companionName: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  snackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  snackText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});

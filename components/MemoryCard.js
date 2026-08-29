import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Star, Sparkles, Users, Utensils } from 'lucide-react-native';
import FormatBadge from './FormatBadge';
import { COLORS, TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function MemoryCard({ memory, onDelete }) {
  if (!memory) return null;

  const movie = memory.movie || {};
  const rating = memory.rating || 5;

  return (
    <View style={styles.card}>
      {/* 1. HERO MEMORY PHOTO / POSTER (SIGNATURE VISUAL ANCHOR) */}
      {memory.photoUri ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: memory.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.photoDateBadge}>
            <Calendar size={14} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.photoDateText}>{memory.watchedDate || 'Opening Night'}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.content}>
        {/* 2. HEADER: MOVIE TITLE & THEATER */}
        <View style={styles.headerRow}>
          <View style={styles.titleCol}>
            <Text style={styles.movieTitle} numberOfLines={1}>
              {movie.title || 'Theatrical Experience'}
            </Text>
            <View style={styles.cinemaRow}>
              <MapPin size={14} color={COLORS.secondary} strokeWidth={2} />
              <Text style={styles.cinemaText} numberOfLines={1}>
                {memory.cinemaName || 'Certified IMAX Laser Auditorium'}
              </Text>
            </View>
          </View>

          {/* Rating Pill */}
          <View style={styles.ratingBadge}>
            <Star size={14} color={COLORS.secondary} fill={COLORS.secondary} strokeWidth={1.5} />
            <Text style={styles.ratingText}>{rating}.0</Text>
          </View>
        </View>

        {/* 3. FORMAT BADGES */}
        <View style={styles.formatRow}>
          <FormatBadge format={memory.experienceType || 'IMAX Laser'} size="small" />
        </View>

        {/* 4. SHORT JOURNAL STORY */}
        {memory.story ? (
          <Text style={styles.storyText}>{memory.story}</Text>
        ) : null}

        {/* 5. MEMORY HIGHLIGHT QUOTE */}
        {memory.favoriteMoment ? (
          <View style={styles.highlightBox}>
            <Sparkles size={16} color={COLORS.secondary} strokeWidth={2} />
            <Text style={styles.highlightText} numberOfLines={2}>
              <Text style={styles.highlightBold}>Moment: </Text>
              {memory.favoriteMoment}
            </Text>
          </View>
        ) : null}

        {/* 6. COMPANIONS & CONCESSIONS FOOTER */}
        {(memory.companions?.length > 0 || memory.snackHighlight) && (
          <View style={styles.footerRow}>
            {memory.companions && memory.companions.length > 0 && (
              <View style={styles.companionsRow}>
                <Users size={14} color={COLORS.primary} strokeWidth={2} style={{ marginRight: 6 }} />
                {memory.companions.map((c, idx) => (
                  <View key={idx} style={styles.avatarTag}>
                    <Text style={styles.companionName}>{c.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {memory.snackHighlight ? (
              <View style={styles.snackRow}>
                <Utensils size={14} color={COLORS.secondary} strokeWidth={2} />
                <Text style={styles.snackText} numberOfLines={1}>
                  {memory.snackHighlight}
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: COLORS.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoDateBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  photoDateText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  titleCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  movieTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 18,
    color: COLORS.text,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  cinemaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.secondary,
  },
  formatRow: {
    flexDirection: 'row',
    marginVertical: SPACING.xs,
  },
  storyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
    marginVertical: SPACING.xs,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.08)',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)',
    marginVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  highlightBold: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.secondary,
  },
  highlightText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  companionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatarTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    marginRight: 4,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  companionName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.text,
  },
  snackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  snackText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Star, Sparkles, Users, Utensils } from 'lucide-react-native';
import FormatBadge from './FormatBadge';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function MemoryCard({ memory, onDelete }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!memory) return null;

  const movie = memory.movie || {};
  const rating = memory.rating || 5;

  return (
    <View style={styles.card}>
      {/* 1. HERO MEMORY PHOTO / POSTER */}
      {memory.photoUri ? (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: memory.photoUri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.photoDateBadge}>
            <Calendar size={12} color="#FFFFFF" strokeWidth={2} />
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
              <MapPin size={12} color={colors.primary} strokeWidth={2} />
              <Text style={styles.cinemaText} numberOfLines={1}>
                {memory.cinemaName || 'Certified IMAX Laser Auditorium'}
              </Text>
            </View>
          </View>

          {/* Rating Pill */}
          <View style={styles.ratingBadge}>
            <Star size={12} color="#E5A93C" fill="#E5A93C" strokeWidth={1.5} />
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
            <Sparkles size={14} color={colors.primary} strokeWidth={2} />
            <Text style={styles.highlightText} numberOfLines={2}>
              <Text style={styles.highlightBold}>Highlight: </Text>
              {memory.favoriteMoment}
            </Text>
          </View>
        ) : null}

        {/* 6. COMPANIONS & CONCESSIONS FOOTER */}
        {(memory.companions?.length > 0 || memory.snackHighlight) && (
          <View style={styles.footerRow}>
            {memory.companions && memory.companions.length > 0 && (
              <View style={styles.companionsRow}>
                <Users size={12} color={colors.textSecondary} strokeWidth={2} style={{ marginRight: 4 }} />
                {memory.companions.map((c, idx) => (
                  <View key={idx} style={styles.avatarTag}>
                    <Text style={styles.companionName}>{c.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {memory.snackHighlight ? (
              <View style={styles.snackRow}>
                <Utensils size={12} color={colors.primary} strokeWidth={2} />
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

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  photoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoDateBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(7, 9, 14, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  photoDateText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
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
    marginRight: SPACING.sm,
  },
  movieTitle: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
    marginBottom: 2,
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cinemaText: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  ratingText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: colors.text,
  },
  formatRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  storyText: {
    ...TYPOGRAPHY.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
    marginBottom: SPACING.sm,
  },
  highlightText: {
    ...TYPOGRAPHY.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 16,
  },
  highlightBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  companionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatarTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginRight: 4,
  },
  companionName: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  snackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  snackText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
});

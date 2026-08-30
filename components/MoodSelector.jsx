import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './ui/Icon';
import { MOODS } from '../services/tmdb';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../constants/theme';

export default function MoodSelector({ selectedMood, onSelectMood }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <TouchableOpacity
            key={mood.id}
            activeOpacity={0.8}
            onPress={() => onSelectMood(isSelected ? null : mood.id)}
            style={[styles.pillWrapper, isSelected && styles.pillSelected]}
            accessibilityRole="checkbox"
            accessibilityLabel={`Filter by mood: ${mood.label}`}
            accessibilityState={{ checked: isSelected }}
          >
            {isSelected ? (
              <LinearGradient
                colors={['#E5A93C', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientPill}
              >
                <Icon name={mood.icon} size={14} color="#07090E" style={styles.icon} />
                <Text style={styles.selectedLabel}>{mood.label}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={[colors.surface, colors.card]}
                style={styles.unselectedPill}
              >
                <Icon name={mood.icon} size={14} color={colors.textSecondary} style={styles.icon} />
                <Text style={styles.unselectedLabel}>{mood.label}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  pillWrapper: {
    marginRight: SPACING.sm,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    minHeight: 38,
  },
  pillSelected: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  gradientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    minHeight: 38,
  },
  unselectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 38,
  },
  icon: {
    marginRight: 6,
  },
  selectedLabel: {
    ...TYPOGRAPHY.captionBold,
    color: '#07090E',
  },
  unselectedLabel: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

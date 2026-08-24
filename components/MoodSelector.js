import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './ui/Icon';
import { MOODS } from '../services/tmdb';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export default function MoodSelector({ selectedMood, onSelectMood }) {
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
            accessibilityRole="button"
            accessibilityLabel={`Filter by mood: ${mood.label}`}
            accessibilityState={{ selected: isSelected }}
          >
            {isSelected ? (
              <LinearGradient
                colors={mood.gradient || ['#00F0FF', '#7928CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientPill}
              >
                <Icon name={mood.icon} size={15} color="#FFFFFF" style={styles.icon} />
                <Text style={styles.selectedLabel}>{mood.label}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['rgba(26, 35, 58, 0.9)', 'rgba(19, 27, 46, 0.9)']}
                style={styles.unselectedPill}
              >
                <Icon name={mood.icon} size={15} color={COLORS.textSecondary} style={styles.icon} />
                <Text style={styles.unselectedLabel}>{mood.label}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  pillWrapper: {
    marginRight: 10,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  pillSelected: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
  },
  unselectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  icon: {
    marginRight: 6,
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unselectedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';

export default function Rating({
  rating = 0,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  showNumeric = true,
  size = 22,
}) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.starsRow} accessibilityRole="radiogroup">
        {stars.map((starValue) => {
          const isFilled = starValue <= rating;
          return (
            <TouchableOpacity
              key={starValue}
              disabled={readonly}
              onPress={() => onRatingChange && onRatingChange(starValue)}
              activeOpacity={0.7}
              style={styles.starTouchable}
              accessibilityRole="radio"
              accessibilityLabel={`${starValue} out of ${maxRating} stars`}
              accessibilityState={{ selected: isFilled }}
            >
              <Star
                size={size}
                color={isFilled ? '#E5A93C' : COLORS.textMuted}
                fill={isFilled ? '#E5A93C' : 'transparent'}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {showNumeric && (
        <View style={styles.numericContainer}>
          <Text style={styles.numericText}>
            {rating > 0 ? `${rating}.0 / ${maxRating}.0` : 'Tap to rate'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starTouchable: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numericContainer: {
    marginTop: SPACING.xs,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  numericText: {
    ...TYPOGRAPHY.captionBold,
    color: '#E5A93C',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Animated, Platform, StyleSheet, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Base animated skeleton element
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = RADIUS.sm, style }) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width,
          height,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton matching MovieCard poster + metadata layout
 */
export function MovieCardSkeleton({ width = 150 }) {
  return (
    <View style={[styles.movieCardSkeleton, { width }]}>
      <Skeleton width="100%" height={210} borderRadius={RADIUS.md} />
      <View style={styles.movieMetaSkeleton}>
        <Skeleton width="85%" height={16} borderRadius={RADIUS.xs} style={{ marginBottom: 6 }} />
        <Skeleton width="50%" height={12} borderRadius={RADIUS.xs} />
      </View>
    </View>
  );
}

/**
 * Skeleton matching Cinema list cards
 */
export function CinemaCardSkeleton() {
  return (
    <View style={styles.cinemaCardSkeleton}>
      <View style={styles.cinemaHeaderRow}>
        <Skeleton width="60%" height={18} borderRadius={RADIUS.xs} />
        <Skeleton width={60} height={20} borderRadius={RADIUS.xs} />
      </View>
      <Skeleton width="40%" height={12} borderRadius={RADIUS.xs} style={{ marginVertical: 8 }} />
      <View style={styles.badgeRow}>
        <Skeleton width={70} height={22} borderRadius={RADIUS.xs} style={{ marginRight: 6 }} />
        <Skeleton width={80} height={22} borderRadius={RADIUS.xs} />
      </View>
    </View>
  );
}

/**
 * Skeleton matching Memory Card in Journal
 */
export function MemoryCardSkeleton() {
  return (
    <View style={styles.memoryCardSkeleton}>
      <Skeleton width="100%" height={220} borderRadius={RADIUS.lg} />
      <View style={styles.memoryMeta}>
        <Skeleton width="70%" height={20} borderRadius={RADIUS.xs} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} borderRadius={RADIUS.xs} style={{ marginBottom: 12 }} />
        <Skeleton width="95%" height={14} borderRadius={RADIUS.xs} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBase: {
    backgroundColor: COLORS.surface,
  },
  movieCardSkeleton: {
    marginRight: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.card,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  movieMetaSkeleton: {
    padding: SPACING.sm,
  },
  cinemaCardSkeleton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cinemaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  memoryCardSkeleton: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  memoryMeta: {
    marginTop: SPACING.md,
  },
});

export default Skeleton;

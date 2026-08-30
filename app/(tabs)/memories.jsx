import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Film, MapPin, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import MemoryCard from '../../components/MemoryCard';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { MemoryCardSkeleton } from '../../components/ui/Skeleton';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function MemoriesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    memories,
    isLoading,
    error,
    fetchMemories,
    loadNextPage,
    hasNextPage,
  } = useMemoryStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMemories(1);
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAuthenticated) {
      await fetchMemories(1);
    }
    setRefreshing(false);
  };

  const totalTheaters = new Set(memories.map((m) => m.cinemaName).filter(Boolean)).size;
  const avgRating = memories.length > 0
    ? (memories.reduce((sum, m) => sum + (m.rating || 5), 0) / memories.length).toFixed(1)
    : '5.0';

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Top Header & CTA */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Cinephile Journal</Text>
            <Text style={styles.subtitle}>
              Preserve your big-screen memories & stories
            </Text>
          </View>

          <Button
            title="Log Memory"
            icon="Camera"
            variant="primary"
            size="md"
            onPress={() => router.push('/memory/create')}
            accessibilityLabel="Log a new movie night memory"
          />
        </View>

        {/* Real Theatrical Milestone Metrics */}
        {memories.length > 0 && (
          <View style={styles.statsBanner}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{memories.length}</Text>
              <Text style={styles.statLabel}>Screenings</Text>
            </View>
            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalTheaters}</Text>
              <Text style={styles.statLabel}>Theaters</Text>
            </View>
            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{avgRating} ★</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>
        )}

        {/* Loading State with Skeletons */}
        {isLoading && !refreshing && memories.length === 0 && (
          <View style={styles.skeletonFeed}>
            <MemoryCardSkeleton />
            <MemoryCardSkeleton />
          </View>
        )}

        {/* Error State */}
        {error && (
          <ErrorState
            title="Couldn't Load Journal"
            message={error}
            onRetry={() => fetchMemories(1)}
          />
        )}

        {/* Memories Feed */}
        {!isLoading && memories.length === 0 ? (
          <EmptyState
            icon="Camera"
            title="No Movie Memories Yet"
            description="Capture your next movie night experience, tag your squad, and log the highlight moments."
            actionLabel="Log Your First Movie Night"
            onAction={() => router.push('/memory/create')}
            actionIcon="Plus"
          />
        ) : (
          <View style={styles.feedWrapper}>
            {memories.map((m) => (
              <MemoryCard key={m._id || m.id || Math.random().toString()} memory={m} />
            ))}

            {hasNextPage && (
              <View style={styles.loadMoreWrap}>
                <Button
                  title="Load Older Memories"
                  variant="surface"
                  size="md"
                  onPress={loadNextPage}
                  accessibilityLabel="Load older journal memories"
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: colors.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TYPOGRAPHY.h2,
    color: colors.primary,
    fontWeight: '900',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.cardBorder,
  },
  skeletonFeed: {
    marginTop: SPACING.md,
  },
  feedWrapper: {
    marginTop: SPACING.xs,
  },
  loadMoreWrap: {
    paddingHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
});

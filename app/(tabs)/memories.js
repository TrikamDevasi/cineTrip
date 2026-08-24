import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import MemoryCard from '../../components/MemoryCard';
import EmptyState from '../../components/ui/EmptyState';
import { useMemoryStore } from '../../store/useMemoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function MemoriesScreen() {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Screen Title & Add CTA */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.title}>Cinephile Journal</Text>
            <Text style={styles.subtitle}>
              Preserve your big-screen memories & stories
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => router.push('/memory/create')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Log a new movie night memory"
          >
            <Camera size={16} color="#07090E" strokeWidth={2.2} />
            <Text style={styles.logBtnText}>Log Memory</Text>
          </TouchableOpacity>
        </View>

        {/* Theatrical Milestone Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{memories.length}</Text>
            <Text style={styles.statLabel}>Experiences</Text>
          </View>
          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalTheaters}</Text>
            <Text style={styles.statLabel}>Theaters</Text>
          </View>
          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>IMAX & VIP</Text>
          </View>
        </View>

        {/* Loading Indicator */}
        {isLoading && !refreshing && memories.length === 0 && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading journal...</Text>
          </View>
        )}

        {/* Error Retry Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color={COLORS.danger} strokeWidth={2} />
            <Text style={styles.errorBannerText}>{error}</Text>
            <TouchableOpacity
              onPress={() => fetchMemories(1)}
              accessibilityRole="button"
              accessibilityLabel="Retry loading memories"
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Memories Feed */}
        {!isLoading && memories.length === 0 ? (
          <EmptyState
            icon="Camera"
            title="No Movie Memories Yet"
            description="Capture your next movie night experience, tag your squad, and log the highlight scenes."
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
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={loadNextPage}
                accessibilityRole="button"
                accessibilityLabel="Load older journal memories"
              >
                <Text style={styles.loadMoreBtnText}>Load Older Memories</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    gap: 6,
    ...SHADOWS.glowCyan,
  },
  logBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07090E',
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    paddingVertical: 14,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.cardBorder,
  },
  feedWrapper: {
    paddingTop: 4,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: SPACING.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.danger,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  loadMoreBtn: {
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  loadMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

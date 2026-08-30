import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Film, Search, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WatchlistScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const {
    watchlist,
    isLoading,
    fetchWatchlist,
  } = useWatchlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchlist();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isAuthenticated) {
      await fetchWatchlist();
    }
    setRefreshing(false);
  };

  const filteredList = watchlist.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.genres && m.genres.some((g) => (g.name || g).toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (filterType === 'imax') {
      const f = (m.formats || []).join(' ').toLowerCase();
      return f.includes('imax') || (m.preferredFormat && m.preferredFormat.toLowerCase().includes('imax'));
    }

    if (filterType === 'now_playing') {
      return (
        m.status === 'Now Playing' ||
        (m.release_date && new Date(m.release_date) <= new Date())
      );
    }

    if (filterType === 'coming_soon') {
      return (
        m.status === 'Upcoming' ||
        (m.release_date && new Date(m.release_date) > new Date())
      );
    }

    return true;
  });

  const columnWidth = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* Screen Title & Add CTA */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Cinephile Watchlist</Text>
          <Text style={styles.subtitle}>
            {watchlist.length} films queued for the big screen
          </Text>
        </View>

        <Button
          title="Add Films"
          icon="Plus"
          variant="primary"
          size="sm"
          onPress={() => router.push('/(tabs)/discover')}
          accessibilityLabel="Discover more movies to add to watchlist"
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Chip
            label={`All (${watchlist.length})`}
            selected={filterType === 'all'}
            onPress={() => setFilterType('all')}
            accessibilityLabel="Show all queued films"
          />
          <Chip
            label="Now in Theaters"
            selected={filterType === 'now_playing'}
            onPress={() => setFilterType('now_playing')}
            accessibilityLabel="Show movies currently in theaters"
          />
          <Chip
            label="Coming Soon"
            selected={filterType === 'coming_soon'}
            onPress={() => setFilterType('coming_soon')}
            accessibilityLabel="Show upcoming films"
          />
          <Chip
            label="IMAX & Premium"
            selected={filterType === 'imax'}
            onPress={() => setFilterType('imax')}
            accessibilityLabel="Show IMAX and premium screens only"
          />
        </ScrollView>
      </View>

      {/* Search Filter in Watchlist */}
      {watchlist.length > 3 && (
        <View style={styles.searchWrapper}>
          <Search size={16} color={colors.textMuted} strokeWidth={2} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter saved films..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {/* Loading state */}
      {isLoading && !refreshing && watchlist.length === 0 ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.gridRow}>
            <MovieCardSkeleton width={columnWidth} />
            <MovieCardSkeleton width={columnWidth} />
          </View>
        </View>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="Bookmark"
          title="Your Watchlist is Empty"
          description="Save upcoming films from Discover or Home to plan trips later."
          actionLabel="Discover Movies"
          onAction={() => router.push('/(tabs)/discover')}
          actionIcon="Film"
        />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => (item.id || item.movieId || Math.random()).toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <MovieCard movie={item} cardWidth={columnWidth} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
  filterSection: {
    marginBottom: SPACING.xs,
  },
  filterRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 42,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl * 2,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  skeletonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Film, Search, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import EmptyState from '../../components/ui/EmptyState';
import { useWatchlistStore } from '../../store/useWatchlistStore';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function WatchlistScreen() {
  const router = useRouter();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'imax'
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

    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* Screen Title */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.title}>Cinephile Watchlist</Text>
          <Text style={styles.subtitle}>
            {watchlist.length} films queued for the big screen
          </Text>
        </View>

        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => router.push('/(tabs)/discover')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Discover more movies to add to watchlist"
        >
          <Plus size={15} color="#07090E" strokeWidth={2.4} />
          <Text style={styles.exploreBtnText}>Add More</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}
          onPress={() => setFilterType('all')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Show all queued films"
          accessibilityState={{ selected: filterType === 'all' }}
        >
          <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>
            All Queued ({watchlist.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterType === 'imax' && styles.filterTabActive]}
          onPress={() => setFilterType('imax')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Show IMAX and premium screens only"
          accessibilityState={{ selected: filterType === 'imax' }}
        >
          <Film
            size={13}
            color={filterType === 'imax' ? '#07090E' : COLORS.primary}
            strokeWidth={2}
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.filterTabText, filterType === 'imax' && styles.filterTabTextActive]}>
            IMAX & Premium
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Filter in Watchlist */}
      {watchlist.length > 3 && (
        <View style={styles.searchWrapper}>
          <Search size={15} color={COLORS.textMuted} strokeWidth={2} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter saved films..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {/* Loading state */}
      {isLoading && !refreshing && watchlist.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading your watchlist...</Text>
        </View>
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="Bookmark"
          title="Your Watchlist is Empty"
          description="Save films from Discover or Home to easily plan movie trips later."
          actionLabel="Explore Trending Films"
          onAction={() => router.push('/(tabs)/discover')}
          actionIcon="Compass"
        />
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.itemWrapper}>
              <MovieCard movie={item} layout="horizontal" />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#07090E',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterTabActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.lg,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 30,
  },
  itemWrapper: {
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 12,
  },
});

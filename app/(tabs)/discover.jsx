import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Film, Sparkles, Calendar, TrendingUp } from 'lucide-react-native';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import MoodSelector from '../../components/MoodSelector';
import { searchMovies, getTrendingMovies, getNowPlayingMovies, getUpcomingMovies } from '../../services/tmdb';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { useDebounce } from '../../hooks/useDebounce';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FORMAT_FILTERS = ['All Formats', 'IMAX Laser', 'Dolby Cinema', '4DX', 'RealD 3D'];
const CATEGORY_TABS = [
  { id: 'in_theaters', label: 'Now in Theaters', icon: Film },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'upcoming', label: 'Coming Soon', icon: Calendar },
];

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('in_theaters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { snapshot: catalog, refresh: refreshCatalog } = useMovieCatalog();

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      loadCategory(activeCategory, 1);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else if (debouncedSearch === '') {
      loadCategory(activeCategory, 1);
    }
  }, [debouncedSearch]);

  const loadCategory = async (category, page = 1) => {
    setLoading(true);
    try {
      let results = [];
      if (category === 'in_theaters') {
        if (catalog.hasData && page === 1) {
          results = catalog.movies;
        } else {
          results = await getNowPlayingMovies(page);
        }
      } else if (category === 'trending') {
        results = await getTrendingMovies(page);
      } else if (category === 'upcoming') {
        results = await getUpcomingMovies(page);
      }
      setMovies(Array.isArray(results) ? results : []);
      setCurrentPage(page);
      setHasMore((Array.isArray(results) ? results : []).length >= 20);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore || searchQuery.trim() || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      let results = [];
      if (activeCategory === 'in_theaters') {
        results = await getNowPlayingMovies(nextPage);
      } else if (activeCategory === 'trending') {
        results = await getTrendingMovies(nextPage);
      } else if (activeCategory === 'upcoming') {
        results = await getUpcomingMovies(nextPage);
      }
      if (results && results.length > 0) {
        setMovies((prev) => [...prev, ...results]);
        setCurrentPage(nextPage);
        setHasMore(results.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = async (text) => {
    if (!text.trim()) {
      loadCategory(activeCategory, 1);
      return;
    }
    setLoading(true);
    setHasMore(false);
    try {
      const results = await searchMovies(text);
      setMovies(results && results.length > 0 ? results : []);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeCategory === 'in_theaters') {
      await refreshCatalog();
    }
    await loadCategory(activeCategory, 1);
    setRefreshing(false);
  };

  // Filter movies by format, genre, and mood
  const filteredMovies = movies.filter((movie) => {
    let matchesFormat = true;
    if (selectedFormat !== 'All Formats') {
      const f = (movie.formats || []).join(' ').toLowerCase();
      matchesFormat = f.includes(selectedFormat.toLowerCase().replace('laser', '').trim());
    }

    let matchesGenre = true;
    if (selectedGenre) {
      matchesGenre = movie.genres && movie.genres.some((g) => (g.id === selectedGenre || g.name === selectedGenre));
    }

    let matchesMood = true;
    if (selectedMood) {
      matchesMood = movie.mood === selectedMood || (movie.genres && movie.genres.some(g => g.name === 'Action' || g.name === 'Sci-Fi'));
    }

    return matchesFormat && matchesGenre && matchesMood;
  });

  const columnWidth = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* SEARCH BAR */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.primary} strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search films, directors, IMAX..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORY SELECTOR TABS */}
      {!searchQuery.trim() && (
        <View style={styles.categoryTabsContainer}>
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.categoryTab, isSelected && styles.categoryTabActive]}
                onPress={() => setActiveCategory(tab.id)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                <Icon
                  size={15}
                  color={isSelected ? '#07090E' : colors.textSecondary}
                  strokeWidth={2.2}
                />
                <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* FORMAT FILTER CHIPS */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FORMAT_FILTERS.map((fmt) => (
            <Chip
              key={fmt}
              label={fmt}
              selected={selectedFormat === fmt}
              onPress={() => setSelectedFormat(fmt)}
              accessibilityLabel={`Filter by format ${fmt}`}
            />
          ))}
        </ScrollView>
      </View>

      {/* MOOD SELECTOR */}
      <View style={styles.moodSection}>
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={(moodId) => setSelectedMood(moodId)}
        />
      </View>

      {/* MOVIE GRID RESULTS */}
      <FlatList
        data={filteredMovies}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMoreMovies}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={{ width: columnWidth, marginBottom: SPACING.md }}>
                  <MovieCardSkeleton width={columnWidth} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="Film"
              title={searchQuery ? 'No verified films found' : 'No titles available'}
              description={
                searchQuery
                  ? `No verified catalog titles matched "${searchQuery}".`
                  : activeCategory === 'in_theaters'
                  ? 'No verified theatrical screenings currently found. Check your TMDB connection.'
                  : 'No movie results found for the selected category and filters.'
              }
              actionLabel={searchQuery ? 'Clear Search' : undefined}
              actionIcon="X"
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={{ width: columnWidth, marginBottom: SPACING.md }}>
            <MovieCard movie={item} layout="vertical" cardWidth={columnWidth} />
          </View>
        )}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBarWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 46,
    ...SHADOWS.card,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  clearBtn: {
    padding: 6,
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    gap: SPACING.xs,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryTabText: {
    ...TYPOGRAPHY.captionBold,
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#07090E',
  },
  filtersSection: {
    paddingVertical: SPACING.xs,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
  },
  moodSection: {
    marginBottom: SPACING.xs,
  },
  gridContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl * 2,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
});
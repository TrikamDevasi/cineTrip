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
import { Search, X, Film } from 'lucide-react-native';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import MoodSelector from '../../components/MoodSelector';
import {
  searchMovies,
  getTrendingMovies,
  FALLBACK_MOVIES,
} from '../../services/tmdb';
import { useDebounce } from '../../hooks/useDebounce';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FORMAT_FILTERS = ['All Formats', 'IMAX Laser', 'Dolby Cinema', '4DX', 'RealD 3D'];

export default function DiscoverScreen() {
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

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else if (debouncedSearch === '') {
      loadInitial();
    }
  }, [debouncedSearch]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const results = await getTrendingMovies(1);
      const movieList = results && results.length > 0 ? results : FALLBACK_MOVIES;
      setMovies(movieList);
      setCurrentPage(1);
      setHasMore(movieList.length >= 20);
    } catch {
      setMovies(FALLBACK_MOVIES);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore || searchQuery.trim() || loading) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const results = await getTrendingMovies(nextPage);
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
      loadInitial();
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
    await loadInitial();
    setRefreshing(false);
  };

  // Filter movies by format, genre, and mood
  const filteredMovies = movies.filter((movie) => {
    let matchesFormat = true;
    if (selectedFormat !== 'All Formats') {
      const f = (movie.formats || ['IMAX Laser', 'Dolby Cinema']).join(' ').toLowerCase();
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* SEARCH BAR */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.primary} strokeWidth={2.2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search films, directors, IMAX..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <X size={16} color={COLORS.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* FILTER CHIPS: FORMATS */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
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
          onSelectMood={(m) => setSelectedMood(m === selectedMood ? null : m)}
        />
      </View>

      {/* MOVIES GRID */}
      {loading ? (
        <ScrollView contentContainerStyle={styles.skeletonGrid}>
          <View style={styles.gridRow}>
            <MovieCardSkeleton width={columnWidth} />
            <MovieCardSkeleton width={columnWidth} />
          </View>
          <View style={styles.gridRow}>
            <MovieCardSkeleton width={columnWidth} />
            <MovieCardSkeleton width={columnWidth} />
          </View>
        </ScrollView>
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon="Film"
          title="No Films Found"
          description={searchQuery ? `No results for "${searchQuery}". Try different keywords or formats.` : "No films matching selected filters."}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedFormat('All Formats');
            setSelectedGenre(null);
            setSelectedMood(null);
            loadInitial();
          }}
        />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          renderItem={({ item }) => (
            <MovieCard movie={item} cardWidth={columnWidth} />
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreBox}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
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
  searchBarWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  clearBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    marginTop: SPACING.xs,
  },
  filterChipsRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  moodSection: {
    marginBottom: SPACING.xs,
  },
  gridContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl * 2,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  skeletonGrid: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  loadingMoreBox: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});
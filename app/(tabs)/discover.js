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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, CloudOff } from 'lucide-react-native';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icon';
import {
  searchMovies,
  getTrendingMovies,
  FALLBACK_MOVIES,
  FALLBACK_GENRES,
} from '../../services/tmdb';
import { useDebounce } from '../../hooks/useDebounce';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const FORMAT_FILTERS = ['All Formats', 'IMAX Laser', 'Dolby Cinema', '4DX', 'RealD 3D'];

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(searchQuery, 500);

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
    setError(null);
    try {
      const results = await getTrendingMovies(1);
      const movieList = results && results.length > 0 ? results : FALLBACK_MOVIES;
      setMovies(movieList);
      setCurrentPage(1);
      setHasMore(movieList.length >= 20);
      setTotalResults(movieList.length);
    } catch {
      setMovies(FALLBACK_MOVIES);
      setError('Using offline movie data.');
    }
    setLoading(false);
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
    }
    setLoadingMore(false);
  };

  const handleSearch = async (text) => {
    if (!text.trim()) {
      loadInitial();
      return;
    }
    setLoading(true);
    setError(null);
    setHasMore(false);
    try {
      const results = await searchMovies(text);
      setMovies(results && results.length > 0 ? results : []);
    } catch {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Filter movies by format and genre
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

    return matchesFormat && matchesGenre;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showSearch={false} />

      {/* Search Input Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.primary} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search films, actors, directors, IMAX..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <X size={18} color={COLORS.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Format Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FORMAT_FILTERS.map((fmt) => {
            const isSelected = selectedFormat === fmt;
            return (
              <TouchableOpacity
                key={fmt}
                onPress={() => setSelectedFormat(fmt)}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Format filter: ${fmt}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {fmt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Genre Pills */}
      <View style={styles.genreContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            onPress={() => setSelectedGenre(null)}
            style={[styles.genrePill, !selectedGenre && styles.genrePillActive]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filter by all genres"
            accessibilityState={{ selected: !selectedGenre }}
          >
            <Text style={[styles.genrePillText, !selectedGenre && styles.genrePillTextActive]}>
              All Genres
            </Text>
          </TouchableOpacity>

          {FALLBACK_GENRES.map((g) => {
            const isSelected = selectedGenre === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelectedGenre(isSelected ? null : g.id)}
                style={[styles.genrePill, isSelected && styles.genrePillActive]}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Filter by genre: ${g.name}`}
                accessibilityState={{ selected: isSelected }}
              >
                <Icon
                  name={g.icon || 'Film'}
                  size={13}
                  color={isSelected ? '#07090E' : COLORS.textSecondary}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.genrePillText, isSelected && styles.genrePillTextActive]}>
                  {g.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching cinematic archives...</Text>
        </View>
      ) : filteredMovies.length === 0 ? (
        <EmptyState
          icon="Film"
          title="No matching films found"
          description="Try searching for Dune, Oppenheimer, or reset your current filters."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSelectedFormat('All Formats');
            setSelectedGenre(null);
            clearSearch();
          }}
          actionIcon="RotateCcw"
        />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => <MovieCard movie={item} layout="horizontal" />}
          onEndReached={loadMoreMovies}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              {error && (
                <View style={styles.offlineBanner}>
                  <CloudOff size={13} color={COLORS.secondary} strokeWidth={2} />
                  <Text style={styles.offlineBannerText}>{error}</Text>
                </View>
              )}
              <Text style={styles.resultsCount}>
                Showing {filteredMovies.length} experiences
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Loading more films...</Text>
              </View>
            ) : !hasMore && filteredMovies.length > 20 ? (
              <Text style={styles.endText}>All results loaded</Text>
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
    paddingVertical: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    height: '100%',
  },
  clearBtn: {
    padding: 6,
  },
  filtersContainer: {
    paddingVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#07090E',
  },
  genreContainer: {
    paddingBottom: 8,
  },
  genrePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  genrePillActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  genrePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  genrePillTextActive: {
    color: '#07090E',
    fontWeight: '800',
  },
  centerContainer: {
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
  resultsList: {
    paddingTop: 8,
    paddingBottom: 30,
  },
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: RADIUS.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.25)',
    gap: 6,
  },
  offlineBannerText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  endText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    fontStyle: 'italic',
  },
});

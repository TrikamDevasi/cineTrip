import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import {
  Search,
  X,
  Film,
  Sparkles,
  Calendar,
  TrendingUp,
  SlidersHorizontal,
  Clock,
  Flame,
  Layers,
  Filter,
} from 'lucide-react-native';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import FilterSheet from '../../components/ui/FilterSheet';
import { MovieCardSkeleton } from '../../components/ui/Skeleton';
import MoodSelector from '../../components/MoodSelector';
import {
  searchMovies,
  getTrendingMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getGenres,
  discoverMovies,
} from '../../services/tmdb';
import { useMovieCatalog } from '../../hooks/useMovieCatalog';
import { useDebounce } from '../../hooks/useDebounce';
import { useActivityStore } from '../../store/useActivityStore';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FORMAT_FILTERS = ['All Formats', 'IMAX Laser', 'Dolby Cinema', '4DX', 'RealD 3D'];
const CATEGORY_TABS = [
  { id: 'in_theaters', label: 'Now in Theaters', icon: Film },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'upcoming', label: 'Coming Soon', icon: Calendar },
];

const DEFAULT_FILTERS = { genreId: null, year: null, minRating: 0, language: null, sortBy: 'popularity.desc' };

export default function DiscoverScreen() {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState('in_theaters');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('All Formats');
  const [selectedMood, setSelectedMood] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('formats'); // 'formats' | 'moods'
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const { snapshot: catalog, refresh: refreshCatalog } = useMovieCatalog();
  const recentSearches = useActivityStore((s) => s.recentSearches);
  const recordSearch = useActivityStore((s) => s.recordSearch);
  const clearRecentSearches = useActivityStore((s) => s.clearRecentSearches);
  const styles = createStyles(colors);

  useEffect(() => {
    getGenres().then((g) => setGenres(Array.isArray(g) ? g : []));
  }, []);

  const hasAdvancedFilters = useMemo(
    () => filters.year || filters.minRating > 0 || filters.language || filters.sortBy !== 'popularity.desc',
    [filters]
  );

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      loadMovies(activeCategory, 1);
    }
  }, [activeCategory, filters]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else {
      loadMovies(activeCategory, 1);
    }
  }, [debouncedSearch]);

  const loadMovies = async (category, page = 1) => {
    setLoading(true);
    try {
      let results = [];
      if (hasAdvancedFilters) {
        results = await discoverMovies({
          withGenres: filters.genreId || undefined,
          year: filters.year || undefined,
          sortBy: filters.sortBy,
          voteAverageGte: filters.minRating > 0 ? filters.minRating : undefined,
          withOriginalLanguage: filters.language || undefined,
        });
      } else if (filters.genreId) {
        results = await discoverMovies({ withGenres: filters.genreId, sortBy: filters.sortBy });
      } else if (category === 'in_theaters') {
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
      setHasMore(hasAdvancedFilters ? false : (Array.isArray(results) ? results : []).length >= 20);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    if (loadingMore || !hasMore || searchQuery.trim() || loading || hasAdvancedFilters) return;
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
      loadMovies(activeCategory, 1);
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

  const submitSearch = () => {
    if (searchQuery.trim()) recordSearch(searchQuery.trim());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeCategory === 'in_theaters') {
      await refreshCatalog();
    }
    await loadMovies(activeCategory, 1);
    setRefreshing(false);
  };

  const applyFilters = (next) => {
    setFilters(next);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedFormat('All Formats');
    setSelectedMood(null);
    setFilterSheetOpen(false);
  };

  const activeFilterCount = useMemo(
    () =>
      [
        filters.genreId,
        filters.year,
        filters.minRating > 0 ? filters.minRating : null,
        filters.language,
        selectedFormat !== 'All Formats' ? selectedFormat : null,
        selectedMood,
      ].filter(Boolean).length,
    [filters, selectedFormat, selectedMood]
  );

  const filteredMovies = movies.filter((movie) => {
    let matchesFormat = true;
    if (selectedFormat !== 'All Formats') {
      const f = (movie.formats || []).join(' ').toLowerCase();
      matchesFormat = f.includes(selectedFormat.toLowerCase().replace('laser', '').trim());
    }
    if (!hasAdvancedFilters && filters.genreId) {
      const g = movie.genre_ids || (movie.genres || []).map((x) => x.id);
      if (Array.isArray(g) && g.length && !g.includes(filters.genreId)) matchesFormat = false;
    }
    let matchesMood = true;
    if (selectedMood) {
      matchesMood =
        movie.mood === selectedMood ||
        (movie.genres && movie.genres.some((g) => g.name === 'Action' || g.name === 'Sci-Fi'));
    }
    return matchesFormat && matchesMood;
  });

  const showSuggestions = searchFocused && searchQuery.trim().length === 0;
  const columnWidth = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / 2;

  // Title label for the current section
  const sectionTitle = useMemo(() => {
    if (searchQuery.trim()) {
      return `Results for "${searchQuery}" (${filteredMovies.length})`;
    }
    if (activeCategory === 'in_theaters') return 'Now Showing in Theaters';
    if (activeCategory === 'trending') return 'Trending This Week';
    if (activeCategory === 'upcoming') return 'Upcoming Releases';
    return 'Explore Movies';
  }, [searchQuery, activeCategory, filteredMovies.length]);

  // Render the unified scrollable header
  const renderListHeader = useCallback(() => {
    return (
      <View style={styles.scrollHeaderContainer}>
        {/* 1. SEARCH BAR */}
        <View style={styles.searchBarWrapper}>
          <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
            <Search size={18} color={searchFocused ? colors.primary : colors.textMuted} strokeWidth={2.2} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search films, directors, IMAX..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} accessibilityLabel="Clear search">
                <X size={16} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. RECENT SEARCHES (Dropdown when focused & empty) */}
        {showSuggestions && recentSearches.length > 0 && (
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <Text style={styles.suggestionsTitle}>RECENT SEARCHES</Text>
              <TouchableOpacity onPress={clearRecentSearches} accessibilityRole="button" accessibilityLabel="Clear search history">
                <Text style={styles.clearHistoryText}>Clear</Text>
              </TouchableOpacity>
            </View>
            {recentSearches.slice(0, 5).map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.suggestionRow}
                onPress={() => {
                  setSearchQuery(q);
                  recordSearch(q);
                  setSearchFocused(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Search for ${q}`}
              >
                <Clock size={14} color={colors.textMuted} strokeWidth={2} />
                <Text style={styles.suggestionText} numberOfLines={1}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 3. HORIZONTAL CATEGORY SEGMENT TABS */}
        {!searchQuery.trim() && (
          <View style={styles.categorySegmentRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
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
                    <Icon size={14} color={isSelected ? '#07090E' : colors.textSecondary} strokeWidth={2.2} />
                    <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Advanced Filters Button Pill */}
              <TouchableOpacity
                style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                onPress={() => setFilterSheetOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open advanced filters"
              >
                <SlidersHorizontal size={14} color={activeFilterCount > 0 ? '#07090E' : colors.textSecondary} strokeWidth={2.2} />
                <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
                  Filters
                </Text>
                {activeFilterCount > 0 && (
                  <View style={styles.filterCountBadge}>
                    <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* 4. SUB-FILTER BAR (Switch between Formats & Moods or Swipeable Chips) */}
        {!searchQuery.trim() && (
          <View style={styles.subFilterSection}>
            <View style={styles.subFilterHeaderRow}>
              <View style={styles.subFilterSegmentToggle}>
                <TouchableOpacity
                  style={[styles.subFilterToggleBtn, activeFilterTab === 'formats' && styles.subFilterToggleBtnActive]}
                  onPress={() => setActiveFilterTab('formats')}
                >
                  <Layers size={12} color={activeFilterTab === 'formats' ? colors.primary : colors.textMuted} />
                  <Text style={[styles.subFilterToggleText, activeFilterTab === 'formats' && styles.subFilterToggleTextActive]}>
                    Formats
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subFilterToggleBtn, activeFilterTab === 'moods' && styles.subFilterToggleBtnActive]}
                  onPress={() => setActiveFilterTab('moods')}
                >
                  <Sparkles size={12} color={activeFilterTab === 'moods' ? colors.primary : colors.textMuted} />
                  <Text style={[styles.subFilterToggleText, activeFilterTab === 'moods' && styles.subFilterToggleTextActive]}>
                    Moods
                  </Text>
                </TouchableOpacity>
              </View>

              {activeFilterCount > 0 && (
                <TouchableOpacity onPress={clearFilters} style={styles.resetFilterBtn}>
                  <Text style={styles.resetFilterText}>Reset ({activeFilterCount})</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Formats Strip */}
            {activeFilterTab === 'formats' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
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
            )}

            {/* Moods Strip */}
            {activeFilterTab === 'moods' && (
              <MoodSelector selectedMood={selectedMood} onSelectMood={(moodId) => setSelectedMood(moodId)} />
            )}
          </View>
        )}

        {/* 5. SECTION HEADLINE */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionHeaderSubtitle}>
            {filteredMovies.length} {filteredMovies.length === 1 ? 'film' : 'films'}
          </Text>
        </View>
      </View>
    );
  }, [
    searchQuery,
    searchFocused,
    showSuggestions,
    recentSearches,
    activeCategory,
    activeFilterCount,
    activeFilterTab,
    selectedFormat,
    selectedMood,
    sectionTitle,
    filteredMovies.length,
    colors,
    styles,
  ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header />

      {/* UNIFIED SCROLLABLE MOVIE GRID & HEADER */}
      <FlatList
        data={filteredMovies}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderListHeader}
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
              title={searchQuery ? 'No verified films found' : activeFilterCount > 0 ? 'No matching titles' : 'No titles available'}
              description={
                searchQuery
                  ? `No verified catalog titles matched "${searchQuery}".`
                  : activeFilterCount > 0
                  ? 'Try removing some filters to broaden your search.'
                  : activeCategory === 'in_theaters'
                  ? 'No verified theatrical screenings currently found. Check your TMDB connection.'
                  : 'No movie results found for the selected category.'
              }
              actionLabel={searchQuery || activeFilterCount > 0 ? 'Reset Filters' : undefined}
              actionIcon="X"
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  clearFilters();
                }
              }}
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

      <FilterSheet
        visible={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        genres={genres}
        filters={filters}
        onApply={applyFilters}
        onClear={clearFilters}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollHeaderContainer: {
      paddingBottom: SPACING.xs,
    },

    // ── SEARCH BAR ──────────────────────────────────────────────
    searchBarWrapper: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
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
      minHeight: 44,
      ...SHADOWS.card,
    },
    searchContainerFocused: {
      borderColor: colors.primary,
      backgroundColor: '#0E131E',
    },
    searchIcon: {
      marginRight: SPACING.sm,
    },
    searchInput: {
      flex: 1,
      ...TYPOGRAPHY.body,
      color: colors.text,
      fontSize: 14,
      paddingVertical: 8,
    },
    clearBtn: {
      padding: 6,
    },

    // ── SUGGESTIONS CARD ─────────────────────────────────────────
    suggestionsCard: {
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      paddingVertical: SPACING.xs,
      ...SHADOWS.card,
    },
    suggestionsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xs,
    },
    suggestionsTitle: {
      ...TYPOGRAPHY.captionBold,
      color: colors.textMuted,
      fontSize: 10,
      letterSpacing: 1,
    },
    clearHistoryText: {
      ...TYPOGRAPHY.caption,
      color: colors.primary,
      fontWeight: '700',
    },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
    },
    suggestionText: {
      ...TYPOGRAPHY.body,
      color: colors.text,
      fontSize: 13,
      flex: 1,
    },

    // ── HORIZONTAL CATEGORY SEGMENTS ─────────────────────────────
    categorySegmentRow: {
      marginTop: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    categoryScroll: {
      paddingHorizontal: SPACING.lg,
      gap: 8,
    },
    categoryTab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
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
      fontSize: 12,
    },
    categoryTabTextActive: {
      color: '#07090E',
      fontWeight: '800',
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: RADIUS.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      gap: 6,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterBtnText: {
      ...TYPOGRAPHY.captionBold,
      color: colors.textSecondary,
      fontSize: 12,
    },
    filterBtnTextActive: {
      color: '#07090E',
      fontWeight: '800',
    },
    filterCountBadge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#07090E',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    filterCountText: {
      fontSize: 10,
      color: colors.primary,
      fontWeight: '900',
    },

    // ── SUB-FILTER SECTION (FORMATS / MOODS TOGGLE) ──────────────
    subFilterSection: {
      marginTop: 6,
      marginBottom: 6,
    },
    subFilterHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      marginBottom: 6,
    },
    subFilterSegmentToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: RADIUS.full,
      padding: 2,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    subFilterToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: RADIUS.full,
    },
    subFilterToggleBtnActive: {
      backgroundColor: '#161D2B',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    subFilterToggleText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
    },
    subFilterToggleTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },
    resetFilterBtn: {
      paddingVertical: 2,
      paddingHorizontal: 6,
    },
    resetFilterText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    chipsScroll: {
      paddingHorizontal: SPACING.lg,
      gap: 6,
      paddingVertical: 2,
    },

    // ── SECTION HEADLINE ─────────────────────────────────────────
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.xs,
    },
    sectionHeaderTitle: {
      ...TYPOGRAPHY.h2,
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    sectionHeaderSubtitle: {
      ...TYPOGRAPHY.caption,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },

    // ── MOVIE GRID ───────────────────────────────────────────────
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

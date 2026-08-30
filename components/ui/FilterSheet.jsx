import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, RotateCcw, Check } from 'lucide-react-native';
import Chip from './Chip';
import IconButton from './IconButton';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const SORTS = [
  { id: 'popularity.desc', label: 'Most Popular' },
  { id: 'vote_average.desc', label: 'Highest Rated' },
  { id: 'release_date.desc', label: 'Newest' },
  { id: 'release_date.asc', label: 'Oldest' },
];

const RATINGS = [
  { id: 0, label: 'Any rating' },
  { id: 7, label: '7+' },
  { id: 8, label: '8+' },
  { id: 8.5, label: '8.5+' },
];

const YEARS = [
  { id: null, label: 'Any year' },
  { id: 2026, label: '2026' },
  { id: 2025, label: '2025' },
  { id: 2024, label: '2024' },
  { id: 2020, label: '2020s' },
  { id: 2010, label: '2010s' },
];

const LANGUAGES = [
  { id: null, label: 'All languages' },
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'Hindi' },
  { id: 'te', label: 'Telugu' },
  { id: 'ta', label: 'Tamil' },
  { id: 'kn', label: 'Kannada' },
  { id: 'ml', label: 'Malayalam' },
  { id: 'ja', label: 'Japanese' },
  { id: 'ko', label: 'Korean' },
];

export default function FilterSheet({ visible, onClose, genres = [], filters, onApply, onClear }) {
  const { colors } = useTheme();
  const [draft, setDraft] = React.useState(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  }, [visible, filters]);

  const styles = createStyles(colors);
  const activeCount = [
    draft.genreId,
    draft.year,
    draft.minRating && draft.minRating > 0 ? draft.minRating : null,
    draft.language,
    draft.sortBy !== 'popularity.desc' ? draft.sortBy : null,
  ].filter(Boolean).length;

  const applyFilters = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={onClose} accessibilityLabel="Close filters" />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Movies</Text>
              {activeCount > 0 ? (
                <Text style={styles.count}>{activeCount} filter{activeCount > 1 ? 's' : ''} applied</Text>
              ) : null}
            </View>
            <View style={styles.headerActions}>
              {activeCount > 0 ? (
                <TouchableOpacity onPress={onClear} style={styles.clearBtn} accessibilityRole="button" accessibilityLabel="Clear all filters">
                  <RotateCcw size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              ) : null}
              <IconButton icon="X" variant="surface" onPress={onClose} accessibilityLabel="Close filters" />
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.sectionHeading}>GENRE</Text>
            <View style={styles.chipWrap}>
              <Chip label="All Genres" selected={!draft.genreId} onPress={() => setDraft({ ...draft, genreId: null })} />
              {genres.map((g) => (
                <Chip
                  key={g.id}
                  label={g.name}
                  selected={draft.genreId === g.id}
                  onPress={() => setDraft({ ...draft, genreId: g.id })}
                  accessibilityLabel={`Filter by genre ${g.name}`}
                />
              ))}
            </View>

            <Text style={styles.sectionHeading}>SORT BY</Text>
            <View style={styles.chipWrap}>
              {SORTS.map((s) => (
                <Chip
                  key={s.id}
                  label={s.label}
                  selected={draft.sortBy === s.id}
                  onPress={() => setDraft({ ...draft, sortBy: s.id })}
                />
              ))}
            </View>

            <Text style={styles.sectionHeading}>MINIMUM RATING</Text>
            <View style={styles.chipWrap}>
              {RATINGS.map((r) => (
                <Chip
                  key={r.label}
                  label={r.label}
                  selected={Number(draft.minRating) === r.id}
                  onPress={() => setDraft({ ...draft, minRating: r.id })}
                />
              ))}
            </View>

            <Text style={styles.sectionHeading}>RELEASE YEAR</Text>
            <View style={styles.chipWrap}>
              {YEARS.map((y) => (
                <Chip
                  key={y.label}
                  label={y.label}
                  selected={draft.year === y.id}
                  onPress={() => setDraft({ ...draft, year: y.id })}
                />
              ))}
            </View>

            <Text style={styles.sectionHeading}>LANGUAGE</Text>
            <View style={styles.chipWrap}>
              {LANGUAGES.map((l) => (
                <Chip
                  key={l.label}
                  label={l.label}
                  selected={draft.language === l.id}
                  onPress={() => setDraft({ ...draft, language: l.id })}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={applyFilters}
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Check size={16} color="#07090E" strokeWidth={2.4} />
              <Text style={styles.applyText}>
                Apply{activeCount > 0 ? ` (${activeCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    ...SHADOWS.modal,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorderActive,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: { ...TYPOGRAPHY.h2, color: colors.text },
  count: { ...TYPOGRAPHY.caption, color: colors.primary, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.xs },
  clearText: { ...TYPOGRAPHY.caption, color: colors.textSecondary },
  body: { flexGrow: 0 },
  bodyContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },
  sectionHeading: { ...TYPOGRAPHY.badge, fontSize: 11, color: colors.textMuted, letterSpacing: 1, marginBottom: SPACING.sm, marginTop: SPACING.md },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  footer: { padding: SPACING.lg, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 48,
    borderRadius: RADIUS.md,
  },
  applyText: { ...TYPOGRAPHY.bodyBold, color: '#07090E' },
});

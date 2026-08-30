import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Film,
  Star,
  MapPin,
  Users,
  Award,
  Share2,
  X,
  Sparkles,
  Camera,
  Calendar,
} from 'lucide-react-native';
import { useMemoryStore } from '../store/useMemoryStore';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const YEAR_OPTIONS = ['all', '2026', '2025', '2024'];

export default function CinephileRecapModal({ visible, onClose }) {
  const { colors } = useTheme();
  const memories = useMemoryStore((s) => s.memories);
  const [selectedYear, setSelectedYear] = useState('all');

  // Compute real stats from actual logged memories filtered by year
  const stats = useMemo(() => {
    if (!memories || memories.length === 0) {
      return null;
    }

    let filtered = memories;
    if (selectedYear !== 'all') {
      filtered = memories.filter((m) => {
        const d = m.date || m.createdAt;
        return d && String(d).includes(selectedYear);
      });
    }

    if (filtered.length === 0) {
      return {
        isEmptyForYear: true,
        selectedYear,
      };
    }

    const totalMovies = filtered.length;

    // Cinema visits
    const cinemaCounts = {};
    const formatCounts = {};
    let totalStars = 0;
    const companionSet = new Set();

    filtered.forEach((m) => {
      if (m.cinema || m.cinemaName) {
        const cName = m.cinema || m.cinemaName;
        cinemaCounts[cName] = (cinemaCounts[cName] || 0) + 1;
      }
      if (m.format || m.experienceType) {
        const fmt = m.format || m.experienceType;
        formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
      }
      if (m.rating) {
        totalStars += Number(m.rating);
      }
      if (Array.isArray(m.companions)) {
        m.companions.forEach((c) => companionSet.add(c));
      }
    });

    // Find top cinema
    let topCinema = 'PVR INOX';
    let maxVisits = 0;
    Object.entries(cinemaCounts).forEach(([cin, count]) => {
      if (count > maxVisits) {
        maxVisits = count;
        topCinema = cin;
      }
    });

    // Find top format
    let topFormat = 'IMAX Laser';
    let maxFmt = 0;
    Object.entries(formatCounts).forEach(([fmt, count]) => {
      if (count > maxFmt) {
        maxFmt = count;
        topFormat = fmt;
      }
    });

    const avgRating = (totalStars / totalMovies).toFixed(1);

    return {
      totalMovies,
      topCinema,
      topFormat,
      avgRating,
      uniqueCompanions: companionSet.size,
      imaxCount: formatCounts['IMAX 70mm'] || formatCounts['IMAX Laser'] || formatCounts['IMAX'] || 0,
      dolbyCount: formatCounts['Dolby Cinema'] || formatCounts['Dolby Atmos'] || 0,
      selectedYear,
    };
  }, [memories, selectedYear]);

  const handleShareRecap = async () => {
    if (!stats || stats.isEmptyForYear) return;
    const yearLabel = stats.selectedYear === 'all' ? 'All-Time' : stats.selectedYear;
    const msg = `🎬 My CineTrip Theatrical Recap (${yearLabel})\n\n🍿 ${stats.totalMovies} Movies Watched on the Big Screen\n🏛️ Top Cinema: ${stats.topCinema}\n⚡ Top Format: ${stats.topFormat}\n👥 Friends in Squad: ${stats.uniqueCompanions}\n⭐ Average Rating: ${stats.avgRating}/5.0\n\nTracked with CineTrip.`;
    try {
      await Share.share({ message: msg });
    } catch (e) {}
  };

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerEyebrow}>CINEPHILE RECAP</Text>
              <Text style={styles.headerTitle}>Your Year in Cinema</Text>
            </View>
            <IconButton
              icon="X"
              variant="surface"
              onPress={onClose}
              accessibilityLabel="Close Recap Modal"
            />
          </View>

          {/* Year Segment Filter */}
          <View style={styles.yearFilterRow}>
            {YEAR_OPTIONS.map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.yearPill, selectedYear === y && styles.yearPillActive]}
                onPress={() => setSelectedYear(y)}
              >
                <Text style={[styles.yearPillText, selectedYear === y && styles.yearPillTextActive]}>
                  {y === 'all' ? 'All-Time' : y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {stats && !stats.isEmptyForYear ? (
              <View style={styles.recapCard}>
                {/* Visual Marquee Banner */}
                <View style={styles.marqueeBanner}>
                  <Award size={32} color={colors.primary} />
                  <Text style={styles.bannerHeadline}>
                    {selectedYear === 'all' ? 'AUTHENTIC THEATRICAL LOG' : `${selectedYear} CINEPHILE REPORT`}
                  </Text>
                  <Text style={styles.bannerSub}>Lifetime screening history calculated from your verified memories.</Text>
                </View>

                {/* Big Stat Grid */}
                <View style={styles.gridContainer}>
                  <View style={styles.statBox}>
                    <Film size={18} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalMovies}</Text>
                    <Text style={styles.statLabel}>Screenings Watched</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Star size={18} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.statNumber}>{stats.avgRating} ★</Text>
                    <Text style={styles.statLabel}>Average Rating</Text>
                  </View>

                  <View style={styles.statBox}>
                    <MapPin size={18} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.topFormat}</Text>
                    <Text style={styles.statLabel}>Preferred Format</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Users size={18} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.uniqueCompanions}</Text>
                    <Text style={styles.statLabel}>Squad Companions</Text>
                  </View>
                </View>

                {/* Top Venue Highlight */}
                <View style={styles.venueHighlight}>
                  <Text style={styles.venueHighlightLabel}>MOST VISITED CINEMA</Text>
                  <Text style={styles.venueHighlightName}>{stats.topCinema}</Text>
                </View>

                {/* Share Button */}
                <Button
                  title="Share My Cinema Recap"
                  icon="Share2"
                  variant="primary"
                  size="lg"
                  onPress={handleShareRecap}
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Camera size={44} color={colors.primary} />
                <Text style={styles.emptyTitle}>
                  {selectedYear === 'all' ? 'No Screening Memories Yet' : `No Memories Logged for ${selectedYear}`}
                </Text>
                <Text style={styles.emptyDesc}>
                  Once you attend a movie and log your sound, screen, and companion ratings in the Memories tab,
                  your personal theatrical recap will generate automatically.
                </Text>
                <Button
                  title="Close & Explore Movies"
                  variant="surface"
                  size="md"
                  onPress={onClose}
                  style={{ marginTop: 16 }}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(7, 9, 14, 0.96)',
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerTitleCol: {
      gap: 2,
    },
    headerEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    yearFilterRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    yearPill: {
      backgroundColor: '#121722',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    yearPillActive: {
      backgroundColor: 'rgba(229, 169, 60, 0.15)',
      borderColor: colors.primary,
    },
    yearPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#94A3B8',
    },
    yearPillTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
    recapCard: {
      maxWidth: 540,
      width: '100%',
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      ...SHADOWS.card,
    },
    marqueeBanner: {
      alignItems: 'center',
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.25)',
      marginBottom: 20,
      gap: 6,
    },
    bannerHeadline: {
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 1.2,
      color: colors.primary,
      marginTop: 6,
    },
    bannerSub: {
      fontSize: 11,
      color: '#94A3B8',
      textAlign: 'center',
      lineHeight: 16,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    statBox: {
      flexBasis: '47%',
      flexGrow: 1,
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.md,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      gap: 6,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    statLabel: {
      fontSize: 11,
      color: '#64748B',
    },
    venueHighlight: {
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.md,
      padding: 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      gap: 4,
    },
    venueHighlightLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.primary,
    },
    venueHighlightName: {
      fontSize: 15,
      fontWeight: '800',
      color: '#F8FAFC',
    },
    emptyCard: {
      maxWidth: 440,
      width: '100%',
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      marginTop: 40,
      gap: 12,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#F8FAFC',
    },
    emptyDesc: {
      fontSize: 13,
      lineHeight: 20,
      color: '#94A3B8',
      textAlign: 'center',
    },
  });

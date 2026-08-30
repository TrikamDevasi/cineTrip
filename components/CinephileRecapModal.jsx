import React, { useMemo } from 'react';
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
} from 'lucide-react-native';
import { useMemoryStore } from '../store/useMemoryStore';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CinephileRecapModal({ visible, onClose }) {
  const { colors } = useTheme();
  const memories = useMemoryStore((s) => s.memories);

  // Compute real stats from actual logged memories
  const stats = useMemo(() => {
    if (!memories || memories.length === 0) {
      return null;
    }

    const totalMovies = memories.length;

    // Cinema visits
    const cinemaCounts = {};
    const formatCounts = {};
    let totalStars = 0;
    const companionSet = new Set();

    memories.forEach((m) => {
      if (m.cinema) {
        cinemaCounts[m.cinema] = (cinemaCounts[m.cinema] || 0) + 1;
      }
      if (m.format) {
        formatCounts[m.format] = (formatCounts[m.format] || 0) + 1;
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
    };
  }, [memories]);

  const handleShareRecap = async () => {
    if (!stats) return;
    const msg = `🎬 My CineTrip Theatrical Recap\n\n🍿 ${stats.totalMovies} Movies Watched on the Big Screen\n🏛️ Top Cinema: ${stats.topCinema}\n⚡ Top Format: ${stats.topFormat}\n👥 Friends in Squad: ${stats.uniqueCompanions}\n⭐ Average Rating: ${stats.avgRating}/5.0\n\nTracked with CineTrip.`;
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

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {stats ? (
              <View style={styles.recapCard}>
                {/* Visual Marquee Banner */}
                <View style={styles.marqueeBanner}>
                  <Award size={32} color={colors.primary} />
                  <Text style={styles.bannerHeadline}>AUTHENTIC THEATRICAL LOG</Text>
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
                <Text style={styles.emptyTitle}>No Screening Memories Yet</Text>
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

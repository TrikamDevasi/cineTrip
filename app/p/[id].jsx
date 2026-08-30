import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  useWindowDimensions,
  Share,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Film,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Share2,
  ArrowLeft,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import QRCodeSvg from '../../components/ui/QRCodeSvg';
import FormatBadge from '../../components/FormatBadge';
import Button from '../../components/ui/Button';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { getImageUri, FALLBACK_MOVIES } from '../../services/tmdb';
import { openCalendarEvent } from '../../services/calendar';
import { showAlert } from '../../lib/alert';
import api from '../../services/api';

const logoImg = require('../../assets/images/logo.png');

export default function SharedPlanPreviewScreen() {
  const { id } = useLocalSearchParams();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const isDesktop = windowWidth >= 1024;

  const { colors } = useTheme();
  const router = useRouter();
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);

  const getPlanById = usePlannerStore((s) => s.getPlanById);
  const existingLocalPlan = getPlanById(id);

  const [remotePlan, setRemotePlan] = useState(null);
  const [loading, setLoading] = useState(Boolean(id && id !== 'share-demo-1' && !existingLocalPlan));
  const [guestName, setGuestName] = useState('');
  const [isRsvping, setIsRsvping] = useState(false);
  const [rsvpState, setRsvpState] = useState(false);
  const [friendsList, setFriendsList] = useState([]);

  // Fetch public plan data from backend API if not already in local store
  useEffect(() => {
    let isMounted = true;
    if (id && id !== 'share-demo-1' && !existingLocalPlan) {
      setLoading(true);
      api
        .get(`/api/plans/public/${id}`)
        .then((res) => {
          if (isMounted && res.data) {
            setRemotePlan(res.data);
            setFriendsList(res.data.friends || []);
          }
        })
        .catch(() => {
          // Gracefully fallback to sample preview
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else if (existingLocalPlan) {
      setFriendsList(existingLocalPlan.friends || []);
    }
    return () => {
      isMounted = false;
    };
  }, [id, existingLocalPlan]);

  // Fallback to rich demo plan if opened directly via shared link
  const plan = useMemo(() => {
    if (remotePlan) return remotePlan;
    if (existingLocalPlan) return existingLocalPlan;
    const movie = FALLBACK_MOVIES[0] || {
      id: 693134,
      title: 'Dune: Part Two',
      tagline: 'Long live the fighters.',
      poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b2e.jpg',
      runtime: 166,
      vote_average: 8.2,
      formats: ['IMAX 70mm', 'Dolby Cinema'],
    };

    return {
      _id: id || 'share-demo-1',
      movie,
      cinema: {
        name: 'PVR INOX IMAX with Laser',
        address: 'Phoenix Palladium, Lower Parel',
        screenType: 'IMAX Laser',
        latitude: 18.9934,
        longitude: 72.8258,
      },
      date: new Date().toISOString().split('T')[0],
      time: '07:30 PM',
      seats: 'Row F • Seats 4, 5',
      snacks: ['Giant Caramel Popcorn', 'Cherry ICEE'],
      friends: [
        { name: 'Alex Chen', status: 'confirmed', handle: '@alex_film' },
        { name: 'Sarah Miller', status: 'confirmed', handle: '@sarah_m' },
      ],
      bookingRef: `CT-PASS-${movie.id}`,
      bookingStatus: 'plan',
    };
  }, [remotePlan, existingLocalPlan, id]);

  useEffect(() => {
    if (plan.friends && friendsList.length === 0) {
      setFriendsList(plan.friends);
    }
  }, [plan]);

  const movie = plan.movie || {};
  const cinema = plan.cinema || {};

  const handleToggleRsvp = async () => {
    if (!guestName.trim()) {
      showAlert('Name Required', 'Please enter your name or handle above to RSVP.');
      return;
    }

    setIsRsvping(true);
    try {
      const trimmedName = guestName.trim();
      if (id && id !== 'share-demo-1') {
        const res = await api.post(`/api/plans/public/${id}/rsvp`, {
          name: trimmedName,
          status: 'confirmed',
        });
        if (res.data?.friends) {
          setFriendsList(res.data.friends);
        }
      } else {
        // Local state update for preview mode
        const updated = [...friendsList, { name: trimmedName, status: 'confirmed', handle: `@${trimmedName.toLowerCase().replace(/\s+/g, '')}` }];
        setFriendsList(updated);
      }

      setRsvpState(true);
      showAlert("You're In!", `You have RSVP'd to movie night for ${movie.title}.`);
    } catch (e) {
      // Fallback local RSVP
      setRsvpState(true);
      showAlert("You're In!", `RSVP recorded locally for ${movie.title}.`);
    } finally {
      setIsRsvping(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎬 Movie Night Outing with CineTrip\n\nFilm: ${movie.title}\nCinema: ${cinema.name}\nShowtime: ${plan.time}\nSeats: ${plan.seats || 'Row F'}\n\nJoin the squad: https://cinetrip.app/p/${plan._id || id}`,
      });
    } catch (e) {}
  };

  const handleDirections = () => {
    const { latitude, longitude } = cinema;
    if (latitude == null || longitude == null) {
      showAlert('Location unavailable', 'This cinema does not have coordinates attached.');
      return;
    }
    const label = encodeURIComponent(cinema.name || 'Cinema');
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${latitude},${longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => {});
  };

  const styles = createStyles(colors, isMobile, isDesktop);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading shared movie night...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Editorial Navbar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBrand}
          onPress={() => router.push('/landing')}
          activeOpacity={0.8}
        >
          <View style={styles.brandBadge}>
            <Image source={logoImg} style={styles.navLogoImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.brandTitle}>CineTrip</Text>
            <Text style={styles.brandSubtitle}>SHARED MOVIE NIGHT</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navShareBtn}
          onPress={handleShare}
        >
          <Share2 size={16} color={colors.primary} />
          <Text style={styles.navShareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cinematic Backdrop & Hero */}
        <View style={styles.heroContainer}>
          {movie.backdrop_path && (
            <Image
              source={{ uri: getImageUri(movie.backdrop_path, 'w1280') }}
              style={styles.backdropImg}
              resizeMode="cover"
            />
          )}
          <View style={styles.backdropOverlay} />

          <View style={styles.heroContent}>
            <View style={styles.heroEyebrowRow}>
              <View style={styles.heroDot} />
              <Text style={styles.heroEyebrow}>YOU'RE INVITED TO MOVIE NIGHT</Text>
            </View>

            <Text style={styles.movieTitle}>{movie.title}</Text>
            {movie.tagline && <Text style={styles.movieTagline}>"{movie.tagline}"</Text>}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Calendar size={13} color={colors.primary} />
                <Text style={styles.metaText}>{plan.date || 'Today'}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Clock size={13} color={colors.primary} />
                <Text style={styles.metaText}>{plan.time || '07:30 PM'}</Text>
              </View>
              <View style={styles.metaDot} />
              <View style={styles.metaItem}>
                <Film size={13} color={colors.primary} />
                <Text style={styles.metaText}>{cinema.screenType || 'IMAX'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Two-Column Details Layout */}
        <View style={styles.mainLayout}>
          {/* Left Column: Cinema, Seats & Concessions */}
          <View style={styles.leftCol}>
            {/* Cinema Venue Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeaderTitle}>AUDITORIUM VENUE</Text>
              <Text style={styles.cinemaName}>{cinema.name}</Text>
              <Text style={styles.cinemaAddress}>{cinema.address}</Text>

              <View style={styles.cardActionRow}>
                <Button
                  title="Directions"
                  icon="MapPin"
                  variant="outline"
                  size="sm"
                  onPress={handleDirections}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Add to Calendar"
                  icon="Calendar"
                  variant="outline"
                  size="sm"
                  onPress={() => openCalendarEvent(plan)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            {/* Seats & Squad Details */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeaderTitle}>SEAT ASSIGNMENTS & SQUAD</Text>
              <View style={styles.seatsRow}>
                <Text style={styles.seatBadgeLabel}>RESERVED SEATS:</Text>
                <Text style={styles.seatBadgeVal}>{plan.seats || 'Row F • Seats 4, 5'}</Text>
              </View>

              <View style={styles.squadList}>
                <Text style={styles.squadTitle}>ATTENDEES ({friendsList.length || 2}):</Text>
                {friendsList.map((f, idx) => (
                  <View key={idx} style={styles.squadMemberItem}>
                    <View style={styles.squadAvatar}><Text style={styles.squadAvatarText}>{(f.name || 'F').charAt(0).toUpperCase()}</Text></View>
                    <Text style={styles.squadMemberName}>{f.name}</Text>
                    <View style={[styles.confirmedPill, f.status === 'maybe' && { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <Text style={[styles.confirmedPillText, f.status === 'maybe' && { color: '#F59E0B' }]}>
                        {f.status ? f.status.toUpperCase() : 'CONFIRMED'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Concessions */}
              {plan.snacks && plan.snacks.length > 0 && (
                <View style={styles.snackBox}>
                  <Utensils size={13} color={colors.primary} />
                  <Text style={styles.snackBoxText}>Snacks: {plan.snacks.join(' • ')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Column: Digital Pass Preview & RSVP */}
          <View style={styles.rightCol}>
            {/* Scannable Pass Box */}
            <View style={styles.passBox}>
              <View style={styles.passBoxHeader}>
                <Text style={styles.passBoxTitle}>DIGITAL OUTING PASS</Text>
                <View style={styles.passVerifiedPill}>
                  <Check size={10} color="#07090E" strokeWidth={3} />
                  <Text style={styles.passVerifiedText}>READY</Text>
                </View>
              </View>

              <View style={styles.qrCenterWrap}>
                <QRCodeSvg
                  value={`CINETRIP|${movie.id || 693134}|${plan.bookingRef || 'SHARE-REF'}`}
                  size={120}
                  color="#07090E"
                  backgroundColor="#FFFFFF"
                />
                <Text style={styles.qrRefText}>{plan.bookingRef || 'CT-OUTING-PASS'}</Text>
              </View>

              {/* Guest RSVP Input */}
              {!rsvpState ? (
                <View style={styles.rsvpInputWrap}>
                  <Text style={styles.rsvpInputLabel}>YOUR NAME / HANDLE TO RSVP:</Text>
                  <TextInput
                    style={styles.rsvpInput}
                    value={guestName}
                    onChangeText={setGuestName}
                    placeholder="e.g. Priyansh, @priyansh_cine"
                    placeholderTextColor="#64748B"
                  />
                  <TouchableOpacity
                    style={[styles.rsvpBtn, (!guestName.trim() || isRsvping) && { opacity: 0.8 }]}
                    onPress={handleToggleRsvp}
                    disabled={isRsvping}
                    activeOpacity={0.85}
                  >
                    {isRsvping ? (
                      <ActivityIndicator size="small" color="#07090E" />
                    ) : (
                      <>
                        <UserPlus size={16} color="#07090E" strokeWidth={2.5} />
                        <Text style={styles.rsvpBtnText}>RSVP: I'M IN!</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.rsvpConfirmedBox}>
                  <Check size={18} color="#10B981" strokeWidth={3} />
                  <Text style={styles.rsvpConfirmedText}>You're attending as {guestName.trim()}!</Text>
                </View>
              )}
            </View>

            {/* Launch CineTrip Trigger */}
            <TouchableOpacity
              style={styles.openAppBanner}
              onPress={() => {
                enterGuestMode();
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.openAppTitle}>Plan your own movie night</Text>
              <Text style={styles.openAppSub}>Explore theatrical releases, nearby IMAX screens & cinema journal on CineTrip.</Text>
              <View style={styles.openAppCtaRow}>
                <Text style={styles.openAppCtaText}>Open CineTrip App</Text>
                <ChevronRight size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors, isMobile, isDesktop) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#07090E',
    },
    loadingCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: '#94A3B8',
    },
    scroll: {
      flex: 1,
      backgroundColor: '#07090E',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    topNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(7, 9, 14, 0.95)',
    },
    navBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#0C0F17',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    navLogoImg: {
      width: 24,
      height: 24,
    },
    brandTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    brandSubtitle: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.primary,
    },
    navShareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    navShareBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },

    // Hero Section
    heroContainer: {
      height: isMobile ? 240 : 300,
      width: '100%',
      position: 'relative',
      justifyContent: 'flex-end',
      padding: isMobile ? 18 : 32,
    },
    backdropImg: {
      ...StyleSheet.absoluteFillObject,
      width: '100%',
      height: '100%',
    },
    backdropOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(7, 9, 14, 0.75)',
    },
    heroContent: {
      zIndex: 10,
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
    },
    heroEyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6,
    },
    heroDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    heroEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
    },
    movieTitle: {
      fontSize: isMobile ? 26 : 36,
      fontWeight: '900',
      color: '#F8FAFC',
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    movieTagline: {
      fontSize: 12,
      fontStyle: 'italic',
      color: '#94A3B8',
      marginBottom: 10,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Main Layout
    mainLayout: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isDesktop ? 'row' : 'column',
      gap: 20,
      paddingHorizontal: isMobile ? 16 : 24,
      marginTop: 20,
    },
    leftCol: {
      flex: 1.2,
      gap: 16,
    },
    rightCol: {
      flex: 1,
      gap: 16,
    },
    infoCard: {
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardHeaderTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
      marginBottom: 8,
    },
    cinemaName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    cinemaAddress: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 16,
    },
    cardActionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    seatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#0C0F17',
      padding: 12,
      borderRadius: RADIUS.sm,
      marginBottom: 14,
    },
    seatBadgeLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
    },
    seatBadgeVal: {
      fontSize: 13,
      fontWeight: '900',
      color: colors.primary,
    },
    squadList: {
      gap: 8,
      marginBottom: 14,
    },
    squadTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    squadMemberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0C0F17',
      padding: 8,
      borderRadius: RADIUS.xs,
      gap: 10,
    },
    squadAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(229, 169, 60, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    squadAvatarText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
    },
    squadMemberName: {
      fontSize: 12,
      fontWeight: '600',
      color: '#F8FAFC',
      flex: 1,
    },
    confirmedPill: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    confirmedPillText: {
      fontSize: 8,
      fontWeight: '800',
      color: '#10B981',
    },
    snackBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#0C0F17',
      padding: 10,
      borderRadius: RADIUS.xs,
    },
    snackBoxText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
    },

    // Pass Box
    passBox: {
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
    },
    passBoxHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      alignItems: 'center',
      marginBottom: 16,
    },
    passBoxTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
    },
    passVerifiedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    passVerifiedText: {
      fontSize: 8,
      fontWeight: '900',
      color: '#07090E',
    },
    qrCenterWrap: {
      padding: 10,
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.md,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    qrRefText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: '#94A3B8',
      marginTop: 8,
    },
    rsvpInputWrap: {
      width: '100%',
      gap: 8,
    },
    rsvpInputLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
    },
    rsvpInput: {
      backgroundColor: '#0C0F17',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: RADIUS.sm,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: '#F8FAFC',
      fontSize: 13,
    },
    rsvpBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: RADIUS.sm,
      marginTop: 4,
    },
    rsvpBtnText: {
      fontSize: 13,
      fontWeight: '900',
      color: '#07090E',
      letterSpacing: 0.5,
    },
    rsvpConfirmedBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      width: '100%',
      justifyContent: 'center',
    },
    rsvpConfirmedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#10B981',
    },

    // Open App Banner
    openAppBanner: {
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    openAppTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    openAppSub: {
      fontSize: 11,
      lineHeight: 16,
      color: '#94A3B8',
      marginBottom: 10,
    },
    openAppCtaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    openAppCtaText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
  });

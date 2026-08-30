import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Film,
  Ticket,
  MapPin,
  Users,
  Compass,
  Sparkles,
  Star,
  Clock,
  Check,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Radio,
  Camera,
  Share2,
  Layers,
  Utensils,
  Menu,
  X,
  Bookmark,
  Calendar,
  Copy,
  Volume2,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import QRCodeSvg from '../components/ui/QRCodeSvg';
import FormatBadge from '../components/FormatBadge';
import { useAuthStore } from '../store/useAuthStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { FALLBACK_MOVIES, getImageUri } from '../services/tmdb';
import { showAlert } from '../lib/alert';

const logoImg = require('../assets/images/logo.png');

// Verifiable authentic theatrical titles for interactive demonstrations
const HERO_MOVIES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    year: '2024',
    director: 'Denis Villeneuve',
    runtime: '166 min',
    vote_average: 8.2,
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b2e.jpg',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    formats: ['IMAX 70mm', 'Dolby Cinema', '4DX'],
    cinemaName: 'PVR INOX IMAX with Laser',
    cinemaLocation: 'Phoenix Palladium, Lower Parel',
    showtime: '07:30 PM',
    seats: 'Row F • Seats 4, 5',
    snacks: ['Giant Caramel Popcorn', 'Cherry ICEE'],
    friends: [
      { name: 'Alex Chen', status: 'confirmed', handle: '@alex_film' },
      { name: 'Sarah Miller', status: 'confirmed', handle: '@sarah_m' },
      { name: 'Dev Patel', status: 'invited', handle: '@dev_cine' },
    ],
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    year: '2023',
    director: 'Christopher Nolan',
    runtime: '180 min',
    vote_average: 8.1,
    backdrop_path: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    formats: ['IMAX 70mm', 'Dolby Cinema'],
    cinemaName: 'AMC Dolby Cinema Grand',
    cinemaLocation: 'City Center Hub, Level 4',
    showtime: '08:15 PM',
    seats: 'Row E • Seats 7, 8, 9',
    snacks: ['Loaded Cheese Nachos', 'Cold Brew Coffee'],
    friends: [
      { name: 'Marcus Brody', status: 'confirmed', handle: '@marcus_b' },
      { name: 'Elena Vance', status: 'confirmed', handle: '@elena_v' },
    ],
  },
  {
    id: 157336,
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    year: '2014',
    director: 'Christopher Nolan',
    runtime: '169 min',
    vote_average: 8.4,
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    formats: ['IMAX 70mm', 'Dolby Atmos'],
    cinemaName: 'PVR Director\'s Cut',
    cinemaLocation: 'Grand Hyatt Plaza, BKC',
    showtime: '09:00 PM',
    seats: 'Row D • Prime Recliner 3',
    snacks: ['Dark Chocolate Bites', 'Artisanal Popcorn'],
    friends: [
      { name: 'Alex Chen', status: 'confirmed', handle: '@alex_film' },
    ],
  },
];

// Interactive Mood Selector Options
const DISCOVERY_MOODS = [
  { id: 'all', label: '🎬 All Theatrical', genreIds: [] },
  { id: 'big_screen', label: '⚡ Big Screen IMAX', genreIds: [878, 12] },
  { id: 'fun', label: '😂 Fun Night', genreIds: [35, 16] },
  { id: 'adrenaline', label: '😱 Adrenaline & Action', genreIds: [28, 53] },
  { id: 'date', label: '❤️ Date Night', genreIds: [10749, 18] },
  { id: 'thoughtful', label: '🧠 Thoughtful & Epic', genreIds: [18, 878] },
  { id: 'easy', label: '🍿 Easy Popcorn Watch', genreIds: [28, 35] },
];

const SAMPLE_CINEMAS_LIST = [
  {
    name: 'PVR INOX IMAX with Laser',
    brand: 'IMAX Laser 3D',
    address: 'Phoenix Palladium, Lower Parel',
    distance: '2.4 km',
    screenType: 'IMAX Laser',
  },
  {
    name: 'Dolby Cinema at AMC',
    brand: 'Dolby Vision + Atmos',
    address: 'Metro Hub 4th Floor',
    distance: '4.1 km',
    screenType: 'Dolby Cinema',
  },
  {
    name: 'PVR Director\'s Cut VIP',
    brand: 'Gold Class 4K',
    address: 'Grand Hyatt Plaza, BKC',
    distance: '6.8 km',
    screenType: 'VIP Recliner',
  },
  {
    name: 'Cinepolis 4DX Immersive',
    brand: 'Motion & Environmental FX',
    address: 'Viviana Mall, Level 3',
    distance: '8.5 km',
    screenType: '4DX Motion',
  },
];

const MEMORIES_SHOWCASE = [
  {
    id: 'mem-1',
    movieTitle: 'Oppenheimer',
    cinema: 'PVR INOX IMAX 70mm',
    format: 'IMAX 70mm Film',
    date: 'July 22, 2023',
    rating: 5,
    story: 'The acoustic pressure during the Trinity test shook the entire auditorium row. Absolute pinnacle of physical theater projection.',
    companions: ['Alex Chen', 'Sarah Miller'],
    photoUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    snack: 'Caramel Popcorn & Cold Brew',
  },
  {
    id: 'mem-2',
    movieTitle: 'Dune: Part Two',
    cinema: 'AMC Dolby Cinema',
    format: 'Dolby Vision + Atmos',
    date: 'March 3, 2024',
    rating: 5,
    story: 'Hans Zimmer score with 64-channel Atmos was transcendent. We talked about the worm riding scene for two hours afterwards at dinner.',
    companions: ['Elena Vance', 'Marcus Brody'],
    photoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    snack: 'Loaded Cheese Nachos',
  },
];

export default function LandingScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const { colors } = useTheme();
  const router = useRouter();
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);
  const setDraftMovie = usePlannerStore((s) => s.setDraftMovie);

  const scrollRef = useRef(null);

  // Interactive showcase state
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(7948); // 02h 12m 28s
  const [activePlannerStep, setActivePlannerStep] = useState(2); // 1: Movie, 2: Venue & Snacks, 3: Seats & Squad
  const [selectedSeats, setSelectedSeats] = useState(['F4', 'F5']);
  const [selectedSnacks, setSelectedSnacks] = useState(['Giant Caramel Popcorn', 'Cherry ICEE']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Discover Filter State
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('now_playing'); // 'now_playing' | 'trending' | 'upcoming'
  const [selectedMoodId, setSelectedMoodId] = useState('all');
  const [copiedRef, setCopiedRef] = useState(false);

  const activeHeroMovie = HERO_MOVIES[selectedMovieIndex];

  // Active countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 7200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  const handleLaunchApp = (destination = '/(tabs)') => {
    enterGuestMode();
    router.replace(destination);
  };

  const handlePlanSpecificMovie = (movie) => {
    setDraftMovie(movie);
    enterGuestMode();
    router.replace('/(tabs)/planner');
  };

  const handleCopyRefCode = async (refCode) => {
    try {
      await Clipboard.setStringAsync(refCode);
      setCopiedRef(true);
      showAlert('Pass Ref Copied', `Turnstile Reference ${refCode} copied to clipboard.`);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch (e) {}
  };

  const handleShareOuting = async (movie) => {
    try {
      await Share.share({
        message: `🎬 Movie Night with CineTrip\n\nFilm: ${movie.title}\nVenue: ${movie.cinemaName}\nShowtime: ${movie.showtime}\nSeats: ${movie.seats}\n\nPass Ref: CT-8941-IMAX-${movie.id}\nSee you at the big screen!`,
      });
    } catch (e) {}
  };

  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length < 4) {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
  };

  const handleToggleSnack = (snack) => {
    if (selectedSnacks.includes(snack)) {
      setSelectedSnacks(selectedSnacks.filter((s) => s !== snack));
    } else {
      setSelectedSnacks([...selectedSnacks, snack]);
    }
  };

  // Filtered movies based on category and mood
  const filteredCatalogMovies = useMemo(() => {
    let list = [...FALLBACK_MOVIES];

    if (selectedCategoryTab === 'trending') {
      list = [...list].sort((a, b) => b.vote_count - a.vote_count);
    } else if (selectedCategoryTab === 'upcoming') {
      list = list.filter((m) => m.status?.toLowerCase().includes('upcoming') || m.release_date >= '2024-05-01');
      if (list.length === 0) list = FALLBACK_MOVIES.slice(0, 3);
    }

    if (selectedMoodId !== 'all') {
      const moodConfig = DISCOVERY_MOODS.find((m) => m.id === selectedMoodId);
      if (moodConfig && moodConfig.genreIds.length > 0) {
        list = list.filter((m) =>
          m.genres && m.genres.some((g) => moodConfig.genreIds.includes(g.id))
        );
        if (list.length === 0) list = FALLBACK_MOVIES.slice(0, 2);
      }
    }

    return list;
  }, [selectedCategoryTab, selectedMoodId]);

  const styles = useMemo(() => createStyles(colors, isMobile, isTablet, isDesktop), [colors, isMobile, isTablet, isDesktop]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL NAVBAR
      ────────────────────────────────────────────────────────────── */}
      <View style={[styles.navbar, scrolled && styles.navbarScrolled]}>
        <View style={styles.navContainer}>
          {/* Brand Logo */}
          <TouchableOpacity
            style={styles.navBrand}
            onPress={() => router.push('/landing')}
            activeOpacity={0.8}
            accessibilityRole="link"
            accessibilityLabel="CineTrip Home"
          >
            <View style={styles.brandBadge}>
              <Image source={logoImg} style={styles.navLogoImg} resizeMode="contain" />
            </View>
            <View style={styles.navBrandTextCol}>
              <Text style={styles.brandTitle}>CineTrip</Text>
              <Text style={styles.brandSubtitle}>MOVIES. TOGETHER. MEMORIES.</Text>
            </View>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>v1.0</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <View style={styles.navLinks}>
              <TouchableOpacity
                onPress={() => handleLaunchApp('/(tabs)/discover')}
                style={styles.navLinkItem}
              >
                <Text style={styles.navLinkText}>Discover</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLaunchApp('/(tabs)/planner')}
                style={styles.navLinkItem}
              >
                <Text style={styles.navLinkText}>Trip Planner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLaunchApp('/map')}
                style={styles.navLinkItem}
              >
                <Text style={styles.navLinkText}>Cinema Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleLaunchApp('/(tabs)/memories')}
                style={styles.navLinkItem}
              >
                <Text style={styles.navLinkText}>Journal</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Desktop Right CTAs */}
          {!isMobile && (
            <View style={styles.navActions}>
              <TouchableOpacity
                style={styles.navSignInBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.navSignInText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navPrimaryBtn}
                onPress={() => handleLaunchApp('/(tabs)')}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Open CineTrip Application"
              >
                <Text style={styles.navPrimaryBtnText}>Explore Movies</Text>
                <ArrowRight size={14} color="#07090E" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}

          {/* Mobile Hamburger Toggle */}
          {isMobile && (
            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
              accessibilityLabel="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X size={22} color={colors.text} />
              ) : (
                <Menu size={22} color={colors.text} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Mobile Dropdown Drawer */}
        {isMobile && mobileMenuOpen && (
          <View style={styles.mobileDrawer}>
            <TouchableOpacity
              style={styles.mobileDrawerItem}
              onPress={() => { setMobileMenuOpen(false); handleLaunchApp('/(tabs)/discover'); }}
            >
              <Compass size={18} color={colors.primary} />
              <Text style={styles.mobileDrawerText}>Discover Movies</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileDrawerItem}
              onPress={() => { setMobileMenuOpen(false); handleLaunchApp('/(tabs)/planner'); }}
            >
              <Ticket size={18} color={colors.primary} />
              <Text style={styles.mobileDrawerText}>Trip Planner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileDrawerItem}
              onPress={() => { setMobileMenuOpen(false); handleLaunchApp('/map'); }}
            >
              <MapPin size={18} color={colors.primary} />
              <Text style={styles.mobileDrawerText}>Cinema Locator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mobileDrawerItem}
              onPress={() => { setMobileMenuOpen(false); handleLaunchApp('/(tabs)/memories'); }}
            >
              <Camera size={18} color={colors.primary} />
              <Text style={styles.mobileDrawerText}>Cinephile Journal</Text>
            </TouchableOpacity>
            <View style={styles.mobileDrawerDivider} />
            <TouchableOpacity
              style={styles.mobilePrimaryBtn}
              onPress={() => { setMobileMenuOpen(false); handleLaunchApp('/(tabs)'); }}
            >
              <Text style={styles.mobilePrimaryBtnText}>Launch CineTrip App</Text>
              <ArrowRight size={16} color="#07090E" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setScrolled(y > 20);
        }}
        scrollEventThrottle={16}
      >
        {/* ─────────────────────────────────────────────────────────────
            2. HERO — CINEMATIC OPENING SCENE & 3D DIGITAL PASS
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.heroLayout}>
            {/* Left Column: Editorial Typography & Human Copy */}
            <View style={styles.heroLeft}>
              <View style={styles.heroEyebrowRow}>
                <View style={styles.heroEyebrowDot} />
                <Text style={styles.heroEyebrow}>THEATRICAL OUTING COMPANION</Text>
              </View>

              <Text style={styles.heroMainTitle}>
                YOUR NEXT{'\n'}
                <Text style={{ color: colors.primary }}>MOVIE NIGHT</Text>{'\n'}
                STARTS HERE.
              </Text>

              <Text style={styles.heroSubtitle}>
                Discover certified in-theater releases. Plan the auditorium trip. Coordinate seats with your squad.
                Carry your offline pass straight to the turnstile.
              </Text>

              {/* Action CTAs */}
              <View style={styles.heroButtonRow}>
                <TouchableOpacity
                  style={styles.heroPrimaryBtn}
                  onPress={() => handleLaunchApp('/(tabs)/discover')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Explore Movies in CineTrip"
                >
                  <Text style={styles.heroPrimaryBtnText}>EXPLORE MOVIES</Text>
                  <ArrowRight size={16} color="#07090E" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroSecondaryBtn}
                  onPress={() => handleLaunchApp('/(tabs)/planner')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="See How CineTrip Works"
                >
                  <Ticket size={16} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.heroSecondaryBtnText}>SEE HOW IT WORKS</Text>
                </TouchableOpacity>
              </View>

              {/* Authentic Product Trust Indicators */}
              <View style={styles.heroTrustGrid}>
                <View style={styles.heroTrustItem}>
                  <Radio size={13} color={colors.primary} />
                  <Text style={styles.heroTrustText}>Live TMDB Releases</Text>
                </View>
                <View style={styles.heroTrustDot} />
                <View style={styles.heroTrustItem}>
                  <MapPin size={13} color={colors.primary} />
                  <Text style={styles.heroTrustText}>OpenStreetMap Radar</Text>
                </View>
                <View style={styles.heroTrustDot} />
                <View style={styles.heroTrustItem}>
                  <WifiOff size={13} color={colors.primary} />
                  <Text style={styles.heroTrustText}>Zero-Signal Offline Pass</Text>
                </View>
              </View>

              {/* Interactive Pass Switcher */}
              <View style={styles.heroMovieSwitcher}>
                <Text style={styles.switcherLabel}>SWITCH PASS PREVIEW (INTERACTIVE):</Text>
                <View style={styles.switcherPills}>
                  {HERO_MOVIES.map((m, idx) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.switcherPill,
                        selectedMovieIndex === idx && styles.switcherPillActive,
                      ]}
                      onPress={() => setSelectedMovieIndex(idx)}
                    >
                      <Text
                        style={[
                          styles.switcherPillText,
                          selectedMovieIndex === idx && styles.switcherPillTextActive,
                        ]}
                      >
                        {m.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Right Column: Physical 3D Digital Cinema Pass Centerpiece */}
            <View style={styles.heroRight}>
              <View style={styles.heroTicketOuter}>
                {/* Live Floating Showtime Ticker */}
                <View style={styles.countdownPill}>
                  <View style={styles.countdownLiveDot} />
                  <Text style={styles.countdownLabel}>SHOWTIME IN</Text>
                  <Text style={styles.countdownTimer}>{formatCountdown(countdownSeconds)}</Text>
                </View>

                {/* 3D Angled Physical Pass Container */}
                <View
                  style={[
                    styles.passCard,
                    Platform.OS === 'web' && !isMobile && {
                      transform: [
                        { perspective: 1200 },
                        { rotateY: '-5deg' },
                        { rotateX: '3deg' },
                      ],
                    },
                  ]}
                >
                  {/* Top Film Marquee Header Area */}
                  <View style={styles.passHeaderArea}>
                    <View style={styles.passBrandingRow}>
                      <View style={styles.passBrandBadge}>
                        <Image source={logoImg} style={styles.passLogoImg} resizeMode="contain" />
                        <Text style={styles.passBrandTitle}>CINETRIP DIGITAL PASS</Text>
                      </View>
                      <View style={styles.passVerifiedBadge}>
                        <Check size={11} color="#07090E" strokeWidth={3} />
                        <Text style={styles.passVerifiedText}>OFFLINE READY</Text>
                      </View>
                    </View>

                    <Text style={styles.passMovieTitle}>{activeHeroMovie.title}</Text>
                    <Text style={styles.passTagline}>"{activeHeroMovie.tagline}"</Text>

                    <View style={styles.passVenueRow}>
                      <Film size={14} color={colors.primary} />
                      <Text style={styles.passVenueText}>{activeHeroMovie.cinemaName}</Text>
                    </View>
                    <Text style={styles.passAddressText}>{activeHeroMovie.cinemaLocation}</Text>

                    {/* Format Badges */}
                    <View style={styles.passFormatRow}>
                      {activeHeroMovie.formats.map((f) => (
                        <FormatBadge key={f} format={f} size="small" />
                      ))}
                    </View>
                  </View>

                  {/* Perforated Stub Divider Line with Notches */}
                  <View style={styles.perforationRow}>
                    <View style={styles.notchLeft} />
                    <View style={styles.dashedLine} />
                    <View style={styles.notchRight} />
                  </View>

                  {/* Bottom Pass Metadata & Scannable QR Matrix */}
                  <View style={styles.passDetailsArea}>
                    <View style={styles.passMetaGrid}>
                      <View style={styles.passMetaCell}>
                        <Text style={styles.passMetaLabel}>DATE & TIME</Text>
                        <Text style={styles.passMetaVal}>Today</Text>
                        <Text style={styles.passMetaHighlight}>{activeHeroMovie.showtime}</Text>
                      </View>

                      <View style={styles.passMetaCell}>
                        <Text style={styles.passMetaLabel}>SEATS / ROW</Text>
                        <Text style={styles.passMetaVal} numberOfLines={1}>
                          {activeHeroMovie.seats}
                        </Text>
                        <Text style={styles.passRefText}>GATE B • AUDITORIUM 4</Text>
                      </View>
                    </View>

                    {/* Squad Members on Pass */}
                    <View style={styles.passSquadStrip}>
                      <Users size={12} color={colors.textSecondary} />
                      <Text style={styles.passSquadText} numberOfLines={1}>
                        Squad: {activeHeroMovie.friends.map((f) => f.name).join(', ')}
                      </Text>
                    </View>

                    {/* Concessions Checklist */}
                    <View style={styles.passSnackStrip}>
                      <Utensils size={12} color={colors.primary} />
                      <Text style={styles.passSnackText} numberOfLines={1}>
                        Concessions: {activeHeroMovie.snacks.join(' • ')}
                      </Text>
                    </View>

                    {/* Vector QR Code & Pass Serial Actions */}
                    <View style={styles.passQrContainer}>
                      <View style={styles.qrWrapper}>
                        <QRCodeSvg
                          value={`CINETRIP|${activeHeroMovie.id}|SAMPLE-REF-${activeHeroMovie.year}`}
                          size={isMobile ? 86 : 100}
                          color="#07090E"
                          backgroundColor="#FFFFFF"
                        />
                      </View>
                      <View style={styles.qrSideInfo}>
                        <Text style={styles.qrSerialTitle}>PASS IDENTIFIER</Text>
                        <Text style={styles.qrSerialCode}>CT-8941-IMAX-{activeHeroMovie.id}</Text>
                        <Text style={styles.qrSubNote}>
                          Turnstile vector matrix. Instant 0ms offline display.
                        </Text>

                        {/* Interactive Pass Actions */}
                        <View style={styles.passActionMiniRow}>
                          <TouchableOpacity
                            style={styles.passMiniBtn}
                            onPress={() => handleCopyRefCode(`CT-8941-IMAX-${activeHeroMovie.id}`)}
                          >
                            <Copy size={11} color={copiedRef ? '#10B981' : colors.primary} />
                            <Text style={[styles.passMiniBtnText, copiedRef && { color: '#10B981' }]}>
                              {copiedRef ? 'Copied' : 'Copy Ref'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.passMiniBtn}
                            onPress={() => handleShareOuting(activeHeroMovie)}
                          >
                            <Share2 size={11} color={colors.primary} />
                            <Text style={styles.passMiniBtnText}>Share</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            3. HOW IT WORKS — THE 5-STEP CINEMATIC TIMELINE
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>THE COMPLETE RITUAL</Text>
            <Text style={styles.sectionHeading}>
              From film discovery to theater memory.
            </Text>
            <Text style={styles.sectionDesc}>
              CineTrip connects every stage of going to the movies into one continuous journey.
            </Text>
          </View>

          <View style={styles.howItWorksGrid}>
            <View style={styles.howStepCard}>
              <View style={styles.howStepHeader}>
                <Text style={styles.howStepNum}>01</Text>
                <Compass size={18} color={colors.primary} />
              </View>
              <Text style={styles.howStepTitle}>FIND</Text>
              <Text style={styles.howStepDesc}>
                Discover certified in-theater releases with verified IMAX, Dolby & 4DX format tags.
              </Text>
            </View>

            <View style={styles.howStepCard}>
              <View style={styles.howStepHeader}>
                <Text style={styles.howStepNum}>02</Text>
                <Ticket size={18} color={colors.primary} />
              </View>
              <Text style={styles.howStepTitle}>PLAN</Text>
              <Text style={styles.howStepDesc}>
                Pick cinema auditorium, prime showtimes, curved row seats, and concession snacks.
              </Text>
            </View>

            <View style={styles.howStepCard}>
              <View style={styles.howStepHeader}>
                <Text style={styles.howStepNum}>03</Text>
                <Users size={18} color={colors.primary} />
              </View>
              <Text style={styles.howStepTitle}>INVITE</Text>
              <Text style={styles.howStepDesc}>
                Add friends directly from your phone address book without 47-message chat chaos.
              </Text>
            </View>

            <View style={styles.howStepCard}>
              <View style={styles.howStepHeader}>
                <Text style={styles.howStepNum}>04</Text>
                <WifiOff size={18} color={colors.primary} />
              </View>
              <Text style={styles.howStepTitle}>GO (OFFLINE)</Text>
              <Text style={styles.howStepDesc}>
                Turnstile boarding pass cached in hardware storage with 0ms zero-signal load.
              </Text>
            </View>

            <View style={styles.howStepCard}>
              <View style={styles.howStepHeader}>
                <Text style={styles.howStepNum}>05</Text>
                <Camera size={18} color={colors.primary} />
              </View>
              <Text style={styles.howStepTitle}>REMEMBER</Text>
              <Text style={styles.howStepDesc}>
                Snap marquee photos, rate sound & screen projection, and keep your lifetime cinema log.
              </Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION 1 — DISCOVER (INTERACTIVE LOBBY & MOOD DISCOVERY)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>01 / DISCOVER</Text>
            <Text style={styles.sectionHeading}>
              FIND SOMETHING WORTH{'\n'}LEAVING THE HOUSE FOR.
            </Text>
            <Text style={styles.sectionDesc}>
              Explore verified in-theater releases, certified formats (IMAX Laser, Dolby Cinema, 4DX),
              and curated mood selections.
            </Text>
          </View>

          {/* Feed Category Segment Tabs */}
          <View style={styles.categoryTabRow}>
            <TouchableOpacity
              style={[styles.categoryTabPill, selectedCategoryTab === 'now_playing' && styles.categoryTabPillActive]}
              onPress={() => setSelectedCategoryTab('now_playing')}
            >
              <Text style={[styles.categoryTabText, selectedCategoryTab === 'now_playing' && styles.categoryTabTextActive]}>
                Now in Theaters
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTabPill, selectedCategoryTab === 'trending' && styles.categoryTabPillActive]}
              onPress={() => setSelectedCategoryTab('trending')}
            >
              <Text style={[styles.categoryTabText, selectedCategoryTab === 'trending' && styles.categoryTabTextActive]}>
                Trending This Week
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryTabPill, selectedCategoryTab === 'upcoming' && styles.categoryTabPillActive]}
              onPress={() => setSelectedCategoryTab('upcoming')}
            >
              <Text style={[styles.categoryTabText, selectedCategoryTab === 'upcoming' && styles.categoryTabTextActive]}>
                Upcoming & Presales
              </Text>
            </TouchableOpacity>
          </View>

          {/* Interactive Cinema Lobby Mood Filter Bar */}
          <View style={styles.moodStrip}>
            <Text style={styles.moodStripTitle}>WHAT ARE YOU IN THE MOOD FOR?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
              {DISCOVERY_MOODS.map((mood) => {
                const isActive = selectedMoodId === mood.id;
                return (
                  <TouchableOpacity
                    key={mood.id}
                    style={[styles.moodItemPill, isActive && styles.moodItemPillActive]}
                    onPress={() => setSelectedMoodId(mood.id)}
                  >
                    <Text style={[styles.moodItemText, isActive && styles.moodItemTextActive]}>
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Filtered Movie Cards Grid with Direct "Plan" Action */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieCardsScroll}>
            {filteredCatalogMovies.map((movie, idx) => (
              <View
                key={movie.id}
                style={[
                  styles.movieCatalogCard,
                  Platform.OS === 'web' && !isMobile && {
                    transform: [
                      { perspective: 1000 },
                      { rotateY: idx % 2 === 0 ? '-2deg' : '2deg' },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ uri: getImageUri(movie.poster_path, 'w500') }}
                  style={styles.moviePosterImage}
                  resizeMode="cover"
                />
                <View style={styles.movieCardBody}>
                  <View style={styles.movieRatingRow}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.movieRatingText}>{movie.vote_average.toFixed(1)}</Text>
                    <Text style={styles.movieYearText}>• {movie.release_date?.split('-')[0]}</Text>
                  </View>
                  <Text style={styles.movieCardTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.movieRuntimeText}>
                    <Clock size={11} color={colors.textMuted} /> {movie.runtime || 145} mins
                  </Text>
                  <View style={styles.cardFormatRow}>
                    {movie.formats && movie.formats.slice(0, 2).map((f) => (
                      <FormatBadge key={f} format={f} size="small" />
                    ))}
                  </View>

                  {/* Direct "Plan This Movie" Trigger */}
                  <TouchableOpacity
                    style={styles.planMovieBtn}
                    onPress={() => handlePlanSpecificMovie(movie)}
                  >
                    <Text style={styles.planMovieBtnText}>Plan Trip</Text>
                    <ChevronRight size={13} color="#07090E" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionCtaCenter}>
            <TouchableOpacity
              style={styles.textActionBtn}
              onPress={() => handleLaunchApp('/(tabs)/discover')}
            >
              <Text style={styles.textActionBtnText}>Explore full theater release feed in CineTrip</Text>
              <ArrowRight size={15} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            5. SECTION 2 — PLAN (INTERACTIVE 3-STEP TRIP BUILDER)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>02 / PLAN</Text>
            <Text style={styles.sectionHeading}>
              FROM "WHAT SHOULD WE WATCH?"{'\n'}TO "WE'RE GOING."
            </Text>
            <Text style={styles.sectionDesc}>
              A guided visual sequence that turns film curiosity into confirmed theater outings.
            </Text>
          </View>

          {/* Interactive Step Navigator */}
          <View style={styles.plannerStepTabs}>
            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 1 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(1)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 1 && styles.stepTabNumActive]}>01</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 1 && styles.stepTabTitleActive]}>Pick Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 2 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(2)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 2 && styles.stepTabNumActive]}>02</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 2 && styles.stepTabTitleActive]}>Venue & Snacks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 3 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(3)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 3 && styles.stepTabNumActive]}>03</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 3 && styles.stepTabTitleActive]}>Seats & Squad</Text>
            </TouchableOpacity>
          </View>

          {/* Step 1: Movie Selection Preview */}
          {activePlannerStep === 1 && (
            <View style={styles.plannerStepCard}>
              <Text style={styles.plannerCardEyebrow}>STEP 01 • SELECT THE TITLE</Text>
              <Text style={styles.plannerCardHeadline}>Choose from verified in-theater releases</Text>
              <View style={styles.movieSelectionGrid}>
                {HERO_MOVIES.map((m, idx) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.movieSelectCard,
                      selectedMovieIndex === idx && styles.movieSelectCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedMovieIndex(idx);
                      setActivePlannerStep(2);
                    }}
                  >
                    <Image
                      source={{ uri: getImageUri(m.poster_path, 'w500') }}
                      style={styles.selectPoster}
                    />
                    <View style={styles.selectInfo}>
                      <Text style={styles.selectTitle}>{m.title}</Text>
                      <Text style={styles.selectMeta}>{m.year} • {m.runtime}</Text>
                      <View style={styles.formatPills}>
                        {m.formats.slice(0, 2).map((f) => (
                          <FormatBadge key={f} format={f} size="small" />
                        ))}
                      </View>
                    </View>
                    {selectedMovieIndex === idx && (
                      <View style={styles.selectCheck}>
                        <Check size={13} color="#07090E" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Venue, Showtimes & Concessions */}
          {activePlannerStep === 2 && (
            <View style={styles.plannerStepCard}>
              <Text style={styles.plannerCardEyebrow}>STEP 02 • CINEMA, SHOWTIME & CONCESSIONS</Text>
              <Text style={styles.plannerCardHeadline}>Select the auditorium experience</Text>

              <View style={styles.plannerTwoCol}>
                <View style={styles.plannerColLeft}>
                  <Text style={styles.subGroupTitle}>SELECT AUDITORIUM:</Text>
                  {SAMPLE_CINEMAS_LIST.slice(0, 3).map((c, i) => (
                    <View key={c.name} style={[styles.cinemaPickItem, i === 0 && styles.cinemaPickItemActive]}>
                      <View style={styles.cinemaPickLeft}>
                        <Film size={15} color={i === 0 ? colors.primary : colors.textSecondary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cinemaPickName} numberOfLines={1}>{c.name}</Text>
                          <Text style={styles.cinemaPickDist}>{c.distance} away • {c.brand}</Text>
                        </View>
                      </View>
                      {i === 0 && <Check size={15} color={colors.primary} strokeWidth={2.5} />}
                    </View>
                  ))}

                  <Text style={[styles.subGroupTitle, { marginTop: 16 }]}>AVAILABLE SLOTS (TODAY):</Text>
                  <View style={styles.slotRow}>
                    <View style={styles.slotPill}><Text style={styles.slotPillText}>03:30 PM</Text></View>
                    <View style={[styles.slotPill, styles.slotPillActive]}><Text style={styles.slotPillTextActive}>07:30 PM (Prime)</Text></View>
                    <View style={styles.slotPill}><Text style={styles.slotPillText}>10:45 PM</Text></View>
                  </View>
                </View>

                <View style={styles.plannerColRight}>
                  <Text style={styles.subGroupTitle}>CONCESSION PICKER:</Text>
                  {[
                    'Giant Caramel Popcorn',
                    'Loaded Cheese Nachos',
                    'Cold Brew Coffee',
                    'Cherry ICEE',
                    'Dark Chocolate Bites',
                  ].map((snack) => {
                    const isSelected = selectedSnacks.includes(snack);
                    return (
                      <TouchableOpacity
                        key={snack}
                        style={[styles.snackItem, isSelected && styles.snackItemActive]}
                        onPress={() => handleToggleSnack(snack)}
                      >
                        <Utensils size={14} color={isSelected ? colors.primary : colors.textMuted} />
                        <Text style={[styles.snackText, isSelected && styles.snackTextActive]}>{snack}</Text>
                        {isSelected && <Check size={14} color={colors.primary} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Step 3: Interactive Seat Map Selector & Squad Roster */}
          {activePlannerStep === 3 && (
            <View style={styles.plannerStepCard}>
              <Text style={styles.plannerCardEyebrow}>STEP 03 • SEAT GRID & SQUAD ROSTER</Text>
              <Text style={styles.plannerCardHeadline}>Reserve row preferences with your friends</Text>

              <View style={styles.seatSectionLayout}>
                {/* Visual Seat Map */}
                <View style={styles.seatMapBox}>
                  <View style={styles.screenIndicator}>
                    <View style={styles.screenArc} />
                    <Text style={styles.screenArcLabel}>CURVED SCREEN</Text>
                  </View>

                  <View style={styles.seatGridMini}>
                    {['D', 'E', 'F', 'G'].map((row) => (
                      <View key={row} style={styles.miniSeatRow}>
                        <Text style={styles.miniRowLabel}>{row}</Text>
                        <View style={styles.miniSeatsWrap}>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                            const seatId = `${row}${num}`;
                            const isSelected = selectedSeats.includes(seatId);
                            const isOccupied = ['D3', 'D4', 'G1', 'G8'].includes(seatId);

                            return (
                              <TouchableOpacity
                                key={seatId}
                                style={[
                                  styles.miniSeat,
                                  isOccupied && styles.miniSeatOccupied,
                                  isSelected && styles.miniSeatSelected,
                                ]}
                                disabled={isOccupied}
                                onPress={() => handleToggleSeat(seatId)}
                              >
                                <Text
                                  style={[
                                    styles.miniSeatText,
                                    isSelected && styles.miniSeatTextSelected,
                                  ]}
                                >
                                  {num}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        <Text style={styles.miniRowLabel}>{row}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.seatSummaryPill}>
                    <Text style={styles.seatSummaryLabel}>
                      SELECTED: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                    </Text>
                    <Text style={styles.seatSummaryPrice}>EST. TOTAL: ₹{selectedSeats.length * 350}</Text>
                  </View>
                </View>

                {/* Squad Roster Preview */}
                <View style={styles.squadPreviewBox}>
                  <Text style={styles.subGroupTitle}>SQUAD ATTENDEES (ADDRESS BOOK):</Text>
                  <View style={styles.squadListWrap}>
                    <View style={styles.squadMemberRow}>
                      <View style={styles.avatarInitials}><Text style={styles.avatarText}>YOU</Text></View>
                      <View style={styles.squadMemberInfo}>
                        <Text style={styles.squadMemberName}>Organizer (You)</Text>
                        <Text style={styles.squadMemberStatus}>Confirmed • Host</Text>
                      </View>
                      <View style={styles.confirmedPill}><Text style={styles.confirmedPillText}>READY</Text></View>
                    </View>

                    <View style={styles.squadMemberRow}>
                      <View style={styles.avatarInitials}><Text style={styles.avatarText}>AC</Text></View>
                      <View style={styles.squadMemberInfo}>
                        <Text style={styles.squadMemberName}>Alex Chen</Text>
                        <Text style={styles.squadMemberStatus}>@alex_film • Contact</Text>
                      </View>
                      <View style={styles.confirmedPill}><Text style={styles.confirmedPillText}>ACCEPTED</Text></View>
                    </View>

                    <View style={styles.squadMemberRow}>
                      <View style={styles.avatarInitials}><Text style={styles.avatarText}>SM</Text></View>
                      <View style={styles.squadMemberInfo}>
                        <Text style={styles.squadMemberName}>Sarah Miller</Text>
                        <Text style={styles.squadMemberStatus}>@sarah_m • Contact</Text>
                      </View>
                      <View style={styles.confirmedPill}><Text style={styles.confirmedPillText}>ACCEPTED</Text></View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.sectionCtaCenter}>
            <TouchableOpacity
              style={styles.primaryInlineBtn}
              onPress={() => handleLaunchApp('/(tabs)/planner')}
            >
              <Text style={styles.primaryInlineBtnText}>START REAL TRIP PLAN</Text>
              <ArrowRight size={14} color="#07090E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            6. SECTION 3 — SQUAD (THE CINEMA CONVERSATION RESOLVER)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>03 / SQUAD</Text>
            <Text style={styles.sectionHeading}>
              DON'T PLAN THE MOVIE NIGHT{'\n'}IN 47 MESSAGES.
            </Text>
            <Text style={styles.sectionDesc}>
              Invite friends directly from your phone's address book with native contacts integration.
              Distribute one clean digital pass summary instead of screenshotting booking references.
            </Text>
          </View>

          <View style={styles.squadStoryCard}>
            <View style={styles.squadLeftGraphic}>
              <View style={styles.chatBubbleDark}>
                <Text style={styles.chatSender}>Alex Chen</Text>
                <Text style={styles.chatMessage}>"What are we watching tonight?"</Text>
              </View>
              <View style={styles.chatBubbleDark}>
                <Text style={styles.chatSender}>Sarah Miller</Text>
                <Text style={styles.chatMessage}>"Anything after 7:00 PM works for me!"</Text>
              </View>
              <View style={styles.chatBubbleGold}>
                <Text style={styles.chatSenderGold}>CineTrip Smart Plan</Text>
                <Text style={styles.chatMessageGold}>
                  "Found: Dune: Part Two • 7:30 PM • PVR IMAX Laser (2.4 km) • Row F (Seats 4-5). Pass attached."
                </Text>
              </View>
            </View>

            <View style={styles.squadRightDetails}>
              <Text style={styles.featureBoxTitle}>Native Phone Address Book Sync</Text>
              <Text style={styles.featureBoxDesc}>
                CineTrip interfaces directly with your device's native address book via <Text style={styles.inlineCode}>expo-contacts</Text>.
                No third-party social logins or complex invites required.
              </Text>
              <View style={styles.featureCheckList}>
                <View style={styles.featureCheckItem}>
                  <Check size={15} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Pick friends directly from device contacts</Text>
                </View>
                <View style={styles.featureCheckItem}>
                  <Check size={15} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Keep track of group concession snack orders</Text>
                </View>
                <View style={styles.featureCheckItem}>
                  <Check size={15} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Share unified pass summaries via OS share sheet</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.primaryInlineBtn}
                onPress={() => handleLaunchApp('/(tabs)/planner')}
              >
                <Text style={styles.primaryInlineBtnText}>TRY SQUAD PLANNER</Text>
                <ArrowRight size={14} color="#07090E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            7. SECTION 4 — OFFLINE REALITY (THE AUDITORIUM VAULT)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>04 / OFFLINE REALITY</Text>
            <Text style={styles.sectionHeading}>
              YOUR PASS STILL WORKS WHEN{'\n'}THE CINEMA BASEMENT DOESN'T.
            </Text>
            <Text style={styles.sectionDesc}>
              Deep underground multiplexes and concrete auditoriums have zero cellular signal.
              CineTrip uses persistent hardware-backed storage so passes open with 0ms delay.
            </Text>
          </View>

          {/* Visual Offline Progression */}
          <View style={styles.offlineDemoLayout}>
            <View style={styles.offlineSignalBox}>
              <View style={styles.signalHeader}>
                <View style={styles.signalIcons}>
                  <WifiOff size={20} color="#EF4444" />
                  <Text style={styles.noServiceText}>NO SERVICE • AIRPLANE MODE</Text>
                </View>
                <View style={styles.latencyBadge}>
                  <Text style={styles.latencyText}>0ms LOCAL HIT</Text>
                </View>
              </View>
              <Text style={styles.offlineBoxHeading}>
                Web-based ticketing portals spin indefinitely when cell towers disappear.
              </Text>
              <Text style={styles.offlineBoxDesc}>
                CineTrip persists all upcoming plans, turnstile QR codes, and seat assignments
                locally in encrypted storage (<Text style={styles.inlineCode}>@react-native-async-storage</Text>).
              </Text>
            </View>

            <View style={styles.offlineProofBox}>
              <View style={styles.proofHeader}>
                <ShieldCheck size={18} color={colors.primary} />
                <Text style={styles.proofTitle}>HARDWARE STORAGE VAULT</Text>
              </View>
              <View style={styles.proofMetrics}>
                <View style={styles.proofMetricItem}>
                  <Text style={styles.proofMetricNum}>0 ms</Text>
                  <Text style={styles.proofMetricLabel}>Pass load time</Text>
                </View>
                <View style={styles.proofMetricItem}>
                  <Text style={styles.proofMetricNum}>100%</Text>
                  <Text style={styles.proofMetricLabel}>Offline pass availability</Text>
                </View>
                <View style={styles.proofMetricItem}>
                  <Text style={styles.proofMetricNum}>AES-256</Text>
                  <Text style={styles.proofMetricLabel}>Encrypted local state</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            8. SECTION 5 — VENUE RADAR (OPENSTREETMAP LOCATOR)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>05 / VENUE RADAR</Text>
            <Text style={styles.sectionHeading}>
              FIND THE SCREEN,{'\n'}NOT JUST THE MOVIE.
            </Text>
            <Text style={styles.sectionDesc}>
              Live OpenStreetMap Overpass geospatial radar locating certified IMAX, Dolby, and 4DX venues
              near your GPS coordinates with exact Haversine distance calculations.
            </Text>
          </View>

          <View style={styles.cinemaCardsGrid}>
            {SAMPLE_CINEMAS_LIST.map((cinema) => (
              <View key={cinema.name} style={styles.cinemaVenueCard}>
                <View style={styles.venueTop}>
                  <View style={styles.venueDistBadge}>
                    <MapPin size={12} color={colors.primary} />
                    <Text style={styles.venueDistText}>{cinema.distance}</Text>
                  </View>
                  <FormatBadge format={cinema.screenType} size="small" />
                </View>
                <Text style={styles.venueName}>{cinema.name}</Text>
                <Text style={styles.venueAddress}>{cinema.address}</Text>
                <View style={styles.venueBottom}>
                  <Text style={styles.venueSoundTag}>{cinema.brand}</Text>
                  <TouchableOpacity
                    style={styles.venueNavBtn}
                    onPress={() => handleLaunchApp('/map')}
                  >
                    <Text style={styles.venueNavBtnText}>View On Map</Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionCtaCenter}>
            <TouchableOpacity
              style={styles.primaryInlineBtn}
              onPress={() => handleLaunchApp('/map')}
            >
              <Text style={styles.primaryInlineBtnText}>OPEN LIVE CINEMA RADAR</Text>
              <ArrowRight size={14} color="#07090E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            9. SECTION 6 — MEMORIES (CINEPHILE JOURNAL)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>06 / PRESERVE</Text>
            <Text style={styles.sectionHeading}>
              MOVIES END.{'\n'}MEMORIES DON'T.
            </Text>
            <Text style={styles.sectionDesc}>
              Physical ticket stubs fade. CineTrip gives you a dedicated cinema journal: snap marquee photos,
              record video logs, rate auditorium sound & projection, and tag who was there.
            </Text>
          </View>

          <View style={styles.memoriesGrid}>
            {MEMORIES_SHOWCASE.map((mem) => (
              <View key={mem.id} style={styles.memoryCardWrap}>
                <Image
                  source={{ uri: mem.photoUrl }}
                  style={styles.memoryImage}
                  resizeMode="cover"
                />
                <View style={styles.memoryBody}>
                  <View style={styles.memoryTopRow}>
                    <Text style={styles.memoryDate}>{mem.date}</Text>
                    <View style={styles.memoryStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color="#F59E0B" fill="#F59E0B" />
                      ))}
                    </View>
                  </View>

                  <Text style={styles.memoryMovieTitle}>{mem.movieTitle}</Text>
                  <Text style={styles.memoryVenueTag}>{mem.cinema} • {mem.format}</Text>
                  <Text style={styles.memoryStoryText}>"{mem.story}"</Text>

                  <View style={styles.memoryCompanionsRow}>
                    <Users size={12} color={colors.textSecondary} />
                    <Text style={styles.memoryCompanionsText} numberOfLines={1}>
                      With {mem.companions.join(' and ')} • {mem.snack}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionCtaCenter}>
            <TouchableOpacity
              style={styles.textActionBtn}
              onPress={() => handleLaunchApp('/(tabs)/memories')}
            >
              <Text style={styles.textActionBtnText}>Explore the Cinephile Journal</Text>
              <ArrowRight size={15} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            10. FINAL BRAND MOMENT — CINEMATIC CLOSING
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionCtaMarquee}>
          <View style={styles.marqueeContainer}>
            <View style={styles.marqueeLogoBadge}>
              <Image source={logoImg} style={styles.marqueeLogoImg} resizeMode="contain" />
            </View>

            <Text style={styles.marqueeTagline}>— MOVIES. TOGETHER. MEMORIES. —</Text>

            <Text style={styles.marqueeHeadline}>
              YOUR NEXT MOVIE NIGHT{'\n'}
              <Text style={{ color: colors.primary }}>IS WAITING.</Text>
            </Text>

            <Text style={styles.marqueeSub}>
              Find the movie. Make the plan. Bring your squad. Keep the memory.
            </Text>

            <View style={styles.marqueeButtonRow}>
              <TouchableOpacity
                style={styles.marqueePrimaryBtn}
                onPress={() => handleLaunchApp('/(tabs)/planner')}
                activeOpacity={0.85}
              >
                <Text style={styles.marqueePrimaryBtnText}>START PLANNING</Text>
                <ArrowRight size={16} color="#07090E" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.marqueeSecondaryBtn}
                onPress={() => handleLaunchApp('/(tabs)/discover')}
                activeOpacity={0.85}
              >
                <Text style={styles.marqueeSecondaryBtnText}>EXPLORE MOVIES</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            11. MINIMAL EDITORIAL FOOTER
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={styles.footerTop}>
              <View style={styles.footerBrand}>
                <View style={styles.brandBadgeSmall}>
                  <Image source={logoImg} style={styles.footerLogoImg} resizeMode="contain" />
                </View>
                <View>
                  <Text style={styles.footerBrandText}>CineTrip</Text>
                  <Text style={styles.footerBrandSub}>MOVIES. TOGETHER. MEMORIES.</Text>
                </View>
              </View>

              <View style={styles.footerLinksRow}>
                <TouchableOpacity onPress={() => handleLaunchApp('/(tabs)/discover')}>
                  <Text style={styles.footerLink}>Discover</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLaunchApp('/(tabs)/planner')}>
                  <Text style={styles.footerLink}>Trip Planner</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLaunchApp('/map')}>
                  <Text style={styles.footerLink}>Cinema Map</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleLaunchApp('/(tabs)/memories')}>
                  <Text style={styles.footerLink}>Memories</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerDivider} />

            <View style={styles.footerBottom}>
              <Text style={styles.footerLegal}>
                This product uses the TMDB API and OpenStreetMap Overpass API but is not endorsed or certified by TMDB or OSM.
              </Text>
              <Text style={styles.footerCopy}>
                © {new Date().getFullYear()} CineTrip. Built for the big screen.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors, isMobile, isTablet, isDesktop) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#07090E',
    },
    scroll: {
      flex: 1,
      backgroundColor: '#07090E',
    },
    scrollContent: {
      paddingBottom: 0,
    },

    // ── NAVBAR STYLES ─────────────────────────────────────────────
    navbar: {
      backgroundColor: 'rgba(7, 9, 14, 0.94)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      paddingVertical: 12,
      paddingHorizontal: isMobile ? 16 : 24,
      position: 'relative',
      zIndex: 50,
    },
    navbarScrolled: {
      backgroundColor: 'rgba(7, 9, 14, 0.98)',
      borderBottomColor: 'rgba(229, 169, 60, 0.25)',
    },
    navContainer: {
      maxWidth: 1240,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    navBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#07090E',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.35)',
      overflow: 'hidden',
    },
    navLogoImg: {
      width: 30,
      height: 30,
    },
    navBrandTextCol: {
      justifyContent: 'center',
    },
    brandTitle: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.3,
      color: '#F8FAFC',
      lineHeight: 20,
    },
    brandSubtitle: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    versionPill: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    versionText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    navLinks: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 28,
    },
    navLinkItem: {
      paddingVertical: 6,
    },
    navLinkText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#94A3B8',
    },
    navActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    navSignInBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    navSignInText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#94A3B8',
    },
    navPrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: RADIUS.sm,
    },
    navPrimaryBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#07090E',
      letterSpacing: 0.2,
    },
    hamburgerBtn: {
      padding: 6,
    },
    mobileDrawer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      gap: 12,
    },
    mobileDrawerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    mobileDrawerText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#F8FAFC',
    },
    mobileDrawerDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      marginVertical: 4,
    },
    mobilePrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: RADIUS.sm,
      marginTop: 4,
    },
    mobilePrimaryBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#07090E',
    },

    // ── HERO STYLES ───────────────────────────────────────────────
    heroSection: {
      paddingVertical: isMobile ? 32 : 64,
      paddingHorizontal: isMobile ? 16 : 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      position: 'relative',
    },
    heroLayout: {
      maxWidth: 1240,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isDesktop ? 'row' : 'column',
      alignItems: isDesktop ? 'center' : 'flex-start',
      gap: isDesktop ? 48 : 32,
    },
    heroLeft: {
      flex: 1,
      width: '100%',
      maxWidth: isDesktop ? 580 : '100%',
    },
    heroEyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    heroEyebrowDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    heroEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    heroMainTitle: {
      fontSize: isMobile ? 32 : isTablet ? 42 : 50,
      fontWeight: '900',
      letterSpacing: -1,
      lineHeight: isMobile ? 38 : isTablet ? 48 : 56,
      color: '#F8FAFC',
      marginBottom: 16,
    },
    heroSubtitle: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: '400',
      lineHeight: 24,
      color: '#94A3B8',
      marginBottom: 24,
    },
    heroButtonRow: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 12,
      marginBottom: 24,
      width: isMobile ? '100%' : 'auto',
    },
    heroPrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
      minHeight: 48,
    },
    heroPrimaryBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#07090E',
      letterSpacing: 0.5,
    },
    heroSecondaryBtn: {
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
      minHeight: 48,
    },
    heroSecondaryBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
      letterSpacing: 0.5,
    },
    heroTrustGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      marginBottom: 20,
    },
    heroTrustItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    heroTrustText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#94A3B8',
    },
    heroTrustDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    heroMovieSwitcher: {
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.md,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      width: '100%',
    },
    switcherLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 8,
    },
    switcherPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    switcherPill: {
      backgroundColor: '#171E2D',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    switcherPillActive: {
      backgroundColor: 'rgba(229, 169, 60, 0.16)',
      borderColor: colors.primary,
    },
    switcherPillText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#94A3B8',
    },
    switcherPillTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },

    // ── 3D PHYSICAL DIGITAL PASS HERO CENTERPIECE ─────────────────
    heroRight: {
      flex: 1,
      width: '100%',
      maxWidth: isDesktop ? 500 : '100%',
      alignItems: 'center',
    },
    heroTicketOuter: {
      width: '100%',
      position: 'relative',
    },
    countdownPill: {
      alignSelf: 'center',
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.35)',
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: -14,
      zIndex: 10,
      ...SHADOWS.modal,
    },
    countdownLiveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    countdownLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textSecondary,
    },
    countdownTimer: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    passCard: {
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      width: '100%',
      ...SHADOWS.card,
    },
    passHeaderArea: {
      padding: isMobile ? 18 : 24,
      paddingTop: isMobile ? 22 : 28,
    },
    passBrandingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    passBrandBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    passLogoImg: {
      width: 20,
      height: 20,
    },
    passBrandTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
    },
    passVerifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: RADIUS.xs,
    },
    passVerifiedText: {
      fontSize: 9,
      fontWeight: '900',
      color: '#07090E',
      letterSpacing: 0.5,
    },
    passMovieTitle: {
      fontSize: isMobile ? 22 : 26,
      fontWeight: '900',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    passTagline: {
      fontSize: 12,
      fontStyle: 'italic',
      color: '#94A3B8',
      marginBottom: 12,
    },
    passVenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    passVenueText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    passAddressText: {
      fontSize: 11,
      color: '#64748B',
      marginBottom: 12,
    },
    passFormatRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },

    // Perforation Notch Divider Line
    perforationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 20,
      position: 'relative',
    },
    notchLeft: {
      width: 16,
      height: 20,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: '#07090E',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      marginLeft: -1,
    },
    notchRight: {
      width: 16,
      height: 20,
      borderTopLeftRadius: 10,
      borderBottomLeftRadius: 10,
      backgroundColor: '#07090E',
      borderWidth: 1,
      borderRightWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      marginRight: -1,
    },
    dashedLine: {
      flex: 1,
      height: 1,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      marginHorizontal: 6,
    },

    passDetailsArea: {
      padding: isMobile ? 18 : 24,
      paddingTop: 14,
      backgroundColor: '#0C0F17',
    },
    passMetaGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 14,
    },
    passMetaCell: {
      minWidth: 120,
      flex: 1,
    },
    passMetaLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    passMetaVal: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    passMetaHighlight: {
      fontSize: 14,
      fontWeight: '900',
      color: colors.primary,
      marginTop: 1,
    },
    passRefText: {
      fontSize: 10,
      color: '#94A3B8',
      marginTop: 2,
    },
    passSquadStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#171E2D',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      marginBottom: 8,
    },
    passSquadText: {
      fontSize: 11,
      fontWeight: '500',
      color: '#94A3B8',
      flex: 1,
    },
    passSnackStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#171E2D',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      marginBottom: 14,
    },
    passSnackText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.primary,
      flex: 1,
    },
    passQrContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    qrWrapper: {
      padding: 6,
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.xs,
    },
    qrSideInfo: {
      flex: 1,
    },
    qrSerialTitle: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    qrSerialCode: {
      fontSize: 11,
      fontWeight: '700',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    qrSubNote: {
      fontSize: 10,
      lineHeight: 14,
      color: '#64748B',
      marginBottom: 8,
    },
    passActionMiniRow: {
      flexDirection: 'row',
      gap: 6,
    },
    passMiniBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    passMiniBtnText: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── HOW IT WORKS 5-STEP GRID ──────────────────────────────────
    howItWorksGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    howStepCard: {
      flexBasis: isMobile ? '100%' : isTablet ? '48%' : '18%',
      flexGrow: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    howStepHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    howStepNum: {
      fontSize: 16,
      fontWeight: '900',
      color: colors.primary,
    },
    howStepTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 6,
    },
    howStepDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: '#94A3B8',
    },

    // ── SECTION COMMON STYLES ─────────────────────────────────────
    sectionDark: {
      paddingVertical: isMobile ? 48 : 72,
      paddingHorizontal: isMobile ? 16 : 24,
      backgroundColor: '#07090E',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    },
    sectionLight: {
      paddingVertical: isMobile ? 48 : 72,
      paddingHorizontal: isMobile ? 16 : 24,
      backgroundColor: '#0C0F17',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    },
    sectionHeaderWrap: {
      maxWidth: 840,
      width: '100%',
      alignSelf: 'center',
      marginBottom: isMobile ? 24 : 36,
      alignItems: 'flex-start',
    },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    sectionHeading: {
      fontSize: isMobile ? 26 : isTablet ? 32 : 36,
      fontWeight: '900',
      letterSpacing: -0.6,
      lineHeight: isMobile ? 32 : isTablet ? 38 : 42,
      color: '#F8FAFC',
      marginBottom: 12,
    },
    sectionDesc: {
      fontSize: isMobile ? 14 : 16,
      lineHeight: 24,
      color: '#94A3B8',
    },
    sectionCtaCenter: {
      marginTop: 28,
      alignItems: 'center',
    },
    textActionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    textActionBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    primaryInlineBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: RADIUS.sm,
      alignSelf: 'flex-start',
      marginTop: 18,
    },
    primaryInlineBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#07090E',
      letterSpacing: 0.5,
    },
    inlineCode: {
      fontSize: 12,
      color: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.1)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },

    // ── SECTION 1 (DISCOVER FEED & MOOD STRIP) ─────────────────────
    categoryTabRow: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    categoryTabPill: {
      backgroundColor: '#121722',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    categoryTabPillActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
    },
    categoryTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#94A3B8',
    },
    categoryTabTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },
    moodStrip: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      marginBottom: 20,
    },
    moodStripTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.textMuted,
      marginBottom: 8,
    },
    moodScroll: {
      gap: 8,
      paddingVertical: 4,
    },
    moodItemPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 999,
    },
    moodItemPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    moodItemText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#94A3B8',
    },
    moodItemTextActive: {
      color: '#07090E',
      fontWeight: '800',
    },
    movieCardsScroll: {
      maxWidth: 1140,
      alignSelf: 'center',
      gap: 16,
      paddingVertical: 8,
    },
    movieCatalogCard: {
      width: isMobile ? 180 : 220,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    },
    moviePosterImage: {
      width: '100%',
      height: isMobile ? 240 : 290,
      backgroundColor: '#171E2D',
    },
    movieCardBody: {
      padding: 12,
    },
    movieRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    movieRatingText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#F8FAFC',
    },
    movieYearText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    movieCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    movieRuntimeText: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 8,
    },
    cardFormatRow: {
      flexDirection: 'row',
      gap: 4,
      marginBottom: 10,
    },
    planMovieBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingVertical: 7,
      borderRadius: 4,
    },
    planMovieBtnText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#07090E',
    },

    // ── SECTION 2 (PLANNER 3 STEPS) ───────────────────────────────
    plannerStepTabs: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    stepTab: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: isMobile ? 10 : 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    stepTabActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    stepTabNum: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    stepTabNumActive: {
      color: colors.primary,
    },
    stepTabTitle: {
      fontSize: isMobile ? 11 : 13,
      fontWeight: '700',
      color: '#94A3B8',
    },
    stepTabTitleActive: {
      color: '#F8FAFC',
      fontWeight: '800',
    },
    plannerStepCard: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.xl,
      padding: isMobile ? 16 : 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    plannerCardEyebrow: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
      marginBottom: 4,
    },
    plannerCardHeadline: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 16,
    },
    movieSelectionGrid: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 12,
    },
    movieSelectCard: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: 10,
      gap: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      position: 'relative',
    },
    movieSelectCardSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    selectPoster: {
      width: 50,
      height: 75,
      borderRadius: 6,
    },
    selectInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    selectTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    selectMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 4,
    },
    formatPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    selectCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plannerTwoCol: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 20,
    },
    plannerColLeft: {
      flex: 1,
    },
    plannerColRight: {
      flex: 1,
    },
    subGroupTitle: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 8,
    },
    cinemaPickItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#121722',
      borderRadius: RADIUS.sm,
      padding: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      marginBottom: 6,
    },
    cinemaPickItemActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    cinemaPickLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    cinemaPickName: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    cinemaPickDist: {
      fontSize: 11,
      color: colors.textMuted,
    },
    slotRow: {
      flexDirection: 'row',
      gap: 6,
    },
    slotPill: {
      backgroundColor: '#121722',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    slotPillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    slotPillText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#94A3B8',
    },
    slotPillTextActive: {
      fontSize: 11,
      fontWeight: '800',
      color: '#07090E',
    },
    snackItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#121722',
      borderRadius: RADIUS.sm,
      padding: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      marginBottom: 6,
    },
    snackItemActive: {
      borderColor: 'rgba(229, 169, 60, 0.4)',
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    snackText: {
      fontSize: 12,
      color: '#94A3B8',
      flex: 1,
      marginLeft: 10,
    },
    snackTextActive: {
      color: '#F8FAFC',
      fontWeight: '700',
    },

    // Step 3 Seat Layout
    seatSectionLayout: {
      flexDirection: isMobile ? 'column' : 'row',
      gap: 20,
    },
    seatMapBox: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
    },
    screenIndicator: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 14,
    },
    screenArc: {
      width: '70%',
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginBottom: 4,
    },
    screenArcLabel: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.textMuted,
    },
    seatGridMini: {
      gap: 6,
      marginBottom: 14,
    },
    miniSeatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    miniRowLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: colors.textMuted,
      width: 14,
      textAlign: 'center',
    },
    miniSeatsWrap: {
      flexDirection: 'row',
      gap: 5,
    },
    miniSeat: {
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: '#171E2D',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    miniSeatSelected: {
      backgroundColor: colors.primary,
      borderColor: '#FFFFFF',
    },
    miniSeatOccupied: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'transparent',
    },
    miniSeatText: {
      fontSize: 8,
      fontWeight: '700',
      color: '#94A3B8',
    },
    miniSeatTextSelected: {
      color: '#07090E',
      fontWeight: '900',
    },
    seatSummaryPill: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: '#0C0F17',
      padding: 8,
      borderRadius: RADIUS.xs,
    },
    seatSummaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    seatSummaryPrice: {
      fontSize: 10,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    squadPreviewBox: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    squadListWrap: {
      gap: 8,
    },
    squadMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0C0F17',
      padding: 8,
      borderRadius: RADIUS.sm,
      gap: 10,
    },
    avatarInitials: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(229, 169, 60, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
    },
    squadMemberInfo: {
      flex: 1,
    },
    squadMemberName: {
      fontSize: 12,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    squadMemberStatus: {
      fontSize: 10,
      color: colors.textMuted,
    },
    confirmedPill: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    confirmedPillText: {
      fontSize: 8,
      fontWeight: '800',
      color: '#10B981',
    },

    // ── SECTION 3 (SQUAD CHAT VS CINETRIP) ────────────────────────
    squadStoryCard: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    },
    squadLeftGraphic: {
      flex: 1,
      backgroundColor: '#0C0F17',
      padding: isMobile ? 20 : 28,
      justifyContent: 'center',
      gap: 10,
    },
    chatBubbleDark: {
      backgroundColor: '#171E2D',
      borderRadius: RADIUS.md,
      padding: 10,
      maxWidth: '90%',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    chatSender: {
      fontSize: 10,
      fontWeight: '800',
      color: '#94A3B8',
      marginBottom: 2,
    },
    chatMessage: {
      fontSize: 12,
      color: '#F8FAFC',
    },
    chatBubbleGold: {
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      borderRadius: RADIUS.md,
      padding: 12,
      maxWidth: '98%',
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.35)',
    },
    chatSenderGold: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 2,
    },
    chatMessageGold: {
      fontSize: 12,
      color: '#F8FAFC',
      lineHeight: 18,
    },
    squadRightDetails: {
      flex: 1,
      padding: isMobile ? 20 : 32,
      justifyContent: 'center',
    },
    featureBoxTitle: {
      fontSize: isMobile ? 18 : 20,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 8,
    },
    featureBoxDesc: {
      fontSize: 13,
      lineHeight: 20,
      color: '#94A3B8',
      marginBottom: 16,
    },
    featureCheckList: {
      gap: 8,
    },
    featureCheckItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    featureCheckText: {
      fontSize: 13,
      color: '#F8FAFC',
    },

    // ── SECTION 4 (OFFLINE ARCHITECTURE) ──────────────────────────
    offlineDemoLayout: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 18,
    },
    offlineSignalBox: {
      flex: 1.2,
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      padding: isMobile ? 18 : 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    signalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    signalIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    noServiceText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#EF4444',
    },
    latencyBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    latencyText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#10B981',
    },
    offlineBoxHeading: {
      fontSize: isMobile ? 16 : 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 8,
    },
    offlineBoxDesc: {
      fontSize: 13,
      lineHeight: 20,
      color: '#94A3B8',
    },
    offlineProofBox: {
      flex: 1,
      backgroundColor: '#0F131D',
      borderRadius: RADIUS.xl,
      padding: isMobile ? 18 : 24,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.25)',
      justifyContent: 'space-between',
    },
    proofHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    proofTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.primary,
    },
    proofMetrics: {
      gap: 14,
    },
    proofMetricItem: {},
    proofMetricNum: {
      fontSize: 24,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    proofMetricLabel: {
      fontSize: 11,
      color: '#94A3B8',
    },

    // ── SECTION 5 (CINEMA MAP) ────────────────────────────────────
    cinemaCardsGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    cinemaVenueCard: {
      flexBasis: isMobile ? '100%' : '48%',
      flexGrow: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    venueTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    venueDistBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 4,
    },
    venueDistText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    venueName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    venueAddress: {
      fontSize: 11,
      color: '#64748B',
      marginBottom: 12,
    },
    venueBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    venueSoundTag: {
      fontSize: 11,
      fontWeight: '600',
      color: '#94A3B8',
    },
    venueNavBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    venueNavBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── SECTION 6 (MEMORIES SHOWCASE) ─────────────────────────────
    memoriesGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 18,
    },
    memoryCardWrap: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    memoryImage: {
      width: '100%',
      height: isMobile ? 180 : 200,
      backgroundColor: '#171E2D',
    },
    memoryBody: {
      padding: 18,
    },
    memoryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    memoryDate: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    memoryStars: {
      flexDirection: 'row',
      gap: 2,
    },
    memoryMovieTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    memoryVenueTag: {
      fontSize: 11,
      color: '#64748B',
      marginBottom: 10,
    },
    memoryStoryText: {
      fontSize: 13,
      fontStyle: 'italic',
      lineHeight: 20,
      color: '#94A3B8',
      marginBottom: 12,
    },
    memoryCompanionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    memoryCompanionsText: {
      fontSize: 10,
      color: '#64748B',
      flex: 1,
    },

    // ── SECTION 7 (FINAL BRAND MOMENT) ───────────────────────────
    sectionCtaMarquee: {
      paddingVertical: isMobile ? 54 : 80,
      paddingHorizontal: isMobile ? 16 : 24,
      backgroundColor: '#07090E',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      alignItems: 'center',
    },
    marqueeContainer: {
      maxWidth: 760,
      width: '100%',
      alignItems: 'center',
    },
    marqueeLogoBadge: {
      width: 76,
      height: 76,
      borderRadius: RADIUS.lg,
      backgroundColor: '#0C0F17',
      borderWidth: 1.5,
      borderColor: 'rgba(229, 169, 60, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      overflow: 'hidden',
      ...SHADOWS.focus,
    },
    marqueeLogoImg: {
      width: 66,
      height: 66,
    },
    marqueeTagline: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 12,
      textAlign: 'center',
    },
    marqueeHeadline: {
      fontSize: isMobile ? 28 : isTablet ? 36 : 42,
      fontWeight: '900',
      letterSpacing: -0.8,
      lineHeight: isMobile ? 34 : isTablet ? 42 : 48,
      color: '#F8FAFC',
      marginBottom: 12,
      textAlign: 'center',
    },
    marqueeSub: {
      fontSize: isMobile ? 14 : 16,
      color: '#94A3B8',
      marginBottom: 28,
      textAlign: 'center',
    },
    marqueeButtonRow: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'center',
      gap: 12,
      width: isMobile ? '100%' : 'auto',
    },
    marqueePrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
    },
    marqueePrimaryBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#07090E',
      letterSpacing: 0.5,
    },
    marqueeSecondaryBtn: {
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 22,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
    },
    marqueeSecondaryBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
      letterSpacing: 0.5,
    },

    // ── FOOTER ───────────────────────────────────────────────────
    footer: {
      backgroundColor: '#07090E',
      paddingVertical: 36,
      paddingHorizontal: isMobile ? 16 : 24,
    },
    footerInner: {
      maxWidth: 1240,
      width: '100%',
      alignSelf: 'center',
    },
    footerTop: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 18,
    },
    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandBadgeSmall: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#07090E',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
      overflow: 'hidden',
    },
    footerLogoImg: {
      width: 26,
      height: 26,
    },
    footerBrandText: {
      fontSize: 16,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    footerBrandSub: {
      fontSize: 8,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.primary,
      textTransform: 'uppercase',
      marginTop: 2,
    },
    footerLinksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    footerLink: {
      fontSize: 13,
      fontWeight: '600',
      color: '#94A3B8',
    },
    footerDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      marginVertical: 18,
    },
    footerBottom: {
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 8,
    },
    footerLegal: {
      fontSize: 11,
      color: '#64748B',
      maxWidth: 600,
    },
    footerCopy: {
      fontSize: 11,
      color: '#64748B',
    },
  });

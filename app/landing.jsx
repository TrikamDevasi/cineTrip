import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
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
} from 'lucide-react-native';
import QRCodeSvg from '../components/ui/QRCodeSvg';
import FormatBadge from '../components/FormatBadge';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { FALLBACK_MOVIES, MOODS, getImageUri } from '../services/tmdb';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

// Sample verifiable movie datasets for interactive landing demonstrations
const HERO_MOVIES = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    year: '2024',
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
    story: 'The sound design during the Trinity test shook the entire auditorium row. Absolute pinnacle of physical theater projection.',
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
  const { colors } = useTheme();
  const router = useRouter();
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);

  // Interactive showcase state
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(7948); // 02h 12m 28s
  const [activePlannerStep, setActivePlannerStep] = useState(2); // 1: Movie, 2: Venue & Snacks, 3: Seats & Squad
  const [selectedSeats, setSelectedSeats] = useState(['F4', 'F5']);
  const [selectedSnacks, setSelectedSnacks] = useState(['Giant Caramel Popcorn', 'Cherry ICEE']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('during'); // 'before' | 'during' | 'after'

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

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
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
              <Film size={18} color={colors.primary} strokeWidth={2.4} />
            </View>
            <Text style={styles.brandTitle}>CineTrip</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>v1.0</Text>
            </View>
          </TouchableOpacity>

          {/* Desktop Nav Links */}
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
              onPress={() => handleLaunchApp('/(tabs)/planner')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Digital Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLaunchApp('/(tabs)/memories')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLaunchApp('/map')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Cinema Map</Text>
            </TouchableOpacity>
          </View>

          {/* Desktop Right CTAs */}
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
              <Text style={styles.navPrimaryBtnText}>Explore CineTrip</Text>
              <ArrowRight size={15} color="#07090E" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Mobile Hamburger Toggle */}
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
        </View>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
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
            2. HERO SECTION (EDITORIAL ASYMMETRIC MASTERPIECE)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.heroLayout}>
            {/* Left Column: Editorial Typography & Intent */}
            <View style={styles.heroLeft}>
              <View style={styles.heroEyebrowRow}>
                <View style={styles.heroEyebrowDot} />
                <Text style={styles.heroEyebrow}>THEATRICAL TRIP PLANNER & JOURNAL</Text>
              </View>

              <Text style={styles.heroMainTitle}>
                YOUR NEXT{'\n'}
                <Text style={{ color: colors.primary }}>MOVIE NIGHT</Text>{'\n'}
                STARTS HERE.
              </Text>

              <Text style={styles.heroSubtitle}>
                Discover in-theater films. Plan the auditorium trip. Coordinate seats with your squad.
                Access offline digital passes that never vanish.
              </Text>

              {/* Action Buttons */}
              <View style={styles.heroButtonRow}>
                <TouchableOpacity
                  style={styles.heroPrimaryBtn}
                  onPress={() => handleLaunchApp('/(tabs)')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Explore CineTrip Live Experience"
                >
                  <Text style={styles.heroPrimaryBtnText}>Explore CineTrip</Text>
                  <ArrowRight size={17} color="#07090E" strokeWidth={2.5} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroSecondaryBtn}
                  onPress={() => handleLaunchApp('/(tabs)/planner')}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                >
                  <Ticket size={17} color={colors.primary} strokeWidth={2} />
                  <Text style={styles.heroSecondaryBtnText}>See How It Works</Text>
                </TouchableOpacity>
              </View>

              {/* Real Architecture Trust Indicators */}
              <View style={styles.heroTrustGrid}>
                <View style={styles.heroTrustItem}>
                  <Radio size={14} color={colors.primary} />
                  <Text style={styles.heroTrustText}>Live TMDB Catalog</Text>
                </View>
                <View style={styles.heroTrustDot} />
                <View style={styles.heroTrustItem}>
                  <MapPin size={14} color={colors.primary} />
                  <Text style={styles.heroTrustText}>OpenStreetMap Venues</Text>
                </View>
                <View style={styles.heroTrustDot} />
                <View style={styles.heroTrustItem}>
                  <WifiOff size={14} color={colors.primary} />
                  <Text style={styles.heroTrustText}>Zero-Signal Offline Pass</Text>
                </View>
              </View>

              {/* Interactive Movie Switcher Pill */}
              <View style={styles.heroMovieSwitcher}>
                <Text style={styles.switcherLabel}>SWITCH PASS DEMO:</Text>
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

            {/* Right Column: Authentic Digital Cinema Pass Visual Anchor */}
            <View style={styles.heroRight}>
              <View style={styles.heroTicketOuter}>
                {/* Live Floating Showtime Ticker */}
                <View style={styles.countdownPill}>
                  <View style={styles.countdownLiveDot} />
                  <Text style={styles.countdownLabel}>SHOWTIME IN</Text>
                  <Text style={styles.countdownTimer}>{formatCountdown(countdownSeconds)}</Text>
                </View>

                {/* Actual CineTrip Digital Pass Container */}
                <View style={styles.passCard}>
                  {/* Top Film Marquee Area */}
                  <View style={styles.passHeaderArea}>
                    <View style={styles.passBrandingRow}>
                      <View style={styles.passBrandBadge}>
                        <Ticket size={13} color={colors.primary} strokeWidth={2.4} />
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

                  {/* Perforated Stub Line with Authentic Notches */}
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
                      <Users size={13} color={colors.textSecondary} />
                      <Text style={styles.passSquadText}>
                        Squad: {activeHeroMovie.friends.map((f) => f.name).join(', ')}
                      </Text>
                    </View>

                    {/* Concessions Checklist */}
                    <View style={styles.passSnackStrip}>
                      <Utensils size={13} color={colors.primary} />
                      <Text style={styles.passSnackText}>
                        Concessions: {activeHeroMovie.snacks.join(' • ')}
                      </Text>
                    </View>

                    {/* Scannable Vector QR Code Matrix */}
                    <View style={styles.passQrContainer}>
                      <View style={styles.qrWrapper}>
                        <QRCodeSvg
                          value={`CINETRIP|${activeHeroMovie.id}|SAMPLE-REF-${activeHeroMovie.year}`}
                          size={116}
                          color="#07090E"
                          backgroundColor="#FFFFFF"
                        />
                      </View>
                      <View style={styles.qrSideInfo}>
                        <Text style={styles.qrSerialTitle}>PASS IDENTIFIER</Text>
                        <Text style={styles.qrSerialCode}>CT-8941-IMAX-{activeHeroMovie.id}</Text>
                        <Text style={styles.qrSubNote}>
                          Galois-Field GF(2^8) Reed-Solomon vector code. Scannable at turnstile.
                        </Text>
                        <View style={styles.demoWatermark}>
                          <Text style={styles.demoWatermarkText}>SAMPLE DEMO PASS</Text>
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
            3. SECTION 1 — THE MULTI-APP FRAGMENTATION CRISIS
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>THE PROBLEM</Text>
            <Text style={styles.sectionHeading}>
              Going to the movies shouldn't feel like five different apps.
            </Text>
            <Text style={styles.sectionDesc}>
              Modern movie-goers juggle fragmented apps just to organize a single theater outing.
              CineTrip consolidates the entire journey into a single focused flow.
            </Text>
          </View>

          <View style={styles.problemVsSolutionGrid}>
            {/* The Fragmented Old Way */}
            <View style={styles.problemCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.problemIconWrap}>
                  <X size={18} color="#EF4444" strokeWidth={2.4} />
                </View>
                <Text style={styles.problemCardTitle}>THE MULTI-APP NIGHTMARE</Text>
              </View>
              <View style={styles.fragmentedStepsList}>
                <View style={styles.fragStepItem}>
                  <Text style={styles.fragStepNum}>01</Text>
                  <Text style={styles.fragStepText}>IMDb or Letterboxd to find what's out</Text>
                </View>
                <View style={styles.fragStepItem}>
                  <Text style={styles.fragStepNum}>02</Text>
                  <Text style={styles.fragStepText}>Chaotic 47-message WhatsApp group chat</Text>
                </View>
                <View style={styles.fragStepItem}>
                  <Text style={styles.fragStepNum}>03</Text>
                  <Text style={styles.fragStepText}>Ticketing portal with ads and convenience fees</Text>
                </View>
                <View style={styles.fragStepItem}>
                  <Text style={styles.fragStepNum}>04</Text>
                  <Text style={styles.fragStepText}>Screenshotting booking codes to share</Text>
                </View>
                <View style={styles.fragStepItem}>
                  <Text style={styles.fragStepNum}>05</Text>
                  <Text style={styles.fragStepText}>Zero signal in the basement — lost paper stubs</Text>
                </View>
              </View>
            </View>

            {/* The Unified CineTrip Journey */}
            <View style={styles.solutionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.solutionIconWrap}>
                  <Check size={18} color="#07090E" strokeWidth={3} />
                </View>
                <Text style={styles.solutionCardTitle}>THE CINETRIP JOURNEY</Text>
              </View>
              <View style={styles.unifiedFlowList}>
                <View style={styles.uniFlowItem}>
                  <View style={styles.uniFlowPill}>
                    <Text style={styles.uniFlowPillText}>DISCOVER</Text>
                  </View>
                  <Text style={styles.uniFlowDesc}>Live TMDB theatrical feed & format badges</Text>
                </View>
                <View style={styles.uniFlowItem}>
                  <View style={styles.uniFlowPill}>
                    <Text style={styles.uniFlowPillText}>PLAN</Text>
                  </View>
                  <Text style={styles.uniFlowDesc}>3-step trip builder with seats & snacks</Text>
                </View>
                <View style={styles.uniFlowItem}>
                  <View style={styles.uniFlowPill}>
                    <Text style={styles.uniFlowPillText}>SQUAD</Text>
                  </View>
                  <Text style={styles.uniFlowDesc}>Direct phone contact integration & invites</Text>
                </View>
                <View style={styles.uniFlowItem}>
                  <View style={styles.uniFlowPill}>
                    <Text style={styles.uniFlowPillText}>PASS</Text>
                  </View>
                  <Text style={styles.uniFlowDesc}>Hardware-cached offline turnstile pass</Text>
                </View>
                <View style={styles.uniFlowItem}>
                  <View style={styles.uniFlowPill}>
                    <Text style={styles.uniFlowPillText}>REMEMBER</Text>
                  </View>
                  <Text style={styles.uniFlowDesc}>Acoustic rating, marquee photos & memory log</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            4. SECTION 2 — DISCOVER (LIVE TMDB & FORMAT INTELLIGENCE)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>01 / DISCOVER</Text>
            <Text style={styles.sectionHeading}>
              Find something worth leaving the house for.
            </Text>
            <Text style={styles.sectionDesc}>
              Direct TMDB theatrical feed with certified format badges (IMAX Laser, Dolby Cinema, 4DX),
              curated mood selectors, and high-resolution trailer integration.
            </Text>
          </View>

          {/* Curated Mood Selector Strip */}
          <View style={styles.moodStrip}>
            <Text style={styles.moodStripTitle}>DISCOVER BY MOOD:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
              {MOODS.map((mood) => (
                <View key={mood.id} style={styles.moodItemPill}>
                  <Sparkles size={14} color={colors.primary} />
                  <Text style={styles.moodItemText}>{mood.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Cinematic Movie Posters Horizontal Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movieCardsScroll}>
            {FALLBACK_MOVIES.map((movie) => (
              <View key={movie.id} style={styles.movieCatalogCard}>
                <Image
                  source={{ uri: getImageUri(movie.poster_path, 'w500') }}
                  style={styles.moviePosterImage}
                  resizeMode="cover"
                />
                <View style={styles.movieCardBody}>
                  <View style={styles.movieRatingRow}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
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
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.sectionCtaCenter}>
            <TouchableOpacity
              style={styles.textActionBtn}
              onPress={() => handleLaunchApp('/(tabs)/discover')}
            >
              <Text style={styles.textActionBtnText}>Explore all now-playing movies in CineTrip</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            5. SECTION 3 — PLAN (THE 3-STEP TRIP BUILDER)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>02 / PLAN</Text>
            <Text style={styles.sectionHeading}>
              From "What should we watch?" to "We're going."
            </Text>
            <Text style={styles.sectionDesc}>
              A guided 3-step builder that lets you select the movie, pick certified screens & showtimes,
              customize concession snacks, and select seat preferences.
            </Text>
          </View>

          {/* Interactive Step Navigator */}
          <View style={styles.plannerStepTabs}>
            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 1 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(1)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 1 && styles.stepTabNumActive]}>STEP 1</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 1 && styles.stepTabTitleActive]}>Pick Movie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 2 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(2)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 2 && styles.stepTabNumActive]}>STEP 2</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 2 && styles.stepTabTitleActive]}>Venue & Snacks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stepTab, activePlannerStep === 3 && styles.stepTabActive]}
              onPress={() => setActivePlannerStep(3)}
            >
              <Text style={[styles.stepTabNum, activePlannerStep === 3 && styles.stepTabNumActive]}>STEP 3</Text>
              <Text style={[styles.stepTabTitle, activePlannerStep === 3 && styles.stepTabTitleActive]}>Seats & Squad</Text>
            </TouchableOpacity>
          </View>

          {/* Step 1: Movie Selection Preview */}
          {activePlannerStep === 1 && (
            <View style={styles.plannerStepCard}>
              <Text style={styles.plannerCardEyebrow}>STEP 1 • SELECT THE TITLE</Text>
              <Text style={styles.plannerCardHeadline}>Choose from verified in-theater releases</Text>
              <View style={styles.movieSelectionGrid}>
                {HERO_MOVIES.map((m, idx) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.movieSelectCard,
                      selectedMovieIndex === idx && styles.movieSelectCardSelected,
                    ]}
                    onPress={() => setSelectedMovieIndex(idx)}
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
                        <Check size={14} color="#07090E" strokeWidth={3} />
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
              <Text style={styles.plannerCardEyebrow}>STEP 2 • CINEMA, SHOWTIME & CONCESSIONS</Text>
              <Text style={styles.plannerCardHeadline}>Select the auditorium experience</Text>

              <View style={styles.plannerTwoCol}>
                <View style={styles.plannerColLeft}>
                  <Text style={styles.subGroupTitle}>SELECT AUDITORIUM:</Text>
                  {SAMPLE_CINEMAS_LIST.slice(0, 3).map((c, i) => (
                    <View key={c.name} style={[styles.cinemaPickItem, i === 0 && styles.cinemaPickItemActive]}>
                      <View style={styles.cinemaPickLeft}>
                        <Film size={16} color={i === 0 ? colors.primary : colors.textSecondary} />
                        <View>
                          <Text style={styles.cinemaPickName}>{c.name}</Text>
                          <Text style={styles.cinemaPickDist}>{c.distance} away • {c.brand}</Text>
                        </View>
                      </View>
                      {i === 0 && <Check size={16} color={colors.primary} strokeWidth={2.5} />}
                    </View>
                  ))}

                  <Text style={[styles.subGroupTitle, { marginTop: 18 }]}>AVAILABLE SLOTS (TODAY):</Text>
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
              <Text style={styles.plannerCardEyebrow}>STEP 3 • INTERACTIVE SEAT GRID & SQUAD</Text>
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

                    <View style={styles.squadMemberRow}>
                      <View style={styles.avatarInitials}><Text style={styles.avatarText}>DP</Text></View>
                      <View style={styles.squadMemberInfo}>
                        <Text style={styles.squadMemberName}>Dev Patel</Text>
                        <Text style={styles.squadMemberStatus}>@dev_cine • Invited</Text>
                      </View>
                      <View style={styles.invitedPill}><Text style={styles.invitedPillText}>INVITED</Text></View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────────────
            6. SECTION 4 — SQUAD (CONTACT INTEGRATION)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>03 / SQUAD</Text>
            <Text style={styles.sectionHeading}>
              Don't plan the movie night in 47 messages.
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
                <Text style={styles.chatMessage}>"Are we doing IMAX 70mm or Dolby for Dune tonight?"</Text>
              </View>
              <View style={styles.chatBubbleGold}>
                <Text style={styles.chatSenderGold}>You (via CineTrip)</Text>
                <Text style={styles.chatMessageGold}>"Plan is ready: 7:30 PM IMAX Laser, Row F, Seats 4-6. Here is the pass."</Text>
              </View>
            </View>

            <View style={styles.squadRightDetails}>
              <Text style={styles.featureBoxTitle}>Native Phone Address Book Sync</Text>
              <Text style={styles.featureBoxDesc}>
                CineTrip interfaces with your device's native address book via <Text style={styles.inlineCode}>expo-contacts</Text>.
                No third-party messaging logins required.
              </Text>
              <View style={styles.featureCheckList}>
                <View style={styles.featureCheckItem}>
                  <Check size={16} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Pick friends directly from device contacts</Text>
                </View>
                <View style={styles.featureCheckItem}>
                  <Check size={16} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Keep track of group concession snack orders</Text>
                </View>
                <View style={styles.featureCheckItem}>
                  <Check size={16} color={colors.primary} />
                  <Text style={styles.featureCheckText}>Share unified pass summaries via OS share sheet</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.primaryInlineBtn}
                onPress={() => handleLaunchApp('/(tabs)/planner')}
              >
                <Text style={styles.primaryInlineBtnText}>Try Squad Planner</Text>
                <ArrowRight size={15} color="#07090E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            7. SECTION 5 — DIGITAL PASS (BUILT FOR THE BASEMENT)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>04 / DIGITAL PASS</Text>
            <Text style={styles.sectionHeading}>
              Your movie night. In your pocket.
            </Text>
            <Text style={styles.sectionDesc}>
              A high-contrast boarding pass with dynamic Reed-Solomon vector QR code, live showtime countdown,
              turnstile entry data, and one-tap Apple/Google Maps directions.
            </Text>
          </View>

          <View style={styles.passShowcaseGrid}>
            <View style={styles.passShowcaseLeft}>
              <View style={styles.featurePillar}>
                <Clock size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>Live Showtime Countdown Ticker</Text>
                  <Text style={styles.pillarDesc}>
                    An active second-by-second countdown clock keeping the entire group on schedule.
                  </Text>
                </View>
              </View>

              <View style={styles.featurePillar}>
                <Radio size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>Reed-Solomon Vector QR Code</Text>
                  <Text style={styles.pillarDesc}>
                    Self-contained Galois Field GF(2^8) error correction matrix that turnstiles can read effortlessly.
                  </Text>
                </View>
              </View>

              <View style={styles.featurePillar}>
                <Share2 size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pillarTitle}>Native OS Share Sheet</Text>
                  <Text style={styles.pillarDesc}>
                    Send formatted outing passes with cinema address and seat numbers in one tap.
                  </Text>
                </View>
              </View>
            </View>

            {/* Visual Pass Preview */}
            <View style={styles.passShowcaseRight}>
              <View style={styles.miniPassCard}>
                <View style={styles.miniPassTop}>
                  <View style={styles.miniPassRow}>
                    <Text style={styles.miniPassTag}>CINETRIP VERIFIED PASS</Text>
                    <Text style={styles.miniPassStatus}>CONFIRMED</Text>
                  </View>
                  <Text style={styles.miniPassTitle}>Dune: Part Two</Text>
                  <Text style={styles.miniPassCinema}>PVR INOX IMAX with Laser • Mumbai</Text>
                </View>
                <View style={styles.miniPerforation}>
                  <View style={styles.miniNotchL} />
                  <View style={styles.miniDashed} />
                  <View style={styles.miniNotchR} />
                </View>
                <View style={styles.miniPassBottom}>
                  <View style={styles.miniMetaRow}>
                    <View><Text style={styles.miniLabel}>TIME</Text><Text style={styles.miniVal}>07:30 PM</Text></View>
                    <View><Text style={styles.miniLabel}>SEATS</Text><Text style={styles.miniVal}>Row F • 4, 5</Text></View>
                    <View><Text style={styles.miniLabel}>FORMAT</Text><Text style={styles.miniVal}>IMAX 70mm</Text></View>
                  </View>
                  <View style={styles.miniQrCenter}>
                    <QRCodeSvg value="CINETRIP|693134|PASS-70MM" size={90} color="#07090E" backgroundColor="#FFFFFF" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            8. SECTION 6 — OFFLINE REALITY (THE AUDITORIUM VAULT)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>05 / OFFLINE ARCHITECTURE</Text>
            <Text style={styles.sectionHeading}>
              Because the cinema basement doesn't care about your Wi-Fi.
            </Text>
            <Text style={styles.sectionDesc}>
              Deep underground multiplexes and concrete auditoriums have zero cellular signal.
              CineTrip uses persistent hardware-backed storage so your passes open with 0ms delay.
            </Text>
          </View>

          <View style={styles.offlineDemoLayout}>
            <View style={styles.offlineSignalBox}>
              <View style={styles.signalHeader}>
                <View style={styles.signalIcons}>
                  <WifiOff size={22} color="#EF4444" />
                  <Text style={styles.noServiceText}>NO SERVICE • AIRPLANE MODE</Text>
                </View>
                <View style={styles.latencyBadge}>
                  <Text style={styles.latencyText}>0ms CACHE HIT</Text>
                </View>
              </View>
              <Text style={styles.offlineBoxHeading}>
                Most ticketing apps fail the moment you walk into the basement.
              </Text>
              <Text style={styles.offlineBoxDesc}>
                Cloud-only web portals spin indefinitely when cell towers disappear.
                CineTrip persists all upcoming plans, turnstile QR codes, and seat assignments
                locally in encrypted storage (<Text style={styles.inlineCode}>@react-native-async-storage</Text> & <Text style={styles.inlineCode}>expo-secure-store</Text>).
              </Text>
            </View>

            <View style={styles.offlineProofBox}>
              <View style={styles.proofHeader}>
                <ShieldCheck size={20} color={colors.primary} />
                <Text style={styles.proofTitle}>LOCAL STORAGE ENGINE</Text>
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
                  <Text style={styles.proofMetricLabel}>Hardware keychain security</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            9. SECTION 7 — CINEMA LOCATOR (OPENSTREETMAP VENUES)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>06 / VENUE RADAR</Text>
            <Text style={styles.sectionHeading}>
              Find the screen, not just the movie.
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
              <Text style={styles.primaryInlineBtnText}>Open Live Cinema Radar</Text>
              <ArrowRight size={15} color="#07090E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            10. SECTION 8 — MEMORIES (CINEPHILE JOURNAL)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>07 / PRESERVE</Text>
            <Text style={styles.sectionHeading}>
              Movies end. Memories don't.
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
                        <Star key={s} size={13} color="#F59E0B" fill="#F59E0B" />
                      ))}
                    </View>
                  </View>

                  <Text style={styles.memoryMovieTitle}>{mem.movieTitle}</Text>
                  <Text style={styles.memoryVenueTag}>{mem.cinema} • {mem.format}</Text>
                  <Text style={styles.memoryStoryText}>"{mem.story}"</Text>

                  <View style={styles.memoryCompanionsRow}>
                    <Users size={12} color={colors.textSecondary} />
                    <Text style={styles.memoryCompanionsText}>
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
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            11. SECTION 9 — THE THEATRICAL LIFECYCLE (BEFORE / DURING / AFTER)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionDark}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>08 / THE COMPLETE RITUAL</Text>
            <Text style={styles.sectionHeading}>
              Designed for the entire theatrical lifecycle.
            </Text>
          </View>

          {/* Phase Selector */}
          <View style={styles.phaseTabsRow}>
            <TouchableOpacity
              style={[styles.phaseTab, activeTab === 'before' && styles.phaseTabActive]}
              onPress={() => setActiveTab('before')}
            >
              <Text style={[styles.phaseTabLabel, activeTab === 'before' && styles.phaseTabLabelActive]}>
                01 • BEFORE
              </Text>
              <Text style={styles.phaseTabSub}>Discovery & Planning</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.phaseTab, activeTab === 'during' && styles.phaseTabActive]}
              onPress={() => setActiveTab('during')}
            >
              <Text style={[styles.phaseTabLabel, activeTab === 'during' && styles.phaseTabLabelActive]}>
                02 • DURING
              </Text>
              <Text style={styles.phaseTabSub}>The Box Office & Hall</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.phaseTab, activeTab === 'after' && styles.phaseTabActive]}
              onPress={() => setActiveTab('after')}
            >
              <Text style={[styles.phaseTabLabel, activeTab === 'after' && styles.phaseTabLabelActive]}>
                03 • AFTER
              </Text>
              <Text style={styles.phaseTabSub}>The Cinephile Journal</Text>
            </TouchableOpacity>
          </View>

          {/* Phase Content */}
          <View style={styles.phaseContentCard}>
            {activeTab === 'before' && (
              <View style={styles.phaseGrid}>
                <View style={styles.phaseCard}>
                  <Compass size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Smart TMDB Discovery</Text>
                  <Text style={styles.phaseCardDesc}>Explore verifiable now-playing titles with verified format tags.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Layers size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>3-Step Trip Builder</Text>
                  <Text style={styles.phaseCardDesc}>Choose movie, select showtime, and pick concession snacks.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Users size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Phone Contact Invites</Text>
                  <Text style={styles.phaseCardDesc}>Select friends directly from your address book without chat chaos.</Text>
                </View>
              </View>
            )}

            {activeTab === 'during' && (
              <View style={styles.phaseGrid}>
                <View style={styles.phaseCard}>
                  <Ticket size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Offline Digital Pass</Text>
                  <Text style={styles.phaseCardDesc}>Opens in 0ms inside signal-blocking concrete multiplex basements.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Radio size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Galois Vector QR</Text>
                  <Text style={styles.phaseCardDesc}>High-contrast Reed-Solomon scannable matrix for turnstiles.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Clock size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Showtime Countdown</Text>
                  <Text style={styles.phaseCardDesc}>Live ticking countdown to ensure the squad is seated before trailers.</Text>
                </View>
              </View>
            )}

            {activeTab === 'after' && (
              <View style={styles.phaseGrid}>
                <View style={styles.phaseCard}>
                  <Star size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Acoustic & Vibe Rating</Text>
                  <Text style={styles.phaseCardDesc}>Rate sound dynamics, screen brightness, and seat comfort.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Camera size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Lobby Photo & Video</Text>
                  <Text style={styles.phaseCardDesc}>Snap marquee shots and video logs directly inside the app.</Text>
                </View>
                <View style={styles.phaseCard}>
                  <Bookmark size={22} color={colors.primary} />
                  <Text style={styles.phaseCardTitle}>Lifetime Archive</Text>
                  <Text style={styles.phaseCardDesc}>Build a permanent digital vault of every screening you attend.</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            12. SECTION 10 — THE 6 CORE CAPABILITIES SUMMARY
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionLight}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>PRODUCT CAPABILITIES</Text>
            <Text style={styles.sectionHeading}>
              Six features. Zero bloat.
            </Text>
          </View>

          <View style={styles.sixPillarsGrid}>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><Compass size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>DISCOVER</Text></View>
              <Text style={styles.pillarBoxDesc}>Live TMDB now-playing feed, certified format pills, trailers, and mood curation.</Text>
            </View>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><Layers size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>PLAN</Text></View>
              <Text style={styles.pillarBoxDesc}>3-step movie night builder with concession snacks, seat map, and showtime slots.</Text>
            </View>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><Users size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>SQUAD</Text></View>
              <Text style={styles.pillarBoxDesc}>Native phone address book integration to coordinate friends and headcount.</Text>
            </View>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><MapPin size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>CINEMA MAP</Text></View>
              <Text style={styles.pillarBoxDesc}>OpenStreetMap geospatial radar to discover certified IMAX & Dolby venues nearby.</Text>
            </View>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><Ticket size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>DIGITAL PASS</Text></View>
              <Text style={styles.pillarBoxDesc}>Offline-ready boarding pass with Reed-Solomon vector QR code and live timer.</Text>
            </View>
            <View style={styles.pillarBox}>
              <View style={styles.pillarHeader}><Camera size={18} color={colors.primary} /><Text style={styles.pillarBoxTitle}>MEMORIES</Text></View>
              <Text style={styles.pillarBoxDesc}>Acoustic rating, marquee photos, companion tagging, and personal screening stats.</Text>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            13. SECTION 11 — FINAL CALL TO ACTION (MARQUEE CLOSE)
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.sectionCtaMarquee}>
          <View style={styles.marqueeContainer}>
            <View style={styles.marqueeBadge}>
              <Film size={18} color={colors.primary} />
              <Text style={styles.marqueeBadgeText}>READY FOR SHOWTIME</Text>
            </View>

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
                onPress={() => handleLaunchApp('/(tabs)')}
                activeOpacity={0.85}
              >
                <Text style={styles.marqueePrimaryBtnText}>Explore CineTrip Live</Text>
                <ArrowRight size={17} color="#07090E" strokeWidth={2.5} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.marqueeSecondaryBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.marqueeSecondaryBtnText}>Create Account / Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────
            14. SECTION 12 — MINIMAL EDITORIAL FOOTER
        ────────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerInner}>
            <View style={styles.footerTop}>
              <View style={styles.footerBrand}>
                <View style={styles.brandBadgeSmall}>
                  <Film size={16} color={colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.footerBrandText}>CineTrip</Text>
                <Text style={styles.footerBrandSub}>Theatrical Trip Planner & Cinephile Journal</Text>
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

const createStyles = (colors) =>
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
      backgroundColor: 'rgba(7, 9, 14, 0.92)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      paddingVertical: 12,
      paddingHorizontal: 24,
      position: 'relative',
      zIndex: 50,
    },
    navbarScrolled: {
      backgroundColor: 'rgba(7, 9, 14, 0.98)',
      borderBottomColor: 'rgba(229, 169, 60, 0.2)',
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
      width: 34,
      height: 34,
      borderRadius: 8,
      backgroundColor: 'rgba(229, 169, 60, 0.14)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    brandTitle: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.3,
      color: '#F8FAFC',
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
      display: WINDOW_WIDTH > 768 ? 'flex' : 'none',
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
      display: WINDOW_WIDTH > 768 ? 'flex' : 'none',
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
      display: WINDOW_WIDTH <= 768 ? 'flex' : 'none',
    },
    mobileDrawer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      gap: 12,
      display: WINDOW_WIDTH <= 768 ? 'flex' : 'none',
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
      paddingVertical: WINDOW_WIDTH > 768 ? 72 : 40,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      position: 'relative',
    },
    heroLayout: {
      maxWidth: 1240,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 900 ? 'row' : 'column',
      alignItems: WINDOW_WIDTH > 900 ? 'center' : 'flex-start',
      gap: WINDOW_WIDTH > 900 ? 56 : 40,
    },
    heroLeft: {
      flex: 1,
      maxWidth: WINDOW_WIDTH > 900 ? 600 : '100%',
    },
    heroEyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
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
      fontSize: WINDOW_WIDTH > 768 ? 52 : 38,
      fontWeight: '900',
      letterSpacing: -1,
      lineHeight: WINDOW_WIDTH > 768 ? 58 : 44,
      color: '#F8FAFC',
      margin: 0,
      marginBottom: 20,
    },
    heroSubtitle: {
      fontSize: WINDOW_WIDTH > 768 ? 17 : 15,
      fontWeight: '400',
      lineHeight: 26,
      color: '#94A3B8',
      margin: 0,
      marginBottom: 32,
    },
    heroButtonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      marginBottom: 32,
    },
    heroPrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
      minHeight: 48,
    },
    heroPrimaryBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#07090E',
      letterSpacing: 0.2,
    },
    heroSecondaryBtn: {
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: RADIUS.sm,
      minHeight: 48,
    },
    heroSecondaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    heroTrustGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.08)',
      marginBottom: 24,
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
    },
    switcherLabel: {
      fontSize: 10,
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
      fontSize: 12,
      fontWeight: '600',
      color: '#94A3B8',
    },
    switcherPillTextActive: {
      color: colors.primary,
      fontWeight: '800',
    },

    // Hero Right / Digital Pass Graphic
    heroRight: {
      flex: 1,
      width: '100%',
      maxWidth: 520,
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
      ...SHADOWS.card,
    },
    passHeaderArea: {
      padding: 24,
      paddingTop: 28,
    },
    passBrandingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    passBrandBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
      fontSize: 26,
      fontWeight: '900',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    passTagline: {
      fontSize: 12,
      fontStyle: 'italic',
      color: '#94A3B8',
      marginBottom: 14,
    },
    passVenueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 2,
    },
    passVenueText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    passAddressText: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 14,
    },
    passFormatRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },

    // Perforation notch divider
    perforationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 24,
      position: 'relative',
    },
    notchLeft: {
      width: 18,
      height: 24,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
      backgroundColor: '#07090E',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      marginLeft: -1,
    },
    notchRight: {
      width: 18,
      height: 24,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
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
      marginHorizontal: 8,
    },

    passDetailsArea: {
      padding: 24,
      paddingTop: 16,
      backgroundColor: '#0C0F17',
    },
    passMetaGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    passMetaCell: {
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
    },
    passSnackStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#171E2D',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: RADIUS.xs,
      marginBottom: 16,
    },
    passSnackText: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.primary,
    },
    passQrContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
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
      marginBottom: 4,
    },
    qrSubNote: {
      fontSize: 10,
      lineHeight: 14,
      color: '#64748B',
      marginBottom: 6,
    },
    demoWatermark: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    demoWatermarkText: {
      fontSize: 8,
      fontWeight: '800',
      letterSpacing: 0.6,
      color: colors.primary,
    },

    // ── SECTION COMMON STYLES ─────────────────────────────────────
    sectionDark: {
      paddingVertical: WINDOW_WIDTH > 768 ? 80 : 48,
      paddingHorizontal: 24,
      backgroundColor: '#07090E',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    },
    sectionLight: {
      paddingVertical: WINDOW_WIDTH > 768 ? 80 : 48,
      paddingHorizontal: 24,
      backgroundColor: '#0C0F17',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    },
    sectionHeaderWrap: {
      maxWidth: 820,
      width: '100%',
      alignSelf: 'center',
      marginBottom: 40,
      alignItems: 'flex-start',
    },
    sectionEyebrow: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.primary,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    sectionHeading: {
      fontSize: WINDOW_WIDTH > 768 ? 38 : 28,
      fontWeight: '900',
      letterSpacing: -0.6,
      lineHeight: WINDOW_WIDTH > 768 ? 44 : 34,
      color: '#F8FAFC',
      margin: 0,
      marginBottom: 14,
    },
    sectionDesc: {
      fontSize: WINDOW_WIDTH > 768 ? 16 : 14,
      lineHeight: 24,
      color: '#94A3B8',
      margin: 0,
    },
    sectionCtaCenter: {
      marginTop: 36,
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
      marginTop: 20,
    },
    primaryInlineBtnText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#07090E',
    },
    inlineCode: {
      fontSize: 12,
      color: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.1)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },

    // ── SECTION 1 (PROBLEM VS SOLUTION) ───────────────────────────
    problemVsSolutionGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 24,
    },
    problemCard: {
      flex: 1,
      backgroundColor: '#0F131D',
      borderRadius: RADIUS.xl,
      padding: 28,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    solutionCard: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      padding: 28,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.35)',
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
    },
    problemIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    solutionIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    problemCardTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: '#EF4444',
    },
    solutionCardTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.primary,
    },
    fragmentedStepsList: {
      gap: 14,
    },
    fragStepItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    fragStepNum: {
      fontSize: 12,
      fontWeight: '700',
      color: '#EF4444',
      width: 20,
    },
    fragStepText: {
      fontSize: 14,
      color: '#94A3B8',
    },
    unifiedFlowList: {
      gap: 12,
    },
    uniFlowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    uniFlowPill: {
      backgroundColor: 'rgba(229, 169, 60, 0.14)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      width: 86,
      alignItems: 'center',
    },
    uniFlowPillText: {
      fontSize: 10,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: 0.8,
    },
    uniFlowDesc: {
      fontSize: 13,
      fontWeight: '600',
      color: '#F8FAFC',
      flex: 1,
    },

    // ── SECTION 2 (DISCOVER STRIP) ────────────────────────────────
    moodStrip: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      marginBottom: 28,
    },
    moodStripTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.textMuted,
      marginBottom: 10,
    },
    moodScroll: {
      gap: 10,
      paddingVertical: 4,
    },
    moodItemPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
    },
    moodItemText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    movieCardsScroll: {
      maxWidth: 1140,
      alignSelf: 'center',
      gap: 18,
      paddingVertical: 8,
    },
    movieCatalogCard: {
      width: 220,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    },
    moviePosterImage: {
      width: '100%',
      height: 310,
      backgroundColor: '#171E2D',
    },
    movieCardBody: {
      padding: 14,
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
      fontSize: 15,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    movieRuntimeText: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 10,
    },
    cardFormatRow: {
      flexDirection: 'row',
      gap: 4,
    },

    // ── SECTION 3 (PLANNER 3 STEPS) ───────────────────────────────
    plannerStepTabs: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    stepTab: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: 16,
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
      fontSize: 14,
      fontWeight: '700',
      color: '#94A3B8',
    },
    stepTabTitleActive: {
      color: '#F8FAFC',
      fontWeight: '900',
    },
    plannerStepCard: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.xl,
      padding: WINDOW_WIDTH > 768 ? 32 : 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    plannerCardEyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
      marginBottom: 4,
    },
    plannerCardHeadline: {
      fontSize: 20,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 24,
    },
    movieSelectionGrid: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 16,
    },
    movieSelectCard: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: 12,
      gap: 14,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      position: 'relative',
    },
    movieSelectCardSelected: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    selectPoster: {
      width: 60,
      height: 90,
      borderRadius: 6,
    },
    selectInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    selectTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    selectMeta: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 6,
    },
    formatPills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    selectCheck: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    plannerTwoCol: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 28,
    },
    plannerColLeft: {
      flex: 1,
    },
    plannerColRight: {
      flex: 1,
    },
    subGroupTitle: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 10,
    },
    cinemaPickItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#121722',
      borderRadius: RADIUS.sm,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      marginBottom: 8,
    },
    cinemaPickItemActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    cinemaPickLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
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
      gap: 8,
    },
    slotPill: {
      backgroundColor: '#121722',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: RADIUS.xs,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    slotPillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    slotPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#94A3B8',
    },
    slotPillTextActive: {
      fontSize: 12,
      fontWeight: '800',
      color: '#07090E',
    },
    snackItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#121722',
      borderRadius: RADIUS.sm,
      padding: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      marginBottom: 8,
    },
    snackItemActive: {
      borderColor: 'rgba(229, 169, 60, 0.4)',
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    snackText: {
      fontSize: 13,
      color: '#94A3B8',
      flex: 1,
      marginLeft: 10,
    },
    snackTextActive: {
      color: '#F8FAFC',
      fontWeight: '700',
    },

    // Step 3 Layout
    seatSectionLayout: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 28,
    },
    seatMapBox: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      alignItems: 'center',
    },
    screenIndicator: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 20,
    },
    screenArc: {
      width: '70%',
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
      marginBottom: 4,
    },
    screenArcLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 1.5,
      color: colors.textMuted,
    },
    seatGridMini: {
      gap: 8,
      marginBottom: 20,
    },
    miniSeatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    miniRowLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
      width: 14,
      textAlign: 'center',
    },
    miniSeatsWrap: {
      flexDirection: 'row',
      gap: 6,
    },
    miniSeat: {
      width: 24,
      height: 24,
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
      fontSize: 9,
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
      padding: 10,
      borderRadius: RADIUS.xs,
    },
    seatSummaryLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    seatSummaryPrice: {
      fontSize: 11,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    squadPreviewBox: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    squadListWrap: {
      gap: 10,
    },
    squadMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0C0F17',
      padding: 10,
      borderRadius: RADIUS.sm,
      gap: 12,
    },
    avatarInitials: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(229, 169, 60, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
    },
    squadMemberInfo: {
      flex: 1,
    },
    squadMemberName: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    squadMemberStatus: {
      fontSize: 11,
      color: colors.textMuted,
    },
    confirmedPill: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    confirmedPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#10B981',
    },
    invitedPill: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    invitedPillText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#F59E0B',
    },

    // ── SECTION 4 (SQUAD CHAT VS CINETRIP) ────────────────────────
    squadStoryCard: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
    },
    squadLeftGraphic: {
      flex: 1,
      backgroundColor: '#0C0F17',
      padding: 32,
      justifyContent: 'center',
      gap: 16,
    },
    chatBubbleDark: {
      backgroundColor: '#171E2D',
      borderRadius: RADIUS.md,
      padding: 14,
      maxWidth: '85%',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    chatSender: {
      fontSize: 11,
      fontWeight: '800',
      color: '#94A3B8',
      marginBottom: 2,
    },
    chatMessage: {
      fontSize: 13,
      color: '#F8FAFC',
    },
    chatBubbleGold: {
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      borderRadius: RADIUS.md,
      padding: 14,
      maxWidth: '90%',
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
    },
    chatSenderGold: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 2,
    },
    chatMessageGold: {
      fontSize: 13,
      color: '#F8FAFC',
    },
    squadRightDetails: {
      flex: 1,
      padding: 36,
      justifyContent: 'center',
    },
    featureBoxTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 8,
      margin: 0,
    },
    featureBoxDesc: {
      fontSize: 14,
      lineHeight: 22,
      color: '#94A3B8',
      marginBottom: 20,
      margin: 0,
    },
    featureCheckList: {
      gap: 10,
    },
    featureCheckItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureCheckText: {
      fontSize: 13,
      color: '#F8FAFC',
    },

    // ── SECTION 5 (DIGITAL PASS SHOWCASE) ─────────────────────────
    passShowcaseGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 36,
      alignItems: 'center',
    },
    passShowcaseLeft: {
      flex: 1,
      gap: 24,
    },
    featurePillar: {
      flexDirection: 'row',
      gap: 16,
    },
    pillarTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    pillarDesc: {
      fontSize: 14,
      lineHeight: 22,
      color: '#94A3B8',
    },
    passShowcaseRight: {
      flex: 1,
      width: '100%',
      maxWidth: 420,
    },
    miniPassCard: {
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
      overflow: 'hidden',
    },
    miniPassTop: {
      padding: 20,
    },
    miniPassRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    miniPassTag: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
    },
    miniPassStatus: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
    },
    miniPassTitle: {
      fontSize: 20,
      fontWeight: '900',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    miniPassCinema: {
      fontSize: 12,
      color: '#94A3B8',
    },
    miniPerforation: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 18,
    },
    miniNotchL: {
      width: 14,
      height: 18,
      borderTopRightRadius: 9,
      borderBottomRightRadius: 9,
      backgroundColor: '#07090E',
    },
    miniNotchR: {
      width: 14,
      height: 18,
      borderTopLeftRadius: 9,
      borderBottomLeftRadius: 9,
      backgroundColor: '#07090E',
    },
    miniDashed: {
      flex: 1,
      height: 1,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      marginHorizontal: 6,
    },
    miniPassBottom: {
      padding: 20,
      backgroundColor: '#0C0F17',
    },
    miniMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    miniLabel: {
      fontSize: 9,
      color: colors.textMuted,
      marginBottom: 2,
    },
    miniVal: {
      fontSize: 12,
      fontWeight: '800',
      color: '#F8FAFC',
    },
    miniQrCenter: {
      alignItems: 'center',
      padding: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.sm,
      width: 106,
      alignSelf: 'center',
    },

    // ── SECTION 6 (OFFLINE ARCHITECTURE) ──────────────────────────
    offlineDemoLayout: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 24,
    },
    offlineSignalBox: {
      flex: 1.2,
      backgroundColor: '#121722',
      borderRadius: RADIUS.xl,
      padding: 28,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    signalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    signalIcons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    noServiceText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#EF4444',
    },
    latencyBadge: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    latencyText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#10B981',
    },
    offlineBoxHeading: {
      fontSize: 20,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 10,
    },
    offlineBoxDesc: {
      fontSize: 14,
      lineHeight: 22,
      color: '#94A3B8',
    },
    offlineProofBox: {
      flex: 1,
      backgroundColor: '#0F131D',
      borderRadius: RADIUS.xl,
      padding: 28,
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.25)',
      justifyContent: 'space-between',
    },
    proofHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 20,
    },
    proofTitle: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.primary,
    },
    proofMetrics: {
      gap: 18,
    },
    proofMetricItem: {},
    proofMetricNum: {
      fontSize: 28,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    proofMetricLabel: {
      fontSize: 12,
      color: '#94A3B8',
    },

    // ── SECTION 7 (CINEMA MAP) ────────────────────────────────────
    cinemaCardsGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 18,
    },
    cinemaVenueCard: {
      flexBasis: WINDOW_WIDTH > 768 ? '48%' : '100%',
      flexGrow: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    venueTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    venueDistBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
    },
    venueDistText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    venueName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 4,
    },
    venueAddress: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 16,
    },
    venueBottom: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
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
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },

    // ── SECTION 8 (MEMORIES SHOWCASE) ─────────────────────────────
    memoriesGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 24,
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
      height: 220,
      backgroundColor: '#171E2D',
    },
    memoryBody: {
      padding: 24,
    },
    memoryTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    memoryDate: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    memoryStars: {
      flexDirection: 'row',
      gap: 2,
    },
    memoryMovieTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: '#F8FAFC',
      marginBottom: 2,
    },
    memoryVenueTag: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 14,
    },
    memoryStoryText: {
      fontSize: 14,
      fontStyle: 'italic',
      lineHeight: 22,
      color: '#94A3B8',
      marginBottom: 16,
    },
    memoryCompanionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.06)',
    },
    memoryCompanionsText: {
      fontSize: 11,
      color: '#64748B',
    },

    // ── SECTION 9 (BEFORE / DURING / AFTER) ────────────────────────
    phaseTabsRow: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 12,
      marginBottom: 24,
    },
    phaseTab: {
      flex: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.md,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    phaseTabActive: {
      borderColor: colors.primary,
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    phaseTabLabel: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: 2,
    },
    phaseTabLabelActive: {
      color: colors.primary,
    },
    phaseTabSub: {
      fontSize: 15,
      fontWeight: '700',
      color: '#F8FAFC',
    },
    phaseContentCard: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
    },
    phaseGrid: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      gap: 20,
    },
    phaseCard: {
      flex: 1,
      backgroundColor: '#0C0F17',
      borderRadius: RADIUS.lg,
      padding: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    phaseCardTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#F8FAFC',
      marginTop: 14,
      marginBottom: 6,
    },
    phaseCardDesc: {
      fontSize: 13,
      lineHeight: 20,
      color: '#94A3B8',
    },

    // ── SECTION 10 (SIX PILLARS) ──────────────────────────────────
    sixPillarsGrid: {
      maxWidth: 1140,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    pillarBox: {
      flexBasis: WINDOW_WIDTH > 900 ? '31%' : WINDOW_WIDTH > 600 ? '48%' : '100%',
      flexGrow: 1,
      backgroundColor: '#121722',
      borderRadius: RADIUS.lg,
      padding: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    pillarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    pillarBoxTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: '#F8FAFC',
    },
    pillarBoxDesc: {
      fontSize: 13,
      lineHeight: 20,
      color: '#94A3B8',
    },

    // ── SECTION 11 (FINAL CTA MARQUEE) ────────────────────────────
    sectionCtaMarquee: {
      paddingVertical: WINDOW_WIDTH > 768 ? 96 : 64,
      paddingHorizontal: 24,
      backgroundColor: '#07090E',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.07)',
      alignItems: 'center',
    },
    marqueeContainer: {
      maxWidth: 780,
      width: '100%',
      alignItems: 'center',
    },
    marqueeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(229, 169, 60, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 24,
    },
    marqueeBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.primary,
    },
    marqueeHeadline: {
      fontSize: WINDOW_WIDTH > 768 ? 48 : 32,
      fontWeight: '900',
      letterSpacing: -0.8,
      lineHeight: WINDOW_WIDTH > 768 ? 54 : 38,
      color: '#F8FAFC',
      margin: 0,
      marginBottom: 16,
      textAlign: 'center',
    },
    marqueeSub: {
      fontSize: WINDOW_WIDTH > 768 ? 17 : 15,
      color: '#94A3B8',
      margin: 0,
      marginBottom: 36,
      textAlign: 'center',
    },
    marqueeButtonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 14,
    },
    marqueePrimaryBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 28,
      paddingVertical: 15,
      borderRadius: RADIUS.sm,
    },
    marqueePrimaryBtnText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#07090E',
    },
    marqueeSecondaryBtn: {
      backgroundColor: '#121722',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      paddingHorizontal: 24,
      paddingVertical: 15,
      borderRadius: RADIUS.sm,
    },
    marqueeSecondaryBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#F8FAFC',
    },

    // ── FOOTER ───────────────────────────────────────────────────
    footer: {
      backgroundColor: '#07090E',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    footerInner: {
      maxWidth: 1240,
      width: '100%',
      alignSelf: 'center',
    },
    footerTop: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: WINDOW_WIDTH > 768 ? 'center' : 'flex-start',
      gap: 24,
    },
    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    brandBadgeSmall: {
      width: 28,
      height: 28,
      borderRadius: 6,
      backgroundColor: 'rgba(229, 169, 60, 0.14)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerBrandText: {
      fontSize: 18,
      fontWeight: '900',
      color: '#F8FAFC',
    },
    footerBrandSub: {
      fontSize: 12,
      color: '#64748B',
      marginLeft: 6,
    },
    footerLinksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 20,
    },
    footerLink: {
      fontSize: 13,
      fontWeight: '600',
      color: '#94A3B8',
    },
    footerDivider: {
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      marginVertical: 24,
    },
    footerBottom: {
      flexDirection: WINDOW_WIDTH > 768 ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: WINDOW_WIDTH > 768 ? 'center' : 'flex-start',
      gap: 12,
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

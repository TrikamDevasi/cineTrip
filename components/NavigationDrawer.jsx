import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import {
  House,
  Compass,
  Ticket,
  Camera,
  Bookmark,
  User,
  MapPin,
  Users,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useDrawerStore } from '../store/useDrawerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useTheme } from '../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../constants/theme';

const logoImg = require('../assets/images/logo.png');
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 340);

export default function NavigationDrawer() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useDrawerStore((s) => s.isOpen);
  const closeDrawer = useDrawerStore((s) => s.closeDrawer);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userName = usePreferencesStore((s) => s.userName);
  const watchlist = useWatchlistStore((s) => s.watchlist);

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  const handleNavigate = (route) => {
    closeDrawer();
    setTimeout(() => {
      router.push(route);
    }, 150);
  };

  const handleLogout = async () => {
    closeDrawer();
    setTimeout(async () => {
      await logout();
      router.replace('/landing');
    }, 150);
  };

  if (!isOpen) return null;

  const styles = createStyles(colors);
  const displayName = user?.name || userName || 'Cinephile User';
  const displayEmail = user?.email || 'Authenticated Member';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const DRAWER_EXCLUSIVE_ITEMS = [
    {
      id: 'watchlist',
      title: 'Watchlist',
      subtitle: 'Saved movies to see on the big screen',
      icon: Bookmark,
      route: '/(tabs)/watchlist',
      badge: watchlist.length > 0 ? `${watchlist.length}` : null,
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      subtitle: 'Formats, preferences & account',
      icon: User,
      route: '/(tabs)/profile',
    },
    {
      id: 'map',
      title: 'Cinema Map',
      subtitle: 'Nearby IMAX, Dolby & laser screens',
      icon: MapPin,
      route: '/map',
    },
    {
      id: 'contacts',
      title: 'Cine Squad',
      subtitle: 'Invite & coordinate with movie companions',
      icon: Users,
      route: '/contacts',
    },
  ];

  const NAVBAR_PAGES = [
    { id: 'home', title: 'Home Dashboard', icon: House, route: '/(tabs)' },
    { id: 'discover', title: 'Discover Movies', icon: Compass, route: '/(tabs)/discover' },
    { id: 'planner', title: 'Trip Planner & Passes', icon: Ticket, route: '/(tabs)/planner' },
    { id: 'memories', title: 'Cinephile Journal', icon: Camera, route: '/(tabs)/memories' },
  ];

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sliding Drawer Container */}
        <Animated.View
          style={[
            styles.drawerContent,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header Row */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.logoBadge}>
                <Image source={logoImg} style={styles.logoImg} resizeMode="contain" />
              </View>
              <Text style={styles.brandTitle}>
                Cine<Text style={styles.brandAccent}>Trip</Text>
              </Text>
            </View>

            <TouchableOpacity
              onPress={closeDrawer}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close navigation drawer"
            >
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* User Profile Card */}
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleNavigate('/(tabs)/profile')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Signed in as ${displayName}. Tap to edit profile.`}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {displayEmail}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {/* Section 1: Additional Pages (Moved from Navbar to Drawer) */}
            <View style={styles.sectionHeadingWrap}>
              <Text style={styles.sectionHeading}>DRAWER PAGES</Text>
            </View>

            {DRAWER_EXCLUSIVE_ITEMS.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <View style={[styles.itemIconWrap, isActive && styles.itemIconWrapActive]}>
                    <IconComp
                      size={18}
                      color={isActive ? colors.primary : colors.textSecondary}
                      strokeWidth={2.2}
                    />
                  </View>
                  <View style={styles.itemTextWrap}>
                    <Text style={[styles.itemTitle, isActive && styles.itemTitleActive]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  </View>
                  {item.badge ? (
                    <View style={styles.badgeWrap}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : (
                    <ChevronRight size={14} color={colors.cardBorder} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Section 2: Navbar Quick Links */}
            <View style={[styles.sectionHeadingWrap, { marginTop: SPACING.lg }]}>
              <Text style={styles.sectionHeading}>NAVBAR PAGES (4)</Text>
            </View>

            {NAVBAR_PAGES.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.simpleMenuItem, isActive && styles.simpleMenuItemActive]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                >
                  <IconComp
                    size={16}
                    color={isActive ? colors.primary : colors.textMuted}
                    strokeWidth={2}
                    style={{ marginRight: SPACING.md }}
                  />
                  <Text style={[styles.simpleItemText, isActive && styles.simpleItemTextActive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Section */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign out of CineTrip"
            >
              <LogOut size={16} color={colors.danger} strokeWidth={2} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      backgroundColor: 'transparent',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    drawerContent: {
      width: DRAWER_WIDTH,
      height: '100%',
      backgroundColor: '#090C14',
      borderLeftWidth: 1,
      borderLeftColor: 'rgba(255, 255, 255, 0.08)',
      paddingTop: Platform.OS === 'ios' ? 50 : 25,
      paddingBottom: Platform.OS === 'ios' ? 30 : 15,
      ...SHADOWS.card,
    },
    drawerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    logoBadge: {
      width: 28,
      height: 28,
      borderRadius: RADIUS.xs,
      backgroundColor: '#07090E',
      borderWidth: 1,
      borderColor: 'rgba(229, 169, 60, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImg: {
      width: 22,
      height: 22,
    },
    brandTitle: {
      ...TYPOGRAPHY.h2,
      fontSize: 18,
      fontWeight: '900',
      color: colors.text,
    },
    brandAccent: {
      color: colors.primary,
    },
    closeBtn: {
      padding: 6,
      borderRadius: RADIUS.xs,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: SPACING.md,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
      padding: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primarySubtle,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm,
    },
    avatarText: {
      ...TYPOGRAPHY.badge,
      color: colors.primary,
      fontWeight: '800',
      fontSize: 13,
    },
    userInfo: {
      flex: 1,
      marginRight: 6,
    },
    userName: {
      ...TYPOGRAPHY.bodyBold,
      fontSize: 13,
      color: colors.text,
    },
    userEmail: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    scrollList: {
      flex: 1,
      paddingHorizontal: SPACING.md,
    },
    sectionHeadingWrap: {
      paddingHorizontal: SPACING.sm,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xs,
    },
    sectionHeading: {
      ...TYPOGRAPHY.badge,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.md,
      marginBottom: 3,
    },
    menuItemActive: {
      backgroundColor: 'rgba(229, 169, 60, 0.08)',
    },
    itemIconWrap: {
      width: 32,
      height: 32,
      borderRadius: RADIUS.xs,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    itemIconWrapActive: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primary,
    },
    itemTextWrap: {
      flex: 1,
    },
    itemTitle: {
      ...TYPOGRAPHY.bodyBold,
      fontSize: 13,
      color: colors.text,
    },
    itemTitleActive: {
      color: colors.primary,
    },
    itemSubtitle: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    badgeWrap: {
      backgroundColor: colors.primary,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: RADIUS.full,
    },
    badgeText: {
      ...TYPOGRAPHY.caption,
      fontSize: 11,
      fontWeight: '800',
      color: '#07090E',
    },
    simpleMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADIUS.sm,
    },
    simpleMenuItemActive: {
      backgroundColor: 'rgba(229, 169, 60, 0.06)',
    },
    simpleItemText: {
      ...TYPOGRAPHY.body,
      fontSize: 13,
      color: colors.textSecondary,
    },
    simpleItemTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    drawerFooter: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      borderRadius: RADIUS.md,
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
      ...TYPOGRAPHY.bodyBold,
      fontSize: 13,
      color: colors.danger,
    },
  });

import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Platform, View } from 'react-native';
import { House, Compass, Ticket, Camera } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import NavigationDrawer from '../../components/NavigationDrawer';

export default function TabLayout() {
  const { colors } = useTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const isSignedIn = useAuthStore((s) => s.isAuthenticated && !s.isGuest && Boolean(s.user));

  // A person can access the dashboard only if the user has signed in
  if (initialized && !isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: '#090C14',
            borderTopColor: 'rgba(255, 255, 255, 0.07)',
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 6,
            paddingTop: 6,
            ...Platform.select({
              web: {
                maxWidth: 720,
                width: '100%',
                marginHorizontal: 'auto',
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderLeftColor: 'rgba(255, 255, 255, 0.07)',
                borderRightColor: 'rgba(255, 255, 255, 0.07)',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
            }),
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
            marginTop: 2,
            marginBottom: 2,
            lineHeight: 12,
            letterSpacing: 0.3,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 2,
          },
        }}
      >
        {/* 1. NAVBAR PAGE: HOME */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <House
                size={20}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            ),
          }}
        />

        {/* 2. NAVBAR PAGE: DISCOVER */}
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <Compass
                size={20}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            ),
          }}
        />

        {/* 3. NAVBAR PAGE: PLANNER */}
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Planner',
            tabBarIcon: ({ color, focused }) => (
              <Ticket
                size={20}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            ),
          }}
        />

        {/* 4. NAVBAR PAGE: JOURNAL */}
        <Tabs.Screen
          name="memories"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, focused }) => (
              <Camera
                size={20}
                color={color}
                strokeWidth={focused ? 2.4 : 1.8}
              />
            ),
          }}
        />

        {/* DRAWER-ACCESSIBLE PAGES (Hidden from bottom navbar) */}
        <Tabs.Screen
          name="watchlist"
          options={{
            href: null,
            title: 'Watchlist',
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            title: 'Profile',
          }}
        />
      </Tabs>

      {/* Global Slide-Over Navigation Drawer */}
      <NavigationDrawer />
    </View>
  );
}

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { House, Compass, Ticket, Bookmark, Camera, User } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: '#080C16',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : Platform.OS === 'web' ? 76 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : Platform.OS === 'web' ? 14 : 10,
          paddingTop: 10,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Compass
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, focused }) => (
            <Ticket
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="watchlist"
        options={{
          title: 'Watchlist',
          tabBarIcon: ({ color, focused }) => (
            <Bookmark
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="memories"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <Camera
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={24}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

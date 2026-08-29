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
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          marginBottom: 2,
          lineHeight: 12,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <House
              size={20}
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
              size={20}
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
              size={20}
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
              size={20}
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
              size={20}
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
              size={20}
              color={color}
              strokeWidth={focused ? 2.4 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

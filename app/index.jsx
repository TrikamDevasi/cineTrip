import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import LandingScreen from './landing';

export default function Index() {
  const { colors } = useTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const hasAccess = useAuthStore((s) => (s.isAuthenticated || s.isGuest) && Boolean(s.user));

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If signed in or guest explorer, go directly to dashboard
  if (hasAccess) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, present the stunning cinematic landing page first (on both Mobile & Web)
  return <LandingScreen />;
}
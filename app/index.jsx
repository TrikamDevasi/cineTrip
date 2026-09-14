import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import LandingScreen from './landing';

export default function Index() {
  const { colors } = useTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const isSignedIn = useAuthStore((s) => s.isAuthenticated && !s.isGuest && Boolean(s.user));

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Only users who have signed in can access the dashboard
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, present the stunning cinematic landing page first (on both Mobile & Web)
  return <LandingScreen />;
}
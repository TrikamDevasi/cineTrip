import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import LandingScreen from './landing';

export default function Index() {
  const { colors } = useTheme();
  const initialized = useAuthStore((s) => s.initialized);
  const canAccessApp = useAuthStore((s) => s.isAuthenticated || s.isGuest);

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // On Web / desktop browsers: if user is not already logged in, show the stunning cinematic landing page directly at "/"!
  if (Platform.OS === 'web' && !canAccessApp) {
    return <LandingScreen />;
  }

  return <Redirect href={canAccessApp ? '/(tabs)' : '/(auth)/login'} />;
}
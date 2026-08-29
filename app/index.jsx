import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../constants/theme';

export default function Index() {
  const initialized = useAuthStore((s) => s.initialized);
  const canAccessApp = useAuthStore((s) => s.isAuthenticated || s.isGuest);

  if (!initialized) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Redirect href={canAccessApp ? '/(tabs)' : '/(auth)/login'} />;
}
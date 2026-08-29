import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Root layout. The navigator (`<Stack>`) is always mounted on the first render,
 * and auth-routed groups are gated via `<Stack.Protected>` guards so no
 * imperative `router.replace()` ever fires before the navigator exists.
 */
export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const initialized = useAuthStore((s) => s.initialized);
  const canAccessApp = useAuthStore((s) => s.isAuthenticated || s.isGuest);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background, flex: 1 },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen
        name="movie/[id]"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ticket/[id]"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="memory/create"
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="contacts"
        options={{
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Protected guard={initialized && canAccessApp}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={initialized && !canAccessApp}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

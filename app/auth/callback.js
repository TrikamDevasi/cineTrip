import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { processAuthSessionFromUrl } from '../../services/googleAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { saveToken } from '../../services/auth';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../constants/theme';
import { Film } from 'lucide-react-native';

// Complete session if opened as popup or web auth session
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function handleRedirect() {
      try {
        let currentUrl = '';
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          currentUrl = window.location.href;
        }

        // If params exist on Expo Router route, construct URL string if needed
        if (!currentUrl && Object.keys(params).length > 0) {
          const qs = new URLSearchParams(params).toString();
          currentUrl = `cinetrip://auth/callback?${qs}`;
        }

        if (currentUrl) {
          const result = await processAuthSessionFromUrl(currentUrl);

          if (result.success && result.user && isMounted) {
            if (result.token) {
              await saveToken(result.token);
            }
            useAuthStore.setState({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isGuest: false,
              error: null,
            });
            router.replace('/(tabs)');
            return;
          } else if (result.error && isMounted) {
            setError(result.error);
            return;
          }
        }

        // Direct session fallback check
        const { useAuthStore: authStore } = await import('../../store/useAuthStore');
        const state = authStore.getState();
        if (state.isAuthenticated && isMounted) {
          router.replace('/(tabs)');
        } else {
          // If no session found after a brief moment, allow manual retry
          setTimeout(() => {
            if (isMounted) {
              setError('No active session found. Please sign in again.');
            }
          }, 2000);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Authentication failed.');
        }
      }
    }

    handleRedirect();

    return () => {
      isMounted = false;
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Film size={28} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>CineTrip</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.retryText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.statusText}>Completing Google Sign-In...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(229, 9, 20, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  loadingBox: {
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  errorBox: {
    alignItems: 'center',
    gap: SPACING.md,
    marginVertical: SPACING.md,
    width: '100%',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#07090E',
  },
});

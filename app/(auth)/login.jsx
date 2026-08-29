import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Film, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Globe } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle, enterGuestMode } = useAuthStore();
  const updateProfile = usePreferencesStore((s) => s.updateProfile);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter your password.';
    return null;
  };

  const handleLogin = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    const result = await login({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        router.replace('/(tabs)');
      } else if (!result.cancelled) {
        setError(result.error || 'Google Sign-In was not completed.');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In encountered an unexpected error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Header */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Film size={28} color={COLORS.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.appName}>CineTrip</Text>
            <Text style={styles.tagline}>Your luxury theatrical companion</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Google Sign-In */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleLogin}
              disabled={googleLoading || loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <View style={styles.googleContent}>
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign in with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textMuted} />
                  ) : (
                    <Eye size={18} color={COLORS.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleLogin}
              accessibilityLabel="Sign In"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Navigation */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    ...SHADOWS.focus,
  },
  appName: {
    ...TYPOGRAPHY.displayLarge,
    fontSize: 28,
    color: COLORS.text,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  errorBanner: {
    backgroundColor: COLORS.dangerSubtle,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    textAlign: 'center',
  },
  googleBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    marginTop: SPACING.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
});

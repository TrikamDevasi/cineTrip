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
import { Film, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, Globe } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loginWithGoogle, enterGuestMode } = useAuthStore();

  const updateProfile = usePreferencesStore((s) => s.updateProfile);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter a password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    });

    setLoading(false);

    if (result.success) {
      router.replace('/(tabs)');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleRegister = async () => {
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
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <IconButton
              icon="ArrowLeft"
              variant="surface"
              onPress={() => router.back()}
              accessibilityLabel="Back to sign in"
            />
          </View>

          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Film size={32} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.tagline}>Join the cinematic community</Text>
          </View>

          {/* Registration Form Card */}
          <View style={styles.card}>
            {/* Google OAuth Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleRegister}
              disabled={googleLoading || loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.googleIconBox}>
                    <Globe size={18} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Full Name */}
            <Text style={styles.label}>YOUR NAME</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />

              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                placeholder="Alex Cinephile"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel="Your full name"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                placeholder="alex@example.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>PASSWORD (MIN. 6 CHARACTERS)</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Create password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.textMuted} strokeWidth={2} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                placeholder="Confirm password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                accessibilityLabel="Confirm password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm((p) => !p)}
                style={styles.eyeBtn}
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <EyeOff size={18} color={COLORS.textMuted} strokeWidth={2} />
                ) : (
                  <Eye size={18} color={COLORS.textMuted} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Register Submit */}
            <View style={styles.btnWrap}>
              <Button
                title={loading ? "Creating Account..." : "Create Account 🎬"}
                variant="primary"
                size="lg"
                loading={loading}
                onPress={handleRegister}
                accessibilityLabel="Create CineTrip account"
              />
            </View>
          </View>

          {/* Switch to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Go to sign in screen"
                style={styles.loginTouch}
              >
                <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  topBar: {
    marginBottom: SPACING.sm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  appName: {
    ...TYPOGRAPHY.h1,
    fontSize: 26,
    color: COLORS.text,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    ...SHADOWS.card,
  },
  demoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  demoIconBadge: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  demoTexts: {
    flex: 1,
  },
  demoTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
  },
  demoSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 52,
  },
  googleIconBox: {
    marginRight: SPACING.sm,
  },
  googleBtnText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#FFFFFF',
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  dividerText: {
    ...TYPOGRAPHY.badge,
    fontSize: 11,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    letterSpacing: 0.8,
  },
  label: {
    ...TYPOGRAPHY.badge,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
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
  inputFlex: {
    flex: 1,
  },
  eyeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.danger,
    fontWeight: '600',
  },
  btnWrap: {
    marginTop: SPACING.xs,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  loginText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginTouch: {
    minHeight: 44,
    justifyContent: 'center',
  },
  loginLink: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
  },
});

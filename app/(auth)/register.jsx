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
import { Film, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { useAuthStore } from '../../store/useAuthStore';
import { usePreferencesStore } from '../../store/usePreferencesStore';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { goBack } from '../../lib/navigation';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { register, loginWithGoogle } = useAuthStore();
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
        if (!result.redirecting) {
          router.replace('/(tabs)');
        }
        return;
      } else if (!result.cancelled) {
        setError(result.error || 'Google Sign-In was not completed.');
      }
    } catch (err) {
      setError(err.message || 'Google Sign-In encountered an unexpected error.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const styles = createStyles(colors);

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
          {/* Top Bar */}
          <View style={styles.topNav}>
            <IconButton
              icon="ArrowLeft"
              variant="surface"
              onPress={() => goBack(router, '/(auth)/login')}
              accessibilityLabel="Back to Login"
            />
          </View>

          {/* Logo / Header */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <Film size={28} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.appName}>Join CineTrip</Text>
            <Text style={styles.tagline}>Create your theatrical cinephile passport</Text>
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
              onPress={handleGoogleRegister}
              disabled={googleLoading || loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign up with Google"
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
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
              <Text style={styles.dividerText}>or register with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={(t) => { setName(t); setError(''); }}
                  placeholder="Your Name"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
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
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  style={styles.eyeBtn}
                >
                  {showConfirm ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Create Account"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
              accessibilityLabel="Create Account"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Navigation */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  topNav: {
    marginBottom: SPACING.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    ...SHADOWS.focus,
  },
  appName: {
    ...TYPOGRAPHY.displayLarge,
    fontSize: 26,
    color: colors.text,
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...SHADOWS.card,
  },
  errorBanner: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: RADIUS.xs,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: colors.danger,
    textAlign: 'center',
  },
  googleBtn: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.text,
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
    color: colors.textMuted,
    marginHorizontal: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: SPACING.md,
    minHeight: 48,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: colors.text,
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
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.primary,
  },
});

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import api from '../../services/api';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { goBack } from '../../lib/navigation';

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === 'string' ? params.token : (params.token || null);
  const email = typeof params.email === 'string' ? params.email : (params.email || '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!token) return 'This reset link is invalid or incomplete. Please request a new one.';
    if (!password) return 'Please enter a new password.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleReset = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', {
        token,
        email,
        password,
        confirmPassword,
      });
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
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
              <KeyRound size={28} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.appName}>Choose a New Password</Text>
            <Text style={styles.tagline}>Must be at least 6 characters</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* New Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEW PASSWORD</Text>
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
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                  placeholder="Re-enter your new password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  style={styles.eyeBtn}
                  accessibilityRole="button"
                  accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Reset Password"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleReset}
              accessibilityLabel="Reset Password"
              style={styles.submitBtn}
            />
          </View>

          {/* Footer Navigation */}
          {!token ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Link missing or expired? </Text>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Request a new one</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : null}
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
    justifyContent: 'center',
    minHeight: '100%',
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
    textAlign: 'center',
  },
  tagline: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
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
    marginTop: SPACING.xl,
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
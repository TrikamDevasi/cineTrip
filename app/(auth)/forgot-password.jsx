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
import { Link, useRouter } from 'expo-router';
import { Mail, KeyRound, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import api from '../../services/api';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const validate = () => {
    if (!email.trim()) return 'Please enter your email address.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const handleRequestReset = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setSubmitted(false);
    setResetToken(null);
    setLoading(true);

    try {
      const data = await api.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setSubmitted(true);
      setResetToken(data.resetToken || null);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResetLink = () => {
    const normalizedEmail = email.trim().toLowerCase();
    router.push(
      `/(auth)/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(normalizedEmail)}`
    );
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
              onPress={() => router.back()}
              accessibilityLabel="Back to Login"
            />
          </View>

          {/* Logo / Header */}
          <View style={styles.heroSection}>
            <View style={styles.logoBadge}>
              <KeyRound size={28} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.appName}>Reset Password</Text>
            <Text style={styles.tagline}>Enter your email and we'll help you back in</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {submitted ? (
              <View style={styles.successBanner}>
                <CheckCircle2 size={20} color={colors.success} />
                <Text style={styles.successText}>
                  If an account exists for that email, a reset link has been sent.
                </Text>

                <Text style={styles.helperText}>
                  Demo mode: no email service is configured, so the reset link is shown here
                  instead of being emailed.
                </Text>

                {resetToken ? (
                  <Button
                    title="Open Reset Link"
                    variant="secondary"
                    size="lg"
                    icon="ExternalLink"
                    iconPosition="right"
                    onPress={handleOpenResetLink}
                    style={styles.resetLinkBtn}
                    accessibilityLabel="Open password reset link"
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => {
                    setSubmitted(false);
                    setEmail('');
                    setResetToken(null);
                  }}
                  activeOpacity={0.7}
                  style={styles.tryAgainBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.tryAgainText}>Try a different email</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
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
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <Button
                  title="Send Reset Link"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onPress={handleRequestReset}
                  accessibilityLabel="Send Reset Link"
                  style={styles.submitBtn}
                />
              </>
            )}
          </View>

          {/* Footer Navigation */}
          {!submitted ? (
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Remembered it? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.footerLink}>Back to Sign in</Text>
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
  successBanner: {
    backgroundColor: colors.successSubtle,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    alignItems: 'center',
  },
  successText: {
    ...TYPOGRAPHY.body,
    color: colors.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  resetLinkBtn: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  tryAgainBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tryAgainText: {
    ...TYPOGRAPHY.captionBold,
    color: colors.textSecondary,
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
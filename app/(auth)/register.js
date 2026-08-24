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
import {
  ArrowLeft,
  Film,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back to login screen"
          >
            <ArrowLeft size={22} color={COLORS.text} strokeWidth={2} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Film size={32} color={COLORS.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.appName}>Join CineTrip</Text>
            <Text style={styles.tagline}>Start your cinephile journey</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Fill in the details below</Text>

            {/* Name */}
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => { setName(t); setError(''); }}
                placeholder="Your full name"
                placeholderTextColor={COLORS.textMuted}
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Full name"
              />
            </View>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Mail size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
            </View>

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Min. 6 characters"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
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
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <ShieldCheck size={18} color={COLORS.textMuted} strokeWidth={2} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputFlex]}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                placeholder="Repeat your password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
                accessibilityLabel="Confirm password"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
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

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color={COLORS.danger} strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Create CineTrip account"
            >
              {loading ? (
                <ActivityIndicator color="#07090E" size="small" />
              ) : (
                <>
                  <UserPlus size={18} color="#07090E" strokeWidth={2.2} style={{ marginRight: 8 }} />
                  <Text style={styles.registerBtnText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity
                style={styles.loginLink}
                accessibilityRole="button"
                accessibilityLabel="Sign in to existing account"
              >
                <Text style={styles.loginLinkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.glowCyan,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 8,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: SPACING.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  inputFlex: { flex: 1 },
  eyeBtn: { padding: 6 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: RADIUS.sm,
    padding: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 6,
    flex: 1,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    marginTop: 4,
    ...SHADOWS.glowCyan,
  },
  btnDisabled: { opacity: 0.6 },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#07090E',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 10,
  },
  loginLink: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

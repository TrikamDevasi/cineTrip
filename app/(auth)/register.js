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
import { Ionicons } from '@expo/vector-icons';
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

  const renderInput = ({ icon, value, onChange, placeholder, secure, showToggle, onToggle, keyboardType, returnKeyType, label, accessibilityLabel }) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => { onChange(t); setError(''); }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={!!secure}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          autoCorrect={false}
          returnKeyType={returnKeyType || 'next'}
          accessibilityLabel={accessibilityLabel || label}
        />
        {showToggle !== undefined && (
          <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
            <Ionicons
              name={!secure ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

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
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoEmoji}>🎬</Text>
            <Text style={styles.appName}>Join CineTrip</Text>
            <Text style={styles.tagline}>Start your cinephile journey</Text>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSubtitle}>Fill in the details below</Text>

            {renderInput({
              icon: 'person-outline',
              value: name,
              onChange: setName,
              placeholder: 'Your full name',
              label: 'Full Name',
              accessibilityLabel: 'Full name',
            })}

            {renderInput({
              icon: 'mail-outline',
              value: email,
              onChange: setEmail,
              placeholder: 'your@email.com',
              keyboardType: 'email-address',
              label: 'Email',
              accessibilityLabel: 'Email address',
            })}

            {renderInput({
              icon: 'lock-closed-outline',
              value: password,
              onChange: setPassword,
              placeholder: 'Min. 6 characters',
              secure: !showPassword,
              showToggle: showPassword,
              onToggle: () => setShowPassword(!showPassword),
              label: 'Password',
              accessibilityLabel: 'Password',
            })}

            {renderInput({
              icon: 'shield-checkmark-outline',
              value: confirmPassword,
              onChange: setConfirmPassword,
              placeholder: 'Repeat your password',
              secure: !showConfirm,
              showToggle: showConfirm,
              onToggle: () => setShowConfirm(!showConfirm),
              returnKeyType: 'done',
              label: 'Confirm Password',
              accessibilityLabel: 'Confirm password',
            })}

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={15} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityLabel="Create account"
            >
              {loading ? (
                <ActivityIndicator color="#07090E" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color="#07090E" />
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
              <TouchableOpacity style={styles.loginLink} accessibilityLabel="Sign in">
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginTop: 6,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
    fontSize: 20,
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
  eyeBtn: { padding: 4 },
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
    marginLeft: 8,
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

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../lib/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { useContacts } from '../../hooks/useContacts';
import {
  createDeviceContact,
  isPresetId,
  PRESET_SQUAD,
  updateDeviceContact,
} from '../../services/contacts';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SPACING } from '../../constants/theme';
import { goBack } from '../../lib/navigation';

export default function ContactFormScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { contacts, fetchContacts, updateContactLocally } = useContacts();
  const isEditing = !!id;

  const existing = useMemo(() => {
    if (!isEditing) return null;
    const cid = String(id);
    return contacts.find((c) => c.id === cid) || PRESET_SQUAD.find((c) => c.id === cid) || null;
  }, [id, contacts, isEditing]);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    const parts = existing.name.trim().split(' ');
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setPhone(existing.phone || '');
    setEmail(existing.email || '');
  }, [existing]);

  const handleSave = async () => {
    if (!firstName.trim()) {
      showAlert('Missing Name', 'Please enter a first name.');
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        if (!existing) {
          showAlert('Contact Not Found', 'This contact no longer exists.');
          return;
        }

        if (isPresetId(existing.id)) {
          const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
          updateContactLocally(existing.id, {
            name: fullName || existing.name,
            phone: phone.trim(),
            email: email.trim(),
          });
          showAlert('Saved', 'Contact updated locally.', [
            { text: 'OK', onPress: () => goBack(router, '/contacts') },
          ]);
        } else {
          const ok = await updateDeviceContact(existing, {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email.trim(),
          });
          if (ok) {
            await fetchContacts();
            showAlert('Saved', 'Contact updated on your device.', [
              { text: 'OK', onPress: () => goBack(router, '/contacts') },
            ]);
          } else {
            showAlert('Update Failed', 'Could not update the contact. Please try again.');
          }
        }
      } else {
        const contactId = await createDeviceContact({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
        if (contactId) {
          await fetchContacts();
          const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
          showAlert('Contact Added!', `${fullName} added to your device contacts.`, [
            { text: 'OK', onPress: () => goBack(router, '/contacts') },
          ]);
        } else {
          showAlert('Add Failed', 'Could not create the contact. Check permissions and try again.');
        }
      }
    } catch (err) {
      showAlert('Error', err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => goBack(router, '/contacts')}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Contact' : 'Add Contact'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>NAME</Text>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Alex"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Chen"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            <Text style={styles.sectionHeading}>CONTACT INFO</Text>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., +1 555 012 3456"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., alex@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.saveBtnWrap}>
            <Button
              title={isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Contact'}
              variant="primary"
              size="lg"
              loading={isSaving}
              onPress={handleSave}
              accessibilityLabel={isEditing ? 'Save contact changes' : 'Add new contact'}
            />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl * 2,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  sectionHeading: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  fieldLabel: {
    ...TYPOGRAPHY.captionBold,
    color: colors.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    ...TYPOGRAPHY.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 44,
  },
  saveBtnWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
});
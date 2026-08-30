import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { showAlert } from '../../lib/alert';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Pencil, Phone, Trash2, UserPlus } from 'lucide-react-native';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import { useContacts } from '../../hooks/useContacts';
import { usePlannerStore } from '../../store/usePlannerStore';
import {
  deleteDeviceContact,
  getInitials,
  isPresetId,
  PRESET_SQUAD,
} from '../../services/contacts';
import { useTheme } from '../../hooks/useTheme';
import { TYPOGRAPHY, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { goBack } from '../../lib/navigation';

export default function ContactDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { contacts, removeContact, fetchContacts } = useContacts();
  const toggleDraftFriend = usePlannerStore((s) => s.toggleDraftFriend);
  const [isBusy, setIsBusy] = useState(false);

  const contact = useMemo(() => {
    const cid = String(id);
    return (
      contacts.find((c) => c.id === cid) ||
      PRESET_SQUAD.find((c) => c.id === cid) ||
      null
    );
  }, [contacts, id]);

  const styles = createStyles(colors);

  if (!contact) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <IconButton
            icon="ArrowLeft"
            variant="surface"
            onPress={() => goBack(router, '/contacts')}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Contact</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyState
          icon="Users"
          title="Contact Not Found"
          description="This contact no longer exists in your list."
          actionLabel="Go Back"
          onAction={() => goBack(router, '/contacts')}
        />
      </SafeAreaView>
    );
  }

  const initials = contact.initials || getInitials(contact.name);
  const isPreset = isPresetId(contact.id);

  const handleCall = () => {
    if (!contact.phone) {
      showAlert('No Phone', `${contact.name} has no phone number saved.`);
      return;
    }
    Linking.openURL(`tel:${contact.phone}`).catch(() =>
      showAlert('Error', 'Cannot trigger phone dialer.')
    );
  };

  const handleAddToPlan = () => {
    toggleDraftFriend({
      id: contact.id,
      name: contact.name,
      initials,
      phone: contact.phone,
    });
    showAlert(
      'Added to Plan! ðŸŽ¬',
      `${contact.name} added to your movie night draft.`,
      [
        { text: 'Go to Planner', onPress: () => router.push('/(tabs)/planner') },
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/contact/new', params: { id: contact.id } });
  };

  const handleConfirmDelete = async () => {
    setIsBusy(true);
    try {
      if (isPreset) {
        removeContact(contact.id);
        showAlert('Contact Removed', `${contact.name} was removed from your squad.`, [
          { text: 'OK', onPress: () => goBack(router, '/contacts') },
        ]);
        return;
      }
      const ok = await deleteDeviceContact(contact.id);
      if (ok) {
        await fetchContacts();
        showAlert('Contact Deleted', `${contact.name} was removed from your device contacts.`, [
          { text: 'OK', onPress: () => goBack(router, '/contacts') },
        ]);
      } else {
        showAlert('Delete Failed', 'Could not delete the contact. Please try again.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = () => {
    showAlert(
      'Delete Contact',
      `Remove ${contact.name} from your contacts and squad?${isPreset ? '\nThis demo squad member will only be removed locally.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleConfirmDelete },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
          onPress={() => goBack(router, '/contacts')}
          accessibilityLabel="Go back"
        />
        <Text style={styles.headerTitle}>Contact</Text>
        <IconButton
          icon="Pencil"
          variant="surface"
          onPress={handleEdit}
          accessibilityLabel={`Edit ${contact.name}`}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroCard}>
          {contact.imageUri ? (
            <Image source={{ uri: contact.imageUri }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <Text style={styles.name}>{contact.name}</Text>
          {isPreset ? (
            <Text style={styles.presetTag}>DEMO SQUAD MEMBER</Text>
          ) : (
            <Text style={styles.handle}>Device contact</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Phone size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.infoValue, !contact.phone && styles.infoEmpty]}>
              {contact.phone || 'No phone number saved'}
            </Text>
          </View>
          <View style={styles.infoSeparator} />
          <View style={styles.infoRow}>
            <Mail size={18} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.infoValue, !contact.email && styles.infoEmpty]}>
              {contact.email || 'No email address saved'}
            </Text>
          </View>
        </View>

        <View style={styles.actionBlock}>
          <Button
            title="Add to Plan"
            icon="UserPlus"
            variant="primary"
            size="lg"
            onPress={handleAddToPlan}
            accessibilityLabel={`Add ${contact.name} to plan`}
          />

          <Button
            title={contact.phone ? 'Call' : 'No Phone'}
            icon="Phone"
            variant="secondary"
            size="lg"
            disabled={!contact.phone}
            onPress={handleCall}
            accessibilityLabel={`Call ${contact.name}`}
          />

          <Button
            title="Edit Contact"
            icon="Pencil"
            variant="surface"
            size="lg"
            onPress={handleEdit}
            accessibilityLabel={`Edit ${contact.name}`}
          />

          <Button
            title={isBusy ? 'Deleting...' : 'Delete Contact'}
            icon="Trash2"
            variant="danger"
            size="lg"
            loading={isBusy}
            onPress={handleDelete}
            accessibilityLabel={`Delete ${contact.name}`}
          />
        </View>
      </ScrollView>
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.full,
    backgroundColor: colors.primarySubtle,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    ...TYPOGRAPHY.displayMedium,
    color: colors.primary,
  },
  name: {
    ...TYPOGRAPHY.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  handle: {
    ...TYPOGRAPHY.caption,
    color: colors.textMuted,
  },
  presetTag: {
    ...TYPOGRAPHY.badge,
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: colors.text,
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoEmpty: {
    color: colors.textMuted,
  },
  actionBlock: {
    gap: SPACING.md,
  },
});
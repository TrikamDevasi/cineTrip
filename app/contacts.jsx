import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  X,
  Users,
  Phone,
  Check,
  Plus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useContacts } from '../hooks/useContacts';
import { usePlannerStore } from '../store/usePlannerStore';
import { useTheme } from '../hooks/useTheme';
import { RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { goBack } from '../lib/navigation';

export default function ContactsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const {
    contacts,
    permissionStatus,
    isLoading,
    error,
    searchContacts,
  } = useContacts();

  const toggleDraftFriend = usePlannerStore((s) => s.toggleDraftFriend);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);

  const filtered = searchContacts(searchQuery);

  const handleSelectContact = (contact) => {
    const isSelected = selectedContacts.some((c) => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleLinkToPlanner = () => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts Selected', 'Select at least one contact to add to your plan.');
      return;
    }
    selectedContacts.forEach((c) => {
      toggleDraftFriend({
        id: c.id,
        name: c.name,
        initials: c.initials,
        phone: c.phone,
      });
    });
    Alert.alert(
      'Added to Plan! 🎬',
      `${selectedContacts.length} companion(s) added to your movie night draft.`,
      [{ text: 'Go to Planner', onPress: () => router.push('/(tabs)/planner') }]
    );
  };

  const handleCallContact = (contact) => {
    if (!contact.phone) {
      Alert.alert('No Phone', `${contact.name} has no phone number saved.`);
      return;
    }
    Linking.openURL(`tel:${contact.phone}`).catch(() =>
      Alert.alert('Error', 'Cannot trigger phone dialer.')
    );
  };

  const styles = createStyles(colors);

  if (permissionStatus === 'denied') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <IconButton
            icon="ArrowLeft"
            variant="surface"
            onPress={() => goBack(router, '/(tabs)/planner')}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyState
          icon="Users"
          title="Contacts Access Required"
          description="Allow CineTrip to access device contacts to invite friends and coordinate movie nights."
          actionLabel="Open Device Settings"
          onAction={() => Linking.openSettings()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="ArrowLeft"
          variant="surface"
            onPress={() => goBack(router, '/(tabs)/planner')}
            accessibilityLabel="Go back"
          />
          <Text style={styles.headerTitle}>Contacts & Movie Squad</Text>
        {selectedContacts.length > 0 ? (
          <Button
            title={`Add (${selectedContacts.length})`}
            variant="primary"
            size="sm"
            onPress={handleLinkToPlanner}
            accessibilityLabel="Add selected contacts to planner"
          />
        ) : (
          <Button
            title="New"
            icon="Plus"
            variant="surface"
            size="sm"
            onPress={() => router.push('/contact/new')}
            accessibilityLabel="Add a new contact"
          />
        )}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={18} color={colors.primary} strokeWidth={2} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search squad by name or phone..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <X size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedContacts.some((c) => c.id === item.id);
          return (
            <TouchableOpacity
              style={[styles.contactCard, isSelected && styles.contactCardSelected]}
              onPress={() => router.push({ pathname: '/contact/[id]', params: { id: item.id } })}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.phone || 'No phone'}`}
              accessibilityHint="Opens contact details"
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.initials || item.name.charAt(0)}</Text>
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>{item.phone || 'Cinephile Companion'}</Text>
              </View>

              <View style={styles.actionsRow}>
                {item.phone && (
                  <IconButton
                    icon="Phone"
                    variant="surface"
                    size={16}
                    onPress={() => handleCallContact(item)}
                    accessibilityLabel={`Call ${item.name}`}
                    style={{ marginRight: SPACING.xs }}
                  />
                )}
                <TouchableOpacity
                  onPress={() => handleSelectContact(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`Select ${item.name}`}
                  style={[styles.checkCircle, isSelected && styles.checkCircleActive]}
                >
                  {isSelected && <Check size={16} color="#07090E" strokeWidth={3} />}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="Users"
            title="No Contacts Found"
            description={searchQuery ? `No results for "${searchQuery}"` : "No contacts available."}
          />
        }
      />
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
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: colors.text,
  },
  clearBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 56,
  },
  contactCardSelected: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: colors.primary,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarText: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.primary,
  },
  contactInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  contactName: {
    ...TYPOGRAPHY.bodyBold,
    color: colors.text,
  },
  contactPhone: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.xs,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

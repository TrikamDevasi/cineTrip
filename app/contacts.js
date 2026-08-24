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
  User,
  Users,
  Phone,
  ExternalLink,
  Check,
  Ticket,
  AlertCircle,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useContacts } from '../hooks/useContacts';
import { usePlannerStore } from '../store/usePlannerStore';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

export default function ContactsScreen() {
  const router = useRouter();
  const {
    contacts,
    permissionStatus,
    isLoading,
    error,
    fetchContacts,
    searchContacts,
    requestPermission,
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
      'Added to Plan!',
      `${selectedContacts.length} contact(s) added to your movie night plan.`,
      [{ text: 'Go to Planner', onPress: () => router.push('/(tabs)/planner') }]
    );
  };

  const handleCallContact = (contact) => {
    if (!contact.phone) {
      Alert.alert('No Phone', `${contact.name} has no phone number.`);
      return;
    }
    Linking.openURL(`tel:${contact.phone}`).catch(() =>
      Alert.alert('Error', 'Cannot open phone app.')
    );
  };

  const handleOpenDeviceContact = async (contact) => {
    try {
      await Linking.openURL(`content://contacts/people/${contact.id}`);
    } catch {
      if (contact.phone) {
        Linking.openURL(`tel:${contact.phone}`);
      } else {
        Alert.alert('Contact', `${contact.name}\n${contact.email || 'No email'}`);
      }
    }
  };

  if (permissionStatus === 'denied') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contacts</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centeredContent}>
          <Users size={64} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Contacts Access Denied</Text>
          <Text style={styles.emptySubtitle}>
            Allow CineTrip to access your contacts to quickly add friends to movie nights.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel="Open device settings for contacts permission"
          >
            <Text style={styles.primaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts & Movie Squad</Text>
        {selectedContacts.length > 0 ? (
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={handleLinkToPlanner}
            accessibilityRole="button"
            accessibilityLabel={`Add ${selectedContacts.length} contacts to movie night plan`}
          >
            <Text style={styles.linkBtnText}>Add ({selectedContacts.length})</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Search size={16} color={COLORS.textMuted} strokeWidth={2} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={16} color={COLORS.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
          {selectedContacts.length > 0 ? ` • ${selectedContacts.length} selected` : ''}
        </Text>
        {contacts.length === 0 && !isLoading && (
          <TouchableOpacity
            onPress={fetchContacts}
            accessibilityRole="button"
            accessibilityLabel="Refresh contacts"
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading */}
      {isLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      )}

      {/* Error */}
      {error && !isLoading && (
        <View style={styles.errorBox}>
          <AlertCircle size={40} color={COLORS.danger} strokeWidth={1.8} />
          <Text style={styles.errorTitle}>Could not load contacts</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={fetchContacts}
            accessibilityRole="button"
            accessibilityLabel="Retry loading contacts"
          >
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!isLoading && !error && filtered.length === 0 && (
        <View style={styles.centeredContent}>
          <Users size={52} color={COLORS.textMuted} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>
            {contacts.length === 0 ? 'No Contacts Found' : 'No Results'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {contacts.length === 0
              ? 'Grant contacts permission to find friends for your movie nights.'
              : `No contacts match "${searchQuery}"`}
          </Text>
          {contacts.length === 0 && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={requestPermission}
              accessibilityRole="button"
              accessibilityLabel="Allow contacts access"
            >
              <Text style={styles.primaryBtnText}>Allow Contacts Access</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contacts List */}
      {!isLoading && !error && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id || item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = selectedContacts.some((c) => c.id === item.id);
            return (
              <TouchableOpacity
                style={[styles.contactCard, isSelected && styles.contactCardSelected]}
                onPress={() => handleSelectContact(item)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Select contact: ${item.name}`}
                accessibilityState={{ selected: isSelected }}
              >
                {/* Avatar */}
                <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                  {isSelected ? (
                    <Check size={18} color="#07090E" strokeWidth={2.6} />
                  ) : item.initials ? (
                    <Text style={styles.avatarInitials}>{item.initials}</Text>
                  ) : (
                    <User size={18} color={COLORS.primary} strokeWidth={2} />
                  )}
                </View>

                {/* Info */}
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  {item.phone ? (
                    <Text style={styles.contactDetail}>{item.phone}</Text>
                  ) : null}
                  {item.email ? (
                    <Text style={styles.contactDetail}>{item.email}</Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.contactActions}>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleCallContact(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Call ${item.name}`}
                    >
                      <Phone size={15} color={COLORS.primary} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleOpenDeviceContact(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.name} in device contacts`}
                  >
                    <ExternalLink size={15} color={COLORS.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Add to Plan Floating Button */}
      {selectedContacts.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleLinkToPlanner}
            accessibilityRole="button"
            accessibilityLabel={`Add ${selectedContacts.length} friends to movie night`}
          >
            <Ticket size={20} color="#07090E" strokeWidth={2.2} />
            <Text style={styles.fabText}>Add {selectedContacts.length} to Movie Night</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  linkBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  linkBtnText: { fontSize: 12, fontWeight: '800', color: '#07090E' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg,
    paddingHorizontal: 12, height: 44,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, marginBottom: 8,
  },
  statsText: { fontSize: 12, color: COLORS.textMuted },
  refreshText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 13 },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl, gap: 10 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  errorSub: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginTop: 10 },
  emptySubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: RADIUS.md, marginTop: 8,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '800', color: '#07090E' },
  listContent: { paddingBottom: 100, paddingHorizontal: SPACING.lg },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  contactCardSelected: {
    borderColor: COLORS.primary, backgroundColor: COLORS.primaryMuted,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  avatarSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  contactDetail: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  contactActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  fabContainer: {
    position: 'absolute', bottom: 20, left: SPACING.lg, right: SPACING.lg,
  },
  fab: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: RADIUS.md,
    gap: 8, ...SHADOWS.glowCyan,
  },
  fabText: { fontSize: 14, fontWeight: '800', color: '#07090E' },
});

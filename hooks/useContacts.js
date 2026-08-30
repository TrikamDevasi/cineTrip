import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import { PRESET_SQUAD, getInitials } from '../services/contacts';

/**
 * Reusable contacts hook with permission, fetch, search, and local mutations
 */
const PRESET_MAPPED = PRESET_SQUAD.map((c) => ({
  id: c.id,
  name: c.name,
  initials: c.initials || getInitials(c.name),
  phone: '',
  email: '',
  imageUri: null,
  avatar: '🎬',
}));

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const granted = await requestPermission();
      if (!granted) {
        setError('Contacts permission denied. Please enable in settings.');
        setIsLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        pageSize: 200,
        sort: Contacts.SortTypes.FirstName,
      });

      const mapped = data
        .filter((c) => c.name?.trim())
        .map((c, i) => ({
          id: c.id,
          name: c.name,
          initials: getInitials(c.name),
          phone: c.phoneNumbers?.[0]?.number || '',
          email: c.emails?.[0]?.email || '',
          imageUri: c.image?.uri || null,
          avatar: ['🍿', '✨', '🎬', '🥤', '🕶️', '🚀', '🔥', '⚡'][i % 8],
        }));

      setContacts(mapped.length > 0 ? mapped : PRESET_MAPPED);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [requestPermission]);

  const removeContact = useCallback((id) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateContactLocally = useCallback((id, updates) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const searchContacts = useCallback(
    (query) => {
      if (!query.trim()) return contacts;
      const q = query.toLowerCase();
      return contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    },
    [contacts]
  );

  useEffect(() => {
    fetchContacts();
  }, []);

  return {
    contacts,
    permissionStatus,
    isLoading,
    error,
    fetchContacts,
    searchContacts,
    removeContact,
    updateContactLocally,
    requestPermission,
  };
};
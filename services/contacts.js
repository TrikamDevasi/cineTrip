import * as Contacts from 'expo-contacts';
import * as Linking from 'expo-linking';

/**
 * Demo squad used only when explicitly requested (e.g. for first-run onboarding).
 * Each entry is marked isDemoContact: true so callers can display them differently.
 * NEVER silently show these as if they were real device contacts.
 */
export const PRESET_SQUAD = [
  { id: 'squad-1', name: 'Alex Chen', initials: 'AC', handle: '@alex_film', status: 'accepted', isDemoContact: true },
  { id: 'squad-2', name: 'Sarah Miller', initials: 'SM', handle: '@sarah_m', status: 'accepted', isDemoContact: true },
  { id: 'squad-3', name: 'Dev Patel', initials: 'DP', handle: '@dev_cine', status: 'invited', isDemoContact: true },
  { id: 'squad-4', name: 'Elena Vance', initials: 'EV', handle: '@elena_v', status: 'invited', isDemoContact: true },
  { id: 'squad-5', name: 'Marcus Brody', initials: 'MB', handle: '@marcus_b', status: 'invited', isDemoContact: true },
];

export function isPresetId(id) {
  return String(id).startsWith('squad-');
}

export function getInitials(name) {
  if (!name) return 'CT';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Open the device Settings app so the user can grant contacts permission manually.
 */
export function openContactsSettings() {
  Linking.openSettings().catch(() => {});
}

/**
 * Fetch device contacts.
 *
 * Returns { granted: boolean, permissionDenied: boolean, contacts: Array }
 *
 * IMPORTANT: If permission is denied, contacts is always empty [].
 * Callers must handle permissionDenied and show a proper UI prompt.
 * We NEVER silently fall back to PRESET_SQUAD.
 */
export async function getDeviceContacts() {
  try {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status !== 'granted') {
      return { granted: false, permissionDenied: true, contacts: [] };
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image],
      pageSize: 100,
      sort: Contacts.SortTypes.FirstName,
    });

    const mapped = (data || [])
      .filter((c) => c.name && c.name.trim().length > 0)
      .map((c, i) => ({
        id: c.id || `contact-${i}`,
        name: c.name,
        initials: getInitials(c.name),
        phone: c.phoneNumbers?.[0]?.number || '',
        email: c.emails?.[0]?.email || '',
        status: 'invited',
        isDemoContact: false,
      }));

    return { granted: true, permissionDenied: false, contacts: mapped };
  } catch (err) {
    return { granted: false, permissionDenied: false, contacts: [], error: err.message };
  }
}


/**
 * Add a new contact to device address book with strict input validation
 */
export async function createDeviceContact({ firstName, lastName, phone, email }) {
  const cleanFirst = String(firstName || '').trim();
  const cleanLast = String(lastName || '').trim();
  const cleanPhone = String(phone || '').trim();
  const cleanEmail = String(email || '').trim();

  if (!cleanFirst && !cleanLast) {
    return null;
  }

  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const contact = {
      [Contacts.Fields.FirstName]: cleanFirst || cleanLast,
      [Contacts.Fields.LastName]: cleanFirst ? cleanLast : '',
      [Contacts.Fields.PhoneNumbers]: cleanPhone
        ? [{ label: 'mobile', number: cleanPhone }]
        : [],
      [Contacts.Fields.Emails]: cleanEmail
        ? [{ label: 'work', email: cleanEmail }]
        : [],
    };

    const contactId = await Contacts.addContactAsync(contact);
    return contactId;
  } catch (err) {
    console.warn('Create contact error:', err.message);
    return null;
  }
}

/**
 * Delete a contact from the device address book.
 * Preset demo contacts ('squad-*') are not real device contacts and return false,
 * so callers can remove them from local state instead.
 */
export async function deleteDeviceContact(contactId) {
  if (isPresetId(contactId)) return false;
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await Contacts.deleteContactAsync(contactId);
    return true;
  } catch (err) {
    console.warn('Delete contact error:', err.message);
    return false;
  }
}

/**
 * Update an existing contact on the device address book.
 * Preset demo contacts ('squad-*') return false so callers can update local state instead.
 */
export async function updateDeviceContact(contact, { firstName, lastName, phone, email }) {
  if (!contact || isPresetId(contact.id)) return false;

  const cleanFirst = String(firstName || '').trim();
  const cleanLast = String(lastName || '').trim();
  const cleanPhone = String(phone || '').trim();
  const cleanEmail = String(email || '').trim();

  if (!cleanFirst && !cleanLast) return false;

  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return false;

    const updatedContact = {
      [Contacts.Fields.ID]: contact.id,
      [Contacts.Fields.FirstName]: cleanFirst,
      [Contacts.Fields.LastName]: cleanLast,
      [Contacts.Fields.PhoneNumbers]: cleanPhone
        ? [{ label: 'mobile', number: cleanPhone }]
        : [],
      [Contacts.Fields.Emails]: cleanEmail
        ? [{ label: 'work', email: cleanEmail }]
        : [],
    };

    await Contacts.updateContactAsync(updatedContact);
    return true;
  } catch (err) {
    console.warn('Update contact error:', err.message);
    return false;
  }
}

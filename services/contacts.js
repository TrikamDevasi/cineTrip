import * as Contacts from 'expo-contacts';

export const PRESET_SQUAD = [
  { id: 'squad-1', name: 'Alex Chen', initials: 'AC', handle: '@alex_film', status: 'accepted' },
  { id: 'squad-2', name: 'Sarah Miller', initials: 'SM', handle: '@sarah_m', status: 'accepted' },
  { id: 'squad-3', name: 'Dev Patel', initials: 'DP', handle: '@dev_cine', status: 'invited' },
  { id: 'squad-4', name: 'Elena Vance', initials: 'EV', handle: '@elena_v', status: 'invited' },
  { id: 'squad-5', name: 'Marcus Brody', initials: 'MB', handle: '@marcus_b', status: 'invited' },
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

export async function getDeviceContacts() {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Image],
        pageSize: 100,
        sort: Contacts.SortTypes.FirstName,
      });

      if (data && data.length > 0) {
        return data
          .filter(c => c.name && c.name.trim().length > 0)
          .map((c, i) => ({
            id: c.id || `contact-${i}`,
            name: c.name,
            initials: getInitials(c.name),
            phone: c.phoneNumbers && c.phoneNumbers[0] ? c.phoneNumbers[0].number : '',
            email: c.emails && c.emails[0] ? c.emails[0].email : '',
            status: 'invited',
          }));
      }
    }
    return PRESET_SQUAD;
  } catch (err) {
    console.warn('Contacts service warning:', err.message);
    return PRESET_SQUAD;
  }
}

/**
 * Add a new contact to device address book
 */
export async function createDeviceContact({ firstName, lastName, phone, email }) {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const contact = {
      [Contacts.Fields.FirstName]: firstName,
      [Contacts.Fields.LastName]: lastName || '',
      [Contacts.Fields.PhoneNumbers]: phone
        ? [{ label: 'mobile', number: phone }]
        : [],
      [Contacts.Fields.Emails]: email
        ? [{ label: 'work', email }]
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
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') return false;

    const updatedContact = {
      [Contacts.Fields.ID]: contact.id,
      [Contacts.Fields.FirstName]: firstName || '',
      [Contacts.Fields.LastName]: lastName || '',
      [Contacts.Fields.PhoneNumbers]: phone
        ? [{ label: 'mobile', number: phone }]
        : [],
      [Contacts.Fields.Emails]: email
        ? [{ label: 'work', email }]
        : [],
    };

    await Contacts.updateContactAsync(updatedContact);
    return true;
  } catch (err) {
    console.warn('Update contact error:', err.message);
    return false;
  }
}

import * as Contacts from 'expo-contacts';

export const PRESET_SQUAD = [
  { id: 'squad-1', name: 'Alex Chen', initials: 'AC', handle: '@alex_film', status: 'accepted' },
  { id: 'squad-2', name: 'Sarah Miller', initials: 'SM', handle: '@sarah_m', status: 'accepted' },
  { id: 'squad-3', name: 'Dev Patel', initials: 'DP', handle: '@dev_cine', status: 'invited' },
  { id: 'squad-4', name: 'Elena Vance', initials: 'EV', handle: '@elena_v', status: 'invited' },
  { id: 'squad-5', name: 'Marcus Brody', initials: 'MB', handle: '@marcus_b', status: 'invited' },
];

function getInitials(name) {
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

import { Linking, Platform } from 'react-native';

/**
 * Generates an RFC-compliant iCal date string (YYYYMMDDTHHmmssZ)
 */
const formatICalDate = (dateStr, timeStr) => {
  try {
    const d = new Date(dateStr || Date.now());
    if (timeStr) {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const meridian = match[3] ? match[3].toUpperCase() : null;

        if (meridian === 'PM' && hours < 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0;

        d.setHours(hours, minutes, 0, 0);
      }
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  } catch (e) {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
};

/**
 * Open system calendar event (Google Calendar on Web/Android, Web Cal Link)
 */
export const openCalendarEvent = (plan) => {
  if (!plan || !plan.movie) return;

  const title = encodeURIComponent(`🎬 Movie Night: ${plan.movie.title || 'Movie'}`);
  const details = encodeURIComponent(
    `CineTrip Outing\nFilm: ${plan.movie.title}\nCinema: ${plan.cinema?.name || 'Cinema'}\nSeats: ${plan.seats || 'General'}\nFormat: ${plan.cinema?.screenType || 'Standard'}`
  );
  const location = encodeURIComponent(
    `${plan.cinema?.name || 'Cinema'}, ${plan.cinema?.address || ''}`
  );

  const startUtc = formatICalDate(plan.date, plan.time);
  // Default 2.5 hours runtime
  const endUtc = formatICalDate(
    new Date(new Date(plan.date || Date.now()).getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
    plan.time
  );

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;

  Linking.openURL(googleUrl).catch((err) => {
    console.warn('Could not open calendar:', err.message);
  });
};

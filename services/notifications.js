import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Configure how notifications appear when app is in foreground.
 * Call once at app startup in _layout.jsx.
 */
export async function configureNotifications() {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('movie-night-reminders', {
        name: 'Movie Night Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E5A93C',
      });
    }
  } catch (err) {
    console.warn('Failed to configure notifications:', err.message);
  }
}

/**
 * Request notification permission.
 * Returns 'granted' | 'denied' | 'undetermined'.
 */
export async function requestNotificationPermission() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return 'granted';
    const { status } = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowSound: false, allowBadge: false },
    });
    return status;
  } catch (err) {
    return 'denied';
  }
}

/**
 * Get current permission status without prompting.
 */
export async function getNotificationPermission() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return 'undetermined';
  }
}

/**
 * Schedule a local reminder 1 hour before the plan's showtime.
 * Returns the notification ID (store this to cancel later), or null.
 */
export async function schedulePlanReminder(plan) {
  if (!plan || !plan.date || !plan.movie?.title) return null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    const triggerDate = buildTriggerDate(plan.date, plan.time);
    if (!triggerDate) return null;

    const oneHourBefore = new Date(triggerDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore <= new Date()) return null;

    const body = plan.cinema?.name
      ? `"${plan.movie.title}" at ${plan.cinema.name} — in 1 hour`
      : `"${plan.movie.title}" — your movie night is in 1 hour`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Movie Night Tonight',
        body,
        data: { planId: plan._id || plan.id, type: 'plan_reminder' },
        ...(Platform.OS === 'android' ? { channelId: 'movie-night-reminders' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: oneHourBefore,
      },
    });
    return notificationId;
  } catch (err) {
    return null;
  }
}

/**
 * Cancel a specific plan reminder by its notification ID.
 */
export async function cancelPlanReminder(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

/**
 * Cancel ALL scheduled notifications (call on logout).
 */
export async function cancelAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

/** Parse plan date + time into a trigger Date. Returns null if invalid. */
function buildTriggerDate(dateStr, timeStr) {
  try {
    const base = new Date(dateStr);
    if (Number.isNaN(base.getTime())) return null;
    if (timeStr && timeStr.trim()) {
      const str = timeStr.trim().toUpperCase();
      const isPM = str.includes('PM');
      const isAM = str.includes('AM');
      const clean = str.replace(/[AP]M/g, '').trim();
      const [h, m] = clean.split(':').map(Number);
      let hour = h || 0;
      if ((isPM || isAM) && isPM && hour < 12) hour += 12;
      if ((isPM || isAM) && isAM && hour === 12) hour = 0;
      base.setHours(hour, m || 0, 0, 0);
    } else {
      base.setHours(19, 0, 0, 0); // Default 7 PM
    }
    return base;
  } catch {
    return null;
  }
}

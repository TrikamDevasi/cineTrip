/**
 * Personalization + scheduling helpers.
 *
 * These are pure, truthful helpers. They never fabricate data — they only
 * derive UI state from real user data (plans, memories, watchlist) and from
 * the movie/day/slot fields that the user actually chose.
 */

/** "Good morning/afternoon/evening" based on local hour. */
export function greetingForHour(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

/** First name of a display name (or fallback). */
export function firstName(name, fallback = 'movie lover') {
  if (!name) return fallback;
  const first = name.trim().split(/\s+/)[0];
  return first || fallback;
}

/**
 * Build a Date for a screening given a plan's date (YYYY-MM-DD) and time
 * string (e.g. "7:30 PM" or "19:30"). Returns null if not resolvable.
 */
export function screeningDate(plan) {
  if (!plan) return null;
  const dateStr = plan.date;
  const timeStr = plan.time;
  if (!dateStr) return null;
  const base = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  if (!timeStr) return null;

  const m = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const period = m[3] ? m[3].toUpperCase() : null;
  if (period === 'AM' && hours === 12) hours = 0;
  if (period === 'PM' && hours < 12) hours += 12;
  if (!period && hours < 8) hours += 12; // bare 24h fallback for non-clock times
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/** True when plan is a confirmed booking with a real reference. */
export function isConfirmedPass(plan) {
  return Boolean(plan && plan.bookingRef && plan.bookingStatus && plan.bookingStatus !== 'plan');
}

/** True when the plan's screening date is today (local). */
export function isMovieDay(plan) {
  const d = screeningDate(plan);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Live countdown to a screening. Returns { state, text, ms, ... } where state
 * is 'ended' | 'live' | 'upcoming' | 'invalid'. Returns null for invalid plans.
 */
export function countdownTo(plan, now = new Date()) {
  const d = screeningDate(plan);
  if (!d) return null;
  const ms = d.getTime() - now.getTime();
  if (ms < 0) return { state: 'ended', ms, text: 'Screening passed' };
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const text =
    days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  const near = days <= 0 && hours < 24;
  return { state: near ? 'live' : 'upcoming', ms, text, days, hours, minutes, seconds };
}

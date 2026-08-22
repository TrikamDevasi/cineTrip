/**
 * Input validation and sanitization helpers.
 */

export function isValidText(input) {
  return typeof input === "string" && input.trim().length > 0;
}

export function isValidSearch(query) {
  return typeof query === "string" && query.trim().length >= 2 && query.length <= 200;
}

export function isValidId(id) {
  const num = Number(id);
  return Number.isFinite(num) && num > 0;
}

export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitize string input — strip control characters and limit length.
 */
export function sanitize(str, maxLength = 500) {
  if (typeof str !== "string") return "";
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize user-provided text for safe display (basic XSS prevention).
 */
export function sanitizeDisplay(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validate and limit the number of results requested.
 */
export function clampLimit(value, defaultVal = 20, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return defaultVal;
  return Math.min(Math.round(num), max);
}

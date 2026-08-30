/**
 * Shared navigation helpers.
 *
 * `router.back()` only does something when the navigator has history to pop.
 * On web, deep links or directly-loaded screens have no back stack, so a bare
 * `router.back()` silently does nothing and the UI back button appears dead.
 * Use `goBack(router, fallback)` so every back button has a reliable target.
 */

/**
 * Safely go back one screen, or fall back to a known route when there is no
 * history to pop (e.g. a screen loaded directly via a deep link).
 *
 * @param {object} router - expo-router `useRouter()` instance
 * @param {string|object} fallback - route to push when nothing to go back to
 */
export function goBack(router, fallback) {
  if (router.canGoBack && router.canGoBack()) {
    router.back();
  } else if (fallback) {
    router.replace(fallback);
  }
}

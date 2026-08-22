export async function fetchWithRetry(
  url,
  options = {},
  retries = 2,
  timeout = 8000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timer);

    // ❌ Auth errors — retries are useless
    if (res.status === 401 || res.status === 403) {
      throw new Error(`TMDB auth error (${res.status}) → ${url}`);
    }

    // ❌ Invalid movie ID
    if (res.status === 404) {
      throw new Error(`Resource not found (404) → ${url}`);
    }

    // 🔁 Retry only when it makes sense
    if (!res.ok) {
      if (retries > 0 && (res.status === 429 || res.status >= 500)) {
        await new Promise((r) => setTimeout(r, 500));
        return fetchWithRetry(url, options, retries - 1, timeout);
      }
      throw new Error(`Request failed (${res.status}) → ${url}`);
    }

    return res;
  } catch (err) {
    clearTimeout(timer);

    if (retries > 0 && err.name === "AbortError") {
      return fetchWithRetry(url, options, retries - 1, timeout);
    }

    throw err;
  }
}

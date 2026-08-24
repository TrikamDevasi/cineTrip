import { getToken } from './auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Normalize API errors into a consistent shape
 */
const normalizeError = (error, statusCode = 0) => ({
  message: error.message || 'An unexpected error occurred.',
  statusCode,
  isNetworkError: statusCode === 0,
});

/**
 * Core fetch wrapper with:
 * - JWT Authorization header injection
 * - JSON parsing
 * - Timeout handling
 * - Normalized error objects
 */
const request = async (method, path, body = null, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const token = await getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const config = {
      method,
      headers,
      signal: controller.signal,
      ...(body ? { body: JSON.stringify(body) } : {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const err = new Error(data.message || `HTTP ${response.status}`);
      err.statusCode = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const err = new Error('Request timed out. Please check your connection.');
      err.statusCode = 0;
      err.isNetworkError = true;
      throw err;
    }

    if (!error.statusCode) {
      // Network failure (no internet)
      const err = new Error(
        error.message.includes('fetch')
          ? 'Unable to reach server. Please check your connection.'
          : error.message
      );
      err.statusCode = 0;
      err.isNetworkError = true;
      throw err;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

const api = {
  get: (path, options) => request('GET', path, null, options),
  post: (path, body, options) => request('POST', path, body, options),
  put: (path, body, options) => request('PUT', path, body, options),
  patch: (path, body, options) => request('PATCH', path, body, options),
  delete: (path, options) => request('DELETE', path, null, options),
};

export default api;

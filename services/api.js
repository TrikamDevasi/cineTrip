import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken } from './auth';

const getBaseUrl = () => {
  // If explicitly configured to a remote/production non-localhost API, use it
  if (
    process.env.EXPO_PUBLIC_API_URL &&
    !process.env.EXPO_PUBLIC_API_URL.includes('localhost') &&
    !process.env.EXPO_PUBLIC_API_URL.includes('127.0.0.1')
  ) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // On Web / PC browser: localhost is directly accessible
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
  }

  // On Physical Mobile Devices (Expo Go / Dev Client):
  // Auto-detect developer PC's Wi-Fi IP from Metro connection (e.g. 192.168.1.x:5000)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    // Android emulator fallback loopback to host
    return 'http://10.0.2.2:5000';
  }

  // iOS simulator fallback
  return 'http://localhost:5000';
};

const BASE_URL = getBaseUrl();
const REQUEST_TIMEOUT_MS = 15000;

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
      const err = new Error(
        error.message.includes('fetch')
          ? `Unable to reach backend server at ${BASE_URL}.`
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
  getBaseUrl: () => BASE_URL,
};

export default api;

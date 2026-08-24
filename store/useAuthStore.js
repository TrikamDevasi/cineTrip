import { create } from 'zustand';
import api from '../services/api';
import { saveToken, getToken, removeToken } from '../services/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // true on startup while checking stored token
  error: null,

  /**
   * Called once on app startup to restore session
   */
  initialize: async () => {
    try {
      const storedToken = await getToken();
      if (!storedToken) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // Verify token is still valid with the backend
      const data = await api.get('/api/auth/me');
      set({
        user: data.user,
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Token invalid or expired
      await removeToken();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  /**
   * Register new user
   */
  register: async ({ name, email, password, confirmPassword }) => {
    set({ error: null });
    try {
      const data = await api.post('/api/auth/register', {
        name,
        email,
        password,
        confirmPassword,
      });
      await saveToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        error: null,
      });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Login with email and password
   */
  login: async ({ email, password }) => {
    set({ error: null });
    try {
      const data = await api.post('/api/auth/login', { email, password });
      await saveToken(data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        error: null,
      });
      return { success: true };
    } catch (err) {
      const message = err.message || 'Login failed. Please try again.';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Logout — clear token and state
   */
  logout: async () => {
    await removeToken();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  /**
   * Update user in state (after profile update)
   */
  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
}));

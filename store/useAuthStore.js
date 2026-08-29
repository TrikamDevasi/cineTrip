import { create } from 'zustand';
import api from '../services/api';
import { saveToken, getToken, removeToken } from '../services/auth';
import { signInWithGoogle } from '../services/googleAuth';
import { supabase } from '../services/supabase';


export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  initialized: false,
  error: null,

  /**
   * Called once on app startup to restore session.
   * Sets `initialized` (and clears `isLoading`) in every path so the app can
   * render deterministically once the session check has completed.
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await getToken();
      if (storedToken) {
        // Fast check with 2.5s timeout so offline backend doesn't freeze startup
        const verifyPromise = api.get('/api/auth/me');
        const timeoutPromise = new Promise((_, reject) => {
          const err = new Error('Auth check timeout');
          err.isNetworkError = true;
          err.statusCode = 0;
          setTimeout(() => reject(err), 2500);
        });

        try {
          const data = await Promise.race([verifyPromise, timeoutPromise]);
          set({
            user: data.user,
            token: storedToken,
            isAuthenticated: true,
            isGuest: false,
            error: null,
          });
          return;
        } catch (err) {
          // Only drop the stored session on an explicit auth rejection (401/403).
          // Network / timeout failures keep the token so the session survives offline startups.
          if (!err?.isNetworkError && (err?.statusCode === 401 || err?.statusCode === 403)) {
            await removeToken();
          }
        }
      }

      // Check active Supabase OAuth session fallback
      const { data: sbData } = await supabase.auth.getSession();
      if (sbData?.session?.user) {
        const sbUser = sbData.session.user;
        const fallbackUser = {
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Cinephile User',
          email: sbUser.email,
          avatar: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || null,
        };
        set({
          user: fallbackUser,
          token: sbData.session.access_token,
          isAuthenticated: true,
          isGuest: false,
          error: null,
        });
        return;
      }

      set({ user: null, token: null, isAuthenticated: false, isGuest: false, error: null });
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isGuest: false, error: null });
    } finally {
      set({ initialized: true, isLoading: false });
    }
  },

  /**
   * Enable guest / demo mode to explore without backend credentials
   */
  enterGuestMode: () => {
    set({
      user: {
        id: 'guest-explorer',
        name: 'Guest Cinephile',
        email: 'guest@cinetrip.app',
      },
      token: null,
      isAuthenticated: true,
      isGuest: true,
      isLoading: false,
      error: null,
    });
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
        isGuest: false,
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
        isGuest: false,
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
   * Login with Google OAuth (Supabase)
   */
  loginWithGoogle: async () => {
    set({ error: null });
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        if (result.token) {
          await saveToken(result.token);
        }
        set({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isGuest: false,
          error: null,
        });
        return { success: true };
      } else {
        const message = result.error || 'Google login failed.';
        set({ error: message });
        return { success: false, error: message, cancelled: result.cancelled };
      }
    } catch (err) {
      const message = err.message || 'Google login failed.';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  /**
   * Logout — clear token and state
   */
  logout: async () => {
    await removeToken();
    try {
      await supabase.auth.signOut();
    } catch {}
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isGuest: false,
      error: null,
    });
  },


  /**
   * Update user in state (after profile update)
   */
  setUser: (user) => set({ user }),

  clearError: () => set({ error: null }),
}));

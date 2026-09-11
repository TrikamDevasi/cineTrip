import { create } from 'zustand';
import api from '../services/api';
import { saveToken, getToken, removeToken } from '../services/auth';
import { signInWithGoogle } from '../services/googleAuth';
import { supabase } from '../services/supabase';
import { usePlannerStore } from './usePlannerStore';
import { useMemoryStore } from './useMemoryStore';
import { useWatchlistStore } from './useWatchlistStore';
import { usePreferencesStore } from './usePreferencesStore';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  initialized: false,
  listenerInitialized: false,
  error: null,

  /**
   * Called once on app startup to restore session.
   * Supabase session is authoritative. If active, backend profile is fetched
   * and synchronized with MongoDB.
   */
  initialize: async () => {
    set({ isLoading: true });
    try {
      // 1. Initialize Supabase Auth State Change Listener once
      if (!get().listenerInitialized && supabase?.auth?.onAuthStateChange) {
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (session?.access_token) {
              await saveToken(session.access_token);
              const sbUser = session.user;
              const fallback = {
                id: sbUser?.id || `usr_${Date.now()}`,
                name:
                  sbUser?.user_metadata?.full_name ||
                  sbUser?.user_metadata?.name ||
                  sbUser?.email?.split('@')[0] ||
                  'Cinephile User',
                email: sbUser?.email || '',
                avatar:
                  sbUser?.user_metadata?.avatar_url ||
                  sbUser?.user_metadata?.picture ||
                  null,
              };
              set({
                token: session.access_token,
                user: get().user || fallback,
                isAuthenticated: true,
                isGuest: false,
              });
            }
          } else if (event === 'SIGNED_OUT') {
            await removeToken();
            set({ user: null, token: null, isAuthenticated: false, isGuest: false });
          }
        });
        set({ listenerInitialized: true });
      }

      // 2. Check active Supabase session
      let currentToken = null;
      let currentUser = null;

      try {
        const { data: sbData } = await supabase.auth.getSession();
        if (sbData?.session?.user && sbData?.session?.access_token) {
          currentToken = sbData.session.access_token;
          const sbUser = sbData.session.user;
          currentUser = {
            id: sbUser.id,
            name:
              sbUser.user_metadata?.full_name ||
              sbUser.user_metadata?.name ||
              sbUser.email?.split('@')[0] ||
              'Cinephile User',
            email: sbUser.email,
            avatar:
              sbUser.user_metadata?.avatar_url ||
              sbUser.user_metadata?.picture ||
              null,
          };
          await saveToken(currentToken);
        }
      } catch (sbErr) {
        console.warn('Supabase getSession error:', sbErr.message);
      }

      // Fallback: Check stored token if Supabase session is not yet loaded
      if (!currentToken) {
        currentToken = await getToken();
      }

      if (currentToken) {
        // Verify with CineTrip backend (with 3s timeout for offline resilience)
        const verifyPromise = api.get('/api/auth/me');
        const timeoutPromise = new Promise((_, reject) => {
          const err = new Error('Auth check timeout');
          err.isNetworkError = true;
          err.statusCode = 0;
          setTimeout(() => reject(err), 3000);
        });

        try {
          const data = await Promise.race([verifyPromise, timeoutPromise]);
          if (data?.user) {
            currentUser = data.user;
          }
          set({
            user: currentUser || data.user,
            token: currentToken,
            isAuthenticated: true,
            isGuest: false,
            error: null,
          });
          return;
        } catch (err) {
          // If network error / timeout, maintain session offline if we have valid user identity
          if (err?.isNetworkError && currentUser) {
            set({
              user: currentUser,
              token: currentToken,
              isAuthenticated: true,
              isGuest: false,
              error: null,
            });
            return;
          }

          // If explicit auth rejection (401/403) and no active Supabase session, drop stale token
          if (!err?.isNetworkError && (err?.statusCode === 401 || err?.statusCode === 403)) {
            await removeToken();
          }
        }
      }

      if (currentUser && currentToken) {
        set({
          user: currentUser,
          token: currentToken,
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
   * Register new user — registers with Supabase Auth as authoritative identity,
   * with backend user record creation.
   */
  register: async ({ name, email, password, confirmPassword }) => {
    set({ error: null });
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Authoritative Sign-Up via Supabase Auth
      let sbSession = null;
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: name, name },
          },
        });
        if (sbError) {
          console.warn('Supabase signUp warning:', sbError.message);
        } else if (sbData?.session) {
          sbSession = sbData.session;
        }
      } catch (e) {
        console.warn('Supabase signUp exception:', e.message);
      }

      // 2. Also register / sync with backend MongoDB
      let backendData = null;
      try {
        backendData = await api.post('/api/auth/register', {
          name,
          email: normalizedEmail,
          password,
          confirmPassword,
        });
      } catch (backendErr) {
        // If Supabase succeeded, backend sync failure is non-fatal
        if (!sbSession) {
          throw backendErr;
        }
      }

      const token = sbSession?.access_token || backendData?.token;
      const user = backendData?.user || {
        id: sbSession?.user?.id || `usr_${Date.now()}`,
        name,
        email: normalizedEmail,
      };

      if (token) {
        await saveToken(token);
      }

      set({
        user,
        token,
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
   * Login with email and password — authoritative Supabase check with backend fallback
   */
  login: async ({ email, password }) => {
    set({ error: null });
    try {
      const normalizedEmail = email.trim().toLowerCase();

      // 1. Authoritative Login via Supabase Auth
      let sbSession = null;
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!sbError && sbData?.session) {
          sbSession = sbData.session;
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword exception:', e.message);
      }

      // 2. If Supabase succeeded, save token and fetch / sync backend profile
      if (sbSession?.access_token) {
        const token = sbSession.access_token;
        await saveToken(token);

        let userProfile = {
          id: sbSession.user.id,
          name:
            sbSession.user.user_metadata?.full_name ||
            sbSession.user.user_metadata?.name ||
            normalizedEmail.split('@')[0],
          email: normalizedEmail,
          avatar: sbSession.user.user_metadata?.avatar_url || null,
        };

        try {
          const profileData = await api.get('/api/auth/me');
          if (profileData?.user) {
            userProfile = profileData.user;
          }
        } catch {
          // Offline backend fallback
        }

        set({
          user: userProfile,
          token,
          isAuthenticated: true,
          isGuest: false,
          error: null,
        });
        return { success: true };
      }

      // 3. Fallback: Authenticate directly against CineTrip Backend (legacy credentials)
      const data = await api.post('/api/auth/login', { email: normalizedEmail, password });
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
      const message = err.message || 'Login failed. Please check your credentials.';
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
      if (result.success && result.redirecting) {
        return { success: true, redirecting: true };
      }
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
   * Logout — clear token, session, and private user data
   */
  logout: async () => {
    await removeToken();
    try {
      await supabase.auth.signOut();
    } catch {}

    // Clear user-specific caches to prevent privacy leak across logins
    try {
      usePlannerStore.getState().clearPlans();
      useMemoryStore.getState().clearMemories();
      useWatchlistStore.getState().clearWatchlist();
      usePreferencesStore.getState().clearProfile();
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


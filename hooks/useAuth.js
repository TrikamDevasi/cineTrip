import { useAuthStore } from '../store/useAuthStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import { useMemoryStore } from '../store/useMemoryStore';
import { usePlannerStore } from '../store/usePlannerStore';
import { useWatchlistStore } from '../store/useWatchlistStore';

/**
 * Centralized auth hook — handles login, logout, and post-login data loading
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, register, clearError } =
    useAuthStore();
  const setFromUser = usePreferencesStore((s) => s.setFromUser);
  const fetchMemories = useMemoryStore((s) => s.fetchMemories);
  const fetchPlans = usePlannerStore((s) => s.fetchPlans);
  const fetchWatchlist = useWatchlistStore((s) => s.fetchWatchlist);
  const clearMemories = useMemoryStore((s) => s.clearMemories);
  const clearPlans = usePlannerStore((s) => s.clearPlans);
  const clearWatchlist = useWatchlistStore((s) => s.clearWatchlist);
  const clearProfile = usePreferencesStore((s) => s.clearProfile);

  const loginAndLoad = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Populate preferences from user
      setFromUser(result.user || useAuthStore.getState().user);
      // Load user data in parallel
      await Promise.allSettled([fetchMemories(), fetchPlans(), fetchWatchlist()]);
    }
    return result;
  };

  const registerAndLoad = async (data) => {
    const result = await register(data);
    if (result.success) {
      setFromUser(useAuthStore.getState().user);
    }
    return result;
  };

  const logoutAndClear = async () => {
    await logout();
    clearMemories();
    clearPlans();
    clearWatchlist();
    clearProfile();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    clearError,
    login: loginAndLoad,
    register: registerAndLoad,
    logout: logoutAndClear,
  };
};

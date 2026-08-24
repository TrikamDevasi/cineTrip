import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Generic hook for API calls with loading/error/data state management
 * @param {Function} apiCall - Function that returns a promise
 */
export const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await apiCall(...args);
        setData(result);
        setIsLoading(false);
        return { success: true, data: result };
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        return { success: false, error: err.message };
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
};

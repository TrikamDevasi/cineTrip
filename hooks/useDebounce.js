import { useState, useEffect } from 'react';

/**
 * Debounce a rapidly-changing value
 * @param {*} value - The value to debounce
 * @param {number} delay - Milliseconds to wait
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

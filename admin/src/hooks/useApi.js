import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for API calls with loading, error, and cancellation support
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { onSuccess, onError } = options;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall({
        signal: abortControllerRef.current.signal,
      });

      onSuccess?.(response.data);
      return response.data;
    } catch (err) {
      if (err.name === "AbortError" || err.name === "CanceledError") {
        return null;
      }

      const message = err.response?.data?.message || err.message || "Something went wrong";
      setError(message);
      onError?.(err, message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { loading, error, execute, clearError };
}

/**
 * Debounced search hook
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for paginated data fetching
 */
export function usePaginatedData(fetchFn, initialParams = {}) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedParams = { ...initialParams, ...params };
        const response = await fetchFn(mergedParams);

        const result = response.data || response;

        if (result.data) {
          setData(result.data);
        } else if (result.orders) {
          setData(result.orders);
        } else if (result.products) {
          setData(result.products);
        } else if (Array.isArray(result)) {
          setData(result);
        }

        if (result.pagination) {
          setPagination(result.pagination);
        }

        return result;
      } catch (err) {
        const message = err.response?.data?.message || err.message;
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, initialParams]
  );

  return { data, pagination, loading, error, fetch, setData };
}

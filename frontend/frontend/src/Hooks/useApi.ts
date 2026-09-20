import { useState, useCallback, useEffect, useRef } from 'react';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  immediate?: boolean; // auto-fetch on mount (default: true for GET, false for others)
  auth?: boolean; // include JWT token (default: true)
  onSuccess?: (data: any) => void; // callback on successful response
  onError?: (error: Error) => void; // callback on error
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (body?: any) => Promise<T>;
  refetch: () => Promise<T>;
  reset: () => void;
}

/**
 * Generic CRUD hook for API calls.
 * Handles GET (auto-fetch), POST, PATCH, DELETE with loading/error states.
 * 
 * @example
 * // GET - auto-fetches on mount
 * const { data: employees, loading, error, refetch } = useApi<Employee[]>('/employees');
 * 
 * // POST - manual trigger
 * const { execute: createEmployee, loading } = useApi('/employees', { method: 'POST' });
 * const result = await createEmployee({ name: 'John', email: 'john@example.com' });
 * 
 * // PATCH - manual trigger
 * const { execute: updateEmployee } = useApi(`/employees/${id}`, { method: 'PATCH' });
 * await updateEmployee({ name: 'Jane' });
 * 
 * // DELETE - manual trigger
 * const { execute: deleteEmployee } = useApi(`/employees/${id}`, { method: 'DELETE' });
 * await deleteEmployee();
 */
export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    method = 'GET',
    immediate = method === 'GET',
    auth = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  // Build request headers
  const buildHeaders = useCallback((): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (auth) {
      const token = localStorage.getItem('digisol_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }, [auth]);

  // Core fetch logic
  const execute = useCallback(
    async (body?: any): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const options: RequestInit = {
          method,
          headers: buildHeaders(),
        };

        // Only add body for methods that support it
        if (body && ['POST', 'PATCH', 'DELETE'].includes(method)) {
          options.body = JSON.stringify(body);
        }

        const response = await fetch(
          `${(import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:5000'}${endpoint}`,
          options
        );       

        if (!response.ok) {
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (e) {
            // JSON parsing failed, errorData stays as empty object
          }
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
        }

        // Some endpoints (like DELETE) may return 204 No Content
        const responseData: T =
          response.status === 204 ? (null as T) : await response.json();

        if (mountedRef.current) {
          setData(responseData);
          onSuccess?.(responseData);
        }

        return responseData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (mountedRef.current) {
          setError(error);
          onError?.(error);
        }
        throw error;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [method, endpoint, buildHeaders, onSuccess, onError]
  );

  // Auto-fetch on mount if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // Track unmount separately so refetch works after re-renders
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Refetch (useful for GET after mutations)
  const refetch = useCallback(() => execute(), [execute]);

  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, refetch, reset };
}

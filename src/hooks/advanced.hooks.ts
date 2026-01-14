/**
 * Advanced Custom Hooks
 * Optimized hooks for common patterns and better performance
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook for managing URL query parameters
 * Optimized with useMemo and useCallback
 */
export const useQueryParams = <T extends Record<string, string>>() => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const params = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result as T;
  }, [searchParams]);
  
  const setParam = useCallback((key: keyof T, value: string | null) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value === null || value === '') {
        newParams.delete(key as string);
      } else {
        newParams.set(key as string, value);
      }
      return newParams;
    });
  }, [setSearchParams]);
  
  const setParams = useCallback((updates: Partial<T>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value as string);
        }
      });
      return newParams;
    });
  }, [setSearchParams]);
  
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);
  
  return { params, setParam, setParams, clearParams };
};

/**
 * Hook for pagination state management
 * Syncs with URL params for bookmarkable state
 */
export const usePagination = (defaultPage = 1, defaultPageSize = 10) => {
  const { params, setParams } = useQueryParams<{ page: string; pageSize: string }>();
  
  const page = useMemo(() => {
    const p = parseInt(params.page || String(defaultPage));
    return isNaN(p) ? defaultPage : p;
  }, [params.page, defaultPage]);
  
  const pageSize = useMemo(() => {
    const ps = parseInt(params.pageSize || String(defaultPageSize));
    return isNaN(ps) ? defaultPageSize : ps;
  }, [params.pageSize, defaultPageSize]);
  
  const setPage = useCallback((newPage: number) => {
    setParams({ page: String(newPage) });
  }, [setParams]);
  
  const setPageSize = useCallback((newPageSize: number) => {
    setParams({ pageSize: String(newPageSize), page: '1' });
  }, [setParams]);
  
  const reset = useCallback(() => {
    setParams({ page: String(defaultPage), pageSize: String(defaultPageSize) });
  }, [setParams, defaultPage, defaultPageSize]);
  
  return { page, pageSize, setPage, setPageSize, reset };
};

/**
 * Hook for managing filter state with URL sync
 */
export const useFilters = <T extends Record<string, unknown>>(defaultFilters: T) => {
  const { params, setParams, clearParams } = useQueryParams();
  
  const filters = useMemo(() => {
    return { ...defaultFilters, ...params } as T;
  }, [params, defaultFilters]);
  
  const setFilter = useCallback((key: keyof T, value: unknown) => {
    setParams({ [key as string]: value === null || value === undefined ? '' : String(value) } as Record<string, string>);
  }, [setParams]);
  
  const setFilters = useCallback((updates: Partial<T>) => {
    const stringified: Record<string, string> = {};
    Object.entries(updates).forEach(([key, value]) => {
      stringified[key] = value === null || value === undefined ? '' : String(value);
    });
    setParams(stringified as Record<string, string>);
  }, [setParams]);
  
  const clearFilters = useCallback(() => {
    clearParams();
  }, [clearParams]);
  
  const hasActiveFilters = useMemo(() => {
    return Object.keys(params).length > 0;
  }, [params]);
  
  return { filters, setFilter, setFilters, clearFilters, hasActiveFilters };
};

/**
 * Hook for managing sorting state
 */
export const useSorting = <T extends string>(defaultSortBy?: T, defaultSortOrder: 'asc' | 'desc' = 'asc') => {
  const { params, setParams } = useQueryParams<{ sortBy: string; sortOrder: string }>();
  
  const sortBy = (params.sortBy || defaultSortBy) as T | undefined;
  const sortOrder = (params.sortOrder || defaultSortOrder) as 'asc' | 'desc';
  
  const setSort = useCallback((field: T, order?: 'asc' | 'desc') => {
    if (field === sortBy && !order) {
      // Toggle order if same field
      setParams({ sortBy: field, sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      setParams({ sortBy: field, sortOrder: order || 'asc' });
    }
  }, [sortBy, sortOrder, setParams]);
  
  const clearSort = useCallback(() => {
    setParams({ sortBy: '', sortOrder: '' });
  }, [setParams]);
  
  return { sortBy, sortOrder, setSort, clearSort };
};

/**
 * Hook for click outside detection
 * Optimized with useCallback
 */
export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  callback: () => void
) => {
  const ref = useRef<T>(null);
  
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);
  
  return ref;
};

/**
 * Hook for managing local storage with type safety
 */
export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue] as const;
};

/**
 * Hook for managing session storage
 */
export const useSessionStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue] as const;
};

/**
 * Hook for managing boolean state with toggle
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  
  return [value, { toggle, setTrue, setFalse, setValue }] as const;
};

/**
 * Hook for async operations with loading and error states
 */
export const useAsync = <T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>
) => {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });
  
  const execute = useCallback(async (...args: Args) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await asyncFunction(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  }, [asyncFunction]);
  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);
  
  return { ...state, execute, reset };
};

/**
 * Hook for managing array state with helper functions
 */
export const useArray = <T,>(initialValue: T[] = []) => {
  const [array, setArray] = useState(initialValue);
  
  const push = useCallback((element: T) => {
    setArray((arr) => [...arr, element]);
  }, []);
  
  const filter = useCallback((callback: (item: T, index: number) => boolean) => {
    setArray((arr) => arr.filter(callback));
  }, []);
  
  const update = useCallback((index: number, element: T) => {
    setArray((arr) => [
      ...arr.slice(0, index),
      element,
      ...arr.slice(index + 1),
    ]);
  }, []);
  
  const remove = useCallback((index: number) => {
    setArray((arr) => [...arr.slice(0, index), ...arr.slice(index + 1)]);
  }, []);
  
  const clear = useCallback(() => setArray([]), []);
  
  return [array, { setArray, push, filter, update, remove, clear }] as const;
};

/**
 * Hook for window dimensions
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
};

/**
 * Hook for media queries
 */
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  
  return matches;
};

/**
 * Hook for copy to clipboard
 */
export const useClipboard = (timeout = 2000) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setIsCopied(false);
      return false;
    }
  }, [timeout]);
  
  return [isCopied, copy] as const;
};

/**
 * Hook for previous value
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Hook for interval
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

/**
 * Hook for timeout
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    if (delay === null) return;
    
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};

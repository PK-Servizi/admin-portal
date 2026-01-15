/**
 * Custom Hooks
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectCurrentUser, selectAuthLoading } from '@/store/slices';
import { useGetMeQuery } from '@/services/api';
import { addToast } from '@/store/slices/uiSlice';

/**
 * Hook to protect routes that require authentication
 */
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return { isAuthenticated, isLoading };
};

/**
 * Hook to initialize auth state on app load
 */
export const useAuthInit = () => {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { data, isLoading, error } = useGetMeQuery(undefined, {
    skip: !accessToken,
  });

  useEffect(() => {
    if (error) {
      dispatch(addToast({ type: 'error', message: 'Session expired. Please login again.' }));
    }
  }, [error, dispatch]);

  return { user: data?.data, isLoading, error };
};

/**
 * Hook to check user permissions
 */
export const usePermissions = () => {
  const user = useAppSelector(selectCurrentUser);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.some((permission) => user.permissions!.includes(permission));
  }, [user]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user || !user.permissions) return false;
    return permissions.every((permission) => user.permissions!.includes(permission));
  }, [user]);

  return { hasPermission, hasAnyPermission, hasAllPermissions };
};

/**
 * Hook for toast notifications
 */
export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000) => {
    dispatch(addToast({ type, message, duration }));
  }, [dispatch]);

  return {
    success: useCallback((message: string, duration?: number) => showToast('success', message, duration), [showToast]),
    error: useCallback((message: string, duration?: number) => showToast('error', message, duration), [showToast]),
    warning: useCallback((message: string, duration?: number) => showToast('warning', message, duration), [showToast]),
    info: useCallback((message: string, duration?: number) => showToast('info', message, duration), [showToast]),
  };
};

/**
 * Hook to handle API errors consistently
 */
export const useApiError = () => {
  const toast = useToast();

  const handleError = useCallback((error: unknown) => {
    let message = 'An unexpected error occurred';
    
    if (error && typeof error === 'object') {
      if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
        message = String(error.data.message);
      } else if ('error' in error) {
        message = String(error.error);
      } else if ('message' in error) {
        message = String(error.message);
      }
    }

    toast.error(message);
  }, [toast]);

  return { handleError };
};

/**
 * Hook to debounce values
 */
export const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Export all advanced hooks
export * from './advanced.hooks';

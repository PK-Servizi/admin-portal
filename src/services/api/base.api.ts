/**
 * Base API Configuration with RTK Query
 * Implements tag-based caching, automatic token management, and error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiResponse, ApiError } from '@/types';

// Define all cache tags for automatic invalidation
export const API_TAGS = {
  Auth: 'Auth',
  User: 'User',
  ServiceRequest: 'ServiceRequest',
  ServiceType: 'ServiceType',
  Document: 'Document',
  Appointment: 'Appointment',
  Subscription: 'Subscription',
  SubscriptionPlan: 'SubscriptionPlan',
  Payment: 'Payment',
  Notification: 'Notification',
  Course: 'Course',
  CMS: 'CMS',
  Report: 'Report',
  Role: 'Role',
  Permission: 'Permission',
} as const;

export type ApiTag = typeof API_TAGS[keyof typeof API_TAGS];

// Get API base URL from environment
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Base query with automatic token injection and refresh logic
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Enhanced base query with token refresh logic
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      // Try to get a new token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as ApiResponse<{ accessToken: string; refreshToken: string }>;
        // Store the new tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } else {
      // No refresh token - redirect to login
      window.location.href = '/login';
    }
  }

  return result;
};

/**
 * Base API with optimized caching configuration
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
  
  // Cache Configuration
  keepUnusedDataFor: 60, // Keep unused cache for 60 seconds
  
  // Refetch Configuration
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnFocus: false, // Disable automatic refetch on window focus (can cause excessive requests)
  refetchOnReconnect: true, // Refetch when connection is restored
});

/**
 * Helper to extract data from API response
 */
export const extractData = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

/**
 * Helper to handle API errors
 */
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object') {
    if ('data' in error) {
      const apiError = error.data as ApiError;
      return apiError.message || 'An error occurred';
    }
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  return 'An unexpected error occurred';
};

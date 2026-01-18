/**
 * Authentication API
 * Handles all authentication-related endpoints with optimistic updates
 */

import { baseApi, API_TAGS } from './base.api';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthTokens,
} from '@/types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Store tokens - backend returns flat accessToken/refreshToken
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),

    // Login user
    login: builder.mutation<ApiResponse<AuthResponse>, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Store tokens - backend returns flat accessToken/refreshToken
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    // Logout user
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.Auth, API_TAGS.User],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // Reset all API state
          dispatch(baseApi.util.resetApiState());
        } catch (error) {
          console.error('Logout failed:', error);
          // Clear tokens anyway
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    // Get current user
    getMe: builder.query<ApiResponse<User>, void>({
      query: () => '/auth/me',
      providesTags: [API_TAGS.Auth, API_TAGS.User],
      // Keep user data cached for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Change password
    changePassword: builder.mutation<ApiResponse<void>, ChangePasswordData>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [API_TAGS.Auth],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Optionally show success message
          console.log('Password changed successfully');
        } catch (error) {
          console.error('Change password failed:', error);
        }
      },
    }),

    // Forgot password
    forgotPassword: builder.mutation<ApiResponse<void>, ForgotPasswordData>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          console.log('Password reset email sent');
        } catch (error) {
          console.error('Forgot password failed:', error);
        }
      },
    }),

    // Reset password
    resetPassword: builder.mutation<ApiResponse<void>, ResetPasswordData>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          console.log('Password reset successfully');
        } catch (error) {
          console.error('Reset password failed:', error);
        }
      },
    }),

    // Refresh token
    refreshToken: builder.mutation<ApiResponse<AuthTokens>, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Update stored tokens
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear tokens on failure
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
} = authApi;

/**
 * Users Management API (Admin)
 * Handles all user administration endpoints
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse, User } from '@/types';

export interface UserFilters {
  skip?: number;
  take?: number;
  status?: string;
  role?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  fiscalCode?: string;
  isActive?: boolean;
  role?: string;
}

export interface UserActivity {
  action: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface UserSubscription {
  id: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export const usersAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // List all users (Admin)
    getAllUsers: builder.query<PaginatedApiResponse<User[]>, UserFilters>({
      query: (filters) => ({
        url: '/users',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.User, id })),
              { type: API_TAGS.User, id: 'ADMIN_LIST' },
            ]
          : [{ type: API_TAGS.User, id: 'ADMIN_LIST' }],
      keepUnusedDataFor: 60,
    }),

    // Get user by ID (Admin)
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.User, id }],
    }),

    // Update user (Admin)
    updateUser: builder.mutation<ApiResponse<User>, { id: string; data: UpdateUserData }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.User, id },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          usersAdminApi.util.updateQueryData('getUserById', id, (draft) => {
            Object.assign(draft.data, data);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete user (Admin)
    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.User, id },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
    }),

    // Activate user
    activateUser: builder.mutation<ApiResponse<User>, string>({
      query: (id) => ({
        url: `/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.User, id },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          usersAdminApi.util.updateQueryData('getUserById', id, (draft) => {
            draft.data.isActive = true;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Deactivate user
    deactivateUser: builder.mutation<ApiResponse<User>, string>({
      query: (id) => ({
        url: `/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.User, id },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          usersAdminApi.util.updateQueryData('getUserById', id, (draft) => {
            draft.data.isActive = false;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Get user activity
    getUserActivity: builder.query<ApiResponse<UserActivity[]>, string>({
      query: (id) => `/users/${id}/activity`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.User, id: `${id}_ACTIVITY` }],
      keepUnusedDataFor: 120,
    }),

    // Get user subscriptions
    getUserSubscriptions: builder.query<ApiResponse<UserSubscription[]>, string>({
      query: (id) => `/users/${id}/subscriptions`,
      providesTags: (_result, _error, id) => [
        { type: API_TAGS.User, id: `${id}_SUBSCRIPTIONS` },
        { type: API_TAGS.Subscription, id: `USER_${id}` },
      ],
      keepUnusedDataFor: 120,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllUsersQuery,
  useLazyGetAllUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserActivityQuery,
  useGetUserSubscriptionsQuery,
} = usersAdminApi;

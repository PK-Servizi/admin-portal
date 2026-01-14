/**
 * Roles & Permissions API
 * Handles role and permission management
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, UserRole, Permission } from '@/types';

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

export interface AssignPermissionsData {
  permissionIds: string[];
}

export interface AssignRoleData {
  roleId: string;
}

export const rolesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Roles Management
    getAllRoles: builder.query<ApiResponse<UserRole[]>, void>({
      query: () => '/roles',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role' as const, id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    createRole: builder.mutation<ApiResponse<UserRole>, CreateRoleData>({
      query: (data) => ({
        url: '/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    getRole: builder.query<ApiResponse<UserRole>, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Role', id }],
    }),

    updateRole: builder.mutation<ApiResponse<UserRole>, { id: string; data: UpdateRoleData }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          rolesApi.util.updateQueryData('getRole', id, (draft) => {
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

    deleteRole: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // Permissions Management
    getAllPermissions: builder.query<ApiResponse<Permission[]>, void>({
      query: () => '/permissions',
      providesTags: [{ type: 'Permission', id: 'LIST' }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    assignPermissionsToRole: builder.mutation<
      ApiResponse<UserRole>,
      { roleId: string; data: AssignPermissionsData }
    >({
      query: ({ roleId, data }) => ({
        url: `/roles/${roleId}/permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    removePermissionFromRole: builder.mutation<
      ApiResponse<void>,
      { roleId: string; permissionId: string }
    >({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // User Role Assignment
    assignRoleToUser: builder.mutation<
      ApiResponse<void>,
      { userId: string; data: AssignRoleData }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/roles`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: API_TAGS.User, id: userId },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
    }),

    assignPermissionToUser: builder.mutation<
      ApiResponse<void>,
      { userId: string; data: AssignPermissionsData }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/permissions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: API_TAGS.User, id: userId },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllRolesQuery,
  useCreateRoleMutation,
  useGetRoleQuery,
  useLazyGetRoleQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetAllPermissionsQuery,
  useAssignPermissionsToRoleMutation,
  useRemovePermissionFromRoleMutation,
  useAssignRoleToUserMutation,
  useAssignPermissionToUserMutation,
} = rolesApi;

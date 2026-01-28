/**
 * Service Types API
 * Admin CRUD operations for service types management
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse } from '@/types';
import type { ServiceType, CreateServiceTypeData, UpdateServiceTypeData } from '@/types/service-request.types';

export interface ServiceTypeFilters {
  search?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const serviceTypesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all service types (admin - with pagination and filters)
    getAdminServiceTypes: builder.query<PaginatedApiResponse<ServiceType[]>, ServiceTypeFilters | void>({
      query: (filters) => ({
        url: '/service-types',
        params: filters || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.ServiceType, id })),
              { type: API_TAGS.ServiceType, id: 'LIST' },
            ]
          : [{ type: API_TAGS.ServiceType, id: 'LIST' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get single service type
    getAdminServiceType: builder.query<ApiResponse<ServiceType>, string>({
      query: (id) => `/service-types/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.ServiceType, id }],
    }),

    // Create service type
    createServiceType: builder.mutation<ApiResponse<ServiceType>, CreateServiceTypeData>({
      query: (data) => ({
        url: '/service-types',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.ServiceType, id: 'LIST' }],
      onQueryStarted: async (newData, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceTypes', undefined, (draft) => {
            const tempServiceType: ServiceType = {
              id: 'temp-' + Date.now(),
              name: newData.name,
              code: newData.code || '',
              isActive: newData.isActive ?? true,
              description: newData.description,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempServiceType);
            draft.pagination.total += 1;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Update service type
    updateServiceType: builder.mutation<ApiResponse<ServiceType>, { id: string; data: UpdateServiceTypeData }>({
      query: ({ id, data }) => ({
        url: `/service-types/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceType, id },
        { type: API_TAGS.ServiceType, id: 'LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update for single item
        const patchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceType', id, (draft) => {
            Object.assign(draft.data, data);
            draft.data.updatedAt = new Date().toISOString();
          })
        );

        // Optimistic update for list
        const listPatchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceTypes', undefined, (draft) => {
            const item = draft.data.find((st) => st.id === id);
            if (item) {
              Object.assign(item, data);
              item.updatedAt = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          listPatchResult.undo();
        }
      },
    }),

    // Delete service type
    deleteServiceType: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/service-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.ServiceType, id },
        { type: API_TAGS.ServiceType, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic removal from list
        const patchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceTypes', undefined, (draft) => {
            const index = draft.data.findIndex((item) => item.id === id);
            if (index !== -1) {
              draft.data.splice(index, 1);
              draft.pagination.total -= 1;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Toggle service type active status
    toggleServiceTypeActive: builder.mutation<ApiResponse<ServiceType>, string>({
      query: (id) => ({
        url: `/service-types/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.ServiceType, id },
        { type: API_TAGS.ServiceType, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic toggle
        const patchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceTypes', undefined, (draft) => {
            const item = draft.data.find((st) => st.id === id);
            if (item) {
              item.isActive = !item.isActive;
              item.updatedAt = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Bulk delete service types
    bulkDeleteServiceTypes: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/service-types/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: API_TAGS.ServiceType, id: 'LIST' }],
      onQueryStarted: async (ids, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          serviceTypesApi.util.updateQueryData('getAdminServiceTypes', undefined, (draft) => {
            draft.data = draft.data.filter((item) => !ids.includes(item.id));
            draft.pagination.total -= ids.length;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminServiceTypesQuery,
  useLazyGetAdminServiceTypesQuery,
  useGetAdminServiceTypeQuery,
  useLazyGetAdminServiceTypeQuery,
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useToggleServiceTypeActiveMutation,
  useBulkDeleteServiceTypesMutation,
} = serviceTypesApi;

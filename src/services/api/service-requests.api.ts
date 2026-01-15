/**
 * Service Requests API
 * Manages service requests with optimistic updates and cache invalidation
 */

import { baseApi, API_TAGS } from './base.api';
import { ServiceRequestStatus, ServiceRequestPriority } from '@/types';
import type {
  ApiResponse,
  PaginatedApiResponse,
  ServiceRequest,
  ServiceType,
  ServiceRequestNote,
  CreateServiceRequestData,
  UpdateServiceRequestData,
} from '@/types';

export const serviceRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all service types (public)
    getServiceTypes: builder.query<ApiResponse<ServiceType[]>, void>({
      query: () => '/service-types',
      providesTags: [API_TAGS.ServiceType],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get service type by ID
    getServiceType: builder.query<ApiResponse<ServiceType>, string>({
      query: (id) => `/service-types/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.ServiceType, id }],
    }),

    // Get service type schema
    getServiceTypeSchema: builder.query<ApiResponse<any>, string>({
      query: (id) => `/service-types/${id}/schema`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.ServiceType, id: `${id}-schema` }],
      keepUnusedDataFor: 600,
    }),

    // Get user's service requests
    getMyServiceRequests: builder.query<
      PaginatedApiResponse<ServiceRequest[]>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/service-requests/my',
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.ServiceRequest, id })),
              { type: API_TAGS.ServiceRequest, id: 'LIST' },
            ]
          : [{ type: API_TAGS.ServiceRequest, id: 'LIST' }],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),

    // Get service request by ID
    getServiceRequest: builder.query<ApiResponse<ServiceRequest>, string>({
      query: (id) => `/service-requests/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.ServiceRequest, id }],
    }),

    // Create service request
    createServiceRequest: builder.mutation<ApiResponse<ServiceRequest>, CreateServiceRequestData>({
      query: (data) => ({
        url: '/service-requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.ServiceRequest, id: 'LIST' }],
      onQueryStarted: async (newRequest, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getMyServiceRequests', { page: 1, limit: 10 }, (draft) => {
            // Add temporary item to the list
            const tempRequest: ServiceRequest = {
              id: 'temp-' + Date.now(),
              referenceNumber: 'PENDING',
              userId: '',
              serviceTypeId: newRequest.serviceTypeId,
              status: ServiceRequestStatus.DRAFT,
              priority: ServiceRequestPriority.NORMAL,
              formData: newRequest.formData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempRequest);
            draft.pagination.total += 1;
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with real data
          dispatch(
            serviceRequestsApi.util.updateQueryData('getMyServiceRequests', { page: 1, limit: 10 }, (draft) => {
              const index = draft.data.findIndex((item) => item.id.startsWith('temp-'));
              if (index !== -1) {
                draft.data[index] = data.data;
              }
            })
          );
        } catch {
          // Revert optimistic update on error
          patchResult.undo();
        }
      },
    }),

    // Update service request
    updateServiceRequest: builder.mutation<
      ApiResponse<ServiceRequest>,
      { id: string; data: UpdateServiceRequestData }
    >({
      query: ({ id, data }) => ({
        url: `/service-requests/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.ServiceRequest, id: 'LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update for single item
        const patchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getServiceRequest', id, (draft) => {
            Object.assign(draft.data, data);
          })
        );

        // Optimistic update for list
        const listPatchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getMyServiceRequests', { page: 1, limit: 10 }, (draft) => {
            const item = draft.data.find((req) => req.id === id);
            if (item) {
              Object.assign(item, data);
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

    // Submit service request
    submitServiceRequest: builder.mutation<ApiResponse<ServiceRequest>, string>({
      query: (id) => ({
        url: `/service-requests/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.ServiceRequest, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getServiceRequest', id, (draft) => {
            draft.data.status = 'pending' as any;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete service request
    deleteServiceRequest: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/service-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.ServiceRequest, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        // Optimistic removal from list
        const patchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getMyServiceRequests', { page: 1, limit: 10 }, (draft) => {
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

    // Add note to service request
    addServiceRequestNote: builder.mutation<
      ApiResponse<ServiceRequest>,
      { id: string; content: string; isInternal: boolean }
    >({
      query: ({ id, content, isInternal }) => ({
        url: `/service-requests/${id}/notes`,
        method: 'POST',
        body: { content, isInternal },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: API_TAGS.ServiceRequest, id }],
      onQueryStarted: async ({ id, content, isInternal }, { dispatch, queryFulfilled }) => {
        // Optimistic update - use minimal User object for temp note
        const tempNote: ServiceRequestNote = {
          id: 'temp-' + Date.now(),
          content,
          isInternal,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: 'temp',
            email: '',
            firstName: 'User',
            lastName: '',
            isActive: true,
            isEmailVerified: true,
            role: { id: 'user', name: 'User', permissions: [] },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };

        const patchResult = dispatch(
          serviceRequestsApi.util.updateQueryData('getServiceRequest', id, (draft) => {
            if (!draft.data.notes) {
              draft.data.notes = [];
            }
            draft.data.notes.push(tempNote);
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
  useGetServiceTypesQuery,
  useGetServiceTypeQuery,
  useGetServiceTypeSchemaQuery,
  useGetMyServiceRequestsQuery,
  useGetServiceRequestQuery,
  useLazyGetServiceRequestQuery,
  useCreateServiceRequestMutation,
  useUpdateServiceRequestMutation,
  useSubmitServiceRequestMutation,
  useDeleteServiceRequestMutation,
  useAddServiceRequestNoteMutation,
} = serviceRequestsApi;

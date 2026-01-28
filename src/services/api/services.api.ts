/**
 * Services API
 * Admin CRUD operations for services management (individual services within service types)
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse } from '@/types';
import type { Service, CreateServiceData, UpdateServiceData, DocumentRequirement, FormSchema } from '@/types/service-request.types';

// Add Service tag to API_TAGS if not exists
declare module './base.api' {
  interface APITags {
    Service: 'Service';
  }
}

export interface ServiceFilters {
  search?: string;
  serviceTypeId?: string;
  category?: string;
  isActive?: boolean;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const servicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all services (admin - with pagination and filters)
    getAdminServices: builder.query<PaginatedApiResponse<Service[]>, ServiceFilters | void>({
      query: (filters) => ({
        url: '/services',
        params: filters || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Service' as const, id })),
              { type: 'Service' as const, id: 'LIST' },
            ]
          : [{ type: 'Service' as const, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    // Get single service
    getAdminService: builder.query<ApiResponse<Service>, string>({
      query: (id) => `/services/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Service' as const, id }],
    }),

    // Get service form schema
    getServiceFormSchema: builder.query<ApiResponse<FormSchema>, string>({
      query: (id) => `/services/${id}/schema`,
      providesTags: (_result, _error, id) => [{ type: 'Service' as const, id: `${id}-schema` }],
      keepUnusedDataFor: 600,
    }),

    // Get service required documents
    getServiceRequiredDocuments: builder.query<ApiResponse<DocumentRequirement[]>, string>({
      query: (id) => `/services/${id}/required-documents`,
      providesTags: (_result, _error, id) => [{ type: 'Service' as const, id: `${id}-docs` }],
      keepUnusedDataFor: 600,
    }),

    // Create service
    createService: builder.mutation<ApiResponse<Service>, CreateServiceData>({
      query: (data) => ({
        url: '/services',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Service' as const, id: 'LIST' },
        { type: API_TAGS.ServiceType, id: 'LIST' }, // May affect service type counts
      ],
      onQueryStarted: async (newData, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getAdminServices', undefined, (draft) => {
            const tempService: Service = {
              id: 'temp-' + Date.now(),
              name: newData.name,
              code: newData.code,
              description: newData.description,
              category: newData.category,
              basePrice: newData.basePrice,
              requiredDocuments: newData.requiredDocuments || [],
              documentRequirements: newData.documentRequirements,
              formSchema: newData.formSchema,
              isActive: newData.isActive ?? true,
              serviceTypeId: newData.serviceTypeId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempService);
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

    // Update service
    updateService: builder.mutation<ApiResponse<Service>, { id: string; data: UpdateServiceData }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Service' as const, id },
        { type: 'Service' as const, id: 'LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getAdminService', id, (draft) => {
            Object.assign(draft.data, data);
            draft.data.updatedAt = new Date().toISOString();
          })
        );

        const listPatchResult = dispatch(
          servicesApi.util.updateQueryData('getAdminServices', undefined, (draft) => {
            const item = draft.data.find((s) => s.id === id);
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

    // Update service form schema
    updateServiceFormSchema: builder.mutation<ApiResponse<Service>, { id: string; formSchema: FormSchema }>({
      query: ({ id, formSchema }) => ({
        url: `/services/${id}/schema`,
        method: 'PUT',
        body: { formSchema },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Service' as const, id },
        { type: 'Service' as const, id: `${id}-schema` },
      ],
    }),

    // Update service document requirements
    updateServiceDocumentRequirements: builder.mutation<
      ApiResponse<Service>,
      { id: string; documentRequirements: DocumentRequirement[] }
    >({
      query: ({ id, documentRequirements }) => ({
        url: `/services/${id}/document-requirements`,
        method: 'PUT',
        body: { documentRequirements },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Service' as const, id },
        { type: 'Service' as const, id: `${id}-docs` },
      ],
    }),

    // Delete service
    deleteService: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Service' as const, id },
        { type: 'Service' as const, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getAdminServices', undefined, (draft) => {
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

    // Toggle service active status
    toggleServiceActive: builder.mutation<ApiResponse<Service>, string>({
      query: (id) => ({
        url: `/services/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Service' as const, id },
        { type: 'Service' as const, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          servicesApi.util.updateQueryData('getAdminServices', undefined, (draft) => {
            const item = draft.data.find((s) => s.id === id);
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

    // Bulk delete services
    bulkDeleteServices: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/services/bulk-delete',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: [{ type: 'Service' as const, id: 'LIST' }],
    }),

    // Duplicate service
    duplicateService: builder.mutation<ApiResponse<Service>, string>({
      query: (id) => ({
        url: `/services/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Service' as const, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminServicesQuery,
  useLazyGetAdminServicesQuery,
  useGetAdminServiceQuery,
  useLazyGetAdminServiceQuery,
  useGetServiceFormSchemaQuery,
  useGetServiceRequiredDocumentsQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceFormSchemaMutation,
  useUpdateServiceDocumentRequirementsMutation,
  useDeleteServiceMutation,
  useToggleServiceActiveMutation,
  useBulkDeleteServicesMutation,
  useDuplicateServiceMutation,
} = servicesApi;

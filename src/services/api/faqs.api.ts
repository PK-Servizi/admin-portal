/**
 * FAQs API
 * Admin CRUD operations for FAQ management
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse } from '@/types';

// FAQ Types
export interface FAQ {
  id: string;
  serviceId?: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  category?: string;
  createdAt: string;
  updatedAt: string;
  Service?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateFAQData {
  serviceId?: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
  category?: string;
}

export interface UpdateFAQData {
  serviceId?: string;
  question?: string;
  answer?: string;
  order?: number;
  isActive?: boolean;
  category?: string;
}

export interface FAQFilters {
  serviceId?: string;
  category?: string;
  isActive?: string;
}

export const faqsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all FAQs (admin)
    getAdminFAQs: builder.query<PaginatedApiResponse<FAQ[]>, FAQFilters | void>({
      query: (filters) => ({
        url: '/faqs',
        params: filters || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.FAQ, id })),
              { type: API_TAGS.FAQ, id: 'LIST' },
            ]
          : [{ type: API_TAGS.FAQ, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    // Get FAQs by service ID
    getFAQsByService: builder.query<PaginatedApiResponse<FAQ[]>, string>({
      query: (serviceId) => ({
        url: '/faqs',
        params: { serviceId },
      }),
      providesTags: (result, _error, serviceId) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.FAQ, id })),
              { type: API_TAGS.FAQ, id: `service-${serviceId}` },
            ]
          : [{ type: API_TAGS.FAQ, id: `service-${serviceId}` }],
    }),

    // Get single FAQ
    getAdminFAQ: builder.query<ApiResponse<FAQ>, string>({
      query: (id) => `/faqs/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.FAQ, id }],
    }),

    // Create FAQ
    createFAQ: builder.mutation<ApiResponse<FAQ>, CreateFAQData>({
      query: (data) => ({
        url: '/faqs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: API_TAGS.FAQ, id: 'LIST' },
        ...(serviceId ? [{ type: API_TAGS.FAQ, id: `service-${serviceId}` }] : []),
      ],
    }),

    // Update FAQ
    updateFAQ: builder.mutation<ApiResponse<FAQ>, { id: string; data: UpdateFAQData }>({
      query: ({ id, data }) => ({
        url: `/faqs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, data }) => [
        { type: API_TAGS.FAQ, id },
        { type: API_TAGS.FAQ, id: 'LIST' },
        ...(data.serviceId ? [{ type: API_TAGS.FAQ, id: `service-${data.serviceId}` }] : []),
      ],
    }),

    // Delete FAQ
    deleteFAQ: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.FAQ, id },
        { type: API_TAGS.FAQ, id: 'LIST' },
      ],
    }),

    // Toggle FAQ active status
    toggleFAQActive: builder.mutation<ApiResponse<FAQ>, string>({
      query: (id) => ({
        url: `/faqs/${id}/toggle-active`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.FAQ, id },
        { type: API_TAGS.FAQ, id: 'LIST' },
      ],
    }),

    // Reorder FAQs
    reorderFAQs: builder.mutation<ApiResponse<void>, { serviceId: string; faqIds: string[] }>({
      query: ({ serviceId, faqIds }) => ({
        url: '/faqs/reorder',
        method: 'PATCH',
        body: { serviceId, faqIds },
      }),
      invalidatesTags: (_result, _error, { serviceId }) => [
        { type: API_TAGS.FAQ, id: 'LIST' },
        { type: API_TAGS.FAQ, id: `service-${serviceId}` },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminFAQsQuery,
  useLazyGetAdminFAQsQuery,
  useGetFAQsByServiceQuery,
  useLazyGetFAQsByServiceQuery,
  useGetAdminFAQQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  useToggleFAQActiveMutation,
  useReorderFAQsMutation,
} = faqsApi;

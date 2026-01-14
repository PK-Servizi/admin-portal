/**
 * CMS Admin API
 * Handles content management system administration
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse } from '@/types';

export interface CmsContent {
  id: string;
  type: 'page' | 'news' | 'faq';
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  author?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentData {
  type: 'page' | 'news' | 'faq';
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'published';
}

export interface UpdateContentData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'archived';
}

export const cmsAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // General Content Management
    getAllContent: builder.query<ApiResponse<CmsContent[]>, void>({
      query: () => '/cms/content',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.CMS, id })),
              { type: API_TAGS.CMS, id: 'LIST' },
            ]
          : [{ type: API_TAGS.CMS, id: 'LIST' }],
      keepUnusedDataFor: 120,
    }),

    createContent: builder.mutation<ApiResponse<CmsContent>, CreateContentData>({
      query: (data) => ({
        url: '/cms/content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    getContent: builder.query<ApiResponse<CmsContent>, string>({
      query: (id) => `/cms/content/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.CMS, id }],
    }),

    updateContent: builder.mutation<
      ApiResponse<CmsContent>,
      { id: string; data: UpdateContentData }
    >({
      query: ({ id, data }) => ({
        url: `/cms/content/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          cmsAdminApi.util.updateQueryData('getContent', id, (draft) => {
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

    deleteContent: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cms/content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
    }),

    publishContent: builder.mutation<ApiResponse<CmsContent>, string>({
      query: (id) => ({
        url: `/cms/content/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          cmsAdminApi.util.updateQueryData('getContent', id, (draft) => {
            draft.data.status = 'published';
            draft.data.publishedAt = new Date().toISOString();
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Pages Management
    createPage: builder.mutation<ApiResponse<CmsContent>, CreateContentData>({
      query: (data) => ({
        url: '/cms/pages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    updatePage: builder.mutation<
      ApiResponse<CmsContent>,
      { slug: string; data: UpdateContentData }
    >({
      query: ({ slug, data }) => ({
        url: `/cms/pages/${slug}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    deletePage: builder.mutation<ApiResponse<void>, string>({
      query: (slug) => ({
        url: `/cms/pages/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    // News Management
    createNews: builder.mutation<ApiResponse<CmsContent>, CreateContentData>({
      query: (data) => ({
        url: '/cms/news',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    updateNews: builder.mutation<
      ApiResponse<CmsContent>,
      { id: string; data: UpdateContentData }
    >({
      query: ({ id, data }) => ({
        url: `/cms/news/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
    }),

    deleteNews: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cms/news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
    }),

    // FAQ Management
    createFaq: builder.mutation<ApiResponse<CmsContent>, CreateContentData>({
      query: (data) => ({
        url: '/cms/faqs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.CMS, id: 'LIST' }],
    }),

    updateFaq: builder.mutation<
      ApiResponse<CmsContent>,
      { id: string; data: UpdateContentData }
    >({
      query: ({ id, data }) => ({
        url: `/cms/faqs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
    }),

    deleteFaq: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/cms/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.CMS, id },
        { type: API_TAGS.CMS, id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllContentQuery,
  useCreateContentMutation,
  useGetContentQuery,
  useLazyGetContentQuery,
  useUpdateContentMutation,
  useDeleteContentMutation,
  usePublishContentMutation,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = cmsAdminApi;

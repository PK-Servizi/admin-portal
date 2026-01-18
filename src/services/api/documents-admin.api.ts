/**
 * Documents Admin API
 * Handles document review and approval for admins
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse } from '@/types';

export interface Document {
  id: string;
  userId: string;
  serviceRequestId?: string;
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  uploadedAt: string;
  createdAt?: string;
  // Convenience aliases
  url?: string;
  type?: string;
  name?: string;
  // Populated user info
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export interface ApproveDocumentData {
  notes?: string;
}

export interface RejectDocumentData {
  reason: string;
  notes?: string;
}

export interface AddNotesData {
  notes: string;
}

export interface DocumentFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

export const documentsAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all pending documents
    getPendingDocuments: builder.query<ApiResponse<Document[]>, DocumentFilters | void>({
      query: (filters) => ({
        url: '/documents',
        params: { ...filters, status: 'pending' },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Document, id })),
              { type: API_TAGS.Document, id: 'PENDING_LIST' },
            ]
          : [{ type: API_TAGS.Document, id: 'PENDING_LIST' }],
      keepUnusedDataFor: 30,
    }),

    // Get documents for a specific request
    getRequestDocuments: builder.query<ApiResponse<Document[]>, string>({
      query: (requestId) => `/documents/request/${requestId}`,
      providesTags: (_result, _error, requestId) => [
        { type: API_TAGS.Document, id: `REQUEST_${requestId}` },
      ],
      keepUnusedDataFor: 60,
    }),

    // Approve document
    approveDocument: builder.mutation<
      ApiResponse<Document>,
      { id: string; data?: ApproveDocumentData }
    >({
      query: ({ id, data }) => ({
        url: `/documents/${id}/approve`,
        method: 'PATCH',
        body: data || {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Document, id },
        { type: API_TAGS.Document, id: 'PENDING_LIST' },
      ],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          documentsAdminApi.util.updateQueryData('getPendingDocuments', undefined, (draft) => {
            const doc = draft.data.find((d) => d.id === id);
            if (doc) {
              doc.status = 'approved';
              doc.reviewedAt = new Date().toISOString();
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

    // Reject document
    rejectDocument: builder.mutation<
      ApiResponse<Document>,
      { id: string; data: RejectDocumentData }
    >({
      query: ({ id, data }) => ({
        url: `/documents/${id}/reject`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Document, id },
        { type: API_TAGS.Document, id: 'PENDING_LIST' },
        { type: API_TAGS.Notification, id: 'LIST' },
      ],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          documentsAdminApi.util.updateQueryData('getPendingDocuments', undefined, (draft) => {
            const doc = draft.data.find((d) => d.id === id);
            if (doc) {
              doc.status = 'rejected';
              doc.reviewedAt = new Date().toISOString();
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

    // Add notes to document
    addDocumentNotes: builder.mutation<
      ApiResponse<Document>,
      { id: string; data: AddNotesData }
    >({
      query: ({ id, data }) => ({
        url: `/documents/${id}/notes`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Document, id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPendingDocumentsQuery,
  useGetRequestDocumentsQuery,
  useLazyGetRequestDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useAddDocumentNotesMutation,
} = documentsAdminApi;

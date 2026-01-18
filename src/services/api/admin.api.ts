/**
 * Admin API
 * Handles all admin dashboard and request management endpoints
 */

import { baseApi, API_TAGS } from './base.api';
import type {
  ApiResponse,
  PaginatedApiResponse,
  ServiceRequest,
} from '@/types';

// Admin-specific types
export interface DashboardStats {
  totalUsers: number;
  totalServiceRequests: number;
  pendingRequests: number;
  completedToday: number;
  revenue: {
    today: number;
    thisMonth: number;
    thisYear: number;
  };
}

export interface PendingCount {
  pending: number;
  missingDocuments: number;
  total: number;
}

export interface WorkloadDistribution {
  operatorId: string;
  operatorName: string;
  requestCount: number;
}

export interface RequestFilters {
  status?: string;
  serviceTypeId?: string;
  assignedOperatorId?: string;
  userId?: string;
  priority?: string;
  search?: string;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AssignOperatorData {
  operatorId: string;
}

export interface UpdateStatusData {
  status: string;
  reason?: string;
}

export interface AddInternalNoteData {
  note: string;
}

export interface RequestDocumentsData {
  categories: string[];
  reason: string;
}

export interface BulkUpdateStatusData {
  requestIds: string[];
  status: string;
}

export interface RequestStatistics {
  startDate?: Date;
  endDate?: Date;
}

export interface RequestStatisticsResult {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
  averageProcessingTime: number;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  skip?: number;
  take?: number;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DocumentStats {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Stats
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: [{ type: API_TAGS.Report, id: 'DASHBOARD' }],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),

    getPendingCount: builder.query<ApiResponse<PendingCount>, void>({
      query: () => '/admin/dashboard/pending-count',
      providesTags: [{ type: API_TAGS.ServiceRequest, id: 'PENDING_COUNT' }],
      keepUnusedDataFor: 30, // Cache for 30 seconds
      // Note: Enable polling in components with pollingInterval option
    }),

    getWorkloadDistribution: builder.query<ApiResponse<WorkloadDistribution[]>, void>({
      query: () => '/admin/dashboard/workload',
      providesTags: [{ type: API_TAGS.ServiceRequest, id: 'WORKLOAD' }],
      keepUnusedDataFor: 60,
    }),

    // Request Management
    getAllRequests: builder.query<
      PaginatedApiResponse<ServiceRequest[]>,
      RequestFilters
    >({
      query: (filters) => ({
        url: '/admin/requests',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.ServiceRequest, id })),
              { type: API_TAGS.ServiceRequest, id: 'ADMIN_LIST' },
            ]
          : [{ type: API_TAGS.ServiceRequest, id: 'ADMIN_LIST' }],
      keepUnusedDataFor: 30,
    }),

    getRequestDetail: builder.query<ApiResponse<ServiceRequest & { documentStats?: DocumentStats }>, string>({
      query: (id) => `/admin/requests/${id}`,
      providesTags: (_result, _error, id) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.Document, id: `REQUEST_${id}` },
      ],
    }),

    getOperatorRequests: builder.query<
      PaginatedApiResponse<ServiceRequest[]>,
      { operatorId: string; filters?: Record<string, string | number> }
    >({
      query: ({ operatorId, filters }) => ({
        url: `/admin/requests/operator/${operatorId}`,
        params: filters,
      }),
      providesTags: (_result, _error, { operatorId }) => [
        { type: API_TAGS.ServiceRequest, id: `OPERATOR_${operatorId}` },
      ],
    }),

    // Request Actions
    assignToOperator: builder.mutation<
      ApiResponse<ServiceRequest>,
      { id: string; data: AssignOperatorData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/requests/${id}/assign`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.ServiceRequest, id: 'ADMIN_LIST' },
        { type: API_TAGS.ServiceRequest, id: 'WORKLOAD' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          adminApi.util.updateQueryData('getRequestDetail', id, (draft) => {
            draft.data.assignedToId = data.operatorId;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    updateRequestStatus: builder.mutation<
      ApiResponse<ServiceRequest>,
      { id: string; data: UpdateStatusData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/requests/${id}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.ServiceRequest, id: 'ADMIN_LIST' },
        { type: API_TAGS.ServiceRequest, id: 'PENDING_COUNT' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          adminApi.util.updateQueryData('getRequestDetail', id, (draft) => {
            draft.data.status = data.status as typeof draft.data.status;
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    addInternalNote: builder.mutation<
      ApiResponse<void>,
      { id: string; data: AddInternalNoteData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/requests/${id}/internal-notes`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceRequest, id },
      ],
    }),

    requestAdditionalDocuments: builder.mutation<
      ApiResponse<void>,
      { id: string; data: RequestDocumentsData }
    >({
      query: ({ id, data }) => ({
        url: `/admin/requests/${id}/request-documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.ServiceRequest, id },
        { type: API_TAGS.Document, id: `REQUEST_${id}` },
        { type: API_TAGS.Notification, id: 'LIST' },
      ],
    }),

    getRequestStatistics: builder.query<ApiResponse<RequestStatisticsResult>, RequestStatistics>({
      query: (params) => ({
        url: '/admin/requests/stats/overview',
        params,
      }),
      providesTags: [{ type: API_TAGS.Report, id: 'REQUEST_STATS' }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    bulkUpdateStatus: builder.mutation<
      ApiResponse<void>,
      BulkUpdateStatusData
    >({
      query: (data) => ({
        url: '/admin/requests/bulk/update-status',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [
        { type: API_TAGS.ServiceRequest, id: 'ADMIN_LIST' },
        { type: API_TAGS.ServiceRequest, id: 'PENDING_COUNT' },
      ],
    }),

    exportRequests: builder.mutation<
      ApiResponse<{ url: string }>,
      { format: 'csv' | 'pdf'; filters?: Record<string, string | number> }
    >({
      query: ({ format, filters }) => ({
        url: `/admin/requests/export/${format}`,
        params: filters,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Trigger download
          if (data.data.url) {
            window.open(data.data.url, '_blank');
          }
        } catch (error) {
          console.error('Export failed:', error);
        }
      },
    }),

    // Audit Logs
    getAuditLogs: builder.query<
      PaginatedApiResponse<AuditLog[]>,
      AuditLogFilters
    >({
      query: (filters) => ({
        url: '/admin/audit-logs',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: API_TAGS.Report, id: 'AUDIT_LIST' },
            ]
          : [{ type: API_TAGS.Report, id: 'AUDIT_LIST' }],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetPendingCountQuery,
  useGetWorkloadDistributionQuery,
  useGetAllRequestsQuery,
  useLazyGetAllRequestsQuery,
  useGetRequestDetailQuery,
  useLazyGetRequestDetailQuery,
  useGetOperatorRequestsQuery,
  useAssignToOperatorMutation,
  useUpdateRequestStatusMutation,
  useAddInternalNoteMutation,
  useRequestAdditionalDocumentsMutation,
  useGetRequestStatisticsQuery,
  useBulkUpdateStatusMutation,
  useExportRequestsMutation,
  useGetAuditLogsQuery,
  useLazyGetAuditLogsQuery,
} = adminApi;

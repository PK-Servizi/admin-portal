/**
 * Reports & Analytics API
 * Handles all reporting and analytics endpoints
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse } from '@/types';

export interface DashboardMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalServiceRequests: number;
  activeSubscriptions: number;
  completionRate: number;
  averageResponseTime: number;
}

export interface ServiceRequestMetrics {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
  byPriority: Record<string, number>;
  completionRate: number;
  averageProcessingTime: number;
  trendData: Array<{ date: string; count: number }>;
}

export interface SubscriptionMetrics {
  total: number;
  byPlan: Record<string, number>;
  activeCount: number;
  cancelledCount: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
  trendData: Array<{ date: string; count: number }>;
}

export interface RevenueMetrics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  byServiceType: Record<string, number>;
  bySubscriptionPlan: Record<string, number>;
  trendData: Array<{ date: string; amount: number }>;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  byRole: Record<string, number>;
  registrationTrend: Array<{ date: string; count: number }>;
}

export interface UserActivityMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  topFeatures: Array<{ feature: string; usageCount: number }>;
}

export interface AppointmentAnalytics {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  byStatus: Record<string, number>;
  byMeetingType: Record<string, number>;
  utilizationRate: number;
  trendData: Array<{ date: string; count: number }>;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Overview
    getReportsDashboard: builder.query<ApiResponse<DashboardMetrics>, void>({
      query: () => '/reports/dashboard',
      providesTags: [{ type: API_TAGS.Report, id: 'DASHBOARD' }],
      keepUnusedDataFor: 120, // Cache for 2 minutes
    }),

    // Service Request Analytics
    getServiceRequestMetrics: builder.query<ApiResponse<ServiceRequestMetrics>, void>({
      query: () => '/reports/service-requests',
      providesTags: [{ type: API_TAGS.Report, id: 'SERVICE_REQUESTS' }],
      keepUnusedDataFor: 300,
    }),

    // Subscription Metrics
    getSubscriptionMetrics: builder.query<ApiResponse<SubscriptionMetrics>, void>({
      query: () => '/reports/subscriptions',
      providesTags: [{ type: API_TAGS.Report, id: 'SUBSCRIPTIONS' }],
      keepUnusedDataFor: 300,
    }),

    // Revenue Reports
    getRevenueReports: builder.query<ApiResponse<RevenueMetrics>, void>({
      query: () => '/reports/revenue',
      providesTags: [{ type: API_TAGS.Report, id: 'REVENUE' }],
      keepUnusedDataFor: 300,
    }),

    // User Statistics
    getUserStatistics: builder.query<ApiResponse<UserStatistics>, void>({
      query: () => '/reports/users',
      providesTags: [{ type: API_TAGS.Report, id: 'USER_STATS' }],
      keepUnusedDataFor: 300,
    }),

    // User Activity Metrics
    getUserActivityMetrics: builder.query<ApiResponse<UserActivityMetrics>, void>({
      query: () => '/reports/user-activity',
      providesTags: [{ type: API_TAGS.Report, id: 'USER_ACTIVITY' }],
      keepUnusedDataFor: 180,
    }),

    // Appointment Analytics
    getAppointmentAnalytics: builder.query<ApiResponse<AppointmentAnalytics>, void>({
      query: () => '/reports/appointments',
      providesTags: [{ type: API_TAGS.Report, id: 'APPOINTMENTS' }],
      keepUnusedDataFor: 300,
    }),

    // Export Report Data
    exportReportData: builder.mutation<ApiResponse<{ url: string }>, { reportType: string; format: string }>({
      query: (params) => ({
        url: '/reports/export',
        params,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data.data.url) {
            window.open(data.data.url, '_blank');
          }
        } catch (error) {
          console.error('Report export failed:', error);
        }
      },
    }),

    // Admin Dashboard Stats (alternative endpoint)
    getAdminDashboardStats: builder.query<ApiResponse<DashboardMetrics>, void>({
      query: () => '/admin/dashboard/stats',
      providesTags: [{ type: API_TAGS.Report, id: 'ADMIN_DASHBOARD' }],
      keepUnusedDataFor: 60,
    }),

    // Pending Requests Count
    getPendingRequestsCount: builder.query<ApiResponse<{ pending: number; missingDocuments: number; total: number }>, void>({
      query: () => '/admin/dashboard/pending-count',
      providesTags: [{ type: API_TAGS.Report, id: 'PENDING_COUNT' }],
      keepUnusedDataFor: 30,
      // Note: Enable polling in components with pollingInterval option
    }),

    // Operator Workload
    getOperatorWorkload: builder.query<ApiResponse<Array<{ operatorId: string; operatorName: string; requestCount: number }>>, void>({
      query: () => '/admin/dashboard/workload',
      providesTags: [{ type: API_TAGS.Report, id: 'WORKLOAD' }],
      keepUnusedDataFor: 60,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReportsDashboardQuery,
  useGetServiceRequestMetricsQuery,
  useGetSubscriptionMetricsQuery,
  useGetRevenueReportsQuery,
  useGetUserStatisticsQuery,
  useGetUserActivityMetricsQuery,
  useGetAppointmentAnalyticsQuery,
  useExportReportDataMutation,
  useGetAdminDashboardStatsQuery,
  useGetPendingRequestsCountQuery,
  useGetOperatorWorkloadQuery,
} = reportsApi;

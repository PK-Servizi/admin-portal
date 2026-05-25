/**
 * Back Office Admin API
 * Handles admin-side back office management: BO user creation, service assignment,
 * manual invoice creation, and BO-specific request filtering
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse, User } from '@/types';

// ============ Types ============

export interface BackOfficeCustomer {
  id: string;
  backOfficeUserId: string;
  fiscalCode: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  birthDate?: string;
  birthPlace?: string;
  citizenship?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  customerType: 'person' | 'company';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackOfficeUserService {
  id: string;
  userId: string;
  serviceId: string;
  service?: {
    id: string;
    name: string;
    serviceName?: string;
  };
}

export interface BackOfficeUser extends User {
  assignedServices?: BackOfficeUserService[];
  customerCount?: number;
}

export interface CreateBackOfficeUserData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  fiscalCode?: string;
  serviceIds: string[];
}

export interface UpdateBackOfficeServicesData {
  serviceIds: string[];
}

export interface CreateInvoiceData {
  backOfficeUserId: string;
  serviceRequestId?: string;
  amount: number;
  description?: string;
  notes?: string;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface BackOfficeInvoice {
  id: string;
  backOfficeUserId: string;
  backOfficeUser?: User;
  serviceRequestId?: string;
  amount: number;
  description?: string;
  notes?: string;
  status: 'pending' | 'paid' | 'cancelled';
  stripeCheckoutUrl?: string;
  stripeSessionId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  skip?: number;
  take?: number;
  status?: string;
  backOfficeUserId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BulkInvoiceData {
  backOfficeUserId: string;
  serviceRequestIds: string[];
  amounts: Record<string, number>;
  notes?: string;
}

export interface BackOfficeRequestFilters {
  skip?: number;
  take?: number;
  status?: string;
  backOfficeUserId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============ API ============

export const backofficeAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ──── BO User Management ────

    /** Create a new back office user with assigned services */
    createBackOfficeUser: builder.mutation<ApiResponse<User>, CreateBackOfficeUserData>({
      query: (data) => ({
        url: '/admin/backoffice-users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
    }),

    /** Get all back office users */
    getBackOfficeUsers: builder.query<PaginatedApiResponse<BackOfficeUser[]>, { skip?: number; take?: number; search?: string }>({
      query: (params) => ({
        url: '/users',
        params: { ...params, role: 'backoffice' },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.User, id })),
              { type: API_TAGS.User, id: 'BO_LIST' },
            ]
          : [{ type: API_TAGS.User, id: 'BO_LIST' }],
    }),

    /** Get a single BO user with their assigned services */
    getBackOfficeUser: builder.query<ApiResponse<BackOfficeUser>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.User, id }],
    }),

    /** Update service assignments for a BO user */
    updateBackOfficeServices: builder.mutation<
      ApiResponse<void>,
      { userId: string; data: UpdateBackOfficeServicesData }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/backoffice-users/${userId}/services`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: API_TAGS.User, id: userId },
        { type: API_TAGS.User, id: 'BO_LIST' },
        { type: API_TAGS.User, id: 'ADMIN_LIST' },
      ],
    }),

    /** Get assigned services for a BO user */
    getBackOfficeUserServices: builder.query<ApiResponse<BackOfficeUserService[]>, string>({
      query: (userId) => `/admin/backoffice-users/${userId}/services`,
      providesTags: (_result, _error, userId) => [
        { type: API_TAGS.Service, id: `BO_${userId}` },
      ],
    }),

    /** Get customers created by a BO user */
    getBackOfficeCustomers: builder.query<
      PaginatedApiResponse<BackOfficeCustomer[]>,
      { userId: string; skip?: number; take?: number; search?: string }
    >({
      query: ({ userId, ...params }) => ({
        url: `/admin/backoffice-users/${userId}/customers`,
        params,
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: API_TAGS.User, id: `BO_CUSTOMERS_${userId}` },
      ],
    }),

    // ──── Invoice Management ────

    /** Create a manual invoice for a BO user */
    createInvoice: builder.mutation<ApiResponse<BackOfficeInvoice>, CreateInvoiceData>({
      query: (data) => ({
        url: '/admin/invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: API_TAGS.Payment, id: 'INVOICE_LIST' },
      ],
    }),

    /** Send invoice (generate Stripe checkout link + send notification) */
    sendInvoice: builder.mutation<ApiResponse<BackOfficeInvoice>, string>({
      query: (invoiceId) => ({
        url: `/admin/invoices/${invoiceId}/send`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Payment, id },
        { type: API_TAGS.Payment, id: 'INVOICE_LIST' },
      ],
    }),

    /** Get all invoices (admin view) */
    getInvoices: builder.query<PaginatedApiResponse<BackOfficeInvoice[]>, InvoiceFilters>({
      query: (filters) => ({
        url: '/admin/invoices',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Payment, id })),
              { type: API_TAGS.Payment, id: 'INVOICE_LIST' },
            ]
          : [{ type: API_TAGS.Payment, id: 'INVOICE_LIST' }],
    }),

    /** Get single invoice detail */
    getInvoice: builder.query<ApiResponse<BackOfficeInvoice>, string>({
      query: (id) => `/admin/invoices/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.Payment, id }],
    }),

    /** Create bulk invoices for multiple requests */
    createBulkInvoice: builder.mutation<ApiResponse<BackOfficeInvoice[]>, BulkInvoiceData>({
      query: (data) => ({
        url: '/admin/invoices/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: API_TAGS.Payment, id: 'INVOICE_LIST' },
      ],
    }),

    // ──── BO Service Requests ────

    /** Get service requests submitted by back office users */
    getBackOfficeRequests: builder.query<PaginatedApiResponse<any[]>, BackOfficeRequestFilters>({
      query: (filters) => ({
        url: '/admin/requests',
        params: { ...filters, source: 'backoffice' },
      }),
      providesTags: [
        { type: API_TAGS.ServiceRequest, id: 'BO_REQUESTS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  // BO User Management
  useCreateBackOfficeUserMutation,
  useGetBackOfficeUsersQuery,
  useGetBackOfficeUserQuery,
  useUpdateBackOfficeServicesMutation,
  useGetBackOfficeUserServicesQuery,
  useGetBackOfficeCustomersQuery,
  // Invoice Management
  useCreateInvoiceMutation,
  useSendInvoiceMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateBulkInvoiceMutation,
  // BO Requests
  useGetBackOfficeRequestsQuery,
} = backofficeAdminApi;

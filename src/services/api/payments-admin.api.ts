/**
 * Payments Admin API
 * Handles payment administration and refund processing
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse, PaginatedApiResponse, Payment } from '@/types';

export interface PaymentFilters {
  skip?: number;
  take?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface RefundData {
  amount?: number; // Partial refund amount
  reason: string;
  notifyUser?: boolean;
}

export const paymentsAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payments (Admin)
    getAllPayments: builder.query<PaginatedApiResponse<Payment[]>, PaymentFilters>({
      query: (filters) => ({
        url: '/payments',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Payment, id })),
              { type: API_TAGS.Payment, id: 'ADMIN_LIST' },
            ]
          : [{ type: API_TAGS.Payment, id: 'ADMIN_LIST' }],
      keepUnusedDataFor: 120,
    }),

    // Process refund
    processRefund: builder.mutation<
      ApiResponse<Payment>,
      { id: string; data: RefundData }
    >({
      query: ({ id, data }) => ({
        url: `/payments/${id}/refund`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Payment, id },
        { type: API_TAGS.Payment, id: 'ADMIN_LIST' },
        { type: API_TAGS.Payment, id: 'LIST' },
      ],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          paymentsAdminApi.util.updateQueryData('getAllPayments', {}, (draft) => {
            const payment = draft.data.find((p) => p.id === id);
            if (payment) {
              payment.status = 'refunded' as typeof payment.status;
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
  }),
  overrideExisting: false,
});

export const {
  useGetAllPaymentsQuery,
  useLazyGetAllPaymentsQuery,
  useProcessRefundMutation,
} = paymentsAdminApi;

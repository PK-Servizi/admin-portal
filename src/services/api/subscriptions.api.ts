/**
 * Subscriptions & Payments API
 * Handles subscription plans, checkout, and payment history
 */

import { baseApi, API_TAGS } from './base.api';
import type {
  ApiResponse,
  PaginatedApiResponse,
  Subscription,
  SubscriptionPlan,
  Payment,
  CreateCheckoutSessionData,
  CheckoutSession,
} from '@/types';

export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscription plans (public)
    getSubscriptionPlans: builder.query<ApiResponse<SubscriptionPlan[]>, void>({
      query: () => '/subscription-plans',
      providesTags: [API_TAGS.SubscriptionPlan],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),

    // Get my current subscription
    getMySubscription: builder.query<ApiResponse<Subscription>, void>({
      query: () => '/subscriptions/my',
      providesTags: [API_TAGS.Subscription],
      keepUnusedDataFor: 60,
    }),

    // Get my subscription usage
    getMySubscriptionUsage: builder.query<
      ApiResponse<{
        serviceRequests: { used: number; limit: number };
        documents: { used: number; limit: number };
        appointments: { used: number; limit: number };
      }>,
      void
    >({
      query: () => '/subscriptions/my/usage',
      providesTags: [API_TAGS.Subscription],
      keepUnusedDataFor: 30,
    }),

    // Create checkout session
    createCheckoutSession: builder.mutation<ApiResponse<CheckoutSession>, CreateCheckoutSessionData>({
      query: (data) => ({
        url: '/subscriptions/checkout',
        method: 'POST',
        body: data,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Redirect to Stripe checkout
          window.location.href = data.data.url;
        } catch (error) {
          console.error('Checkout failed:', error);
        }
      },
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation<ApiResponse<Subscription>, void>({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.Subscription],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          subscriptionsApi.util.updateQueryData('getMySubscription', undefined, (draft) => {
            draft.data.status = 'cancelled' as any;
            draft.data.cancelledAt = new Date().toISOString();
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Upgrade subscription
    upgradeSubscription: builder.mutation<ApiResponse<CheckoutSession>, { planId: string }>({
      query: (data) => ({
        url: '/subscriptions/upgrade',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [API_TAGS.Subscription],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Redirect to Stripe checkout
          window.location.href = data.data.url;
        } catch (error) {
          console.error('Upgrade failed:', error);
        }
      },
    }),

    // Get my payment history
    getMyPayments: builder.query<
      PaginatedApiResponse<Payment[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/payments/my',
        params: { page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Payment, id })),
              { type: API_TAGS.Payment, id: 'LIST' },
            ]
          : [{ type: API_TAGS.Payment, id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),

    // Get payment by ID
    getPayment: builder.query<ApiResponse<Payment>, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.Payment, id }],
    }),

    // Get payment receipt
    getPaymentReceipt: builder.query<ApiResponse<{ url: string }>, string>({
      query: (id) => `/payments/${id}/receipt`,
    }),

    // Get payment invoice
    getPaymentInvoice: builder.query<ApiResponse<{ url: string }>, string>({
      query: (id) => `/payments/${id}/invoice`,
    }),

    // Resend payment receipt
    resendPaymentReceipt: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/payments/${id}/resend-receipt`,
        method: 'POST',
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          console.log('Receipt resent successfully');
        } catch (error) {
          console.error('Failed to resend receipt:', error);
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSubscriptionPlansQuery,
  useGetMySubscriptionQuery,
  useGetMySubscriptionUsageQuery,
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useUpgradeSubscriptionMutation,
  useGetMyPaymentsQuery,
  useGetPaymentQuery,
  useGetPaymentReceiptQuery,
  useGetPaymentInvoiceQuery,
  useResendPaymentReceiptMutation,
} = subscriptionsApi;

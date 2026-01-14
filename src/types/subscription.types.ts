/**
 * Subscription Types
 */

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits?: {
    serviceRequests?: number;
    documents?: number;
    appointments?: number;
    courses?: number;
  };
  isActive: boolean;
  isPopular?: boolean;
  stripePriceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  stripePaymentIntentId?: string;
  receiptUrl?: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutSessionData {
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

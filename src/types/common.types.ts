/**
 * Type Definitions
 * Proper types to replace 'any' throughout the codebase
 */

// Import Meta Environment
export interface ImportMetaEnv {
  VITE_API_URL?: string;
  VITE_API_BASE_URL?: string;
  DEV?: boolean;
  PROD?: boolean;
  MODE?: string;
}

// Performance types
export interface PerformanceInteraction {
  id: number;
  name: string;
  timestamp: number;
}

// Generic function types
export type AnyFunction = (...args: unknown[]) => unknown;
export type AsyncFunction<T = unknown, Args extends unknown[] = []> = (
  ...args: Args
) => Promise<T>;

// Component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Generic object type (for when we truly need dynamic keys)
export type GenericObject = Record<string, unknown>;
export type StringObject = Record<string, string>;
export type NumberObject = Record<string, number>;
export type BooleanObject = Record<string, boolean>;

// Filter and params types
export type FilterValue = string | number | boolean | Date | null | undefined;
export type FilterValues = Record<string, FilterValue>;

// Table types
export type CellValue = string | number | boolean | Date | null | undefined | React.ReactNode;
export type RowData = Record<string, CellValue>;

// API response types
export interface StripeCheckoutSession {
  id: string;
  object: string;
  amount_total: number;
  currency: string;
  customer: string;
  metadata: Record<string, string>;
  mode: string;
  payment_status: string;
  status: string;
  url?: string;
}

export interface StripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  currency: string;
  status: string;
  customer: string;
  metadata: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  object: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      id: string;
      price: {
        id: string;
        product: string;
      };
    }>;
  };
  metadata: Record<string, string>;
}

export interface StripeInvoice {
  id: string;
  object: string;
  customer: string;
  subscription: string;
  status: string;
  total: number;
  metadata: Record<string, string>;
}

// WebSocket/Event payload
export interface WebhookPayload<T = unknown> {
  id: string;
  object: string;
  type: string;
  data: {
    object: T;
  };
  created: number;
}

// User-related
export interface ExtendedProfileData {
  bio?: string;
  website?: string;
  company?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    notifications?: boolean;
    newsletter?: boolean;
    darkMode?: boolean;
  };
}

export interface GDPRConsentData {
  marketing?: boolean;
  analytics?: boolean;
  necessary?: boolean;
  timestamp?: string;
}

export interface AccountDeletionData {
  reason?: string;
  feedback?: string;
  requestedAt?: string;
}

// Memory performance
export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

// Validator types
export type ValidatorFunction<T = unknown> = (value: T) => ValidationResult;
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Form data
export type FormData = Record<string, FilterValue>;
export type FormErrors = Record<string, string>;

// Status types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'cancelled' | 'expired';
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';

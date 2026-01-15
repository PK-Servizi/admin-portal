/**
 * Application Constants
 * Centralized constant values used throughout the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'user_data',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_TIME: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    ALL: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  },
  MIME_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
  },
} as const;

// Status Values
export const STATUS = {
  SERVICE_REQUEST: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  },
  SUBSCRIPTION: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
  },
  PAYMENT: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  APPOINTMENT: {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  },
  DOCUMENT: {
    DRAFT: 'draft',
    PENDING_REVIEW: 'pending_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ARCHIVED: 'archived',
  },
} as const;

// Priority Levels
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  USER: 'user',
} as const;

// Permissions
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Service Requests
  SERVICE_REQUESTS_VIEW: 'service_requests:view',
  SERVICE_REQUESTS_CREATE: 'service_requests:create',
  SERVICE_REQUESTS_UPDATE: 'service_requests:update',
  SERVICE_REQUESTS_DELETE: 'service_requests:delete',
  SERVICE_REQUESTS_ASSIGN: 'service_requests:assign',
  
  // Subscriptions
  SUBSCRIPTIONS_VIEW: 'subscriptions:view',
  SUBSCRIPTIONS_CREATE: 'subscriptions:create',
  SUBSCRIPTIONS_UPDATE: 'subscriptions:update',
  SUBSCRIPTIONS_DELETE: 'subscriptions:delete',
  
  // Appointments
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_UPDATE: 'appointments:update',
  APPOINTMENTS_DELETE: 'appointments:delete',
  
  // Payments
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CREATE: 'payments:create',
  PAYMENTS_REFUND: 'payments:refund',
  
  // Documents
  DOCUMENTS_VIEW: 'documents:view',
  DOCUMENTS_UPLOAD: 'documents:upload',
  DOCUMENTS_DELETE: 'documents:delete',
  DOCUMENTS_APPROVE: 'documents:approve',
  
  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  
  // Audit
  AUDIT_VIEW: 'audit:view',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 3000,
  MEDIUM: 5000,
  LONG: 7000,
} as const;

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 1000,
  ADDRESS_MAX_LENGTH: 255,
  FISCAL_CODE_LENGTH: 16,
  VAT_NUMBER_LENGTH: 11,
} as const;

// Color Palette
export const COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  SUCCESS: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  DANGER: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  NEUTRAL: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Deep Orange
] as const;

// Time Intervals
export const TIME_INTERVALS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Responsive Breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Default Values
export const DEFAULTS = {
  CURRENCY: 'EUR',
  LOCALE: 'it-IT',
  TIMEZONE: 'Europe/Rome',
  LANGUAGE: 'it',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'The request timed out. Please try again.',
  SERVER: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully.',
  UPDATED: 'Updated successfully.',
  DELETED: 'Deleted successfully.',
  SAVED: 'Saved successfully.',
  SUBMITTED: 'Submitted successfully.',
  SENT: 'Sent successfully.',
} as const;

// Regex Patterns
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-+()]+$/,
  FISCAL_CODE: /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/,
  VAT_NUMBER: /^\d{11}$/,
  URL: /^https?:\/\/.+/,
  NUMERIC: /^\d+$/,
  ALPHA: /^[a-zA-Z]+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_PREFERENCES: 'table_preferences',
  FILTERS: 'app_filters',
  SORT: 'app_sort',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  DASHBOARD: '/dashboard',
  
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  
  SERVICE_REQUESTS: '/service-requests',
  SERVICE_REQUEST_DETAIL: '/service-requests/:id',
  SERVICE_REQUEST_CREATE: '/service-requests/new',
  
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_DETAIL: '/subscriptions/:id',
  
  APPOINTMENTS: '/appointments',
  APPOINTMENT_DETAIL: '/appointments/:id',
  
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments/:id',
  
  DOCUMENTS: '/documents',
  
  REPORTS: '/reports',
  
  SETTINGS: '/settings',
  PROFILE: '/profile',
  
  AUDIT: '/audit',
} as const;

// Menu Items
export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'home',
    route: ROUTES.DASHBOARD,
  },
  {
    key: 'users',
    label: 'Users',
    icon: 'users',
    route: ROUTES.USERS,
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    key: 'service-requests',
    label: 'Service Requests',
    icon: 'clipboard',
    route: ROUTES.SERVICE_REQUESTS,
    permission: PERMISSIONS.SERVICE_REQUESTS_VIEW,
  },
  {
    key: 'subscriptions',
    label: 'Subscriptions',
    icon: 'credit-card',
    route: ROUTES.SUBSCRIPTIONS,
    permission: PERMISSIONS.SUBSCRIPTIONS_VIEW,
  },
  {
    key: 'appointments',
    label: 'Appointments',
    icon: 'calendar',
    route: ROUTES.APPOINTMENTS,
    permission: PERMISSIONS.APPOINTMENTS_VIEW,
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: 'dollar-sign',
    route: ROUTES.PAYMENTS,
    permission: PERMISSIONS.PAYMENTS_VIEW,
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: 'file',
    route: ROUTES.DOCUMENTS,
    permission: PERMISSIONS.DOCUMENTS_VIEW,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'bar-chart',
    route: ROUTES.REPORTS,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'settings',
    route: ROUTES.SETTINGS,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
] as const;

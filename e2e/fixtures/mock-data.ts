/**
 * Mock API data fixtures for E2E tests
 */

export const API_BASE = '**/api/v1';

// ─── Auth ───────────────────────────────────────────────
export const mockLoginResponse = {
  success: true,
  data: {
    user: {
      id: 'user-1',
      email: 'admin@pkservizi.com',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      role: { id: 'role-1', name: 'super_admin' },
      isActive: true,
    },
    accessToken: 'mock-access-token-xyz',
    refreshToken: 'mock-refresh-token-xyz',
  },
};

export const mockCurrentUser = {
  success: true,
  data: {
    id: 'user-1',
    email: 'admin@pkservizi.com',
    firstName: 'Admin',
    lastName: 'User',
    fullName: 'Admin User',
    role: { id: 'role-1', name: 'super_admin' },
    permissions: [
      'users:read', 'users:create', 'users:update', 'users:delete',
      'service_requests:read', 'service_requests:update',
      'appointments:read', 'appointments:create', 'appointments:update',
      'payments:read', 'payments:refund',
      'subscriptions:read', 'subscriptions:update',
      'courses:read', 'courses:create', 'courses:update', 'courses:delete',
      'notifications:read', 'notifications:create', 'notifications:send',
      'reports:read', 'reports:export',
      'faqs:read', 'faqs:create', 'faqs:update', 'faqs:delete',
      'roles:read', 'roles:create', 'roles:update',
      'documents:read', 'documents:review',
      'audit:read',
    ],
    isActive: true,
  },
};

// ─── Dashboard ──────────────────────────────────────────
export const mockDashboardStats = {
  success: true,
  data: {
    totalUsers: 1250,
    totalServiceRequests: 342,
    pendingRequests: 45,
    completedToday: 12,
    revenue: { today: 1530, thisMonth: 28400, thisYear: 245000 },
  },
};

export const mockPendingCount = {
  success: true,
  data: { pending: 45, missingDocuments: 8, total: 53 },
};

export const mockWorkload = {
  success: true,
  data: [
    { operatorId: 'op-1', operatorName: 'Mario Rossi', requestCount: 15 },
    { operatorId: 'op-2', operatorName: 'Luigi Bianchi', requestCount: 10 },
  ],
};

// ─── Users ──────────────────────────────────────────────
export const mockUsers = {
  success: true,
  data: [
    {
      id: 'user-1', email: 'admin@pkservizi.com', firstName: 'Admin', lastName: 'User',
      fullName: 'Admin User', phone: '+39 012 345 6789', isActive: true,
      role: { id: 'role-1', name: 'super_admin' }, createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'user-2', email: 'maria@example.com', firstName: 'Maria', lastName: 'Rossi',
      fullName: 'Maria Rossi', phone: '+39 333 111 2222', isActive: true,
      role: { id: 'role-3', name: 'customer' }, createdAt: '2025-02-20T14:30:00Z',
    },
    {
      id: 'user-3', email: 'carlo@example.com', firstName: 'Carlo', lastName: 'Verdi',
      fullName: 'Carlo Verdi', phone: '+39 333 444 5555', isActive: false,
      role: { id: 'role-3', name: 'customer' }, createdAt: '2025-03-01T09:00:00Z',
    },
  ],
  pagination: { total: 3, page: 1, limit: 20, pages: 1 },
};

export const mockUserDetail = {
  success: true,
  data: {
    id: 'user-2', email: 'maria@example.com', firstName: 'Maria', lastName: 'Rossi',
    fullName: 'Maria Rossi', phone: '+39 333 111 2222', isActive: true, fiscalCode: 'RSSMRA90A01H501Z',
    role: { id: 'role-3', name: 'customer' }, createdAt: '2025-02-20T14:30:00Z',
    address: 'Via Roma 123, Milano',
  },
};

export const mockRoles = {
  success: true,
  data: [
    { id: 'role-1', name: 'super_admin', description: 'Full access', permissions: [] },
    { id: 'role-2', name: 'operator', description: 'Operator access', permissions: [] },
    { id: 'role-3', name: 'customer', description: 'Customer access', permissions: [] },
  ],
};

// ─── Service Requests ───────────────────────────────────
export const mockServiceRequests = {
  success: true,
  data: [
    {
      id: 'sr-1', status: 'pending', priority: 'high',
      user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi', email: 'maria@example.com' },
      serviceType: { id: 'st-1', name: 'Residence Permit', slug: 'residence-permit' },
      createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z',
    },
    {
      id: 'sr-2', status: 'in_progress', priority: 'medium',
      user: { id: 'user-3', firstName: 'Carlo', lastName: 'Verdi', email: 'carlo@example.com' },
      serviceType: { id: 'st-2', name: 'Work Visa', slug: 'work-visa' },
      assignedOperator: { id: 'op-1', firstName: 'Mario', lastName: 'Rossi' },
      createdAt: '2025-05-15T14:30:00Z', updatedAt: '2025-06-02T09:00:00Z',
    },
  ],
  pagination: { total: 2, page: 1, limit: 20, pages: 1 },
};

export const mockServiceRequestDetail = {
  success: true,
  data: {
    id: 'sr-1', status: 'pending', priority: 'high',
    user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi', email: 'maria@example.com' },
    serviceType: { id: 'st-1', name: 'Residence Permit', slug: 'residence-permit' },
    documents: [], internalNotes: [], timeline: [],
    createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z',
  },
};

// ─── Appointments ───────────────────────────────────────
export const mockAppointments = {
  success: true,
  data: [
    {
      id: 'apt-1', title: 'Consultation - Maria Rossi',
      startTime: '2025-06-15T09:00:00Z', endTime: '2025-06-15T10:00:00Z',
      status: 'scheduled', meetingType: 'in_person',
      user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi' },
      notes: 'Document review appointment',
    },
    {
      id: 'apt-2', title: 'Video Call - Carlo Verdi',
      startTime: '2025-06-16T14:00:00Z', endTime: '2025-06-16T15:00:00Z',
      status: 'confirmed', meetingType: 'video_call',
      user: { id: 'user-3', firstName: 'Carlo', lastName: 'Verdi' },
    },
  ],
};

// ─── Payments ───────────────────────────────────────────
export const mockPayments = {
  success: true,
  data: [
    {
      id: 'pay-1', amount: 15000, currency: 'EUR', status: 'succeeded',
      paymentMethod: 'card', stripePaymentIntentId: 'pi_test_001',
      userId: 'user-2', user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi' },
      description: 'Residence Permit Service', createdAt: '2025-06-01T10:00:00Z',
    },
    {
      id: 'pay-2', amount: 5000, currency: 'EUR', status: 'pending',
      paymentMethod: 'bank_transfer', stripePaymentIntentId: 'pi_test_002',
      userId: 'user-3', user: { id: 'user-3', firstName: 'Carlo', lastName: 'Verdi' },
      description: 'Work Visa Service', createdAt: '2025-06-02T14:30:00Z',
    },
  ],
  pagination: { total: 2, page: 1, limit: 20, pages: 1 },
};

// ─── Subscriptions ──────────────────────────────────────
export const mockSubscriptions = {
  success: true,
  data: [
    {
      id: 'sub-1', status: 'active', userId: 'user-2',
      user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi', email: 'maria@example.com' },
      plan: { id: 'plan-1', name: 'Premium', code: 'premium', price: 2999 },
      startDate: '2025-01-01T00:00:00Z', endDate: '2026-01-01T00:00:00Z',
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  pagination: { total: 1, page: 1, limit: 20, pages: 1 },
};

export const mockSubscriptionPlans = {
  success: true,
  data: [
    {
      id: 'plan-1', name: 'Basic', code: 'basic', description: 'Basic plan',
      price: 999, interval: 'monthly', features: ['Feature 1'], limits: {},
      isActive: true, createdAt: '2025-01-01T00:00:00Z',
    },
    {
      id: 'plan-2', name: 'Premium', code: 'premium', description: 'Premium plan',
      price: 2999, interval: 'monthly', features: ['Feature 1', 'Feature 2', 'Feature 3'],
      limits: {}, isActive: true, createdAt: '2025-01-01T00:00:00Z',
    },
  ],
};

// ─── Courses ────────────────────────────────────────────
export const mockCourses = {
  success: true,
  data: [
    {
      id: 'course-1', title: 'Italian Language A1', description: 'Beginner Italian',
      status: 'published', price: 19900, duration: 30, category: 'language',
      instructor: 'Prof. Rossi', enrollmentCount: 25, maxEnrollments: 50,
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'course-2', title: 'Integration Course', description: 'Cultural integration',
      status: 'draft', price: 0, duration: 20, category: 'integration',
      instructor: 'Dr. Bianchi', enrollmentCount: 0, maxEnrollments: 30,
      createdAt: '2025-03-01T09:00:00Z',
    },
  ],
  pagination: { total: 2, page: 1, limit: 20, pages: 1 },
};

// ─── Notifications ──────────────────────────────────────
export const mockNotifications = {
  success: true,
  data: [
    {
      id: 'notif-1', title: 'Welcome', message: 'Welcome to PK Servizi',
      type: 'info', isRead: false, userId: 'user-2', createdAt: '2025-06-01T10:00:00Z',
    },
    {
      id: 'notif-2', title: 'Document Approved', message: 'Your ID document was approved',
      type: 'success', isRead: true, userId: 'user-2', createdAt: '2025-05-28T14:00:00Z',
    },
  ],
};

// ─── Reports ────────────────────────────────────────────
export const mockRevenueReports = {
  success: true,
  data: {
    total: 245000, today: 1530, thisWeek: 8200, thisMonth: 28400, thisYear: 245000,
    byServiceType: { 'Residence Permit': 120000, 'Work Visa': 80000, 'Other': 45000 },
    bySubscriptionPlan: { Premium: 150000, Basic: 95000 },
    trendData: [
      { date: '2025-05-01', amount: 8000 },
      { date: '2025-05-08', amount: 9500 },
      { date: '2025-05-15', amount: 7200 },
      { date: '2025-05-22', amount: 11000 },
      { date: '2025-05-29', amount: 10500 },
      { date: '2025-06-01', amount: 12000 },
    ],
  },
};

export const mockServiceRequestMetrics = {
  success: true,
  data: {
    total: 342,
    byStatus: { pending: 45, in_progress: 120, completed: 150, cancelled: 27 },
    byServiceType: { 'Residence Permit': 140, 'Work Visa': 95, 'Family Reunion': 62, 'Other': 45 },
    byPriority: { high: 50, medium: 180, low: 112 },
    completionRate: 0.72, averageProcessingTime: 5.2,
    trendData: [
      { date: '2025-06-07', count: 12 },
      { date: '2025-06-08', count: 19 },
      { date: '2025-06-09', count: 15 },
      { date: '2025-06-10', count: 22 },
      { date: '2025-06-11', count: 18 },
      { date: '2025-06-12', count: 8 },
      { date: '2025-06-13', count: 5 },
    ],
  },
};

export const mockUserStatistics = {
  success: true,
  data: {
    total: 1250, active: 980, inactive: 270, newThisMonth: 45,
    byRole: { customer: 1100, operator: 140, admin: 10 },
    registrationTrend: [
      { date: '2025-01-01', count: 30 }, { date: '2025-02-01', count: 42 },
      { date: '2025-03-01', count: 55 }, { date: '2025-04-01', count: 38 },
      { date: '2025-05-01', count: 50 }, { date: '2025-06-01', count: 45 },
    ],
  },
};

export const mockSubscriptionMetrics = {
  success: true,
  data: {
    total: 450, byPlan: { Basic: 200, Premium: 250 },
    activeCount: 420, cancelledCount: 30, churnRate: 0.066,
    monthlyRecurringRevenue: 12450,
    trendData: [{ date: '2025-05-01', count: 400 }, { date: '2025-06-01', count: 450 }],
  },
};

// ─── Audit Logs ─────────────────────────────────────────
export const mockAuditLogs = {
  success: true,
  data: [
    {
      id: 'log-1', action: 'create', resource: 'user', resourceId: 'user-3',
      userId: 'user-1', userEmail: 'admin@pkservizi.com',
      details: { email: 'carlo@example.com' }, ipAddress: '192.168.1.1',
      createdAt: '2025-06-13T10:00:00Z',
    },
    {
      id: 'log-2', action: 'update', resource: 'service_request', resourceId: 'sr-1',
      userId: 'user-1', userEmail: 'admin@pkservizi.com',
      details: { status: 'in_progress' }, ipAddress: '192.168.1.1',
      createdAt: '2025-06-13T09:30:00Z',
    },
  ],
  pagination: { total: 2, page: 1, limit: 50, pages: 1 },
};

// ─── Service Types ──────────────────────────────────────
export const mockServiceTypes = {
  success: true,
  data: [
    { id: 'st-1', name: 'Residence Permit', slug: 'residence-permit', isActive: true },
    { id: 'st-2', name: 'Work Visa', slug: 'work-visa', isActive: true },
    { id: 'st-3', name: 'Family Reunion', slug: 'family-reunion', isActive: true },
  ],
};

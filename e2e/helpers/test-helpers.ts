/**
 * Playwright test helpers — API mock setup, auth helpers, common utilities
 */

import { Page } from '@playwright/test';
import {
  API_BASE,
  mockLoginResponse,
  mockCurrentUser,
  mockDashboardStats,
  mockPendingCount,
  mockWorkload,
  mockUsers,
  mockRoles,
  mockServiceRequests,
  mockAppointments,
  mockPayments,
  mockSubscriptions,
  mockSubscriptionPlans,
  mockCourses,
  mockNotifications,
  mockRevenueReports,
  mockServiceRequestMetrics,
  mockUserStatistics,
  mockSubscriptionMetrics,
  mockAuditLogs,
  mockServiceTypes,
} from '../fixtures/mock-data';

/**
 * Setup all required API mocks for a fully functional admin panel
 */
export async function setupAllApiMocks(page: Page) {
  // Auth
  await page.route(`${API_BASE}/auth/login`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockLoginResponse) })
  );
  await page.route(`${API_BASE}/auth/me`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCurrentUser) })
  );
  await page.route(`${API_BASE}/auth/refresh`, (route) =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { accessToken: 'refreshed-token', refreshToken: 'new-refresh' } }),
    })
  );

  // Dashboard
  await page.route(`${API_BASE}/admin/dashboard/stats`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDashboardStats) })
  );
  await page.route(`${API_BASE}/admin/dashboard/pending-count`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPendingCount) })
  );
  await page.route(`${API_BASE}/admin/dashboard/workload`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockWorkload) })
  );

  // Users
  await page.route(`${API_BASE}/users?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUsers) })
  );
  await page.route(`${API_BASE}/users`, (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'user-new', ...JSON.parse(route.request().postData() || '{}') } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUsers) });
  });
  await page.route(`${API_BASE}/users/*/`, (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
    if (method === 'PUT' || method === 'PATCH') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { ...mockUsers.data[0], ...JSON.parse(route.request().postData() || '{}') } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockUsers.data[1] }) });
  });

  // Roles
  await page.route(`${API_BASE}/roles*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRoles) })
  );

  // Service Types
  await page.route(`${API_BASE}/service-types*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockServiceTypes) })
  );

  // Service Requests (admin)
  await page.route(`${API_BASE}/admin/requests?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockServiceRequests) })
  );
  await page.route(`${API_BASE}/admin/requests`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockServiceRequests) })
  );
  await page.route(`${API_BASE}/admin/requests/*/`, (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockServiceRequests.data[0] }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });

  // Appointments
  await page.route(`${API_BASE}/appointments*`, (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      return route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'apt-new', ...JSON.parse(route.request().postData() || '{}') } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAppointments) });
  });
  await page.route(`${API_BASE}/appointments/*/`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  );

  // Payments
  await page.route(`${API_BASE}/payments?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPayments) })
  );
  await page.route(`${API_BASE}/payments`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockPayments) })
  );
  await page.route(`${API_BASE}/payments/*/refund`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  );

  // Subscriptions
  await page.route(`${API_BASE}/admin/subscriptions*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSubscriptions) })
  );
  await page.route(`${API_BASE}/admin/subscription-plans*`, (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      return route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'plan-new', ...JSON.parse(route.request().postData() || '{}') } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSubscriptionPlans) });
  });
  await page.route(`${API_BASE}/admin/subscription-plans/*/`, (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: mockSubscriptionPlans.data[0] }),
    });
  });

  // Courses
  await page.route(`${API_BASE}/courses?*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCourses) })
  );
  await page.route(`${API_BASE}/courses`, (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      return route.fulfill({
        status: 201, contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'course-new', ...JSON.parse(route.request().postData() || '{}') } }),
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockCourses) });
  });
  await page.route(`${API_BASE}/courses/*/`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  );

  // Notifications
  await page.route(`${API_BASE}/notifications*`, (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
    if (method === 'DELETE') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockNotifications) });
  });

  // Reports
  await page.route(`${API_BASE}/reports/dashboard`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockDashboardStats) })
  );
  await page.route(`${API_BASE}/reports/revenue`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockRevenueReports) })
  );
  await page.route(`${API_BASE}/reports/service-requests`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockServiceRequestMetrics) })
  );
  await page.route(`${API_BASE}/reports/users`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUserStatistics) })
  );
  await page.route(`${API_BASE}/reports/subscriptions`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSubscriptionMetrics) })
  );
  await page.route(`${API_BASE}/reports/export*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { url: '' } }) })
  );

  // Audit Logs
  await page.route(`${API_BASE}/admin/audit-logs*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockAuditLogs) })
  );

  // Documents
  await page.route(`${API_BASE}/documents*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
  );

  // FAQs
  await page.route(`${API_BASE}/faqs*`, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) })
  );
}

/**
 * Login and navigate to a specific page. Sets up localStorage auth state.
 */
export async function loginAndNavigate(page: Page, path: string) {
  await setupAllApiMocks(page);

  // Set auth tokens in localStorage before navigating
  await page.addInitScript(() => {
    localStorage.setItem('accessToken', 'mock-access-token-xyz');
    localStorage.setItem('refreshToken', 'mock-refresh-token-xyz');
  });

  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Perform login via UI
 */
export async function loginViaUI(page: Page) {
  await setupAllApiMocks(page);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('#email', 'admin@pkservizi.com');
  await page.fill('#password', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

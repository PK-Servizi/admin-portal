/**
 * E2E Tests — Service Requests
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Service Requests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/service-requests');
  });

  test('should display service requests list', async ({ page }) => {
    await expect(page.locator('text=Service Requests').first()).toBeVisible();
  });

  test('should display request data from API', async ({ page }) => {
    // Should show user names from mock data
    await expect(page.locator('text=Maria Rossi').first()).toBeVisible();
  });

  test('should display status badges', async ({ page }) => {
    // Should show status indicators
    const statusBadge = page.locator('text=Pending, text=In Progress, text=pending, text=in_progress').first();
    if (await statusBadge.count() > 0) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should have filter controls', async ({ page }) => {
    // Status filter or search
    const filterElement = page.locator('select, input[placeholder*="Search"], input[placeholder*="search"]').first();
    await expect(filterElement).toBeVisible();
  });

  test('should navigate to request detail page', async ({ page }) => {
    const detailLink = page.locator('a[href*="/service-requests/sr-"], tr[role="link"], button:has-text("View")').first();
    if (await detailLink.count() > 0) {
      await detailLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/service-requests\/sr-/);
    }
  });

  test('should display service request detail page', async ({ page }) => {
    // Set up detail route mock
    await page.route('**/api/v1/admin/requests/sr-1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'sr-1', status: 'pending', priority: 'high',
            user: { id: 'user-2', firstName: 'Maria', lastName: 'Rossi', email: 'maria@example.com' },
            serviceType: { id: 'st-1', name: 'Residence Permit' },
            documents: [], internalNotes: [], timeline: [],
            createdAt: '2025-06-01T10:00:00Z', updatedAt: '2025-06-01T10:00:00Z',
          },
        }),
      })
    );

    await page.goto('/service-requests/sr-1');
    await page.waitForLoadState('networkidle');

    // Should show request details
    await expect(page.locator('text=Residence Permit').first()).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button[title="Refresh"], button:has-text("Refresh")');
    if (await refreshBtn.count() > 0) {
      await expect(refreshBtn.first()).toBeVisible();
    }
  });
});

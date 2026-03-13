/**
 * E2E Tests — Dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');
  });

  test('should display dashboard page with header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should display stat cards with real data', async ({ page }) => {
    // Total Users from mock: 1250
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=1,250')).toBeVisible();

    // Service Requests from mock: 342
    await expect(page.getByText('Service Requests').first()).toBeVisible();
    await expect(page.getByText('342').first()).toBeVisible();

    // Pending Requests from mock: 45
    await expect(page.getByText('Pending Requests').first()).toBeVisible();
    await expect(page.getByText('45').first()).toBeVisible();

    // Completed Today from mock: 12
    await expect(page.getByText('Completed Today').first()).toBeVisible();
  });

  test('should display revenue stats', async ({ page }) => {
    await expect(page.locator("text=Today's Revenue")).toBeVisible();
    await expect(page.locator('text=This Month')).toBeVisible();
    await expect(page.locator('text=This Year')).toBeVisible();
  });

  test('should display quick action cards', async ({ page }) => {
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Pending Requests').first()).toBeVisible();
    await expect(page.locator('text=Missing Documents')).toBeVisible();
  });

  test('should display revenue chart', async ({ page }) => {
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
    // Recharts renders SVG
    const chart = page.locator('.recharts-responsive-container').first();
    await expect(chart).toBeVisible();
  });

  test('should display requests by status chart', async ({ page }) => {
    await expect(page.locator('text=Requests by Status')).toBeVisible();
  });

  test('should display operator workload section', async ({ page }) => {
    await expect(page.locator('text=Operator Workload Distribution')).toBeVisible();
    // Mock operators
    await expect(page.locator('text=Mario Rossi')).toBeVisible();
    await expect(page.locator('text=Luigi Bianchi')).toBeVisible();
  });

  test('should display recent activity from audit logs', async ({ page }) => {
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should navigate to users page via stat card link', async ({ page }) => {
    await page.locator('a[href="/users"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/users/);
  });
});

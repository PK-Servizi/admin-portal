/**
 * E2E Tests — Back Office Management
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Back Office Users', () => {
  test('should navigate to backoffice page and show users list', async ({ page }) => {
    await loginAndNavigate(page, '/backoffice');

    await expect(page.getByRole('heading', { name: /back office/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show search input on backoffice list', async ({ page }) => {
    await loginAndNavigate(page, '/backoffice');

    const searchInput = page.getByPlaceholder('Search by name or email...');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to backoffice user detail', async ({ page }) => {
    // Mock the specific user endpoint for BO user
    await page.route('**/api/v1/users/bo-1', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'bo-1', email: 'agency1@tuocaf.com', firstName: 'Agency', lastName: 'One',
            fullName: 'Agency One', isActive: true, role: { id: 'role-bo', name: 'backoffice' },
          },
        }),
      })
    );

    await loginAndNavigate(page, '/backoffice/bo-1');
    await expect(page.getByText('agency1@tuocaf.com')).toBeVisible({ timeout: 10000 });
  });

  test('should show backoffice menu item in sidebar', async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');

    await expect(page.getByText('Back Office')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Back Office Invoice Creation', () => {
  test('should navigate to create invoice page', async ({ page }) => {
    await loginAndNavigate(page, '/backoffice/bo-1/invoices/new');

    await expect(page.getByRole('heading', { name: 'Create Invoice' })).toBeVisible({ timeout: 10000 });
  });
});

/**
 * E2E Tests — Authentication & Login
 */

import { test, expect } from '@playwright/test';
import { setupAllApiMocks, loginAndNavigate } from './helpers/test-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await setupAllApiMocks(page);
  });

  test('should show login page with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'admin@pkservizi.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Override login mock to return error
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
      })
    );

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Don't set auth tokens
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/login/);
  });

  test('should maintain auth state after page reload', async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');

    // Reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard, not redirected to login
    await expect(page).not.toHaveURL(/login/);
  });
});

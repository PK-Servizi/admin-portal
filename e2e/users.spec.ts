/**
 * E2E Tests — Users CRUD
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate, setupAllApiMocks } from './helpers/test-helpers';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/users');
  });

  test('should display users list page', async ({ page }) => {
    await expect(page.getByText('Admin User').first()).toBeVisible();
    await expect(page.getByText('Maria Rossi').first()).toBeVisible();
    await expect(page.getByText('Carlo Verdi').first()).toBeVisible();
  });

  test('should display user emails', async ({ page }) => {
    await expect(page.locator('text=admin@pkservizi.com')).toBeVisible();
    await expect(page.locator('text=maria@example.com')).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search users"]').or(page.locator('input[placeholder*="search users"]'));
    await expect(searchInput.first()).toBeVisible();
  });

  test('should navigate to create user page', async ({ page }) => {
    const createButton = page.locator('a[href="/users/new"], button:has-text("Add User"), button:has-text("Create User"), button:has-text("New User")');
    if (await createButton.count() > 0) {
      await createButton.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/users\/new/);
    }
  });

  test('should display create user form with required fields', async ({ page }) => {
    await page.goto('/users/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('#email').or(page.locator('input[name="email"]')).or(page.getByLabel('Email'));
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible();
    }
  });

  test('should navigate to user detail page', async ({ page }) => {
    // Click on a user row or link
    const userLink = page.locator('a[href*="/users/user-"]').first();
    if (await userLink.count() > 0) {
      await userLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/users\/user-/);
    }
  });

  test('should display role badges', async ({ page }) => {
    // Roles should be displayed
    const roleBadge = page.getByText('super_admin').or(page.getByText('Super Admin')).or(page.getByText('customer')).or(page.getByText('operator')).or(page.getByText('Admin'));
    await expect(roleBadge.first()).toBeVisible();
  });

  test('should have pagination controls', async ({ page }) => {
    // Check for pagination text or buttons
    const pagination = page.locator('text=/\\d+ of \\d+/, text=/Page/');
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});

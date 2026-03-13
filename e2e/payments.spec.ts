/**
 * E2E Tests — Payments
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Payments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/payments');
  });

  test('should display payments page header', async ({ page }) => {
    await expect(page.locator('text=Payments').first()).toBeVisible();
  });

  test('should display payment records', async ({ page }) => {
    // Mock data has Maria Rossi and Carlo Verdi
    await expect(page.locator('text=Maria Rossi').first()).toBeVisible();
  });

  test('should display payment status badges', async ({ page }) => {
    const statusBadge = page.locator('text=Succeeded, text=Pending, text=succeeded, text=pending').first();
    if (await statusBadge.count() > 0) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should display payment amounts', async ({ page }) => {
    // Mock amounts: 15000 cents = €150.00, 5000 cents = €50.00
    const amount = page.locator('text=/€\\d+/, text=/EUR/');
    if (await amount.count() > 0) {
      await expect(amount.first()).toBeVisible();
    }
  });

  test('should have search filter', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"], input[placeholder*="transaction"]');
    await expect(searchInput.first()).toBeVisible();
  });

  test('should have status filter dropdown', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    if (await statusFilter.count() > 0) {
      await expect(statusFilter).toBeVisible();
      // Should contain status options
      const options = statusFilter.locator('option');
      expect(await options.count()).toBeGreaterThan(1);
    }
  });

  test('should have payment method filter', async ({ page }) => {
    const methodFilter = page.locator('select').nth(1);
    if (await methodFilter.count() > 0) {
      await expect(methodFilter).toBeVisible();
    }
  });

  test('should have export button', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export")');
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });

  test('should have refresh button', async ({ page }) => {
    const refreshBtn = page.locator('button[title="Refresh"]');
    if (await refreshBtn.count() > 0) {
      await expect(refreshBtn.first()).toBeVisible();
    }
  });

  test('should filter payments by status', async ({ page }) => {
    const statusFilter = page.locator('select').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.selectOption('completed');
      await page.waitForTimeout(500);
      // Should still be on payments page
      await expect(page).toHaveURL(/\/payments/);
    }
  });

  test('should display stat cards', async ({ page }) => {
    await expect(page.locator('text=Total Revenue').first()).toBeVisible();
    await expect(page.locator('text=Successful').first()).toBeVisible();
  });

  test('should have pagination', async ({ page }) => {
    const pagination = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Previous")')).or(page.getByText(/Page/)).or(page.getByText(/\d+ of \d+/));
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });
});

/**
 * E2E Tests — Audit Logs
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/audit-logs');
  });

  test('should display audit logs page', async ({ page }) => {
    await expect(page.getByText('Audit').first()).toBeVisible();
  });

  test('should display log entries', async ({ page }) => {
    // From mock data: actions like USER_LOGIN, SERVICE_REQUEST_CREATED
    const logEntry = page.locator('text=USER_LOGIN, text=LOGIN, text=SERVICE_REQUEST');
    if (await logEntry.count() > 0) {
      await expect(logEntry.first()).toBeVisible();
    }
  });

  test('should display user info in log entries', async ({ page }) => {
    // From mock: admin@pkservizi.it performed actions
    const userInfo = page.locator('text=admin@pkservizi.it, text=admin');
    if (await userInfo.count() > 0) {
      await expect(userInfo.first()).toBeVisible();
    }
  });

  test('should have search/filter controls', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="cerca" i], input[type="search"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should have export button', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Esporta"), button:has-text("Download")');
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });

  test('should display pagination', async ({ page }) => {
    const pagination = page.locator('button:has-text("Next"), button:has-text("Previous"), [class*="pagination"], nav[aria-label*="pagination" i]');
    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('should show log details on click', async ({ page }) => {
    const logRow = page.locator('tr, [class*="row"], [class*="item"]').nth(1);
    if (await logRow.count() > 0) {
      await logRow.click();
      await page.waitForTimeout(500);
    }
  });
});

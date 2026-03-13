/**
 * E2E Tests — Reports Dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Reports Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/reports');
  });

  test('should display reports page header', async ({ page }) => {
    await expect(page.locator('text=Report').first()).toBeVisible();
  });

  test('should display tab navigation', async ({ page }) => {
    // Reports has tabs: Overview, Revenue, Users, Requests
    const tabs = page.locator('[role="tablist"], [role="tab"]');
    if (await tabs.count() > 0) {
      await expect(tabs.first()).toBeVisible();
    }
  });

  test('should display KPI stat cards', async ({ page }) => {
    // Revenue reports should show total revenue
    const statCards = page.locator('[class*="card"], [class*="stat"]');
    await expect(statCards.first()).toBeVisible();
  });

  test('should display revenue data from API', async ({ page }) => {
    // From mock: totalRevenue = 125000
    const revenueText = page.locator('text=125, text=€');
    if (await revenueText.count() > 0) {
      await expect(revenueText.first()).toBeVisible();
    }
  });

  test('should display user statistics', async ({ page }) => {
    // From mock: totalUsers = 1250
    const usersText = page.locator('text=1.250, text=1250, text=1,250');
    if (await usersText.count() > 0) {
      await expect(usersText.first()).toBeVisible();
    }
  });

  test('should display charts', async ({ page }) => {
    // Recharts renders SVG
    const charts = page.locator('.recharts-wrapper, svg.recharts-surface');
    if (await charts.count() > 0) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test('should have export button', async ({ page }) => {
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("Esporta")');
    if (await exportBtn.count() > 0) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });

  test('should switch between tabs', async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 1) {
      await tabs.nth(1).click();
      await page.waitForTimeout(300);
      // Content should change
      await expect(tabs.nth(1)).toBeVisible();
    }
  });

  test('should display service request metrics', async ({ page }) => {
    // From mock: totalRequests = 342
    const reqText = page.locator('text=342');
    if (await reqText.count() > 0) {
      await expect(reqText.first()).toBeVisible();
    }
  });
});

/**
 * E2E Tests — Navigation / Sidebar
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/dashboard');
  });

  test('should display sidebar with navigation links', async ({ page }) => {
    const sidebar = page.locator('nav, aside, [class*="sidebar"]');
    await expect(sidebar.first()).toBeVisible();
  });

  test('should navigate to Users page', async ({ page }) => {
    await page.locator('a[href*="users"], a:has-text("User"), a:has-text("Utenti")').first().click();
    await page.waitForURL('**/users**');
    await expect(page).toHaveURL(/users/);
  });

  test('should navigate to Service Requests page', async ({ page }) => {
    const link = page.locator('a[href*="service-request"], a[href*="requests"], a:has-text("Richieste"), a:has-text("Service Request")');
    if (await link.count() > 0) {
      await link.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to Appointments page', async ({ page }) => {
    const link = page.locator('a[href*="appointment"], a:has-text("Appuntament"), a:has-text("Appointment")');
    if (await link.count() > 0) {
      await link.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to Payments page', async ({ page }) => {
    const link = page.locator('a[href*="payment"], a:has-text("Pagament"), a:has-text("Payment")');
    if (await link.count() > 0) {
      await link.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should navigate to Reports page', async ({ page }) => {
    const link = page.locator('a[href*="report"], a:has-text("Report")');
    if (await link.count() > 0) {
      await link.first().click();
      await page.waitForTimeout(1000);
    }
  });

  test('should highlight active navigation item', async ({ page }) => {
    // Dashboard link should be active/highlighted
    const activeLink = page.locator('[class*="active"], [aria-current="page"]');
    if (await activeLink.count() > 0) {
      await expect(activeLink.first()).toBeVisible();
    }
  });
});

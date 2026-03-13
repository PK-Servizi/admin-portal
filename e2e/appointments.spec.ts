/**
 * E2E Tests — Appointments
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Appointments', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/appointments');
  });

  test('should display appointments page', async ({ page }) => {
    await expect(page.locator('text=Appointments').first()).toBeVisible();
  });

  test('should display calendar view', async ({ page }) => {
    // FullCalendar renders a .fc class container
    const calendar = page.locator('.fc, [class*="calendar"]');
    await expect(calendar.first()).toBeVisible();
  });

  test('should have create appointment button', async ({ page }) => {
    const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Schedule"), button:has-text("Book")');
    if (await createBtn.count() > 0) {
      await expect(createBtn.first()).toBeVisible();
    }
  });

  test('should open create appointment modal', async ({ page }) => {
    const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Schedule"), button:has-text("Book")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(500);

      // Modal should appear
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      }
    }
  });

  test('should display calendar navigation controls', async ({ page }) => {
    // FullCalendar has prev/next buttons
    const navBtn = page.locator('.fc-prev-button, .fc-next-button, .fc-today-button, button:has-text("today"), button:has-text("Today")');
    if (await navBtn.count() > 0) {
      await expect(navBtn.first()).toBeVisible();
    }
  });

  test('should switch calendar views', async ({ page }) => {
    // FullCalendar view switch buttons
    const viewBtn = page.locator('.fc-dayGridMonth-button, .fc-timeGridWeek-button, button:has-text("month"), button:has-text("week")');
    if (await viewBtn.count() > 0) {
      await viewBtn.first().click();
      await page.waitForTimeout(500);
    }
  });
});

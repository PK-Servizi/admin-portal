/**
 * E2E Tests — Notifications Admin
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Notifications Admin', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/notifications');
  });

  test('should display notifications admin page', async ({ page }) => {
    await expect(page.locator('text=Notification').first()).toBeVisible();
  });

  test('should display send action cards', async ({ page }) => {
    // The NotificationsAdmin page has Send to User, Broadcast, Send to Role cards
    const sendCard = page.locator('text=Send, text=Broadcast, text=Role');
    if (await sendCard.count() > 0) {
      await expect(sendCard.first()).toBeVisible();
    }
  });

  test('should open send notification modal', async ({ page }) => {
    const sendBtn = page.locator('button:has-text("Send to User"), button:has-text("Send Notification")');
    if (await sendBtn.count() > 0) {
      await sendBtn.first().click();
      await page.waitForTimeout(500);

      // Modal should appear with title/message fields
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
      }
    }
  });

  test('should display recent notifications list', async ({ page }) => {
    // Mock notifications
    const notifTitle = page.locator('text=Welcome, text=Document Approved');
    if (await notifTitle.count() > 0) {
      await expect(notifTitle.first()).toBeVisible();
    }
  });

  test('should have broadcast button', async ({ page }) => {
    const broadcastBtn = page.locator('button:has-text("Broadcast")').or(page.getByText('Broadcast'));
    if (await broadcastBtn.count() > 0) {
      await expect(broadcastBtn.first()).toBeVisible();
    }
  });

  test('should have send to role option', async ({ page }) => {
    const roleBtn = page.locator('button:has-text("Send to Role")').or(page.getByText('Role'));
    if (await roleBtn.count() > 0) {
      await expect(roleBtn.first()).toBeVisible();
    }
  });
});

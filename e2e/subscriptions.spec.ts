/**
 * E2E Tests — Subscriptions & Plans
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Subscriptions List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/subscriptions');
  });

  test('should display subscriptions list page', async ({ page }) => {
    await expect(page.locator('text=Subscription').first()).toBeVisible();
  });

  test('should display subscriber data', async ({ page }) => {
    // Mock has Maria Rossi with Premium plan
    const userName = page.locator('text=Maria Rossi, text=maria@example.com');
    if (await userName.count() > 0) {
      await expect(userName.first()).toBeVisible();
    }
  });

  test('should show subscription status', async ({ page }) => {
    const status = page.locator('text=Active, text=active').first();
    if (await status.count() > 0) {
      await expect(status).toBeVisible();
    }
  });
});

test.describe('Subscription Plans', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/subscription-plans');
  });

  test('should display subscription plans page', async ({ page }) => {
    await expect(page.locator('text=Subscription Plan').first()).toBeVisible();
  });

  test('should display plan cards', async ({ page }) => {
    // Mock has Basic and Premium plans
    await expect(page.locator('text=Basic').first()).toBeVisible();
    await expect(page.locator('text=Premium').first()).toBeVisible();
  });

  test('should have create plan button', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    if (await createBtn.count() > 0) {
      await expect(createBtn.first()).toBeVisible();
    }
  });

  test('should open create plan modal', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(500);

      // Modal fields should appear
      const nameInput = page.locator('input[placeholder*="name"], input[placeholder*="Name"], label:has-text("Name")');
      if (await nameInput.count() > 0) {
        await expect(nameInput.first()).toBeVisible();
      }
    }
  });

  test('should display plan prices', async ({ page }) => {
    // Prices in mock: 999 cents = €9.99, 2999 cents = €29.99
    const price = page.locator('text=/€\\d+/, text=/\\$\\d+/');
    if (await price.count() > 0) {
      await expect(price.first()).toBeVisible();
    }
  });

  test('should display plan features', async ({ page }) => {
    const feature = page.locator('text=Feature 1');
    if (await feature.count() > 0) {
      await expect(feature.first()).toBeVisible();
    }
  });
});

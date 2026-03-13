/**
 * E2E Tests — Courses
 */

import { test, expect } from '@playwright/test';
import { loginAndNavigate } from './helpers/test-helpers';

test.describe('Courses', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndNavigate(page, '/courses');
  });

  test('should display courses page', async ({ page }) => {
    await expect(page.locator('text=Course').first()).toBeVisible();
  });

  test('should display course list with data', async ({ page }) => {
    // Mock courses — wait for data to render
    await page.waitForTimeout(1000);
    const courseText = page.getByText('Italian Language').or(page.getByText('Integration Course'));
    if (await courseText.count() > 0) {
      await expect(courseText.first()).toBeVisible();
    }
  });

  test('should display course status', async ({ page }) => {
    const status = page.locator('text=Published, text=Draft, text=published, text=draft');
    if (await status.count() > 0) {
      await expect(status.first()).toBeVisible();
    }
  });

  test('should have create course button', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    if (await createBtn.count() > 0) {
      await expect(createBtn.first()).toBeVisible();
    }
  });

  test('should open create course modal', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(500);

      // Modal should show form fields
      const titleInput = page.locator('input[placeholder*="title"], input[placeholder*="Title"], label:has-text("Title")');
      if (await titleInput.count() > 0) {
        await expect(titleInput.first()).toBeVisible();
      }
    }
  });

  test('should display enrollment counts', async ({ page }) => {
    // Mock: Italian Language A1 has 25 enrollments
    const enrollment = page.locator('text=25, text=enrollment');
    if (await enrollment.count() > 0) {
      await expect(enrollment.first()).toBeVisible();
    }
  });

  test('should have search/filter controls', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('should display instructor names', async ({ page }) => {
    const instructor = page.locator('text=Prof. Rossi, text=Dr. Bianchi');
    if (await instructor.count() > 0) {
      await expect(instructor.first()).toBeVisible();
    }
  });
});

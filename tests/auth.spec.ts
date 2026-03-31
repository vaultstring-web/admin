import { test, expect } from '@playwright/test';

test.describe('Admin Authentication Flow', () => {
  test('should login successfully as admin', async ({ page }) => {
    // Add console logging
    page.on('console', msg => {
      if (msg.type() === 'error') console.error(`[CONSOLE ERROR] ${msg.text()}`);
      else console.log(`[CONSOLE] ${msg.text()}`);
    });
    page.on('pageerror', error => console.error(`[PAGE ERROR] ${error.message}`));

    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('input[id="email"]', 'admin@kyd.com');
    await page.fill('input[id="password"]', 'password123');

    // Click submit and wait for load
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 120000 }),
      page.click('button[type="submit"]')
    ]);

    // Check if dashboard content is visible
    await expect(page.getByText('System Vitals')).toBeVisible({ timeout: 120000 });
    await expect(page.getByText('Service Latency')).toBeVisible({ timeout: 120000 });
  });

  test('should show error with invalid admin credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[id="email"]', 'wrong@example.com');
    await page.fill('input[id="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Check for error message in the UI
    await expect(page.locator('role=alert')).toBeVisible({ timeout: 15000 });
  });
});

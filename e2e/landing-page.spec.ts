import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DMPilot/);
  });

  test('should display navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
    await expect(nav.getByText('DMPilot')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
  });

  test('should display all main sections', async ({ page }) => {
    await page.goto('/');
    
    // Check for key sections
    await expect(page.getByText('Problem')).toBeVisible();
    await expect(page.getByText('Solution')).toBeVisible();
    await expect(page.getByText('Features')).toBeVisible();
    await expect(page.getByText('FAQ')).toBeVisible();
  });

  test('should navigate to sections', async ({ page }) => {
    await page.goto('/');
    
    // Click on Features link
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL(/#solution/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu button
    const menuButton = page.getByRole('button', { name: /Open menu/i });
    await expect(menuButton).toBeVisible();
  });

  test('should have working email capture form', async ({ page }) => {
    await page.goto('/');
    
    // Find email input and submit
    const emailInput = page.getByPlaceholder(/email/i);
    await emailInput.fill('test@example.com');
    
    const submitButton = page.getByRole('button', { name: /start free/i }).first();
    await submitButton.click();
  });
});

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThan(0);
  });
});

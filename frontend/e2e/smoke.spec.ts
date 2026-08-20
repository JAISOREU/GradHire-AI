import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.animated-logo__text, .text-3d, h1')).toContainText('Gradture');
  });

  test('jobs page loads', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('h1')).toContainText('Job');
  });

  test('companies page loads', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.locator('h1')).toContainText('Featured companies');
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Welcome back');
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Create your account');
  });

  test('404 page loads for unknown route', async ({ page }) => {
    await page.goto('/unknown-route-123');
    await expect(page.locator('h1')).toContainText('404');
  });
});

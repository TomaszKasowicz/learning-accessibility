import { test, expect } from '@playwright/test';

test.describe('shell focus management on route change', () => {
  test('moves focus to main content after selecting a nav link', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Headings', exact: true }).click();
    await expect(page).toHaveURL(/\/headings$/);

    const activeId = await page.evaluate(() => document.activeElement?.id);
    expect(activeId).toBe('main-content');
  });

  test('does not drop focus to <body> after navigating', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Color Contrast', exact: true }).click();
    await expect(page).toHaveURL(/\/color-contrast$/);

    const activeTag = await page.evaluate(
      () => document.activeElement?.tagName ?? '',
    );
    expect(activeTag.toLowerCase()).not.toBe('body');
  });
});

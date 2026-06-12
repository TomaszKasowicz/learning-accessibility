import { test } from '@playwright/test';
import { expect } from './expect';

test.describe('Wrong Headings', () => {
  test.fail('page has heading order violations', async ({ page }, testInfo) => {
    await page.goto('/wrong-headings');

    await expect({ page, testInfo }).toBeAccessible();
  });
});

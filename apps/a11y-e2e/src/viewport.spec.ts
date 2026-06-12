import { test } from '@playwright/test';
import { expect } from './expect';

const REFLOW_VIEWPORT = { width: 320, height: 256 };

test.describe('Exceed Viewport', () => {
  test.use({ viewport: REFLOW_VIEWPORT });

  test('main content should not overflow at 320px', async ({ page }) => {
    await page.goto('/forbidden-children');

    const main = page.getByRole('main').first();
    await expect(main).toBeVisible();
    await expect(main).toNotOverflowViewPort([]);
  });
});

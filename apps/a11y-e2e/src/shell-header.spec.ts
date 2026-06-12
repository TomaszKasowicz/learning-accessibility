import { test } from '@playwright/test';
import { expect } from './expect';

const REFLOW_VIEWPORT = { width: 320, height: 256 };

test.describe('Shell header', () => {
  test.use({ viewport: REFLOW_VIEWPORT });

  test.fail(
    'toolbar should not have text outside button boxes at 320px',
    async ({ page }) => {
      await page.goto('/home');

      const toolbar = page.locator('mat-toolbar');
      await expect(toolbar).toBeVisible();
      await expect(toolbar).toNotHaveElementsWithTextOutsideTheBox([]);
    },
  );
});

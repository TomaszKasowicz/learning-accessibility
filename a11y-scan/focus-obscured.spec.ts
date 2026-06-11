import { test } from '@playwright/test';
import { expect } from './expect';

test('Buy now focus is not obscured (WCAG 2.4.11)', async ({ page }) => {
  await page.goto('http://localhost:4300/focus-obscured');

  const buyNow = page.getByRole('button', { name: 'Buy now' });
  await buyNow.focus();

  await expect(buyNow).toBeFocused();
  await expect(buyNow).not.toBeObscured();
});

test('Row Action 1 should not be obscured', async ({ page }) => {
  await page.goto('http://localhost:4300/focus-obscured');

  const rowAction1 = page.getByRole('button', { name: 'Row action 1', exact: true });
  await rowAction1.focus();

  await expect(rowAction1).toBeFocused();
  await expect(rowAction1).not.toBeObscured();
});

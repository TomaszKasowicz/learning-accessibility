import { test, expect, Page } from '@playwright/test';

/**
 * WCAG 2.4.11 (Minimum): focused component must not be entirely hidden.
 * Returns true when every sample point on the active element is covered
 * by another opaque element in the hit-test stack.
 */
async function isFocusEntirelyObscured(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || !(el instanceof HTMLElement)) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return true;

    const isPointObscured = (x: number, y: number) => {
      const stack = document.elementsFromPoint(x, y);
      const idx = stack.indexOf(el);
      if (idx < 0) return true;

      for (let i = 0; i < idx; i++) {
        const blocker = stack[i];
        if (!(blocker instanceof HTMLElement) || el.contains(blocker)) continue;

        const style = getComputedStyle(blocker);
        if (style.pointerEvents === 'none') continue;
        if (parseFloat(style.opacity) === 0) continue;
        if (style.visibility === 'hidden' || style.display === 'none') continue;

        return true;
      }
      return false;
    };

    const points: [number, number][] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        points.push([
          rect.left + ((col + 0.5) / 3) * rect.width,
          rect.top + ((row + 0.5) / 3) * rect.height,
        ]);
      }
    }

    return points.every(([x, y]) => isPointObscured(x, y));
  });
}

test('Buy now focus is obscured by sticky bar (WCAG 2.4.11 failure)', async ({ page }) => {
  await page.goto('http://localhost:4300/focus-obscured');

  const buyNow = page.getByRole('button', { name: 'Buy now' });
  await buyNow.focus();

  await expect(buyNow).toBeFocused();

  const obscured = await isFocusEntirelyObscured(page);
  expect(obscured).toBe(true);
});

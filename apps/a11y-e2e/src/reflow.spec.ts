/* eslint-disable playwright/no-conditional-in-test */
import { test, expect, Page } from '@playwright/test';

/**
 * WCAG 2.1 SC 1.4.10 Reflow (AA) — automated portion.
 *
 * Reflow requires that content can be presented without loss of information or
 * functionality, and without two-dimensional scrolling, at a viewport equivalent
 * to 320 CSS px wide (vertical scrolling content) / 256 CSS px tall (horizontal
 * scrolling content). 320px ≈ a 1280px viewport at 400% zoom.
 *
 * Tools can only catch the *mechanical* failures:
 *   1. A meta viewport that blocks zoom (user-scalable=no / maximum-scale < 2).
 *   2. Horizontal (two-dimensional) scrolling at 320px width.
 *
 * Clipping, overlap, lost functionality, and whether 2D scrolling is genuinely
 * required (tables, maps, diagrams — the 1.4.10 exceptions) still need manual review.
 */

// Canonical reflow viewport: 320 CSS px wide, 256 CSS px tall.
const REFLOW_VIEWPORT = { width: 320, height: 256 };

// Sub-pixel rounding (and scrollbar gutters) can add a px or two; allow a small tolerance.
const OVERFLOW_TOLERANCE_PX = 1;

// Routes to exercise. Kept in sync with apps/a11y/src/app/app.routes.ts.
const ROUTES = [
  '/home',
  '/headings',
  '/wrong-headings',
  '/forbidden-children',
  '/pointer-size',
  '/focus-obscured',
  '/color-contrast',
  '/tabindex-non-interactive',
  '/dialog',
  '/duplicate-main',
  '/label-content-name-mismatch',
  '/axe-rules',
  '/axe-rules-by-tag',
];

interface OffendingElement {
  selector: string;
  right: number;
  width: number;
  text: string;
}

/** Returns true if the document scrolls horizontally beyond the viewport. */
async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate((tolerance) => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth > tolerance;
  }, OVERFLOW_TOLERANCE_PX);
}

/** Lists elements whose right edge extends past the viewport, to aid debugging. */
async function findOffendingElements(page: Page): Promise<OffendingElement[]> {
  return page.evaluate((tolerance) => {
    const viewportWidth = document.documentElement.clientWidth;
    const offenders: OffendingElement[] = [];

    const describe = (el: Element): string => {
      const id = el.id ? `#${el.id}` : '';
      const cls =
        typeof el.className === 'string' && el.className.trim()
          ? '.' + el.className.trim().split(/\s+/).join('.')
          : '';
      return `${el.tagName.toLowerCase()}${id}${cls}`;
    };

    document.querySelectorAll('body *').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.right > viewportWidth + tolerance) {
        offenders.push({
          selector: describe(el),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          text: (el.textContent || '').trim().slice(0, 50),
        });
      }
    });

    // Deepest/widest offenders first — they're usually the real cause.
    return offenders.sort((a, b) => b.right - a.right).slice(0, 15);
  }, OVERFLOW_TOLERANCE_PX);
}

test.describe('WCAG 1.4.10 Reflow', () => {
  test('meta viewport does not block zoom (user-scalable / maximum-scale)', async ({
    page,
  }) => {
    await page.goto('/');

    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute('content');

    expect(content).toBeDefined();

    // A missing viewport meta is fine; a present one must not disable zoom.
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (content) {
      // eslint-disable-next-line playwright/no-conditional-expect
      expect(
        /user-scalable\s*=\s*(no|0)/i.test(content),
        `Viewport meta disables zoom: "${content}"`,
      ).toBe(false);

      const maxScale = content.match(/maximum-scale\s*=\s*([\d.]+)/i);

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (maxScale) {
        // eslint-disable-next-line playwright/no-conditional-expect
        expect(
          Number(maxScale[1]),
          `maximum-scale of ${maxScale[1]} prevents reaching 200% zoom: "${content}"`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test.describe('no horizontal scrolling at 320px width', () => {
    test.use({ viewport: REFLOW_VIEWPORT });

    for (const route of ROUTES) {
      test(`route ${route}`, async ({ page }, testInfo) => {
        await page.goto(route);

        await expect(page.getByRole('main').first()).toBeVisible();

        const overflows = await hasHorizontalOverflow(page);

        if (overflows) {
          const offenders = await findOffendingElements(page);
          await testInfo.attach('reflow-overflow.png', {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png',
          });
          console.log(
            `Horizontal overflow at ${route} (viewport ${REFLOW_VIEWPORT.width}px). Offenders:\n` +
              offenders
                .map(
                  (o) =>
                    `  ${o.selector} — right:${o.right}px width:${o.width}px ${
                      o.text ? `"${o.text}"` : ''
                    }`,
                )
                .join('\n'),
          );
        }

        expect(
          overflows,
          `Page scrolls horizontally at ${REFLOW_VIEWPORT.width}px (SC 1.4.10 Reflow). See attached screenshot and console for offending elements.`,
        ).toBe(false);
      });
    }
  });
});

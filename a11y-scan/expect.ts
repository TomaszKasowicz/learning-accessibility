import {
  expect as baseExpect,
  Locator,
  Page,
  TestInfo,
  test,
} from '@playwright/test';
import { AnalyzeOptions, AxeService } from './axe.service';

type ObscuredAnalysis = {
  obscured: boolean;
  blockerLabel: string | null;
};

/** Runs in the browser — passed to locator.evaluate(). */
function analyzeObscuration(el: Element): ObscuredAnalysis {
  if (!(el instanceof HTMLElement)) {
    return { obscured: false, blockerLabel: null };
  }

  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return { obscured: true, blockerLabel: null };
  }

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

  const findBlockerAt = (x: number, y: number): HTMLElement | null => {
    const stack = document.elementsFromPoint(x, y);
    const idx = stack.indexOf(el);
    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const blocker = stack[i];
      if (!(blocker instanceof HTMLElement) || el.contains(blocker)) continue;

      const style = getComputedStyle(blocker);
      if (style.pointerEvents === 'none') continue;
      if (parseFloat(style.opacity) === 0) continue;
      if (style.visibility === 'hidden' || style.display === 'none') continue;

      return blocker;
    }
    return null;
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

  const obscured = points.every(([x, y]) => isPointObscured(x, y));
  const centerBlocker = findBlockerAt(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );

  const blockerLabel = centerBlocker
    ? `${centerBlocker.tagName.toLowerCase()}${centerBlocker.className ? `.${centerBlocker.className.trim().split(/\s+/).join('.')}` : ''}`
    : null;

  return { obscured, blockerLabel };
}

/** Runs in the browser — passed to locator.evaluate(). */
function applyObscuredHighlights(el: Element): void {
  if (!(el instanceof HTMLElement)) return;

  const findBlocker = (target: HTMLElement): HTMLElement | null => {
    const rect = target.getBoundingClientRect();
    const stack = document.elementsFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );
    const idx = stack.indexOf(target);
    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const blocker = stack[i];
      if (!(blocker instanceof HTMLElement) || target.contains(blocker)) continue;

      const style = getComputedStyle(blocker);
      if (style.pointerEvents === 'none') continue;
      if (parseFloat(style.opacity) === 0) continue;
      if (style.visibility === 'hidden' || style.display === 'none') continue;

      return blocker;
    }
    return null;
  };

  const root = document.createElement('div');
  root.id = 'a11y-obscured-debug';
  root.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:2147483645;';

  const addBorderOverlay = (
    rect: DOMRect,
    color: string,
    zIndex: number,
    role: string,
    label: string
  ) => {
    const overlay = document.createElement('div');
    overlay.setAttribute('data-a11y-obscured-overlay', role);
    overlay.style.cssText = [
      'position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      `border:4px solid ${color}`,
      'box-sizing:border-box',
      'pointer-events:none',
      `z-index:${zIndex}`,
      `box-shadow:0 0 0 2px #fff, 0 0 8px ${color}`,
    ].join(';');

    const tag = document.createElement('span');
    tag.textContent = label;
    tag.style.cssText = [
      'position:absolute',
      'top:-1.4rem',
      'left:0',
      'padding:0.1rem 0.35rem',
      `background:${color}`,
      'color:#fff',
      'font:600 11px/1.2 sans-serif',
      'white-space:nowrap',
    ].join(';');
    overlay.appendChild(tag);
    root.appendChild(overlay);
  };

  const blocker = findBlocker(el);
  if (blocker) {
    addBorderOverlay(
      blocker.getBoundingClientRect(),
      '#1565c0',
      2147483646,
      'blocker',
      'blocker'
    );
  }

  addBorderOverlay(
    el.getBoundingClientRect(),
    '#c62828',
    2147483647,
    'target',
    'obscured'
  );

  document.body.appendChild(root);
}

/** Runs in the browser — passed to locator.evaluate(). */
function removeObscuredHighlights(): void {
  document.getElementById('a11y-obscured-debug')?.remove();
}

/**
 * WCAG 2.4.11 (Minimum): focused component must not be entirely hidden.
 * Returns true when every sample point on the element is covered
 * by another opaque element in the hit-test stack.
 */
export async function isElementEntirelyObscured(locator: Locator): Promise<boolean> {
  const { obscured } = await analyzeElementObscured(locator);
  return obscured;
}

export async function analyzeElementObscured(
  locator: Locator
): Promise<ObscuredAnalysis> {
  return locator.evaluate(analyzeObscuration);
}

async function attachObscuredScreenshot(
  locator: Locator,
  testInfo: TestInfo
): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate(applyObscuredHighlights);

  try {
    const screenshot = await locator.page().screenshot();
    await testInfo.attach('focus-obscured', {
      body: screenshot,
      contentType: 'image/png',
    });
  } finally {
    await locator.evaluate(removeObscuredHighlights);
  }
}

export const expect = baseExpect.extend({
  async toBeAccessible(
    context: { page: Page; testInfo: TestInfo },
    options?: AnalyzeOptions
  ) {
    const axe = new AxeService();
    const results = await axe.analyze(context.page, options);
    return {
      pass: results.violations.length === 0,
      message: () =>
        `Expected no violations, but found ${results.violations.length}`,
    };
  },

  async toBeObscured(locator: Locator) {
    const { obscured, blockerLabel } = await analyzeElementObscured(locator);

    if (obscured) {
      await attachObscuredScreenshot(locator, test.info());
    }

    return {
      pass: obscured,
      name: 'toBeObscured',
      message: () => {
        const blocker = blockerLabel ? ` (covered by ${blockerLabel})` : '';

        return this.isNot
          ? `Expected element not to be obscured, but it is entirely covered by other content${blocker}`
          : `Expected element to be obscured, but it is fully visible`;
      },
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeAccessible(options?: AnalyzeOptions): Promise<R>;
      toBeObscured(): Promise<R>;
    }
  }
}

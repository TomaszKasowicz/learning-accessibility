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

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const elementOnTop = document.elementFromPoint(centerX, centerY);

  const isCovered =
    elementOnTop !== null &&
    elementOnTop !== el &&
    !el.contains(elementOnTop);

  let blockerLabel: string | null = null;
  if (isCovered && elementOnTop instanceof HTMLElement) {
    const className = elementOnTop.className
      ? `.${elementOnTop.className.trim().split(/\s+/).join('.')}`
      : '';
    blockerLabel = `${elementOnTop.tagName.toLowerCase()}${className}`;
  }

  return { obscured: isCovered, blockerLabel };
}

/** Runs in the browser — passed to locator.evaluate(). */
function applyObscuredHighlights(el: Element): void {
  if (!(el instanceof HTMLElement)) return;

  const rect = el.getBoundingClientRect();
  const root = document.createElement('div');
  root.id = 'a11y-obscured-debug';
  root.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';

  const overlay = document.createElement('div');
  overlay.setAttribute('data-a11y-obscured-overlay', 'target');
  overlay.style.cssText = [
    'position:fixed',
    `left:${rect.left}px`,
    `top:${rect.top}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    'border:4px dashed #c62828',
    'box-sizing:border-box',
    'pointer-events:none',
    'box-shadow:0 0 0 2px #fff, 0 0 8px #c62828',
  ].join(';');

  const tag = document.createElement('span');
  tag.textContent = 'obscured';
  tag.style.cssText = [
    'position:absolute',
    'top:-1.4rem',
    'left:0',
    'padding:0.1rem 0.35rem',
    'background:#c62828',
    'color:#fff',
    'font:600 11px/1.2 sans-serif',
    'white-space:nowrap',
  ].join(';');
  overlay.appendChild(tag);
  root.appendChild(overlay);

  document.body.appendChild(root);
}

/** Runs in the browser — passed to locator.evaluate(). */
function removeObscuredHighlights(): void {
  document.getElementById('a11y-obscured-debug')?.remove();
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
          ? `Expected element not to be obscured, but its center is covered by other content${blocker}`
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

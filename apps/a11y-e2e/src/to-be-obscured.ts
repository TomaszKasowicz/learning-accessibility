import { Locator, expect as baseExpect } from '@playwright/test';
import { attachDebugScreenshot } from './matcher-shared';

export type ObscuredAnalysis = {
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

/** Returns whether the element's center is covered by other content. */
export async function analyzeElementObscured(
  locator: Locator,
): Promise<ObscuredAnalysis> {
  return locator.evaluate(analyzeObscuration);
}

export const obscuredExpect = baseExpect.extend({
  async toBeObscured(locator: Locator) {
    const { obscured, blockerLabel } = await analyzeElementObscured(locator);

    if (obscured) {
      await attachScreenshot(locator);
    }

    const el = await locator.textContent()

    return {
      pass: this.isNot ? obscured : !obscured,
      name: 'toBeObscured',
      message: () => {
        const blocker = blockerLabel ? ` (covered by ${blockerLabel})` : '';

        return this.isNot
          ? `Expected ${el} to be obscured, but it is fully visible`
          : `Expected ${el} not to be obscured, but its center is covered by other content${blocker}`;

      },
      log: [blockerLabel ? ` (covered by ${blockerLabel})` : ''],
    };
  }
});

async function attachScreenshot(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await attachDebugScreenshot(locator, [{ selector: ':scope' }], {
    debugId: 'a11y-obscured-debug',
    label: 'obscured',
    attachmentName: 'focus-obscured.png',
  });


}

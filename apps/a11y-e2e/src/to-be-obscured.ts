import { Locator } from '@playwright/test';
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

export const obscuredMatcher = {
  async toBeObscured(this: { isNot?: boolean }, locator: Locator) {
    const { obscured, blockerLabel } = await analyzeElementObscured(locator);
    const conditionMet = obscured;

    if (conditionMet) {
      await locator.scrollIntoViewIfNeeded();
      await attachDebugScreenshot(locator, [{ selector: ':scope' }], {
        debugId: 'a11y-obscured-debug',
        label: 'obscured',
        attachmentName: 'focus-obscured.png',
      });
    }

    return {
      pass: conditionMet,
      name: 'toBeObscured',
      message: () => {
        const blocker = blockerLabel ? ` (covered by ${blockerLabel})` : '';

        return this.isNot
          ? `Expected element not to be obscured, but its center is covered by other content${blocker}`
          : `Expected element to be obscured, but it is fully visible`;
      },
    };
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeObscured(): Promise<R>;
    }
  }
}

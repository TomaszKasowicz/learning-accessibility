import { Page, expect as baseExpect } from "@playwright/test";

export type FocusableElement = {
  tagName: string;
  text: string;
  ariaSnapshot: string;
};

/** Collapse whitespace — innerText() uses block boundaries; exact spacing is not stable. */
function normalizeText(text: string): string {
  if (!text) {
    return '';
  }
  return text.replace(/\s+/g, ' ').trim();
}

async function getFocusedElement(page: Page): Promise<FocusableElement> {
  const focusedElement = page.locator(':focus');
  const text = await focusedElement.innerText();
  const ariaSnapshot = await focusedElement.ariaSnapshot();
  const tag = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
  return { tagName: tag, text: normalizeText(text), ariaSnapshot: normalizeText(ariaSnapshot) };
}

export const focusOrderExpect = baseExpect.extend({
  async toHaveFocusOrder(page: Page, expected: FocusableElement[]) {
    const actual: FocusableElement[] = [];
    for (let i = 0; i < expected.length; i++) {
      await page.keyboard.press('Tab');

      const currentFocus = await getFocusedElement(page);
      actual.push(currentFocus);
    }

    const pass =
    actual.length === expected.length &&
      actual.every(
        (el, idx) =>
          el.tagName === expected[idx].tagName &&
          el.text === expected[idx].text &&
          el.ariaSnapshot === expected[idx].ariaSnapshot,
      );

    return {
      pass: this.isNot ? !pass : pass,
      name: 'toHaveFocusOrder',
      message: () =>
        `Expected different focus order ${this.utils.printDiffOrStringify(
          expected,
          actual,
          'expected',
          'actual',
          false,
        )}`,
    };
  }});


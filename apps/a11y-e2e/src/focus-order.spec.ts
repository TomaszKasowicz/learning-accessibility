import { test } from '@playwright/test';
import { expect } from './expect/expect';

test.describe('Focus Order', () => {
  test('should have focus order', async ({ page }) => {
    await page.goto('/focusable-and-interactive');
    const main = page.getByRole('main').first();
    await main.focus();

    // Users can use either innerText or textContent (or both) to match the focused element.
    await expect(page).toHaveFocusOrder([
      { tagName: 'button', textContent: 'Click me' },
      { tagName: 'a', textContent: 'Google' },
      { tagName: 'input', textContent: ''}, // input
      { tagName: 'input', textContent: '' }, // checkbox
      { tagName: 'select', textContent: 'VolvoSaab', innerText: 'Volvo Saab' }, // select
      { tagName: 'button', textContent: '' }, // slide toggle
      { tagName: 'button', textContent: 'Bold' }, // Button Toggle 1st button
      { tagName: 'input', textContent: '' }, // datepicker
      { tagName: 'button', textContent: '' }, // datepicker toggle
      { tagName: 'mat-expansion-panel-header', textContent: 'This is the expansion title This is a summary of the content' }, // expansion panel
      { tagName: 'button', textContent: 'Menu' }, // menu
      { tagName: 'input', textContent: '' }, // radio button
      { tagName: 'input', textContent: '' }, // slider
      { tagName: 'div', textContent: 'First' }, // tab 1
    ]);
  });

});

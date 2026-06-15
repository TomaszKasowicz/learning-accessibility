import { test } from '@playwright/test';
import { expect } from './expect';

test.describe('Focus Order', () => {
  test('should have focus order', async ({ page }) => {
    await page.goto('/focusable-and-interactive');
    const main = page.getByRole('main').first();
    await main.focus();

    await expect(page).toHaveFocusOrder([
      { tagName: 'button', text: 'Click me', ariaSnapshot: '- button "Click me"' },
      { tagName: 'a', text: 'Google', ariaSnapshot: '- link "Google": - /url: https://www.google.com' },
      { tagName: 'input', text: '', ariaSnapshot: '- textbox "Name"' }, // input
      { tagName: 'input', text: '', ariaSnapshot: '- checkbox "Check me!"' }, // checkbox
      { tagName: 'select', text: 'Volvo Saab Mercedes Audi Audi',
        ariaSnapshot: '- combobox "Cars": - option "Volvo" - option "Saab" - option "Mercedes" - option "Audi" - option "Audi"' }, // select
      { tagName: 'button', text: '', ariaSnapshot: '- switch "Slide me!"' }, // slide toggle
      { tagName: 'button', text: 'Bold', ariaSnapshot: '- radio "Bold"' }, // Button Toggle 1st button
      { tagName: 'input', text: '', ariaSnapshot: '- textbox "Choose a date"' }, // datepicker
      { tagName: 'button', text: '', ariaSnapshot: '- button "Open calendar"' }, // datepicker toggle
      {
        tagName: 'mat-expansion-panel-header',
        text: 'This is the expansion title This is a summary of the content',
        ariaSnapshot: '- button "This is the expansion title This is a summary of the content"'
      },
      { tagName: 'button', text: 'Menu', ariaSnapshot: '- button "Menu"' },
      { tagName: 'input', text: '', ariaSnapshot: '- radio "Option 1"' }, // radio button
      { tagName: 'input', text: '', ariaSnapshot: '- slider "Slider": "0"' }, // slider
      { tagName: 'div', text: 'First', ariaSnapshot: '- tab "First" [selected]' }, // tab 1
    ]);
  });
});

import { test } from '@playwright/test';
import { expect } from './expect/expect';


test.describe('Disabled Tooltip', { tag: ['@a11y', '@disabled-tooltip'] }, () => {
  test('should have disabled tooltip', async ({ page }) => {
    await page.goto('/button-with-tooltip');
    const enabledButton = page.getByRole('button', { name: 'Enabled button' });
    const disabledButton = page.getByRole('button', { name: 'Disabled button' });
    // Angular Material renders the visible tooltip as `.mat-mdc-tooltip` (not in the a11y tree
    // as role="tooltip"). The CDK describedby nodes with role="tooltip" stay visibility:hidden.
    const tooltip = page.locator('.mat-mdc-tooltip', {
      hasText: 'This is a disabled tooltip',
    });

    // Given
    await enabledButton.focus();
    await expect(tooltip).toBeHidden();
    await expect(disabledButton).toBeDisabled();

    // When
    await page.keyboard.press('Tab');

    // Then
    await expect(disabledButton).toBeFocused();
    await expect(disabledButton).toBeDisabled();
    await expect(tooltip).toBeVisible();
  });

  test('Should not handle click events on disabled button', async ({ page }) => {
    await page.goto('/button-with-tooltip');
    const disabledButton = page.getByRole('button', { name: 'Disabled button' });
    const clickedMarker = page.locator('h2', { hasText: 'Clicked: None' });

    // When
    // eslint-disable-next-line playwright/no-force-option
    await disabledButton.click({ force: true});

    // Then
    await expect(clickedMarker).toHaveText('Clicked: None');
  });

  test('Should not handle keyboard events on disabled button', async ({ page }) => {
    await page.goto('/button-with-tooltip');
    const disabledButton = page.getByRole('button', { name: 'Disabled button' });
    const clickedMarker = page.locator('h2', { hasText: 'Clicked: None' });

    // When
    // eslint-disable-next-line playwright/no-force-option
    await disabledButton.focus();
    await page.keyboard.press('Enter');

    // Then
    await expect(clickedMarker).toHaveText('Clicked: None');
  });

  test('Should handle click events on enabled button', async ({ page }) => {
    await page.goto('/button-with-tooltip');
    const enabledButton = page.getByRole('button', { name: 'Enabled button' });
    const clickedMarker = page.locator('h2', { hasText: 'Clicked: Enabled' });

    // When
    await enabledButton.click();

    // Then
    await expect(clickedMarker).toHaveText('Clicked: Enabled');
  });

  test('Should handle keyboard events on enabled button', async ({ page }) => {
    await page.goto('/button-with-tooltip');
    const enabledButton = page.getByRole('button', { name: 'Enabled button' });
    const clickedMarker = page.locator('h2', { hasText: 'Clicked: Enabled' });

    // When
    await enabledButton.focus();
    await page.keyboard.press('Enter');

    // Then
    await expect(clickedMarker).toHaveText('Clicked: Enabled');
  });
});

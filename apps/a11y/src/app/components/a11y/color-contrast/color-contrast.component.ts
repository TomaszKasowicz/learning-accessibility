import { Component } from '@angular/core';

@Component({
  selector: 'app-color-contrast',
  template: `
    <h1>Color Contrast</h1>
    <p>
      The paragraph below uses light gray text on a white background. Normal text
      needs at least a 4.5:1 contrast ratio (WCAG SC 1.4.3) — this pairing
      fails the axe <strong>color-contrast</strong> rule.
    </p>

    <p class="low-contrast">
      This text is hard to read because the foreground and background colors
      are too similar.
    </p>
  `,
  styles: `
    .low-contrast {
      color: #cccccc;
      background-color: #ffffff;
    }
  `,
  imports: [],
})
export class ColorContrastComponent {}

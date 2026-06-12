import { Component } from '@angular/core';

@Component({
  selector: 'app-exceed-viewport',
  template: `
    <h1>Exceed Viewport</h1>
    <p>
      At 320&nbsp;px width (400% zoom on a 1280&nbsp;px screen), this banner is
      wider than the viewport — a WCAG 2.1 SC 1.4.10 Reflow failure.
    </p>

    <div class="wide-banner">
      Summer sale — save 20% on all plans until December 31
    </div>
  `,
  styles: `
    .wide-banner {
      width: 400px;
      padding: 1rem;
      background: #1e3a5f;
      color: #fff;
      white-space: nowrap;
    }
  `,
  imports: [],
})
export class ExceedViewportComponent {}

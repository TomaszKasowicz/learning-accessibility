import { Component } from '@angular/core';

@Component({
  selector: 'app-focus-obscured',
  template: `
    <h1>Focus Obscured</h1>
    <p>
      Tab through the list and watch the focus ring. When the
      <strong>"Buy now"</strong> button scrolls under the sticky bar, its focus
      indicator is hidden behind it — a WCAG 2.2 SC 2.4.11 failure.
    </p>
    <strong>THIS CANNOT BE DETECTED BY AXE</strong>

    <div class="scroll-area">
      @for (i of items; track i) {
        <button class="row-button">Row action {{ i }}</button>
      }

      <button class="row-button buy">Buy now</button>

      @for (i of moreItems; track i) {
        <button class="row-button">Row action {{ i }}</button>
      }

      <div class="sticky-box">
        <span>Sticky offer bar</span>
        <button type="button">Claim discount</button>
      </div>
    </div>
  `,
  styles: `
    .scroll-area {
      position: relative;
      height: 320px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 0.75rem;
    }

    .row-button {
      display: block;
      width: 100%;
      margin: 0.4rem 0;
      padding: 0.6rem;
      text-align: left;
    }

    /* The sticky box sits on top of the scrolling content with an opaque
       background and a high z-index, so any control that scrolls beneath it
       gets fully covered — including its focus ring. */
    .sticky-box {
      position: sticky;
      bottom: -12px; // Will hide the "Buy now" button entirely.
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin: 0 -0.75rem -0.75rem;
      padding: 1rem 0.75rem;
      background: #1e1e2e;
      color: #fff;
    }
  `,
  imports: [],
})
export class FocusObscuredComponent {
  protected readonly items = [1, 2, 3, 4, 5, 6];
  protected readonly moreItems = [7, 8, 9, 10, 11, 12];
}

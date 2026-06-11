import { Component } from '@angular/core';

@Component({
  selector: 'app-tabindex-non-interactive',
  template: `
    <h1 tabindex="0">Tabindex on Static Content</h1>
    <p tabindex="0">
      Tab through this page with the keyboard. Headings, paragraphs, and table
      cells below have <code>tabindex="0"</code>, so they land in the tab order
      even though they are not interactive. Screen reader users already navigate
      static content with dedicated shortcuts (for example, H for the next
      heading) — adding tab stops here only adds noise. Axe flags this under
      <strong>focus-order-semantics</strong>.
    </p>

    <table>
      <caption>
        Quarterly results — every cell is incorrectly focusable
      </caption>
      <thead>
        <tr>
          <th scope="col" tabindex="0">Quarter</th>
          <th scope="col" tabindex="0">Revenue</th>
          <th scope="col" tabindex="0">Growth</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" tabindex="0">Q1</th>
          <td tabindex="0">$1.2M</td>
          <td tabindex="0">+4%</td>
        </tr>
        <tr>
          <th scope="row" tabindex="0">Q2</th>
          <td tabindex="0">$1.4M</td>
          <td tabindex="0">+8%</td>
        </tr>
      </tbody>
    </table>
  `,
  styles: `
    table {
      border-collapse: collapse;
      margin-top: 1rem;
    }

    th,
    td {
      border: 1px solid #ccc;
      padding: 0.5rem 0.75rem;
      text-align: left;
    }

    thead th {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
  `,
  imports: [],
})
export class TabindexNonInteractiveComponent {}

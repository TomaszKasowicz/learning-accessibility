import { Component } from '@angular/core';

@Component({
  selector: 'app-duplicate-main',
  template: `
    <h1>Duplicate Main Landmark</h1>
    <p>
      The app shell already wraps the routed content in a single
      <code>&lt;main&gt;</code> landmark. This page adds a
      <strong>second</strong> <code>&lt;main&gt;</code> below, so the document
      now exposes two main landmarks — an axe
      <code>landmark-no-duplicate-main</code> failure.
    </p>
    <p>
      A document must contain at most one <code>&lt;main&gt;</code> landmark so
      assistive technology has a single, unambiguous "skip to primary content"
      target. The fix is to demote this region to a
      <code>&lt;section&gt;</code> or plain <code>&lt;div&gt;</code>.
    </p>

    <!-- Violation: a second main landmark nested inside the shell's <main>. -->
    <main class="extra-main">
      <h2>Second main region</h2>
      <p>
        Everything in this box lives inside its own <code>&lt;main&gt;</code>,
        duplicating the landmark provided by the shell.
      </p>
    </main>
  `,
  styles: `
    .extra-main {
      display: block;
      margin-top: 1rem;
      padding: 1rem;
      border: 2px dashed var(--mat-sys-error, #b3261e);
      border-radius: 4px;
    }
  `,
  imports: [],
})
export class DuplicateMainComponent {}

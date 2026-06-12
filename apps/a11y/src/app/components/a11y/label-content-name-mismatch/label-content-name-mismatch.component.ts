import { Component } from '@angular/core';

@Component({
  selector: 'app-label-content-name-mismatch',
  template: `
    <h1>Label and Name from Content Mismatch</h1>
    <p>
      WCAG 2.5.3 requires that when a control has a visible text label, its
      accessible name includes that text. Adding <code>aria-label</code> that
      does not contain the on-screen label breaks voice control and confuses
      screen reader users — axe flags this under
      <strong>label-content-name-mismatch</strong>.
    </p>

    <section aria-labelledby="buttons-heading">
      <h2 id="buttons-heading">Buttons</h2>
      <p>
        The button below shows <strong>Search</strong> but its
        <code>aria-label</code> says something else entirely.
      </p>
      <button type="button" aria-label="Submit form">Search</button>
    </section>

    <section aria-labelledby="links-heading">
      <h2 id="links-heading">Links</h2>
      <p>
        The link reads <strong>Learn more</strong> on screen, yet
        <code>aria-label</code> overrides the name with unrelated text.
      </p>
      <a href="#" aria-label="Read more about accessibility">Learn more</a>
    </section>
  `,
  styles: `
    section {
      margin-top: 1.5rem;
    }

    button,
    a {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
    }
  `,
  imports: [],
})
export class LabelContentNameMismatchComponent {}

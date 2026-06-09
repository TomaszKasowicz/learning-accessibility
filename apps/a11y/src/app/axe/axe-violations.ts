import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import type { Result } from 'axe-core';
import { AxeService } from './axe.service';

@Component({
  selector: 'app-axe-violations',
  imports: [MatListModule],
  template: `
    @if (axe.hasRun()) {
      <section
        class="axe-results"
        aria-labelledby="axe-results-heading"
        aria-live="polite"
      >
        <h2 id="axe-results-heading" class="axe-results-heading">
          Axe results
          @if (axe.violations().length === 0) {
            <span class="axe-results-badge axe-results-badge--pass">Pass</span>
          } @else {
            <span class="axe-results-badge axe-results-badge--fail">
              {{ axe.violations().length }}
              {{ axe.violations().length === 1 ? 'violation' : 'violations' }}
            </span>
          }
        </h2>

        @if (axe.violations().length === 0) {
          <p class="axe-results-empty">No accessibility violations found.</p>
        } @else {
          <mat-action-list class="axe-violation-list">
            @for (violation of axe.violations(); track violation.id) {
              <button
                mat-list-item
                type="button"
                class="axe-violation-item"
                (click)="logViolation(violation)"
              >
                <span matListItemTitle>{{ violation.help }} ({{ violation.tags.join(', ') }})</span>
                <span matListItemLine>
                  {{ violation.id }} · {{ violation.impact ?? 'unknown' }} impact (<a href="{{ violation.helpUrl }}" target="_blank">{{ violation.helpUrl }}</a>)
                </span>
                <span matListItemLine>
                  Description: {{ violation.description }}
                </span>
              </button>
            }
          </mat-action-list>
          <p class="axe-results-hint">
            Click a violation to log affected elements in the console.
          </p>
        }
      </section>
    }
  `,
  styles: `
    .axe-results {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid
        color-mix(in srgb, var(--mat-sys-outline) 40%, transparent);
    }

    .axe-results-heading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .axe-results-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .axe-results-badge--pass {
      background: color-mix(in srgb, #2e7d32 15%, transparent);
      color: #2e7d32;
    }

    .axe-results-badge--fail {
      background: color-mix(in srgb, #c62828 15%, transparent);
      color: #c62828;
    }

    .axe-results-empty,
    .axe-results-hint {
      margin: 0;
      color: color-mix(in srgb, var(--mat-sys-on-surface) 70%, transparent);
      font-size: 0.875rem;
    }

    .axe-results-hint {
      margin-top: 0.75rem;
    }

    .axe-violation-list {
      padding: 0;
    }

    .axe-violation-item {
      height: auto;
      padding-block: 0.75rem;
    }
  `,
})
export class AxeViolations {
  protected readonly axe = inject(AxeService);

  protected logViolation(violation: Result): void {
    console.group(`Axe: ${violation.id} — ${violation.help}`);
    console.log('Impact:', violation.impact);
    console.log('Tags:', violation.tags);
    console.log('Description:', violation.description);
    console.log('Help URL:', violation.helpUrl);
    violation.nodes.forEach((node, index) => {
      console.log(`Node ${index + 1}:`, node.target.join(' '));
      console.log('HTML:', node.html);
    });
    console.groupEnd();
  }
}

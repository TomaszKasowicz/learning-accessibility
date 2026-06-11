import { Component, computed, inject, signal } from '@angular/core';
import type { RuleMetadata } from 'axe-core';
import { AXE_DEFAULT_TAGS } from '../../axe/axe.config';
import { AxeService } from '../../axe/axe.service';

interface RuleRow extends RuleMetadata {
  /** True when the rule matches the app's configured default tag set. */
  inDefaultRun: boolean;
}

@Component({
  selector: 'app-axe-rules',
  template: `
    <h1>Axe Default Rules</h1>

    <p>
      Rules bundled with <code>axe-core</code>, loaded via
      <code>axe.getRules()</code>. Highlighted rows run under this app's
      configured default tag set
      (<code>{{ defaultTags.join(', ') }}</code>).
    </p>

    @if (loading()) {
      <p>Loading rules…</p>
    } @else {
      <p>
        <strong>{{ rules().length }}</strong> rules loaded —
        <strong>{{ defaultRunCount() }}</strong> run by default.
      </p>

      <table>
        <caption class="visually-hidden">
          List of axe-core rules
        </caption>
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Description</th>
            <th scope="col">Tags</th>
            <th scope="col">Enabled</th>
          </tr>
        </thead>
        <tbody>
          @for (rule of rules(); track rule.ruleId) {
            <tr [class.in-default-run]="rule.inDefaultRun">
              <th scope="row">
                <a [href]="rule.helpUrl" target="_blank" rel="noreferrer">
                  {{ rule.ruleId }}
                </a>
              </th>
              <td>{{ rule.description }}</td>
              <td>
                <span class="tags">
                  @for (tag of rule.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </span>
              </td>
              <td>{{ rule.enabled ? 'yes' : 'no' }}</td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 1rem;
    }

    th,
    td {
      border: 1px solid var(--mat-sys-outline, #ccc);
      padding: 0.5rem 0.75rem;
      text-align: left;
      vertical-align: top;
    }

    thead th {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }

    tr.in-default-run {
      background: color-mix(
        in srgb,
        var(--mat-sys-primary, #1976d2) 12%,
        transparent
      );
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .tag {
      font-size: 0.75rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: color-mix(in srgb, currentColor 12%, transparent);
      white-space: nowrap;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }
  `,
  imports: [],
})
export class AxeRulesComponent {
  private readonly axe = inject(AxeService);

  protected readonly defaultTags = [...AXE_DEFAULT_TAGS];
  protected readonly loading = signal(true);
  protected readonly rules = signal<RuleRow[]>([]);

  protected readonly defaultRunCount = computed(
    () => this.rules().filter((rule) => rule.inDefaultRun).length,
  );

  constructor() {
    void this.loadRules();
  }

  private async loadRules(): Promise<void> {
    const defaultTags = new Set<string>(this.defaultTags);
    const rules = await this.axe.getRules(this.defaultTags);

    const rows: RuleRow[] = rules
      .map((rule) => ({
        ...rule,
        inDefaultRun:
          rule.enabled && rule.tags.some((tag) => defaultTags.has(tag)),
      }))
      .sort((a, b) => a.ruleId.localeCompare(b.ruleId));

    this.rules.set(rows);
    this.loading.set(false);
  }
}

import { Component, computed, inject, signal } from '@angular/core';
import type { RuleMetadata } from 'axe-core';
import { AXE_DEFAULT_TAGS } from '../../axe/axe.config';
import { AxeService } from '../../axe/axe.service';

interface RuleRow extends RuleMetadata {
  /** True when the rule matches the app's configured default tag set. */
  inDefaultRun: boolean;
}

interface TagGroup {
  tag: string;
  rules: RuleRow[];
}

@Component({
  selector: 'app-axe-rules-by-tag',
  template: `
    <h1>Axe Rules by Tag</h1>

    <p>
      Rules bundled with <code>axe-core</code>, grouped by tag. Highlighted rows
      run under this app's configured default tag set
      (<code>{{ defaultTags.join(', ') }}</code>).
    </p>

    @if (loading()) {
      <p>Loading rules…</p>
    } @else {
      <p>
        <strong>{{ ruleCount() }}</strong> rules across
        <strong>{{ tagGroups().length }}</strong> tags —
        <strong>{{ defaultRunCount() }}</strong> run by default.
      </p>

      @for (group of tagGroups(); track group.tag) {
        <section class="tag-group">
          <h2>
            <span class="tag-heading">{{ group.tag }}</span>
            <span class="tag-count">{{ group.rules.length }} rules</span>
          </h2>

          <table>
            <caption class="visually-hidden">
              Axe rules tagged {{ group.tag }}
            </caption>
            <thead>
              <tr>
                <th scope="col">Rule</th>
                <th scope="col">Description</th>
                <th scope="col">Other tags</th>
                <th scope="col">Enabled</th>
              </tr>
            </thead>
            <tbody>
              @for (rule of group.rules; track rule.ruleId) {
                <tr [class.in-default-run]="rule.inDefaultRun">
                  <th scope="row">
                    <a [href]="rule.helpUrl" target="_blank" rel="noreferrer">
                      {{ rule.ruleId }}
                    </a>
                  </th>
                  <td>{{ rule.description }}</td>
                  <td>
                    <span class="tags">
                      @for (tag of otherTags(rule, group.tag); track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </span>
                  </td>
                  <td>{{ rule.enabled ? 'yes' : 'no' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </section>
      }
    }
  `,
  styles: `
    .tag-group {
      margin-top: 2rem;
    }

    .tag-group:first-of-type {
      margin-top: 1rem;
    }

    h2 {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      margin: 0 0 0.5rem;
      font-size: 1.125rem;
    }

    .tag-heading {
      font-family: monospace;
    }

    .tag-count {
      font-size: 0.875rem;
      font-weight: normal;
      color: color-mix(in srgb, currentColor 65%, transparent);
    }

    table {
      border-collapse: collapse;
      width: 100%;
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
export class AxeRulesByTagComponent {
  private readonly axe = inject(AxeService);

  protected readonly defaultTags = [...AXE_DEFAULT_TAGS];
  protected readonly loading = signal(true);
  protected readonly tagGroups = signal<TagGroup[]>([]);
  protected readonly ruleCount = signal(0);

  protected readonly defaultRunCount = computed(() => {
    const seen = new Set<string>();

    for (const group of this.tagGroups()) {
      for (const rule of group.rules) {
        if (rule.inDefaultRun) {
          seen.add(rule.ruleId);
        }
      }
    }

    return seen.size;
  });

  constructor() {
    void this.loadRules();
  }

  protected otherTags(rule: RuleRow, currentTag: string): string[] {
    return rule.tags.filter((tag) => tag !== currentTag);
  }

  private async loadRules(): Promise<void> {
    const defaultTags = new Set<string>(this.defaultTags);
    const rules = await this.axe.getRules();

    const rows: RuleRow[] = rules
      .map((rule) => ({
        ...rule,
        inDefaultRun:
          rule.enabled && rule.tags.some((tag) => defaultTags.has(tag)),
      }))
      .sort((a, b) => a.ruleId.localeCompare(b.ruleId));

    this.ruleCount.set(rows.length);

    const byTag = new Map<string, RuleRow[]>();

    for (const rule of rows) {
      for (const tag of rule.tags) {
        const group = byTag.get(tag) ?? [];
        group.push(rule);
        byTag.set(tag, group);
      }
    }

    const groups: TagGroup[] = [...byTag.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, tagRules]) => ({
        tag,
        rules: tagRules.sort((a, b) => a.ruleId.localeCompare(b.ruleId)),
      }));

    this.tagGroups.set(groups);
    this.loading.set(false);
  }
}

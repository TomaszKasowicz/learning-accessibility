import { Injectable, signal } from '@angular/core';
import type { AxeResults, Result, RuleMetadata } from 'axe-core';
import { AXE_RUN_OPTIONS } from './axe.config';

type AxeModule = typeof import('axe-core');

@Injectable({ providedIn: 'root' })
export class AxeService {
  readonly violations = signal<Result[]>([]);
  readonly running = signal(false);
  readonly hasRun = signal(false);

  private axe: AxeModule | null = null;

  private async initialize(): Promise<AxeModule> {
    if (this.axe) {
      return this.axe;
    }

    this.axe = await import('axe-core');
    this.axe.setup(document);

    return this.axe;
  }

  async run(context: Element): Promise<void> {
    this.running.set(true);

    try {
      const axe = await this.initialize();
      const results: AxeResults = await axe.run(context , AXE_RUN_OPTIONS);

      this.violations.set(results.violations);
      this.hasRun.set(true);
    } finally {
      this.running.set(false);
    }
  }

  clear(): void {
    this.violations.set([]);
    this.hasRun.set(false);
  }

  /** Returns the rules axe-core ships with, optionally filtered by tags. */
  async getRules(tags?: string[]): Promise<RuleMetadata[]> {
    const axe = await this.initialize();

    return axe.getRules(tags);
  }
}

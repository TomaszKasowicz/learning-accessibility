import { Injectable, signal } from '@angular/core';
import type { Result } from 'axe-core';

@Injectable({ providedIn: 'root' })
export class AxeService {
  readonly violations = signal<Result[]>([]);
  readonly running = signal(false);
  readonly hasRun = signal(false);

  async run(context: Element): Promise<void> {
    this.running.set(true);

    try {
      const axe = await import('axe-core');
      const results = await axe.run(context);

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
}

import { expect as baseExpect, Page, TestInfo } from '@playwright/test';
import type { AxeResults } from 'axe-core';
import { AnalyzeOptions, AxeService } from './axe.service';

export const expect = baseExpect.extend({
  async toBeAccessible( context: { page: Page; testInfo: TestInfo }, options?: AnalyzeOptions ) {
    const axe = new AxeService();
    const results = await axe.analyze(context.page, options);
    return {
      pass: results.violations.length === 0,
      message: () => `Expected no violations, but found ${results.violations.length}`,
    };
  },
});

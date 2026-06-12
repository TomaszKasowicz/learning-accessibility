import { Page, TestInfo } from '@playwright/test';
import { AnalyzeOptions, AxeService } from './axe.service';

export type AccessibleContext = { page: Page; testInfo: TestInfo };

export const accessibleMatcher = {
  async toBeAccessible(
    this: { isNot?: boolean },
    context: AccessibleContext,
    options?: AnalyzeOptions,
  ) {
    const axe = new AxeService();
    const results = await axe.analyze(context.page, options);
    const pass = results.violations.length === 0;

    return {
      pass: this.isNot ? !pass : pass,
      name: 'toBeAccessible',
      message: () =>
        pass
          ? 'Expected accessibility violations, but found none'
          : `Expected no violations, but found ${results.violations.length}`,
    };
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeAccessible(options?: AnalyzeOptions): Promise<R>;
    }
  }
}

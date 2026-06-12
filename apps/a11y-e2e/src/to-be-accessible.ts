import type { Result } from 'axe-core';
import { Page, TestInfo } from '@playwright/test';
import { AnalyzeOptions, AxeService } from './axe.service';
import {
  attachPageDebugScreenshot,
  DebugScreenshotIssue,
} from './matcher-shared';

export type AccessibleContext = { page: Page; testInfo: TestInfo };

function violationIssues(violations: Result[]): DebugScreenshotIssue[] {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      selector: node.target.join(' '),
    })),
  );
}

function formatViolations(violations: Result[]): string {
  return violations
    .map(
      (violation) =>
        `[${violation.impact ?? 'unknown'}] ${violation.id} (${violation.nodes.length}) → ${violation.helpUrl}\n` +
        violation.nodes
          .map((node) => `  ${node.target.join(' ')}: ${node.html.slice(0, 30)}...`)
          .join('\n'),
    )
    .join('\n\n');
}

export const accessibleMatcher = {
  async toBeAccessible(
    this: { isNot?: boolean },
    context: AccessibleContext,
    options?: AnalyzeOptions,
  ) {
    const axe = new AxeService();
    const results = await axe.analyze(context.page, options);
    const pass = results.violations.length === 0;

    const { violations, incomplete, inapplicable, timestamp, toolOptions, url } = results;
    // Always attach the full results JSON
    await context.testInfo.attach('axe-results.json', {
      body: JSON.stringify({ violations, incomplete, inapplicable, timestamp, toolOptions, url }, null, 2),
      contentType: 'application/json',
    });

    context.testInfo.annotations.push({
      type: 'accessibility',
      description: `Expected no violations, but found ${results.violations.length}:\n\n${formatViolations(results.violations)}`,
    })

    if (!pass) {
      await attachPageDebugScreenshot(
        context.page,
        violationIssues(results.violations),
        {
          debugId: 'a11y-accessible-debug',
          label: 'violation',
          attachmentName: 'accessibility-violations.png',
        },
      );
    }

    return {
      pass: this.isNot ? !pass : pass,
      name: 'toBeAccessible',
      message: () =>
        pass
          ? 'Expected accessibility violations, but found none'
          : `Expected no violations, but found ${results.violations.length}:\n\n${formatViolations(results.violations)}`,
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

import { expect as baseExpect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, SerialFrameSelector, Result } from 'axe-core';
import { attachPageDebugScreenshot, DebugScreenshotIssue } from './matcher-shared';

export type AccessibleContext = {
  page: Page;
  testInfo: TestInfo;
};

export type AccessibleOptions = {
  include?: SerialFrameSelector[];
  exclude?: SerialFrameSelector[];
  disableRules?: string[];
};

const TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
  'experimental',
];

export function violationFingerprints(accessibilityScanResults: AxeResults): string {
  const violationFingerprints = accessibilityScanResults.violations.map(violation => ({
    rule: violation.id,
    // These are CSS selectors which uniquely identify each element with
    // a violation of the rule in question.
    targets: violation.nodes.map(node => node.target),
  }));

  return JSON.stringify(violationFingerprints, null, 2);
}

export const accessibleExpect = baseExpect.extend({
  async toBeAccessible(context: AccessibleContext, options: AccessibleOptions = {}) {
    const builder = getAxeBuilder(context, options);
    const results = await builder.analyze();

    await attachAxeResults(context, results);
    const { violations } = results;
    const pass = violations.length === 0;

    if (!pass){
      await attachScreenshot(context, violations);
    }

    return {
      pass: this.isNot ? !pass : pass,
      message: () => `Expected page to be accessible, but found ${violations.length} violations`,
      name: 'toBeAccessible',
      log: [formatViolations(violations)],
    }
  },

  // async toMatchSnapshot(context: AccessibleContext, options: AccessibleOptions = {}) {
  //   const builder = getAxeBuilder(context, options);
  //   const results = await builder.analyze();
  //   const fingerprints = violationFingerprints(results);

  //   // eslint-disable-next-line playwright/no-standalone-expect
  //   baseExpect(fingerprints).toMatchSnapshot();
  //   return {
  //     pass: this.isNot ? false : true,
  //     message: () => 'Expected page to match snapshot',
  //     name: 'toMatchSnapshot',
  //     log: [fingerprints],
  //   }
  // },
});



function getAxeBuilder({ page }: AccessibleContext, options: AccessibleOptions = {}): AxeBuilder {
  const { include = [], exclude = [], disableRules = [] } = options;
  const builder = new AxeBuilder({ page }).withTags(TAGS);
  include.forEach(selector => builder.include(selector));
  exclude.forEach(selector => builder.exclude(selector));
  disableRules.forEach(rule => builder.disableRules(rule));
  return builder;
}

async function attachAxeResults({ testInfo }: AccessibleContext, results: AxeResults) {
  const { violations, incomplete, inapplicable, timestamp, toolOptions, url } = results;
  await testInfo.attach('axe-results.json', {
    body: JSON.stringify({ violations, incomplete, inapplicable, timestamp, toolOptions, url }, null, 2),
    contentType: 'application/json',
  });
}

async function attachScreenshot(context: AccessibleContext, violations: Result[]) {
  await attachPageDebugScreenshot(
    context.page,
    violationIssues(violations),
    {
      debugId: 'a11y-accessible-debug',
      label: 'violation',
      attachmentName: 'accessibility-violations.png',
    });
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

function violationIssues(violations: Result[]): DebugScreenshotIssue[] {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) => ({
      selector: node.target.join(' '),
    })),
  );
}

import { Locator } from '@playwright/test';
import {
  attachDebugScreenshot,
  DEFAULT_TOLERANCE_PX,
  MatcherExclusion,
  resolveExclusionSelectors,
} from './matcher-shared';

export type OverflowReason =
  | 'boxOutsideViewport'
  | 'contentWiderThanBox'
  | 'textOutsideViewport';

export type ViewportOverflowExclusion = MatcherExclusion;

/** Serializable overflow report — locators are rebuilt from `selector` + root. */
export type OverflowIssue = {
  /** CSS selector relative to the root locator (starts with `:scope` for the root itself). */
  selector: string;
  reasons: OverflowReason[];
  text: string;
  right: number;
  scrollWidth: number;
  clientWidth: number;
};

type ScanResult = OverflowIssue[];

/** Runs in the browser — passed to locator.evaluate(). */
function scanOverflowIssues(
  root: Element,
  args: { tolerance: number; exclusionSelectors: string[] },
): ScanResult {
  const { tolerance, exclusionSelectors } = args;

  const relativeSelector = (el: Element): string => {
    if (el === root) return ':scope';

    const segments: string[] = [];
    let node: Element | null = el;

    while (node && node !== root) {
      const parent: HTMLElement | null = node.parentElement;
      if (!parent) break;

      const index = Array.from(parent.children).indexOf(node) + 1;
      segments.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
      node = parent;
    }

    return segments.join(' > ');
  };

  const isVisible = (el: Element): boolean => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;

    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  };

  const isExcluded = (el: Element): boolean => {
    for (const sel of exclusionSelectors) {
      const excludedElements =
        sel === ':scope' ? [root] : Array.from(root.querySelectorAll(sel));

      for (const excluded of excludedElements) {
        if (el === excluded || excluded.contains(el)) {
          return true;
        }
      }
    }

    return false;
  };

  const hasDirectTextOutsideViewport = (el: Element): boolean => {
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType !== Node.TEXT_NODE || !(child.textContent || '').trim()) {
        continue;
      }

      const range = document.createRange();
      range.selectNodeContents(child);
      const textRect = range.getBoundingClientRect();

      if (
        textRect.right > window.innerWidth + tolerance ||
        textRect.left < -tolerance
      ) {
        return true;
      }
    }

    return false;
  };

  const isStrictAncestorSelector = (
    ancestor: string,
    descendant: string,
  ): boolean => {
    if (ancestor === descendant) return false;
    if (descendant === ':scope') return false;
    if (ancestor === ':scope') return true;

    return descendant.startsWith(`${ancestor} > `);
  };

  const keepLeafOffenders = (allIssues: ScanResult): ScanResult =>
    allIssues.filter(
      (candidate) =>
        !allIssues.some(
          (other) =>
            candidate !== other &&
            isStrictAncestorSelector(candidate.selector, other.selector),
        ),
    );

  const issues: ScanResult = [];

  for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
    if (!isVisible(el) || isExcluded(el)) continue;

    const rect = el.getBoundingClientRect();
    const reasons: OverflowReason[] = [];

    if (rect.left < -tolerance || rect.right > window.innerWidth + tolerance) {
      reasons.push('boxOutsideViewport');
    }

    if (el.scrollWidth > el.clientWidth + tolerance) {
      reasons.push('contentWiderThanBox');
    }

    if (hasDirectTextOutsideViewport(el)) {
      reasons.push('textOutsideViewport');
    }

    if (reasons.length === 0) continue;

    issues.push({
      selector: relativeSelector(el),
      reasons,
      text: (el.textContent || '').trim().slice(0, 50),
      right: Math.round(rect.right),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    });
  }

  return keepLeafOffenders(issues);
}

/** Scan a root locator (e.g. main) and return serializable overflow issues. */
export async function findOverflowIssues(
  root: Locator,
  exclusions: ViewportOverflowExclusion[] = [],
  tolerance = DEFAULT_TOLERANCE_PX,
): Promise<OverflowIssue[]> {
  const exclusionSelectors = await resolveExclusionSelectors(root, exclusions);

  return root.evaluate(scanOverflowIssues, {
    tolerance,
    exclusionSelectors,
  });
}

/** Rebuild a Playwright locator for an issue relative to the same root. */
export function overflowIssueLocator(
  root: Locator,
  issue: OverflowIssue,
): Locator {
  return root.locator(issue.selector);
}

function formatIssues(issues: OverflowIssue[]): string {
  return issues
    .map(
      (issue) =>
        `  ${issue.selector}\n` +
        `    reasons: ${issue.reasons.join(', ')}\n` +
        `    right: ${issue.right}px, scrollWidth: ${issue.scrollWidth}, clientWidth: ${issue.clientWidth}` +
        (issue.text ? `\n    text: "${issue.text}"` : ''),
    )
    .join('\n\n');
}

export const viewportOverflowMatcher = {
  async toNotOverflowViewPort(
    this: { isNot?: boolean },
    root: Locator,
    exclusions: ViewportOverflowExclusion[] = [],
    options?: { tolerance?: number },
  ) {
    const tolerance = options?.tolerance ?? DEFAULT_TOLERANCE_PX;
    const issues = await findOverflowIssues(root, exclusions, tolerance);
    const pass = issues.length === 0;

    if (!pass) {
      await attachDebugScreenshot(root, issues, {
        debugId: 'a11y-overflow-debug',
        label: 'overflow',
        attachmentName: 'viewport-overflow.png',
      });
    }

    return {
      pass: this.isNot ? !pass : pass,
      name: 'toNotOverflowViewPort',
      expected: [],
      actual: issues,
      message: () => {
        if (this.isNot) {
          return pass
            ? `Expected viewport overflow inside root, but found none`
            : `Expected no viewport overflow, but found ${issues.length}:\n\n${formatIssues(issues)}`;
        }

        return `Expected no viewport overflow inside root, but found ${issues.length} overflowing element(s):\n\n${formatIssues(issues)}`;
      },
    };
  },
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toNotOverflowViewPort(
        exclusions?: ViewportOverflowExclusion[],
        options?: { tolerance?: number },
      ): Promise<R>;
    }
  }
}

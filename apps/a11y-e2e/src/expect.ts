import { expect as baseExpect, Locator, test } from '@playwright/test';

export type OverflowReason =
  | 'boxOutsideViewport'
  | 'contentWiderThanBox'
  | 'textOutsideViewport';

export type ViewportOverflowExclusion = Locator | string;
export type TextOutsideBoxExclusion = Locator | string;

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

/** Serializable text-outside-box report — locators are rebuilt from `selector` + root. */
export type TextOutsideBoxIssue = {
  /** CSS selector relative to the root locator (starts with `:scope` for the root itself). */
  selector: string;
  text: string;
  boxRight: number;
  textRight: number;
  boxBottom: number;
  textBottom: number;
};

type TextOutsideBoxScanResult = TextOutsideBoxIssue[];

const DEFAULT_TOLERANCE_PX = 1;
const SCREENSHOT_HEIGHT_PADDING_PX = 32;

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

/** Runs in the browser — passed to locator.evaluate(). */
function scanTextOutsideBoxIssues(
  root: Element,
  args: { tolerance: number; exclusionSelectors: string[] },
): TextOutsideBoxScanResult {
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

  const getTextOutsideBoxIssue = (
    el: Element,
  ): Omit<TextOutsideBoxIssue, 'selector'> | null => {
    const box = el.getBoundingClientRect();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);

    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!(node.textContent || '').trim()) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      const text = range.getBoundingClientRect();

      if (
        text.right > box.right + tolerance ||
        text.left < box.left - tolerance ||
        text.bottom > box.bottom + tolerance ||
        text.top < box.top - tolerance
      ) {
        return {
          text: (node.textContent || '').trim().slice(0, 50),
          boxRight: Math.round(box.right),
          textRight: Math.round(text.right),
          boxBottom: Math.round(box.bottom),
          textBottom: Math.round(text.bottom),
        };
      }
    }

    return null;
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

  const keepLeafOffenders = (allIssues: TextOutsideBoxScanResult): TextOutsideBoxScanResult =>
    allIssues.filter(
      (candidate) =>
        !allIssues.some(
          (other) =>
            candidate !== other &&
            isStrictAncestorSelector(candidate.selector, other.selector),
        ),
    );

  const issues: TextOutsideBoxScanResult = [];

  for (const el of [root, ...Array.from(root.querySelectorAll('*'))]) {
    if (!isVisible(el) || isExcluded(el)) continue;

    const issue = getTextOutsideBoxIssue(el);
    if (!issue) continue;

    issues.push({
      selector: relativeSelector(el),
      ...issue,
    });
  }

  return keepLeafOffenders(issues);
}

async function relativeSelectorFromRoot(
  root: Locator,
  target: Locator,
): Promise<string | null> {
  const rootHandle = await root.elementHandle();
  if (!rootHandle) return null;

  try {
    return await target.evaluate((el, rootEl) => {
      if (!(rootEl instanceof Element) || !rootEl.contains(el)) return null;
      if (el === rootEl) return ':scope';

      const segments: string[] = [];
      let node: Element | null = el;

      while (node && node !== rootEl) {
        const parent: Element | null = node.parentElement;
        if (!parent) return null;

        const index = Array.from(parent.children).indexOf(node) + 1;
        segments.unshift(`${node.tagName.toLowerCase()}:nth-child(${index})`);
        node = parent;
      }

      return segments.join(' > ');
    }, rootHandle);
  } finally {
    await rootHandle.dispose();
  }
}

async function resolveExclusionSelectors(
  root: Locator,
  exclusions: ViewportOverflowExclusion[],
): Promise<string[]> {
  const resolved: string[] = [];

  for (const exclusion of exclusions) {
    if (typeof exclusion === 'string') {
      resolved.push(exclusion);
      continue;
    }

    const selector = await relativeSelectorFromRoot(root, exclusion);
    if (selector) resolved.push(selector);
  }

  return resolved;
}

/** Scan a root locator and return elements whose text exceeds their box. */
export async function findTextOutsideBoxIssues(
  root: Locator,
  exclusions: TextOutsideBoxExclusion[] = [],
  tolerance = DEFAULT_TOLERANCE_PX,
): Promise<TextOutsideBoxIssue[]> {
  const exclusionSelectors = await resolveExclusionSelectors(root, exclusions);

  return root.evaluate(scanTextOutsideBoxIssues, {
    tolerance,
    exclusionSelectors,
  });
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

/** Runs in the browser — passed to locator.evaluate(). */
function applyDebugHighlights(
  root: Element,
  args: { selectors: string[]; debugId: string; label: string },
): void {
  document.getElementById(args.debugId)?.remove();

  const debugRoot = document.createElement('div');
  debugRoot.id = args.debugId;
  debugRoot.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';

  for (const selector of args.selectors) {
    const el =
      selector === ':scope' ? root : root.querySelector(selector);
    if (!(el instanceof HTMLElement)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const overlay = document.createElement('div');
    overlay.setAttribute('data-a11y-debug-overlay', selector);
    overlay.style.cssText = [
      'position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'border:4px dashed #c62828',
      'box-sizing:border-box',
      'pointer-events:none',
      'box-shadow:0 0 0 2px #fff, 0 0 8px #c62828',
    ].join(';');

    const tag = document.createElement('span');
    tag.textContent = args.label;
    tag.style.cssText = [
      'position:absolute',
      'top:-1.4rem',
      'left:0',
      'padding:0.1rem 0.35rem',
      'background:#c62828',
      'color:#fff',
      'font:600 11px/1.2 sans-serif',
      'white-space:nowrap',
    ].join(';');
    overlay.appendChild(tag);
    debugRoot.appendChild(overlay);
  }

  document.body.appendChild(debugRoot);
}

/** Runs in the browser — passed to page.evaluate(). */
function measureContentHeight(): number {
  window.scrollTo(0, 0);

  for (const el of Array.from(document.querySelectorAll('*'))) {
    if (el instanceof HTMLElement && el.scrollTop > 0) {
      el.scrollTop = 0;
    }
  }

  const heights: number[] = [window.innerHeight];

  const containers = [
    document.documentElement,
    document.body,
    document.querySelector('mat-sidenav-content'),
    document.querySelector('mat-sidenav-container'),
    document.querySelector('main'),
  ];

  for (const container of containers) {
    if (!(container instanceof HTMLElement)) continue;

    const rect = container.getBoundingClientRect();
    heights.push(container.scrollHeight, rect.top + container.scrollHeight);
  }

  for (const el of Array.from(document.querySelectorAll('body *'))) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    heights.push(rect.bottom);
  }

  return Math.ceil(Math.max(...heights));
}

/** Runs in the browser — passed to page.evaluate(). */
function removeDebugHighlights(debugId: string): void {
  document.getElementById(debugId)?.remove();
}

async function attachDebugScreenshot(
  root: Locator,
  issues: { selector: string }[],
  options: { debugId: string; label: string; attachmentName: string },
): Promise<void> {
  const page = root.page();
  const originalViewport =
    page.viewportSize() ??
    (await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    })));

  const contentHeight = await page.evaluate(measureContentHeight);
  const expandedHeight = Math.max(
    contentHeight + SCREENSHOT_HEIGHT_PADDING_PX,
    originalViewport.height,
  );

  await page.setViewportSize({
    width: originalViewport.width,
    height: expandedHeight,
  });

  // Shell uses height:100% — wait until expanded viewport fits the offenders.
  await page.waitForFunction(
    (minHeight) => document.documentElement.clientHeight >= minHeight,
    expandedHeight,
  );

  const selectors = issues.map((issue) => issue.selector);

  try {
    await root.evaluate(applyDebugHighlights, {
      selectors,
      debugId: options.debugId,
      label: options.label,
    });

    const screenshot = await page.screenshot();
    await test.info().attach(options.attachmentName, {
      body: screenshot,
      contentType: 'image/png',
    });
  } finally {
    await page.evaluate(removeDebugHighlights, options.debugId);
    // Keep the expanded viewport for Playwright's failure screenshot (captured
    // after this matcher returns). attachDebugScreenshot only runs on failure.
  }
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

function formatTextOutsideBoxIssues(issues: TextOutsideBoxIssue[]): string {
  return issues
    .map(
      (issue) =>
        `  ${issue.selector}\n` +
        `    text: "${issue.text}"\n` +
        `    box right/bottom: ${issue.boxRight}px / ${issue.boxBottom}px\n` +
        `    text right/bottom: ${issue.textRight}px / ${issue.textBottom}px`,
    )
    .join('\n\n');
}

export const expect = baseExpect.extend({
  async toNotOverflowViewPort(
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

  async toNotHaveElementsWithTextOutsideTheBox(
    root: Locator,
    exclusions: TextOutsideBoxExclusion[] = [],
    options?: { tolerance?: number },
  ) {
    const tolerance = options?.tolerance ?? DEFAULT_TOLERANCE_PX;
    const issues = await findTextOutsideBoxIssues(root, exclusions, tolerance);
    const pass = issues.length === 0;

    if (!pass) {
      await attachDebugScreenshot(root, issues, {
        debugId: 'a11y-text-outside-box-debug',
        label: 'text outside box',
        attachmentName: 'text-outside-box.png',
      });
    }

    return {
      pass: this.isNot ? !pass : pass,
      name: 'toNotHaveElementsWithTextOutsideTheBox',
      expected: [],
      actual: issues,
      message: () => {
        if (this.isNot) {
          return pass
            ? `Expected elements with text outside their box inside root, but found none`
            : `Expected no text-outside-box issues, but found ${issues.length}:\n\n${formatTextOutsideBoxIssues(issues)}`;
        }

        return `Expected no elements with text outside their box inside root, but found ${issues.length}:\n\n${formatTextOutsideBoxIssues(issues)}`;
      },
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toNotOverflowViewPort(
        exclusions?: ViewportOverflowExclusion[],
        options?: { tolerance?: number },
      ): Promise<R>;
      toNotHaveElementsWithTextOutsideTheBox(
        exclusions?: TextOutsideBoxExclusion[],
        options?: { tolerance?: number },
      ): Promise<R>;
    }
  }
}

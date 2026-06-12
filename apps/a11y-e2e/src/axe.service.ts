import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, SerialFrameSelector } from 'axe-core';
import { Locator, Page } from '@playwright/test';

export type Selector = SerialFrameSelector | Locator;
export type AnalyzeOptions = {
  include?: Selector[];
  exclude?: Selector[];
};

function isLocator(param: unknown): param is Locator {
  return (
    typeof param === 'object' &&
    param !== null &&
    typeof (param as Locator)['locator'] === 'function'
  );
}

function getLocatorSelector(locator: Locator): string | undefined {
  return isLocator(locator) && locator['_selector']
    ? locator['_selector']
    : undefined;
}

export class AxeService {
  private static TAGS = [
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'best-practice',
    'experimental',
  ];

  private getBuilder(
    page: Page,
    { include, exclude }: AnalyzeOptions = { include: [], exclude: [] },
  ): AxeBuilder {
    const builder = new AxeBuilder({ page }).withTags(AxeService.TAGS);

    this.addIncludes(builder, include);
    this.addExcludes(builder, exclude);
    return builder;
  }

  private addIncludes(builder: AxeBuilder, includes?: Selector[]): void {
    if (!includes) return;
    includes.forEach((include) => {
      const selector = isLocator(include)
        ? getLocatorSelector(include)
        : include;
      if (selector) builder = builder.include(selector);
    });
  }

  private addExcludes(builder: AxeBuilder, excludes?: Selector[]): void {
    if (!excludes) return;
    excludes.forEach((exclude) => {
      const selector = isLocator(exclude)
        ? getLocatorSelector(exclude)
        : exclude;
      if (selector) builder = builder.exclude(selector);
    });
  }

  async analyze(
    page: Page,
    options: AnalyzeOptions = { include: [], exclude: [] },
  ): Promise<AxeResults> {
    const builder = this.getBuilder(page, options);
    return builder.analyze();
  }
}

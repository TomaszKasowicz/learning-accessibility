import type { RunOptions } from 'axe-core';

/** WCAG 2.x Level A + AA — common default tag set for axe runs. */
export const AXE_DEFAULT_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
] as const;

export const AXE_RUN_OPTIONS: RunOptions = {
  runOnly: {
    type: 'tag',
    values: [...AXE_DEFAULT_TAGS],
  },
  // rules: { 'target-size': { enabled: true } }
};

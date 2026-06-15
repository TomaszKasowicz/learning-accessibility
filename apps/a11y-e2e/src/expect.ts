import { expect as baseExpect, mergeExpects } from '@playwright/test';
import { obscuredExpect } from './to-be-obscured';
import { textOutsideBoxExpect } from './to-not-have-elements-with-text-outside-the-box';
import { viewportOverflowMatcher } from './to-not-overflow-viewport';
import { focusOrderExpect } from './to-have-focus-order';
import { accessibleExpect } from './to-be-accessible';

export type { AccessibleContext } from './to-be-accessible';
export type { ObscuredAnalysis } from './to-be-obscured';
export type {
  OverflowIssue,
  OverflowReason,
  ViewportOverflowExclusion,
} from './to-not-overflow-viewport';
export type {
  TextOutsideBoxExclusion,
  TextOutsideBoxIssue,
} from './to-not-have-elements-with-text-outside-the-box';

export { analyzeElementObscured } from './to-be-obscured';
export {
  findOverflowIssues,
  overflowIssueLocator,
} from './to-not-overflow-viewport';
export { findTextOutsideBoxIssues } from './to-not-have-elements-with-text-outside-the-box';


const extendedExpect = baseExpect
.extend(viewportOverflowMatcher)

export const expect = mergeExpects(
  focusOrderExpect,
  extendedExpect,
  accessibleExpect,
  obscuredExpect,
  textOutsideBoxExpect
);

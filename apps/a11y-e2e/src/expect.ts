import { expect as baseExpect } from '@playwright/test';
import { accessibleMatcher } from './to-be-accessible';
import { obscuredMatcher } from './to-be-obscured';
import { textOutsideBoxMatcher } from './to-not-have-elements-with-text-outside-the-box';
import { viewportOverflowMatcher } from './to-not-overflow-viewport';

export type { AnalyzeOptions } from './axe.service';
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

export { AxeService } from './axe.service';
export { analyzeElementObscured } from './to-be-obscured';
export {
  findOverflowIssues,
  overflowIssueLocator,
} from './to-not-overflow-viewport';
export { findTextOutsideBoxIssues } from './to-not-have-elements-with-text-outside-the-box';

export const expect = baseExpect
  .extend(accessibleMatcher)
  .extend(obscuredMatcher)
  .extend(viewportOverflowMatcher)
  .extend(textOutsideBoxMatcher);

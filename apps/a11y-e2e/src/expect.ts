import { expect as baseExpect } from '@playwright/test';
import { viewportOverflowMatcher } from './to-not-overflow-viewport';
import { textOutsideBoxMatcher } from './to-not-have-elements-with-text-outside-the-box';

export type {
  OverflowIssue,
  OverflowReason,
  ViewportOverflowExclusion,
} from './to-not-overflow-viewport';
export {
  findOverflowIssues,
  overflowIssueLocator,
} from './to-not-overflow-viewport';

export type {
  TextOutsideBoxExclusion,
  TextOutsideBoxIssue,
} from './to-not-have-elements-with-text-outside-the-box';
export { findTextOutsideBoxIssues } from './to-not-have-elements-with-text-outside-the-box';

export const expect = baseExpect
  .extend(viewportOverflowMatcher)
  .extend(textOutsideBoxMatcher);

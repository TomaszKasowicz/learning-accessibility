# Mission: Web Accessibility + Tooling → a WCAG-fixing Skill

## Why
I want to build a reusable agent skill that drives accessibility tooling (axe, Lighthouse, eslint a11y, pa11y, Playwright+axe, plus manual screen-reader/keyboard checks) to find and fix violations in my code until it passes axe-core's default ruleset. To build and operate that skill well, I need to genuinely understand what those tools report and how to fix it — not just paste their output.

## Success looks like
- I can read an axe-core violation (rule id, impact, tags, target node, failure summary) and know exactly what WCAG criterion it maps to and how to fix it.
- I can run each tool in the pipeline and know which layer of bugs each one catches (lint vs. rendered DOM vs. manual).
- I can fix the common axe default-ruleset violations in Angular templates and plain HTML/web components (with occasional React).
- I have a working agent skill that, given a component/page, runs the tools, triages results, applies fixes, and re-verifies against the axe default ruleset.

## Constraints
- Primary stacks: Angular and plain HTML / web components; occasionally React.
- Compliance bar = axe-core's WCAG A/AA rules + best practices. NOTE: axe's *defaults* are `wcag2a/2aa`, `wcag21a/21aa`, `best-practice` only — WCAG 2.2 rules are OFF by default. The skill must explicitly opt in to `wcag22aa` (currently just the `target-size` rule) AND carry a manual checklist for the 5 non-automatable 2.2 A/AA criteria.
- Solid on a11y concepts already; main gap is *recent* rules (WCAG 2.2 additions, current axe rule set).
- Prefer tight, tool-grounded feedback loops over theory dumps.

## Out of scope (for now)
- WCAG AAA criteria (beyond awareness).
- PDF / native mobile / document accessibility.
- Deep assistive-tech internals beyond what's needed to verify fixes.

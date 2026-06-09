---
name: fix-wcag
description: Find and fix web accessibility violations in code using axe-core, lint, and Playwright, then drive it toward WCAG 2.x A/AA compliance. Use when the user wants to fix accessibility, a11y, WCAG, or axe violations; make a component/page accessible; add accessibility tests; or mentions axe, pa11y, Lighthouse, screen readers, or ARIA fixes. Primary stacks: Angular and plain HTML/web components (also React).
---

# fix-wcag

Drive code toward **axe-core's WCAG A/AA + best-practice bar, including WCAG 2.2**, via a layered pipeline. Automated tools catch only ~30–50% of issues, so this skill has two arms: an **automated arm** (lint + axe) and a **manual arm** (a checklist for what tools can't verify). Never claim "WCAG compliant" from automation alone.

## Compliance bar (what "done" means)

axe tags `wcag2a wcag2aa wcag21a wcag21aa wcag22aa best-practice`. The `wcag22aa` tag already runs the WCAG 2.2 `target-size` rule (SC 2.5.8): **selecting a rule by tag in `runOnly` overrides its `enabled:false` default** — verified by live scan on axe-core 4.11.4 and 4.12.0. `target-size`'s `enabled:false` flag only suppresses it on a *bare* `axe.run()` with no `runOnly`. The skill *also* sets `rules: { 'target-size': { enabled: true } }` as a redundant-but-harmless safety net (it keeps the rule running even if someone drops the `wcag22aa` tag); it is idempotent, so the config is safe either way.

## Workflow

1. **Scope.** Identify the target: a component, template, page, or whole route. Prefer the smallest unit (a component / Storybook story) — scan it with axe `include`.
2. **Static pass (cheap, first).** Run the linters and fix what they flag:
   - Angular: `@angular-eslint/template/accessibility-*` rules.
   - React/JSX: `eslint-plugin-jsx-a11y` (recommended config).
3. **Runtime pass (axe).** Run `scripts/scan.spec.ts` (copy/adapt URL or `include` selector). It uses the correct config — note `.options()` overrides `withTags()`, so `runOnly` **and** `rules:{ 'target-size': { enabled:true } }` live in one `.options({})` call.
4. **Triage + fix.** For each `violation`: read `id`, `impact`, `helpUrl`, and `nodes[].target`. Fix by impact order (critical → serious → moderate → minor) using the recipes in [FIXES.md](FIXES.md). Default instinct: **prefer native HTML over div+ARIA.**
5. **Re-run** step 3 until `violations` is empty. Then surface `results.incomplete` — these need a human.
6. **Manual arm.** Walk [MANUAL-CHECKLIST.md](MANUAL-CHECKLIST.md): the 5 non-automatable WCAG 2.2 A/AA criteria + keyboard + screen-reader checks. Report unchecked items to the user; do not mark them done on the user's behalf.
7. **Report honestly.** State: violations fixed, rules disabled (with TODOs), `incomplete` items, and the manual checklist status. Claim conformance only for what was actually verified.

## Quick start (runtime scan)

```bash
npm i -D @playwright/test @axe-core/playwright && npx playwright install chromium
# adapt the URL / include() in scripts/scan.spec.ts, then:
npx playwright test scripts/scan.spec.ts
```

## Rules

- A passing axe run ≠ WCAG 2.2 AA. The manual arm is mandatory for an honest compliance claim.
- When ratcheting on legacy code, `disableRules([...])` with a `// TODO` rather than weakening the tag set — keep the gate protecting against new regressions.
- `placeholder` is not a label; an empty `alt`/`aria-label` is not a name. Names must be meaningful — only a human (or the user) confirms that.
- Lighthouse runs a *subset* of axe; never use it as the gate. pa11y can add a second engine (HTML CodeSniffer) but does not replace the manual arm.

## Resources

- [FIXES.md](FIXES.md) — axe rule → Angular/HTML fix recipes for the most common violations.
- [MANUAL-CHECKLIST.md](MANUAL-CHECKLIST.md) — the manual arm (non-automatable 2.2 criteria, keyboard, screen reader).
- [scripts/scan.spec.ts](scripts/scan.spec.ts) — ready-to-run Playwright + axe scan with the correct bar.

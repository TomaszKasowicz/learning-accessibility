# Packaging an axe scan as a `toBeAccessible()` matcher (`expect.extend`)

Covered in lesson `0007`; reference snippet at `reference/playwright-axe-matcher.html`. Grounded in Playwright's `expect.extend` docs + the official accessibility-testing guide, not parametric memory.

## The three approaches form a refactoring ladder
From the Backbase R&D doc "Automated accessibility testing with Playwright":
1. **Simple / inline** — `new AxeBuilder({page}).withTags([...]).analyze()` then `expect(results.violations).toEqual([])`. This is what `scan.spec.ts` does today. Two caveats: config duplication, unreadable report.
2. **Fixture** — a shared `makeAxeBuilder()` fixture so each test gets a consistently configured builder. Fixes duplication only.
3. **Custom matcher** — `expect.extend({ toBeAccessible })`. Fixes duplication AND report readability.

## Key facts (the non-obvious bits)
- **Matcher contract is tiny:** return `{ pass: boolean, message: () => string }` (+ optional `name`). `message()` is lazy — only invoked on failure (or `.not` success).
- **`.not` support is manual:** `if (this.isNot) pass = !pass;` per the Playwright docs example. Without it, `.not.toBeAccessible()` is wrong.
- **Subject can be anything** passed to `expect(...)`. Passing `{ page, testInfo }` (matching the doc's level-3 example) is what unlocks `testInfo.attach('axe-results.json', ...)` — the mechanism that fixes the "report hard to read" caveat. With only `page` you cannot attach.
- **Single source of truth:** the compliance bar (`BAR` = the six tags + `target-size` enable, lifted from `scan.spec.ts`) lives once in the fixture, not per spec. Stops the bar drifting.
- **TS needs augmentation:** `expect.extend` is runtime-only; add `declare global { namespace PlaywrightTest { interface Matchers<R> { toBeAccessible(...): Promise<R> } } }`.
- **Escape hatches stay local:** unfixable-yet violations → per-call `disableRules: [...]` / `include: '...'` with a `TODO` + Jira ref. Never weaken the shared `BAR` (matches doc p.5 guidance; consistent with the skill's honest-reporting rule).

## Why it matters for the mission
The `fix-wcag` skill scans many components. A matcher makes the bar reusable + the failure message a structured triage feed (`[impact] id (n) → helpUrl  selector`) the skill can parse to apply fixes. Natural follow-up: migrate `.agents/skills/fix-wcag/scripts/scan.spec.ts` from level 1 → level 3.

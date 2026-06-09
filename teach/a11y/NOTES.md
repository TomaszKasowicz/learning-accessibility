# Working Notes

## Teaching preferences
- Wants tight, tool-grounded feedback loops over theory. Solid on a11y concepts; gap was *recent* rules (WCAG 2.2) and tooling automation.
- Stacks: Angular + plain HTML/web components; occasionally React.

## Mission deliverable — STATUS: drafted
The WCAG-fixing skill is built at `.agents/skills/fix-wcag/`:
- `SKILL.md` — two-arm workflow (automated lint+axe / manual checklist), honest-reporting rules.
- `FIXES.md` — axe rule → Angular/HTML fix recipes.
- `MANUAL-CHECKLIST.md` — non-automatable 2.2 criteria + keyboard + screen-reader passes.
- `scripts/scan.spec.ts` — Playwright+axe scan with the correct bar (target-size explicitly enabled).

Open follow-ups when ready:
- Validate the skill by running it against a real Angular module/app (needs a target repo — see RESOURCES.md Gaps).
- If promoting into this repo's published set: add README + `.claude-plugin/plugin.json` entries per CLAUDE.md bucket rules (currently it lives only in `.agents/skills/`, unpublished).

## Session findings (2026-06-09) — axe rule selection + target-size

Two things explored hands-on against the live app (`localhost:4300/pointer-size`, axe 4.11.4 via @axe-core/playwright; app itself uses axe 4.12.0). Both verified by running the Playwright test and reading axe's own check `data`, not by reasoning.

**1. How axe decides which rules run** → lesson `0006`, record `0003` (which CORRECTS records `0001`/`0002`).
- A rule runs if EITHER: (a) its tag is named in `runOnly:{type:'tag'}`, OR (b) `rules:{ id:{ enabled:true } }`.
- Naming the `wcag22aa` tag **already runs `target-size`** — overrides its `enabled:false` default. The `enabled:false` flag only matters on a bare `axe.run()` with no `runOnly`.
- `.withTags([...])` / `.withRules([...])` = builder sugar for `runOnly` / `rules`; same engine. Gotcha: `.options()` REPLACES `.withTags`/`.withRules` — don't mix.
- The explicit `rules:{ 'target-size':{enabled:true} }` in scan.spec.ts is a redundant-but-harmless safety net (covers a dropped tag), not the thing that enables it.
- Old myth (now corrected in 0001/0002): "the tag alone won't run target-size." False on 4.11.4 AND 4.12.0.

**2. `target-size` is size-OR-spacing, not just size** → record `0004`.
- Rule = `any:["target-size","target-offset"]` → passes if EITHER sub-check passes.
- `.small-button` (3px font) always FAILS the size check (21×8, never ≥24×24); verdict is decided by the spacing (`target-offset`) check vs the 100×100 `.large-button` neighbor.
- Spacing passes when the target's CENTER is ≥12px from the neighbor's nearest edge (offset diameter ≥24). Baseline = 23 (1px short) → why a +1px font OR +1px margin flips it to pass. Neither makes the button bigger-enough; both move its center far-enough.


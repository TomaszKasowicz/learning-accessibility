# Naming a rule's tag in `runOnly` overrides its `enabled: false` default

**This corrects [0001](0001-axe-defaults-exclude-wcag-2-2.md) and [0002](0002-engine-vs-product-target-size-default.md).** Those records claimed the `wcag22aa` *tag* alone is **not** enough to run `target-size` and that you **must** add `rules: { 'target-size': { enabled: true } }`. That claim is **wrong for the axe-core engine** — and it was wrong on 4.11.x too, not just a 4.12 change.

## What actually happens (empirically verified)

Run against the live app `http://localhost:4300/pointer-size` (a `.small-button` at `font-size:3px; padding:0`, far under 24×24px) via `@axe-core/playwright`, varying only the options:

| Config | `runOnly` tags | `rules:{target-size:enabled}` | target-size ran? | violation? |
| --- | --- | --- | --- | --- |
| A (the app's `axe.config.ts`) | includes `wcag22aa` | — (commented out) | **yes** | **yes** |
| B (`a11y.spec.ts`) | includes `wcag22aa` | enabled | yes | yes |
| C | **no** `wcag22aa` | — | no | no |
| D | none (pure default `axe.run()`) | — | no | no |
| E | **no** `wcag22aa` | enabled | yes | yes |
| F | `.withTags([…'wcag22aa'])`, no `.withRules`/`.options` | — | yes | yes |

Row F confirms the **builder API goes through the same logic**: `@axe-core/playwright`'s `.withTags([...])` is sugar for `runOnly: { type: 'tag', values: [...] }` (and `.withRules([...])` for `rules`). So `.withTags([…'wcag22aa'])` ≡ Config A/B's tag path — `target-size` runs and the test fails. (Watch the override rule: `.options()` **replaces** `withTags`/`withRules`, so don't mix them — put everything in one `.options({})` or use the `with*` builders, not both.)

And the version question (user flagged 4.12.0) — injecting each engine into the same page, tag-only, no `rules:{}`:

```
4.11.4: target-size ran=true violated=true
4.12.0: target-size ran=true violated=true
```

## The corrected model

axe selects rules in two different paths:

- **Default path (no `runOnly`):** runs every rule whose metadata is `enabled: true` (and not `experimental`). Here `enabled: false` keeps `target-size` OUT. → Configs D (and C, which simply doesn't request the tag).
- **`runOnly: { type: 'tag' }` path:** runs every rule whose tags intersect the requested tags. **Naming the tag is itself the opt-in; the `enabled` flag is not consulted in this path.** → Config A runs `target-size` from the `wcag22aa` tag alone.
- `rules: { id: { enabled: true } }` is an *independent* opt-in that works even without the tag (Config E).

So the metadata is genuinely `enabled: false` (verified: `require('axe-core')._audit.rules.find(r=>r.id==='target-size').enabled === false` on 4.12.0), but that only bites in the default path. Documented in axe-core API.md §"Run a modified set of rules using tags and rule enable".

## Why 0001/0002 went wrong

0002's "verification" only inspected the **metadata flag** (`ts.enabled // => false`) and then *inferred* the tag-only behavior from rule-descriptions.md wording + issue #3751. It never ran a tag-only scan. The inference was plausible but false. Lesson for this workspace: **a claim about runtime behavior must be backed by a runtime scan, not a metadata read.**

## Consequence for the skill / mission

- The deliverable's config still works: explicitly enabling `target-size` is **idempotent and harmless** — keep it as defensive belt-and-suspenders. Nothing breaks.
- But the **explanation** baked into `SKILL.md` and `scan.spec.ts` ("a tag alone will NOT run it") is factually wrong and must be reworded to: *"the `wcag22aa` tag alone already runs `target-size`; we also enable it explicitly so the bar holds even if someone scans without that tag."*
- The honest compliance claim is unchanged: passing axe (even with `target-size`) ≠ WCAG 2.2 AA, because of the 5 non-automatable new A/AA criteria. The two-arm skill design still stands.

**Wording rule going forward:** "`target-size`'s metadata is `enabled: false`, which only affects the no-`runOnly` default run. Requesting the `wcag22aa` tag in `runOnly` runs it regardless." Don't say "the tag won't run it."

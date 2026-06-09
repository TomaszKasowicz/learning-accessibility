# axe defaults exclude WCAG 2.2; only `target-size` is automatable

> **⚠️ CORRECTED by [0003](0003-tag-in-runonly-overrides-enabled-false.md).** The paragraph below claiming "adding the `wcag22aa` *tag* to `runOnly` is **not** enough to run `target-size`" is **false**. Empirically (live scans, both axe 4.11.4 and 4.12.0), naming the `wcag22aa` tag in `runOnly` **does** run `target-size`. The `enabled: false` flag only affects the no-`runOnly` default run. Read 0003 before trusting the enabling mechanism described here.
>
> **Update:** "disabled by default" is true of the **axe-core engine** specifically; product layers (axe DevTools) may default WCAG 2.2 on. See [0002](0002-engine-vs-product-target-size-default.md) for the (also partly-superseded) reconciliation.

The axe-core engine ships WCAG 2.2 rules **disabled by default** — plain `axe.run()` does not test them. The only WCAG 2.2 rule in axe-core is `target-size` (SC 2.5.8); Deque states it's likely the only one that will ever be added, because the other new criteria can't be automated without false positives.

**Precise enabling mechanism (corrected):** adding the `wcag22aa` *tag* to `runOnly` is **not** enough to run `target-size`. A tag only *selects among already-enabled rules*; it does not flip a disabled-by-default rule on. You must explicitly enable it: `rules: { 'target-size': { enabled: true } }` (per axe-core maintainer, issue #3751). In `@axe-core/playwright`, `.options()` overrides `withTags`/`withRules`, so pass both `runOnly` and `rules` inside a single `.options({...})` call.

Why it matters for future sessions: the skill cannot equate "passes axe defaults" with "WCAG 2.2 AA compliant." Its design must have two arms — (1) automated axe run with the `wcag22aa` tag explicitly enabled, and (2) a manual checklist prompting a human for the 5 non-automatable new A/AA criteria (3.2.6, 3.3.7, 2.4.11, 2.5.7, 3.3.8). This reshapes the skill architecture and the compliance claim it can honestly make.

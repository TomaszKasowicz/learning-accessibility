# `target-size` default: the engine says OFF, product layers may say ON

> **⚠️ PARTIALLY CORRECTED by [0003](0003-tag-in-runonly-overrides-enabled-false.md).** The `enabled: false` metadata claim here is correct and still verified. But the inference drawn from it — that "you must explicitly enable via `rules:{}`" because the tag won't — is **wrong**: this record only inspected the metadata flag and never ran a tag-only scan. A live scan shows the `wcag22aa` tag in `runOnly` runs `target-size` on its own (4.11.4 and 4.12.0 alike). The explicit enable is still fine (idempotent), just not *required*.

Follow-up to [0001](0001-axe-defaults-exclude-wcag-2-2.md). A dispute arose: the user observed `target-size` "enabled by default with the `wcag22aa` tag" in their setup, contradicting 0001's claim that WCAG 2.2 rules are off by default.

**Resolved — both are right, at different layers.** The contradiction is engine vs. product:

- **The engine (`axe-core`, what `@axe-core/playwright` runs): OFF by default.** Verified empirically against the installed `axe-core@4.11.4`, not just docs:
  ```js
  const ts = require('axe-core')._audit.rules.find(r => r.id === 'target-size');
  ts.enabled        // => false
  ts.tags           // => ['cat.sensory-and-visual-cues', 'wcag22aa', 'wcag258']
  // target-size is the ONLY wcag22aa-tagged rule, and it is disabled.
  ```
  Confirmed still true on axe-core `develop` HEAD: rule-descriptions.md keeps "These [WCAG 2.2] rules are disabled by default, until WCAG 2.2 is more widely adopted and required." Maintainer guidance (issue #3751): enable via `rules: { 'target-size': { enabled: true } }`.

- **Product layers may default it ON.** axe DevTools (browser extension / Pro) and some CLI wrappers ship their own ruleset config and can enable WCAG 2.2 out of the box. If the user ran `axe init` / a DevTools UI and saw `target-size` on "by default," that is the *product's* default, not the engine's. Those product defaults do **not** transfer to a raw `@axe-core/playwright` run.

**Consequence for the skill:** no change needed — explicitly enabling `rules: { 'target-size': { enabled: true } }` is correct and **idempotent/harmless** regardless of layer. It guarantees the rule runs even on the bare engine, and re-enabling an already-on rule is a no-op. Keep the explicit enable in `scan.spec.ts` and the skill.

**Wording rule going forward:** say "off by default *in the axe-core engine*; some product layers (axe DevTools) default it on." Don't state "off by default" unqualified, or it appears to conflict with what the user sees in DevTools.

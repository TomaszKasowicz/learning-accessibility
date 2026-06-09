# Web Accessibility + Tooling Resources

## Knowledge

### Standards (the "what")
- [W3C: WCAG 2.2 (Recommendation)](https://www.w3.org/TR/WCAG22/) — the normative spec. Use for: exact success-criterion wording, conformance definitions.
- [W3C: What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — the 9 new criteria with persona quotes. Use for: closing the "recent rules" gap.
- [Deque University: WCAG 2.2 Updates](https://dequeuniversity.com/resources/wcag-2.2/) — plain-language summaries + code examples of each new SC. Use for: how to actually fix the 2.2 additions.
- [W3C: How to Meet WCAG (Quick Reference)](https://www.w3.org/WAI/WCAG22/quickref/) — filterable list of every SC with techniques/failures. Use for: "what technique fixes SC x.y.z".

### axe-core (the compliance engine the skill targets)
- [axe-core API documentation (Deque)](https://www.deque.com/axe/core-documentation/api-documentation/) — `axe.run`, `runOnly`, tags, result shape. Use for: configuring the skill's scan + reading results.
- [axe-core `doc/API.md` (GitHub)](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) — canonical tag table & result schema. Use for: mapping tags → WCAG, impact values.
- [axe-core rule descriptions (GitHub)](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) — every rule, its tags, and impact. Use for: the master fix checklist.
- [Deque University rule reference (`dequeuniversity.com/rules/axe`)](https://dequeuniversity.com/rules/axe/) — the `helpUrl` each violation links to. Use for: per-rule "how to fix".

### ARIA & accessible names (the "why fixes work")
- [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/) — patterns + naming/description techniques. Use for: correct ARIA for custom widgets/web components.
- [Accessible Name & Description Computation 1.2](https://www.w3.org/TR/accname-1.2/) — the precedence algorithm (aria-labelledby > aria-label > native > content > title). Use for: debugging "element has no accessible name".
- [MDN: ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) — practical, example-driven. Use for: quick attribute lookups.

### Tooling (the "with what")
- [axe-core rule descriptions / engine](https://github.com/dequelabs/axe-core) — the engine under most tools. Use for: source of truth on default rules.
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — `AxeBuilder({ page }).withTags([...]).analyze()`. Use for: automated DOM scans in tests/CI.
- [pa11y](https://github.com/pa11y/pa11y) & [pa11y-ci](https://github.com/pa11y/pa11y-ci) — runs axe-core and/or HTML CodeSniffer headless. Use for: CLI/CI gating, two-engine cross-check.
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) — static JSX a11y lint (React). Use for: catch issues at write-time.
- [@angular-eslint template a11y rules](https://github.com/angular-eslint/angular-eslint) — `@angular-eslint/template/accessibility-*` rules. Use for: Angular template static checks.
- [Lighthouse accessibility scoring](https://developer.chrome.com/docs/lighthouse/accessibility/scoring) — axe subset + weighting. Use for: quick page-level signal (not a substitute for full axe).
- [web.dev: Accessibility auditing](https://web.dev/articles/accessibility-auditing-react) — how lint + rendered-DOM tools combine. Use for: pipeline design.

### Manual verification (what tools can't catch)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/) — keyboard nav testing. Use for: manual tab-order/focus checks.
- [WebAIM: Screen Reader testing](https://webaim.org/articles/voiceover/) (VoiceOver) / [NVDA](https://webaim.org/articles/nvda/) — Use for: verifying announced names/roles/states after a fix.

## Wisdom (Communities)
- [WebAIM mailing list / articles](https://webaim.org/discussion/) — long-running, high-signal a11y practitioner community.
- [A11y Slack (web-a11y.slack.com)](https://web-a11y.slack.com/) — active practitioners; good for "is this an axe false positive?" questions.
- [Deque axe-core GitHub Discussions/Issues](https://github.com/dequelabs/axe-core/issues) — go here when a rule's behavior is unclear or you suspect a bug.
- (Note: user preference on joining communities not yet recorded — ask before pushing these.)

## Gaps
- No chosen reference Angular/web-component repo to practice fixes against yet — may want a small sample app or real module to run the pipeline on.
- Skill packaging conventions for this repo (`engineering/` bucket, README + plugin.json entries) not yet folded into the mission — relevant once we build the actual skill.

# MANUAL-CHECKLIST.md — the manual arm

Automated tools catch ~30–50% of WCAG issues. These checks need a human. Run them after the automated arm is green. Report each item's status to the user; **do not mark items passed on the user's behalf** — you can't perceive a screen reader or judge whether a name is meaningful.

## A. The 5 non-automatable WCAG 2.2 A/AA criteria
axe can only auto-detect 2.5.8 (Target Size). The rest are manual:

- [ ] **3.2.6 Consistent Help (A)** — if a help mechanism repeats across pages, it appears in the same relative order each time. (Use a shared layout component.)
- [ ] **3.3.7 Redundant Entry (A)** — info entered earlier in a process isn't requested again; it's prefilled or selectable.
- [ ] **2.4.11 Focus Not Obscured (AA)** — when an element is focused, it isn't entirely hidden by sticky headers, banners, or toasts. (Test: Tab through; watch the focused element near fixed bars.)
- [ ] **2.5.7 Dragging Movements (AA)** — anything done by dragging (reorder, slider, drag-drop) has a single-pointer alternative (tap/click/buttons).
- [ ] **3.3.8 Accessible Authentication (AA)** — login allows password managers / paste / passkeys; no memorise-and-transcribe or puzzle without an alternative.

## B. Keyboard-only pass (no mouse)
- [ ] Every interactive element is reachable with Tab and operable with Enter/Space (and Esc closes dialogs/menus).
- [ ] Focus order is logical (follows visual/reading order).
- [ ] A **visible focus indicator** is always present.
- [ ] No **keyboard trap** — you can Tab out of every widget (menus, modals, editors).
- [ ] Custom widgets follow expected keys (arrows for tabs/menus/radios) — see the ARIA APG pattern.

## C. Screen-reader pass (VoiceOver on macOS: Cmd+F5 · NVDA on Windows)
- [ ] Each control announces a **meaningful** name (not "button", "image123.png", "link").
- [ ] Role and state are announced correctly (e.g. "checkbox, checked", "expanded").
- [ ] Dynamic updates (toasts, validation, async results) are announced (`aria-live` where needed).
- [ ] Images convey equivalent info; decorative images are silent (`alt=""`).
- [ ] Headings and landmarks let you navigate the page structure sensibly.

## D. Visual / zoom
- [ ] Content reflows and stays usable at 200% zoom and 320px width.
- [ ] Information isn't conveyed by color alone (e.g. error state has text/icon, not just red).

## Reporting template
> Automated: N violations fixed, M rules disabled (TODO: …), K incomplete items.
> Manual: A=[…], B=[…], C=[…], D=[…] — items unchecked require user verification.
> Honest claim: "Passes the automated axe bar; full WCAG 2.2 AA conformance pending the manual items above."

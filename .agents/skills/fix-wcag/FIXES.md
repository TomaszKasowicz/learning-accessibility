# FIXES.md — axe rule → fix recipes

Most common axe violations and how to fix them in Angular templates and plain HTML/web components. Two instincts solve the majority: **(1) give the element a meaningful accessible name; (2) prefer native HTML over `div` + ARIA.** Each rule's `helpUrl` (in the axe result) has the canonical guidance.

## image-alt — Images must have alt text (critical · SC 1.1.1)
Informative images need a meaningful `alt`; decorative images need empty `alt=""`.
```html
<!-- bad -->  <img [src]="user.avatar">
<!-- good --> <img [src]="user.avatar" [alt]="user.name + ' avatar'">
<!-- decorative --> <img src="divider.svg" alt="">
```
Lint: `@angular-eslint/template/accessibility-alt-text`.

## button-name — Buttons must have discernible text (critical · SC 4.1.2)
Icon-only buttons have no text content → no accessible name.
```html
<button mat-icon-button (click)="close()" aria-label="Close dialog">
  <mat-icon>close</mat-icon>
</button>
```

## link-name — Links must have discernible text (serious · SC 4.1.2 / 2.4.4)
```html
<a [routerLink]="['/post', id]" [attr.aria-label]="'Read ' + title">
  <mat-icon>arrow_forward</mat-icon>
</a>
```
Use `[attr.aria-label]` for bound values; plain `aria-label` for static strings. Avoid "click here".

## label — Form fields must have labels (critical · SC 4.1.2 / 1.3.1)
`placeholder` is NOT a label.
```html
<label for="email">Email</label>
<input id="email" type="email" [(ngModel)]="email">
<!-- Angular Material: <mat-form-field><mat-label>Email</mat-label><input matInput>… -->
```
Lint: `@angular-eslint/template/accessibility-label-has-associated-control`.

## color-contrast — Text contrast (serious · SC 1.4.3)
Need ≥ 4.5:1 normal text, ≥ 3:1 large (≥24px, or ≥18.66px bold). Computed from rendered styles → **DOM-scan only, lint can't catch it.** Fix in design tokens, not per-component.

## aria-* (valid-attr-value / required-attr / allowed-role) — (serious · SC 4.1.2)
A declared `role` brings required states + keyboard behaviour. Best fix: use the native element.
```html
<!-- prefer this -->
<input type="checkbox" id="sub" [(ngModel)]="subscribed"><label for="sub">Subscribe</label>

<!-- if you must use a custom role, it's ALL of: -->
<div role="checkbox" tabindex="0"
     [attr.aria-checked]="subscribed"
     (click)="toggle()" (keydown.space)="toggle()">Subscribe</div>
```
Lint: `@angular-eslint/template/accessibility-role-has-required-aria`, `...valid-aria`.

## target-size — Touch targets ≥ 24×24px (serious · SC 2.5.8, WCAG 2.2)
Enlarge small icon buttons / inline links, or add spacing so a 24px circle per target doesn't overlap neighbours. Remember: this rule is OFF by default — enable it (see scan.spec.ts).

## Stateful components (collapsibles / dropdowns / dialogs / CDK overlays)
axe only scans the **current DOM**. Hidden content (collapsed panels, closed menus, unopened dialogs) is invisible to it — a clean scan of a collapsed component proves nothing about its expanded state. Two rules:

1. **Scan both states.** Scan collapsed, then drive the UI open (`click` the trigger, `await expect(panel).toBeVisible()`) and scan again. Each state is a different DOM.
2. **Mind where the panel renders.** Angular Material / CDK overlays (menus, selects, dialogs, tooltips, autocomplete) render in `.cdk-overlay-container` at **`<body>` level**, NOT inside your component. So `.include('[data-test="my-trigger"]')` will scan the trigger but **miss the open panel entirely.** Either include the overlay container too, or scan the whole page once it's open:
```ts
// open it first
await page.getByRole('button', { name: 'Menu' }).click();
await expect(page.getByRole('menu')).toBeVisible();
// then EITHER scan the whole page...
const r1 = await new AxeBuilder({ page }).options(BAR).analyze();
// ...OR scope to both the component AND the body-level overlay
const r2 = await new AxeBuilder({ page })
  .include('[data-test="my-component"]').include('.cdk-overlay-container')
  .options(BAR).analyze();
```
Common real bugs this catches: menu/dialog items with no accessible name, focus not trapped, missing `role`/`aria-expanded` on the trigger, contrast inside the panel.

## Other frequent ones (quick guidance)
- **document-title** — every page needs a non-empty `<title>` (Angular: `Title` service / route `title`).
- **html-has-lang** — `<html lang="en">`.
- **heading-order** — don't skip levels (h1→h3); reflect document structure.
- **landmark-one-main / region** — wrap content in `<main>`, `<nav>`, `<header>`, `<footer>`.
- **duplicate-id-aria** — ids referenced by ARIA must be unique.
- **list** — `<li>` only directly inside `<ul>`/`<ol>`.

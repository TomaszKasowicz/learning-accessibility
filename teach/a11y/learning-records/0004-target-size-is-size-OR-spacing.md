# `target-size` fails on size AND spacing together — the spacing exception is why ±1px flips it

The axe `target-size` rule (SC 2.5.8) is **not** a pure "is it ≥24×24px?" check. Its rule definition is:

```json
{ "id": "target-size", "any": ["target-size", "target-offset"], "matches": "widget-not-inline-matches" }
```

`any` means the rule **passes if EITHER sub-check passes**. So a node is a violation only when it is *both* too small *and* too close to its neighbors.

- **`target-size` check** — is the element itself ≥ `minSize` (24) in both dimensions (accounting for obscuring elements)? 
- **`target-offset` check** — the **spacing exception**: is there enough clear space around it? For each nearby focusable widget neighbor it computes an *offset* and requires `offset ≥ minOffset` (24).

## The offset math (from `commons/math/get-offset.js`, v4.11.4)

For a **large** neighbor (≥24×24, e.g. our 100×100 button):
> `offset_radius = distance( target's CENTER , nearest edge of neighbor rect )`
> reported `offset = round1(offset_radius) × 2`  ← diameter

It passes when `offset + 0.05 ≥ 24`, i.e. the target's **center is ≥ 12px from the neighbor's nearest edge**. (`closestOffset` starts at `minOffset`=24 and is only lowered by neighbors closer than that, so a reported `closestOffset` of exactly 24 means "no close neighbor → pass".)

## Measured on `/pointer-size` (`.small-button`, 3px font / margin 1px)

axe check `data`, captured live (axe-core 4.11.4 via `@axe-core/playwright`):

| Variant | small-button rect | center x | dist→large edge (585.2) | offset (diam.) | offset check | rule |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | x 586.2, w 21, h 8 | 596.7 | 11.5 | **23** | FAIL | **violation** |
| `font-size: 4px` | x 586.2, w **26.7**, h 9 | 599.5 | 14.3 | ~28.6 | PASS | passes |
| `margin: 2px` | x **587.2**, w 21 | 597.7 | 12.5 | ~25 | PASS | passes |

The `target-size` (size) check **fails in all three** — the button never reaches 24×24. The verdict is decided entirely by `target-offset`.

## Why ±1px is the tipping point

Baseline sits at offset **23 — exactly 1 diameter-px below the 24 threshold** (center 11.5px from the large button's right edge; needs 12). Both edits nudge the center past 12px:

- **+1px margin** shifts the whole button right 1px (left edge 586.2→587.2, center +1) → 12.5px → diameter 25 → clears 24.
- **+1px font** widens the text (w 21→26.7), so the center drifts right (+2.8px) → 14.3px → diameter ~28.6 → clears 24. (The button is *still* tiny and still fails the size check — it just moved far enough away.)

## Takeaways for the skill / fixing

1. **Read both sub-checks.** A `target-size` violation's `node.any` carries `target-size` data (`width`/`height`) and `target-offset` data (`closestOffset`). The fix differs: enlarge the target **or** add spacing.
2. **Two valid fixes** map to the two checks: make it ≥24×24 (size), or give it ≥24px of clear space to neighbors (offset). Real fix here = both font-size sane *and* spacing; nudging 1px is gaming a borderline, not a real remedy.
3. **`matches: widget-not-inline-matches`** — the rule skips inline (text-flow) widgets like links inside a paragraph; it targets block/inline-block widgets like buttons.
4. Method note (reinforces 0003's lesson): measured with live axe check `data` + reading the engine source, not by eyeballing. The component's Angular styles are `[_ngcontent]`-scoped, so CSS probes need `!important` to override.

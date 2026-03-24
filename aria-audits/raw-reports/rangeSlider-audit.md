# RangeSlider — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) — **multi-thumb / range** variant (two thumbs on one axis). Native `<input type="range">` is not used; thumbs are custom `role="slider"` widgets.
- **Implementation files (RangeSlider surface):**
  - `core/components/atoms/rangeSlider/index.tsx` — re-exports.
  - `core/components/atoms/rangeSlider/RangeSlider.tsx` — thin wrapper: local state for controlled/uncontrolled range, renders `MultiSlider` with two `MultiSlider.Handle` children (start + end).
- **Implementation files (actual DOM / behavior — shared with MultiSlider):**
  - `core/components/atoms/multiSlider/index.tsx` — track, axis tick “buttons”, label row, orchestration of handles.
  - `core/components/atoms/multiSlider/Handle.tsx` — focusable thumb: mouse drag, keyboard stepping, `role="slider"`, tooltip mirror.
  - `core/components/atoms/multiSlider/SliderUtils.tsx` — math/helpers (not DOM).

### Root cause / rollup

Almost all structural a11y behavior is **not in `RangeSlider.tsx`** but in **`MultiSlider` + `Handle`**. Several issues share one theme: **visible text (`label` prop → `<Label>`) is not wired into the accessibility tree for the thumbs or the control group**, and **secondary “click targets” (track + tick labels) use `role="button"` + key handlers while `tabIndex` is commented out**, so keyboard parity with pointer users is incomplete.

---

## Findings (severity order)

### 1. Focusable slider thumbs have no accessible name (visible label not associated)

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic label).
- **Severity:** **P0**
- **Scope:** **Component default** when `label` is provided (typical Storybook/docs usage, e.g. `label="Range"`).
- **Repro:** Render `<RangeSlider label="Range" … />`; inspect each `DesignSystem-MultiSlider-Handle` — `role="slider"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`, but **no `aria-label`, `aria-labelledby`, or `htmlFor` link** from `<Label>` to the thumbs. `aria-valuetext` is the **value string**, not the accessible **name**.
- **Issue + impact:** Each thumb is a user interface component that must have an accessible name. The on-screen group label is not exposed as the name of either thumb, so assistive technologies may announce a generic “slider” without the field label; with **two** thumbs, users cannot tell which is the lower vs upper bound except by inferring from numeric values.
- **Suggestion:** Generate stable unique ids (e.g. via existing `uidGenerator` patterns in the codebase) for the group label and/or each thumb. Use `aria-labelledby` on both thumbs to include the group label text plus a per-thumb distinguisher (e.g. hidden text or visible “min”/“max” strings), or set distinct `aria-label`s for range start/end. Optionally wrap the slider region in `role="group"` with `aria-labelledby` pointing at the visible label.

### 2. Track and axis tick targets are `role="button"` with Space/Enter handlers but are not tab-focusable

- **WCAG / basis:** 2.1.1 Keyboard.
- **Severity:** **P1**
- **Scope:** **Component default** (`MultiSlider` track + each tick in `renderLabels`).
- **Repro:** Tab through a `RangeSlider`; focus moves between the two handles only. The track (`DesignSystem-MultiSlider-Slider-Track`) and tick marks (`DesignSystem-MultiSlider-Label`) never receive Tab focus, yet pointer users can click them to move the nearest handle (`maybeHandleTrackClick` / `onClickHandler` on ticks). `tabIndex={0}` lines are **commented out** in source.
- **Issue + impact:** Keyboard users cannot use the same “jump via track or tick” affordances as mouse users; only arrow/Home/End/Page keys on a focused thumb remain. That is a **keyboard gap** for equivalent operation of those sub-actions.
- **Suggestion:** Either restore `tabIndex={disabled ? -1 : 0}` (and ensure a proper accessible name per tick, e.g. “Set to {value}”) **or** remove `role="button"` and rely on thumbs-only keyboard model (then document that ticks/track are pointer-only and avoid implying button semantics).

### 3. `role="button"` on non-focusable track/ticks is misleading in the accessibility tree

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (role vs behavior).
- **Severity:** **P2**
- **Scope:** **Component default** for track + tick nodes as currently rendered.
- **Issue + impact:** Elements expose `role="button"` but are **not keyboard-focusable** (see finding 2). In browse/virtual cursor modes, users may hear “button” without a clear operable keyboard path, which conflicts with the expected button pattern (focus + Space/Enter).
- **Suggestion:** Align role with reality: if not focusable, prefer `role="presentation"`/`none` on the visual hit area or use a single focusable control pattern; if they remain buttons, they must be focusable and named.

### 4. No group semantics tying the two thumbs and the visible label (APG multi-thumb robustness)

- **WCAG / basis:** **APG only** / 1.3.1 Info and Relationships (structure).
- **Severity:** **P2**
- **Scope:** **Component default** for `RangeSlider` (two handles).
- **Issue + impact:** A range is one compound control in UX; the DOM is a flat sequence of sliders plus decorative track content. Without `role="group"` (or `fieldset`/`legend` if ever refactored to native grouping) and `aria-labelledby`, screen reader structure is weaker for understanding that both thumbs belong to one labeled control.
- **Suggestion:** Wrap thumbs + track in a group with `aria-labelledby` referencing the visible label id; ensure each thumb’s name references the group (finding 1).

### 5. Value tooltip duplicate adjacent to thumb — possible redundant exposure

- **WCAG / basis:** **Best practice** (verbosity / redundant text).
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Component default** (`Handle` renders a sibling `div` showing the same formatted value as `aria-valuetext`).
- **Issue + impact:** When navigating by element, some users may encounter the thumb’s announced value and then encounter adjacent plain text with the same number, increasing verbosity without adding structure.
- **Suggestion:** If the tooltip is purely visual redundancy, mark it `aria-hidden="true"` **or** reference it only visually; ensure screen readers rely on `aria-valuetext` / `aria-valuenow` updates.

### 6. Optional: explicit `aria-orientation`

- **WCAG / basis:** **Best practice** / **APG** Slider properties.
- **Severity:** **P3** (enhancement)
- **Scope:** **Component default** (horizontal layout).
- **Issue + impact:** Horizontal orientation is often assumed, but explicit `aria-orientation="horizontal"` on each `role="slider"` improves consistency across AT.
- **Suggestion:** Set `aria-orientation="horizontal"` on handles (and document if a vertical variant is added later).

---

## Positive notes (brief)

- Thumbs use **`role="slider"`** with **`aria-valuemin`**, **`aria-valuemax`**, **`aria-valuenow`**, **`aria-valuetext`**, and **`aria-disabled`** when disabled — good baseline for a custom slider.
- **Keyboard support on thumbs** includes arrows, Home, End, Page Up/Down (`Handle.handleKeyDown`), matching common slider expectations.
- **`tabIndex={disabled ? -1 : 0}`** on handles allows Tab reachability for the primary controls.

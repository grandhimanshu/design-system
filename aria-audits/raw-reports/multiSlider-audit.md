# MultiSlider — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/multiSlider/index.tsx` |
| Handle (thumb) implementation | `core/components/atoms/multiSlider/Handle.tsx` |
| Utilities (math / DOM helpers) | `core/components/atoms/multiSlider/SliderUtils.tsx` |
| Single-thumb wrapper | `core/components/atoms/slider/Slider.tsx` |
| Range wrapper (two thumbs) | `core/components/atoms/rangeSlider/RangeSlider.tsx` |
| Styles (layout / visibility of track, handle, tooltip) | `css/src/components/slider.module.css` |
| Tests (documented usage patterns) | `core/components/atoms/multiSlider/__tests__/MultiSlider.test.tsx`, `core/components/atoms/multiSlider/__tests__/Handle.test.tsx` |

**APG reference:** [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) (horizontal slider, keyboard model). Multi-thumb range UIs are commonly implemented as **multiple elements with `role="slider"`**, each with a **distinct accessible name**, **`aria-valuemin`**, **`aria-valuemax`**, **`aria-valuenow`** (and optional **`aria-valuetext`**), plus **`aria-orientation`** when not the default.

---

## Component overview

`MultiSlider` renders a **horizontal** value control: an outer **`div`**, optional **`Label`** (visual field label), a **track** `div` (mouse + optional keyboard hooks), **axis tick/label** `div`s, and one or more **`Handle`** instances (each a focusable **`div`** with **`role="slider"`**). Thumbs support **Arrow**, **Home**, **End**, **Page Up/Down** via **`onKeyDown`**. The track and tick labels use **`role="button"`** with **`onMouseDown` / `onClick`**-style behavior and **`onKeyDown`** for **Enter/Space**, but **`tabIndex` is commented out** on both, so those controls are **not placed in the tab order** as implemented.

**Root cause / rollup:** Several issues trace to one pattern: **naming and relationships are not wired** from the field **`label`** (or any stable author string) to each **`role="slider"`** thumb, and **`aria-valuetext` is used where an accessible *name* is required**. Separately, **track/tick `role="button"`** nodes lack names and are **non-focusable**, which breaks parity with mouse affordances and creates **misleading roles** in the accessibility tree.

---

## Findings (severity order)

### 1. Slider thumbs lack an accessible name (`aria-valuetext` is not the widget name)

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P0**
- **Scope:** **Component default** for `Handle` — thumbs expose **`role="slider"`**, **`aria-valuemin` / `aria-valuemax` / `aria-valuenow`**, and **`aria-valuetext={label}`** where **`label`** is the **formatted numeric value** (see `Handle.tsx`), not a field or thumb name.
- **Repro:** Use `MultiSlider` as in `Slider` / `RangeSlider` / tests: focused thumb is announced as a slider with a value, but **without** a computed **accessible name** tied to the visible **`Label`** or to “start/end” semantics; `aria-valuetext` does **not** satisfy the **name** requirement for the control.
- **Issue + impact:** Screen reader and voice-control users may not know **which** control or **which setting** they are adjusting, especially when several sliders exist on a page or when two thumbs share one field label.
- **Suggestion:** Provide **`aria-label`** or **`aria-labelledby`** on each thumb (e.g. generate stable **`id`s** on the visible `Label` and/or per-thumb labels, or accept optional **`ariaLabel` / `getAriaLabelForHandle(index)`** props). Keep **`aria-valuetext`** for human-readable **value** strings only.

---

### 2. Visible `Label` is not programmatically related to any thumb or track

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Component default** whenever `MultiSlider` renders `{label && <Label withInput={true}>{label}</Label>}` without **`htmlFor`** / **`id`** wiring to focusable controls (`index.tsx`).
- **Repro:** Render `<MultiSlider label="Volume" …>` with handles; the **`Label`** is not associated with the **`role="slider"`** elements, so the **relationship** between the caption and the control is only visual.
- **Issue + impact:** Assistive technologies do not treat the caption as the **name** (or description) of the slider thumbs; activating the label does not move focus to a thumb (native `label`/`for` behavior is absent).
- **Suggestion:** Generate a unique **`id`** for the group or for each thumb; set **`htmlFor`** on the `Label` when there is a single thumb, or use **`aria-labelledby`** on each thumb pointing at the label text **plus** a per-thumb distinguisher.

---

### 3. Range / multi-thumb: thumbs are not distinguishable by accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.6 Headings and Labels (context).
- **Severity:** **P1**
- **Scope:** **Component default** for `RangeSlider` (`RangeSlider.tsx` renders two `MultiSlider.Handle` children with no naming props).
- **Repro:** Focus each thumb in a default range slider; both are announced as generic sliders with different values but **no** “minimum / maximum” (or equivalent) **name** difference supplied by the implementation.
- **Issue + impact:** Users cannot reliably tell **which end** of the range is focused without inferring from value alone.
- **Suggestion:** Default **`aria-label`** strings (e.g. “Start of range”, “End of range”) or require consumers to pass per-handle naming via **`MultiSlider.Handle`** props forwarded to **`Handle`**.

---

### 4. Track uses `role="button"` without an accessible name and is not keyboard-focusable

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (feature parity for track interaction).
- **Severity:** **P1**
- **Scope:** **Component default** — track `div` in `index.tsx` sets **`role="button"`**, **`aria-disabled`**, and **`onKeyDown`** for **Enter/Space**, but **`tabIndex` is commented out**, so the element is **not focusable** via standard keyboard navigation.
- **Repro:** Tab through a `MultiSlider`; only thumbs receive focus; **track click-to-move-nearest-handle** is **mouse-only**. In the flat tree, the track may still appear as a **button** with **no accessible name**.
- **Issue + impact:** Misleading **role** and **unnamed** control in the accessibility tree; keyboard users cannot use the same track interaction as pointer users.
- **Suggestion:** Either remove **`role="button"`** and treat the track as **presentational** with behavior only, or make it a **focusable** control with an **`aria-label`** (and ensure **Enter/Space** behavior matches APG expectations). Align role with actual semantics (usually **not** `button` for a slider rail).

---

### 5. Axis tick / label controls use `role="button"` without names and are not keyboard-focusable

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (parity for tick jump-to-value).
- **Severity:** **P1**
- **Scope:** **Component default** — each tick `div` in `renderLabels` (`index.tsx`) uses **`role="button"`**, **`aria-disabled`**, **`onClick`**, and **Enter/Space** on **`onKeyDown`**, with **`tabIndex` commented out**.
- **Repro:** Same as track: ticks are clickable for pointer users but **not** in tab order; exposed as **buttons** without **accessible names** (only inner **value text** may be adjacent, not wired as the button name).
- **Issue + impact:** Redundant or confusing objects in the a11y tree; keyboard users cannot jump to tick values.
- **Suggestion:** Same as track: **drop `role="button"`** if non-focusable, or add **`tabIndex={0}`** (when not disabled), **`aria-label`** describing the action (e.g. “Set to 5”), and ensure **keyboard** activation matches **click**.

---

### 6. `onKeyUp` on the thumb calls `onRelease` with possibly stale `props.value`

- **WCAG / basis:** 4.1.2 Name, Role, Value (state sync with assistive tech).
- **Severity:** **P2**
- **Scope:** **Component default** — `Handle.handleKeyUp` invokes `onRelease(this.props.value)` after keyboard nudges (`Handle.tsx`), while **`onChange`** may have fired with a **new** value before the parent re-renders.
- **Repro:** TBD — verify with a controlled parent logging **`onRelease`** vs **`aria-valuenow`** / React state after a single key press.
- **Issue + impact:** Consumers integrating announcements or validation on **release** may observe **incorrect final values**, which can confuse users if mirrored in UI or live regions.
- **Suggestion:** Track **last committed value** in component state or pass the **updated** value into **`onRelease`** from the same path as **`onChange`**.

---

### 7. Tooltip value mirror is adjacent to the thumb and not hidden from assistive tech

- **WCAG / basis:** Best practice (redundant content in reading order).
- **Severity:** **P2**
- **Scope:** **Component default** — `Handle` renders a second **`div`** with the same **`label`** text as **`aria-valuetext`** (`Handle.tsx`).
- **Issue + impact:** Depending on browse mode and AT, users may hear **value text twice** (slider value + nearby static text).
- **Suggestion:** Mark the purely decorative duplicate as **`aria-hidden="true"`** when **`aria-valuetext`** already conveys the value, or consolidate to a single accessible value presentation.

---

### 8. Missing explicit `aria-orientation` on thumbs

- **WCAG / basis:** APG only (clarity for assistive tech).
- **Severity:** **P2**
- **Scope:** **Component default** — horizontal-only implementation; **`aria-orientation`** is omitted on **`role="slider"`** (`Handle.tsx`).
- **Issue + impact:** Some AT heuristics assume horizontal, but explicit **`aria-orientation="horizontal"`** improves consistency and future-proofs vertical variants.
- **Suggestion:** Set **`aria-orientation="horizontal"`** on each thumb (or derive when a vertical layout is added).

---

### 9. Optional: group multi-thumb sliders for context

- **WCAG / basis:** 1.3.1 Info and Relationships; Best practice.
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Consumer-dependent** / optional API.
- **Issue + impact:** A **group** role with **`aria-labelledby`** referencing the field label can reduce verbosity and clarify that two thumbs belong to one control.
- **Suggestion:** Consider a wrapper with **`role="group"`** and **`aria-labelledby`** when **`label`** is present and there are **multiple** thumbs.

---

## Summary counts

- **P0:** 1  
- **P1:** 4  
- **P2 / P3:** 4 (includes enhancements)

# Slider — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/) — horizontal slider with a draggable thumb. Native `<input type="range">` is not used; the thumb is a custom `role="slider"` widget.
- **Implementation files (Slider surface):**
  - `core/components/atoms/slider/index.tsx` — re-exports `Slider`.
  - `core/components/atoms/slider/Slider.tsx` — thin wrapper: local state for controlled/uncontrolled value, renders `MultiSlider` with one `MultiSlider.Handle` (`fillBefore={true}`).
- **Implementation files (actual DOM / behavior — shared with RangeSlider):**
  - `core/components/atoms/multiSlider/index.tsx` — outer wrapper, optional `<Label>`, track (`role="button"`), axis tick “buttons”, track fills, orchestration of handles.
  - `core/components/atoms/multiSlider/Handle.tsx` — focusable thumb: pointer drag, keyboard stepping, `role="slider"`, visual tooltip mirror.
  - `core/components/atoms/multiSlider/SliderUtils.tsx` — math/helpers (not DOM).

### Root cause / rollup

Structural accessibility is implemented almost entirely in **`MultiSlider` + `Handle`**, not in `Slider.tsx`. Several findings share one theme: **the optional visible `label` prop is not programmatically tied to the `role="slider"` thumb**, and **secondary pointer targets (track + axis ticks) use `role="button"` plus Enter/Space handlers while `tabIndex` is commented out**, which skews semantics versus keyboard behavior.

---

## Findings (severity order)

### 1. Focusable slider thumb has no accessible name when the visible `label` prop is used

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic label).
- **Severity:** **P1**
- **Scope:** **Component default** when `label` is provided (common in stories/tests, e.g. `label="Slider Label"`).
- **Repro:** Render `<Slider label="Volume" value={50} … />`; inspect `DesignSystem-MultiSlider-Handle` — it has `role="slider"` and value-related attributes, but **no `aria-label` or `aria-labelledby`**. The visible caption is rendered via `<Label withInput={true}>{label}</Label>` in `MultiSlider` with **no `htmlFor` / `id` wiring** to the thumb. `aria-valuetext` carries the **formatted value string**, not the field **name**.
- **Issue + impact:** Assistive technologies may announce the control as a generic “slider” (plus value) without the same label sighted users see, weakening orientation and form understanding.
- **Suggestion:** Generate a stable id for the label text (or label wrapper) and set `aria-labelledby` on the thumb to include it; or set `aria-label` from the `label` prop when present. Ensure ids are unique per instance (e.g. `useId` / existing uid patterns).

### 2. Track and axis tick targets are `role="button"` with Enter/Space handlers but are not tab-focusable

- **WCAG / basis:** 2.1.1 Keyboard (subset of functionality: jump-to-value via track/tick vs thumb-only keys).
- **Severity:** **P1**
- **Scope:** **Component default** (`MultiSlider` track `DesignSystem-MultiSlider-Slider-Track` and each tick `DesignSystem-MultiSlider-Label`).
- **Repro:** Tab through a `Slider`; only the thumb receives focus. Pointer users can click the track or a tick to move the nearest handle (`maybeHandleTrackClick` / tick `onClickHandler`), but **`tabIndex` is commented out** on track and ticks despite `onKeyDown` handling Enter/Space.
- **Issue + impact:** Keyboard users cannot operate the same “click track / tick to jump” affordances as pointer users; they must rely on arrows, Home, End, Page Up/Down on the focused thumb.
- **Suggestion:** Either restore `tabIndex={disabled ? -1 : 0}` and give each focusable tick a clear accessible name (e.g. “Set to {value}”), **or** remove `role="button"` from non-focusable regions and document track/ticks as pointer-only (avoid implying full button semantics).

### 3. `role="button"` on non-focusable track/ticks is misleading in the accessibility tree

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (role vs actual operability).
- **Severity:** **P2**
- **Scope:** **Component default** for track + tick nodes as currently rendered.
- **Issue + impact:** Nodes expose `role="button"` while **not being keyboard-focusable** (see finding 2). In virtual/browse modes, users may hear “button” without a standard focus + Space/Enter path.
- **Suggestion:** Align exposed role with behavior: make them focusable named controls, or strip misleading roles from purely pointer-driven hit areas.

### 4. `MultiSlider` root does not forward arbitrary DOM / ARIA props to the thumb or wrapper

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (extensibility).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — consumers cannot reliably supply `aria-label`, `aria-labelledby`, or `id` through `Slider`/`MultiSlider` props onto the thumb; `render()` only spreads `extractBaseProps` (`className`, `data-test`) on the outer `div`. `MultiSliderProps` extends `BaseProps`, not general HTML attributes.
- **Repro:** Attempt to pass extra ARIA props through the typed public API — they are neither typed nor applied to the interactive node.
- **Issue + impact:** Teams cannot patch naming or descriptions without forking or wrapping, which pushes fixes outside the design system.
- **Suggestion:** Forward vetted ARIA props (or a dedicated `handleProps` / `sliderProps` bag) onto the `Handle` root, and/or implement finding 1 so the common `label` prop covers the default case.

### 5. Value tooltip duplicate next to the thumb may cause redundant exposure

- **WCAG / basis:** **Best practice** (verbosity).
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Component default** (`Handle` renders a sibling `div` with the same formatted value as `aria-valuetext`).
- **Issue + impact:** Some navigation modes may encounter the value twice (property announcement + adjacent text).
- **Suggestion:** If the tooltip is purely visual, mark it `aria-hidden="true"` so SR users rely on `aria-valuenow` / `aria-valuetext` updates.

### 6. Optional: explicit `aria-orientation`

- **WCAG / basis:** **APG** Slider properties; **Best practice**
- **Severity:** **P3** (enhancement)
- **Scope:** **Component default** (horizontal layout).
- **Issue + impact:** Horizontal orientation is often implied; explicit `aria-orientation="horizontal"` on the thumb improves consistency across AT.
- **Suggestion:** Set `aria-orientation="horizontal"` on the handle until a vertical variant exists.

---

## Positive notes (brief)

- Thumb uses **`role="slider"`** with **`aria-valuemin`**, **`aria-valuemax`**, **`aria-valuenow`**, **`aria-valuetext`**, and **`aria-disabled`** when disabled — solid baseline for a custom slider.
- **Keyboard support on the thumb** includes arrows, Home, End, Page Up/Down (`Handle.handleKeyDown`), aligned with common slider expectations.
- **`tabIndex={disabled ? -1 : 0}`** on the thumb allows Tab reachability for the primary control.
- **`aria-valuetext`** reflects `formatLabel(value)` (including custom `labelRenderer` output when provided on `MultiSlider`), which helps convey stepped or formatted values.

# EditableDropdown — Structural ARIA / Semantic Audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/molecules/editableDropdown/EditableDropdown.tsx` | Molecule: composes `Editable` + `Dropdown` + default label `div` |
| `core/components/molecules/editableDropdown/index.tsx` | Re-exports |
| `core/components/atoms/editable/Editable.tsx` | Wrapper: `role="button"`, hover/click/keyboard to toggle “edit” mode |
| `core/components/atoms/dropdown/Dropdown.tsx` | State container; renders `DropdownList` |
| `core/components/atoms/dropdown/DropdownList.tsx` | Popover, trigger, list surface, keyboard handling |
| `core/components/atoms/dropdown/DropdownButton.tsx` | Native `<button>` trigger |
| `core/components/atoms/dropdown/option/*` | Options (`role="option"` / `menuitem*` / checkbox rows) |

**APG / pattern:** Hybrid of a custom “editable” disclosure (`Editable`) and the deprecated **Dropdown** (popover + `listbox` or `menu` + options). This is not a full APG **Combobox** (no `aria-controls` / `aria-activedescendant` wiring on a single text input).

**Root cause / rollup:** `EditableDropdown` adds almost no ARIA of its own; behavior and most structural issues come from **`Editable` (nested interactive with `role="button"`)** plus **`Dropdown` / `DropdownList`** (missing expand state on trigger, option row markup). Fixing the rollup likely requires coordinating `Editable` + trigger semantics or flattening the interactive hierarchy.

---

## Findings (severity order)

### 1. Nested interactive: `role="button"` ancestor around Dropdown `<button>`

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (structure/parsing of roles)
- **Severity:** **P1**
- **Scope:** **Component default** whenever the dropdown trigger is visible (`showComponent === true`, e.g. after hover or activating “edit”).
- **Repro:** Use `EditableDropdown` as in Storybook `all`; open editing/hover so the `Dropdown` is shown; inspect DOM under `DesignSystem-EditableWrapper`: a `div[role="button"][tabindex="0"]` wraps content that includes `DropdownButton`’s `<button>`.
- **Issue + impact:** ARIA and assistive technologies expect no nested interactive controls. Here `Editable` exposes a focusable `role="button"` while the real control is a native **button** inside it. Users can get duplicate tab stops, conflicting keyboard behavior (wrapper vs trigger), and confusing role/name announcements.
- **Suggestion:** Avoid `role="button"` around the whole composite; use a non-interactive wrapper, move keyboard/hover behavior to a single focus target (e.g. only the trigger), or use a pattern that matches APG (single tab stop + `aria-expanded` / `aria-haspopup` on that control).

---

### 2. Dropdown trigger missing `aria-expanded` (and related popup semantics)

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Component default** for any `EditableDropdown` using the stock `DropdownButton` trigger (not overridden by `customTrigger`).
- **Repro:** Open/close the dropdown; inspect `DesignSystem-DropdownTrigger`: no `aria-expanded` (confirmed no matches under `core/components/atoms/dropdown`).
- **Issue + impact:** Assistive tech cannot reliably expose open/closed state of the popup relative to the trigger, which is required for a robust disclosure/listbox-button pattern.
- **Suggestion:** Pass `aria-expanded={dropdownOpen}`, `aria-haspopup="listbox"` (or `menu` when `menu` mode), and ideally `aria-controls` pointing at the list container id, from `DropdownList` into `DropdownButton` / custom trigger clone props.

---

### 3. Invalid / ineffective `<label htmlFor>` around non-checkbox options

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Component default** for single-select rows (`withCheckbox` false) using default option renderers (e.g. `DefaultOption`).
- **Repro:** Inspect a single-select option row in `DropdownList.renderOptions`: outer `<label htmlFor={id}>` wraps `Option`; `DefaultOption` does not place the `id` on a labelable control (it is not forwarded to the focusable `div`).
- **Issue + impact:** `htmlFor` may reference a missing or wrong element; the outer `<label>` does not correctly associate with `role="option"` content. This weakens programmatic name/relationships and can produce inconsistent SR behavior.
- **Suggestion:** Remove the outer `<label>` for non-checkbox options; rely on `role="option"` + visible text, or use a single focusable pattern consistent with APG listbox. For checkbox rows, keep explicit `label`/`id` wiring with **stable** ids (see finding 4).

---

### 4. Unstable / collision-prone option ids (`new Date().getTime()`)

- **WCAG / basis:** 4.1.1 Parsing (duplicate `id` values); 4.1.2 (broken label/control wiring when ids churn)
- **Severity:** **P2**
- **Scope:** **Component default** wherever `DropdownList` builds ids via `getTime()` in `renderOptions` / `renderSelectAll`.
- **Repro:** Re-render list quickly or mount two dropdowns; ids can collide in the same millisecond or change between renders, breaking `htmlFor` / `aria-labelledby` targets.
- **Issue + impact:** Duplicate or changing `id`s break associations and are a robustness risk for assistive tech.
- **Suggestion:** Generate ids with `useId()` / instance counter / option `value` + index, stable for the row’s lifetime.

---

### 5. `listbox` container: simultaneous `aria-label` and `aria-labelledby`

- **WCAG / basis:** Best practice (accessible name calculation / avoid conflicting naming properties)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when `dropdownOptions['aria-labelledby']` is set; **Component default** still always sets `aria-label={resolvedOptionsAriaLabel}` on the list container.
- **Repro:** Pass `aria-labelledby` on dropdown props; observe `role="listbox"` node has both `aria-label` and `aria-labelledby`.
- **Issue + impact:** Redundant or competing name sources can yield inconsistent accessible names across browsers/AT.
- **Suggestion:** If `aria-labelledby` is present, omit `aria-label` on the listbox (or derive one source only).

---

### 6. Two tab stops: Editable wrapper + Dropdown trigger (when both focusable)

- **WCAG / basis:** 2.4.3 Focus Order; Best practice (single logical widget, one primary focus target)
- **Severity:** **P2**
- **Scope:** **Component default** when dropdown is visible; mitigated when trigger is `display: none` (default view hides dropdown via `d-none`).
- **Repro:** With dropdown visible, Tab from the composite: focus can move to `Editable`’s wrapper then to the inner trigger.
- **Issue + impact:** Extra stop and overlapping roles make the control harder to learn and operate predictably.
- **Suggestion:** Align with finding 1 — one tab stop for the “editable dropdown” control.

---

### 7. No first-class labelling API on `EditableDropdown` root

- **WCAG / basis:** 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions (when the field needs an external label)
- **Severity:** **P2** (becomes **P1** only if consumers omit `dropdownOptions['aria-label']` / `aria-labelledby` and no visible text names the trigger)
- **Scope:** **Consumer-dependent**
- **Repro:** Story `__stories__/index.story.jsx` uses `Label withInput` beside `EditableDropdown` without demonstrating `htmlFor` / `id` threading into `dropdownOptions['aria-labelledby']` or trigger `aria-label`.
- **Issue + impact:** The molecule does not document or surface a single prop for field labelling; consumers must thread ARIA through `dropdownOptions` to reach `DropdownButton`.
- **Suggestion:** Add optional `aria-label` / `aria-labelledby` on `EditableDropdownProps` forwarded into `dropdownOptions`, and document required wiring when a visible `Label` is used.

---

### 8. Dynamic selection text not exposed via live region

- **WCAG / basis:** Best practice / 4.1.3 Status Messages (context-dependent; often optional if name/selection is clear elsewhere)
- **Severity:** **P3** (enhancement)
- **Scope:** **Component default** when selection label updates in the default `div` via `getLabel`.
- **Issue + impact:** On selection change, SR users may not hear the updated summary unless they move focus or re-read the control.
- **Suggestion:** Optionally add `aria-live="polite"` on the static label region or ensure the trigger’s accessible name updates and is announced by intentional focus/ARIA updates (prefer pattern-consistent approach).

---

## Summary

| Severity | Count |
|----------|-------|
| P0       | 0     |
| P1       | 3     |
| P2       | 4     |
| P3       | 1     |

**Note:** This audit is **structural** (DOM, ARIA, relationships, keyboard wiring as visible in code). It does **not** cover contrast, focus ring CSS, hit targets, or motion.

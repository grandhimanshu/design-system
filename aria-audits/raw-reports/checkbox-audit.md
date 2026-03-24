# Checkbox — Structural ARIA / Semantic Audit

## Implementation files reviewed

| File | Role |
|------|------|
| `core/components/atoms/checkbox/Checkbox.tsx` | Main component (native `<input type="checkbox">`, label, help text, ARIA wiring) |
| `core/components/atoms/checkbox/CheckboxIcon.tsx` | Decorative SVG variants (checked / indeterminate) |
| `core/components/atoms/checkbox/index.tsx` | Re-exports |
| `css/src/components/checkbox.module.css` | Layout only (not scored for focus visuals per audit scope) |

**APG pattern:** [Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) — implementation correctly uses a **native checkbox** rather than a fully custom `role="checkbox"` widget.

---

## Component Overview

The Checkbox is a native HTML checkbox with a visual glyph in a sibling `<span>`, programmatically associated `<label htmlFor={id}>`, optional help text wired via `aria-describedby`, `aria-invalid` for validation state, and `aria-checked="mixed"` when `indeterminate` is true. Keyboard operation is delegated to the native control (e.g. Space to toggle).

**Root cause / rollup:** A few issues stem from **optional `label` / naming** and **decorative visuals** next to the real control (SVG / wrapper not marked inert for assistive technology).

---

## Findings

### 1. Accessible name can be absent when `label` is empty or whitespace-only

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic name)
- **Severity:** **P1**
- **Scope:** **Component default** for the edge case `label` that is only whitespace; **Consumer-dependent** when `label` and `helpText` are omitted and no `aria-label` / `aria-labelledby` is passed via spread props.
- **Repro:** Use `<Checkbox name="x" value="y" onChange={fn} label="   " />` or omit `label`/`helpText` and any `aria-*` name on the input — the control has no computed accessible name.
- **Issue + impact:** Whitespace `label` still makes `(label || helpText)` truthy, so the label column can render with **no** `<label>` and **no** help line, leaving the input unnamed. Omitting `label`/`helpText` without supplying `aria-label` or `aria-labelledby` yields the same. Screen reader users cannot identify the control.
- **Suggestion:** Treat whitespace-only `label` like “no label” for the wrapper branch; document that a visible label, `label` prop, or `aria-label` / `aria-labelledby` is required; optionally warn in dev or tighten types for stories/docs.

---

### 2. Auto-generated `id` is not stable across re-renders when `id` prop is omitted

- **WCAG / basis:** Best practice (robust `id` / `aria-*` relationships; 4.1.2 robustness in complex pages)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — only matters when parents, tests, or other attributes reference the checkbox `id` across renders without passing an explicit `id`.
- **Issue + impact:** Default `id` uses `uidGenerator()` inside the render path (`id = \`${name}-${label}-${uidGenerator()}\``), so each re-render can produce a new `id` while `htmlFor` and `aria-describedby` stay internally consistent. External references (e.g. `aria-labelledby` from a parent, cached DOM queries, integration tests) can break or drift.
- **Suggestion:** Generate the fallback id once per instance (`useRef` / `useMemo` with stable deps), matching the pattern used elsewhere (e.g. `Select` listbox id).

---

### 3. Decorative checkbox glyph (SVG) is not hidden from the accessibility tree

- **WCAG / basis:** 1.1.1 / Best practice (non-text content that duplicates state); APG only (redundant noise)
- **Severity:** **P2**
- **Scope:** **Component default**
- **Issue + impact:** `CheckboxIcon` renders SVG paths with no `aria-hidden="true"` (and the wrapping `span` is not marked inert). State and name already come from the native input; extra graphics can cause redundant or confusing announcements in some AT/browser combinations.
- **Suggestion:** Set `aria-hidden="true"` on the SVG (or on the purely decorative `span` that only contains the icon).

---

### 4. `aria-invalid={true}` without a guaranteed associated error description

- **WCAG / basis:** 3.3.1 Error Identification; 3.3.2 Labels or Instructions (association)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — occurs when `error={true}` without `helpText` and without passing an error element id via `aria-describedby`.
- **Issue + impact:** The control exposes invalid state, but users may not hear **what** is wrong unless the app links copy via `helpText` or merges an error id into `aria-describedby` (the component merges consumer `aria-describedby` with help text id when provided).
- **Suggestion:** Document that error state should pair with descriptive text referenced by `aria-describedby` (e.g. via `helpText` or explicit `aria-describedby`).

---

### 5. Optional enhancements (not scored as violations)

- **WCAG / basis:** P3 / Best practice
- **Severity:** **P3**
- **Scope:** **Consumer-dependent**
- **Issue + impact:** For checkbox **groups**, consumers should use `<fieldset>` / `<legend>` (or equivalent ARIA grouping) — not enforced by this atom.
- **Suggestion:** Point group usage to fieldset/legend in docs or a dedicated group component.

---

## Positive observations

- Uses **native** `<input type="checkbox">` (correct role, keyboard behavior, and form submission semantics).
- **`indeterminate`** reflected via DOM property (`ref.current.indeterminate`) and **`aria-checked="mixed"`** when `indeterminate` is true (appropriate for mixed state).
- **Label association** via `id` + `<label htmlFor={id}>` when a non-empty `label` is provided.
- **`aria-describedby`** correctly combines consumer `aria-describedby` with help text id when help text is non-empty.
- **`aria-invalid`** reflects `error` when true.
- **`disabled`** maps to native `disabled`.
- **`tabIndex`** is forwarded (default `0`), allowing intentional removal from tab order when needed for composite patterns.

---

## Summary counts

| Severity | Count |
|----------|-------|
| P0 | 0 |
| P1 | 1 |
| P2 | 3 |
| P3 | 1 (enhancement) |

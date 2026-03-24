# Tooltip — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) — supplementary description for a **trigger**; tooltip surface uses `role="tooltip"`, is **not** keyboard-focusable, and is associated with the trigger via **`aria-describedby`** while visible (and typically **no** `aria-expanded` on the trigger, unlike disclosure).
- **Implementation map:** `Tooltip` is a thin layer over **`Popover`** → **`PopperWrapper`** (react-popper `Manager` / `Reference` / `Popper`), with hover + focus-open on the trigger wrapper and the tooltip content portaled to `document.body` by default (`appendToBody: true` on `PopperWrapper`).
- **Root cause / rollup:** All tooltip-specific semantics are missing because the stack is built as a **generic popover/positioning layer** (`div` wrappers, `data-*` hooks only). Fixing ARIA for Tooltip likely requires either tooltip-only props/branches in shared code or encapsulating `role` / `id` / `aria-describedby` wiring inside `Tooltip` + cloning the trigger when open.

### Files reviewed

| Area | Path |
|------|------|
| Tooltip | `core/components/molecules/tooltip/Tooltip.tsx`, `core/components/molecules/tooltip/index.tsx` |
| Popover (used by Tooltip) | `core/components/molecules/popover/Popover.tsx` |
| Positioning / trigger | `core/components/atoms/popperWrapper/PopperWrapper.tsx` |
| Trigger wrapper | `core/components/atoms/outsideClick/OutsideClick.tsx` |
| Tooltip text atom | `core/components/atoms/text/Text.tsx` (renders `span` via `GenericText`) |

---

## Findings

### 1. Tooltip surface has no accessible role (`role="tooltip"`)

- **WCAG / basis:** **4.1.2** (Name, Role, Value — role of the supplementary UI not exposed); **APG only** for the exact `tooltip` role mapping.
- **Severity:** **P1**
- **Scope:** **Component default** — every visible tooltip is a plain `div` (`Tooltip` wrapper) inside a plain `div` (`Popover` wrapper); neither declares `role="tooltip"`.
- **Repro:** Use `<Tooltip tooltip="Help text" position="bottom"><Button>Action</Button></Tooltip>` as documented; inspect the portaled node: no `role="tooltip"`.
- **Issue + impact:** Assistive technologies cannot reliably treat the floating content as a **tooltip** (vs dialog, popup, etc.), which weakens correct reading mode and pattern expectations.
- **Suggestion:** Put `role="tooltip"` on the single outermost element that wraps the tooltip text (prefer the node that already wraps `{tooltip}` in `Tooltip.tsx`, or merge with the `Popover` wrapper if you collapse layers). Ensure no nested conflicting roles.

---

### 2. No programmatic link between trigger and tooltip (`id` + `aria-describedby`)

- **WCAG / basis:** **1.3.1** (info and relationships — supplementary description not programmatically tied to the control); **4.1.2** (states/properties — missing `aria-describedby` on the referencing element when the description is present).
- **Severity:** **P1**
- **Scope:** **Component default** — `PopperWrapper` only merges `ref` and hover/focus/click handlers into the trigger (`cloneElement` / `OutsideClick`); nothing sets `aria-describedby` on the trigger when the tooltip is shown. The tooltip container has no stable **`id`** for that reference.
- **Repro:** Focus the trigger with a screen reader: supplementary `tooltip` string is not associated via `aria-describedby` in the DOM when the tooltip is open.
- **Issue + impact:** Users who rely on the description relationship (beyond any visible label) may not hear the tooltip content in the intended context, especially when the tooltip adds **non-redundant** information (hints, constraints, elaboration).
- **Suggestion:** Generate a unique id (e.g. `React.useId()`), set it on the tooltip root with `role="tooltip"`. When open, merge `aria-describedby={tooltipId}` onto the **trigger** element (preserve existing `aria-describedby` by space-separating ids). When closed, remove the id from `aria-describedby` and unmounting already removes the tooltip node.

---

### 3. No Escape-to-dismiss handling (APG Tooltip)

- **WCAG / basis:** **APG only** / **Best practice** (not a clear 2.1.1 failure for a non-focusable, hover/focus-triggered surface).
- **Severity:** **P2**
- **Scope:** **Component default** — `PopperWrapper` does not listen for `Escape` for `on === 'hover'` tooltips.
- **Issue + impact:** Matches neither APG’s optional **Escape** dismissal for the tooltip pattern nor user expectations on dense pages where a tooltip may obscure content.
- **Suggestion:** On keydown `Escape` while open, close the tooltip and return focus to the trigger (focus should already be on the trigger if opened via focus).

---

### 4. Trigger wrapped in non-semantic `div` (`OutsideClick`)

- **WCAG / basis:** **HTML** / **Best practice** (wrapper does not use `role` or landmark; usually acceptable if focus lands on the real control inside).
- **Severity:** **P2**
- **Scope:** **Component default** — `OutsideClick` renders a `div` that receives `onFocus` / `onBlur` / mouse handlers for hover mode.
- **Issue + impact:** Extra wrapper is generally fine if the **actual** trigger remains a native `<button>` / `<a>` / labelled control. Risk rises if consumers pass non-focusable children and rely on the wrapper for interaction (would be **consumer-dependent** misuse).
- **Suggestion:** Prefer merging handlers onto the trigger element when it is a single React element that accepts refs and events; otherwise document that children must be a single focusable control.

---

### 5. Optional: redundant `aria-label` vs tooltip copy

- **WCAG / basis:** **Best practice** / **1.3.1** (avoid duplicate or conflicting accessible names vs descriptions).
- **Severity:** **P3** (enhancement — not a violation by itself)
- **Scope:** **Consumer-dependent** — if both `aria-label` (or visible name) and `aria-describedby` repeat the same string, some AT may announce twice once wiring is added.
- **Suggestion:** Document that tooltip text should elaborate, not duplicate, the control’s accessible name; or dedupe in stories/docs.

---

## Out of scope (not audited here)

- Color contrast, focus ring CSS, motion, touch target size (per audit charter).
- Runtime behavior of React’s bubbled `focus` events on the `OutsideClick` wrapper (assumed OK for focus-triggered open; verify in Storybook if any trigger fails to open on focus).

---

## Summary counts

- **P0:** 0  
- **P1:** 2 (missing `role="tooltip"`; missing `id` / `aria-describedby` wiring)  
- **P2:** 2  
- **P3:** 1 (documentation / redundancy guidance)

# EditableInput — Structural ARIA / Semantic Audit

## Implementation files reviewed

| File | Role |
|------|------|
| `core/components/molecules/editableInput/EditableInput.tsx` | Main implementation & props |
| `core/components/molecules/editableInput/index.tsx` | Re-exports |
| `core/components/atoms/editable/Editable.tsx` | Wrapper used by `EditableInput` (keyboard + pointer to enter edit mode) |
| `core/components/atoms/button/Button.tsx` | Save / Discard actions (icon-only usage) |
| `core/components/organisms/inlineMessage/InlineMessage.tsx` | Error content inside hover `Popover` |

**APG pattern:** Hybrid of **Button** (activate to edit) plus **text field** in edit mode; not a single named APG composite. Structural issues mainly come from composing `Editable` + `Input` + icon `Button`s.

**Root cause / rollup:** Multiple high-severity findings trace to **`Editable`’s inner `role="button"` + `tabIndex={0}` always wrapping `children`**, so in edit mode the text field lives inside a focusable button. Icon-only action buttons lack names at the **`Button`** layer when `EditableInput` does not pass `tooltip` or `aria-label`.

---

## Findings

### 1. Nested interactive: text input inside focusable `role="button"`

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (focus order / widget semantics). **APG only** (nested interactive in `role="button"`).
- **Severity:** **P1**
- **Scope:** **Component default** — any use of `EditableInput` enters this DOM when editing.
- **Repro:** Open `EditableInput` into edit mode; Tab — focus can land on the `Editable` inner wrapper (`DesignSystem-EditableWrapper`) before or in addition to the real `<input>`, and the `<input>` is structurally a descendant of a `role="button"` element.
- **Issue + impact:** WAI-ARIA expects authors not to place interactive content (e.g. a textbox) inside an element with `role="button"`. Assistive technologies may expose conflicting roles, skip or duplicate tab stops, or treat the field as part of the “button,” breaking predictable form semantics.
- **Suggestion:** Refactor so the edit trigger is only around the **static** display (e.g. separate trigger from the input tree), or drop `role="button"` / `tabIndex` on the wrapper while `editing` is true and move keyboard activation to a dedicated control. Prefer native `<button>` for the trigger where possible.

---

### 2. Icon-only Save and Discard buttons have no default accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P0**
- **Scope:** **Component default** — `EditableInput` renders `Button` with `icon` only and no `children`, `tooltip`, or `aria-label`.
- **Repro:** Use `EditableInput` as documented with editing actions visible; inspect or listen to the two action buttons (clear / check).
- **Issue + impact:** `Button` sets `aria-label` only from `aria-label` or, when there are no children, from `tooltip`. Neither is provided here, so icon-only buttons are unnamed for screen reader users.
- **Suggestion:** Pass stable, translatable `aria-label` (and optionally `tooltip` for sighted hover text) on both buttons, e.g. “Discard changes” and “Save changes,” or expose props on `EditableInput` so consumers can override.

---

### 3. Edit trigger can have no accessible name when value and placeholder are empty

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Component default** when `value` is empty/undefined and `placeholder` is omitted or empty (default `placeholder` is `''`).
- **Repro:** Render `<EditableInput size="regular" inputOptions={{ name: 'x' }} />` with no `value`, `placeholder`, or visible text inside the default view.
- **Issue + impact:** The default view is a plain `div` whose text content is `{value || placeholder}`; the outer `Editable` wrapper is `role="button"` with no `aria-label`. Empty text yields an unnamed focusable control.
- **Suggestion:** Require a non-empty placeholder or `aria-label` on the trigger when the displayed value can be empty; or derive an accessible name from `inputOptions` (e.g. associated `Label` / `aria-label` forwarded to the trigger).

---

### 4. Error message shown only via hover `Popover`; not programmatically tied to the input

- **WCAG / basis:** 3.3.1 Error Identification; 4.1.3 Status Messages (if treated as status); **Best practice** / **APG** for associating errors with fields.
- **Severity:** **P1**
- **Scope:** **Component default** when `error`, `errorMessage`, and `editing` are all true (Popover wraps the input, `on="hover"`).
- **Repro:** Keyboard-only user focuses the input with `error` and `errorMessage` set; they may never open the hover popover, so the error text is easy to miss. There is no `aria-describedby` / `aria-invalid` wiring from `EditableInput` to the `Input` for `errorMessage`.
- **Issue + impact:** Validation feedback is primarily visual/hover-driven; screen reader and keyboard users may not perceive the error message or its relationship to the field.
- **Suggestion:** Surface errors inline next to the field, use `aria-invalid` on the input when `error`, point `aria-describedby` to a visible (or visually hidden) error element with an appropriate live region if content appears dynamically, and avoid hover-only as the sole channel for critical errors.

---

### 5. No `aria-expanded` (or related) state on the edit trigger

- **WCAG / basis:** **Best practice** / **APG** (disclosure-like “edit in place” behavior).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Users of assistive technology get no standard state for “collapsed” (read-only display) vs “expanded” (editing with field and actions).
- **Suggestion:** On the element that activates edit mode, set `aria-expanded={editing}` and, if appropriate, `aria-controls` referencing the editing region id.

---

### 6. `InlineMessage` with `appearance="alert"` is not a live region

- **WCAG / basis:** 4.1.3 Status Messages (context-dependent); **Best practice** for urgent errors.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** for copy; **Component default** for how `EditableInput` composes `InlineMessage` inside `Popover`.
- **Issue + impact:** The error content is a static `div` tree with no `role="alert"` / `aria-live` unless added elsewhere; combined with hover popover, announcements are unreliable.
- **Suggestion:** Use a pattern that announces errors when they appear (e.g. `role="alert"` or polite `aria-live` on the message container) and keep the message discoverable without hover.

---

### 7. Outer container `role="presentation"` hosts `onKeyDown` for Enter/Escape handling

- **WCAG / basis:** **HTML** / **Best practice** (handler placement, not a direct SC failure if events still bubble correctly).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Keyboard handling relies on event bubbling from the focused `<input>` to a presentational ancestor. This works in typical React bubbling but is fragile and non-obvious for maintenance; it does not document intent in the DOM.
- **Suggestion:** Attach Enter/Escape handling on the `Input` via `inputOptions` callbacks or wrap the field in a region that is not purely presentational if it carries behavior semantics.

---

### 8. Positive: `inputOptions` can supply field labeling and ARIA on the native input

- **WCAG / basis:** 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions; 4.1.2.
- **Severity:** **P3** (enhancement note, not a violation)
- **Scope:** **Consumer-dependent** — consumers must pass `aria-label`, `aria-labelledby`, `id` + external `Label`, etc., via `inputOptions` (typed as `InputProps` minus a few keys).
- **Issue + impact:** None by default; the molecule does not enforce a label.
- **Suggestion:** Document required labeling for WCAG compliance and optionally thread a dedicated `label` / `aria-label` prop on `EditableInput` that applies to both display and input modes.

---

## Summary counts

| Severity | Count |
|----------|------:|
| P0       | 1 |
| P1       | 3 |
| P2       | 3 |
| P3       | 1 (enhancement) |

# FileUploader — structural ARIA / semantic audit

## Component overview

**APG pattern:** File input with custom “button” affordance (visually stacked controls), plus optional **list of file rows** with actions. Related APG patterns: [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (native `<button>` vs custom `role="button"`), [File input](https://www.w3.org/WAI/ARIA/apg/practices/) (native `<input type="file">` semantics).

**Implementation files reviewed:**

- `core/components/molecules/fileUploader/FileUploader.tsx` — shell: title, format/size copy, optional sample link, `FileUploaderButton`
- `core/components/molecules/fileUploader/FileUploaderButton.tsx` — `<Button>` + overlaid `<input type="file">` (`tabIndex={-1}`)
- `core/components/molecules/fileUploader/FileUploaderFormat.tsx` — optional format hint text
- `core/components/molecules/fileUploader/FileUploaderList.tsx` — list container + `FileUploaderItem` rows
- `core/components/molecules/fileUploader/FileUploaderItem.tsx` — row layout, optional `role="button"` row, cancel control, error `InlineMessage`
- `core/components/molecules/fileUploader/FileUploaderStatus.tsx` — uploading `ProgressRing` / error retry control
- `css/src/components/fileUploader.module.css` — overlay positioning for the file input

**Root cause / rollup:** Several issues stem from (1) splitting focus between a native `<button>` and a separate `<input type="file">` with `tabIndex={-1}`, and (2) **icon-only** `Button` usages without `tooltip` / `aria-label` (see `Button`’s `aria-label` rule in `core/components/atoms/button/Button.tsx`). The clickable row pattern (`role="button"` on a `div` containing other buttons) conflicts with APG expectations for a single tab stop / no nested interactives.

---

## Findings

### 1. Keyboard cannot reliably open the file dialog from the focusable control

- **WCAG / basis:** 2.1.1 Keyboard
- **Severity:** P0
- **Scope:** Component default
- **Repro:** Tab to the upload control in `FileUploader` as documented; focus lands on the design-system `<button>` (`type="button"`). Activating it with keyboard does not open the native file chooser because the operable file control is the overlaid `<input type="file">`, which uses `tabIndex={-1}` and is not focused.
- **Issue + impact:** Pointer users hit the transparent input (CSS overlay). Keyboard-only users get a focusable button that does not trigger the file picker. This is a functional keyboard gap for the primary action.
- **Suggestion:** Align with a single keyboard-focus target that opens the dialog—e.g. `<label htmlFor={inputId}>` styled as the trigger wrapping or associated with the input; or keep visual design but move focus to the file input (`tabIndex={0}`) and hide the duplicate button from the accessibility tree / use `onClick` on the visible button to `input.click()` while ensuring one coherent accessible name and tab stop. Follow APG/native patterns for file upload.

---

### 2. Remove / close control is icon-only with no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P0
- **Scope:** Component default (when `onDelete` is provided and the cancel button renders)
- **Repro:** Use `FileUploaderList` with `onDelete` set; inspect the cancel `Button` (`icon="close"`, no children).
- **Issue + impact:** `Button` sets `aria-label` only from `aria-label` or `tooltip` when there are no children. With neither, the control has no programmatic name (icon is not a sufficient name).
- **Suggestion:** Pass `aria-label` (e.g. “Remove {file name}”) or `tooltip` on the cancel `Button`, or expose a prop for consumers to localize the string.

---

### 3. Retry control is icon-only with no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P0
- **Scope:** Component default when `status === 'error'` and `onRetry` is provided
- **Repro:** Render an item with `status: 'error'` and `onRetry` handler; inspect the retry `Button` (`icon="refresh"`, no children).
- **Issue + impact:** Same as finding 2—no `aria-label` / `tooltip`, so the retry action is unnamed for assistive tech.
- **Suggestion:** Add `aria-label` or `tooltip` (e.g. “Retry upload” / include file name).

---

### 4. `role="button"` row contains nested focusable controls (invalid composite)

- **WCAG / basis:** 4.1.2 Name, Role, Value; APG only (button pattern — no nested interactive elements)
- **Severity:** P1
- **Scope:** Component default when both `onClick` and delete/retry affordances are used on the same row
- **Repro:** `FileUploaderList` with `onClick` and `onDelete` (and/or error + `onRetry`); tab through the row.
- **Issue + impact:** The outer `div` exposes `role="button"` and `tabIndex={0}` while inner real `<button>` elements (cancel, retry) remain in the tab order. Assistive technologies and the APG “button” pattern expect a single focusable control or a different structure (e.g. list item + separate named buttons, or a single `<button>` for the row action only with actions in a menu).
- **Suggestion:** Refactor so the row is not `role="button"` when it contains other buttons—use a list/item structure, or make the filename a plain text + separate explicit buttons with names, or use a pattern like `role="group"` with `aria-labelledby` pointing at the file name.

---

### 5. File `<input>` is not programmatically associated with the visible label / helper copy

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value
- **Severity:** P1
- **Scope:** Component default
- **Repro:** Use `FileUploader` with default `title`, `sizeLabel`, and `formatLabel`; inspect the `<input type="file">` vs the `<Text>` nodes—no shared `id` / `htmlFor` / `aria-labelledby` / `aria-describedby` wiring in code.
- **Issue + impact:** Title, size, and format strings are visually related but not exposed as the input’s accessible name/description. In reading order, users may encounter the file input separately from that context. `extractBaseProps` only forwards `className` / `data-test`, so consumers cannot pass `aria-*` onto the input via existing base types.
- **Suggestion:** Generate stable unique ids for the file input and wire `aria-labelledby` / `aria-describedby` to the heading and hint elements, or use a `<label>` that correctly targets the file input per HTML semantics.

---

### 6. Error and progress feedback lack status/progress semantics

- **WCAG / basis:** 4.1.3 Status Messages (WCAG 2.2 AA); Best practice for `role="progressbar"` / live regions
- **Severity:** P1 (status announcements when content updates); P2 (static error text already in tree)
- **Scope:** Component default when status transitions to `error` or `uploading` with changing `progress`
- **Repro:** Toggle an item to `error` or update `progress` while uploading; observe `InlineMessage` (`div` only) and `ProgressRing` (plain `svg` with no `role` / `aria-valuenow`).
- **Issue + impact:** Dynamic error injection and progress changes may not be announced as status messages. `ProgressRing` does not expose a progressbar role or live text for percentage.
- **Suggestion:** For errors, use `role="alert"` or an `aria-live` region on `InlineMessage` when `appearance="alert"`, or ensure parent live region. For upload progress, add `role="progressbar"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` (and optional `aria-label`) on `ProgressRing` or a wrapper, or an off-screen polite live region when values change.

---

### 7. File list is a plain `div` with no list semantics

- **WCAG / basis:** 1.3.1 Info and Relationships
- **Severity:** P2
- **Scope:** Component default
- **Repro:** Render `FileUploaderList` with multiple items; DOM is nested `div`s only.
- **Issue + impact:** Screen reader users lose “list of N items” structure; relationship between items is only visual.
- **Suggestion:** Use `<ul>` / `<li>` or `role="list"` / `role="listitem"` if layout allows.

---

### 8. Optional `id` on file input — duplicate id risk across instances

- **WCAG / basis:** 4.1.1 Parsing (duplicate IDs break relationships); Best practice
- **Severity:** P2
- **Scope:** Consumer-dependent — multiple `FileUploader` instances without distinct `id`
- **Repro:** Two `FileUploader` components with the same `id` prop (or default none, if consumers add static ids in wrappers).
- **Issue + impact:** Broken `label for` / `aria-labelledby` associations if ids collide.
- **Suggestion:** Document requirement for unique `id` per instance or generate ids internally (e.g. `useId()`).

---

### 9. `FileUploaderItem` custom button: name may be incomplete for purpose

- **WCAG / basis:** Best practice
- **Severity:** P3
- **Scope:** Consumer-dependent — meaning of row click is app-specific
- **Repro:** Row with `onClick` uses file name as the only text inside `role="button"`.
- **Issue + impact:** Name describes the file but not the action (“Open”, “Select”, etc.).
- **Suggestion:** Optional prop for `aria-label` on the row when `onClick` is set.

---

## Summary counts

| Severity | Count |
| -------- | ----- |
| P0       | 3     |
| P1       | 3     |
| P2       | 2     |
| P3       | 1     |

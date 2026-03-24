# Dropzone — structural ARIA / semantic audit

## Implementation files

| Path | Role |
|------|------|
| `core/components/molecules/dropzone/Dropzone.tsx` | Presentation: layout, copy, “browse” affordance, composes base |
| `core/components/molecules/dropzone/DropzoneBase.tsx` | Drag/drop state, `getRootProps` / `getInputProps`, file dialog |
| `core/components/molecules/dropzone/DropzoneActive.tsx` | Active drag overlay copy |
| `core/components/molecules/dropzone/DropzoneError.tsx` | Reject-state copy |
| `core/components/molecules/dropzone/DropzoneIcon.tsx` | Decorative SVG illustration |
| `core/components/molecules/dropzone/FileErrors.tsx` | Validation helpers + user-facing error strings |
| `core/components/molecules/dropzone/utils.tsx` | Event helpers, reducer |
| `core/components/molecules/dropzone/FileSelectorUtils.tsx` | `fromEvent` / file extraction |
| `core/components/molecules/dropzone/index.tsx` | Public exports |
| `core/accessibility/utils/useAccessibilityProps.ts` | `role="button"`, Enter/Space → `onClick` for “browse” `Text` |

**APG / pattern:** No single WAI-ARIA APG widget maps 1:1 to a custom drop target + hidden `<input type="file">`. This implementation is a **hybrid**: native file input (hidden) + pointer drag events on a container + a **keyboard-activatable** `span` with `role="button"` for opening the dialog.

**Root cause / rollup:** `DropzoneBase.getRootProps` omits several behaviors its own callbacks imply (keyboard/focus on root, optional root click). Usable paths rely on **`Dropzone.tsx`** wiring (`useAccessibilityProps` on “browse files” only).

---

## Findings (severity order)

### 1. Hidden `<input type="file">` lacks an accessible name and label association

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic label for the control).
- **Severity:** **P1**
- **Scope:** **Component default** — `getInputProps()` supplies `accept`, `multiple`, `type`, `tabIndex: -1`, handlers, but no `aria-label`, `aria-labelledby`, or `<label htmlFor>` pairing with visible instructions.
- **Repro:** Open the accessibility tree or screen-reader form/controls list; the file input is present but not named or tied to “Drag your files here…” / format/size copy.
- **Issue + impact:** Assistive technologies that expose the file input separately do not inherit the visible paragraph as its name; users may not understand what the control does.
- **Suggestion:** Generate stable `id`s for instruction text (and optional hints) and pass `aria-labelledby` / `aria-describedby` on the input, or add a concise `aria-label` that reflects `accept` / `multiple` when appropriate.

---

### 2. `getRootProps` drops keyboard and focus handlers (`onKeyDownCb`, `onFocusCb`, `onBlurCb`)

- **WCAG / basis:** 2.1.1 Keyboard (partial — mitigated by “browse” control); **APG only** / **Best practice** for a single, discoverable activation target.
- **Severity:** **P2**
- **Scope:** **Component default** for **root** behavior; **mitigated** because `Dropzone.tsx` puts Enter/Space on the “browse files” `Text` via `useAccessibilityProps`.
- **Repro:** TBD — verify in Storybook: focus never lands on the outer `DesignSystem-Dropzone` root; Space/Enter on root do nothing (only on “browse files”).
- **Issue + impact:** `DropzoneBase` defines `onKeyDownCb` (comment: open dialog on Space/Enter on **dropzone root**) and focus/blur dispatchers but **never merges** them into the object returned by `getRootProps` — they only appear in a `useMemo` dependency list. Root is not focusable and has no `onKeyDown`/`onFocus`/`onBlur` from base. This is dead code and confuses anyone extending `getRootProps`.
- **Suggestion:** Either compose `composeEventHandlers(onKeyDown, onKeyDownCb)` (and focus/blur) into the returned props and add `tabIndex={0}` + appropriate role when the full surface should be keyboard-operable, or remove unused callbacks and document that activation is **only** via the inner button pattern.

---

### 3. `getRootProps` also omits root `onClick` (file dialog only from “browse”)

- **WCAG / basis:** 2.1.1 Keyboard — **not** a keyboard failure; **Best practice** for pointer parity with common dropzone UX.
- **Severity:** **P2**
- **Scope:** **Component default** — clicking “Drag your files here or” / non-`browse` areas may not open the picker unless drag handlers or children handle it; only the `Text` with `useAccessibilityProps` is clearly activatable.
- **Issue + impact:** Many users expect the **entire** drop surface to open the file dialog on click; here, behavior depends on hitting the small “browse files” target (drag still works on the root).
- **Suggestion:** If product intent is whole-surface click, add `onClick` on the root (when not `disabled`) to call `open`, or use a `<label>` wrapping the hidden input tied to the full hit target per HTML-first patterns.

---

### 4. Decorative SVG icons lack `aria-hidden`

- **WCAG / basis:** 1.1.1 Non-text Content (decorative); **Best practice** alignment with design-system rules.
- **Severity:** **P2**
- **Scope:** **Component default** — `DropzoneIcon` renders `<svg>` with no `aria-hidden="true"` (or `role="img"` + name if ever meaningful).
- **Issue + impact:** Some screen readers may announce unlabeled graphics or add noise next to adjacent text.
- **Suggestion:** Set `aria-hidden="true"` on the SVG when the adjacent `Text` conveys the same meaning.

---

### 5. Drag-active / drag-reject UI has no live-region semantics

- **WCAG / basis:** 4.1.3 Status Messages (AA) — **optional** depending on whether state is “status” without focus change; **Best practice** / **P3**-leaning.
- **Severity:** **P3** (enhancement — not scored as a violation absent a requirement to announce transient drag feedback)
- **Scope:** **Component default** — `DropzoneActive` / `DropzoneError` swap visually; no `aria-live` / `role="status"` / `role="alert"`.
- **Issue + impact:** Screen-reader users may not hear that the zone entered an error or “drop here” state during drag.
- **Suggestion:** For reject text, consider `role="alert"` or `aria-live="assertive"` on a wrapper; for neutral active state, `aria-live="polite"` if UX research supports it.

---

### 6. `useAccessibilityProps` called inside nested `renderDropzone` (conditional early returns)

- **WCAG / basis:** **Non-WCAG** — code quality / `eslint-plugin-react-hooks` convention.
- **Severity:** **P3**
- **Scope:** **Component default** — function is not implemented with React hooks internally, so this does not break the dispatcher, but the `use*` prefix and placement inside a nested function with early returns **violates typical hook-style rules** and is easy to break if the helper ever starts calling real hooks.
- **Issue + impact:** Maintenance risk; false sense that “hooks rules” are satisfied.
- **Suggestion:** Move the `useAccessibilityProps({...})` call to the top level of `Dropzone` (compute props once per render before branching), or rename the helper to e.g. `getButtonAccessibilityProps` if it stays a pure function.

---

### 7. Disabled state: no `aria-disabled` on the outer drop container

- **WCAG / basis:** 4.1.2 / **Best practice** for disabled widgets.
- **Severity:** **P3**
- **Scope:** **Component default** — `disabled` toggles classes and `tabIndex={-1}` on “browse”; root `div` has no `aria-disabled="true"`.
- **Issue + impact:** Minor — some AT heuristics use `aria-disabled` on the composite control; visual “disabled” is partly CSS-only on the root.
- **Suggestion:** When `disabled`, set `aria-disabled="true"` on the root from `Dropzone` (and ensure pointer/drag behavior matches).

---

## Positive notes (brief)

- Native `<input type="file">` is used; `tabIndex: -1` keeps it out of the tab order while a separate activator exists — valid pattern if the input is named/labelled.
- “browse files” uses `useAccessibilityProps` with default `role="button"` so **Enter and Space** activate `open` per expected button keyboard model.
- Drag events are wired on the root via `getRootProps()` for pointer/drag users.

---

## Summary

**P0:** 0 · **P1:** 1 (unnamed / unassociated file input) · **P2:** 4 · **P3:** 3 enhancements / non-WCAG maintenance items.

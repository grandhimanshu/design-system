# Select — structural ARIA audit

## Component overview

**APG pattern:** Custom **select / listbox popup** (button-like trigger + popover panel). Documented usage composes `Select`, `SelectTrigger` (default) or custom `trigger`, `Select.List` → `Listbox`, `Select.Option` → `Listbox.Item`, optional `Select.SearchInput`, `Select.EmptyTemplate`, `Select.Footer`.

**Implementation files (primary):**

- `core/components/organisms/select/Select.tsx`
- `core/components/organisms/select/SelectTrigger.tsx`
- `core/components/organisms/select/SelectList.tsx`
- `core/components/organisms/select/SelectOption.tsx`
- `core/components/organisms/select/SelectContext.tsx`
- `core/components/organisms/select/SearchInput.tsx`
- `core/components/organisms/select/SelectFooter.tsx`
- `core/components/organisms/select/SelectEmptyTemplate.tsx`
- `core/components/organisms/select/utils.tsx`
- `core/components/organisms/select/index.tsx`

**Composed dependencies (relevant to structure):**

- `core/components/organisms/listbox/Listbox.tsx`
- `core/components/organisms/listbox/listboxItem/ListboxItem.tsx`
- `core/components/organisms/listbox/listboxItem/ListBody.tsx`
- `core/components/organisms/listbox/utils.ts` (`onKeyDown` on item wrapper)

**Root cause / rollup:** `Select` layers a `role="listbox"` wrapper and keyboard logic on top of shared **Listbox** primitives built for mixed “resource” / “option” rows. `ListBody` always exposes `role="tablist"` on the **focus target** inside each row. That clashes with **listbox / option** semantics and produces an invalid role tree for Select. A second structural issue is **listbox → `ul` (implicit `list`) → `role="option"`** ownership, which does not match ARIA’s required parent/child relationships for `option`.

---

## Findings

### 1. Focused row uses `role="tablist"` inside a listbox option

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (structure).
- **Severity:** **P0**
- **Scope:** **Component default** (every `Select.Option` uses `Listbox.Item` → `ListBody`).
- **Repro:** Open Select with options; focus moves to `[data-test="DesignSystem-Listbox-ItemWrapper"]` (see `focusListItem` / `navigateOptions` in `utils.tsx`). Inspect roles: outer `li` may carry `role="option"`, but the focused element is the inner `div` with `role="tablist"`.
- **Issue + impact:** Assistive technologies expose the active control as a **tab list**, not a **listbox option**. That misstates the control’s purpose, breaks the listbox pattern, and can confuse navigation mode and announcements. Nesting `tablist` inside `option` is not a valid APG structure.
- **Suggestion:** For `Listbox` `type === 'option'` (or a Select-specific item), use `role="presentation"` / no conflicting role on the inner wrapper, put `role="option"` on the **same element that receives focus**, or refactor to **roving `tabindex` on `role="option"`** elements per APG listbox pattern. Align `ListBody` role with context (option vs resource).

---

### 2. `role="listbox"` wraps a `ul` (list) that owns `option` rows

- **WCAG / basis:** 4.1.2; APG only (ARIA parent/child requirements for `option`).
- **Severity:** **P1**
- **Scope:** **Component default** when using `Select.List` with default `tagName: 'ul'`.
- **Repro:** Render documented `Select` + `Select.List` + options; accessibility tree: `listbox` → `list` (`ul`) → `option` (`li`).
- **Issue + impact:** In ARIA, `option` must be contained by `listbox` or `group`. An intermediate `list` (`ul`) is not a defined container for `option`, so the tree can be structurally invalid and behavior across AT may be inconsistent.
- **Suggestion:** Remove the outer duplicate `listbox` **or** make `Listbox` render a single `listbox` container (e.g. `div`/`ul` with `role="listbox"` and no nested listbox), with **direct** `role="option"` children (or `group` + options). Avoid `listbox` wrapping another list role.

---

### 3. Duplicate `aria-haspopup` / `aria-expanded` on wrapper `div` and trigger `button`

- **WCAG / basis:** 4.1.2; Best practice (redundant / conflicting semantics).
- **Severity:** **P1**
- **Scope:** **Component default** with default `SelectTrigger`.
- **Repro:** Default Select: outer `div` (`data-test="DesignSystem-Select"`) and inner `button` both set `aria-haspopup="listbox"` and `aria-expanded={openPopover}`.
- **Issue + impact:** Two elements in the same widget advertise the same popup state. The wrapper is not the keyboard focus target, which can produce duplicate or confusing screen reader output.
- **Suggestion:** Keep `aria-expanded` / `aria-haspopup` only on the **control that is focused** (the trigger). Remove them from the non-interactive wrapper unless the wrapper is intentionally focusable (it is not).

---

### 4. Custom `trigger` prop drops listbox wiring

- **WCAG / basis:** 4.1.2; 2.1.1 Keyboard (relationship + state discovery).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — broken if `trigger` is used without mirroring required ARIA/state.
- **Repro:** Pass `trigger={<button type="button">…</button>}`; `Select` only `cloneElement(..., { ref })` — no `aria-controls`, `aria-expanded`, `aria-haspopup`, or `id` linkage to the listbox.
- **Issue + impact:** Users of assistive tech may not know the control expands a listbox or which element it controls; keyboard docs may not match actual behavior unless the app reimplements wiring.
- **Suggestion:** Merge in `aria-controls={listboxId}`, `aria-expanded`, `aria-haspopup`, and keyboard handlers (or document that consumers **must** supply them and provide a prop for `listboxId`).

---

### 5. `SelectEmptyTemplate`: `aria-labelledby` / `aria-describedby` / `id` misuse; `role="alert"` + `aria-live="polite"` conflict

- **WCAG / basis:** 4.1.2 (ID references); Best practice (live region role vs politeness).
- **Severity:** **P1** (ID / labeling); **P2** (live region).
- **Scope:** **Component default** when `title` / `description` strings are used.
- **Repro:** Use `title="No results"` and `description="Try again"` — `id={title}` can be invalid or unstable (spaces, duplicates); `aria-labelledby={title}` expects an **ID**, not visible text.
- **Issue + impact:** Relationships may not resolve; duplicate titles across the page cause duplicate IDs. `role="alert"` implies an assertive live region; `aria-live="polite"` suggests polite updates — conflicting expectations.
- **Suggestion:** Generate stable unique IDs (e.g. `useId()` / `uidGenerator`) for title and description elements; set `aria-labelledby` / `aria-describedby` to those IDs. Use either **`role="status"` + `aria-live="polite"`** or **`role="alert"`** without conflicting politeness.

---

### 6. Outer listbox container `tabIndex={0}` adds an extra tab stop

- **WCAG / basis:** 2.4.3 Focus Order; APG only (listbox focus model).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Repro:** Tab through an open Select panel: the `div` with `role="listbox"` is focusable (`tabIndex={0}`) in addition to search, options, and footer actions.
- **Issue + impact:** Focus order may not match the APG listbox model (typically focus on trigger + options or `aria-activedescendant`). Extra stops can disorient keyboard users.
- **Suggestion:** Prefer `tabIndex={-1}` on the listbox container if focus is managed on options/trigger only, or align fully with APG combobox/listbox focus guidance.

---

### 7. Search field: partial popup semantics (`aria-haspopup`) without `role="combobox"` / `aria-controls` linkage

- **WCAG / basis:** 4.1.2; APG only (combobox + listbox popup).
- **Severity:** **P2**
- **Scope:** **Component default** when `Select.SearchInput` is used.
- **Issue + impact:** The text field sets `aria-haspopup="listbox"` but is not a full combobox pattern (`aria-controls` to the listbox `id`, expanded state, optional `aria-autocomplete`, etc.). Screen readers may not associate typing with the same listbox as the trigger.
- **Suggestion:** Either implement APG **combobox** semantics for the search + listbox pair or remove misleading `aria-haspopup` from the input and rely on the listbox labeling + focus management.

---

### 8. Parallel keyboard handlers: `ListBody` `onKeyDown` (listbox `utils`) vs `SelectOption` `onKeyDown` on `li`

- **WCAG / basis:** 2.1.1; Best practice (predictable behavior).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Focused element is `ListBody`’s `div`, which runs `onKeyDown` from `listbox/utils.ts` (sibling-based ArrowUp/Down). The same event bubbles to `li` where `Select`’s `handleKeyDown` also runs (`utils.tsx`). Two navigation implementations can conflict or double-handle keys depending on event order and `preventDefault` usage.
- **Suggestion:** Single source of truth for option navigation in Select; disable or bypass listbox `onKeyDown` for `type === 'option'` when used inside Select, or move Select key logic to the focused element only.

---

### 9. Generic default accessible names for trigger and options

- **WCAG / basis:** 2.4.6 Headings and Labels; Best practice.
- **Severity:** **P3** (enhancement — defaults exist but are weak).
- **Scope:** **Consumer-dependent** for real labels; defaults are generic.
- **Issue + impact:** Default `aria-label` values (`Select trigger`, `option item`) may not identify the field or option in context.
- **Suggestion:** Document that apps should pass meaningful `triggerOptions['aria-label']` / visible labels and per-option labels; consider deriving option name from `option.label` when `aria-label` is omitted.

---

### 10. `SelectFooter` is an unlabeled `div` wrapper

- **WCAG / basis:** 1.3.1; Best practice (landmarks / grouping).
- **Severity:** **P3**
- **Scope:** **Consumer-dependent** — depends on footer content.
- **Issue + impact:** No `role` or `aria-label`; acceptable if children are self-labeled controls, but the region is not programmatically named as an “actions” area.
- **Suggestion:** Optional `aria-label` prop for the footer region when it groups actions.

---

## Summary counts

| Severity | Count |
| -------- | ----- |
| P0       | 1     |
| P1       | 4     |
| P2       | 3     |
| P3       | 2     |

Primary fix path: reconcile **Listbox `ListBody`** roles and keyboard behavior with **Select listbox/option** APG structure, then flatten duplicate listbox/list containers and redundant ARIA on the outer wrapper.

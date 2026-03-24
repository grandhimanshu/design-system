# Listbox — structural ARIA audit

## Implementation scope

Audited files:

- `core/components/organisms/listbox/Listbox.tsx`
- `core/components/organisms/listbox/listboxItem/ListboxItem.tsx`
- `core/components/organisms/listbox/listboxItem/ListBody.tsx`
- `core/components/organisms/listbox/utils.ts` (keyboard navigation)
- `core/components/organisms/listbox/nestedList/NestedList.tsx`
- `core/components/organisms/listbox/reorderList/DraggableList.tsx`
- `core/components/organisms/listbox/reorderList/Draggable.tsx`
- `core/components/organisms/listbox/reorderList/types.ts`

Related consumer (referenced for composition only): `core/components/organisms/combobox/ComboboxList.tsx` passes `role="listbox"` onto `Listbox`; `ComboboxOption` (under `core/components/organisms/combobox/`) passes `role="option"` and `tabIndex={-1}` on `Listbox.Item`.

---

## Component overview

**APG intent:** The package uses this organism as a styled list (`ul` / `ol` / `div` / `nav`) and, in Combobox, as a **Listbox** container with `role="listbox"` and options. Row keyboard navigation (`ArrowUp` / `ArrowDown`) matches a vertical list pattern, but the DOM roles and focus placement do **not** align with the [WAI-ARIA Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) (or Tabs).

**Root cause / rollup:** `ListBody` hard-codes `role="tablist"` on the **focusable** inner `div` while `ListboxItem` keeps the outer `Tag` (`li` / `div` / `a`) as the click target and (when used from Combobox) `role="option"` on that outer tag. That single design splits **focus** vs **widget role** and mislabels rows as tab lists. Several findings below roll up to fixing `ListBody` semantics, focus target, and state ARIA on one coherent interactive node (or documented `aria-activedescendant` usage from a parent).

---

## Findings

### 1. Incorrect `role="tablist"` on every row’s focusable region

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (structure/semantics).
- **Severity:** **P0**
- **Scope:** **Component default** — any `Listbox` + `Listbox.Item` renders `ListBody` with `role="tablist"`.
- **Repro:** Render `<Listbox><Listbox.Item id="a">…</Listbox.Item></Listbox>`; the element with `tabIndex={0}` is the inner wrapper with `role="tablist"`, not a list option or neutral group.
- **Issue + impact:** Assistive technologies expose each row as a **tab list** with no `role="tab"` children, which is structurally invalid for APG Tabs and unrelated to list/listbox behavior. Users get wrong navigation affordances and a broken implicit structure (e.g. “tablist” without tabs).
- **Suggestion:** Remove `role="tablist"` unless implementing the full Tabs pattern. For listbox usage, put `role="presentation"` / none on purely visual wrappers, or place `role="option"` on the **same** element that receives focus (or use `aria-activedescendant` from a single tab stop). For plain lists, prefer native `ul`/`li` semantics without conflicting roles.

---

### 2. Combobox composition: `listbox` → `option` contains nested `tablist` (focused)

- **WCAG / basis:** 4.1.2; APG only (listbox containment).
- **Severity:** **P0**
- **Scope:** **Component default** when used as documented with Combobox (`ComboboxList` + `ComboboxOption`).
- **Repro:** `ComboboxList` sets `role="listbox"` on `Listbox`; `ComboboxOption` sets `role="option"` on `Listbox.Item` (`li`) but keyboard focus lands on the inner `div` with `role="tablist"`.
- **Issue + impact:** The accessibility tree has a **listbox option** whose focused descendant is a **tablist**, which violates the expected listbox subtree and confuses SRs (focused role/name vs `option`). Selection and position announcements are unreliable.
- **Suggestion:** Align with APG: single tab stop on the listbox or focusable options without nested conflicting roles; ensure the focused node is the `option` (or referenced via `aria-activedescendant`).

---

### 3. `selected` / `disabled` not mapped to ARIA state on the focused control

- **WCAG / basis:** 4.1.2
- **Severity:** **P1**
- **Scope:** **Component default** for `type="option"` / `selected` / `disabled` props; **Consumer-dependent** if consumers rely solely on visual styling without passing extra ARIA.
- **Repro:** `Listbox.Item` with `type="option"` and `selected` or `disabled` — focusable `ListBody` div has no `aria-selected` / `aria-disabled`.
- **Issue + impact:** Selection and disabled state are communicated visually (CSS / `data-disabled`) but not consistently as accessible state on the element that receives keyboard focus, so screen readers may not report “selected” or “unavailable” correctly.
- **Suggestion:** When acting as options, set `aria-selected` (and `aria-disabled` or omit from tab order + `aria-disabled="true"`) on the same element that is focused or on the `option` node per APG.

---

### 4. Nested rows: `expanded` prop has no `aria-expanded` (or controlled region wiring)

- **WCAG / basis:** 4.1.2; APG only (disclosure / expandable sections).
- **Severity:** **P1**
- **Scope:** **Component default** when `nestedBody` is used.
- **Repro:** `Listbox.Item` with `nestedBody` and `expanded` toggling — `NestedList` only toggles a `div` wrapper; no `aria-expanded`, `aria-controls`, or region `id` linkage on the triggering control.
- **Issue + impact:** Expand/collapse state is not exposed structurally; users of assistive tech cannot tell whether nested content is shown or how it relates to the row.
- **Suggestion:** On the appropriate interactive element (same as expand action), add `aria-expanded` (and optionally `aria-controls` pointing at the nested region’s `id`). Ensure the region is labeled if needed (`aria-labelledby` / `aria-label`).

---

### 5. `tagName="a"` + inner focusable `div` (`tabIndex={0}`) — nested interactive / invalid structure

- **WCAG / basis:** 4.1.2; HTML (interactive content model); 2.1.1 Keyboard (ambiguous focus model).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when `Listbox.Item` uses `tagName="a"` (supported by API).
- **Repro:** `<Listbox.Item tagName="a" href="#">…</Listbox.Item>` — anchor wraps a focusable `div` with its own keyboard handling.
- **Issue + impact:** Nested interactives inside a link are invalid HTML and create confusing keyboard and screen-reader behavior (two focusable targets, unclear default action).
- **Suggestion:** Avoid `a` + inner `tabIndex` pattern; use `button` or a single focusable element, or restructure so the link is the only tab stop and does not wrap a separate widget.

---

### 6. Default `Listbox` is not a listbox widget; `type="option"` does not imply ARIA listbox

- **WCAG / basis:** Best practice / APG only (pattern naming vs behavior).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — callers must pass `role="listbox"` (as `ComboboxList` does) and option roles/names for a real listbox.
- **Issue + impact:** The name “Listbox” and `type="option"` suggest selection semantics, but the base component does not set `role="listbox"` or options by default, so standalone usage can be a plain list with misleading API unless consumers add roles and labeling.
- **Suggestion:** Document required ARIA for selection lists, or have the component set roles when `type="option"` (with a single tab stop / roving tabindex) so defaults match the pattern.

---

### 7. Roving tabindex / single tab stop not implemented; each row is `tabIndex={0}` on the inner div

- **WCAG / basis:** 2.4.3 Focus Order (best practice); APG only (listbox keyboard model).
- **Severity:** **P2**
- **Scope:** **Component default** for non-draggable lists.
- **Issue + impact:** Users tab through every row separately instead of one list widget tab stop with arrow keys inside, which diverges from APG listbox and increases effort for keyboard users.
- **Suggestion:** Implement roving `tabIndex` on options or one `tabIndex={0}` on the list with `aria-activedescendant`.

---

### 8. Keyboard handler on `ListBody` only handles `ArrowUp` / `ArrowDown`

- **WCAG / basis:** APG only (listbox keymap completeness).
- **Severity:** **P2**
- **Scope:** **Component default** for standalone keyboard behavior (`utils.onKeyDown`).
- **Issue + impact:** APG listbox typically includes Home/End (and often typeahead); those keys are unhandled here unless a parent catches bubbled events.
- **Suggestion:** Extend key handling per APG where this component is meant to behave as a listbox; document delegation when a parent owns keys.

---

### 9. Arrow navigation in `utils.ts` assumes DOM shape (`parentNode.nextSibling.firstChild`)

- **WCAG / basis:** 2.1.1 (if structure breaks); Best practice.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — breaks if items are not direct `Listbox.Item` siblings or if extra wrapper nodes change `firstChild`.
- **Issue + impact:** Focus movement between “options” can fail silently if the DOM differs from the expected list item pattern.
- **Suggestion:** Use `data-*` markers, refs, or query `role="option"` / designated row elements instead of fragile sibling walking.

---

### 10. Draggable list: row wrapper from `Draggable` is a generic focusable `div`

- **WCAG / basis:** 4.1.2; APG only (reorderable list).
- **Severity:** **P2**
- **Scope:** **Component default** when `draggable={true}`.
- **Issue + impact:** Focus lands on a `div` with keyboard behavior for reorder but no role/name from Listbox itself (consumers may add `aria-label` on `Listbox`, but the focused row may still lack a clear accessible name for the reorder interaction).
- **Suggestion:** Expose an appropriate role (`application` is rarely ideal) or ensure each row has `aria-label` / `aria-labelledby`; document required labeling for reorder mode.

---

### 11. Drag handle `Icon` has no accessible name when draggable

- **WCAG / basis:** 4.1.2 (if the handle is the only affordance for an action); Best practice.
- **Severity:** **P3** (enhancement — pointer-first affordance; keyboard reorder uses row keys on the wrapper in `Draggable`.)
- **Scope:** **Component default** when `draggable` and icon is visible.
- **Issue + impact:** The drag affordance may be unclear to screen reader users if not named; if treated as decorative only, ensure it is `aria-hidden` and redundancy exists elsewhere.
- **Suggestion:** Add `aria-label` on the handle if it is meaningful, or `aria-hidden` if purely visual with documented SR instructions.

---

### 12. No structural live region for reorder / selection changes

- **WCAG / basis:** 4.1.3 Status Messages (if politeness required); **Non-WCAG** for many static reorder UIs — **P3** enhancement.
- **Scope:** **Component default** for draggable.
- **Suggestion:** If order changes must be announced, add `aria-live` or instructions; otherwise document visual-only feedback.

---

## Summary counts

| Severity | Count |
| -------- | ----- |
| P0       | 2 (rolled: wrong `tablist` role + combobox subtree/focus mismatch; counted as two bullets sharing one root fix) |
| P1       | 3 |
| P2       | 5 |
| P3       | 2 |

**Note:** Findings **1** and **2** share the same primary remediation (fix `ListBody` role/focus alignment with listbox/option or list semantics).

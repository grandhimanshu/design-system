# Structural ARIA audit: Table

**Component:** `Table` (organism) — composition over `Grid`, `Header`, filters, and pagination  
**Audit type:** Static code review against semantic HTML, WAI-ARIA APG (table / grid patterns), and WCAG 2.2 AA structural expectations.  
**Date:** 2025-03-24  

---

## Implementation files

| Path | Role |
|------|------|
| `core/components/organisms/table/Table.tsx` | Main `Table` class component: data/async orchestration, wrapper, wires `Header`, `Grid`, `Pagination` |
| `core/components/organisms/table/index.tsx` | Re-exports |
| `core/components/organisms/table/Header.tsx` | Toolbar: search `Input`, header-area filters (`FilterSelect`), selection labels, bulk actions, `DraggableDropdown` |
| `core/components/organisms/table/FilterSelect.tsx` | Column filter UI built on `Select` |
| `core/components/organisms/table/DraggableDropdown.tsx` | Column visibility / reorder popover |
| `core/components/organisms/table/utils.tsx` | Selection merge helpers (no DOM) |
| `css/src/components/table.module.css` | Table shell layout (referenced from `Table.tsx` / `Header.tsx`) |

**Rendering engine (tabular UI — accessibility-critical):**

| Path | Role |
|------|------|
| `core/components/organisms/grid/Grid.tsx` | Root scroll/sync container for head + body |
| `core/components/organisms/grid/GridHead.tsx` | Header row layout |
| `core/components/organisms/grid/GridBody.tsx` | Body scroll container, virtualization, infinite scroll |
| `core/components/organisms/grid/GridRow.tsx` | Data row wrapper, selection checkbox cell, row click |
| `core/components/organisms/grid/Cell.tsx` | Head/body cells: sort control, filter, column menu, resize, body content |
| `core/components/organisms/grid/GridCell.tsx` | Default cell type renderers |
| `core/components/organisms/grid/GridNestedRow.tsx` | Nested row container |
| `core/components/organisms/grid/VirtualList.tsx` | Row virtualization (when enabled) |
| `css/src/components/grid.module.css` | Grid layout |

**Tests & stories (reference only):** `core/components/organisms/table/__tests__/`, `core/components/organisms/table/__stories__/`, `core/components/organisms/grid/__tests__/`.

---

## Architecture note

`Table` is a **facade**: the visible “table” is implemented entirely by **`Grid`** using generic `<div>` scaffolding, not `<table>` / `<tr>` / `<th>` / `<td>`. Any structural ARIA or semantics issue in `Grid` is therefore **in scope for the Table product surface**, even though files live under `organisms/grid/`.

---

## Severity summary

| Tier | Count | Notes |
|------|-------|--------|
| **P0** | 2 | `type="resource"` rows are click-only; header filter / column-menu icon triggers likely unnamed |
| **P1** | 5 | No table/grid roles or header/cell relationships; sort control state not exposed to AT; nested-row chevron unnamed; `aria-label` not forwarded to inner `Grid`; resize label uses column key not display name |
| **P2** | 4 | Optional `aria-label` on wrapper only; drag-only column reorder; decorative sort icons; virtualization / landmark polish |
| **P3** | 2 | Documentation / APG alignment for complex widget choice (`grid` vs `table`) |

---

## Detailed findings

### 1. `type="resource"` rows rely on a non-focusable `<div>` with `onClick` only

- **WCAG / basis:** 2.1.1 Keyboard (Level A) · 4.1.2 Name, Role, Value (interactive control) · **P0** · **Component default** · **Repro:** Render `Table` with `type="resource"` and `onRowClick` defined. Tab through the document: the row container (`GridRow`) uses a `<div data-test="DesignSystem-Grid-row" … onClick={onClickHandler}>` with no `tabIndex`, no `role`, and no keyboard handler. (`core/components/organisms/grid/GridRow.tsx`, lines 148–156; eslint disabled with `TODO(a11y)`.)
- **Impact:** Keyboard users cannot activate row actions that mouse users get from clicking the row. Assistive technologies do not expose a named actionable control for the row.
- **Suggestion:** Use a focusable, keyboard-activatable pattern per APG (e.g. `role="button"` or `<button>` spanning row semantics is usually wrong — prefer **`role="row"` inside `role="grid"`** with **`gridcell` focus** or an explicit per-row **link/button** in the first cell). At minimum: `tabIndex={0}`, `role="button"` or `role="link"`, `aria-label` derived from row content, and Enter/Space handlers mirroring click.

---

### 2. Icon-only column filter and “more” menu triggers lack guaranteed accessible names

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P0** · **Component default** · **Repro:** Enable column filters in the grid (`showFilters`) and column menu (`showMenu: true`). In `HeaderCell`, `FilterSelect` uses `customTrigger={<Button icon="filter_list" appearance="transparent" />}` with no `aria-label` or `tooltip`. The column menu uses `Dropdown` with `customTrigger: () => <Button icon="more_vert_filled" appearance="transparent" />` — again no visible text, no `aria-label` in this file. (`core/components/organisms/grid/Cell.tsx`, lines 195–211, 223–235.) `Button` only derives `aria-label` from props or from `tooltip` when there are no children (`core/components/atoms/button/Button.tsx`).
- **Impact:** Screen reader users get a generic “button” with no programmatic name for “filter column X” or “column actions”.
- **Suggestion:** Pass `aria-label` (and optionally `tooltip`) on both triggers, e.g. `Filter ${displayName}` and `Column actions, ${displayName}` (i18n-ready strings).

---

### 3. Tabular structure is not exposed: no `<table>` and no `role="table"` / `role="grid"` mapping

- **WCAG / basis:** 1.3.1 Info and Relationships (Level A) · HTML table semantics · APG Table / Grid patterns · **P1** · **Component default** · **Repro:** Inspect the DOM under `Grid`: `GridHead` and `GridBody` render nested `<div>` elements (`Grid-head`, `Grid-row--head`, `Grid-body`, `Grid-row--body`, `Grid-cell`, etc.) with **no** `role="table"`, `role="rowgroup"`, `role="row"`, `role="columnheader"`, `role="cell"`, or `role="grid"` / `role="gridcell"`. (`core/components/organisms/grid/GridHead.tsx`, `GridBody.tsx`, `GridRow.tsx`, `Cell.tsx`.)
- **Impact:** Screen readers that rely on table or grid semantics cannot navigate by row/column, announce headers with cells, or use table reading commands. Relationships between headers and data are only visual.
- **Suggestion:** Either (a) migrate to native `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th scope="col">` / `<td>` where layout allows, or (b) implement a full **ARIA grid or table** subtree with correct roles, `aria-colcount` / `aria-rowcount` if needed, header associations (`columnheader` / `rowheader` / `aria-labelledby`), and keyboard model per APG (grid pattern if focus management is per-cell).

---

### 4. Sortable header control: `role="button"` without sort state in the name or `aria-pressed` / `aria-sort`

- **WCAG / basis:** 4.1.2 Name, Role, Value · APG (sortable column expectation) · **P1** · **Component default** · **Repro:** Column sorting uses a `<div>` with `role="button"`, `tabIndex={0}`, keyboard Enter/Space, and visible text `displayName` plus decorative sort icons. There is no `aria-sort` (would require a columnheader context), no `aria-pressed`, and no `aria-label` that includes current order (asc/desc/unsorted). (`core/components/organisms/grid/Cell.tsx`, lines 157–172, 128–146.)
- **Impact:** Users hear the column name but not the current sort direction as state; behavior is harder to predict when cycling asc/desc/unsorted.
- **Suggestion:** Add concise state to the accessible name, e.g. `aria-label={`${displayName}, sort ${sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}`}` or use native `<th scope="col" aria-sort="ascending|descending|none|other">` if moving to a real table.

---

### 5. Nested row expand/collapse `Icon` is an interactive `<i>` with no `aria-label`

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P1** · **Component default** · **Repro:** With `nestedRows` and `showNestedRowTrigger`, `NestedRowTrigger` renders `Icon` with `onClick` only. `useAccessibilityProps` assigns `role="button"` and `tabIndex={0}` when `onClick` is set, but **does not** supply a default name (`core/components/atoms/icon/Icon.tsx` + `core/accessibility/utils/useAccessibilityProps.ts`). (`core/components/organisms/grid/Cell.tsx`, lines 289–304.)
- **Impact:** Focusable control with no programmatic name; screen readers announce an unnamed button.
- **Suggestion:** Pass `aria-label` (and optionally `aria-expanded` synchronized with row state) on the trigger, e.g. “Expand nested row” / “Collapse nested row”.

---

### 6. `Table` sets `aria-label` / `aria-labelledby` on the outer wrapper but does not pass them to `Grid`

- **WCAG / basis:** Best practice (consistent naming of the data region) · **P1** · **Component default** · **Repro:** `Table.render` applies `aria-label` / `aria-labelledby` to the outer `div` (`core/components/organisms/table/Table.tsx`, lines 1162–1168). The child `Grid` supports the same props (`core/components/organisms/grid/Grid.tsx`, lines 407–411, 705–706) but `Table` does not forward them, so the inner `Grid` root `<div>` remains **unnamed** while the outer wrapper is named.
- **Impact:** Minor: assistive technologies still see one named ancestor, but tooling or future refactors may treat `Grid` as the data root; duplicated or missing naming can confuse region navigation. If the outer label is intended for the whole widget (toolbar + grid), document that; otherwise the grid subtree should carry the name.
- **Suggestion:** Forward `aria-label` / `aria-labelledby` to `Grid`, or use a single wrapper strategy (`aria-labelledby` pointing at a visible caption/title).

---

### 7. Column resize grip: accessible name uses schema `name` (data key), not `displayName`

- **WCAG / basis:** 4.1.2 Name, Role, Value (quality of name) · **P1** · **Component default** · **Repro:** Resizable columns render `<span role="button" tabIndex={0} aria-label={\`Resize ${name} column\`} />` where `name` is the column key. (`core/components/organisms/grid/Cell.tsx`, lines 240–257.)
- **Impact:** Users hear internal keys (e.g. `user_id`) instead of human column titles.
- **Suggestion:** Use `schema.displayName` in the label, e.g. `Resize ${displayName} column`.

---

### 8. Default usage: no required accessible name for the table widget

- **WCAG / basis:** 4.1.2 / Best practice (large composite widgets) · **P2** · **Consumer-dependent** · **Repro:** `Table` documents optional `aria-label` / `aria-labelledby` on `SharedTableProps` but `defaultProps` does not set them (`core/components/organisms/table/Table.tsx`, lines 178–186, 527–556). Consumers who omit them get an unnamed outer `<div>` wrapping toolbar + grid + pagination.
- **Impact:** On pages with multiple tables or grids, screen reader users cannot distinguish regions by name.
- **Suggestion:** Recommend in docs/stories that consumers always set `aria-label` or `aria-labelledby`, or provide a default only if a safe generic string is acceptable (often it is not — prefer required prop or caption slot).

---

### 9. Header column reorder: drag-only `<div draggable>` rows in `DraggableDropdown`

- **WCAG / basis:** 2.1.1 Keyboard · 2.5.7 Dragging Movements (AA, where drag is essential) · **P2** · **Component default** · **Repro:** `DraggableDropdown` list items use `draggable={true}` with mouse drag handlers; no keyboard alternative to reorder. (`core/components/organisms/table/DraggableDropdown.tsx`, lines 91–117.)
- **Impact:** Keyboard-only users cannot reorder columns via this UI path (visibility toggles remain available via checkboxes).
- **Suggestion:** Provide arrow-button reorder, or an alternative non-drag flow per APG.

---

### 10. Sort direction icons in the header are likely announced as content noise

- **WCAG / basis:** 1.1.1 Non-text Content (decorative) · **P2** · **Component default** · **Repro:** `renderLabel` includes `Icon` elements for sort arrows without `aria-hidden` (`core/components/organisms/grid/Cell.tsx`, lines 133–144).
- **Impact:** Some AT may vocalize icon fonts or redundant glyphs in addition to text.
- **Suggestion:** Mark decorative icons `aria-hidden="true"` when sort state is exposed in text or `aria-label`.

---

### 11. Row virtualization (`VirtualList`) and table semantics

- **WCAG / basis:** APG / Best practice (grid virtualization) · **P2** · **Component default** · **Repro:** When `enableRowVirtualization` is true, `GridBody` renders `VirtualList` (`core/components/organisms/grid/GridBody.tsx`, lines 198–211). Combined with lack of ARIA table/grid roles, screen reader users lose any implicit row continuity.
- **Impact:** Even after adding roles, virtualized lists often need `aria-rowindex` / `aria-rowcount` and careful focus management.
- **Suggestion:** When implementing `role="grid"`, follow APG grid + virtualization guidance and test with NVDA/JAWS/VoiceOver.

---

### 12. Toolbar `Header` is a flat `<div>` region (no landmark)

- **WCAG / basis:** Best practice (landmarks) · **P2** · **Component default** · **Repro:** `Header` root is `<div className={gridStyles['Header']}>` with no `role="region"` or named landmark (`core/components/organisms/table/Header.tsx`, line 258).
- **Impact:** Users browsing by landmarks may not identify “table toolbar” separately from page navigation.
- **Suggestion:** Optional `role="region"` + `aria-label` for the toolbar, or ensure `aria-labelledby` ties to a visible heading.

---

### 13. Checkbox column: wrapper `<div>` stops propagation only; verify row/checkbox labeling

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P3** · **Component default** · **Repro:** Row checkbox sits in a `<div … onClick={(e) => e.stopPropagation()}>` wrapping `Checkbox` (`core/components/organisms/grid/GridRow.tsx`, lines 81–95). Header checkbox similarly in a div (`core/components/organisms/grid/GridHead.tsx`, lines 48–53).
- **Impact:** Depends on `Checkbox` implementation: if inputs lack associated labels, selection purpose may be unclear. (Not fully traced in this audit.)
- **Suggestion:** Ensure each row checkbox has `aria-label` including row identifier, or use a visible/visually hidden label pattern.

---

### 14. Choice of APG pattern: data table vs grid vs treegrid

- **WCAG / basis:** APG only (pattern selection) · **P3** · **Design** · **Repro:** Component supports sorting, filtering, selection, nested rows, and optional row activation — overlapping multiple APG patterns.
- **Impact:** Without an explicit pattern, keyboard and AT behavior may be inconsistent across products.
- **Suggestion:** Document whether Table aims to be a **read-only table**, **editable grid**, or **hybrid**, and implement the matching APG keyboard model consistently.

---

## Positive observations

- **Outer `Table` wrapper** allows `aria-label` / `aria-labelledby` for naming the composite widget (`Table.tsx`).
- **Sort toggle** implements keyboard activation (Enter/Space) on the header control when sortable (`Cell.tsx` `HeaderCell`).
- **Column resize** exposes `role="button"`, `tabIndex={0}`, keyboard activation, and an `aria-label` (content should use display name — see finding 7).
- **Selection summary** in `Header` uses `Label` for visible status text, which helps sighted users; pair with live-region or programmatic naming if counts change dynamically without moving focus.
- **Default error UI** uses `EmptyState` with title/description (`Table.tsx` `defaultErrorTemplate`) — reasonable static messaging (dynamic errors may still need `role="alert"` where appropriate).

---

## Files not modified

This document is audit-only; no source changes were made.

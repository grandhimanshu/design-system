# Structural ARIA audit: layout primitives & data Grid

**Scope:** `Flex`, `Row`, `Column` (layout atoms), `MdsGrid` / `MdsGrid.GridItem` (CSS grid layout), and the **`Grid` organism** (data grid built on `<div>` scaffolding — distinct from `MdsGrid`).  
**Audit type:** Static code review against semantic HTML, WAI-ARIA APG (grid/table vs. generic containers), and WCAG 2.2 AA structural expectations.  
**Date:** 2026-03-24  

---

## Implementation files

### Flex

| Path | Role |
|------|------|
| `core/components/atoms/flex/Flex.tsx` | `Flex` implementation: `<div>` + flex CSS (inline + module classes) |
| `core/components/atoms/flex/index.tsx` | Re-exports |

**Tests / stories (reference):** `core/components/atoms/flex/__tests__/Flex.test.tsx`, `core/components/css-utilities/Flex/Flex.story.tsx`  

### Row

| Path | Role |
|------|------|
| `core/components/atoms/row/Row.tsx` | `Row` implementation: `<div>` + `column.module.css` (`Row` class) |
| `core/components/atoms/row/index.tsx` | Re-exports |

**Tests (reference):** `core/components/atoms/row/__tests__/Row.test.tsx`  

### Column

| Path | Role |
|------|------|
| `core/components/atoms/column/Column.tsx` | `Column` implementation: responsive column-width `<div>` (12-col system) |
| `core/components/atoms/column/index.tsx` | Re-exports |

**Tests (reference):** `core/components/atoms/column/__tests__/Column.test.tsx`  

### MdsGrid (layout — CSS Grid)

| Path | Role |
|------|------|
| `core/components/atoms/mdsGrid/MdsGrid.tsx` | Container: `display: grid` via styles + inline `gridTemplateColumns` / `Rows` |
| `core/components/atoms/mdsGrid/GridItem.tsx` | Child cell wrapper: span/start utilities |
| `core/components/atoms/mdsGrid/index.tsx` | Re-exports |

**Tests (reference):** `core/components/atoms/mdsGrid/__tests__/MdsGrid.test.tsx`, `GridItem.test.tsx`  
**Styles:** `css/src/components/mdsGrid.module.css` (referenced from TSX)  

### Grid (organism — tabular UI)

| Path | Role |
|------|------|
| `core/components/organisms/grid/Grid.tsx` | Root shell: scroll sync, `GridProvider`, `aria-label` / `aria-labelledby` |
| `core/components/organisms/grid/GridHead.tsx` | Header row regions (pinned / unpinned) |
| `core/components/organisms/grid/GridBody.tsx` | Body scroll, virtualization, infinite scroll |
| `core/components/organisms/grid/GridRow.tsx` | Data row, checkbox cell, `onRowClick` for `type="resource"` |
| `core/components/organisms/grid/Cell.tsx` | Head/body cell: sort, filter, menu, resize, drag-reorder, `GridCell` |
| `core/components/organisms/grid/GridCell.tsx` | Default cell type renderers |
| `core/components/organisms/grid/GridNestedRow.tsx` | Nested row content |
| `core/components/organisms/grid/VirtualList.tsx` | Virtualized body |
| `core/components/organisms/grid/index.tsx` | Re-exports |
| Supporting: `GridContext.tsx`, `utility.tsx`, `defaultProps.tsx`, `columnUtility.tsx`, `rowUtility.tsx` | Non-DOM or helpers |

**Styles:** `css/src/components/grid.module.css`  

**Related product surface:** `Table` composes this `Grid`; deeper Table-level findings live in `aria-audits/raw-reports/table-audit.md` where they overlap.

---

## Naming disambiguation

| Name | What it is | ARIA “grid” role? |
|------|------------|-------------------|
| **`MdsGrid`** | Layout primitive; CSS Grid on a `<div>` | **No** — and **must not** use `role="grid"` unless implementing the APG *data grid* keyboard model. Layout-only is correct without that role. |
| **`Grid` (organism)** | Data table–like UI (rows/columns of data) | **Does not** currently expose `role="grid"` / table semantics; see findings below. |

---

## Severity summary (this report)

| Tier | Count | Components touched |
|------|-------|--------------------|
| **P0** | 2 | `Grid` / `GridRow` / `Cell` (row click; icon triggers — shared with table surface) |
| **P1** | 4 | `Grid` (no tabular semantics; header sort state; root props not forwarded; nested row control) |
| **P2** | 3 | `Flex` / `Row` / `Column` / `MdsGrid` (consumer guidance); `Grid` (optional labelling, drag-only reorder) |
| **P3** | 2 | Documentation / APG choice (`grid` vs `table` vs native `<table>`) |

Layout-only components (`Flex`, `Row`, `Column`, `MdsGrid`, `GridItem`) introduce **no P0/P1** by default: they render generic `<div>` elements and forward `BaseHtmlProps` (where applicable), which is appropriate for non-semantically-loaded wrappers.

---

## Detailed findings

### A. Flex

- **WCAG / basis:** HTML (generic grouping) · Best practice (don’t misuse landmarks/widgets) · **P3** · **Component default**  
  **Issue:** `Flex` renders a single `<div>` with `data-test="DesignSystem-Flex"` and spreads `...rest` from `FlexProps` (`BaseHtmlProps<HTMLDivElement>`), so consumers **can** add `role`, `aria-*`, `id`, etc.  
  **Impact:** None inherent; misuse (e.g. `role="grid"` without grid behavior) is consumer error.  
  **Suggestion:** In docs, state that `Flex` is a **presentational** wrapper; prefer native semantics on children (`<nav>`, `<main>`, `<ul>`/`li`, real buttons).

- **WCAG / basis:** Best practice · **P2** · **Consumer-dependent**  
  **Issue:** Responsive props only apply the **`xs`** breakpoint slice in `buildResponsiveStyles` (see `Flex.tsx` — object branch sets `value.xs` only). Not an ARIA bug, but layout can diverge from expectations across breakpoints.  
  **Impact:** Visual reading order vs. DOM order could confuse if breakpoints reorder content elsewhere — indirect a11y concern.  
  **Suggestion:** If full responsive maps are intended, align implementation with design; ensure DOM order matches meaningful reading order (WCAG 1.3.2).

---

### B. Row

- **WCAG / basis:** HTML · **P3** · **Component default**  
  **Issue:** `Row` is a `<div>` with `ref` and `...rest` (`BaseHtmlProps<HTMLDivElement>`). No semantic “row” relationship to a table or grid.  
  **Impact:** None for layout; the name **Row** is a layout metaphor only (not `<tr>`).  
  **Suggestion:** Avoid using `Row`/`Column` inside structures that should be announced as tables unless consumers add correct roles or use `Table`/native `<table>`.

- **WCAG / basis:** Best practice · **P2** · **Consumer-dependent**  
  **Issue:** Styles come from `column.module.css` (shared with `Column`). No accessibility issue alone; worth knowing for maintenance.

---

### C. Column

- **WCAG / basis:** HTML · **P3** · **Component default**  
  **Issue:** `Column` is a `<div>` with width classes (`Col--*`). Not a `<col>` element and not `role="columnheader"`.  
  **Impact:** Correct for page layout; misleading only if authors expect table semantics from the name.  
  **Suggestion:** Same as `Row`: use real table/grid patterns for tabular data.

- **WCAG / basis:** Best practice · **P2** · **Component default**  
  **Issue:** Forwards `BaseHtmlProps` — good for `aria-*` on the wrapper when needed (e.g. `role="group"` with `aria-label` for a related set of widgets).

---

### D. MdsGrid & GridItem

- **WCAG / basis:** ARIA APG (Grid pattern — *interactive* grid) · **P3** · **Component default**  
  **Issue:** **Do not** conflate CSS `display: grid` with `role="grid"`. `MdsGrid` correctly uses a plain `<div>` with grid layout and passes `...rest` (`BaseHtmlProps<HTMLDivElement>`).  
  **Impact:** None; adding `role="grid"` without required keyboard model would be a **regression**.  
  **Suggestion:** Document explicitly: “layout grid, not ARIA grid.”

- **WCAG / basis:** HTML · **P2** · **Component default**  
  **Issue:** `GridItem` is a `<div>` with `...rest`. Fine for layout; if a cell contains only interactive content, children must supply names/roles.  
  **Suggestion:** None required on the primitive.

- **WCAG / basis:** Best practice · **P2** · **Component default** (same pattern as `Flex`)  
  **Issue:** Responsive object props only use **`xs`** in `buildResponsiveStyles` in `MdsGrid.tsx`.  
  **Suggestion:** Same as Flex if multi-breakpoint support is required.

---

### E. Grid (organism)

#### E1. `type="resource"` row activation: click-only `<div>`

- **WCAG / basis:** 2.1.1 Keyboard · 4.1.2 Name, Role, Value · **P0** · **Component default** · **Repro:** Use `type="resource"` with `onRowClick`. The row surface is  
  `<div data-test="DesignSystem-Grid-row" className={rowClasses} onClick={onClickHandler}>`  
  with **no** `tabIndex`, **no** keyboard handler, and **no** exposed role/name (`GridRow.tsx`, with eslint disabled and `TODO(a11y)`).  
- **Impact:** Keyboard and many AT users cannot trigger the same action as mouse click on the row.  
- **Suggestion:** APG-aligned pattern: expose a **focusable** control per row or implement a full **`role="grid"`** with roving tabindex and `gridcell` focus; at minimum add keyboard parity and an accessible name (often from primary cell text).

#### E2. Icon-only filter and column-menu triggers (HeaderCell)

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P0** · **Component default** · **Repro:** `showFilters` / `showMenu` with `FilterSelect` `customTrigger={<Button icon="filter_list" … />}` and `Dropdown` `customTrigger` with `Button icon="more_vert_filled"` without guaranteed `aria-label` in `Cell.tsx`.  
- **Impact:** Unnamed buttons in the column header for screen readers.  
- **Suggestion:** Pass `aria-label` / `tooltip` including `displayName` (i18n-ready), e.g. “Filter {displayName}”, “Column actions, {displayName}”.

#### E3. No exposed tabular structure (`<table>` or ARIA table/grid)

- **WCAG / basis:** 1.3.1 Info and Relationships · HTML table semantics · APG Table/Grid · **P1** · **Component default** · **Repro:** DOM under `GridHead` / `GridBody` / `GridRow` / `Cell` uses nested `<div>`s only — no `role="table"`, `role="row"`, `role="columnheader"`, `role="cell"`, or `role="grid"` / `gridcell`.  
- **Impact:** Table/grid navigation commands and header–cell associations are unavailable in most screen readers.  
- **Suggestion:** Native `<table>` where feasible, or complete ARIA table/grid subtree + keyboard model per APG.

#### E4. Sortable header control: `role="button"` without sort state exposure

- **WCAG / basis:** 4.1.2 Name, Role, Value · APG (sort indicators) · **P1** · **Component default** · **Repro:** `HeaderCell` uses `role="button"`, `tabIndex={0}`, Enter/Space for `handleSortToggle`, but **no** `aria-sort` (or equivalent) tied to `sortingList` / `sorted` state on a columnheader role. Icons convey sort visually only.  
- **Impact:** Assistive technologies may not announce current sort direction or that the control sorts.  
- **Suggestion:** If moving to `role="columnheader"`, set `aria-sort="ascending" | "descending" | "none"` as appropriate; ensure accessible name includes column title.

#### E5. Root `Grid` container does not forward arbitrary HTML / ARIA props

- **WCAG / basis:** 4.1.2 (programmatic relationships) · Best practice · **P1** · **Component default** · **Repro:** `GridProps` extends `BaseProps` only. Render uses `extractBaseProps` → only `className` and `data-test`. Explicit props: `aria-label`, `aria-labelledby`. **No** `...rest` for `id`, `aria-describedby`, `role`, etc. (`Grid.tsx`, `core/utils/types.tsx` `extractBaseProps`).  
- **Impact:** Consumers cannot attach `id` for `aria-labelledby` from outside, or pass `aria-describedby` / custom `role` without changing the component.  
- **Suggestion:** Extend with `BaseHtmlProps` on the root (minus conflicting props) or document and add targeted props (`id`, `aria-describedby`, …).

#### E6. Nested row expand: `Icon` with `onClick` only

- **WCAG / basis:** 2.1.1 Keyboard · 4.1.2 · **P1** · **Component default** · **Repro:** `NestedRowTrigger` in `Cell.tsx` uses `<Icon … onClick={…} />` without `tabIndex`, `onKeyDown`, or `aria-expanded` / `aria-controls`.  
- **Impact:** Expand/collapse may be mouse-only and unnamed.  
- **Suggestion:** Use `Button` (icon-only with `aria-label`) or add keyboard handlers + `aria-expanded` linked to the nested region id.

#### E7. Checkbox cell wrapper `div` with `stopPropagation`

- **WCAG / basis:** Best practice · **P2** · **Component default**  
  **Issue:** Wrapper is a `<div>` (`GridRow.tsx`); the real control is `Checkbox`. Row `onClick` is blocked from toggling when clicking the checkbox area — good — but the wrapper is not interactive.  
  **Impact:** Low if `Checkbox` is fully labeled; verify `Checkbox` has visible or programmatic label for “select row”.  
  **Suggestion:** Ensure row selection checkbox exposes name including row identifier (often consumer/data concern).

#### E8. Column resize: `role="button"` with `aria-label` using column **key** (`name`)

- **WCAG / basis:** 4.1.2 · **P2** · **Component default** · **Repro:** `aria-label={\`Resize ${name} column\`}` uses schema `name`, not `displayName`.  
- **Impact:** Internal keys may be cryptic in speech.  
- **Suggestion:** Prefer `displayName` in the label.

#### E9. Draggable column reorder on header cell `<div>`

- **WCAG / basis:** 2.1.1 Keyboard · 2.5.7 Dragging Movements (AA, where applicable) · **P2** · **Component default**  
  **Issue:** `draggable` and drag events on the header cell container (`Cell.tsx`) with no documented keyboard alternative for reorder.  
- **Impact:** Reordering may be pointer-only.  
- **Suggestion:** Provide keyboard reorder (e.g. move left/right actions) or an alternate UI already present elsewhere.

#### E10. Optional `aria-label` / `aria-labelledby` on outer wrapper

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P2** · **Consumer-dependent**  
  **Issue:** Props exist (`Grid.tsx`) but are optional; unnamed grid region when omitted. Story example uses `aria-label` in `__stories__/index.story.jsx`.  
- **Suggestion:** Recommend or require a name when the grid is a primary landmark; document for `Table` consumers.

---

## Deduped themes

1. **`Grid` organism vs. layout `MdsGrid`:** One is data-dense UI needing table/grid semantics and keyboard support; the other is CSS layout — fixes must not blur the two patterns.  
2. **Click-only / icon-only surfaces:** `GridRow` row click, nested chevron, and header icon buttons share the theme “interactive but not fully exposed to keyboard/AT.”  
3. **Div-based table:** Header, body, row, and cell structure duplicate visual tables without programmatic relationships — single architectural fix (native table or ARIA grid) addresses many P1s together.  
4. **Pass-through HTML props:** `Flex`, `Row`, `Column`, `MdsGrid`, `GridItem` use `BaseHtmlProps`; **`Grid` root does not** — inconsistent extensibility for ARIA on the shell.

---

## Prioritized backlog (effort vs. impact)

1. **`Grid` / `GridRow` / `Cell`:** P0 row click keyboard + named header icon triggers; P1 tabular semantics + sort state + nested expand control + root prop forwarding.  
2. **`MdsGrid` / `Flex`:** P2 responsive breakpoint completeness (if spec requires); P3 documentation (“not ARIA grid”).  
3. **`Row` / `Column`:** P3 naming/docs clarity vs. HTML table columns/rows.

---

## Code references (anchors)

```269:272:core/components/atoms/flex/Flex.tsx
  return (
    <div data-test="DesignSystem-Flex" {...rest} className={classes} style={mergedStyles}>
      {children}
    </div>
```

```18:21:core/components/atoms/row/Row.tsx
  return (
    <div data-test="DesignSystem-Row" ref={ref} {...rest} className={classes}>
      {children}
    </div>
```

```76:79:core/components/atoms/column/Column.tsx
  return (
    <div ref={ref} data-test="DesignSystem-Column" {...rest} className={classes}>
      {children}
    </div>
```

```222:226:core/components/atoms/mdsGrid/MdsGrid.tsx
  return (
    <div data-test="DesignSystem-MdsGrid" {...rest} className={classes} style={mergedStyles}>
      {children}
    </div>
  );
```

```700:710:core/components/organisms/grid/Grid.tsx
    return (
      <div
        data-test="DesignSystem-Grid"
        {...baseProps}
        className={classes}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        ref={(el) => {
          this.gridRef = el;
        }}
      >
```

```148:156:core/components/organisms/grid/GridRow.tsx
  return (
    <div className={wrapperClasses} data-test="DesignSystem-Grid-rowWrapper">
      {/* TODO(a11y)  */}
      {/* eslint-disable-next-line */}
      <div data-test="DesignSystem-Grid-row" className={rowClasses} onClick={onClickHandler} ref={rowRef}>
```

```157:172:core/components/organisms/grid/Cell.tsx
  return (
    <div key={name} className={classes} ref={el}>
      <div
        className={styles['Grid-cellContent']}
        data-test="DesignSystem-Grid-cellContent"
        onClick={handleSortToggle}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          if (!isSortable) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSortToggle();
          }
        }}
        role={isSortable ? 'button' : undefined}
        tabIndex={isSortable ? 0 : -1}
        aria-disabled={!isSortable || undefined}
      >
```

---

*End of report.*

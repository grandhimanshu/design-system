# Structural ARIA audit: List, KeyValuePair, MetaList

**Components:** `List` (organism), `KeyValuePair` (molecule), `MetaList` (atom)  
**Audit type:** Static code review against semantic HTML, WAI-ARIA APG (list / description list / grid-table patterns), and WCAG 2.2 AA structural expectations.  
**Date:** 2025-03-24  

---

## Implementation files

### List

| Path | Role |
|------|------|
| `core/components/organisms/list/List.tsx` | Thin wrapper: renders `Table` with `showHead={false}`, `filterPosition="HEADER"` |
| `core/components/organisms/list/index.tsx` | Re-exports |
| `core/components/organisms/list/__stories__/` | Stories (reference) |

**Delegated implementation (inherited by `List` in full):**

| Path | Role |
|------|------|
| `core/components/organisms/table/Table.tsx` | Shell: `aria-label` / `aria-labelledby` on outer wrapper; composes `Header`, `Grid`, `Pagination` |
| `core/components/organisms/grid/Grid.tsx` | Root grid container (`<div>`): optional `aria-label` / `aria-labelledby`; omits `GridHead` when `showHead` is false |
| `core/components/organisms/grid/GridHead.tsx` | Header row (not rendered for `List`) |
| `core/components/organisms/grid/GridBody.tsx` | Body scroll / rows |
| `core/components/organisms/grid/GridRow.tsx` | Row container |
| `core/components/organisms/grid/Cell.tsx` | Head/body cells (sort, filter, menus — mostly irrelevant when head hidden, but schema-driven cells remain) |
| `css/src/components/table.module.css`, `css/src/components/grid.module.css` | Layout |

For deeper Table/Grid-only findings, see `aria-audits/raw-reports/table-audit.md`. This section focuses on **what changes** when using **`List`** specifically.

### KeyValuePair

| Path | Role |
|------|------|
| `core/components/molecules/keyValuePair/KeyValuePair.tsx` | Root `<dl>` wrapper |
| `core/components/molecules/keyValuePair/KeyElement.tsx` | Term: `<dt>` with optional `Icon` + `Text` |
| `core/components/molecules/keyValuePair/ValueElement.tsx` | Definition: `<dd>` with optional `Text` |
| `core/components/molecules/keyValuePair/index.tsx` | Re-exports |
| `core/components/molecules/keyValuePair/__tests__/`, `__stories__/` | Tests & stories (reference) |

### MetaList

| Path | Role |
|------|------|
| `core/components/atoms/metaList/MetaList.tsx` | Container `<div>`, maps `list` to item `span`s + separator `Icon`s |
| `core/components/atoms/metaList/Meta.tsx` | Single item: `<span>` wrapping optional `Icon` + `Text` |
| `core/components/atoms/metaList/index.tsx` | Re-exports |
| `css/src/components/metaList.module.css` | Layout |
| `core/components/atoms/metaList/__tests__/`, `figma/MetaList.figma.tsx` | Tests / Figma (reference) |

---

## Architecture notes

1. **`List` is not a separate renderer.** It is **`Table` with `showHead={false}`** (and `filterPosition="HEADER"`). All DOM, ARIA, and keyboard behavior come from **Table → Grid**. Any fix for grid semantics or row interactivity belongs in **Grid/Table**, not in `List.tsx`.

2. **`List` is deprecated** in source JSDoc in favor of **Listbox** (`https://mds.innovaccer.com/.../listbox...`). That is documentation/product guidance, not an WCAG pass/fail by itself, but it affects prioritization of remediation effort.

3. **`KeyValuePair`** correctly chooses **native description list elements** (`<dl>`, `<dt>`, `<dd>`), which is the right semantic family for term/description pairs per HTML and WCAG **1.3.1** when used as intended.

4. **`MetaList`** is a **horizontal metadata strip** implemented as **`<div>` + `<span>`** with **Material icon font** separators. It does not expose a **list** role or **listitem** structure, so assistive technologies treat it as a flat sequence of generic elements unless users add roles themselves (types do not encourage that).

---

## Combined severity summary

| Tier | Count | Scope |
|------|-------|--------|
| **P0** | 1 | Inherited from Table/Grid when `List` is used with `type="resource"` and `onRowClick` (keyboard row activation) — same as Table audit |
| **P1** | 4 | Div-based Grid with no table/grid ARIA; `List` forces **no header row** (`showHead={false}`), weakening column relationships; `aria-label` on Table wrapper **not** forwarded to inner `Grid` (Table audit); MetaList separator **icons** likely announced without `aria-hidden` |
| **P2** | 5 | Optional accessible name on Table/Grid; KeyValuePair / Key / Value prop surfaces omit most HTML global ARIA attributes in TypeScript; invalid `<dl>` children if consumers break composition; MetaList not structured as list; decorative meta icons rely on Icon defaults |
| **P3** | 3 | Deprecation toward Listbox; APG choice grid vs table for data presentation; typo `seperator` in public API (`MetaList`) |

*Counts dedupe themes shared with `table-audit.md` where they apply identically to `List`.*

---

## Detailed findings

### List

#### L1. `List` adds no accessibility behavior beyond `Table` configuration

- **WCAG / basis:** N/A (implementation detail) · **P3** · **Component default** · **Repro:** Read `List.tsx`: it only passes `showHead={false}` and `filterPosition={'HEADER'}` into `Table`.  
- **Impact:** Audits and fixes must target **Table/Grid**. Consumers who only search for “List” may miss that dependency.  
- **Suggestion:** Cross-link docs and this audit to `Table`/`Grid` and `table-audit.md`; migrate new work to **Listbox** per component JSDoc.

#### L2. Header row is suppressed: no visible/programmatic column header row in the grid chrome

- **WCAG / basis:** 1.3.1 Info and Relationships · HTML / APG table & grid header association · **P1** · **Component default** · **Repro:** `List` sets `showHead={false}`, so `Grid` does not render `GridHead` (`core/components/organisms/grid/Grid.tsx`, conditional around `showHead && <GridHead … />`). Column **labels** exist only in schema-driven behavior (filters, etc.) and cell content—not as a dedicated `columnheader` row.  
- **Impact:** Compared to `Table` with `showHead: true`, screen reader users lose a clear **header row** for column identification and table/grid navigation commands that depend on header/cell relationships.  
- **Suggestion:** If the product must stay div-based, expose column headers via **ARIA** (e.g. first row with `columnheader` / `gridcell` pattern, or `aria-labelledby` on cells) or reconsider **native `<table>`** for this variant. Align with APG **Grid** or **Table** pattern explicitly.

#### L3. Same div-based Grid as `Table`: no `role="table"` / `role="grid"` mapping

- **WCAG / basis:** 1.3.1 · APG · **P1** · **Component default** · **Repro:** Inherited from `Grid` (see `aria-audits/raw-reports/table-audit.md`, finding §3). `List` does not mitigate this.  
- **Impact:** Row/column navigation and header association are not available through table/grid semantics.  
- **Suggestion:** Central fix in `Grid`; `List` consumers benefit automatically.

#### L4. `type="resource"` + `onRowClick` keyboard gap (inherited)

- **WCAG / basis:** 2.1.1 Keyboard · 4.1.2 · **P0** · **Component default** (when configured) · **Repro:** Same as Table audit: row interaction on a non-focusable `<div>` in `GridRow`.  
- **Impact:** Mouse-only row activation for resource-style lists.  
- **Suggestion:** Fix in `GridRow` / Table configuration; document required props for accessible row actions.

#### L5. `aria-label` / `aria-labelledby` on Table wrapper, not forwarded to `Grid`

- **WCAG / basis:** 4.1.2 Name, Role, Value (naming the grid region) · **P1** · **Component default** · **Repro:** `Table.tsx` sets `aria-label` / `aria-labelledby` on `DesignSystem-Table-wrapper` but does not pass them to `<Grid>` (`core/components/organisms/table/Table.tsx`, render return). `Grid` supports the same attributes on its root (`core/components/organisms/grid/Grid.tsx`).  
- **Impact:** The **named region** may be the outer wrapper while the scrollable/interactive **grid subtree** is unnamed in the accessibility tree, depending on browser/AT heuristics.  
- **Suggestion:** Forward `aria-label` / `aria-labelledby` (and avoid duplicate redundant naming if it creates noise—test with NVDA/VoiceOver).

---

### KeyValuePair

#### K1. Native description list semantics (`<dl>`, `<dt>`, `<dd>`) — positive

- **WCAG / basis:** 1.3.1 · HTML · **Best practice (pass)** · **Component default**  
- **Impact:** When children are composed from `KeyValuePair.Key` (`<dt>`) and `KeyValuePair.Value` (`<dd>`), the structure matches the **description list** model.  
- **Suggestion:** Document that **only** `Key`/`Value` (or other `dt`/`dd` content) should appear inside `KeyValuePair`.

#### K2. Prop types omit most global HTML / ARIA attributes on root and key/value elements

- **WCAG / basis:** 4.1.2 · **P2** · **Component default** · **Repro:** `KeyValuePairProps` extends `BaseProps` only (`className`, `data-test`) plus `children` (`KeyValuePair.tsx`). `KeyElementProps` / `ValueElementProps` extend `BaseProps` and use `extractBaseProps` for `dt`/`dd`, which also only preserves `className` and `data-test` (`core/utils/types.tsx`). There is no `BaseHtmlProps<HTMLDListElement>`-style surface for `id`, `aria-labelledby`, `aria-describedby`, etc.  
- **Impact:** TypeScript-disciplined teams cannot legally pass common accessibility attributes without casts; real-world pages may skip labeling or associations for definition lists.  
- **Suggestion:** Extend props with `BaseHtmlProps` (or targeted `aria-*` / `id`) on `KeyValuePair`, `KeyElement`, and `ValueElement`, and forward them to the respective elements (still stripping conflicting internals).

#### K3. Risk of invalid or non-semantic `<dl>` children (consumer-dependent)

- **WCAG / basis:** 1.3.1 · HTML content model · **P2** · **Consumer-dependent** · **Repro:** If a consumer places arbitrary nodes inside `<dl>` (e.g. raw `<div>` or unwrapped text), the document becomes **invalid HTML** and AT may not map the list correctly.  
- **Impact:** Unpredictable screen reader behavior for “list of properties” UIs.  
- **Suggestion:** Document patterns; optionally ship a dev-only warning or Storybook guard; consider a stricter composition API.

#### K4. `KeyElement` with icon only and no `label` — name may be missing for the term

- **WCAG / basis:** 1.1.1 Non-text Content (if icon is meaningful) · 4.1.2 · **P2** · **Consumer-dependent** · **Repro:** `KeyElement` renders an `Icon` when `icon` is set but `label` is omitted (`KeyElement.tsx`). Unless `iconOptions` supplies an accessible name, the **term** may be silent or poorly named in AT.  
- **Impact:** Icon-only keys can be meaningless or duplicated in announcements.  
- **Suggestion:** Require `label` when `icon` is present, or require `iconOptions['aria-label']` / visible text; document in Storybook.

#### K5. Full `{...props}` spread on `<dl>` after explicit attributes

- **WCAG / basis:** HTML / React · **P3** · **Component default** · **Repro:** `<dl data-test="…" {...props} className={pairClassNames}>` (`KeyValuePair.tsx`). Typed props are small, so risk is low today, but future widening could pass through invalid attributes.  
- **Impact:** Minor maintainability / future foot-gun; explicit `className` override is correct.  
- **Suggestion:** Destructure known keys and spread only safe rest, once props are expanded.

---

### MetaList

#### M1. No list semantics: generic `<div>` container and `<span>` items

- **WCAG / basis:** 1.3.1 · APG list pattern · **P2** · **Component default** · **Repro:** `MetaList` renders `<div data-test="DesignSystem-MetaList">` and each entry is `<span className={…MetaList-item}>` (`MetaList.tsx`). There is no `<ul>`/`<ol>`/`<li>`, no `role="list"`, no `role="listitem"`.  
- **Impact:** Assistive technologies do not announce “list, N items” or provide list navigation affordances; content is a flat run of text and icons.  
- **Suggestion:** If the UX is a list of metadata chips, use **`role="list"`** on the container and **`role="listitem"`** on each item (or native list elements if styling allows). Ensure separators are not counted as items.

#### M2. Separator `Icon` components are decorative but omit `aria-hidden`

- **WCAG / basis:** 1.1.1 · **P1** · **Component default** · **Repro:** Left and right separators use `<Icon name="fiber_manual_record" size={8} … />` with no `aria-hidden` (`MetaList.tsx`). `Icon` uses `useAccessibilityProps` which only adds `aria-hidden` when supplied (`core/accessibility/utils/useAccessibilityProps.ts`); default is absent. The glyph is presented via an `<i>` with icon font text (`Icon.tsx`).  
- **Impact:** Screen readers may announce **meaningless character/glyph names** or extra noise between each meta item.  
- **Suggestion:** Pass **`aria-hidden={true}`** (or equivalent) on separator icons; hide bullet glyphs from the accessibility tree.

#### M3. Optional leading meta `Icon` in `Meta` may lack accessible name when meaningful

- **WCAG / basis:** 1.1.1 · 4.1.2 · **P2** · **Consumer-dependent** · **Repro:** `Meta` renders `Icon` when `icon` is set (`Meta.tsx`) with no `aria-label` / `aria-hidden`. If the icon **duplicates** the text label, it should be **decorative** (`aria-hidden`). If it **adds** information not in `label`, it needs a **name**.  
- **Impact:** Redundant noise or missing information, depending on usage.  
- **Suggestion:** Default `aria-hidden` on meta icons when `label` is non-empty; expose a prop to mark informational icons with `aria-label`.

#### M4. `MetaList` passes `extractBaseProps` only to the root `<div>`

- **WCAG / basis:** 4.1.2 · **P2** · **Component default** · **Repro:** Same pattern as other atoms: only `className` and `data-test` (`MetaList.tsx`).  
- **Impact:** No typed way to set `aria-label` / `aria-labelledby` on the metadata strip for landmark or region naming.  
- **Suggestion:** Extend `MetaListProps` with `BaseHtmlProps<HTMLDivElement>` or explicit ARIA props and forward to the wrapper.

#### M5. Typo in public prop: `seperator` (and related class names)

- **WCAG / basis:** N/A · **P3** · **Component default**  
- **Impact:** No direct WCAG failure; hurts API clarity and searchability.  
- **Suggestion:** Alias `separator` and deprecate `seperator` (non-breaking migration).

---

## References

- WAI-ARIA APG: [Description List](https://www.w3.org/WAI/ARIA/apg/patterns/description-list/) (pattern guidance; native `<dl>` preferred when sufficient)  
- WAI-ARIA APG: [Grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) / [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) — relevant to `List` via `Grid`  
- Internal: `aria-audits/raw-reports/table-audit.md` for Table/Grid-only structural findings  

---

## Files read (audit trail)

- `core/components/organisms/list/List.tsx`, `index.tsx`  
- `core/components/molecules/keyValuePair/KeyValuePair.tsx`, `KeyElement.tsx`, `ValueElement.tsx`, `index.tsx`  
- `core/components/atoms/metaList/MetaList.tsx`, `Meta.tsx`, `index.tsx`  
- `core/components/organisms/table/Table.tsx` (wrapper + `Grid` wiring)  
- `core/components/organisms/grid/Grid.tsx`, `GridHead.tsx`, `GridBody.tsx` (structural roles check)  
- `core/components/organisms/grid/Cell.tsx` (limited `role` usage)  
- `core/components/atoms/icon/Icon.tsx`  
- `core/accessibility/utils/useAccessibilityProps.ts`  
- `core/utils/types.tsx` (`extractBaseProps`, `BaseProps`)  
- `aria-audits/raw-reports/table-audit.md` (cross-reference)

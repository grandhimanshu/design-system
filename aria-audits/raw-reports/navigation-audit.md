# Navigation — Structural ARIA / Semantic HTML Audit

## Implementation files

| File | Role |
|------|------|
| `core/components/organisms/navigation/Navigation.tsx` | Facade: chooses horizontal vs vertical layout; forwards `menus`, `active`, `onClick`, and `aria-label` to children; wraps output in a non-landmark `<div>`. |
| `core/components/organisms/navigation/VerticalNavigation.tsx` | Vertical layout: `<nav>` with `role="button"` items, expandable submenus, optional footer toggle. |
| `core/components/organisms/navigation/index.tsx` | Re-exports `Navigation` and types. |
| `core/components/organisms/horizontalNav/HorizontalNav.tsx` | Horizontal branch: `<nav>` with native `<a>` / `<button>` / disabled `<span>` (invoked when `Navigation` `type === 'horizontal'`). |

**Shared utilities:** `core/utils/navigationHelper.tsx` — `Menu`, `ActiveMenu`, `getMenu`, `isMenuActive`, etc.

---

## Component overview

- **APG / HTML expectation:** Primary navigation is usually a **named `<nav>` landmark** containing **real links** (`<a href>`) where destinations are URLs, or buttons for in-page actions. Expandable sections should follow **disclosure** semantics (`aria-expanded`, optional `aria-controls`). Icon-only rails need **explicit accessible names** (not raw icon font text alone).
- **Composition:** `Navigation` does not implement item markup itself. **Horizontal** behavior is structurally stronger (native links/buttons, `aria-current` on active items). **Vertical** behavior in `VerticalNavigation.tsx` relies heavily on **`div` + `role="button"`**, omits `menu.link`, and omits submenu/current-route ARIA state—this is where most structural gaps concentrate.
- **Outer wrapper:** `Navigation` applies `extractBaseProps` to the root `<div>` (`core/utils/types.tsx` — only `className` and `data-test` are forwarded). `aria-label` is **not** duplicated on the wrapper; it is passed only to `HorizontalNav` / `VerticalNavigation`, which set `aria-label` on inner `<nav>` (defaults: `'Horizontal Navigation'` in `HorizontalNav`, `'Vertical navigation'` in `VerticalNavigation` `defaultProps`).

---

## Findings

### 1. Footer expand/collapse control has no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value  
- **Severity:** **P0**  
- **Scope:** **Component default** when `footer` is true and `onToggle` is used.  
- **Repro:** Render `VerticalNavigation` / `Navigation` (`type="vertical"`) with `footer` and activate the footer control with a screen reader.  
- **Issue + impact:** The footer renders `Icon` with `onClick` only (`VerticalNavigation.tsx`, footer block). `Icon` uses `useAccessibilityProps` (`core/accessibility/utils/useAccessibilityProps.ts`): with `onClick`, it sets `role="button"` and `tabIndex={0}` and passes `aria-label` from props **only if supplied**. No `aria-label` is passed here, so many AT expose an unnamed button.  
- **Suggestion:** Provide `aria-label` (and ideally text that reflects state, e.g. “Expand sidebar” / “Collapse sidebar”) or use a visible `<button type="button">` with text; add `aria-expanded={expanded}` (see finding 8).

---

### 2. Collapsed vertical rail: empty or icon-only focusable “buttons” lack a reliable human-readable name

- **WCAG / basis:** 4.1.2 Name, Role, Value  
- **Severity:** **P0**  
- **Scope:** **Component default** when `expanded={false}`.  
- **Repro:** `expanded={false}` — labels render only inside `{expanded && (…)}` (`VerticalNavigation.tsx`). Items **without** `icon` render a focusable `role="button"` with **no inner content**. Items **with** `icon` expose only `Icon` content (typically ligature / icon font text), which is often **not** an acceptable substitute for `menu.label`.  
- **Issue + impact:** Keyboard and SR users cannot identify destinations reliably; empty controls are a hard failure.  
- **Suggestion:** Always derive an accessible name from `menu.label` (e.g. `aria-label={menu.label}` on the interactive element, or visually hidden label text). Do not leave `tabIndex={0}` controls with no meaningful name.

---

### 3. Vertical nav ignores `menu.link` — no link semantics or `href`

- **WCAG / basis:** 4.1.2; 2.4.4 Link Purpose (In Context); **HTML** (native link affordances)  
- **Severity:** **P1**  
- **Scope:** **Consumer-dependent** — fails when the same `Menu[]` uses `link` as in horizontal mode (`Navigation` `Menu` type includes `link?: string`).  
- **Repro:** Compare `menus` with `link` set under `type="horizontal"` (native `<a href>` in `HorizontalNav.tsx`) vs `type="vertical"` (only `div` + click handler).  
- **Issue + impact:** No `href`, no link role, no middle-click / open in new tab / copy link / URL in status bar. Behavior and semantics diverge across layouts for the same data model.  
- **Suggestion:** When `menu.link` is set, render `<a href={menu.link}>` (or design-system `Link`); keep `role="button"` only for true expand/collapse actions without a URL.

---

### 4. Submenu parents lack `aria-expanded` and controlled-region wiring

- **WCAG / basis:** 4.1.2 Name, Role, Value; **APG** disclosure pattern  
- **Severity:** **P1**  
- **Scope:** **Component default** for top-level items with `subMenu` while `expanded` is true.  
- **Repro:** Toggle a parent with `subMenu`; inspect the parent node in the accessibility tree.  
- **Issue + impact:** `menuState[menu.name]` drives visibility of children, but the parent has **no `aria-expanded`**, no **`aria-controls`** pointing at a stable id on the submenu container, and the submenu wrapper is a plain `<div>`. AT cannot report expanded/collapsed state or associate trigger with panel.  
- **Suggestion:** On parents with `subMenu?.length`, set `aria-expanded={Boolean(menuState[menu.name])}`; assign `id` to the submenu container and `aria-controls` on the parent.

---

### 5. Active item not exposed in vertical mode (`aria-current` missing)

- **WCAG / basis:** 4.1.2; 1.3.1 Info and Relationships (programmatic “current” location)  
- **Severity:** **P1**  
- **Scope:** **Component default** when `active` is used.  
- **Repro:** Set `active` to match a vertical item or sub-item; compare with `HorizontalNav`, which sets `aria-current={isActive ? 'page' : undefined}` on `<a>` / `<button>`.  
- **Issue + impact:** Visual active styling exists, but SR users are not told which item is current.  
- **Suggestion:** Mirror horizontal behavior: `aria-current="page"` (or appropriate token) on the active item’s interactive element, ensuring a single current page item per nav where applicable.

---

### 6. Prefer native `<button>` / `<a>` over `<div role="button">`

- **WCAG / basis:** 4.1.2; **HTML** / **Best practice**  
- **Severity:** **P2**  
- **Scope:** **Component default** for vertical top-level and submenu rows.  
- **Issue + impact:** Enter/Space are handled (`handleMenuKeyDown` / `handleSubMenuKeyDown`), but native elements reduce custom-widget risk, improve default AT mapping, and simplify disabled handling.  
- **Suggestion:** Refactor to `<button type="button">` or `<a>` per item type; align disabled pattern with `HorizontalNav` (`<span aria-disabled>` vs `disabled` attribute) as a conscious design choice.

---

### 7. Nav item groups not exposed as lists

- **WCAG / basis:** 1.3.1 Info and Relationships  
- **Severity:** **P2** (vertical); **P3** (horizontal, already called out in `horizontalNav-audit.md`)  
- **Scope:** **Component default**  
- **Issue + impact:** Top-level and submenu entries are flat `<div>` siblings (vertical) or flat `<a>`/`<button>`/`<span>` siblings (horizontal). List semantics (`<ul>`/`<li>` or equivalent roles) are absent.  
- **Suggestion:** Use list markup inside `<nav>` (with CSS as needed), consistent with APG examples and the horizontal nav audit.

---

### 8. Footer toggle does not expose expanded/collapsed state

- **WCAG / basis:** 4.1.2; **APG** (disclosure-related)  
- **Severity:** **P2**  
- **Scope:** **Component default** with `footer` + `onToggle`.  
- **Issue + impact:** Even after adding a name (finding 1), the control does not expose **`aria-expanded`** reflecting `expanded`, so the relationship between the control and the collapsed/expanded rail is not programmatic.  
- **Suggestion:** Set `aria-expanded={expanded}` on the footer control; optionally `aria-controls` referencing the `nav` id.

---

### 9. Submenu chevron `Icon` may clutter accessible names

- **WCAG / basis:** **Best practice** (accessible name quality)  
- **Severity:** **P3**  
- **Scope:** **Component default** when submenu chevron is shown (`expanded` and `menu.subMenu`).  
- **Issue + impact:** Chevron is decorative if `aria-expanded` is on the parent; icon font text inside `<i>` may still contribute noise depending on browser/AT.  
- **Suggestion:** Once finding 4 is fixed, mark the chevron `aria-hidden={true}` if it is purely visual.

---

### 10. `Navigation.tsx` facade — deprecation and testing note only

- **WCAG / basis:** N/A (composition)  
- **Severity:** —  
- **Scope:** Documentation / maintainability  
- **Issue + impact:** Comment notes deprecation in favor of `VerticalNav` / `HorizontalNav`; a11y fixes should land in the supported organisms long-term. The facade itself does not introduce extra landmark duplication because only the child renders `<nav>`.  
- **Suggestion:** Track parity between `VerticalNavigation` (this package) and `VerticalNav` (`core/components/organisms/verticalNav/`) if both remain exported.

---

## Severity summary

| Tier | Count | Themes |
|------|-------|--------|
| **P0** | 2 | Unnamed footer toggle; collapsed vertical items without proper names |
| **P1** | 3 | Missing `href`/link in vertical mode; missing `aria-expanded`/`aria-controls` for submenus; missing `aria-current` for active item |
| **P2** | 3 | `div role="button"` vs native elements; list structure; footer `aria-expanded` |
| **P3** | 2 | Decorative chevron; horizontal list grouping (see also `horizontalNav-audit.md`) |

**Rollup:** Critical and high issues are concentrated in **`VerticalNavigation.tsx`**. The **`Navigation.tsx`** shell is structurally fine for landmarks; **`HorizontalNav`** (horizontal branch) aligns better with HTML semantics but should stay aligned with `horizontalNav-audit.md` for list markup and icon naming.

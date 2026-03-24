# VerticalNav — Structural ARIA / Semantic Audit

## Component overview

- **APG pattern:** The implementation targets a **tree** (`role="tree"` on the root, `role="treeitem"` on items, `aria-level`, `aria-expanded` on parents, arrow-key handling in `utils.ts`). That is closer to [APG Tree View](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/) than to a simple list of links, but the **host elements** (`<a>` with `href`) and **Tooltip / Popover wrappers** conflict with a clean tree structure and with native link behavior.
- **Implementation files:**

| Path | Role |
| --- | --- |
| `core/components/organisms/verticalNav/VerticalNav.tsx` | Root container (`role="tree"`), roving-tabindex coordination, section labels, keyboard routing |
| `core/components/organisms/verticalNav/MenuItem.tsx` | Each row: `Link` (`componentType="a"`) + icons, pills, submenu chevron, tooltip |
| `core/components/organisms/verticalNav/utils.ts` | Visible items query (`[data-menu-name]`), Arrow/Home/End/Space/Enter handling |
| `core/components/organisms/verticalNav/index.tsx` | Re-exports |
| `css/src/components/verticalNav.module.css` | Layout and **`:focus`** outline styling for `.MenuItem` |
| `core/components/atoms/_text/index.tsx` | Generic `Link`: `createElement(componentType, …)` — used as `<a>` with ARIA spread from `MenuItem` |

- **Shared helpers:** `core/utils/navigationHelper.tsx` — `Menu`, `ActiveMenu`, `isMenuActive`, `getMenu`, colors, pill appearance, etc. (same shape as `HorizontalNav`).
- **Root cause / rollup:** Several issues come from one design choice: **tree roles and keyboard model on top of `<a>` + `preventDefault`**, plus **Tooltip → Popover → PopperWrapper → OutsideClick (`<div>`) wrapping** the trigger when tooltips are shown. **Landmark naming** is limited because only `className` / `data-test` are forwarded from `extractBaseProps`, not `aria-*`.

---

## Findings

### 1. `role="treeitem"` on `<a>` overrides link semantics; `preventDefault` blocks native navigation

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (native link affordances); Best practice / HTML
- **Severity:** P1
- **Scope:** Component default whenever default `MenuItem` renders
- **Repro:** Render `VerticalNav` with `menus` entries that include `link` and `onClick`. Inspect the row: `<a role="treeitem" href="…">`. Activate the control: `MenuItem`’s handler calls `ev.preventDefault()` on every activation.
- **Issue + impact:** Explicit `role="treeitem"` on an anchor **replaces** the implicit `link` role in the accessibility tree, so assistive technologies typically announce a **tree item**, not a link. **`preventDefault` on all clicks** prevents default navigation even when `href` is set, so users lose **open in new tab**, **middle-click**, **copy link address**, and predictable browser history behavior unless the app perfectly reimplements them in `onClick`.
- **Suggestion:** Prefer **either** a real tree (focusable `<div>` / `<button>` rows with no conflicting `href`, and navigation purely via routing) **or** a **navigation landmark with native links** (`<nav>` + `<a href>`) and a documented keyboard model — avoid `role="treeitem"` on `<a>` plus universal `preventDefault`. If SPA routing is required, consider `<a href>` + client-side handling **without** cancelling default when the URL should still behave as a link.

```117:120:core/components/organisms/verticalNav/MenuItem.tsx
  const onClickHandler = (ev: { preventDefault: () => void }) => {
    ev.preventDefault();
    if (onClick) onClick(menu);
  };
```

```122:132:core/components/organisms/verticalNav/MenuItem.tsx
  const baseProps = {
    onClick: onClickHandler,
    href: menu.link,
    tabIndex: tabIndex !== undefined ? tabIndex : 0,
    role: 'treeitem',
    'aria-level': isChildren ? 2 : 1,
    'aria-expanded': hasSubmenu ? (isChildrenVisible ? 'true' : 'false') : undefined,
    'data-menu-name': menu.name,
    'data-disabled': menu.disabled ? 'true' : undefined,
    ...extractBaseProps(props),
  };
```

---

### 2. Tooltip-on path inserts a `<div>` between `role="tree"` and each `treeitem`

- **WCAG / basis:** 4.1.2 Name, Role, Value (ARIA parent/owned-elements expectations for `tree`); APG only (Tree View structure)
- **Severity:** P1
- **Scope:** Component default whenever `Tooltip` renders the Popover path (e.g. collapsed mode always uses `showTooltip={true}`; expanded mode uses tooltip when label is truncated)
- **Repro:** Collapsed `VerticalNav` or expanded with truncated labels. DOM under the root: `div[role="tree"]` → `div.PopperWrapper-trigger` (from `OutsideClick`) → `a[role="treeitem"]`.
- **Issue + impact:** A `tree` is expected to **own** `treeitem` nodes in a coherent hierarchy. An extra **generic `div` wrapper** around each item breaks the **direct structural relationship** between the tree and its items and may confuse assistive technology tree navigation or heuristics that assume treeitems are proper descendants without arbitrary wrappers.
- **Suggestion:** Use a tooltip pattern that **does not wrap** the trigger in an extra element (e.g. ref-only / portal positioning), or **detach** tooltip from items and use `title` / native description where appropriate; alternatively **drop `role="tree"`** if the UX is primarily navigational links and keep a single wrapper-free list.

---

### 3. Root `role="tree"` cannot receive an accessible name via standard `aria-*` props on `VerticalNav`

- **WCAG / basis:** 1.3.1 Info and Relationships; Best practice (landmark / widget labels when multiple nav regions exist)
- **Severity:** P1
- **Scope:** Component API (`extractBaseProps` only forwards `className` and `data-test`)
- **Repro:** Pass `aria-label="Main"` (or `aria-labelledby`) on `<VerticalNav />`. The rendered root only gets `className` / `data-test` from `extractBaseProps`; `aria-label` is not applied.
- **Issue + impact:** Unnamed `role="tree"` regions are hard to distinguish in **landmark** or **region** lists when multiple sidebars or trees exist. Consumers must wrap an extra element to label the widget.
- **Suggestion:** Extend `VerticalNav` (and optionally `MenuItem`) to forward **`aria-label` / `aria-labelledby` / `aria-describedby`** to the root `div`, or document that an outer **`<nav aria-label="…">`** is mandatory.

```277:287:core/components/organisms/verticalNav/VerticalNav.tsx
  return (
    <div
      ref={containerRef}
      role="tree"
      tabIndex={-1}
      data-test="DesignSystem-VerticalNav"
      {...baseProps}
      className={classes}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    >
```

---

### 4. No `aria-current` on the active destination

- **WCAG / basis:** Best practice (current page in nav); 2.4.8 Link Purpose (AAA, if treated as links)
- **Severity:** P2
- **Scope:** Component default when `active` matches an item
- **Issue + impact:** Visual “active” styling exists (`isActive`), but there is no **`aria-current="page"`** (or `true`) on the active row. Screen reader users rely on state attributes to know which destination is current.
- **Suggestion:** When `isMenuActive` is true for a leaf (or for the chosen “current” row policy), set `aria-current="page"` on that item’s interactive element.

---

### 5. Icons and submenu chevron likely pollute the accessible name of each item

- **WCAG / basis:** 4.1.2 Name, Role, Value; Best practice (decorative / redundant non-text in named controls)
- **Severity:** P2
- **Scope:** Component default when `menu.icon` or submenu chevron is shown
- **Issue + impact:** `Icon` is rendered without `aria-hidden="true"`. Material / ligature-based icons often expose **technical names** (e.g. icon font text) inside the **accessible name** of the parent, in addition to `menu.label`. The submenu chevron uses `keyboard_arrow_up` / `keyboard_arrow_down`, which can add **noise** to the treeitem name.
- **Suggestion:** Mark decorative icons and the expand chevron **`aria-hidden="true"`** when the visible text label supplies the name (mirror the recommendation for `HorizontalNav`).

---

### 6. Section group labels are plain text with no grouping semantics for following items

- **WCAG / basis:** 1.3.1 Info and Relationships
- **Severity:** P2
- **Scope:** Component default when `group` is used and `expanded`
- **Issue + impact:** A `div` wraps the uppercase `Text` for the section title; **sibling** `MenuItem` rows are not wrapped in `role="group"` with **`aria-labelledby`** pointing at the section label id. AT may not convey “these items belong to section X” beyond reading order.
- **Suggestion:** Use `role="group"` + stable `id` on the section label and `aria-labelledby` on the group, or use a heading with an appropriate level **only if** it matches the page outline.

---

### 7. Submenu parent/child relationship in keyboard logic assumes `name` uses `parent.child` dot notation

- **WCAG / basis:** Best practice (predictable structure); APG only
- **Severity:** P2
- **Scope:** Consumer-dependent (`Menu.name` shape)
- **Repro:** Use submenu items whose `name` does not contain a dot matching the parent id; ArrowLeft “move to parent” uses `getParentMenuName` from the **string** `menuName`, not the `Menu` graph.
- **Issue + impact:** **ArrowLeft** / parent resolution can fail silently if naming conventions diverge, leaving users unable to move to the parent treeitem as intended.
- **Suggestion:** Derive parent/child from **`menus` / `subMenu` data**, not from dotted `name` strings, or document the convention as a hard requirement on `Menu.name`.

```68:71:core/components/organisms/verticalNav/utils.ts
  const getParentMenuName = (menuName: string): string | null => {
    const dotIndex = menuName.indexOf('.');
    return dotIndex > 0 ? menuName.slice(0, dotIndex) : null;
  };
```

---

### 8. Focus ring uses `:focus` rather than `:focus-visible`

- **WCAG / basis:** 2.4.7 Focus Visible; Best practice
- **Severity:** P3 (enhancement)
- **Scope:** Styles in `verticalNav.module.css`
- **Issue + impact:** `.MenuItem:focus` shows an outline for **any** focus, including **pointer**-induced focus in some browsers, which can feel noisy; keyboard users still get a visible indicator (good for 2.4.7), but the project’s own rules prefer **`:focus-visible`** with no bare `outline: none` without replacement.
- **Suggestion:** Switch to **`:focus-visible`** (and ensure disabled items remain non-focusable / no focus ring removal that hides keyboard focus).

```77:80:css/src/components/verticalNav.module.css
.MenuItem:focus {
  outline: var(--border-width-05) solid var(--primary-focus);
  outline-offset: var(--spacing-05);
}
```

---

### 9. No APG tree type-ahead (optional pattern)

- **WCAG / basis:** APG only
- **Severity:** P3 (enhancement)
- **Scope:** Component default
- **Issue + impact:** Many tree implementations support **letter navigation** to jump to the next item starting with a character. This tree only supports arrows, Home, End, Space, Enter.
- **Suggestion:** If parity with desktop tree widgets is required, add type-ahead per APG; otherwise document as intentional.

---

### 10. `customItemRenderer` / `customOptionRenderer` bypass built-in semantics

- **WCAG / basis:** 4.1.2; Best practice
- **Severity:** P3 (consumer-dependent; becomes P0/P1 if renderers drop roles/names/keyboard)
- **Scope:** When custom renderers are used
- **Issue + impact:** Consumers receive pre-built pieces but **full responsibility** for roles, labels, `aria-expanded`, roving `tabIndex`, and disabled state falls on them. Misuse can remove tree semantics or names entirely.
- **Suggestion:** Document required ARIA + keyboard contract for custom renderers; optionally ship a headless hook or primitives that preserve the tree model.

---

## Severity summary

- **P1:** 3 (findings 1–3)
- **P2:** 4 (findings 4–7)
- **P3:** 3 (findings 8–10)

---

## Positive notes (for backlog context)

- **Roving `tabIndex`:** One item at `tabIndex={0}`, others `-1`, aligned with common tree keyboard patterns.
- **`aria-expanded`:** Set on parent rows when `hasSubmenu` is true.
- **`aria-level`:** Distinguishes top-level vs submenu rows.
- **Disabled items:** `data-disabled` + exclusion from `getVisibleMenuItems` reduces accidental keyboard focus on disabled rows when roving state is consistent.
- **Arrow keys, Home, End, Space, Enter:** Implemented in `handleVerticalNavKeyDown` for in-widget navigation.

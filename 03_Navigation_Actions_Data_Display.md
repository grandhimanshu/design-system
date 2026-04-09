# Navigation Actions Data Display

This document contains the P0 (Critical) and P1 (High) ARIA audit issues for Navigation Actions Data Display.

**Total P0/P1 issues in this group:** 25

| Component | P0/P1 issues |
| :--- | :--- |
| Menu | 4 |
| Tabs | 3 |
| Navigation | 4 |
| List | 2 |
| VerticalNav | 4 |
| Dropdown | 2 |
| Button | 1 |
| Collapsible | 2 |
| Link | 1 |
| KeyValuePair | 1 |
| Stepper | 1 |

---

## 1. Menu

### 1. P1 - `aria-controls` on submenu trigger does not reference the menu element’s `id`
- **Repro:** Render nesting per `Menu.test.tsx` (“Menu component with Nesting snapshot”); inspect submenu trigger: `aria-controls` equals `DesignSystem-Menu--Popover-*` while the panel’s focusable menu root uses `id="menu-*"` from `Menu.tsx` (`generatedMenuId`). `Popover` exposes `data-name={name}`, not `id={name}` (`Popover.tsx`).
- **Issue + impact:** `aria-controls` must reference element `id`s (IDREF). Pointing at a string that only exists as `data-name` breaks the intended relationship in supporting AT; users may not get correct “controlled by” / popup association for the submenu panel.
- **Suggestion:** Align IDs: e.g. pass the same stable id into the nested `Menu`’s root `div` (or set `id={menuID}` on the actual menu container) and keep `aria-controls`/`aria-labelledby` consistent; avoid using `data-name` as a substitute for `id` in ARIA references.

---

### 2. P1 - `navigation` landmark (`<nav>`) nested inside `role="menu"`
- **Repro:** Use `Menu` + `Menu.List` as documented; inspect DOM: outer `div[role="menu"]` contains `nav` with implicit `navigation` role wrapping `menuitem` descendants.
- **Issue + impact:** A `menu`’s expected structure uses `menuitem` / `group` / `separator` (etc.); an intermediate `navigation` landmark is not a valid owned role for `menu` and can confuse the accessibility tree (nested landmark + invalid menu composition).
- **Suggestion:** Default `MenuList` to a non-landmark tag (`div`) or set explicit `role="none"` / `presentation"` on the list root when inside `Menu`; document if `nav` is kept for rare page-level menus outside a `role="menu"` wrapper.

---

### 3. P1 - Submenu trigger `aria-expanded` does not reflect open state
- **Repro:** Inspect submenu trigger after mount: `aria-expanded` is derived from `subListRef.current ? 'true' : 'false'` — the ref is attached to a wrapper `div` that exists whenever the submenu is mounted, not when the popover is open/closed.
- **Issue + impact:** Assistive technologies receive a static or misleading expanded state; the trigger does not track the nested popover’s `open` state.
- **Suggestion:** Tie `aria-expanded` to the nested `Menu`/`Popover` open state (lift state, callback, or clone props from the nested component when available).

---

### 4. P1 - Escape / ArrowLeft focus return from nested menus is unreliable
- **Repro:** `MenuItem` always passes `isSubMenuTrigger={false}` into `handleKeyDown` (`MenuItem.tsx`). `Escape` uses `if (triggerRef && !isSubMenuTrigger) { triggerRef.current?.focus() } else { menuTriggerRef… }` (`utils.tsx`). `triggerRef` is supplied from `SubMenuContext` for items inside the nested list even though they are not the submenu trigger row. `triggerRef` is attached via `cloneElement` on `Menu.Item` (`SubMenu.tsx`), but `Menu.Item` / `Listbox.Item` are not `forwardRef` components, so `triggerRef.current` is typically `null`. `navigateSubMenu` focuses `querySelector('#' + triggerID)?.firstChild` (`utils.tsx`) — `firstChild` may be a text node or inner widget, not the `menuitem` (`ListBody` has `id={triggerID}`).
- **Issue + impact:** Users may lose focus or land on the wrong node when closing or backing out of a submenu; violates expected submenu keyboard behavior.
- **Suggestion:** Forward refs to the focusable `menuitem` host; focus `#${triggerID}` directly (the element with `role="menuitem"`), not `firstChild`; for `Escape`, prefer focusing the parent submenu trigger when focus was in the child menu (track depth or use context), and only use `menuTriggerRef` for the root trigger.

---

## 2. Tabs

### 1. P1 - Arrow key focus uses `tabRefs` indices that do not match tab indices when disabled tabs exist
- **Repro:** Fails when `Tabs` is used as documented with `tabs` (or children) where a middle tab is `disabled`: focus ArrowLeft/ArrowRight from an enabled tab can move to the wrong tab or fail to move to the adjacent enabled tab because `tabRefs` only pushes non-disabled elements but `tabKeyDownHandler` indexes with `tabIndex ± 1` (map index), not the next/previous **focusable** tab.
- **Issue + impact:** Keyboard users cannot predict or complete horizontal tab navigation; focus may jump incorrectly or not reach the visually adjacent tab.
- **Suggestion:** Compute previous/next focusable tab index in tab order (skipping disabled), then `focus()` that element; or use a ref map keyed by tab index instead of a sparse array.

---

### 2. P1 - `Space` does not activate a tab; unit tests codify omission
- **Repro:** Fails when `Tabs` is used as documented: focus a tab and press Space — selection/`onTabChange` does not run (see `Tabs.test.tsx`, which expects Space **not** to call `onTabChange`).
- **Issue + impact:** Users accustomed to APG-style tabs (Space or Enter) may believe the control is broken; Space may also scroll the page depending on browser focus handling.
- **Suggestion:** On `role="tab"`, handle `event.key === ' '` (and `Space`) with `preventDefault()` and the same path as `Enter` for activation, aligned with APG manual activation.

---

### 3. P1 - Dismissible close control: focusable `role="button"` inside `role="tab"` without an accessible name
- **Repro:** TBD — verify with screen reader: focus lands on the clear icon control inside the tab; name may be missing or only the font/glyph name.
- **Issue + impact:** The secondary action is not clearly identified (e.g. “Remove tab”, “Close”); nested interactive also complicates tab semantics.
- **Suggestion:** Pass a concise `aria-label` (and optionally `onKeyDown` if overriding) on the dismiss `Icon`, e.g. “Close tab” / “Dismiss {label}”.

---

## 3. Navigation

### 1. P0 - Collapsed vertical items without `menu.icon` can be focusable controls with no accessible name
- **Repro:** Fails when `Navigation` / `VerticalNavigation` is used with `expanded={false}` and a menu object `{ name, label, … }` without `icon`: the wrapper is still `role="button"` with `tabIndex={0}` (if not disabled) but can have **no** computed accessible name.
- **Issue + impact:** Screen reader users get a “button” with no name; keyboard users may focus an unnamed control. This is an unambiguous name failure for that configuration.
- **Suggestion:** Always expose a name when the item is focusable (e.g. set `aria-label={menu.label}` whenever `!expanded`, or render visually hidden text for `menu.label`, or remove `tabIndex`/role when there is nothing to show).

---

### 2. Also test Hover Ecpanding Navs - P1 - Submenu parents do not expose expand/collapse state or a controlled region (`aria-expanded`, `aria-controls`)
- **Repro:** Fails when `Navigation` is used as documented with vertical layout, `expanded`, and any item that defines `subMenu`: assistive technologies cannot reliably report open/closed state or associate the button with the submenu panel.
- **Issue + impact:** Users relying on state announcements or structured relationships cannot tell whether a section is expanded or which content it controls; behavior diverges from APG disclosure expectations.
- **Suggestion:** Add stable `id`s to submenu containers; set `aria-expanded={Boolean(menuState[menu.name])}` on parents with submenus; use `aria-controls` pointing at the submenu panel id; consider `aria-haspopup="true"` if you keep a button-like pattern.

---

### 3. P1 - Vertical active item state is not exposed to assistive technologies (`aria-current` missing)
- **Repro:** Fails when comparing vertical vs horizontal usage with the same `active` prop: vertical items do not expose programmatic “current” state.
- **Issue + impact:** Users cannot hear which destination is current in the same way as the horizontal variant; inconsistent API behavior across `Navigation` layouts.
- **Suggestion:** Mirror `HorizontalNav`: set `aria-current="page"` (or `step` / `true` if more appropriate to your IA) on the active top-level and submenu items when `isMenuActive` is true.

---

### 4. P1 - `Menu.link` is ignored in vertical layout (no native links for destinations)
- **Repro:** Fails when consumers pass `link` expecting vertical items to behave as real links (open in new tab, copy URL, SR “link” semantics, middle-click).
- **Issue + impact:** Same data model yields different semantics by layout; users lose link affordances and predictable navigation behavior.
- **Suggestion:** Render `<a href={menu.link}>` (or `Link`) for vertical items when `link` is set, preserving keyboard and AT semantics; keep `role="button"` only for pure disclosure toggles if needed.

---

## 4. List

### 1. P1 - Resource rows are pointer-only (no keyboard equivalent)
- **Repro:** Use `List` with `type="resource"` and `onRowClick` as in `core/components/organisms/list/__stories__/index.story.jsx` — row activation is wired to `onClick` on a non-focusable `<div>` with no `tabIndex`, `role`, or `onKeyDown`.
- **Issue + impact:** Keyboard and many assistive-technology users cannot trigger the same “open resource” behavior as mouse users. The codebase even marks the row container with `TODO(a11y)` comments.
- **Suggestion:** Expose row activation as a focusable control (e.g. `role="link"` or `role="button"` on the row or a per-row trigger), implement Enter/Space per APG, ensure a clear accessible name (from row content or `aria-label`), and avoid duplicate activation when inner controls are focused.

**Code reference (inherited):**

```tsx
  return (
    <div className={wrapperClasses} data-test="DesignSystem-Grid-rowWrapper">
      {/* TODO(a11y)  */}
      {/* eslint-disable-next-line */}
      <div data-test="DesignSystem-Grid-row" className={rowClasses} onClick={onClickHandler} ref={rowRef}>
        {renderSchema(leftPinnedSchema, !!leftPinnedSchema.length, 'left')}
        {renderSchema(unpinnedSchema, !leftPinnedSchema.length && !!unpinnedSchema.length)}
        {renderSchema(rightPinnedSchema, false, 'right')}
      </div>
```

---

### 2. P1 - No semantic table or ARIA grid structure for tabular data
- **Repro:** Render `List` with any schema — body is nested `<div>` elements (`Grid-body`, `Grid-row`, `Grid-cell` classes) without `role="table"` / `role="grid"` / `role="row"` / `role="gridcell"` (or equivalent native `<table>`).
- **Issue + impact:** Assistive technologies do not get a table/grid landmark model: rows, columns, and headers are not exposed in a standard way. With `showHead={false}`, **programmatic column headers are absent**, so column-to-cell relationships are not available.
- **Suggestion:** Either adopt native `<table>` (with visually hidden headers if needed) or implement the [APG grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) / [APG table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) roles with `aria-colcount`, header cells, and keyboard model; for a “list” visual, still expose column metadata for screen readers.

**Code reference (inherited — `List` forces `showHead` off):**

```tsx
export const List = (props: ListProps) => {
  return <Table {...props} showHead={false} filterPosition={'HEADER'} />;
};
```

```tsx
            {showHead && (
              <GridHead
                schema={schema}
                onSelectAll={this.onSelectAll?.bind(this)}
                onMenuChange={this.onMenuChange.bind(this)}
                onFilterChange={this.onFilterChange.bind(this)}
                updateColumnSchema={this.updateColumnSchema.bind(this)}
                reorderColumn={this.reorderColumn.bind(this)}
              />
            )}
```

---

## 5. VerticalNav

### 1. P1 - Default documented menus omit `link`, yielding `<a>` without `href` (placeholder links)
- **Repro:** Fails when `VerticalNav` is used as documented in Flat-style stories: interactive items are placeholder `<a>` elements, not buttons or real destinations.
- **Issue + impact:** Assistive technologies often announce **“link”** without a URL; behavior is click/keyboard-driven like a button, so **role does not match behavior**. This also diverges from APG tree examples that avoid link role on tree items unless they are actual navigations.
- **Suggestion:** Use `<button type="button">` (or `role="button"` only if unavoidable) when `menu.link` is absent; reserve `<a href="…">` for real navigations. If SPA routing must use buttons, document required `link`/`href` patterns or provide a single composable primitive per item type.

---

### 2. P1 - Disabled menu items are not exposed with `aria-disabled="true"`
- **Repro:** Fails when `VerticalNav` is used with `menu.disabled: true` on any entry (see tests around disabled styling): the item is non-actionable for pointer and roving keyboard lists, yet the accessibility tree lacks an explicit **disabled** state.
- **Issue + impact:** Users who explore content linearly or use tools that list links/controls may not hear **unavailable** state; only visual styling and removal from the roving set imply disability.
- **Suggestion:** Set `aria-disabled="true"` on disabled tree items (and avoid activating `onClick` for disabled entries if any path still fires). Prefer native `disabled` on `<button>` if switching away from `<a>` for non-link items.

---

### 3. P1 - Tree container has no accessible name and props do not allow `aria-label` / `aria-labelledby`
- **Repro:** Fails when `VerticalNav` is used as documented with no wrapper supplying a name: the tree region is unnamed in the accessibility tree.
- **Issue + impact:** In landmarks/structure views or when the tree is announced in isolation, users get **“tree”** without context (e.g. “Main”, “Settings”, “Patient chart”).
- **Suggestion:** Add an optional `aria-label` or `aria-labelledby` prop (or render inside `<nav aria-label="…">` with appropriate `role` composition per APG), defaulting to a sensible string for the primary app nav case.

---

### 4. P1 - `customItemRenderer` / `customOptionRenderer` bypass built-in roles and keyboard wiring
- **Repro:** Fails when `customItemRenderer` is used without replicating tree roles, names, disabled state, and `data-menu-name` / focusability consistent with `VerticalNav`’s `onFocus` and `utils.ts` selectors.
- **Issue + impact:** Tree semantics and keyboard navigation can **silently break** for assistive technology users.
- **Suggestion:** Document required attributes (`data-menu-name`, `data-disabled`, `role`, `tabIndex`, `aria-expanded`, `aria-level`, `aria-disabled`) and provide a headless primitive or example that preserves the contract.

---

## 6. Dropdown

### 1. P1 - Module-level `inputRef` breaks search focus for multiple dropdown instances
- **Repro:** Render two such dropdowns; open each — `inputRef.current` points at a single shared ref, so `focus()` and `Input` `ref` from `componentDidUpdate` / open effects target the wrong or last-mounted search input.
- **Issue + impact:** Keyboard and programmatic focus can land in the wrong dropdown’s search field; one instance may never receive the ref. Screen reader users lose predictable focus and may edit/search the wrong control.
- **Suggestion:** Move `inputRef` to a per-instance ref (e.g. `React.createRef` in the `Dropdown` constructor or `useRef` if refactored) and pass that ref into `DropdownList`.

---

### 2. P1 - Custom trigger omits disclosure/list semantics unless the consumer adds them
- **Repro:** `customTrigger={() => <button type="button">…</button>}` without `aria-haspopup`, `aria-expanded`, or relationship to the popup.
- **Issue + impact:** AT may not expose the control as opening a list/menu or reflect open/closed state; users may not discover popup behavior or current state.
- **Suggestion:** Merge required ARIA into the cloned element in `DropdownList` (`aria-haspopup`, `aria-expanded={dropdownOpen}`, optional `aria-controls` once the list has a stable id), or document and enforce a render-prop contract that returns a focusable element accepting those props.

---

## 7. Button

### 1. P1 - Loading state removes text label from the accessibility tree
- **Repro:** Use `<Button loading>Submit</Button>` without `aria-label` / `aria-labelledby`; label text is wrapped in `Text` with `Button-text--hidden`, which uses `visibility: hidden` in CSS — typically excluded from the accessible name calculation, while the inner `Spinner` exposes `role="status"` and default `aria-label="Loading"`.
- **Issue + impact:** Assistive technologies may not associate the control with “Submit” (or similar) while loading; users hear a generic “Loading” (or a weakened name) and lose context for the pending action.
- **Suggestion:** Prefer an off-screen or `aria-hidden` visual treatment that **preserves** the text node for naming (e.g. visually hidden but not `visibility: hidden`), or automatically mirror `children` into `aria-label` while loading when no explicit label relation exists; consider marking the spinner decorative (`aria-hidden`) when the button already sets `aria-busy`.

---

## 8. Collapsible

### 1. P1 - `withTrigger={false}` removes the only keyboard path while hover may still toggle expansion
- **Repro:** Fails when `Collapsible` is used with `withTrigger={false}` and `onToggle` provided; expansion depends on hover on `DesignSystem-CollapsibleBody` with no focusable control equivalent.
- **Issue + impact:** Keyboard and many assistive technology users cannot expand or collapse the panel if the footer trigger is omitted but hover remains enabled. That is a **keyboard access** gap for a real variant of the public API.
- **Suggestion:** If `withTrigger` is false, either **disable hover-driven toggling**, or **expose an alternative focusable control** (e.g. optional `renderTrigger`, or move keyboard/hover logic to a single native `<button>`). Document that **hover-only** use is not keyboard-accessible.

---

### 2. P1 - Footer appears operable by default but does nothing when `onToggle` is omitted
- **Repro:** Fails when `Collapsible` is rendered with default `withTrigger` and without `onToggle`; the footer still exposes `role="button"`, `tabIndex={0}`, and `aria-expanded`, but click/keyboard handlers no-op inside `onToggleHandler`.
- **Issue + impact:** Users get a **named, focusable button** whose activation **does not change** state or notify the app. Assistive technologies announce a button that appears broken, which undermines trust and **programmatic state** expectations.
- **Suggestion:** Require `onToggle` whenever the footer is shown, **or** omit `role` / `tabIndex` / `aria-expanded` when `onToggle` is missing, **or** implement a sensible controlled/uncontrolled default so activation always does something documented.

---

## 9. Link

### 1. P1 - `{...rest}` spread order allows overriding accessibility-critical props
- **Repro:** `<Link href="/x" disabled aria-label="…" tabIndex={0} />` — consumer `tabIndex={0}` overrides the component’s `tabIndex={-1}` for disabled links, returning a disabled-marked control to the tab order; similarly `onClick` in `rest` can override the disabled-safe `onClick` handling.
- **Issue + impact:** Disabled links may remain keyboard-focusable and activatable, or `aria-disabled` may be forced false while the control still looks disabled—breaking the contract between visible state, ARIA state, and keyboard/pointer behavior.
- **Suggestion:** Spread `{...rest}` first, then apply explicit `tabIndex`, `aria-disabled`, and `onClick` last; or omit those keys from `rest` and merge via a small helper so component rules always win.

---

## 10. KeyValuePair

### 1. P1 - Orphan `<dt>` or `<dd>` inside `<dl>` (single subcomponent only)
- **Repro:** `KeyValuePair.test.tsx` renders `<KeyValuePair><KeyValuePair.Key label={label} /></KeyValuePair>` and `<KeyValuePair><KeyValuePair.Value value={value} /></KeyValuePair>` — `dt`-only and `dd`-only lists.
- **Issue + impact:** A description list is meant to associate **names** (`dt`) with **values** (`dd`). A lone term or lone description breaks that association for users who rely on structure (including some assistive technologies exposing `dl` semantics).
- **Suggestion:** Document that each logical row should include **both** `Key` and `Value` (or custom equivalents in both slots). Optionally enforce via `dev` warning, Storybook docs, or types (e.g. require tuple children). For intentional “value only” display, recommend a non-`dl` pattern or `aria`-backed layout chosen with care.

---

## 11. Stepper

### 1. P1 - Skipped steps (`skipIndexes`) have no programmatic “skipped” state
- **Repro:** Render `Stepper` with `skipIndexes` containing one or more indices; assistive technologies get the same step naming pattern as non-skipped steps (no “skipped” or equivalent in `aria-label` / `aria-describedby`).
- **Issue + impact:** Skipped steps remain focusable and activatable (`disabled` is false when `isSkipped` because `disabled = !activeStep && !isSkipped && completed + 1 < index`). Users who rely on SRs cannot tell which steps were skipped, which breaks parity with visual intent for that variant.
- **Suggestion:** Thread an `isSkipped` (or similar) flag into `Step` and reflect it in accessible name and/or description (e.g. append “, skipped” to `aria-label`, or use `aria-describedby` for a stable “Skipped” description). If skipped steps should not be actionable, align `disabled`, `tabIndex`, and `aria-disabled` with that product rule.

---
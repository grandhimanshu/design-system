# Menu — Structural ARIA / Semantic Audit

## Component overview

**APG pattern:** [Menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/) / menu with `role="menu"` containing `menuitem` (and optional `group` for sections).

**Implementation files (primary):**

- `core/components/organisms/menu/Menu.tsx` — `role="menu"` wrapper, `Popover`, `MenuContext`
- `core/components/organisms/menu/MenuList.tsx` — wraps `Listbox`
- `core/components/organisms/menu/MenuItem.tsx` — wraps `Listbox.Item` with `role="menuitem"` and menu `handleKeyDown`
- `core/components/organisms/menu/MenuGroup.tsx` — `role="group"`
- `core/components/organisms/menu/SubMenu.tsx` — nested popover + `SubMenuContext`
- `core/components/organisms/menu/trigger/MenuTrigger.tsx` — `Button` trigger + trigger `handleKeyDown`
- `core/components/organisms/menu/utils.tsx` — menu keyboard navigation
- `core/components/organisms/menu/trigger/utils.tsx` — trigger keyboard (open + initial highlight)
- `core/components/organisms/menu/MenuContext.tsx`, `SubMenuContext.tsx`, `index.tsx`

**Dependencies (accessibility-relevant):**

- `core/components/organisms/listbox/Listbox.tsx` — container (`<nav>` default for `Menu.List`)
- `core/components/organisms/listbox/listboxItem/ListBody.tsx` — focusable inner wrapper + **`role="tablist"`**
- `core/components/organisms/listbox/utils.ts` — **`onKeyDown`** (ArrowUp/Down between siblings)
- `core/components/molecules/popover/Popover.tsx` — `data-name={name}` on popover root (not `id`)

**Root cause / rollup:** `Menu.Item` is implemented as `Listbox.Item` + `ListBody`. `ListBody` always exposes **`role="tablist"`** and the listbox **`onKeyDown`** handler. That stacks invalid roles and a second keyboard model on top of the menu pattern. Many findings trace to this single composition choice rather than unrelated bugs.

---

## Findings

### 1. Focusable menu row exposes `role="tablist"` inside `menuitem` (invalid roles + wrong semantics)

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships
- **Severity:** **P0**
- **Scope:** **Component default** (any `Menu.Item` using `Listbox` / `ListBody` as implemented)
- **Repro:** Use `Menu` as in `__stories__/all.story.jsx` with `Menu.List` / `Menu.Item`; focus moves to `[data-test="DesignSystem-Listbox-ItemWrapper"]` (see `focusListItem` / `navigateOptions` in menu `utils.tsx`).
- **Issue + impact:** `ListBody` renders the focus target with `role="tablist"` (`ListBody.tsx`). `MenuItem` puts `role="menuitem"` on the outer `Listbox` tag (`<a>` by default) while keyboard focus targets the inner div. Assistive technologies therefore see a **menu item containing a tab list** (not a valid structure for `menu` → `menuitem`), and the focused control’s role does not match the menu pattern. This undermines correct role exposure and relationship to the parent `role="menu"`.
- **Suggestion:** For menu usage, stop inheriting `ListBody`’s fixed `role="tablist"` (e.g. `role="none"` / omit role on the inner focus target, or a menu-specific item primitive without tablist semantics). Ensure the focused element carries `menuitem` semantics (or a single correct interactive wrapper), consistent with APG.

---

### 2. Duplicate Arrow key handling (listbox + menu) on the same focused node

- **WCAG / basis:** 2.1.1 Keyboard
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** ArrowDown while focus is on `DesignSystem-Listbox-ItemWrapper`; `ListBody` attaches `onKeyDown` from `listbox/utils.ts`, and the event bubbles to the outer item where `MenuItem` also wires menu `handleKeyDown`.
- **Issue + impact:** The inner wrapper runs listbox navigation (sibling `firstChild` walking); the outer `menuitem` handler runs menu `navigateOptions` (querySelectorAll over wrappers). One keypress can trigger **two** navigation implementations, producing unpredictable focus order or double moves.
- **Suggestion:** For `Menu.Item`, disable or bypass `ListBody`’s listbox `onKeyDown`, or handle keys only on one element in the capture/target phase so a single pattern owns arrows.

---

### 3. Submenu trigger: `aria-controls` does not reference a real element `id`

- **WCAG / basis:** 4.1.2 (relationships); APG / Best practice for `aria-controls`
- **Severity:** **P1**
- **Scope:** **Component default** when using `Menu.SubMenu`
- **Repro:** `SubMenu` sets `'aria-controls': menuID` on the cloned trigger while `Popover` only sets `data-name={name}` on the popover root (`Popover.tsx`), not `id={menuID}` on the controlled panel.
- **Issue + impact:** `aria-controls` is expected to reference the **`id`** of the popup container. Referencing a generated string with no matching `id` breaks the documented relationship for assistive tech and undermines correct popup association.
- **Suggestion:** Put `id={menuID}` on the visible menu panel (or the element that actually holds `role="menu"` for the submenu) and keep `aria-controls` aligned with that `id`.

---

### 4. Submenu trigger: `aria-expanded` derived from ref presence, not open state

- **WCAG / basis:** 4.1.2 States and Properties
- **Severity:** **P1**
- **Scope:** **Component default** (`Menu.SubMenu`)
- **Repro:** `aria-expanded: subListRef.current ? 'true' : 'false'` runs at render; `subListRef` is attached whenever the inner `div` mounts, not when the submenu popover is open.
- **Issue + impact:** `aria-expanded` will often read **true** whenever the submenu DOM exists, regardless of visibility/open state, and does not track `Popover` `open`. Screen reader state for the submenu trigger will be wrong.
- **Suggestion:** Tie `aria-expanded` to the same boolean that controls submenu visibility (Popover `open`), with initial closed state **false**.

---

### 5. Escape on submenu **trigger** returns focus to root menu button, not parent item

- **WCAG / basis:** 2.1.1 Keyboard; 2.4.3 Focus Order (where focus order becomes illogical)
- **Severity:** **P1**
- **Scope:** **Component default** when keyboard user is on the submenu trigger element (`SubMenu` `onKeyDownHandler` with `isSubMenuTrigger === true`)
- **Repro:** Focus submenu trigger, press Escape; `menu/utils.tsx` Escape branch uses `menuTriggerRef` when `isSubMenuTrigger` is true (skips `triggerRef` focus).
- **Issue + impact:** User expects focus to remain in the parent menu (e.g. parent `menuitem` / submenu trigger). Moving to the root `Menu.Trigger` skips intermediate context and breaks predictable hierarchical navigation.
- **Suggestion:** When closing from submenu trigger, focus `triggerRef.current` (submenu trigger) or the parent `menuitem`, not only `menuTriggerRef`.

---

### 6. Top-level menu: no stable `id` / `aria-controls` wiring from `Menu.Trigger` to the menu panel

- **WCAG / basis:** Best practice / APG (Menu button); 4.1.2 as robustness for relationships
- **Severity:** **P2**
- **Scope:** **Component default** for root `Menu` + `Menu.Trigger` (nested `Menu` inside `SubMenu` can receive `name` via `SubMenuContext` for `data-name` only)
- **Issue + impact:** `Menu` does not assign an `id` to the `role="menu"` container. `MenuTrigger` does not set `aria-controls`. APG recommends linking the button to the menu via `aria-controls` and a matching menu `id` for predictable AT support.
- **Suggestion:** Generate a stable id (e.g. `useId`) on the `role="menu"` node; pass it to `Menu.Trigger` as `aria-controls` (and ensure the trigger’s `aria-expanded` matches `openPopover` — already partially present).

---

### 7. `MenuGroup` label not programmatically associated with `role="group"`

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2
- **Severity:** **P2**
- **Scope:** **Component default** when `label` prop is used
- **Repro:** `MenuGroup` with `label` renders `Text` visually above children but the `role="group"` container has no `aria-labelledby` / `aria-label`.
- **Issue + impact:** Group label text is not exposed as the accessible name of the group; users relying on structure may not hear the section heading in relation to its items.
- **Suggestion:** Give the label text node a stable `id` and set `aria-labelledby` on the grouping `div` (or use `aria-label` if no visible label element).

---

### 8. `Menu.List` default `tagName="nav"` inside `role="menu"`

- **WCAG / basis:** 1.3.1; Best practice (landmark noise)
- **Severity:** **P2**
- **Scope:** **Component default**
- **Issue + impact:** A `navigation` landmark wraps items inside a transient overlay already marked as `menu`. This can duplicate landmarks and confuse page outline / rotor without helping the menu pattern.
- **Suggestion:** Default to a non-landmark wrapper (`div` / `ul` with appropriate presentation) for menu mode, or document that consumers should override `tagName` for menu use.

---

### 9. Root `role="menu"` can lack accessible name

- **WCAG / basis:** 4.1.2
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — fails if neither `aria-label` nor `aria-labelledby` is passed to `Menu`
- **Repro:** Omit both on `<Menu>`; `Menu.tsx` passes `aria-label={undefined}` and `aria-labelledby={undefined}` to the menu container.
- **Issue + impact:** Unnamed menus are harder to distinguish in rotor / when multiple menus exist.
- **Suggestion:** Document as required; optionally warn in dev or default `aria-labelledby` to the trigger when `Menu.Trigger` is used.

---

### 10. `MenuTrigger` `aria-haspopup` uses boolean `true`

- **WCAG / basis:** Best practice / ARIA token usage
- **Severity:** **P3** (enhancement)
- **Scope:** **Component default**
- **Issue + impact:** `aria-haspopup={true}` typically serializes as `aria-haspopup="true"`. Using the token **`menu`** (as `SubMenu` already does) aligns with ARIA 1.x authoring for a menu button.
- **Suggestion:** Set `aria-haspopup="menu"` on `Menu.Trigger` for consistency with `SubMenu`.

---

### 11. Menu arrow navigation does not skip `aria-disabled` items

- **WCAG / basis:** 2.1.1 Keyboard; APG (disabled menu items not focusable or skipped)
- **Severity:** **P2**
- **Scope:** **Component default** when some `Menu.Item` have `disabled`
- **Issue + impact:** `navigateOptions` in `menu/utils.tsx` walks all `DesignSystem-Listbox-ItemWrapper` nodes without checking `data-disabled` / `aria-disabled`, unlike `listbox/utils.ts` which skips disabled rows.
- **Suggestion:** Skip disabled wrappers when moving focus, consistent with APG and listbox behavior.

---

### 12. `Enter` on menu items does not `preventDefault` in menu `handleKeyDown`

- **WCAG / basis:** 2.1.1 Keyboard (edge cases with `<a>` items)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — `MenuItem` default `tagName` is `'a'`; behavior depends on `href` and browser defaults
- **Issue + impact:** If items render as anchors with `href`, Enter might trigger navigation in addition to `click()` / close logic unless default is prevented.
- **Suggestion:** Call `preventDefault()` for Enter when the menu handles activation, or use `button` / `div` with `role="menuitem"` and explicit activation per APG.

---

## Summary

| Severity | Count |
| -------- | ----- |
| P0       | 1     |
| P1       | 5     |
| P2       | 5     |
| P3       | 1     |

**Highest-impact fix:** Decouple menu items from `ListBody`’s **`role="tablist"`** and listbox **`onKeyDown`**, or fork a menu-specific list item so one APG pattern owns roles and keyboard behavior end-to-end.

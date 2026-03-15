# PR Review: feat-combobox-menu-keyboard — Nested menus, Tab, focus

Focus: **nested menu handling**, **focus return to trigger**, **Tab from nested**, **closing entire menu (root + nested) on Tab**.

---

## Problems Identified

### 1. **Missing overlayHelper exports (blocker)**

**Location:** `core/utils/overlayHelper.ts`

- **Menu.tsx** imports `getNextFocusableAfterTrigger` from `@/utils/overlayHelper`, but overlayHelper only exports `getFocusableElements`, `getWrapperElement`, `getUpdatedZIndex`, `closeOnEscapeKeypress`, `handleFocusTrapKeyDown`. **`getNextFocusableAfterTrigger` is not defined.**
- **menu/utils.tsx** and **combobox/utils.tsx** import `getAllFocusableElements(container, role?)` (two arguments, optional role for scoping). overlayHelper only has `getFocusableElements(container)` (one argument, no role).

**Why it violates:** Code does not compile or will throw at runtime when Tab is used or when navigation runs.

**Fix:** Implement and export in `core/utils/overlayHelper.ts`:

1. **`getNextFocusableAfterTrigger(triggerEl, shiftKey, fromContainer?)`**  
   Return the next (or previous if `shiftKey`) focusable element in document order after the trigger, optionally limiting search to a container. Handle `triggerEl == null` (e.g. when nested Menu has no trigger ref) by falling back to document-level next/previous focusable.

2. **`getAllFocusableElements(container, role?)`**  
   Either add an overload that accepts an optional `role` and filters descendants by `role="menu"` or `role="listbox"`, or export an alias that wraps `getFocusableElements` and, when `role` is provided, restricts to elements inside a node with that role. Match current call sites: `getAllFocusableElements(listRef.current, 'menu')` and `getAllFocusableElements(listRef.current, 'listbox')`, and `getAllFocusableElements(subListRef.current)` (no role).

---

### 2. **Tab from nested menu: wrong trigger ref and only submenu closes**

**Location:** `core/components/organisms/menu/Menu.tsx` (handlePopoverKeyDown), nested Menu instance from `SubMenu.tsx`

**What happens:** When focus is inside a **submenu**, the keydown runs on the **inner** Menu’s list (the submenu’s `role="menu"` div). So the **inner** Menu’s `handlePopoverKeyDown` runs, not the root’s.

- The inner Menu’s `menuTriggerRef` is **never set**: the submenu content is a `<Menu trigger={triggerElement}>` and the trigger is passed as a prop. `MenuTrigger` (which assigns `menuTriggerRef`) is not used there, so `menuTriggerRef.current` is always `null`.
- So `getNextFocusableAfterTrigger(menuTriggerRef.current, e.shiftKey, container)` is called with `trigger = null`. Behavior is undefined or wrong.
- Only the **submenu** closes (`setOpenPopover(false)` on the inner Menu). The **root** menu does not close, so the root popover stays open and focus placement is incorrect.

**Why it violates:** WCAG 2.1.2 (Keyboard): Tab from a submenu should close the whole menu system and move focus to the next (or previous) focusable after the **root** trigger, not leave the root open and use a null trigger.

**Fix:**

- **Option A – Root trigger ref in context**  
  Provide the root Menu’s trigger ref and “close root” to nested Menus (e.g. a context set by the root Menu and passed down via SubMenu). In nested Menu’s `handlePopoverKeyDown` on Tab:
  - Call `setOpenPopover(false)` (close submenu).
  - If `SubMenuContext` (or a dedicated “root menu” context) has `closeRoot` / `setParentOpen`, call it to close the root.
  - Use **root** trigger ref with `getNextFocusableAfterTrigger(rootTriggerRef.current, e.shiftKey, …)` and focus that element (or fallback to root trigger).
- **Option B – Bubble Tab to root**  
  When Tab is pressed in a nested menu, don’t handle it in the inner Menu; instead call a callback that the root Menu provides (e.g. via context) so the root runs the same logic (close all, focus next after root trigger). Inner Menu still closes itself and notifies root.

Ensure `handlePopoverKeyDown` in the nested Menu either uses a root trigger ref and closeRoot, or delegates to the root.

---

### 3. **Tab from nested: root menu does not close**

**Location:** `core/components/organisms/menu/Menu.tsx`, `SubMenu.tsx`

**What happens:** Nested Menu only updates its own `openPopover` state. There is no call to the parent’s `setOpenPopover` when closing on Tab (or Escape) from the submenu.

**Fix:** When the **nested** Menu closes (Tab or Escape), it should also close the root. SubMenu already has `setParentOpen: setOpenPopover` from the parent Menu in `SubMenuContext`. The nested Menu (submenu content) is under that provider. So in the nested Menu’s `handlePopoverKeyDown` (and in the Escape path in utils if needed), call the close-from-Tab / close-from-Escape logic and also `React.useContext(SubMenuContext).setParentOpen?.(false)` so the root menu closes.

---

### 4. **Escape from submenu item: possible null ref**

**Location:** `core/components/organisms/menu/utils.tsx` (Escape case)

**What happens:** For a **submenu item** (not the submenu trigger), `isSubMenuTrigger` is false and the code does `menuTriggerRef?.current?.focus()`. In that context, `menuTriggerRef` is the **inner** Menu’s ref, which is never set. So focus might not move.

**Fix:** When handling Escape inside a nested menu, focus the **parent (submenu) trigger** using SubMenuContext’s `triggerRef` or the element found by `parentListRef` + `triggerID`, not the inner Menu’s `menuTriggerRef`. If the intent is “Escape closes submenu and focuses submenu trigger”, use the SubMenu trigger ref from context. If the intent is “Escape from submenu closes only submenu and focuses its trigger”, the same applies. Ensure the ref that is focused is the one actually attached to the SubMenu trigger element (e.g. the focusable part of the trigger item).

---

### 5. **MenuItem submenu trigger focus/blur target**

**Location:** `core/components/organisms/menu/MenuItem.tsx` (useEffect with `handlePopoverClose` / `handlePopoverOpen`)

**What happens:** `triggerElement` is `parentListRef.current.querySelector(\`#${triggerID}\`)?.firstChild`. The node with `id={triggerID}` is the SubMenu’s cloned trigger (a Listbox.Item). Its `firstChild` may not be the focusable element (e.g. if the item wraps content in divs). So the listeners might be attached to a non-focusable node, making open/close-on-focus unreliable.

**Fix:** Attach focus/blur to the **focusable** element: either the node that actually receives focus (e.g. the element with `tabIndex={-1}` or the interactive child), or use `triggerRef` from SubMenuContext if it points to that element. Prefer a single, stable ref to the focusable trigger rather than `firstChild` of a wrapper.

---

### 6. **Select vs Menu: Tab behavior**

**Location:** `core/components/organisms/select/utils.tsx` (Tab case)

Select’s `handleKeyDown` for Tab only clears highlight state and does **not** call `preventDefault()` or move focus. So the browser’s default Tab behavior runs. Select does not use a list-level Tab handler like Menu’s `handlePopoverKeyDown` to close and then focus the next element after the trigger. So Select’s Tab behavior is “release focus to browser” rather than “close and focus next after trigger”. For consistency with Menu and for predictable escape, consider adding a similar Tab handler at the listbox level in Select that closes the popover and focuses the next focusable after the trigger (and ensure overlayHelper is used so both Menu and Select share the same helper).

---

## Positive Aspects

- **ArrowLeft/ArrowRight** submenu open/close and “focus back to parent trigger” logic in `navigateSubMenu` (menu/utils.tsx) is clear and uses placement.
- **`isKeyboardNavigating`** ref to avoid closing on blur during arrow navigation is used correctly in `onToggleHandler` and MenuItem’s `handlePopoverClose`.
- **SubMenuContext** already exposes `setParentOpen` and `parentListRef`/`triggerID`, which is enough to close the root and find the submenu trigger; the missing piece is using them on Tab and for focus.
- **Role-based scoping** for focusable items (`menu` vs `listbox`) is considered in the design (getAllFocusableElements with role); only the implementation is missing in overlayHelper.
- **Tests** for submenu (e.g. “should NOT navigate into closed submenu items with arrow keys”) and structure are in place; they should be extended for Tab and Escape from nested.

---

## Critical Fixes Required

### 1. Implement missing overlayHelper APIs

```typescript
// core/utils/overlayHelper.ts

// Add optional role to scope focusables (e.g. only within [role="menu"] or [role="listbox"])
export function getAllFocusableElements(
  container: HTMLElement,
  role?: 'menu' | 'listbox'
): HTMLElement[] {
  const root = role
    ? container.querySelector(`[role="${role}"]`) ?? container
    : container;
  return getFocusableElements(root as HTMLElement);
}

/**
 * Returns the next (or previous if shiftKey) focusable in document order
 * after the trigger. If trigger is null, searches from document body.
 */
export function getNextFocusableAfterTrigger(
  triggerEl: HTMLElement | null,
  shiftKey: boolean,
  fromContainer?: HTMLElement
): HTMLElement | null {
  const all = fromContainer
    ? getFocusableElements(fromContainer)
    : getFocusableElements(document.body);
  if (all.length === 0) return null;
  const start = triggerEl && all.includes(triggerEl)
    ? all.indexOf(triggerEl)
    : shiftKey ? all.length : -1;
  const nextIndex = shiftKey ? start - 1 : start + 1;
  if (nextIndex < 0 || nextIndex >= all.length) return null;
  return all[nextIndex];
}
```

(Adjust `getNextFocusableAfterTrigger` semantics to match your desired “next after trigger” rule, e.g. if “container” should be the whole document when escaping menus.)

### 2. Nested Menu Tab: close root and use root trigger ref

- Add a way for the root Menu to expose its trigger ref to nested Menus (e.g. a “root menu” context or extend SubMenuContext when provided by root).
- In **Menu.tsx** `handlePopoverKeyDown`, when this is a nested Menu (e.g. `SubMenuContext.menuID` is set), on Tab:
  - `setOpenPopover(false)`.
  - Call `SubMenuContext.setParentOpen?.(false)` to close the root.
  - Resolve **root** trigger ref from context; then `next = getNextFocusableAfterTrigger(rootTriggerRef?.current ?? null, e.shiftKey, document.body)` (or your chosen scope), and `next?.focus({ preventScroll: true })` or fallback to `rootTriggerRef?.current?.focus()`.
- Ensure `getNextFocusableAfterTrigger` is implemented and used as above.

### 3. Escape from submenu item

In **menu/utils.tsx** Escape case, when inside a submenu (e.g. `triggerID` / `parentListRef` present), focus the submenu trigger (e.g. element for `triggerID` inside `parentListRef`, or SubMenuContext’s triggerRef) instead of `menuTriggerRef.current`, so focus returns to the submenu trigger when the inner menu closes.

---

## Testing Required

- [ ] **Unit:** Tab from root menu closes menu and moves focus to next/previous focusable after trigger; Shift+Tab ditto.
- [ ] **Unit:** Tab from **nested** menu closes **both** submenu and root and moves focus to next/previous focusable after **root** trigger.
- [ ] **Unit:** Escape from submenu item closes submenu and focuses submenu trigger; Escape from submenu trigger closes submenu and focuses that trigger (or root item).
- [ ] **Unit:** Nested menu: `getAllFocusableElements` and `getNextFocusableAfterTrigger` exist and are covered (overlayHelper tests).
- [ ] **Integration:** 3-level menu: Tab from deepest level closes all and focus is after root trigger.
- [ ] **Regression:** Root-only menu Tab/Escape and arrow behavior unchanged.

---

## Summary

| Item | Status |
|------|--------|
| Nested menu handling (Arrow Left/Right, focus to trigger) | ⚠️ Largely implemented; Escape from submenu item may use null ref |
| Focus back to trigger in nested | ⚠️ Works for ArrowLeft to parent trigger; Tab and Escape need root/submenu trigger ref and close-parent |
| Tab from nested closing only submenu | ❌ Root does not close; inner Menu uses null trigger ref |
| Tab taking focus out of popover and closing menu with nested | ❌ Blocked by missing `getNextFocusableAfterTrigger` and no root-close + root-trigger focus from nested |
| overlayHelper APIs | ❌ `getNextFocusableAfterTrigger` and `getAllFocusableElements` missing |

**Problems solved:** Tab from **root** menu closes and moves focus when the handler runs; Arrow submenu navigation and blur guard are in place.

**Problems not solved:** Tab/Escape from **nested** menu do not close the root or focus correctly; missing overlayHelper exports prevent correct behavior and likely build/runtime.

**Risk level:** **HIGH** (broken build/runtime without overlayHelper; wrong UX for Tab/Escape from nested).

**Recommendation:** **DO NOT MERGE** until:

1. **overlayHelper** exports `getNextFocusableAfterTrigger` and `getAllFocusableElements` (or equivalent) and Menu/combobox use them.
2. **Nested Menu** on Tab (and optionally Escape) closes the root via `setParentOpen(false)` and moves focus using the **root** trigger ref (or equivalent).
3. **Escape** from a submenu item focuses the submenu trigger (or correct ref), not the inner Menu’s null `menuTriggerRef`.

After that, add tests for Tab and Escape from nested menus and re-run accessibility checks.

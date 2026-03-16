# Nested Menu Keyboard Navigation - Debug Chronicle

Chronological record of issues, failed attempts, and successful fixes for nested menu ESC/ArrowLeft keyboard navigation.

---

## PHASE 1: FOUNDATIONAL KEYBOARD SUPPORT

### Issue 1.1: Initial Focus Not Entering Submenu

**Symptom:** When opening a submenu, focus didn't move to the first item.

### Failed Attempt 1: Assumed MenuItem Was Focusable
- **Approach:** Set `tabIndex={-1}` on MenuItem component
- **Reason Failed:** The inner `<div>` with `data-test="DesignSystem-Listbox-ItemWrapper"` wasn't actually focusable
- **Learning:** The wrapper div isn't inherently focusable - need to target the actual interactive element

### Fix
Changed `focusListItem` to target the parent `<a>` or `<li>` element instead of the wrapper div.

**Files:** `menu/trigger/utils.tsx` `focusListItem` function

---

### Issue 1.2: Submenu Closing During Hover

**Symptom:** Hovering over submenu items caused unwanted behavior due to auto-focus interfering with hover state.

### Failed Approach
- **Approach:** `setHighlightFirstItem(true)` called for all open types including `mouseEnter`
- **Reason Failed:** Auto-focus on hover interfered with natural hover state management
- **Learning:** Mouse and keyboard interactions need separate handling paths

### Fix
Skip `setHighlightFirstItem` when `type === 'mouseEnter'` - only trigger auto-focus for keyboard-initiated opens.

**Files:** `Menu.tsx` `onToggleHandler`

---

### Issue 1.3: Menu Closing During Keyboard Navigation

**Symptom:** After keyboard navigation, moving mouse or clicking outside closed all menus prematurely.

### Failed Attempt 1: Separate Timestamp Refs
- **Approach:** Timestamp-based `lastKeyboardActionTime` with 500ms window
- **Reason Failed:** Each Menu had separate ref - parent/child menus don't share refs, so parent's timestamp was always 0
- **Learning:** Context-based state sharing is essential for parent-child coordination

### Failed Attempt 2: "Sticky Keyboard Mode"
- **Approach:** Block ALL mouse events while in keyboard mode
- **Reason Failed:** Too aggressive - prevented hover after keyboard use, not industry standard
- **Learning:** Grace periods should be narrow in scope (only `outsideClick`), not block all interactions

### Fix
Shared `lastKeyboardActionTime` via MenuContext (inherited from parent), with 150ms grace period applied **only** to `outsideClick` handler.

```typescript
// Check grace period before closing on outsideClick
const timeSince = Date.now() - lastKeyboardActionTime.current;
if (timeSince < 150) {
  return; // Block outsideClick only
}
```

**Files:** `Menu.tsx` (context sharing), `Menu.tsx` `onToggleHandler` (grace period check)

---

### Issue 1.4: ArrowLeft Firing Multiple Times (3-5x per press)

**Symptom:** Single ArrowLeft keypress triggered the handler 3-5 times, causing erratic behavior.

### Failed Attempt 1: Event Propagation Control
- **Approach:** Used `event.stopPropagation()` and `event.nativeEvent.stopImmediatePropagation()`
- **Reason Failed:** React synthetic events with handlers at multiple component levels can't be fully stopped this way
- **Learning:** Event system propagation isn't the issue - need deduplication at application level

### Fix
Added 50ms deduplication guard checking `key + triggerID + timestamp` in `lastNavigationCall` ref.

```typescript
if (lastNavigationCall?.current && 
    lastNavigationCall.current.key === event.key && 
    lastNavigationCall.current.triggerID === triggerID &&
    now - lastNavigationCall.current.timestamp < 50) {
  return; // Skip duplicate
}
```

**Files:** `utils.tsx` `handleKeyDown` (deduplication guard)

---

### Issue 1.5: Escape Not Closing Submenu

**Symptom:** Escape key didn't close submenu as expected.

### Failed Attempt 1: Blur Current Item
- **Approach:** Blur current item, then focus parent trigger
- **Reason Failed:** Blur alone doesn't trigger Popover close in this architecture

### Failed Attempt 2: Reset Timestamp + Simulate Click
- **Approach:** Reset `lastKeyboardActionTime` to 0, then simulate `document.body.click()`
- **Reason Failed:** Assignment `lastKeyboardActionTime.current = 0` didn't work as expected, timestamp showed huge value in logs
- **Learning:** Simulating clicks is fragile and doesn't align with intended state management

### Initial Result
Escape closed EVERYTHING (root + all submenus) instead of just current submenu - this led to Phase 2 investigation.

**Files:** Multiple files - led to complete redesign documented in Phase 2

---

### Issue 1.6: Tab Not Moving to Next Focusable Element

**Symptom:** Tab closed menu but didn't move focus to next element outside the menu.

### Failed Attempt 1: Don't Prevent Default
- **Approach:** Removed `event.preventDefault()` on Tab key
- **Reason Failed:** Still didn't work, `outsideClick` fired and closed everything without proper focus transition
- **Learning:** Tab needs to close menus AND allow natural focus movement - needs coordination with close handlers

### Fix
Close all menus on Tab but allow default behavior to proceed for natural focus movement.

```typescript
case 'Tab':
  setOpenPopover?.(false); // Close menus
  // Don't prevent default - let Tab work naturally
  break;
```

**Files:** `utils.tsx` `handleKeyDown` Tab case

---

## PHASE 2: NESTED NAVIGATION REFINEMENT

### Issue 2.1: ESC and ArrowLeft Closing All Menus Instead of One Level

### Issue 2.1: ESC and ArrowLeft Closing All Menus Instead of One Level

**Symptom:** Pressing ESC or ArrowLeft in a nested submenu closed all menus instead of just the current level and focusing the parent trigger.

#### Failed Attempt 1: Detection Logic
- **Approach:** Initial review suspected the submenu detection logic was broken (`triggerID` check not working)
- **Reason Failed:** Runtime evidence showed detection logic actually worked correctly - logs confirmed `triggerID` was found and focus was called
- **Learning:** Static analysis missed the real issue - focus was being called but then immediately stolen

#### Root Cause Identified: Ref Isolation Bug
The pattern `parentContext.lastKeyboardActionTime || React.useRef<number>(0)` created a **new ref on every render** for nested components, breaking shared state between root and nested menus.

**Sequence of failure:**
1. ESC in submenu → updates nested menu's `lastKeyboardActionTime` ref
2. Focuses parent trigger → triggers `outsideClick` on root menu
3. Root menu checks *its own separate ref* (not updated) → grace period fails
4. Root closes, stealing focus back

#### Fix
```typescript
// Before (creates new ref every render):
const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || React.useRef<number>(0);

// After (stable ref):
const ownKeyboardTimeRef = React.useRef<number>(0);
const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || ownKeyboardTimeRef;
```

**Files:** `Menu.tsx` line 75-78

---

### Issue 2.2: Same Ref Isolation Bug for `lastNavigationCall`

**Symptom:** Same pattern existed for duplicate navigation detection ref.

#### Fix
Applied identical solution as Issue 2.1 to `lastNavigationCall` ref.

```typescript
const ownNavigationCallRef = React.useRef<{...} | null>(null);
const lastNavigationCall = parentContext.lastNavigationCall || ownNavigationCallRef;
```

**Files:** `Menu.tsx` line 80-85

---

### Issue 2.3: `ReferenceError: lastKeyboardActionTime is not defined`

**Symptom:** Test failures - `navigateSubMenu` function tried to access `lastKeyboardActionTime` but it was undefined in its scope.

#### Failed Attempt 1: Closure Scope Assumption
- **Approach:** Assumed `lastKeyboardActionTime` was available in closure from parent function
- **Reason Failed:** Function parameters create their own scope, variable wasn't passed in

#### Fix
Added `lastKeyboardActionTime` as explicit parameter to `navigateSubMenu` and updated all call sites.

```typescript
const navigateSubMenu = (
  // ... other params
  lastKeyboardActionTime?: React.MutableRefObject<number> // NEW
) => { ... };

// Call sites:
navigateSubMenu(..., lastKeyboardActionTime);
```

**Files:** `utils.tsx` - function signature and 2 call sites in `handleKeyDown`

---

### Issue 2.4: "Could not find parent trigger" Despite Element Found

**Symptom:** Logs showed `foundById=true` but `querySelector('[role="menuitem"]')` returned null.

#### Failed Attempt 1: Single querySelector Strategy
- **Approach:** Assumed `triggerID` element always had a child with `role="menuitem"`
- **Reason Failed:** DOM structure varies - sometimes the element with the ID **is** the menuitem, not a wrapper with menuitem child

#### Fix: Multi-Strategy Element Search
Try 3 approaches in order:
1. **Child query:** Look for `[role="menuitem"]` descendant
2. **Wrapper itself:** Check if element with ID has `role="menuitem"`
3. **Closest ancestor:** Use `closest('[role="menuitem"]')`

Added strategy logging to identify which approach actually works.

**Files:** `utils.tsx` - Both Escape handler and `navigateSubMenu` ArrowLeft handler

**Result:** Strategy logs revealed `wrapper-itself` is the winning approach - the element with `triggerID` **is** the menuitem.

---

### Issue 2.5: ESC Handler Focus Lost During DOM Changes

**Symptom:** ESC worked with multi-strategy search in `navigateSubMenu` (ArrowLeft) but not in Escape handler despite having same code.

#### Failed Attempt 1: Assumed Search Logic Was Different
- **Approach:** Re-checked element search logic
- **Reason Failed:** Logic was identical - issue was timing, not search

#### Root Cause: Operation Order
ESC handler closed submenu BEFORE focusing parent:
```typescript
setOpenPopover(false);  // DOM changes
submenuTrigger.focus(); // Element might be unmounting
```

#### Fix: Focus First, Close Second
```typescript
submenuTrigger.focus();  // Focus while element still exists
setOpenPopover(false);   // Then close
```

**Files:** `utils.tsx` Escape handler (lines 107-154)

---

### Issue 2.6: ESC from Nested SubMenu Trigger Closes All Menus

**Symptom:** After ArrowLeft from 3rd→2nd level (to "User Management" SubMenu trigger), pressing ESC showed `triggerID=undefined` and closed all menus.

#### Root Cause: SubMenu Context Inheritance
SubMenu triggers passed `undefined, undefined` for `triggerID` and `parentListRef` to `handleKeyDown`, even when they themselves were inside a parent submenu.

**Hierarchy:**
```
Root Menu
  └─ System Admin (SubMenu, needs parent context)
      └─ User Management (SubMenu inside SubMenu, needs parent context)
```

#### Fix: Read Parent SubMenuContext
```typescript
const parentSubMenuContext = React.useContext(SubMenuContext);

handleKeyDown(
  // ...
  parentSubMenuContext.triggerID,      // Instead of undefined
  parentSubMenuContext.parentListRef,  // Instead of undefined
  // ...
);
```

**Files:** `SubMenu.tsx` line 25 (read context), lines 51-52 (pass to handleKeyDown)

---

### Issue 2.7: ArrowLeft Works from Regular Items But Not SubMenu Triggers

**Symptom:** ArrowLeft from 3rd level item → focuses 2nd level trigger ✅. But ArrowLeft from 2nd level SubMenu trigger → does nothing ❌. ESC worked correctly for both.

#### Root Cause: Case 2 Logic Too Restrictive
```typescript
if (!isSubMenuTrigger && triggerID && parentListRef?.current) {
```

This only ran for **regular MenuItems**. SubMenu triggers (`isSubMenuTrigger=true`) were excluded, even when they had parent context.

#### Fix: Remove SubMenu Trigger Exclusion
```typescript
// Case 2 now applies to:
// - Regular MenuItems inside a submenu
// - SubMenu triggers inside a parent submenu
if (triggerID && parentListRef?.current) {
  const isGoingBackDirection = 
    (direction === 'left' && menuPlacement?.includes('right')) ||
    (direction === 'right' && menuPlacement?.includes('left'));
  
  if (isGoingBackDirection) {
    // Focus parent trigger logic
  }
}
```

**Files:** `utils.tsx` `navigateSubMenu` Case 2 condition (lines 273-282)

---

## PHASE 3: COMBOBOX FOCUS FIX

### Issue 3.1: ArrowDown Not Focusing First Combobox Item

**Symptom:** Pressing ArrowDown in Combobox input opened the list but didn't focus the first item.

#### Root Cause: Effect Dependency Race Condition
The effect watching `highlightFirstItem` only had `[highlightFirstItem]` in dependencies. When ArrowDown was pressed:
1. `setHighlightFirstItem(true)` and `setOpenPopover(true)` called
2. Effect runs when `highlightFirstItem` changes, but `openPopover` might still be `false`
3. Effect checks `if (highlightFirstItem && openPopover)` → condition fails
4. Later `openPopover` changes to `true`, but effect doesn't re-run (dependency unchanged)

#### Fix: Add openPopover to Dependencies
```typescript
// Before:
}, [highlightFirstItem]);

// After:
}, [highlightFirstItem, openPopover]);
```

Applied to both `highlightFirstItem` and `highlightLastItem` effects.

**Files:** `Combobox.tsx` lines 227-237

---

## Summary of All Fixes

### Phase 1: Foundational Keyboard Support
1. **Focus Target:** Changed `focusListItem` to target parent `<a>`/`<li>` elements
2. **Hover vs Keyboard:** Skip auto-focus when `type === 'mouseEnter'`
3. **Grace Period:** Shared `lastKeyboardActionTime` via context, 150ms grace for `outsideClick` only
4. **Deduplication:** Added 50ms guard checking `key + triggerID + timestamp`
5. **Tab Behavior:** Close all menus on Tab but allow default focus movement

### Phase 2: Nested Navigation Refinement
6. **Ref Isolation:** Changed conditional `useRef` pattern to stable refs for both `lastKeyboardActionTime` and `lastNavigationCall`
7. **Parameter Passing:** Added `lastKeyboardActionTime` parameter to `navigateSubMenu`
8. **Element Search:** Multi-strategy approach for finding focusable parent trigger (winner: `wrapper-itself`)
9. **Operation Order:** Focus parent BEFORE closing submenu in ESC handler
10. **Context Inheritance:** SubMenu reads parent's SubMenuContext and passes it down
11. **Case Logic:** Removed `!isSubMenuTrigger` restriction from ArrowLeft parent navigation

### Phase 3: Combobox
12. **Effect Dependencies:** Added `openPopover` to effect dependencies for both ArrowUp and ArrowDown focus behaviors

---

## Testing Evidence

### Working Scenarios (from logs)
✅ **Phase 1:** Auto-focus on ArrowDown, hover works, grace period blocks premature close, no duplicate navigation
✅ **Phase 2 - 2-level ESC:** "System Admin" → submenu → ESC → focuses "System Admin"
✅ **Phase 2 - 2-level ArrowLeft:** Same behavior as ESC
✅ **Phase 2 - 3-level ESC:** Nested submenu → ESC → focuses parent trigger at each level
✅ **Phase 2 - 3-level ArrowLeft:** Works after Fix #11
✅ **Phase 2 - Strategy detection:** Logs show `wrapper-itself` is the consistent winner
✅ **Phase 3 - Combobox:** ArrowDown focuses first item, ArrowUp focuses last item

### Key Log Indicators
- `⏱️ onToggle BLOCKED: outsideClick grace period` - Grace period working
- `strategy: wrapper-itself` - Element found and focused
- `triggerID=<value>` in Escape logs - Parent context correctly propagated
- `🔍 After focus - activeElement="..."` - Focus confirmation

---

## Remaining Work
- [ ] Remove debug instrumentation after final testing
- [ ] Consider simplifying to single element search strategy (wrapper-itself only)
- [ ] Add unit tests for all nested scenarios
- [ ] Update documentation with nested keyboard behavior
- [ ] Push Combobox fix to remote

# Nested Menu Keyboard Navigation - Debug Chronicle

Chronological record of issues, failed attempts, and successful fixes for nested menu ESC/ArrowLeft keyboard navigation.

---

## Issue 1: ESC and ArrowLeft Closing All Menus Instead of One Level

**Symptom:** Pressing ESC or ArrowLeft in a nested submenu closed all menus instead of just the current level and focusing the parent trigger.

### Failed Attempt 1: Detection Logic
- **Approach:** Initial review suspected the submenu detection logic was broken (`triggerID` check not working)
- **Reason Failed:** Runtime evidence showed detection logic actually worked correctly - logs confirmed `triggerID` was found and focus was called
- **Learning:** Static analysis missed the real issue - focus was being called but then immediately stolen

### Root Cause Identified: Ref Isolation Bug
The pattern `parentContext.lastKeyboardActionTime || React.useRef<number>(0)` created a **new ref on every render** for nested components, breaking shared state between root and nested menus.

**Sequence of failure:**
1. ESC in submenu → updates nested menu's `lastKeyboardActionTime` ref
2. Focuses parent trigger → triggers `outsideClick` on root menu
3. Root menu checks *its own separate ref* (not updated) → grace period fails
4. Root closes, stealing focus back

### Fix
```typescript
// Before (creates new ref every render):
const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || React.useRef<number>(0);

// After (stable ref):
const ownKeyboardTimeRef = React.useRef<number>(0);
const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || ownKeyboardTimeRef;
```

**Files:** `Menu.tsx` line 75-78

---

## Issue 2: Same Ref Isolation Bug for `lastNavigationCall`

**Symptom:** Same pattern existed for duplicate navigation detection ref.

### Fix
Applied identical solution as Issue 1 to `lastNavigationCall` ref.

```typescript
const ownNavigationCallRef = React.useRef<{...} | null>(null);
const lastNavigationCall = parentContext.lastNavigationCall || ownNavigationCallRef;
```

**Files:** `Menu.tsx` line 80-85

---

## Issue 3: `ReferenceError: lastKeyboardActionTime is not defined`

**Symptom:** Test failures - `navigateSubMenu` function tried to access `lastKeyboardActionTime` but it was undefined in its scope.

### Failed Attempt 1: Closure Scope Assumption
- **Approach:** Assumed `lastKeyboardActionTime` was available in closure from parent function
- **Reason Failed:** Function parameters create their own scope, variable wasn't passed in

### Fix
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

## Issue 4: "Could not find parent trigger" Despite Element Found

**Symptom:** Logs showed `foundById=true` but `querySelector('[role="menuitem"]')` returned null.

### Failed Attempt 1: Single querySelector Strategy
- **Approach:** Assumed `triggerID` element always had a child with `role="menuitem"`
- **Reason Failed:** DOM structure varies - sometimes the element with the ID **is** the menuitem, not a wrapper with menuitem child

### Fix: Multi-Strategy Element Search
Try 3 approaches in order:
1. **Child query:** Look for `[role="menuitem"]` descendant
2. **Wrapper itself:** Check if element with ID has `role="menuitem"`
3. **Closest ancestor:** Use `closest('[role="menuitem"]')`

Added strategy logging to identify which approach actually works.

**Files:** `utils.tsx` - Both Escape handler and `navigateSubMenu` ArrowLeft handler

**Result:** Strategy logs revealed `wrapper-itself` is the winning approach - the element with `triggerID` **is** the menuitem.

---

## Issue 5: ESC Handler Focus Lost During DOM Changes

**Symptom:** ESC worked with multi-strategy search in `navigateSubMenu` (ArrowLeft) but not in Escape handler despite having same code.

### Failed Attempt 1: Assumed Search Logic Was Different
- **Approach:** Re-checked element search logic
- **Reason Failed:** Logic was identical - issue was timing, not search

### Root Cause: Operation Order
ESC handler closed submenu BEFORE focusing parent:
```typescript
setOpenPopover(false);  // DOM changes
submenuTrigger.focus(); // Element might be unmounting
```

### Fix: Focus First, Close Second
```typescript
submenuTrigger.focus();  // Focus while element still exists
setOpenPopover(false);   // Then close
```

**Files:** `utils.tsx` Escape handler (lines 107-154)

---

## Issue 6: ESC from Nested SubMenu Trigger Closes All Menus

**Symptom:** After ArrowLeft from 3rd→2nd level (to "User Management" SubMenu trigger), pressing ESC showed `triggerID=undefined` and closed all menus.

### Root Cause: SubMenu Context Inheritance
SubMenu triggers passed `undefined, undefined` for `triggerID` and `parentListRef` to `handleKeyDown`, even when they themselves were inside a parent submenu.

**Hierarchy:**
```
Root Menu
  └─ System Admin (SubMenu, needs parent context)
      └─ User Management (SubMenu inside SubMenu, needs parent context)
```

### Fix: Read Parent SubMenuContext
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

## Issue 7: ArrowLeft Works from Regular Items But Not SubMenu Triggers

**Symptom:** ArrowLeft from 3rd level item → focuses 2nd level trigger ✅. But ArrowLeft from 2nd level SubMenu trigger → does nothing ❌. ESC worked correctly for both.

### Root Cause: Case 2 Logic Too Restrictive
```typescript
if (!isSubMenuTrigger && triggerID && parentListRef?.current) {
```

This only ran for **regular MenuItems**. SubMenu triggers (`isSubMenuTrigger=true`) were excluded, even when they had parent context.

### Fix: Remove SubMenu Trigger Exclusion
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

## Summary of Fixes

1. **Ref Isolation:** Changed conditional `useRef` pattern to stable refs in `Menu.tsx`
2. **Parameter Passing:** Added `lastKeyboardActionTime` parameter to `navigateSubMenu`
3. **Element Search:** Multi-strategy approach for finding focusable parent trigger
4. **Operation Order:** Focus parent BEFORE closing submenu in ESC handler
5. **Context Inheritance:** SubMenu reads parent's SubMenuContext and passes it down
6. **Case Logic:** Removed `!isSubMenuTrigger` restriction from ArrowLeft parent navigation

---

## Testing Evidence

### Working Scenarios (from logs)
✅ **2-level ESC:** "System Admin" → submenu → ESC → focuses "System Admin"
✅ **2-level ArrowLeft:** Same behavior as ESC
✅ **3-level ESC:** Nested submenu → ESC → focuses parent trigger at each level
✅ **3-level ArrowLeft:** Now works after Fix #7
✅ **Strategy detection:** Logs show `wrapper-itself` is the consistent winner

### Key Log Indicators
- `⏱️ onToggle BLOCKED: outsideClick grace period` - Grace period working
- `strategy: wrapper-itself` - Element found and focused
- `triggerID=<value>` in Escape logs - Parent context correctly propagated

---

## Remaining Work
- [ ] Remove debug instrumentation after final testing
- [ ] Consider simplifying to single element search strategy (wrapper-itself only)
- [ ] Add unit tests for all nested scenarios
- [ ] Update documentation with nested keyboard behavior

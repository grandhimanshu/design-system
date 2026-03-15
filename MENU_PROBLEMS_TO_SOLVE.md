# Menu-Related Problems to Solve

## Related Branches with Menu Changes

### Local Branches 
- `feat-combobox-menu-keyboard` ⭐ (current branch) - Combobox and Menu keyboard accessibility
- `feat-keyboard-a11y` - Select keyboard a11y, listbox, popover trap
- `feat-keyboard-a11y-backup-focusOrder` - Backup of focus order work
- `feat/toast-keyboard` - Toast keyboard navigation

### Remote Branches with Menu/Keyboard Work
- `origin/feat-combobox-menu-keyboard` - Main keyboard work for Menu and Combobox
- `origin/feat-keyboard-a11y` - Keyboard accessibility improvements
- `origin/feat-keyboard-a11y-backup-focusOrder` - Focus order backup
- `origin/feat-keyboard-combined` - Combined keyboard improvements
- `origin/feat-popover-ally` - Popover accessibility (Menu uses Popover)
- `origin/backup/keyboard-all-fixes-20260313` - Backup of all keyboard fixes
- `origin/feat-editable-family-keyboard` - Editable components keyboard
- `origin/feat/calendar-keyboard-navigation` - Calendar keyboard navigation
- `origin/keyboard-all-fixes` - All keyboard fixes combined

---

## Issues & Branches Summary

| # | Issue | Current Branch | Works in |
|---|-------|----------------|----------|
| 1 | **Tab Key Navigation** - Tab/Shift+Tab escape from menu/combobox, edge cases with nested submenus, focus management after closing | ✓ | • `feat-combobox-menu-keyboard`<br>• `origin/feat-keyboard-a11y`<br>• `origin/keyboard-all-fixes` |
| 2 | **Home/End Key Support** - Jump to first/last item in Menu (implemented), missing in Combobox | ❓ | • `feat-combobox-menu-keyboard`<br>• `origin/feat-combobox-menu-keyboard` |
| 3 | **Submenu Navigation** - ArrowLeft/Right open/close submenus based on placement, complex nested menu logic | ✓ | • `feat-combobox-menu-keyboard`<br>• `origin/feat-combobox-menu-keyboard` |
| 4 | **Focus Management** - tabIndex consistency, role scoping (menu vs listbox), prevent double key handling | ✓ | • `feat-combobox-menu-keyboard`<br>• `feat-keyboard-a11y`<br>• `origin/feat-keyboard-combined`<br>• `origin/keyboard-all-fixes` |
| 5 | **Space Key Handling** - Prevent page scroll, consistent activation across Menu/Combobox | ✓ | • `feat-combobox-menu-keyboard`<br>• `origin/feat-combobox-menu-keyboard` |
| 6 | **Combobox-Specific** - Multi-select Enter behavior, typing/filtering, Backspace/Delete chip removal | ❓ | • `feat-combobox-menu-keyboard`<br>• `origin/feat-combobox-menu-keyboard` |
| 7 | **Testing Coverage** - Missing tests for submenus, disabled items, Shift+Tab, edge cases | ❓ | • `feat-combobox-menu-keyboard` |
| 8 | **Documentation** - Missing Home/End docs for Combobox, Tab behavior details, disabled items behavior | ❓ | • `feat-combobox-menu-keyboard` |

---

## Current Branch: `feat-combobox-menu-keyboard`

### Changes in This Branch
- Keyboard accessibility implementation for Menu and Combobox
- Tab-escape functionality
- Enter/Space activation
- Home/End navigation
- Arrow key navigation improvements
- Submenu keyboard navigation with directional arrows

---

## Key Components Involved

1. **Menu Component** (`core/components/organisms/menu/`)
   - Menu.tsx
   - MenuItem.tsx
   - SubMenu.tsx
   - MenuTrigger.tsx
   - utils.tsx

2. **Combobox Component** (`core/components/organisms/combobox/`)
   - utils.tsx (keyboard handling)

3. **Listbox Component** (`core/components/organisms/listbox/`)
   - Shared by both Menu and Combobox
   - ListboxItem.tsx
   - ListBody.tsx

---

## Problems to Solve

### 1. **Tab Key Navigation Issues**

#### Problem Description
From interactions documentation and current implementation:
- **Menu**: Tab from trigger should focus trigger, then move to next element
- **Menu Item**: Tab from open menu should close popover and move focus to next element after trigger (or back to trigger if no next element)
- **Combobox**: Tab from listbox item should close popover, return focus to input, then pressing Tab again moves to next element

#### Current State
- Menu: Implemented in `Menu.tsx` (lines 110-124) and `utils.tsx` (line 55-56)
- Combobox: Implemented in `combobox/utils.tsx` (lines 34-38)
- Issue: Tab key behavior might need further testing for edge cases with nested submenus

#### Verification Needed
- [ ] Test Tab behavior with nested submenus
- [ ] Test Tab with Shift+Tab (reverse)
- [ ] Test when there's no next focusable element after trigger
- [ ] Ensure consistent behavior between Menu and Combobox

---

### 2. **Home/End Key Support**

#### Problem Description
From interactions documentation:
- **Menu**: Home/End should jump to first/last focusable item
- **Combobox**: Documentation doesn't mention Home/End, but it's a common pattern

#### Current State
- Menu: Implemented in `menu/utils.tsx` (lines 28-34)
- Combobox: NOT implemented in `combobox/utils.tsx`

#### Tasks
- [ ] Verify Menu Home/End works correctly
- [ ] Add Home/End support to Combobox
- [ ] Update Combobox interactions documentation to include Home/End
- [ ] Add tests for Home/End in both components

---

### 3. **Submenu Navigation Issues**

#### Problem Description
From interactions documentation (lines 102-145 in menu/interactions.mdx):
- Complex navigation rules for nested submenus
- Arrow keys should open/close submenus based on placement (left/right)
- Different behavior when submenu is on left vs right side

#### Current State
- Implemented in `menu/utils.tsx` (lines 99-159)
- Uses `data-placement` attribute to determine submenu position
- Uses `isKeyboardNavigating` flag to prevent blur handlers from closing menu during navigation

#### Issues to Verify
- [ ] Test submenu navigation with different placements (left/right/top/bottom)
- [ ] Verify submenu stays open during keyboard navigation
- [ ] Test nested submenus (3+ levels deep)
- [ ] Ensure ArrowLeft/Right do nothing when no submenu exists
- [ ] Test focus management when moving between parent and child items

---

### 4. **Focus Management Consistency**

#### Problem Description
Multiple components share focus management logic but may have inconsistencies:
- `getAllFocusableElements` used in both Menu and Combobox
- Different role scoping: 'menu' vs 'listbox'
- tabIndex management across components

#### Current State
- Menu uses `role="menu"` scoping (menu/utils.tsx line 78)
- Combobox uses `role="listbox"` scoping (combobox/utils.tsx line 79)
- Listbox items have tabIndex=-1 by default

#### Recent Related Commits
- `851adb7f` - fix(listbox): preserve default tabIndex for standalone Listbox items
- `31adbc68` - fix(listbox): apply tabIndex to outer Tag for Menu/ARIA semantics
- `a733565c` - fix(listbox): suppressKeyboard prop to prevent double key handling

#### Tasks
- [ ] Verify tabIndex is correctly set on all focusable items
- [ ] Ensure no double keyboard event handling
- [ ] Test focus visibility (focus rings)
- [ ] Verify focus doesn't get trapped unexpectedly
- [ ] Check focus management in submenus

---

### 5. **Space Key Handling Standardization**

#### Problem Description
From recent commits:
- `e9df998d` - refactor: standardize Space key handling and keyboard architecture

#### Current State
- Menu handles both ' ' (space) and 'Spacebar' (menu/utils.tsx lines 40-44)
- Uses preventDefault() to prevent scrolling
- Activates item via click()

#### Tasks
- [ ] Verify Space key doesn't scroll the page
- [ ] Ensure consistent Space handling across Menu and Combobox
- [ ] Test Space in input fields (Combobox) - should type space, not activate
- [ ] Test Space on menu items - should activate

---

### 6. **Disabled Items Handling**

#### Problem Description
From commits:
- `88d538d8` - feat(menu): add disabled state in menu
- Disabled items should be skipped during keyboard navigation

#### Current State
- MenuItem has `disabled` prop (MenuItem.tsx line 29)
- `aria-disabled` attribute set (MenuItem.tsx line 152)
- onClick handler checks disabled state (MenuItem.tsx line 134-136)

#### Issues to Verify
- [ ] Verify disabled items are skipped in keyboard navigation (ArrowUp/Down)
- [ ] Ensure Home/End don't land on disabled items
- [ ] Test visual feedback (disabled items should be visible but not focusable)
- [ ] Verify screen reader announces disabled state


---

### 8. **Combobox-Specific Issues**

#### Problem Description
Combobox has unique behaviors not present in Menu:
- Typing should filter options
- Enter in multi-select should not close popover
- Backspace/Delete should edit value or remove chips

#### Current State
- Tab returns focus to input (combobox/utils.tsx line 37)
- Enter in multi-select focuses first item after selection (combobox/utils.tsx lines 62-65)
- No Home/End support

#### Tasks
- [ ] Add Home/End keys to Combobox
- [ ] Verify Tab behavior matches documentation
- [ ] Test multi-select specific behaviors
- [ ] Ensure typing doesn't interfere with keyboard navigation
- [ ] Test Escape key behavior (close popover, clear filter)

---

### 9. **Testing Coverage**

#### Current State
Tests exist in:
- `menu/__tests__/Menu.test.tsx` (keyboard tests added lines 630-728)
- `menu/__tests__/utils.test.tsx`
- `combobox/__tests__/utils.test.tsx`
- `listbox/__tests__/Listbox.test.tsx`

#### Recent Test Additions (feat-combobox-menu-keyboard)
- Space key activation
- Enter key activation
- Home/End navigation
- Tab escape behavior

#### Missing Tests
- [ ] Submenu keyboard navigation tests
- [ ] Disabled items skip tests
- [ ] Shift+Tab reverse navigation
- [ ] Home/End for Combobox
- [ ] Multi-level submenu navigation
- [ ] Focus trap prevention
- [ ] Edge cases (empty menus, single item, all disabled)

---

### 10. **Documentation Updates**

#### Current State
- Menu interactions documentation updated (docs/src/pages/components/menu/interactions.mdx)
- Combobox interactions documentation exists (docs/src/pages/components/combobox/interactions.mdx)

#### Missing Documentation
- [ ] Home/End keys for Combobox
- [ ] Tab behavior details for Combobox (return to input, then move to next)
- [ ] Space key behavior differences (Menu vs Combobox input)
- [ ] Disabled items keyboard behavior
- [ ] Submenu navigation examples/diagrams

---

## Priority Order

### High Priority (Must Fix)
1. **Tab Navigation Edge Cases** - Critical for accessibility
2. **Focus Management Consistency** - Prevents focus traps
3. **Disabled Items Handling** - WCAG requirement
4. **ARIA Semantics** - Screen reader accessibility

### Medium Priority (Should Fix)
5. **Home/End for Combobox** - Expected behavior by power users
6. **Submenu Navigation Verification** - Complex but documented
7. **Testing Coverage** - Prevent regressions

### Low Priority (Nice to Have)
8. **Documentation Updates** - Polish existing work
9. **Space Key Edge Cases** - Mostly working, minor refinements
10. **Combobox-Specific Refinements** - Component-specific improvements

---

## Related Branches to Check

Based on git history, these branches may have related work:

1. **feat-keyboard-a11y** - Select keyboard a11y, listbox, popover trap
2. **feat-keyboard-combined** - Combined keyboard improvements
3. **feat-popover-ally** - Popover accessibility improvements
4. **backup/keyboard-all-fixes-20260313** - Backup of keyboard fixes

---


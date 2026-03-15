# Branch-by-Branch Menu Code Findings

## Executive Summary

- **Total branches checked:** 10
- **Branches with menu-related commits:** 10 (all share same menu file set; differing commit histories)
- **Total menu commits analyzed (across all refs):** 40 touching `**/menu/**`; 7 touching `**/menu/__stories__/**`
- **Unique story files found:** Same set on all branches (nesting.story.jsx, overflow/nesting.story.jsx, all.story.jsx, State.story.jsx, grouping/*, overflow/*, size/*, trigger/*, type/*, variant/*)
- **Maximum nesting level found:** 2 levels (root Menu → SubMenu → inner Menu with items)
- **Multi-level (3+) nesting found:** **NO**

---

## Branch Inventory

### All 10 Branches Checked

#### LOCAL BRANCHES (3)

1. `feat-combobox-menu-keyboard` (current)
2. `feat-keyboard-a11y`
3. `feat-keyboard-a11y-backup-focusOrder`

#### REMOTE BRANCHES (7)

4. `origin/feat-combobox-menu-keyboard`
5. `origin/feat-keyboard-a11y`
6. `origin/feat-keyboard-a11y-backup-focusOrder`
7. `origin/feat-keyboard-combined`
8. `origin/keyboard-all-fixes`
9. `origin/backup/keyboard-all-fixes-20260313`
10. `origin/feat-popover-ally`

---

## Detailed Branch Analysis

### Branch 1: feat-combobox-menu-keyboard (current)

**Menu commits (most recent first):**

- `b66ed418` feat(combobox,menu): keyboard accessibility — Tab-escape, Enter/Space, Home/End
- `1c86d5b7` feat(horizontalNav): add a11y support in horizontal nav
- `f3bace0c` feat(menu): add small variant support in menu component
- `ae97d17f` feat(tokens): update spacing tokens
- `89d1304c` feat(menu): add disabled state in menu
- … (plus shared history: 6509c9da, e91b1cf1, 6d44f718, 1085fe69, c2e3b5a1, 09c7f087, 3a26576d, e2ab96d9, 4b2f4239, 088a90e4, 23473923, 0184d311, 19010c36)

**Story files:**

- nesting.story.jsx (2 levels: Menu → SubMenu → Menu with List)
- overflow/nesting.story.jsx (2 levels)
- all.story.jsx, State.story.jsx, grouping/*, overflow/overflow.story.jsx, size/*, trigger/*, type/*, variant/*

**Test coverage:**

- Menu.test.tsx: snapshot (default, with Nesting, with Trigger), grouping, keyboard (Enter, Space, Arrow keys, Home, End, Tab close), submenu ArrowRight/Left
- utils.test.tsx: handleKeyDown (Arrow, Tab, Escape, Enter, Space, submenu navigation), trigger key handling, Tab/Escape closing

**Unique implementations:**

- `isKeyboardNavigating` ref to prevent blur during arrow navigation
- Tab escape via `getNextFocusableAfterTrigger(menuTriggerRef.current, e.shiftKey, container)`
- Home/End keys in `utils.tsx` handleKeyDown
- Space key activates items; Enter/Space open trigger (trigger utils)
- onToggleHandler(open, type) guards close when `type === 'onBlur' && isKeyboardNavigating.current`

**Notes:** Only branch (with origin/feat-combobox-menu-keyboard and origin/feat-keyboard-combined) that has commit `b66ed418` (single consolidated keyboard a11y commit).

---

### Branch 2: origin/feat-combobox-menu-keyboard

Same story set and implementation as current branch. Same menu commit list as feat-combobox-menu-keyboard (includes b66ed418). No divergence.

---

### Branch 3: feat-keyboard-a11y

**Menu commits:** Same as origin/feat-keyboard-a11y (no b66ed418). No keyboard menu-specific commit; stops at shared history (horizontalNav, small variant, tokens, disabled, etc.).

**Story files:** Identical to current (same paths and nesting depth).

**Unique implementations:** None for menu keyboard; no `isKeyboardNavigating`, no Tab escape, no Home/End in Menu.

---

### Branch 4: origin/feat-keyboard-a11y

Same as feat-keyboard-a11y. No menu keyboard a11y commit.

---

### Branch 5: origin/feat-keyboard-a11y-backup-focusOrder

Same menu history as origin/feat-keyboard-a11y. Same story set. No keyboard menu-specific changes.

---

### Branch 6: origin/feat-keyboard-combined

**Menu commits:** Includes b66ed418 (same as current). Same effective menu implementation as feat-combobox-menu-keyboard.

**Story files:** Same set, 2-level nesting only.

---

### Branch 7: origin/keyboard-all-fixes

**Menu commits (differ from current):**

- `6b5c6416` refactor: standardize Space key handling and keyboard architecture
- `e9df998d` feat(combobox,menu): keyboard a11y — Tab-escape, Enter/Space, Home/End
- `57dbf993` feat(combobox,menu): keyboard a11y — Tab-escape, Enter/Space, Home/End
- Then shared: 1c86d5b7, f3bace0c, …

**Unique vs current:** Three commits not in feat-combobox-menu-keyboard: 6b5c6416, e9df998d, 57dbf993. Likely same keyboard behavior with a different refactor (e.g. Space handling standardized in a separate commit).

**Story files:** Same. 2-level nesting.

---

### Branch 8: origin/backup/keyboard-all-fixes-20260313

Same menu commit list as origin/keyboard-all-fixes (6b5c6416, e9df998d, 57dbf993, then shared). Backup branch.

---

### Branch 9: origin/feat-popover-ally

**Menu commits:** No b66ed418; no menu-specific keyboard commits. Menu history stops at f3bace0c (small variant) and shared history.

**Story files:** Same set. nesting.story.jsx and overflow/nesting.story.jsx both 2-level (SubMenu → Menu position="right-start" → Menu.List).

**Notes:** FocusScopeManager / DismissableLayerManager not found in this repo; feat-popover-ally may be popover/overlay-focused elsewhere. No unique menu implementation identified.

---

## Commit-by-Commit Analysis (Priority Branches)

### feat-combobox-menu-keyboard (current)

**Unique menu commit:**

1. **b66ed418** – feat(combobox,menu): keyboard accessibility — Tab-escape, Enter/Space, Home/End  
   - **Files changed:** Menu.tsx, MenuContext.tsx, MenuItem.tsx, SubMenu.tsx, Menu.test.tsx, Menu.test.tsx.snap, utils.tsx, interactions.mdx  
   - **Story changes:** None  
   - **Nesting depth:** N/A (implementation only)  
   - **Summary:** Adds isKeyboardNavigating, Tab escape with getNextFocusableAfterTrigger, Home/End, Space/Enter behavior, and tests.

### origin/keyboard-all-fixes

**Menu commits not in current:**

1. **57dbf993** – feat(combobox,menu): keyboard a11y — Tab-escape, Enter/Space, Home/End  
2. **e9df998d** – feat(combobox,menu): keyboard a11y — Tab-escape, Enter/Space, Home/End  
3. **6b5c6416** – refactor: standardize Space key handling and keyboard architecture  

Same feature set as b66ed418 but split across two feature commits plus one refactor. No additional nesting or stories.

### origin/feat-keyboard-a11y

No commits that add menu keyboard a11y. No unique menu code.

### origin/feat-popover-ally

No menu keyboard commits. No FocusScopeManager/DismissableLayerManager in repo. No unique menu implementation to adopt.

---

## Story File Comparison Matrix

| Story file              | feat-combobox-menu-keyboard | feat-keyboard-a11y | feat-keyboard-combined | keyboard-all-fixes | Differences |
|-------------------------|-----------------------------|--------------------|------------------------|-------------------|-------------|
| nesting.story.jsx        | 2 levels                    | 2 levels           | 2 levels               | 2 levels          | None        |
| overflow/nesting.story.jsx | 2 levels                  | 2 levels           | 2 levels               | 2 levels          | None        |
| all.story.jsx           | present                     | present            | present                | present           | None        |
| Other stories           | same set                    | same set           | same set               | same set          | None        |

All branches share the same story file list and same 2-level nesting pattern (Menu → SubMenu → Menu with Menu.List).

---

## Multi-Level Nesting Search Results

**Search conducted:**

- All 10 branches checked via `git ls-tree` and `git show` for menu story files.
- All commits touching `**/menu/**` and `**/menu/__stories__/**` reviewed.
- Grep for "SubMenu", "multi level", "3 level", "deep" in menu __stories__.

**Results:**

- **Multi-level (3+) nesting found:** **NO**
- **Location:** Not found in any branch.
- **Depth everywhere:** 2 levels (root menu → one SubMenu → one inner Menu with items). No SubMenu inside a SubMenu’s inner Menu in any story.
- **Keyboard support:** Implemented on feat-combobox-menu-keyboard and origin/keyboard-all-fixes for 2-level; no tests or stories for 3+ levels.

---

## Implementation Variations Across Branches

### Focus management

| Branch                        | Strategy                    | Key features                                                                 |
|------------------------------|-----------------------------|-------------------------------------------------------------------------------|
| feat-combobox-menu-keyboard   | isKeyboardNavigating ref    | Prevents blur during arrow navigation; onBlur guard in onToggleHandler       |
| origin/feat-keyboard-a11y     | (none)                      | No keyboard-specific focus handling                                          |
| origin/keyboard-all-fixes     | Same pattern                | Same behavior via e9df998d/57dbf993 + 6b5c6416 (Space refactor)               |

### Tab escape

| Branch                        | Implementation                         | Function used                     |
|------------------------------|----------------------------------------|-----------------------------------|
| feat-combobox-menu-keyboard  | Close menu, focus next/previous        | getNextFocusableAfterTrigger      |
| origin/keyboard-all-fixes    | Same                                   | Same (from overlayHelper)         |
| origin/feat-keyboard-a11y     | N/A                                    | No Tab escape in menu             |

### Submenu navigation

| Branch                        | Arrow Right/Left | Placement / multi-level support   |
|------------------------------|------------------|-----------------------------------|
| feat-combobox-menu-keyboard  | data-placement   | navigateSubMenu in utils; 2-level only |
| origin/keyboard-all-fixes    | Same             | Same                              |
| origin/feat-keyboard-a11y     | N/A              | No keyboard submenu logic        |

---

## Unique Code in Other Branches

### origin/keyboard-all-fixes

- **6b5c6416** – refactor: standardize Space key handling and keyboard architecture.  
  May align Space behavior across combobox/menu/listbox. No extra menu nesting or stories.  
- **Recommendation:** If Space behavior diverges from current, consider diffing 6b5c6416 against current and cherry-picking or merging the refactor.

### origin/feat-popover-ally

- No FocusScopeManager or DismissableLayerManager in this codebase. No menu-specific code to adopt for menu.

---

## Missing / Incomplete Coverage

### Not found in any branch

- [ ] Multi-level (3+) nested menu story
- [ ] Multi-level nested menu tests (e.g. 3 levels, SubMenu inside SubMenu)
- [ ] Keyboard navigation tests for 3+ levels
- [ ] Tab/Shift+Tab behavior tests inside nested submenus (only root-level Tab close tested)
- [ ] Explicit “multi level” or “deep nest” comments in stories

### Present but limited

- isKeyboardNavigating + Tab escape + Home/End only on feat-combobox-menu-keyboard and origin/keyboard-all-fixes.
- Nested menu tests: only “Menu component with Nesting snapshot” (2-level) and submenu Arrow tests; no 3-level fixture.

---

## Recommendations

### 1. Code to adopt from other branches

- **origin/keyboard-all-fixes:** Consider adopting **6b5c6416** (Space key refactor) if current Space behavior is inconsistent with combobox/listbox. Review diff before merging.

### 2. Tests to add

- [ ] Multi-level nesting (e.g. 3-level) snapshot or integration test.
- [ ] Tab/Shift+Tab from within a submenu (close submenu vs close root, focus target).
- [ ] Home/End inside a submenu (if supported).
- [ ] Keyboard navigation across 3+ levels (ArrowRight into second submenu, ArrowLeft back).

### 3. Stories to create

- [ ] Multi-level (3+) nested menu story (e.g. Menu → SubMenu A → SubMenu B → items) to validate behavior and a11y.

### 4. Implementations to merge

- Current branch (feat-combobox-menu-keyboard) already has the full menu keyboard implementation. origin/feat-keyboard-combined is aligned. origin/keyboard-all-fixes adds the Space refactor only; merge or cherry-pick 6b5c6416 if desired.

---

## Conclusion

- **Branches:** All 10 branches share the same menu file set and the same 2-level nesting in stories. No branch contains a 3+ level nested menu story or implementation-specific support for it.
- **Keyboard menu work:** Only feat-combobox-menu-keyboard (and origin/feat-combobox-menu-keyboard, origin/feat-keyboard-combined) and origin/keyboard-all-fixes have the full menu keyboard a11y (Tab escape, Home/End, Enter/Space, isKeyboardNavigating). origin/keyboard-all-fixes additionally has a Space-handling refactor (6b5c6416).
- **Gaps:** No multi-level (3+) nesting in stories or tests anywhere. Adding a 3+ level story and corresponding tests is recommended before relying on nested submenu keyboard behavior beyond two levels.
- **Next steps:** Add a 3+ level nesting story; add tests for Tab/Shift+Tab and navigation in nested submenus; optionally integrate 6b5c6416 from origin/keyboard-all-fixes after reviewing the Space refactor.

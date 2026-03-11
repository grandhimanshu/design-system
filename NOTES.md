# Personal notes (ask user before removing this file on PR merge)

## General
- Close icon has bad styling
- Tabbing on list does not take to footer
- Tabbing on search skips list
- Enter does not move focus back to the trigger

---

## Multi Select – keyboard (exhaustive test)

### 1. Shift+Tab from first list option does not move focus to search
**Expected:** With popover open and focus on the first list option, Shift+Tab should move focus to the search field (previous in order: search → list → footer).  
**Actual:** Focus stays on the first option.

**How to reproduce**
1. Open Storybook at http://localhost:6001.
2. Go to the story that has Multi Select with search and footer (e.g. `components-select-all--all`, second widget).
3. Focus the Multi Select trigger and press **Enter** or **Space** to open the popover (focus lands in search).
4. Press **Tab** once so focus moves to the first list option.
5. Press **Shift+Tab**.
6. **Observed:** Focus remains on the first option. **Expected:** Focus moves to the search field.

**Workaround:** Use **Arrow Up** from the first option to move focus back to search.

---

### 2. Reverse tab order inconsistent (search → list → footer)
**Expected:** Tab order is search → list → footer. So Shift+Tab from the first list option should go to search; Shift+Tab from search (when focus is there) could go to the last focusable in the popover (e.g. Apply).  
**Actual:** Shift+Tab from the first list option does not wrap/walk back to search (same root cause as issue 1).

**How to reproduce**
1. Same as above: open Multi Select with search + footer, open popover, focus in search.
2. Press **Tab** repeatedly and confirm order: search → first option → … → last option → Cancel → Apply.
3. From the **first list option**, press **Shift+Tab**.
4. **Observed:** Focus does not move to search. Reverse tab order is therefore incomplete for keyboard-only users.
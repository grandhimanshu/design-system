# Plan: Combobox Tab-Escape (keyboard a11y)

**Scope:** Fix WCAG 2.1.1 + 2.1.2 keyboard trap gap in Combobox. Tab from a focused option closes popover and returns focus to input.

---

## Plan

**Issue:** When focus is on a Combobox option (via ArrowDown/Up), pressing Tab has no proper handler. The current code only handles Tab on the input trigger (closes popover), but not when focus is on an option with `tabIndex={-1}`.

**WCAG violation:** SC 2.1.1 (Keyboard), SC 2.1.2 (No Keyboard Trap) -- users cannot Tab out of the options list predictably.

**Fix:** Add Tab case in option key handler to close popover and focus input.

---

## Implementation

1. **Add Tab handler in option key handler**  
   **File:** `core/components/organisms/combobox/utils.tsx`  
   In `handleKeyDown` (the one used by `ComboboxOption`), add after Escape case:
   ```typescript
   case 'Tab':
     event.preventDefault();
     setOpenPopover?.(false);
     inputTriggerRef.current?.focus();
     break;
   ```
   - **preventDefault:** Stop unpredictable browser Tab behavior (options have `tabIndex={-1}`)
   - **Focus input:** Input is the natural "home" for focus; next Tab moves to next page element

2. **Update interactions documentation**  
   **File:** `docs/src/pages/components/combobox/interactions.mdx`  
   Update table row (line 127-129): "Close the popover. Focus returns to the combobox input. Pressing Tab again shifts focus to the next item in the page tab sequence."

3. **Add test**  
   **File:** `core/components/organisms/combobox/__tests__/utility.test.tsx`  
   After Escape test, add Tab test: verify preventDefault, setOpenPopover(false), and inputTriggerRef.current.focus() are called.

---

## Why NOT following Select's tab-trap pattern

Select uses a tab trap (cycles focus within popover). Combobox does NOT. Here's why:

1. **No focusable elements in popover:** Combobox popover only contains options (all `tabIndex={-1}`). No search input (that's the trigger), no footer. `getFocusableElements()` returns empty array. Nothing to cycle between.

2. **Input is the search field:** Unlike Select (button trigger), Combobox trigger is the text input where users type to filter. It stays in the page tab order. Trapping Tab inside the popover would create inconsistent behavior: Tab from input exits, but Tab from option is trapped.

3. **APG Combobox pattern:** [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) explicitly says "Tab: Moves focus to the next focusable element. If the popup is open, closes it." No trap is expected.

4. **Discoverability:** If Tab were blocked/trapped, users would have no way to know they must press Escape. Tab is the standard "move forward" key -- blocking it creates a usability barrier.

5. **If extra focusables were added (e.g. a Switch):** Then Tab from option would either (a) skip the Switch entirely (unreachable by keyboard = SC 2.1.2 violation), or (b) require a trap. But that's a reason to NOT put focusables inside Combobox popover, not a reason to add a trap.

**Conclusion:** Combobox popover is intentionally minimal. "Close on Tab" is the correct, standards-compliant behavior.

---

## Files Changed

1. `core/components/organisms/combobox/utils.tsx` -- add Tab case
2. `docs/src/pages/components/combobox/interactions.mdx` -- clarify Tab behavior
3. `core/components/organisms/combobox/__tests__/utility.test.tsx` -- add Tab test

---

## Testing Checklist

- [x] Open Combobox, press ArrowDown to focus an option, press Tab -- popover closes, focus returns to input
- [x] From input, press Tab again -- focus moves to next page element
- [x] Shift+Tab from option -- same behavior (close + focus input)
- [x] Escape from option -- popover closes, focus returns to input (existing behavior, verify not broken)
- [x] Enter on option -- selects and closes (existing, verify not broken)
- [x] All tests pass (5/5 in utility.test.tsx)

---

## Summary

Small, focused fix: one Tab case in one function, plus docs and tests. No architectural changes, no tab trap, no roving index changes. Clean exit path for keyboard users per APG combobox pattern.

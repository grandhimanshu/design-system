# Personal notes (remove this file on final PR merge)

# Popover-based Components — Keyboard Challenges

Challenges across Select, Combobox, Menu, and any future component that uses a trigger + popover + list pattern.

---

## Terms (use these everywhere)

- **Trigger** — the element that opens the popover (button for Select/Menu, input for Combobox/DatePicker, etc)
- **Popover** — the floating dropdown container
- **Header** — area above the list (search input, custom controls)
- **List** — scrollable area containing options/items
- **Option / Item** — one selectable entry
- **Footer** — area below the list (Apply/Cancel buttons, etc.)
- **Zone** — Header, List, or Footer as a focus group

---

## 1. What can exist inside the popover

The popover is not always the same. It can contain any combination of:

- Header only (search input)
- List only (just options)
- Footer only (action buttons)
- Header + List
- List + Footer
- Header + List + Footer
- Custom content anywhere (not just the defaults)

All components are composable — consumers can put arbitrary content (switches, buttons, spinners, links) inside the popover via children. Each combination changes what keyboard navigation needs to do.

This applies to all components:
- **Select:** officially supports SearchInput, List, EmptyTemplate, Footer sub-components
- **Combobox:** officially supports List, Option sub-components, but children is open (any React node)
- **Menu:** supports List, Item, Group, SubMenu

---

## 2. Select modes

- **Single select** — pick one option, popover closes on selection
- **Multi select** — pick many options, popover stays open on selection, usually has a footer with Apply/Cancel

These behave differently after Enter/Space on an option.

---

## 3. Search input

- Optional. When present, it sits in the Header zone.
- When you open the popover, focus should go to search (if it exists) instead of the first option.
- Arrows from search should move into the list. Arrows from the first/last option should wrap back to search.
- The user cannot type in search and browse options at the same time (DOM focus moves to the option). The WAI-ARIA alternative is `aria-activedescendant`, which keeps DOM focus on the input while visually highlighting an option — but this is a larger refactor. (See section 15 for the ARIA detail.)

---

## 4. Footer

- Optional. Contains buttons (Apply, Cancel, or custom).
- These buttons are interactive and need to be reachable by keyboard.
- When footer exists, Tab should be able to reach it from the list.
- Footer buttons have their own click handlers and may close the popover.

---

## 5. Option types (what can be inside an option)

**Simple:**

- Just text ("Option A")
- Text + icon
- Text + sub-info text

**With redundant interactive elements:**

- Any element whose action duplicates the option's primary action (e.g., checkbox in multi-select toggles selection, but so does clicking/Enter on the option itself)
- These should be hidden from keyboard (`tabIndex={-1}`) so they don't create extra tab stops or arrow stops. The option surface already performs the same action.

**Decision.** Item makes redundant children inert. See D4 in Playbook.

**With non-redundant interactive elements:**

- A button inside the option (e.g., delete, edit, dropdown)
- These do something DIFFERENT from selecting the option
- Hard problem: how does the keyboard user reach them? Three approaches:
  - **A (Recommended):** Arrows move between options only. The sub-element is reached via a secondary mechanism (context menu, Shift+F10, or restructuring the UI so the action is not inside the option).
  - **B:** ArrowLeft/Right navigate within an option's sub-elements (grid-like pattern). Adds complexity and is unfamiliar to users.
  - **C:** Tab visits sub-elements within the focused option before moving to the next zone. Breaks the clean zone model.
- If this case comes up frequently, consider whether the UI should be a standalone list or table instead of a Select.

**Decision.** Phase 1: arrows navigate options only. Phase 2: adopt Grid pattern when needed. See D3 in Playbook.

---

## 6. Disabled options skip focus or take

- If option is invisible to focus screen reader users might be confused on why is that not present is it supposed to be there

- Arrow keys should skip over them (move to the next non-disabled option).
**Decision.** Arrow keys focus disabled options. Need to update D5 in Playbook.

---

## 7. Section headers / group labels

- The list can have non-interactive text labels that group options (e.g., "Category A" above a set of options).
- These are not options. Arrow keys should not land on them.
- They are rendered as children of `Select.List` but are not `Select.Option` elements.

---

## 8. Empty state / Loading state

- When there are no options (filtered to zero, or still loading), the list shows `SelectEmptyTemplate`.
- This can contain a spinner, an error message, or a reload button.
- Arrow keys have nothing to navigate.
- If there's a reload button, it needs to be keyboard-reachable (Tab to it).

---

## 9. Tab behavior depends on what exists

- **Only a list** (no search, no footer): Tab should close the popover and move focus to the next element on the page.
- **List + other zones** (search, footer, or both): Tab should cycle between zones inside the popover. Escape is the way to close.

This means Tab does different things depending on the popover content. The behavior needs to be detected automatically.

**Decision.** Tab always traps (cycles zones). See D1 in Playbook for rationale.

---

## 10. Arrow wrapping and search

- Without search: ArrowDown from last option wraps to first option. ArrowUp from first wraps to last.
- With search: ArrowDown from last option goes to search. ArrowUp from first option goes to search. Search acts as a boundary item in the arrow cycle.

---

## 11. Focus on open

When the popover opens, where should focus go?

- If search exists: focus the search input.
- If no search: focus the first selected option (if any), otherwise the first option.
- The list uses **roving tabindex** (only one option has `tabindex=0` at a time), but that is the *technique* for managing focus within the list — it is not the same as the focus-on-open logic. See section 17 for roving tabindex details.

---

## 12. Focus on close

When the popover closes, where does focus go? It depends on *how* it closed:

- **Escape:** Focus returns to the trigger. Always.
- **Selection in single select (Enter/Space on an option):** Focus returns to the trigger.
- **Tab from a single-zone popover (list only, no search/footer):** Tab closes the popover and moves focus to the next element on the page (Shift+Tab to the previous). Focus does NOT go to the trigger — it goes to whatever comes after/before the trigger in the page's tab order.
- **Outside click:** Focus goes to wherever the user clicked. The popover just closes; no forced focus move. (See section 19.)

---

## 13. Clear button on trigger

- When an option is selected, the trigger shows a clear (x) icon.
- Currently reverted to a non-interactive `Icon` (not keyboard-accessible).
- When re-implemented, it needs: Tab to reach it, Enter/Space to activate, must not trigger the parent Select, focus should return to trigger after clearing.

---

## 14. Custom triggers

- The trigger can be a custom element (not the default button).
- Keyboard behavior should still work: Enter/Space/Arrows to open.
- Custom triggers get `ref={triggerRef}` via `React.cloneElement`.

---

## 15. ARIA issues (existing)

- `ListBody` has `role="tablist"` hardcoded — this is wrong for a listbox/select context.
- `role="option"` is on the outer `li` but the focusable element is the inner `div` — ARIA role and focus target are on different elements.
- `aria-activedescendant` is not used (would be ideal for the search+list pattern).

---

## 16. Two separate keyboard systems

- The Listbox atom (`listbox/utils.ts`) has its own arrow key handler that skips disabled items.
- The Select organism (`select/utils.tsx`) has a completely separate arrow key handler that does NOT skip disabled items.
- Both run on the same DOM elements. They need to be aligned or unified.

**Decision.** Select overrides Listbox keyboard handling. See D6 in Playbook.

---

## 17. Roving tabindex

- Only one option in the list has `tabindex=0` at a time. All others have `tabindex=-1`.
- The option with `tabindex=0` is determined by `getRovingIndex`: focused option > first selected option > first option.
- This means Tab into the list always lands on one specific option, and arrows move from there.

---

## 18. Popover is portaled

- The popover can be appended to `document.body` (via `appendToBody` prop).
- This means the popover DOM is not next to the trigger in the DOM tree.
- Focus management (like "find the next focusable element after the trigger") must query from `document.body`, not from the component tree.

---

## 19. Outside click

- Clicking outside the popover closes it.
- Focus goes to whatever the user clicked — not back to the trigger.
- This is different from Escape (which always returns focus to the trigger).


---





## 22. Focus persistence after selection in multi-select

- In multi-select, selecting an option (Enter/Space) keeps the popover open.
- Focus should stay on the same option after toggling it.
- If the list re-renders (e.g., search filter changes the list), the focused option may disappear from the DOM. Focus needs to fall back to the nearest valid option or the search input.


---




---

## 25. Combobox: trigger lives outside the popover

- Hence we cannot say popover should close anytime focus goes outside

---

## 26. Arrow navigation scope — focus on items only vs all focusables

- Components are composable. Users can add custom inputs, buttons, switches inside popovers.
- Arrow keys currently navigate only Menu.Item/Combobox.Option/Select.Option elements (via specific selector).
- Custom focusables (inputs, buttons) are unreachable by arrows — only Tab can reach them.
- Two options: (A) arrows navigate items only, or (B) arrows navigate all focusables.
- Trade-off: (A) is faster for large lists but makes custom content inaccessible. (B) makes arrows slower (stop at every element) but everything is reachable.

**Decision.**  Menu/Combobox = all focusables; Select = options only. See D14 in Playbook for details


---

## 27. Combobox input outside the popover so outside focus should not always close popover
- Alternative pattern (Google/Slack search): input inside the popover, Tab traps making consitent with select.

---

## 28. Tab behavior — trap vs escape

- Select uses tab trap (Tab cycles inside popover).
- Menu/Combobox use tab escape (Tab closes popover and moves focus to next page element).

**Decision.** Select traps Tab; Menu/Combobox use tab-escape. See D1 and D13 in Playbook for rationale.

---


## Summary count

- 3 possible zones (Header, List, Footer) in 6+ combinations
- 2 select modes (single, multi)
- 3 option complexity levels (simple, redundant interactive, non-redundant interactive)
- 5 special states (disabled options, section headers, empty, loading, error)
- 4 close mechanisms (Escape, selection, Tab-escape, outside click) — each with different focus behavior
- 6 key groups to handle (Tab, Arrows, Enter/Space, Home/End, Escape, type-ahead)
- 2 separate keyboard systems that need alignment (Listbox atom vs Select organism)
- 3 ARIA issues to fix (role="tablist", role/focus mismatch, missing aria-activedescendant)
- 3 additional concerns (trigger toggle, focus persistence on re-render, screen reader announcements)

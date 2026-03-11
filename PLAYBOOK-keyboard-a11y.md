# Keyboard A11y Playbook

How we handle keyboard accessibility across the design system. Read this before making keyboard-related changes to any component.

Contains: finalized decisions, reasoning, trade-offs, and planned future improvements.

**Related docs:**
- [NOTES-select-complexities.md](NOTES-select-complexities.md) — All complexities that make Select keyboard navigation hard. Scan before working on Select keyboard changes.

---

# Part 1: Decisions

## D1. Tab always traps inside popovers

**Applies to:** Select, Combobox, Menu, or any component with a popover containing interactive content.

**Decision:** Tab cycles between zones (Header -> List -> Footer -> Header). Escape is the only way to close.

**Why we chose this:**
- Our Select is more complex than most — it supports search, footer, and arbitrary custom content inside one popover. Most design systems (MUI, Headless UI, React Spectrum) avoid this by keeping their Select popover simple (just options), so they can use "Tab always closes." That doesn't work for us because footer buttons would be unreachable.
- We could auto-detect simple vs complex popovers (DOM query for extra focusables), but no design system does this — it's fragile with composed children and adds an edge-case surface.
- The only major design system with comparable popover complexity is Radix, and they always trap. We follow the same approach.
- Always-trap is consistent: the user learns one pattern that works everywhere.

**Trade-off accepted:** A simple single select (list only, no search/footer) still traps Tab. The user must press Escape to leave. This is a minor learning curve.

**What we rejected:**
- Automatic detection (Tab escapes for simple selects, traps for complex) — fragile, no design system does it.
- Always-escape (Tab always closes popover) — footer buttons become unreachable by Tab.

---

## D2. Arrow navigation responsibility belongs to the List

**Applies to:** Any list-based component (Select, Listbox, Menu, Combobox).

**Decision:** The List component owns all arrow key navigation logic. Items control what's focusable within themselves.

**Why:**
- Our items accept arbitrary `children` (React.ReactNode), so the item itself can't predict what's interactive inside it. Only the List can query the DOM at runtime to discover focusable targets.
- An individual item cannot know about its siblings — arrow navigation requires knowing the full collection.
- This is how every major design system does it: Radix (RovingFocusGroup), React Aria (useListBox), Headless UI (Listbox) — focus management is always at the list/group level, never at the item level.

**Responsibility split:**
- **List:** Decides which element gets focus on ArrowUp/Down, collects arrow targets, manages roving tabindex.
- **Item:** Makes redundant children inert (`tabIndex={-1}`). Leaves non-redundant children focusable for arrow navigation to discover.

---

## D3. Arrows navigate between options only (Phase 1), grid-like sub-element navigation later (Phase 2)

**Applies to:** Select, Listbox. Potentially Menu if items gain interactive sub-elements.

**Phase 1 (current):** ArrowUp/Down move between options only (using `LISTBOX_ITEM_SELECTOR`). No sub-element navigation. Uses `role="listbox"` / `role="option"`. Safe, standard, best screen reader experience for the common case.

**Phase 2 (future, when needed):** Adopt WAI-ARIA Grid pattern for Select instances with interactive sub-elements inside options. ArrowUp/Down moves between rows (options). ArrowLeft/Right moves between cells within a row (option surface vs sub-elements like buttons). Uses `role="grid"` / `role="row"` / `role="gridcell"`.

**Detection method for Phase 2:** Use `data-keyboard-target` attribute on anything that should participate in arrow navigation. All sub-elements inside options get `tabIndex={-1}` (prevents Tab from reaching them) but remain focusable via programmatic `.focus()` (which is what arrow navigation does). This decouples arrow-reachability from Tab-reachability. Provide a `Select.Action` wrapper that applies `data-keyboard-target`, `tabIndex={-1}`, and `stopPropagation` automatically.

**Why phased:** No consumer currently puts interactive sub-elements inside a `Select.Option`. Phase 1 ships the standard listbox behavior with the best screen reader experience. Phase 2 is ready to build when the need arises, without rearchitecting.

**Why Grid over flat 1D navigation:** A flat approach (ArrowDown through every focusable element in DOM order) doubles arrow presses for lists with sub-elements (option, button, option, button = 2N presses vs N). The Grid pattern preserves fast vertical traversal (ArrowDown = next option) and adds horizontal access (ArrowRight = sub-element). Screen readers also provide better context with Grid roles ("Row 2, Column 2").

---

## D4. Redundant interactive elements are the Item's responsibility

**Applies to:** Any list item with children that duplicate the item's primary action.

**Decision:** The Item makes redundant children inert. The List doesn't need to know about them.

**How:** Set `tabIndex={-1}` on any element whose action duplicates the option's primary action (e.g., checkbox in multi-select). This removes them from both Tab order and arrow navigation.

**Principle:** If clicking the option and clicking the sub-element do the same thing, the sub-element should be invisible to keyboard navigation. The option surface handles the action.

---

## D5. Skip disabled options on arrow navigation

**Applies to:** All list-based components.

**Decision:** Arrow keys skip disabled options. Disabled options are invisible to arrow navigation.

**Why:** WAI-ARIA recommends this. Our standalone Listbox atom already skips disabled items (in `listbox/utils.ts`), but the Select organism's `navigateOptions` does not — it lands on disabled options. This inconsistency is a bug. Fixing it aligns Select with both Listbox and the WAI-ARIA spec.

**Also applies to:** Home/End keys.

---

## D6. Select overrides Listbox keyboard handling

**Applies to:** Select (and any organism that wraps the Listbox atom).

**Decision:** When Listbox is used inside Select, Select's keyboard handlers take full control. Listbox's built-in `onKeyDown` from `listbox/utils.ts` is suppressed.

**Why:** Both handlers fire on the same DOM elements. Select needs more comprehensive handling (search wrapping, zone cycling, Escape-to-trigger, Home/End) that Listbox's handler doesn't cover. Running both causes conflicts.

---

## D7. DOM focus moves between search and options (for now)

**Applies to:** Select with search, Combobox.

**Decision:** When arrows move from search into the list, DOM focus physically moves to the option. The user cannot type and browse simultaneously.

**Why:** This is what's already implemented and working. The WAI-ARIA alternative (`aria-activedescendant`) is better UX but a significant refactor. Ship with what works, upgrade later.

---

## D8. Keep arrow wrapping (current behavior)

**Decision:** ArrowDown from the last option wraps to the first (or search). ArrowUp from the first wraps to the last (or search).

**Note:** Most design systems stop at boundaries instead of wrapping. If users report confusion, reconsider.

---

## D9. Fix ARIA roles in a separate PR

**Decision:** The `role="tablist"` on ListBody and the role/focus-target mismatch are real issues but don't affect keyboard navigation. Fix in a dedicated follow-up.

---

## D10. Stale focus fallback (simple approach)

**Decision:** If `focusedOption` DOM ref is stale, fall back to the first option or search input. Don't track by data key yet.

---

## D11. Defer: clear button, type-ahead, screen reader enhancements

These are not in scope for the main keyboard navigation work:
- **Clear button:** Reverted due to conflicts. Tackle after keyboard nav is solid.
- **Type-ahead:** Nice but not critical. Search already covers "find by name."
- **Enhanced screen reader announcements:** Rely on native `aria-selected` for now.

---

# Part 2: Future Improvements

Items ordered roughly by impact. Each references the decision it extends.

### Grid-like sub-element navigation (extends D3, Phase 2)
Adopt WAI-ARIA Grid pattern when options contain interactive sub-elements. ArrowUp/Down between rows, ArrowLeft/Right between cells. Introduce `Select.Action` wrapper with `data-keyboard-target`, `tabIndex={-1}`, `stopPropagation`, and `aria-label`. Change ARIA roles to `role="grid"` / `role="row"` / `role="gridcell"`.

### `aria-activedescendant` for search + list (extends D7)
Keep DOM focus on the search input while visually highlighting options via `aria-activedescendant`. Users can type and browse simultaneously. Significant refactor.

### Unified keyboard handler (extends D6)
Extract a shared `createListboxKeyHandler` that both Listbox and Select (and Menu, Combobox) use. Configured per-component. Eliminates duplication.

### Focus tracking by data identity (extends D10)
Store focused option as `option.value` or `option.id` instead of a DOM ref. After re-render, find the matching element and re-focus.

### ARIA role fixes (extends D9)
Remove hardcoded `role="tablist"` from ListBody. Move `role="option"` to the focusable element. Update tests and snapshots.

### Type-ahead (extends D11)
Typing a character while the list is focused jumps to the first option starting with that character.

### Enhanced screen reader announcements (extends D11)
Add `aria-live` region for filtered count and selection state changes.

### Clear button keyboard accessibility (extends D11)
Re-wrap the trigger's clear icon in a `<button>`. Handle Tab, Enter/Space, `stopPropagation`, and focus return.

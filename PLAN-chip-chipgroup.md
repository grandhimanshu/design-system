# Plan: Chip + ChipGroup (keyboard a11y)


**Scope:** Fix WCAG 2.1.1 keyboard gaps for Chip (Critical) and ChipGroup (High). Roving tabindex only where needed.

---

## Plan

1. **Chip (GenericChip)**  
   - **Activation:** Ensure wrapper and clear button both respond to **Enter** and **Space**; call `preventDefault()` on Space so the page does not scroll. (Current code may already handle Space — verify and document.)  
   - **Dismissible:** When `clearButton` is true, support **Delete** or **Backspace** on the focused chip to dismiss (invoke `onClose`) without moving focus to the clear icon. Optional: keep clear icon as secondary target (Enter/Space on icon still dismiss).  
   - **Forward tabIndex:** Allow parent to control tab order: add optional `tabIndex` prop on Chip/GenericChip; apply to wrapper div. Default remains `0` when not in a group, so standalone Chip stays one tab stop.

2. **ChipGroup**  
   - **Roving tabindex:** One tab stop for the group. Only the focused chip has `tabIndex={0}`; all others `tabIndex={-1}`. ChipGroup holds `focusedIndex` (state), passes `tabIndex={focusedIndex === index ? 0 : -1}` (and optional `data-index` or ref callback) into each Chip.  
   - **Arrow keys:** On Left/Right (or Up/Down if vertical layout later), `onKeyDown` at container: preventDefault, update `focusedIndex`, call `refs[focusedIndex].focus()`. Skip disabled chips when moving.  
   - **Activation:** No change — each Chip still handles Enter/Space internally.  
   - **Focus on first focusable:** On mount or when list length increases, if no chip is focused, set `focusedIndex` to first non-disabled (0 if none disabled). Do not auto-focus the DOM on mount (avoid focus steal); only sync `focusedIndex` so first Tab lands correctly.

3. **Chip + ChipGroup integration**  
   - ChipGroup uses the new `tabIndex` prop on Chip so only one chip is in tab order. ChipGroup attaches a single `onKeyDown` to the container (or uses a ref on the wrapper) to handle arrows and delegate focus to the active chip ref.  
   - **Refs:** ChipGroup needs a ref to each chip’s focusable element (wrapper div). Either: Chip forwards ref to GenericChip wrapper, and ChipGroup uses `ref={chipRefs.current[i]}`, or ChipGroup uses a callback ref and stores refs in an array.  
   - **Disabled:** When advancing focus by arrow, skip chips with `disabled === true`.

4. **ChipInput (out of scope here but aligned)**  
   - ChipInput renders Chips but not ChipGroup. Its “arrow key chip navigation” is a separate, Partial item. This plan does not change ChipInput; once Chip supports `tabIndex` and ref forwarding, ChipInput can later adopt similar arrow nav or a single tab stop for the chip list if desired.

---

## Challenges

- **Bugs**
  - **Clear button vs. wrapper:** Clear is a separate focusable (`tabIndex={0}`). In ChipGroup with roving tabindex, only one chip wrapper should be in tab order; the clear button inside that chip creates a second tab stop. **Decision:** Clear button gets `tabIndex={-1}` when Chip is used inside ChipGroup (parent passes a prop, e.g. `hideClearFromTabOrder` or ChipGroup context), so roving tabindex is one-per-chip; focus moves to wrapper, then Space/Enter activates, Delete/Backspace dismisses. If we don’t want to add a prop, alternative: clear button always `tabIndex={-1}` and is only reachable via keyboard by focusing the chip and pressing Delete/Backspace (no separate tab stop for clear). Trade-off: users who expect to Tab to the “remove” control lose that; WCAG is satisfied by having a keyboard-dismiss (Delete/Backspace).
  - **Focus sync:** When a chip is removed (e.g. onClose in a dynamic list), focusedIndex can point to a removed item. Set focusedIndex to Math.min(prev, newLength - 1) or 0, then call focus() on the new focused chip ref.

- **Decisions**
  - **Roving tabindex in ChipGroup:** Adopted so that N chips = 1 tab stop + arrow navigation, matching common filter-chip UX and reducing tab stops. Alternative (all chips tabbable) is valid but noisier for screen reader and keyboard users.
  - **Delete/Backspace to dismiss:** In addition to clear button, so dismissible chips are removable from keyboard without focusing the clear icon. Aligns with WAI-ARIA “dismissible chip” expectations.
  - **Arrow axis:** Left/Right for horizontal ChipGroup. If ChipGroup ever supports vertical layout, use Up/Down.
  - **No focus steal:** ChipGroup does not call `.focus()` on mount; only when user arrows or Tabs. First Tab into the group lands on the chip at focusedIndex (e.g. 0).

---

## Questions for product / UX

1. **Clear button tab stop:** When Chip is inside ChipGroup, should the clear (X) icon be a separate tab stop, or is “focus chip → Delete/Backspace to remove” enough? (Recommendation: no separate tab stop for clear when in group; use Delete/Backspace on chip to remove.)
2. **Vertical ChipGroup:** Any near-term need for vertical layout (arrows Up/Down)? If not, we can document “horizontal only” and add orientation later.

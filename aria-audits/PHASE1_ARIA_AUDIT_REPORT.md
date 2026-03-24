# Phase 1 — Aggregated ARIA / semantic audit report

Structural DOM, ARIA, and keyboard wiring only (per raw reports). Sources: `aria-audits/raw-reports/*-audit.md` for **modal**, **dialog**, **fullscreenModal**, **sidesheet**, **popover**, **tooltip**, **select**, **combobox**, **listbox**, **dropdown**, **editableDropdown**, **menu**, **choiceList**, **button**, **link**, and **linkButton**.

---

## Total counts by severity

**8 Critical (P0)** · **49 High (P1)** · **55 Medium (P2)** · **22 Low (P3)**  

_Counts sum finding-level severities across all sixteen raw reports. One Select finding is scored P1 for ID wiring and P2 for live-region semantics in the source audit (both counted). Several P0/P1 items share root causes (see Deduped themes)._

---

## Deduped themes

- **`ListBody` `role="tablist"` on the focused row** — Single implementation in `listboxItem/ListBody.tsx` drives wrong roles and dual keyboard models for **Listbox**, **Select**, **Combobox**, and **Menu** (P0/P1 cluster). Remediating role + focus target (or adopting `aria-activedescendant`) collapses many per-component bullets into one fix path.

- **Icon-only / close controls: `Tooltip` around `Button` without `tooltip` or `aria-label` on `Button`** — `Button` only derives `aria-label` from its own `tooltip` prop; outer `Tooltip` does not name the control. Affects **Modal** (default header path vs composition header), **Dialog** (via Modal), **FullscreenModal**, **Sidesheet**, and overlaps **Modal** `ModalHeader` close without `tooltip`.

- **`OverlayHeader` back / icon-only `Button`** — Unnamed back control when `backButton` / `backIcon` is used; shared by **Modal**, **FullscreenModal**, **Sidesheet**.

- **Overlay stack / Escape consistency** — `closeOnEscapeKeypress` sometimes hard-codes “top overlay” as `true` instead of `OverlayManager.isTopOverlay(...)` (**Modal**, **Dialog**, **Sidesheet**). **FullscreenModal** additionally omits default Escape registration when `closeOnEscape` is unset.

- **Popover / `PopperWrapper` layer** — Missing disclosure ARIA on triggers, no stable surface `id`, default `appendToBody` focus order, no Escape — impacts **Popover** directly and **Tooltip** (built on Popover).

- **Dropdown list implementation** — Missing trigger `aria-expanded` / `aria-haspopup` / `aria-controls`, no Escape, cursor vs DOM focus / `aria-activedescendant`, `tabIndex={0}` on every option, `Date.getTime()` ids — shared by **Dropdown** and **EditableDropdown** (plus Editable’s nested `role="button"` wrapper).

- **Dialog naming gaps** — Unnamed `role="dialog"` when custom header / empty `headerOptions` / composition without `aria-labelledby` wiring (**Modal**, **FullscreenModal**, **Sidesheet**, **Dialog**).

- **Atoms: icon branch in `Button` / `LinkButton`** — `div` inside `button` (invalid HTML), decorative `Icon` not `aria-hidden` when text labels the control.

---

## Prioritized backlog

_Order: higher user benefit relative to engineering leverage (shared primitives first), then severity density._

1. **Listbox:** 2 P0, 3 P1, 5 P2, 2 P3 — Fix `ListBody` roles/focus and listbox keyboard model; unblocks Menu, Select, Combobox.
2. **Select:** 1 P0, 4 P1, 3 P2, 2 P3 — Depends on Listbox; also listbox/list nesting, duplicate wrapper ARIA, empty template ids, search field semantics.
3. **Menu:** 1 P0, 5 P1, 5 P2, 1 P3 — Depends on Listbox; submenu `aria-controls`/`aria-expanded`, root menu `id`, group labels, duplicate key handlers.
4. **Combobox:** 0 P0, 4 P1, 4 P2, 2 P3 — Same Listbox focus/role issues at P1; `aria-selected`, `aria-controls` target, multiselect state, `aria-autocomplete`.
5. **Modal:** 1 P0, 2 P1, 2 P2, 2 P3 — Close naming (composition vs declarative), dialog naming, Escape/top-overlay alignment, optional `aria-describedby` / `alertdialog`.
6. **Dialog:** 1 P0, 1 P1, 3 P2, 1 P3 — Thin wrapper over Modal; unnamed close (Modal), naming, `aria-describedby` for description, API parity for `aria-labelledby`.
7. **FullscreenModal:** 1 P0, 5 P1, 1 P2, 1 P3 — Close naming, missing focus trap / initial focus / restore vs `aria-modal`, Escape default, custom header naming, back button, footer focus race.
8. **Sidesheet:** 1 P0, 3 P1, 2 P2, 1 P3 — Close naming, `onAnimationEnd` bug (state/ARIA drift), naming gaps, back button, Escape/top-overlay, backdrop `aria-hidden`.
9. **Dropdown:** 0 P0, 5 P1, 5 P2, 2 P3 — Trigger wiring, Escape, focus model, unstable ids, menu mode completeness, loading/live region.
10. **EditableDropdown:** 0 P0, 3 P1, 4 P2, 1 P3 — Nested interactive (`Editable` + button), inherits Dropdown gaps, label/htmlFor on options, labelling API.
11. **Popover:** 0 P0, 3 P1, 4 P2, 1 P3 — `aria-expanded` / relationships, Escape, portaled focus order, surface naming, hover vs keyboard docs.
12. **Tooltip:** 0 P0, 2 P1, 2 P2, 1 P3 — `role="tooltip"`, `id` + `aria-describedby`, Escape (APG polish).
13. **ChoiceList:** 0 P0, 4 P1, 1 P2, 1 P3 — Fieldset naming, visible title vs legend/`aria-labelledby`, radio `name` consistency, optional choice labels.
14. **Button:** 0 P0, 3 P1, 4 P2, 1 P3 — `selected` → `aria-pressed`, loading vs visible name, icon-only naming contract, `div`/icon/spinner polish, `type` default.
15. **Link:** 0 P0, 1 P1, 5 P2, 2 P3 — Optional `href` / wrong control semantics, `forwardRef`, `tabIndex`, disabled link pattern, docs.
16. **LinkButton:** 0 P0, 1 P1, 4 P2, 1 P3 — Empty children + icon, `div`/icon, misuse vs real links, JSDoc nit.

---

## Detailed Findings

### 1. Listbox

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Render `<Listbox><Listbox.Item>…</Listbox.Item></Listbox>`; focused node is inner wrapper with `role="tablist"`.  
  **Impact:** Rows are exposed as tab lists without tabs; invalid for list/listbox.  
  **Suggestion:** Remove `role="tablist"` unless full Tabs APG; use `presentation` / none on wrappers, or put `role="option"` on the focused node (or `aria-activedescendant` from parent).

- **WCAG / basis:** 4.1.2; APG listbox · **P0** · **Component default** · **Repro:** Combobox composition: `listbox` → `option` contains focused inner `tablist`.  
  **Impact:** Focused role contradicts `option`; breaks listbox subtree expectations.  
  **Suggestion:** Align with APG: single tab stop or focusable options without nested conflicting roles.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `type="option"` with `selected` / `disabled`; focused `ListBody` lacks `aria-selected` / `aria-disabled`.  
  **Impact:** State visible only visually.  
  **Suggestion:** Map state on focused or `option` node per APG.

- **WCAG / basis:** 4.1.2; APG disclosure · **P1** · **Component default** · **Repro:** `nestedBody` with `expanded` toggling — no `aria-expanded` / `aria-controls`.  
  **Impact:** Expand state not programmatic.  
  **Suggestion:** Add `aria-expanded` and region `id` linkage on the control that expands.

- **WCAG / basis:** 4.1.2; HTML · **P1** · **Consumer-dependent** · **Repro:** `tagName="a"` with inner focusable `div`.  
  **Impact:** Nested interactives inside link; ambiguous keyboard model.  
  **Suggestion:** Single focusable target; avoid `a` wrapping separate widget.

- **WCAG / basis:** Best practice; APG only · **P2** · **Consumer-dependent**  
  **Impact:** Name “Listbox” / `type="option"` without default `role="listbox"`.  
  **Suggestion:** Document required ARIA or set roles when `type="option"`.

- **WCAG / basis:** 2.4.3; APG only · **P2** · **Component default**  
  **Impact:** Each row `tabIndex={0}` — long tab chains.  
  **Suggestion:** Roving tabindex or `aria-activedescendant`.

- **WCAG / basis:** APG only · **P2** · **Component default**  
  **Impact:** Arrows only; no Home/End / typeahead unless parent handles.  
  **Suggestion:** Extend keymap or document delegation.

- **WCAG / basis:** 2.1.1; Best practice · **P2** · **Consumer-dependent**  
  **Impact:** `utils.ts` sibling walking fragile if DOM shape changes.  
  **Suggestion:** Query by role/data or refs.

- **WCAG / basis:** 4.1.2; APG only · **P2** · **Component default** (`draggable`)  
  **Impact:** Draggable row focusable `div` may lack clear reorder name.  
  **Suggestion:** Document labelling; consider row `aria-label` / pattern docs.

- **WCAG / basis:** 4.1.2; Best practice · **P3** · **Component default** (`draggable`)  
  **Impact:** Drag handle icon may be unnamed.  
  **Suggestion:** `aria-label` on handle or `aria-hidden` if decorative with SR instructions elsewhere.

- **WCAG / basis:** 4.1.3; Non-WCAG polish · **P3** · **Component default**  
  **Impact:** No live region for reorder.  
  **Suggestion:** Optional `aria-live` if announcements required.

---

### 2. Select

- **WCAG / basis:** 4.1.2; 1.3.1 · **P0** · **Component default** · **Repro:** Open Select; focus on `Listbox-ItemWrapper` shows `role="tablist"` inside option path.  
  **Impact:** Mis-announced as tab list; invalid listbox structure.  
  **Suggestion:** Fix `ListBody` / focus target for `type === 'option'` (or Select-specific item).

- **WCAG / basis:** 4.1.2; APG · **P1** · **Component default** · **Repro:** `role="listbox"` wraps `ul` (list) then `option` children.  
  **Impact:** `option` not directly under `listbox`/`group`.  
  **Suggestion:** Flatten container roles; direct option children.

- **WCAG / basis:** 4.1.2; Best practice · **P1** · **Component default** · **Repro:** Outer Select `div` and trigger `button` both set `aria-haspopup` / `aria-expanded`.  
  **Impact:** Duplicate state on non-focused wrapper.  
  **Suggestion:** Keep popup state only on the focused trigger.

- **WCAG / basis:** 4.1.2; 2.1.1 · **P1** · **Consumer-dependent** · **Repro:** Custom `trigger` — only `ref` merged.  
  **Impact:** No `aria-controls` / expanded / haspopup wiring.  
  **Suggestion:** Merge listbox wiring or document mandatory consumer props.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `SelectEmptyTemplate` uses `id={title}`, `aria-labelledby={title}` (text, not id).  
  **Impact:** Broken ID references; duplicate id risk.  
  **Suggestion:** Stable generated ids; correct `aria-labelledby` / `aria-describedby`.

- **WCAG / basis:** Best practice (live region) · **P2** · **Component default**  
  **Impact:** `role="alert"` with `aria-live="polite"` conflicts.  
  **Suggestion:** `role="status"` + polite, or `role="alert"` without conflicting politeness.

- **WCAG / basis:** 2.4.3; APG · **P2** · **Component default**  
  **Impact:** `role="listbox"` container `tabIndex={0}` adds extra stop.  
  **Suggestion:** `tabIndex={-1}` or align fully with APG focus model.

- **WCAG / basis:** 4.1.2; APG · **P2** · **Component default** (`Select.SearchInput`)  
  **Impact:** `aria-haspopup="listbox"` without full combobox wiring.  
  **Suggestion:** Full combobox association or remove misleading attribute.

- **WCAG / basis:** 2.1.1; Best practice · **P2** · **Component default**  
  **Impact:** Parallel `ListBody` and `SelectOption` key handlers may conflict.  
  **Suggestion:** Single navigation owner for Select.

- **WCAG / basis:** 2.4.6; Best practice · **P3** · **Consumer-dependent**  
  **Impact:** Generic default `aria-label` strings.  
  **Suggestion:** Document meaningful labels; derive from option labels when possible.

- **WCAG / basis:** 1.3.1; Best practice · **P3** · **Consumer-dependent**  
  **Impact:** `SelectFooter` unlabeled region.  
  **Suggestion:** Optional `aria-label` for action groups.

---

### 3. Menu

- **WCAG / basis:** 4.1.2; 1.3.1 · **P0** · **Component default** · **Repro:** `Menu.Item` — focus lands on inner `ListBody` with `role="tablist"` inside `menuitem` host.  
  **Impact:** Invalid menu structure; focused role wrong.  
  **Suggestion:** Menu-specific item without `tablist`; focused element carries `menuitem` semantics.

- **WCAG / basis:** 2.1.1 · **P1** · **Component default** · **Repro:** ArrowDown on item — listbox `onKeyDown` and menu `handleKeyDown` both run.  
  **Impact:** Unpredictable double navigation.  
  **Suggestion:** Disable listbox handler for menu rows or single handler ownership.

- **WCAG / basis:** 4.1.2; APG · **P1** · **Component default** (`SubMenu`) · **Repro:** `aria-controls` references `menuID` but Popover surface has no matching `id`.  
  **Impact:** Relationship broken for AT.  
  **Suggestion:** Set `id={menuID}` on visible menu panel.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** (`SubMenu`) · **Repro:** `aria-expanded` from ref presence, not open state.  
  **Impact:** Often wrong expanded state.  
  **Suggestion:** Bind to Popover `open`.

- **WCAG / basis:** 2.1.1; 2.4.3 · **P1** · **Component default** · **Repro:** Escape on submenu trigger returns to root menu button.  
  **Impact:** Skips parent menu context.  
  **Suggestion:** Focus parent trigger / parent `menuitem`.

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** Omit `aria-label` / `aria-labelledby` on `Menu`.  
  **Impact:** Unnamed menu in rotor.  
  **Suggestion:** Document requirement; optional dev warn or default from trigger.

- **WCAG / basis:** Best practice; APG · **P2** · **Component default**  
  **Impact:** No stable menu `id` / `aria-controls` from `Menu.Trigger`.  
  **Suggestion:** `useId` on `role="menu"`; `aria-controls` on trigger.

- **WCAG / basis:** 1.3.1; 4.1.2 · **P2** · **Component default** (`MenuGroup` + `label`)  
  **Impact:** Visual label not associated with `role="group"`.  
  **Suggestion:** `aria-labelledby` from label `id`.

- **WCAG / basis:** 1.3.1; Best practice · **P2** · **Component default**  
  **Impact:** Default `tagName="nav"` inside transient `role="menu"` — landmark noise.  
  **Suggestion:** Non-landmark wrapper for menu mode.

- **WCAG / basis:** Best practice · **P3** · **Component default**  
  **Impact:** `aria-haspopup={true}` vs token `menu`.  
  **Suggestion:** `aria-haspopup="menu"`.

- **WCAG / basis:** 2.1.1; APG · **P2** · **Component default**  
  **Impact:** Arrow navigation does not skip `aria-disabled` items.  
  **Suggestion:** Skip disabled rows like listbox utils.

- **WCAG / basis:** 2.1.1 · **P2** · **Consumer-dependent** (`MenuItem` as `a`)  
  **Impact:** Enter may navigate anchor without `preventDefault`.  
  **Suggestion:** `preventDefault` when menu handles activation or use `button`/`menuitem` pattern.

---

### 4. Combobox

- **WCAG / basis:** 4.1.2; 1.3.1 · **P1** · **Component default** · **Repro:** Focused list node is `tablist` inside option.  
  **Impact:** Wrong role; invalid nesting.  
  **Suggestion:** Same as Listbox — align focus + role with APG listbox/combobox.

- **WCAG / basis:** 4.1.2; APG · **P1** · **Component default**  
  **Impact:** No `aria-selected` on options; selection CSS-only.  
  **Suggestion:** Set on accessible option node; multiselect listbox pattern as needed.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** (`multiSelect`) · **Repro:** Selection ignores `chipInputValue`.  
  **Impact:** Selected state wrong for chips.  
  **Suggestion:** Derive from `chipInputValue` when multiselect.

- **WCAG / basis:** 2.1.1; 4.1.2 · **P1** · **Component default**  
  **Impact:** `focusedOption` vs DOM focus diverge; `Enter` uses stale context.  
  **Suggestion:** Single handler model or sync on focus / use `activeElement`.

- **WCAG / basis:** 4.1.2; APG · **P2** · **Component default**  
  **Impact:** `aria-controls` points at scroll wrapper, not `listbox` root.  
  **Suggestion:** Stable `id` on listbox element.

- **WCAG / basis:** 4.1.2; Best practice · **P2** · **Consumer-dependent** / defaults  
  **Impact:** Placeholder as name; simultaneous `aria-label` + `aria-labelledby`.  
  **Suggestion:** Require real label; avoid placeholder as primary accname.

- **WCAG / basis:** 4.1.2; Best practice · **P2** · **Component default** (`MultiselectTrigger`)  
  **Impact:** `role="button"` wrapper around `role="combobox"` input.  
  **Suggestion:** Non-widget wrapper; single combobox focus target.

- **WCAG / basis:** APG only · **P2** · **Component default**  
  **Impact:** No `aria-autocomplete`.  
  **Suggestion:** Set per filter behavior (`list` / `inline`).

- **WCAG / basis:** 3.3.1; 3.3.2 · **P3** · **Consumer-dependent**  
  **Impact:** Error/hint not first-class on Combobox API.  
  **Suggestion:** Forward `aria-describedby`, `aria-invalid`.

- **WCAG / basis:** Best practice; Non-WCAG · **P3** · **Consumer-dependent**  
  **Impact:** No live region for filter counts.  
  **Suggestion:** Optional polite live region if needed.

---

### 5. Modal

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** `ModalHeader` + `onClose` — `<Button icon="close" />` without `tooltip` / `aria-label`.  
  **Impact:** Unnamed close button.  
  **Suggestion:** Pass `tooltip`/`aria-label` to `Button` or prop to forward.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `headerOptions.backButton` without extra labelling.  
  **Impact:** Unnamed back control.  
  **Suggestion:** Fix in `OverlayHeader` (shared).

- **WCAG / basis:** 4.1.2; 2.4.6 · **P1** · **Consumer-dependent** · **Repro:** Custom header or empty heading without `aria-labelledby` / composition `headingId` wiring.  
  **Impact:** Generic unnamed dialog.  
  **Suggestion:** Require name, dev validation, or auto-wire `ModalHeader` heading id to root.

- **WCAG / basis:** 2.1.2; Best practice / APG layering · **P2** · **Component default**  
  **Impact:** Escape path does not use `OverlayManager.isTopOverlay` like backdrop.  
  **Suggestion:** Pass real top-overlay flag into `closeOnEscapeKeypress`.

- **WCAG / basis:** 2.1.1 · **P2** · **Consumer-dependent** · **Repro:** No `onClose`, non-functional `backdropClose`, no header close.  
  **Impact:** Possible trap-like usage.  
  **Suggestion:** Document invalid usage; dev warn or default dismiss.

- **WCAG / basis:** APG only · **P3** · **Enhancement**  
  **Impact:** No `aria-describedby` on `Modal`.  
  **Suggestion:** Optional prop forwarded to dialog root.

- **WCAG / basis:** APG only · **P3** · **Enhancement**  
  **Impact:** Hard-coded `role="dialog"`; no `alertdialog`.  
  **Suggestion:** Optional `role` or dedicated variant.

---

### 6. Dialog

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Open Dialog — header close is icon-only; `Tooltip` wraps `Button` without `tooltip` on `Button`.  
  **Impact:** Unnamed dismiss control (inherited Modal pattern).  
  **Suggestion:** Pass `tooltip`/`aria-label` to `Button` (fix Modal).

- **WCAG / basis:** 4.1.2; 2.4.6 · **P1** · **Consumer-dependent** · **Repro:** Custom Modal usage / falsy `heading` without `aria-labelledby`.  
  **Impact:** Unnamed dialog.  
  **Suggestion:** Type/runtime guard or `aria-label` fallback.

- **WCAG / basis:** 1.3.1; APG · **P2** · **Component default**  
  **Impact:** `ModalDescription` not referenced via `aria-describedby` from dialog root.  
  **Suggestion:** Stable description id + `aria-describedby` on container.

- **WCAG / basis:** Best practice · **P2** · **Consumer-dependent**  
  **Impact:** `Dialog` does not forward `aria-labelledby` / `headingId` escape hatches.  
  **Suggestion:** Extend `DialogProps` to match `Modal`.

- **WCAG / basis:** Best practice / APG only · **P2** · **Component default**  
  **Impact:** `closeOnEscapeKeypress(..., true, ...)` hard-coded.  
  **Suggestion:** Use `OverlayManager.isTopOverlay`.

- **WCAG / basis:** APG only; Non-WCAG · **P3** · **Consumer-dependent**  
  **Impact:** No `role="alertdialog"` for urgent confirmations.  
  **Suggestion:** Optional prop with focus/escape documentation.

---

### 7. FullscreenModal

- **WCAG / basis:** 4.1.2; 2.4.4 · **P0** · **Component default** · **Repro:** `Tooltip` around close `Button` without `tooltip` on `Button`.  
  **Impact:** Unnamed close button.  
  **Suggestion:** Pass `tooltip`/`aria-label` to `Button`.

- **WCAG / basis:** 2.4.3; APG · **P1** · **Component default** · **Repro:** Tab with open modal — focus can escape while `aria-modal="true"`.  
  **Impact:** Conflicts with modal semantics vs Modal/Sidesheet.  
  **Suggestion:** Reuse Modal focus trap (capture Tab).

- **WCAG / basis:** 2.4.3; APG · **P1** · **Component default**  
  **Impact:** No programmatic initial focus or restore on close.  
  **Suggestion:** Mirror Modal open/close focus lifecycle with `OverlayManager`.

- **WCAG / basis:** 2.1.1; APG · **P1** · **Component default** · **Repro:** Omit `closeOnEscape` — no Escape listener.  
  **Impact:** No standard keyboard dismiss.  
  **Suggestion:** Default `closeOnEscape` true when open and top of stack.

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** Custom `header` without `aria-labelledby` / `aria-label` / string heading.  
  **Impact:** Unnamed dialog.  
  **Suggestion:** Document; dev warn when open without name sources.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `headerOptions.backButton` — same `OverlayHeader` pattern.  
  **Impact:** Unnamed back.  
  **Suggestion:** Shared `OverlayHeader` fix.

- **WCAG / basis:** 2.4.3; Best practice · **P2** · **Component default**  
  **Impact:** `OverlayFooter` focuses last button vs absent dialog-level focus strategy.  
  **Suggestion:** Coordinate with initial focus (`skipFocusOnOpen` or unified plan).

- **WCAG / basis:** 1.3.1; Best practice · **P3** · **Consumer-dependent**  
  **Impact:** Subheading not in `aria-describedby`.  
  **Suggestion:** Optional description id when instructions are essential.

---

### 8. Sidesheet

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Default open sidesheet — close `Button` in `Tooltip` without naming props on `Button`.  
  **Impact:** Unnamed dismiss control.  
  **Suggestion:** `tooltip`/`aria-label` on `Button`.

- **WCAG / basis:** 4.1.2; 1.3.1 · **P1** · **Component default** · **Repro:** Close animation — `onAnimationEnd={() => this.handleAnimationEnd}` does not invoke handler.  
  **Impact:** `state.open` / `aria-modal` / visibility can desync.  
  **Suggestion:** Call `handleAnimationEnd` (bound or `()` wrapper).

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** Custom header / no heading without `aria-labelledby`.  
  **Impact:** Unnamed dialog.  
  **Suggestion:** Document; optional dev warn.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `backButton` / `backIcon` — unnamed `OverlayHeader` button.  
  **Impact:** Same as Modal/FullscreenModal rollup.  
  **Suggestion:** Shared `OverlayHeader` fix.

- **WCAG / basis:** Best practice · **P2** · **Component default**  
  **Impact:** Escape uses hard-coded top overlay flag.  
  **Suggestion:** `OverlayManager.isTopOverlay(this.sidesheetRef.current)`.

- **WCAG / basis:** Best practice / APG only · **P2** · **Component default**  
  **Impact:** Backdrop without `aria-hidden`.  
  **Suggestion:** `aria-hidden="true"` on decorative backdrop when shown.

- **WCAG / basis:** 1.3.1 · **P3** · **Consumer-dependent**  
  **Impact:** Long subheading not associated as description.  
  **Suggestion:** Optional `aria-describedby` when essential.

---

### 9. Dropdown

- **WCAG / basis:** 4.1.2; APG · **P1** · **Component default** · **Repro:** Default trigger — no `aria-expanded` / `aria-haspopup` / `aria-controls`.  
  **Impact:** Popup relationship and state hidden from AT.  
  **Suggestion:** Wire to stable list/menu `id`.

- **WCAG / basis:** 2.1.1; APG · **P1** · **Component default** · **Repro:** Open list; Escape not handled in `DropdownList`.  
  **Impact:** No standard dismiss.  
  **Suggestion:** Escape closes and returns focus to trigger.

- **WCAG / basis:** 4.1.2; 2.4.3; APG · **P1** · **Component default** · **Repro:** Search + arrows — `cursor` updates without DOM focus / `aria-activedescendant`.  
  **Impact:** Active option not aligned with focus for SR.  
  **Suggestion:** One APG model: roving focus or `aria-activedescendant`.

- **WCAG / basis:** 2.4.3 · **P1** · **Component default** · **Repro:** Tab through many options — each `tabIndex={0}`.  
  **Impact:** Long tab chain.  
  **Suggestion:** Roving tabindex or `aria-activedescendant`.

- **WCAG / basis:** 4.1.1; 4.1.2; 1.3.1 · **P1** · **Component default** · **Repro:** Checkbox ids from `Date.getTime()` on render.  
  **Impact:** Unstable / colliding ids break label associations.  
  **Suggestion:** `useId` or stable per-instance ids.

- **WCAG / basis:** 4.1.2; Best practice · **P2** · **Consumer-dependent**  
  **Impact:** Both `aria-label` and `aria-labelledby` on list container.  
  **Suggestion:** Single naming mechanism.

- **WCAG / basis:** APG only · **P2** · **Component default**  
  **Impact:** Duplicate theme — trigger ↔ list `id` / `aria-controls` incomplete.  
  **Suggestion:** Stable list `id` + trigger `aria-controls`.

- **WCAG / basis:** 2.1.1; APG · **P2** · **Component default** (`menu={true}`)  
  **Impact:** Partial menu semantics vs APG keyboard model.  
  **Suggestion:** Full menu pattern or document limitations.

- **WCAG / basis:** 2.1.1; APG · **P2** · **Component default** (select-all row)  
  **Impact:** Cursor vs focus / checkbox `tabIndex` inconsistent.  
  **Suggestion:** Align cursor with focus or `aria-activedescendant`.

- **WCAG / basis:** 4.1.2; 2.1.1 · **P2** · **Consumer-dependent** (`customTrigger`)  
  **Impact:** Only `tabIndex` + ref merged.  
  **Suggestion:** Document contract or inject ARIA helper.

- **WCAG / basis:** 4.1.3; Best practice · **P3** · **Component default**  
  **Impact:** Loading/error without `aria-busy` / live region.  
  **Suggestion:** `aria-busy` + polite status for async state.

- **WCAG / basis:** 4.1.2; 1.3.1 · **P3** · **Consumer-dependent** (`optionRenderer`)  
  **Impact:** Custom options may omit roles/names.  
  **Suggestion:** Document required option contract.

---

### 10. EditableDropdown

- **WCAG / basis:** 4.1.2; 1.3.1 · **P1** · **Component default** · **Repro:** `Editable` `role="button"` wraps `DropdownButton` `<button>`.  
  **Impact:** Nested interactives; duplicate tab stops.  
  **Suggestion:** Single focus target; remove `role="button"` around full composite.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** Stock trigger — no `aria-expanded` (Dropdown).  
  **Impact:** Open state not exposed.  
  **Suggestion:** Fix Dropdown trigger wiring.

- **WCAG / basis:** 1.3.1; 4.1.2 · **P1** · **Component default** · **Repro:** Single-select rows — outer `<label htmlFor>` without id on focusable `role="option"` control.  
  **Impact:** Broken / ineffective label association.  
  **Suggestion:** Remove misuse; use APG listbox naming.

- **WCAG / basis:** 4.1.1; 4.1.2 · **P2** · **Component default**  
  **Impact:** Unstable ids (`getTime`) — same as Dropdown.  
  **Suggestion:** Stable id generation.

- **WCAG / basis:** Best practice · **P2** · **Consumer-dependent**  
  **Impact:** Listbox both `aria-label` and `aria-labelledby`.  
  **Suggestion:** Single primary name source.

- **WCAG / basis:** 2.4.3; Best practice · **P2** · **Component default**  
  **Impact:** Two tab stops (Editable + trigger).  
  **Suggestion:** Align with nested-interactive fix.

- **WCAG / basis:** 1.3.1; 3.3.2 · **P2** · **Consumer-dependent**  
  **Impact:** No first-class labelling API on molecule; stories omit label wiring.  
  **Suggestion:** Forward `aria-label` / `aria-labelledby` into `dropdownOptions`.

- **WCAG / basis:** Best practice / 4.1.3 · **P3** · **Component default**  
  **Impact:** Selection text change not announced.  
  **Suggestion:** Optional polite live region or intentional name updates.

---

### 11. Popover

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** Click trigger — no `aria-expanded` / `aria-controls` on trigger; no surface `id`.  
  **Impact:** Disclosure state and relationship missing for AT.  
  **Suggestion:** Stable id on surface; merge `aria-expanded` / `aria-controls` onto trigger.

- **WCAG / basis:** 2.1.1 · **P1** · **Component default** · **Repro:** Open popover; no Escape listener.  
  **Impact:** Keyboard users cannot dismiss via standard gesture.  
  **Suggestion:** Escape closes; optional focus return to trigger.

- **WCAG / basis:** 2.4.3 · **P1** · **Component default** · **Repro:** `appendToBody={true}` with focusables inside — Tab order skips portaled content.  
  **Impact:** Focus order vs visual stack misaligned.  
  **Suggestion:** Move focus on open / restore on close, or default in-tree when interactive.

- **WCAG / basis:** 2.4.3; Best practice · **P2** · **Component default** (interactive content)  
  **Impact:** No initial focus / restoration.  
  **Suggestion:** Pair with finding 3 — focus management for interactive panels.

- **WCAG / basis:** 1.3.1; 4.1.2 · **P2** · **Component default**  
  **Impact:** Surface is plain `div`; `data-*` not a name.  
  **Suggestion:** Optional `aria-label` / `aria-labelledby` or `role="region"` / dialog pattern when appropriate.

- **WCAG / basis:** HTML; Best practice · **P2** · **Component default**  
  **Impact:** `OutsideClick` wraps trigger in non-semantic `div`.  
  **Suggestion:** Merge handlers onto trigger when possible.

- **WCAG / basis:** 1.4.13; Best practice · **P2** · **Consumer-dependent / docs**  
  **Impact:** Hover-primary examples for interactive content.  
  **Suggestion:** Critical tasks on click; verify focus opens tooltip path.

- **WCAG / basis:** Best practice; 4.1.3 · **P3** · **Consumer-dependent**  
  **Impact:** Optional noisy `aria-live` for toggle.  
  **Suggestion:** Only if product needs explicit announcements.

---

### 12. Tooltip

- **WCAG / basis:** 4.1.2; APG only · **P1** · **Component default** · **Repro:** Portaled content has no `role="tooltip"`.  
  **Impact:** AT cannot classify surface as tooltip.  
  **Suggestion:** `role="tooltip"` on tooltip root.

- **WCAG / basis:** 1.3.1; 4.1.2 · **P1** · **Component default** · **Repro:** No tooltip `id`; trigger lacks `aria-describedby` when open.  
  **Impact:** Supplementary text not programmatically tied to control.  
  **Suggestion:** `useId`; merge/remove `aria-describedby` with open state; preserve existing ids.

- **WCAG / basis:** APG only; Best practice · **P2** · **Component default**  
  **Impact:** No Escape to dismiss tooltip.  
  **Suggestion:** Escape closes when open.

- **WCAG / basis:** HTML; Best practice · **P2** · **Component default**  
  **Impact:** `OutsideClick` `div` wrapper around trigger.  
  **Suggestion:** Merge to trigger when single focusable child.

- **WCAG / basis:** Best practice; 1.3.1 · **P3** · **Consumer-dependent**  
  **Impact:** Redundant name + description once wiring lands.  
  **Suggestion:** Document: tooltip elaborates, not duplicates, accname.

---

### 13. ChoiceList

- **WCAG / basis:** 4.1.2; 1.3.1 · **P1** · **Component default** · **Repro:** No `title`, `aria-label`, or `aria-labelledby`.  
  **Impact:** Unnamed fieldset.  
  **Suggestion:** Require group name in API or docs.

- **WCAG / basis:** 4.1.2; 1.3.1; HTML; APG · **P1** · **Component default** · **Repro:** Visible `title` via `Label` — orphan label, not legend / `aria-labelledby`.  
  **Impact:** Visible caption may not name fieldset in AT.  
  **Suggestion:** `<legend>` or title `id` + `fieldset aria-labelledby`.

- **WCAG / basis:** 4.1.2; 2.1.1 · **P1** · **Consumer-dependent** · **Repro:** Radio choices with different `name`.  
  **Impact:** Broken native radio grouping.  
  **Suggestion:** Single `name` on `ChoiceList` or dev warn.

- **WCAG / basis:** 4.1.2; 1.3.1 · **P1** · **Consumer-dependent** · **Repro:** Choice without `label` / help / `aria-label`.  
  **Impact:** Unnamed input.  
  **Suggestion:** Type or document requirement.

- **WCAG / basis:** Best practice; APG only · **P2** · **Component default**  
  **Impact:** Layout `div`s only — acceptable for AA.  
  **Suggestion:** No change unless list semantics required by DS.

- **WCAG / basis:** Non-WCAG · **P3** · **Component default**  
  **Impact:** `key={index}` reorder stability.  
  **Suggestion:** Stable keys from value/id.

---

### 14. Button

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** `selected={true}` without `aria-pressed`.  
  **Impact:** Toggle state not exposed to AT.  
  **Suggestion:** Map `selected` to `aria-pressed` when semantically toggle.

- **WCAG / basis:** 4.1.2; 2.4.6 · **P1** · **Component default** · **Repro:** `<Button loading>Save</Button>` — visible text `visibility:hidden` may drop from accname; spinner names control.  
  **Impact:** “Loading” without action identity.  
  **Suggestion:** Preserve label in accname (sr-only / `aria-label` / `aria-hidden` spinner).

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** Icon-only without `tooltip` / `aria-label` / children.  
  **Impact:** Unnamed button.  
  **Suggestion:** Dev warn or narrow types; document requirement.

- **WCAG / basis:** HTML; 1.3.1; Best practice · **P2** · **Component default** (`icon`)  
  **Impact:** `div` inside `button` invalid HTML.  
  **Suggestion:** `span` + CSS layout.

- **WCAG / basis:** Best practice; APG only · **P2** · **Component default** (icon + text)  
  **Impact:** Icon glyph not decorative — redundant announcements.  
  **Suggestion:** `aria-hidden` on `Icon` when children name the control.

- **WCAG / basis:** Best practice · **P2** · **Component default** (`loading`)  
  **Impact:** Nested `role="status"` inside `aria-busy` button — chatty AT.  
  **Suggestion:** Hide spinner from AT or non-live decorative spinner.

- **WCAG / basis:** HTML · **P2** · **Consumer-dependent** (forms)  
  **Impact:** Optional `type` defaults to submit in forms.  
  **Suggestion:** Default `type="button"` or document.

- **WCAG / basis:** Best practice · **P3** · **Component default** (icon + tooltip branch)  
  **Impact:** Docs clarity — tooltip vs `aria-label`.  
  **Suggestion:** Document `tooltip` sets accname for icon-only.

---

### 15. Link

- **WCAG / basis:** 4.1.2; 2.1.1; HTML; APG · **P1** · **Consumer-dependent** · **Repro:** `<Link onClick={…}>` without `href`.  
  **Impact:** Wrong or ambiguous control semantics vs button.  
  **Suggestion:** Require `href` or render `button` for actions.

- **WCAG / basis:** Best practice · **P2** · **Consumer-dependent**  
  **Impact:** `target="_blank"` without `rel` in examples.  
  **Suggestion:** Document `noopener noreferrer` / new-window disclosure.

- **WCAG / basis:** Best practice; 2.4.3 · **P2** · **Component default**  
  **Impact:** No `forwardRef` to anchor.  
  **Suggestion:** `forwardRef` into `GenericText` / `a`.

- **WCAG / basis:** HTML; Best practice · **P2** · **Component default**  
  **Impact:** Unconditional `tabIndex={0}` when enabled.  
  **Suggestion:** Omit when valid `href` present.

- **WCAG / basis:** APG only; Best practice · **P2** · **Component default** (`disabled`)  
  **Impact:** `aria-disabled` link approximation vs native disabled.  
  **Suggestion:** Document limits; strip `href` or alternate pattern when disabled.

- **WCAG / basis:** 4.1.2; 2.4.4 · **P2** · **Consumer-dependent** (icon-only / empty)  
  **Impact:** Weak or empty accessible name.  
  **Suggestion:** Docs / dev warn for meaningful name.

- **WCAG / basis:** HTML · **P3** · **Consumer-dependent**  
  **Impact:** `hreflang` vs React `hrefLang`.  
  **Suggestion:** Align public API.

- **WCAG / basis:** Non-WCAG · **P3** · **Internal**  
  **Impact:** `GenericText` typing — maintainability.  
  **Suggestion:** Narrow `componentType` for primitives.

---

### 16. LinkButton

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** `icon` with empty/whitespace `children` and no `aria-label`.  
  **Impact:** Unnamed control.  
  **Suggestion:** Enforce name when icon-only; types/docs.

- **WCAG / basis:** HTML; 1.3.1; Best practice · **P2** · **Component default** (`icon`)  
  **Impact:** `div` inside `button`.  
  **Suggestion:** `span` + flex CSS.

- **WCAG / basis:** Best practice; APG only · **P2** · **Component default** (icon + text)  
  **Impact:** Icon not `aria-hidden` — duplicate SR output.  
  **Suggestion:** Hide decorative icon when text names control.

- **WCAG / basis:** 2.4.4; 4.1.2; Best practice · **P2** · **Consumer-dependent**  
  **Impact:** Used for navigation — `button` not link semantics.  
  **Suggestion:** Document: actions only; use `Link` for URLs.

- **WCAG / basis:** Non-WCAG · **P3** · **Component default** (docs)  
  **Impact:** JSDoc vs `defaultProps` for `tabIndex`.  
  **Suggestion:** Align documentation with behavior.

---

## Maintenance

- Raw inputs: `aria-audits/raw-reports/`.
- Re-run aggregation after new subagent reports; adjust counts and backlog if findings are merged or superseded.

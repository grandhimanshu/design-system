# Sidesheet — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — sliding panel implemented as `role="dialog"` with `aria-modal`, focus containment (Tab), initial focus on first focusable (or container with `tabindex="-1"` when empty), Escape to dismiss, and return of focus when closed (via `OverlayManager.isTopOverlay`).
- **Implementation files (primary):**
  - `core/components/molecules/sidesheet/Sidesheet.tsx`
  - `core/components/molecules/sidesheet/index.tsx` (re-export)
- **Coupled building blocks:** `OverlayHeader`, `OverlayBody`, `OverlayFooter`; `Row`, `Column`, `Backdrop`, `OutsideClick` (when `backdropClose`), `Tooltip` + `Button`; `getWrapperElement`, `getUpdatedZIndex`, `closeOnEscapeKeypress`, `getFocusableElements`, `handleFocusTrapKeyDown` from `core/utils/overlayHelper.ts`; `OverlayManager` from `core/utils/OverlayManager.ts`; styles `css/src/components/sidesheet.module.css`.
- **Positive structural notes:** Uses `role="dialog"`, derives `aria-labelledby` from `headerOptions.heading` via auto-generated `sidesheet-title-{n}` or `headerOptions.headingId`, supports explicit `aria-labelledby` on `SidesheetProps`, registers document **capture** Tab handling for focus trap, moves focus on open (rAF + `animationstart` fallback), restores focus on close when this overlay is top of stack, and wires Escape on the dialog container subtree.

- **Root cause / rollup:** (1) **Icon-only header actions** use `Tooltip` around `Button` **without** passing `tooltip` or `aria-label` into `Button`, so `Button`’s built-in name derivation (`Button.tsx`: `aria-label` from `props['aria-label']` or `tooltip` when there are no children) does not run — same pattern as `FullscreenModal`. (2) **`onAnimationEnd` on `Row`** passes a handler that never invokes `handleAnimationEnd`, so internal `open` state may not transition to `false` after close, leaving visible / ARIA state inconsistent with the closed UI.

---

## Findings

### 1. Icon-only close button has no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P0**
- **Scope:** **Component default** (close control is always rendered for open sidesheets)
- **Repro:** Render `Sidesheet` with `open={true}` and default header; inspect `data-test="DesignSystem-Sidesheet--CloseButton"` — snapshot shows a `<button>` with icon only and **no** `aria-label` (`core/components/molecules/sidesheet/__tests__/__snapshots__/Sidesheet.test.tsx.snap`).
- **Issue + impact:** Assistive technologies announce an unnamed button; users cannot reliably identify the dismiss control.
- **Suggestion:** Pass `tooltip="Close"` or `aria-label="Close"` (or i18n equivalent) directly to `Button`, or rely on `Button`’s built-in branch (`icon && tooltip && !children`) so both hover tooltip and `aria-label` stay aligned.

---

### 2. `onAnimationEnd` never runs `handleAnimationEnd` — dialog may stay “open” in state and ARIA after close

- **WCAG / basis:** 4.1.2 Name, Role, Value (state out of sync); 1.3.1 Info and Relationships (exposure of role/state vs presentation)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** Close the sidesheet (`open` prop `true` → `false`); after the close animation, inspect the dialog node — `componentDidUpdate` sets `animate: false` but `handleAnimationEnd` is intended to call `setState({ open: false })` when the close animation ends; the handler is `onAnimationEnd={() => this.handleAnimationEnd}` which **returns the method reference** and does **not** call it (`Sidesheet.tsx` ~372).
- **Issue + impact:** `state.open` can remain `true` while `animate` is `false`, so `aria-modal` and `Sidesheet--open` / `visibility: visible` (see `.Sidesheet--open` in `sidesheet.module.css`) may not match the real “closed” state; assistive tech and keyboard users can see a stale modal dialog in the tree or inconsistent visibility.
- **Suggestion:** Use `onAnimationEnd={this.handleAnimationEnd}` (bound) or `onAnimationEnd={() => this.handleAnimationEnd()}`, and confirm `handleAnimationEnd` logic matches the intended open/close lifecycle.

---

### 3. Dialog can have no accessible name when using custom `header` or no string heading

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — consumers must pass `aria-labelledby` pointing at a visible heading `id`, or ensure `headerOptions.heading` is set so `OverlayHeader` renders a heading with `id` (`resolvedHeadingId` / `aria-labelledby` wiring in `Sidesheet.tsx` ~316–318).
- **Repro:** `header={<Custom />}` with no `aria-labelledby` and no `headerOptions.heading`; or `headerOptions={{}}` with no heading — `resolvedAriaLabelledBy` is `undefined`, so `aria-labelledby` is omitted on the `role="dialog"` container.
- **Issue + impact:** Screen readers expose an unnamed dialog; users cannot tell which panel opened.
- **Suggestion:** Document as required for custom header / empty heading; optionally add `aria-label` prop for string-only titles; dev-only warning when `open && !resolvedAriaLabelledBy`.

---

### 4. Back control in `OverlayHeader` (`backButton` / `backIcon`) is icon-only without a guaranteed name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Component default** when consumers use `headerOptions.backButton` or `headerOptions.backIcon` (implemented in `core/components/molecules/overlayHeader/OverlayHeader.tsx`, not unique to Sidesheet but affects Sidesheet flows)
- **Repro:** Enable `headerOptions.backButton` (or `backIcon`) — `Button` uses `icon="arrow_back"` with no `aria-label` / `tooltip` on `Button`.
- **Issue + impact:** Unnamed button; “back” action is not exposed to AT.
- **Suggestion:** Add `aria-label` / `tooltip` on the back `Button` inside `OverlayHeader`, or expose props for i18n labels (rollup with finding 1 — shared icon-only `Button` pattern).

---

### 5. `closeOnEscapeKeypress` invoked with `isTopOverlay` hardcoded to `true`

- **WCAG / basis:** Best practice (stacking / consistency with `onOutsideClickHandler`, which uses `OverlayManager.isTopOverlay`)
- **Severity:** **P2**
- **Scope:** **Component default** (implementation detail); practical risk is **low** because Escape is handled on the **dialog container** `keydown`, so events from focus inside a higher overlay typically do not target this subtree.
- **Issue + impact:** If focus ever lands inside this sidesheet while it is not the top overlay, Escape would still run `onClose` via this path, which can disagree with `OutsideClick` / manager semantics.
- **Suggestion:** Pass `OverlayManager.isTopOverlay(this.sidesheetRef.current)` as the second argument to `closeOnEscapeKeypress`, matching `onOutsideClickHandler`.

---

### 6. Backdrop node has no `aria-hidden`

- **WCAG / basis:** Best practice / APG only (inert backdrop semantics)
- **Severity:** **P2**
- **Scope:** **Component default**
- **Issue + impact:** The dimmed `Backdrop` is a sibling portal (`Backdrop.tsx`); it is not focusable by default, but explicitly marking decorative overlay layers `aria-hidden="true"` when open can reduce noise for some AT navigation modes.
- **Suggestion:** When backdrop is shown for modal context, set `aria-hidden="true"` on the backdrop element (and ensure it never contains focusable content).

---

### 7. Optional: expose `aria-describedby` for long descriptions

- **WCAG / basis:** 1.3.1 Info and Relationships (enhancement when subheading carries essential instructions)
- **Severity:** **P3**
- **Scope:** **Consumer-dependent**
- **Issue + impact:** `subHeading` in `OverlayHeader` is plain text without programmatic association to the dialog; usually the heading name suffices; subheading is optional context.
- **Suggestion:** If subheading is required for understanding the task, add optional `aria-describedby` on `Sidesheet` / wire `headerOptions` to an id on the subheading element — enhancement, not a default violation when subheading is supplementary.

---

## Implementation reference (audit scope)

| Area | Location |
|------|----------|
| Dialog container, ARIA, focus lifecycle | `Sidesheet.tsx` |
| Heading id + title markup | `OverlayHeader.tsx` |
| Focus trap / focusable query | `overlayHelper.ts` |
| Close / Tab keyboard | `Sidesheet.tsx` + `overlayHelper.ts` |
| Portal target | `getWrapperElement()` |
| Icon-only close | `Sidesheet.tsx` (`Tooltip` + `Button`) |
| Optional outside click wrapper | `OutsideClick.tsx` |

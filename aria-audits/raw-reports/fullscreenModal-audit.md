# FullscreenModal — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — `role="dialog"` with `aria-modal="true"`, expected focus containment, initial focus, Escape, and return of focus.
- **Implementation files (primary):**
  - `core/components/molecules/fullscreenModal/FullscreenModal.tsx`
  - `core/components/molecules/fullscreenModal/index.tsx` (re-export)
- **Coupled building blocks:** `OverlayHeader`, `OverlayBody`, `OverlayFooter`; `getWrapperElement`, `getUpdatedZIndex`, `closeOnEscapeKeypress` from `core/utils/overlayHelper.ts`; `OverlayManager` from `core/utils/OverlayManager`.
- **Root cause / rollup:** (1) This overlay does **not** reuse the focus-trap / initial-focus / focus-return lifecycle used by `Modal` and `Sidesheet` (`handleFocusTrapKeyDown`, `getFocusableElements`, `previousActiveElement`). (2) The **close control** uses `Tooltip` + icon-only `Button` **without** passing `tooltip` or `aria-label` to `Button`, so the trigger does not get `Button`’s built-in `aria-label` derivation (`Button.tsx` only applies `aria-label` from `props['aria-label']` or `tooltip` when there are no children).

---

## Findings

### 1. Icon-only close button has no guaranteed accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.4 Link Purpose (In Context) (control purpose)
- **Severity:** **P0**
- **Scope:** **Component default** (close affordance is always rendered when the modal is open)
- **Repro:** Open `FullscreenModal` as documented; inspect the header close control — `Button` has `icon="close"` only, wrapped in `Tooltip` with `tooltip="Close"`, but `Tooltip` does not pass `tooltip` into `Button`, so `aria-label` is absent unless consumers override the whole header (they cannot without forking the layout).
- **Issue + impact:** Screen readers announce an unnamed “button” (or only generic hints), so users cannot identify the dismiss action reliably.
- **Suggestion:** Pass `tooltip="Close"` (or `aria-label="Close"`) directly to `Button`, or use the `Button` pattern that auto-wraps with `Tooltip` **and** supplies `tooltip` to `ButtonElement` for `aria-label`. Prefer a stable, translated string prop if i18n matters.

---

### 2. No focus trap while `aria-modal="true"` is always set on the dialog container

- **WCAG / basis:** 2.4.3 Focus Order; APG only (modal dialog focus containment)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** With the modal open, press Tab repeatedly — focus can move to the underlying page while the dialog remains exposed as modal in the accessibility tree.
- **Issue + impact:** `aria-modal` signals assistive technologies to treat content outside the dialog as inert, but tab order is not confined; keyboard users can operate background controls inconsistently with the modal semantics, and behavior diverges from APG and from sibling `Modal` / `Sidesheet` in this codebase.
- **Suggestion:** Mirror `Modal`/`Sidesheet`: attach capture-phase `keydown` for Tab via `handleFocusTrapKeyDown`, scoped to the dialog content node (`ref` on a wrapper that includes header, body, footer).

---

### 3. No programmatic initial focus or focus restoration on close

- **WCAG / basis:** 2.4.3 Focus Order; APG only (focus management)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** Open the modal from a focused trigger; focus often remains on the opener or moves only if `OverlayFooter`’s effect focuses a footer button — not guaranteed for header-only or body-only content.
- **Issue + impact:** Users may not land inside the dialog; on close, focus is not returned to the element that opened the overlay, disrupting keyboard and screen reader workflow.
- **Suggestion:** On open, move focus to the first focusable in the dialog (or `tabindex="-1"` on the dialog container if empty), matching `Modal.activateFocusTrap`. On close, restore `document.activeElement` captured at open when this instance is still the top overlay (`OverlayManager.isTopOverlay`).

---

### 4. Escape to dismiss is gated on `closeOnEscape` with no default of `true`

- **WCAG / basis:** 2.1.1 Keyboard; APG only (Escape closes modal)
- **Severity:** **P1**
- **Scope:** **Component default** when `closeOnEscape` is omitted (falsy); **Consumer-dependent** if consumers explicitly set `closeOnEscape={false}`.
- **Repro:** Use `FullscreenModal` without `closeOnEscape` — `componentDidMount` / `componentDidUpdate` skip `keydown` registration; Escape does not call `onClose`.
- **Issue + impact:** Keyboard-only users may have no standard way to dismiss the overlay, unlike `Modal` where Escape handling is tied to the focus-trap lifecycle and `closeOnEscape` is documented as deprecated but defaulted.
- **Suggestion:** Default `closeOnEscape` to `true` and register Escape handling whenever the modal is open and top-of-stack (align with `Modal`), or document Escape as always-on and implement accordingly.

---

### 5. Dialog can render with no accessible name when using custom `header` without wiring labels

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — consumers must pass `aria-labelledby` (with a visible heading `id`), `aria-label`, or use `headerOptions.heading` so `resolvedHeadingId` / `aria-labelledby` are set.
- **Repro:** `header={<Custom />}` with no `aria-labelledby` / `aria-label` and no string heading — `resolvedAriaLabelledBy` and `resolvedAriaLabel` are both unset.
- **Issue + impact:** Assistive technologies expose a dialog with no name; users cannot tell which dialog opened.
- **Suggestion:** Document as required; optionally `console.warn` in dev when `open && !ariaLabelledBy && !ariaLabel && !resolvedHeadingId`. Stories such as `__stories__/Custom.story.jsx` already model `aria-labelledby` + `Heading id` — keep that as the contract.

---

### 6. Back / icon-only control in `OverlayHeader` lacks an accessible name when `backButton` / `backIcon` is used

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Component default** for the `headerOptions.backButton` / `backIcon` variant (used by `FullscreenModal` when consumers enable it)
- **Repro:** Enable `headerOptions.backButton` with no additional labeling — `OverlayHeader` renders `Button` with `icon="arrow_back"` only.
- **Issue + impact:** Unnamed button; purpose (“back”) is not exposed to AT.
- **Suggestion:** Add `aria-label` (and/or `tooltip` on `Button` for consistency with design system patterns) in `OverlayHeader`, or expose props for consumers to set the back action name.

---

### 7. `OverlayFooter` focus-on-open may compete with absent dialog-level focus strategy

- **WCAG / basis:** 2.4.3 Focus Order; Best practice
- **Severity:** **P2**
- **Scope:** **Component default** when both `footer` / `footerOptions` exist and `open` toggles
- **Issue + impact:** `OverlayFooter` focuses the last “basic” secondary button in a `requestAnimationFrame` when `open` is true and `skipFocusOnOpen` is not set (`FullscreenModal` does not pass `skipFocusOnOpen`). Without a document-level focus plan, this can surprise users (e.g. skip over header/close) or race with future initial-focus logic.
- **Suggestion:** When adding dialog-level initial focus, pass `skipFocusOnOpen` on `OverlayFooter` (as `Modal`/`Sidesheet` patterns do where needed) or unify on a single focus target strategy.

---

### 8. Optional `aria-describedby` only — no automatic association for inline descriptions

- **WCAG / basis:** 1.3.1 Info and Relationships; Best practice
- **Severity:** **P3** (enhancement)
- **Scope:** **Consumer-dependent**
- **Issue + impact:** Subheading in `OverlayHeader` is plain text, not referenced from `aria-describedby`; usually acceptable when subheading is still in the dialog reading order.
- **Suggestion:** If long instructions must be summarized for SR users, expose an optional `descriptionId` or extend `aria-describedby` documentation.

---

## Positive notes (structural)

- **Unique title id:** `fullscreen-modal-title-${fullscreenModalInstanceCounter}` avoids duplicate `id`s for auto-wired headings.
- **`role="dialog"` + `aria-modal={true}`** on the same node that wraps header/body/footer is structurally appropriate.
- **Resolved naming path** when `headerOptions.heading` is used: `headingId` / auto id flows to `OverlayHeader` → `Heading id` → `aria-labelledby` on the dialog.
- **Escape stack awareness:** When `closeOnEscape` is enabled, `OverlayManager.isTopOverlay` prevents lower overlays from reacting — correct pattern for stacking.

---

## Files referenced

```266:283:core/components/molecules/fullscreenModal/FullscreenModal.tsx
    const ModalContainer = open ? (
      <div
        data-test="DesignSystem-FullscreenModalContainer"
        className={ContainerClass}
        data-layer={true}
        style={{ zIndex }}
      >
        <div
          data-test="DesignSystem-FullscreenModal"
          {...baseProps}
          className={classes}
          ref={this.modalRef}
          role="dialog"
          aria-modal={true}
          aria-labelledby={resolvedAriaLabelledBy}
          aria-label={resolvedAriaLabel}
          aria-describedby={ariaDescribedBy}
        >
```

```298:307:core/components/molecules/fullscreenModal/FullscreenModal.tsx
                <Column className="flex-grow-0">
                  <Tooltip tooltip="Close">
                    <Button
                      icon="close"
                      appearance="transparent"
                      data-test="DesignSystem-FullscreenModal--CloseButton"
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        if (onClose) onClose(event, 'IconClick');
                      }}
                    />
                  </Tooltip>
                </Column>
```

```166:172:core/components/molecules/fullscreenModal/FullscreenModal.tsx
  componentDidMount() {
    if (this.props.closeOnEscape) {
      if (this.state.open) {
        OverlayManager.add(this.modalRef.current);
      }
      document.addEventListener('keydown', this.onCloseHandler);
    }
  }
```

```79:87:core/components/molecules/overlayHeader/OverlayHeader.tsx
        {(backButton || backIcon) && (
          <Button
            data-test="DesignSystem-OverlayHeader--Button"
            appearance="transparent"
            className="mr-4"
            icon="arrow_back"
            largeIcon={true}
            onClick={backButtonCallback || backIconCallback}
          />
        )}
```

```189:190:core/components/atoms/button/Button.tsx
      aria-label={props['aria-label'] || (!children && tooltip ? tooltip : undefined)}
      {...rest}
```

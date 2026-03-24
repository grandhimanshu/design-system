# Dialog — structural ARIA / semantic audit

## Component overview

- **Public API:** `Dialog` is a thin, opinionated wrapper around `Modal` (`core/components/molecules/dialog/Dialog.tsx`). It always supplies `headerOptions.heading`, a custom `footer` with two text-labeled buttons, and body content via `ModalDescription`.
- **Underlying pattern:** [WAI-ARIA APG Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — implemented in `core/components/molecules/modal/Modal.tsx`: `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap (`core/utils/overlayHelper.ts`), Escape-to-close (gated by `OverlayManager`), initial focus on first focusable in the dialog container, restore focus on close when this overlay is top.
- **Related files:** `core/components/molecules/modal/Modal.tsx`, `core/components/molecules/modalDescription/ModalDescription.tsx`, `core/components/molecules/overlayHeader/OverlayHeader.tsx`, `core/components/molecules/overlayFooter/OverlayFooter.tsx`, `core/components/molecules/overlayBody/OverlayBody.tsx`, `core/components/atoms/outsideClick/OutsideClick.tsx`, `core/components/atoms/backdrop/Backdrop.tsx`, `core/components/atoms/column/Column.tsx` (dialog root is a `<div>` with `role="dialog"`), `core/utils/overlayHelper.ts`, `core/utils/OverlayManager.tsx`.

**Root cause / rollup:** Several findings trace to **`Modal`’s header close control**: an icon-only `Button` is wrapped in `Tooltip` **without** passing the `Button`’s `tooltip` prop, so `Button` does not derive `aria-label` from tooltip text (see `core/components/atoms/button/Button.tsx`). The same pattern affects any consumer of `Modal` with `headerOptions` / default header, including `Dialog`.

---

## Findings

### 1. Icon-only header close button has no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P0
- **Scope:** Component default (for `Dialog` and for `Modal` whenever the default header + close affordance is shown).
- **Repro:** Open `Dialog` (or `Modal` with `headerOptions` and `onClose`) and inspect the close control; the `<button>` has no `aria-label` / visible text — only an icon.
- **Issue + impact:** Screen reader users get an unnamed “button” for the primary dismiss control in the dialog chrome, so purpose and outcome are unclear.
- **Suggestion:** Pass `tooltip="Close"` (or equivalent) **to** `Button`, or set an explicit `aria-label` on `Button`, instead of relying on an outer `Tooltip` wrapper alone (tooltip content is not guaranteed to name the control).

---

### 2. Dialog / Modal can render a dialog with no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.6 Headings and Labels (supporting)
- **Severity:** P1
- **Scope:** Consumer-dependent.
- **Repro:** Use `Modal` with a custom `header` and no `aria-labelledby`, or omit / pass a falsy `headerOptions.heading` without `aria-labelledby` / `headingId`; use `Dialog` with `heading` omitted or undefined (typed as `ModalHeaderProps['heading']`, which is optional).
- **Issue + impact:** `aria-labelledby` resolves to `undefined`, so `role="dialog"` may have no computed accessible name; assistive tech cannot reliably announce what the window is for.
- **Suggestion:** Require a name in types or runtime (e.g. assert `aria-labelledby` or non-empty `heading` when using `role="dialog"`), or fall back to `aria-label` when no labelled heading exists.

---

### 3. Body copy (`ModalDescription`) is not associated with the dialog via `aria-describedby`

- **WCAG / basis:** 1.3.1 Info and Relationships; APG pattern (supporting)
- **Severity:** P2
- **Scope:** Component default for `Dialog` (which always renders `ModalDescription` when `title` / `description` are used); same gap for any `Modal` body that carries essential instructions.
- **Repro:** TBD — verify in Storybook / docs with SR: open `Dialog` with `title` and `description`; the dialog name comes from the header, but supplementary text is not referenced from the dialog root.
- **Issue + impact:** Instructions and supporting text remain in the document, but the dialog’s **programmatic** description relationship is weaker than APG’s recommended `aria-describedby` wiring; some AT may not treat title/description as part of the dialog’s primary announcement context.
- **Suggestion:** Give the description region a stable `id` and pass `aria-describedby` on the dialog container when `title`/`description` (or equivalent) are present; allow consumers to pass additional ids via `Modal` props if needed.

---

### 4. `Dialog` does not expose `Modal`’s `aria-labelledby` / `headerOptions.headingId` escape hatch

- **WCAG / basis:** Best practice (robust naming / flexibility)
- **Severity:** P2
- **Scope:** Consumer-dependent (only matters when the default `heading` → `aria-labelledby` wiring is insufficient, e.g. label lives outside the auto-generated heading id).
- **Issue + impact:** Consumers must switch to `Modal` to set `aria-labelledby` or a custom `headingId`, reducing API parity for accessibility customization on the deprecated but still exported `Dialog`.
- **Suggestion:** Extend `DialogProps` to forward `aria-labelledby` and/or `headerOptions.headingId` to `Modal` / `headerOptions`.

---

### 5. `closeOnEscapeKeypress` is invoked with a hard-coded “top overlay” flag

- **WCAG / basis:** Best practice / APG only (correct stacking behavior under nested overlays)
- **Severity:** P2
- **Issue + impact:** `onCloseHandler` calls `closeOnEscapeKeypress(event, true, this.onOutsideClickHandler)` while actual “is top overlay” is enforced inside `onOutsideClickHandler`. This is easy to misread and could regress if listeners or event paths change for stacked overlays.
- **Suggestion:** Pass `OverlayManager.isTopOverlay(this.modalRef.current)` (or equivalent) as the second argument so the helper’s contract matches real behavior, or inline Escape handling next to the overlay manager check.

---

### 6. Optional `role="alertdialog"` for high-interruption confirmations

- **WCAG / basis:** APG only / Non-WCAG
- **Severity:** P3 (enhancement)
- **Scope:** Consumer-dependent (destructive / alert-style flows).
- **Issue + impact:** `Dialog`/`Modal` always use `role="dialog"`. Critical confirmations sometimes benefit from `role="alertdialog"` per APG (with careful focus management).
- **Suggestion:** Optional prop to set `role="alertdialog"` when product/a11y review calls for it; document cautions (focus, Escape, announcements).

---

## Dialog-specific default-path summary

For documented `Dialog` usage with a non-empty `heading` and text button labels: the **primary structural blocker** in default use is still the **unnamed icon close button** in underlying `Modal` (finding 1). Optional `title` / `description` are not wired with `aria-describedby` (finding 3).

---

## Out of scope (per audit charter)

Color contrast, focus ring CSS, touch targets, motion — not evaluated here.

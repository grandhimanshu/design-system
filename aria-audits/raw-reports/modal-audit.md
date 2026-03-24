# Modal — structural ARIA / semantic audit
## Component overview
- **APG pattern:** [Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — focus management, modal behavior, and an accessible **name** for the dialog are required.
- **Primary implementation:** `core/components/molecules/modal/Modal.tsx` (class component, portals into `.Overlay-wrapper`, `role="dialog"` on the sizing `Column`).
- **Composition pieces:** `ModalHeader.tsx`, `ModalBody.tsx`, `ModalFooter.tsx`, `index.tsx`.
- **Shared dependencies:** `core/utils/overlayHelper.ts` (focus trap, Escape → close callback), `core/utils/OverlayManager.tsx` (stacking / “top overlay”), `core/components/molecules/overlayHeader/OverlayHeader.tsx`, `OverlayBody`, `OverlayFooter`, `Column`, `Backdrop`, `OutsideClick`, `Button`, `Tooltip`.
**Root cause / rollup:** Several issues trace to **icon-only `Button` instances without `tooltip` or `aria-label`**: the **composition** header path (`ModalHeader`) and the **declarative** header path (`OverlayHeader` back control). The recommended API path wraps the close control in `Tooltip` and supplies an effective name; the other paths do not.
---
## Findings
### 1. Icon-only close control in `ModalHeader` has no accessible name
- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P0
- **Scope:** **Component default** for the documented **composition** API (`ModalHeader` + `ModalBody` / `ModalFooter`).
- **Repro:** Use `Modal` with `<ModalHeader onClose={…} heading="…" />` as in stories/tests; inspect the close control in the accessibility tree.
- **Issue + impact:** `ModalHeader` renders `<Button icon="close" … />` with **no** `tooltip` and **no** `aria-label`. `Button` derives `aria-label` from `tooltip` only when there are no text children, so the control is exposed as a button **without an accessible name**. Screen-reader users cannot tell that it closes the dialog.
- **Suggestion:** Mirror the declarative header path: pass `tooltip="Close"` (and/or an explicit `aria-label`) to the close `Button`, or require consumers to pass `aria-label` via an optional prop forwarded to `Button`.
---
### 2. `headerOptions` / `OverlayHeader` back control can be icon-only without a name
- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P1
- **Scope:** **Component default** when `headerOptions.backButton` / `backIcon` is used without additional labeling.
- **Repro:** Open a modal with `headerOptions={{ backButton: true, backButtonCallback: … }}` (no `heading` required for the control to render).
- **Issue + impact:** `OverlayHeader` renders an icon-only `Button` (`icon="arrow_back"`) with **no** `tooltip` or `aria-label`. The same `Button` naming logic applies, so the control may have **no accessible name** while being focusable in the tab order inside the dialog.
- **Suggestion:** Add `aria-label` (e.g. “Back”) and/or `tooltip` on that `Button` inside `OverlayHeader`, or document that callers must pass an accessible name via extended props if you expose them.
---
### 3. Dialog can lack an accessible name (`aria-labelledby` / labeling wiring)
- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.6 Headings and Labels (AA) where the dialog name is the “label” for the window
- **Severity:** P1
- **Scope:** **Consumer-dependent** — breaks when required labeling props / content are omitted or not wired together.
- **Repro:** (a) `headerOptions={{}}` or options with no `heading` and no `aria-labelledby` on `Modal`; (b) `header={<CustomHeader />}` without `Modal`’s `aria-labelledby` pointing at visible title text; (c) composition: `<ModalHeader heading="Title" />` **without** coordinating `headingId` on `ModalHeader` **and** `aria-labelledby` on `Modal` (heading text has no `id`, so the dialog cannot reference it).
- **Issue + impact:** The dialog `Column` always has `role="dialog"`. `resolvedAriaLabelledBy` is only set from `aria-labelledby`, `headerOptions.headingId`, or an auto-generated id when `headerOptions.heading` is set **and** there is no custom `header`. In the gaps above, `aria-labelledby` can be absent while the dialog is open and exposed, so assistive tech may announce a **generic “dialog” with no name**.
- **Suggestion:** Require or default a name: e.g. validate in dev, default `aria-label` when no labelled heading exists, or document that `aria-labelledby` (or `heading` + internal id wiring) is mandatory and ensure composition auto-wires `ModalHeader`’s heading id to the root dialog’s `aria-labelledby`.
---
### 4. Escape → close path does not use `OverlayManager.isTopOverlay` (unlike backdrop)
- **WCAG / basis:** 2.1.2 No Keyboard Trap / predictable dismissal — **Best practice** / APG layering robustness (not a clear AA failure if DOM stacking prevents duplicate handlers).
- **Severity:** P2
- **Scope:** **Component default** for Escape handling implementation consistency.
- **Issue + impact:** `onCloseHandler` calls `closeOnEscapeKeypress(event, true, this.onOutsideClickHandler)`, so Escape is always treated as if this instance were the top overlay. Backdrop click uses `OverlayManager.isTopOverlay(this.modalRef.current)`. If multiple overlays ever share a single bubbling path or future refactors nest containers, Escape could dismiss the wrong layer or behave inconsistently with pointer dismissal.
- **Suggestion:** Pass `OverlayManager.isTopOverlay(this.modalRef.current)` (or equivalent) as the second argument to align Escape with backdrop semantics.
---
### 5. Escape / outside dismiss may no-op if `onClose` and functional `backdropClose` are absent
- **WCAG / basis:** 2.1.1 Keyboard (if the user cannot dismiss an open modal by keyboard); **Consumer-dependent**
- **Severity:** P2
- **Scope:** **Consumer-dependent** — risky when `open={true}` with no header (no built-in close button), no `onClose`, and `backdropClose` not a function / false.
- **Repro:** TBD — verify in Storybook: modal with only static body content, no `onClose`, `backdropClose={false}`.
- **Issue + impact:** `onOutsideClickHandler` only invokes `onClose` or a function `backdropClose`. If neither is provided, Escape still runs `closeOnEscapeKeypress` but the handler performs **no** state update. Combined with no visible dismiss control, users may be unable to exit via keyboard or pointer (depending on content).
- **Suggestion:** Document as invalid usage, assert/warn in dev, or provide a default dismiss path when `open` is controlled internally (if applicable).
---
### 6. No first-class `aria-describedby` (or description slot) on `Modal`
- **WCAG / basis:** APG only / Best practice (supplementary description for complex dialogs)
- **Severity:** P3
- **Scope:** **Enhancement** — optional for many simple dialogs.
- **Issue + impact:** APG recommends associating supplementary text with `aria-describedby` when there is instructional or contextual copy. `Modal` exposes `aria-labelledby` but not a parallel prop for description ids.
- **Suggestion:** Add optional `aria-describedby` (and/or `aria-details`) forwarded to the dialog container via `extractBaseProps` / explicit prop.
---
### 7. No way to choose `role="alertdialog"` for high-attention confirmations
- **WCAG / basis:** APG only
- **Severity:** P3
- **Scope:** **Enhancement** / consumer workaround (wrap content or use another component).
- **Issue + impact:** Destructive or urgent confirmations are often modeled as `alertdialog` per APG. `Modal` hard-codes `role="dialog"`.
- **Suggestion:** Optional `role` prop (default `dialog`) with types narrowed to `dialog` | `alertdialog`, or a dedicated `AlertModal` variant.
---
## Positive observations (structural)
- **Dialog shell:** Root dialog uses `role="dialog"` and ties `aria-modal` to `open`, matching visible `display` behavior (`Modal--open` vs `display: none` when closed), which generally keeps closed instances out of the accessibility tree.
- **Naming path (declarative API):** With `headerOptions.heading`, the component generates a stable `modal-title-{n}` id and passes `headingId` into `OverlayHeader`, so `aria-labelledby` can reference real heading text.
- **Focus trap:** `activateFocusTrap` / `deactivateFocusTrap` pair document-level capture `keydown` for Tab with `handleFocusTrapKeyDown`, and return focus to `previousActiveElement` when still the top overlay — aligned with APG expectations.
- **Declarative close control:** Close `Button` in `Modal.tsx` is wrapped in `Tooltip` with `tooltip="Close"`, which flows into `Button`’s `aria-label` for the icon-only case — good contrast with `ModalHeader`’s omission.
---
## Files reviewed
| Path | Role |
|------|------|
| `core/components/molecules/modal/Modal.tsx` | Dialog container, ARIA, focus trap, portal |
| `core/components/molecules/modal/ModalHeader.tsx` | Composition header + close |
| `core/components/molecules/modal/ModalBody.tsx` | Body wrapper (`OverlayBody`) |
| `core/components/molecules/modal/ModalFooter.tsx` | Footer wrapper (`OverlayFooter`) |
| `core/components/molecules/modal/index.tsx` | Public exports |
| `core/utils/overlayHelper.ts` | Focusable query, Tab trap, Escape helper |
| `core/utils/OverlayManager.tsx` | Overlay stack / top detection |
| `core/components/molecules/overlayHeader/OverlayHeader.tsx` | Heading + back button |
---
*Audit scope: structural DOM / ARIA / keyboard wiring only (no contrast, focus ring CSS, motion, or hit-target review).*

# Modals Overlays Feedback

This document contains the P0 (Critical) and P1 (High) ARIA audit issues for Modals Overlays Feedback.

**Total P0/P1 issues in this group:** 27 (**P0:** 2 · **P1:** 25)

| Component | P0 | P1 | Total |
| :--- | :---: | :---: | :---: |
| FullscreenModal | 0 | 2 | 2 |
| PopperWrapper / Popover | 0 | 4 | 4 |
| Modal | 2 | 1 | 3 |
| EmptyState | 0 | 1 | 1 |
| Tooltip | 0 | 3 | 3 |
| Message | 0 | 2 | 2 |
| OutsideClick | 0 | 2 | 2 |
| Sidesheet | 0 | 1 | 1 |
| StatusHint | 0 | 1 | 1 |
| HelpText | 0 | 1 | 1 |
| InlineMessage | 0 | 1 | 1 |
| Label | 0 | 1 | 1 |
| OverlayHeader | 0 | 1 | 1 |
| ProgressBar | 0 | 1 | 1 |
| ProgressRing | 0 | 1 | 1 |
| Spinner | 0 | 1 | 1 |
| Toast | 0 | 1 | 1 |
| **Column totals** | **2** | **25** | **27** |

---

## 1. FullscreenModal

### 1. P1 - No focus trap, initial focus, or focus restoration
- **Repro:** Repro: TBD — verify in Storybook / docs (Tab order escapes the dialog; focus does not move into the dialog on open; focus not returned to trigger on close—contrast with `core/components/molecules/modal/Modal.tsx` which calls `activateFocusTrap` / `deactivateFocusTrap`).
- **Issue + impact:** Keyboard users can tab into the obscured page while `aria-modal="true"` is set; opening does not move focus into the dialog; closing does not restore context—disorientation and extra effort for SR users.
- **Suggestion:** Reuse the same focus lifecycle as `Modal` (container ref, `handleFocusTrapKeyDown` on capture phase, initial focus on `aria-labelledby` target or dialog container, `restoreFocusToElementIfConnected` on close/unmount).

---

### 2. P1 - Escape closes only when `closeOnEscape` is truthy (no default)
- **Repro:** Repro: TBD — verify in Storybook / docs (open modal without `closeOnEscape`, press Escape; no `keydown` listener is registered unless `closeOnEscape` is true—see `componentDidMount` / `componentWillUnmount` in `FullscreenModal.tsx`).
- **Issue + impact:** Standard dialog dismissal via Escape is unavailable unless consumers opt in; differs from `Modal`, where Escape is always handled for accessibility.
- **Suggestion:** Always register Escape handling while open (respecting `OverlayManager.isTopOverlay`), default `closeOnEscape` to true or deprecate false the same way as `Modal`.

---

## 2. PopperWrapper / Popover

### 1. P1 - Trigger does not reflect open/closed state (`aria-expanded`, `aria-controls`, `aria-haspopup`)
- **Repro:** Use `PopperWrapper` / `Popover` with a typical trigger; inspect the wrapper and child trigger—no `aria-expanded` mirroring `open`, no `aria-controls` pointing at the floating node, no `aria-haspopup` reflecting the type of popup.
- **Issue + impact:** Assistive technologies cannot reliably report whether the popup/disclosure is open or which element it controls. Users lose parity with the visual “open” state.
- **Suggestion:** Generate a stable `id` for the floating root, `cloneElement` or merge props so the reference node receives `aria-expanded={open}`, `aria-controls={popupId}`, and an appropriate `aria-haspopup` (e.g. `dialog`, `listbox`, `true`). Ensure the floating root exposes that `id` and controlled `open` stays in sync.

---

### 2. P1 - Keyboard activation relies on child trigger; non-focusable or improperly named triggers fail
- **Repro:** Fails when used with a non-interactive element as a trigger without keyboard support or accessible name, or when opening depends on clicking a non-focusable region of the wrapper.
- **Issue + impact:** Users who cannot use a pointer or rely on keyboard navigation may be unable to open, toggle, or identify the surface. Click-only `div` triggers are a common integration mistake.
- **Suggestion:** Prefer native `<button type="button">` (or documented requirement) for the trigger; or merge `onKeyDown` on the reference wrapper / cloned trigger to handle Enter/Space. Document that the trigger must be focusable and have an accessible name.

---

### 3. P1 - No focus management when content is portaled (`appendToBody`)
- **Repro:** Open an interactive popover portaled to `body` with a focusable trigger; Tab from the trigger follows document order and may reach the portaled subtree only after traversing intervening focusables. Closing via Escape does not restore focus to the reference.
- **Issue + impact:** Keyboard users can open the popover but may struggle to reach its controls predictably; focus order diverges from the perceived “popup next to trigger” UI. On close, focus may land unpredictably.
- **Suggestion:** Coordinate `focus()` into the floating region on open (or move focus to the first focusable), trap focus while open (for modal-like surfaces), and return focus to the trigger on close. Document `appendToBody={false}` when in-flow order is required, or implement roving tabindex consistent with APG.

---

### 4. P1 - Hover mode + portaled content: `onBlur` on the reference wrapper conflicts with focusing the popup
- **Issue + impact:** Keyboard users may be unable to use interactive hover-styled popovers, or the surface may flicker closed. This undermines WCAG-aligned “content on hover or focus” expectations.
- **Suggestion:** Use `focusin`/`focusout` with checks that `relatedTarget` is inside the floating node (portal), or a single focus scope containing both reference and popup; alternatively treat keyboard-opened hover surfaces like click mode for focus lifecycle.

---

## 3. Modal

### 1. P0 - Composition pattern: dialog has no accessible name though `ModalHeader` shows a heading
- **Repro:** Fails when `Modal` is used with `<ModalHeader heading="…" />` as a child and **without** `aria-labelledby` on `Modal`—the `[role="dialog"]` `Column` gets `aria-labelledby={undefined}` while a visible heading exists only inside children.
- **Issue + impact:** Assistive technologies announce an unnamed dialog even though a visual title is present; users cannot reliably identify the dialog in the accessibility tree.
- **Suggestion:** Auto-resolve the dialog name for composition (e.g. require `ModalHeader` to register `headingId` with context, or document and enforce `aria-labelledby` pointing at the same id as `ModalHeader`’s `headingId` / `OverlayHeader` heading); or deprecate composition with a dev warning when an open dialog has no `aria-labelledby` / `aria-label`.

---

### 2. P0 - `ModalHeader` close `Button` (icon-only) has no accessible name
- **Repro:** Fails when `ModalHeader` is rendered as documented—the close control is `Button` with `icon="close"` only (`core/components/molecules/modal/ModalHeader.tsx`).
- **Issue + impact:** Screen readers and voice control lack a programmatic name for the primary dismiss control in the composition API.
- **Suggestion:** Add `aria-label="Close"` (or localized equivalent) and/or mirror the declarative path’s `Tooltip` pattern so `Button`’s implicit label logic can apply.

---

### 3. P1 - Custom `header` / `children`-only content without `aria-labelledby` or `aria-label`
- **Repro:** Fails when `Modal` uses `header={<Text>Title</Text>}` (or similar) and no `aria-labelledby` / no `headerOptions.heading` auto-id path.
- **Issue + impact:** Visible title is not exposed as the **dialog**’s accessible name.
- **Suggestion:** Document required `aria-labelledby` (or extend `ModalProps` with optional `aria-label`); optionally warn in dev when `open` and dialog has no resolvable accessible name.

---

## 4. EmptyState

### 1. P1 - Title uses `<span>` (via `Text`) for non-`standard` sizes — heading structure lost
- **Repro:** Use documented compound API with `EmptyState size="compressed"` (or `tight`) and `EmptyState.Title` as in `__stories__/sizes/Compressed.story.jsx` — title is not a heading in the DOM.
- **Issue + impact:** `EmptyStateTitle` switches to `Text` → `GenericText` with `componentType="span"` for every size except `standard`. Users who navigate by headings or rely on a coherent document outline will not find the empty-state title as a heading; relationship to the surrounding page heading hierarchy is weakened.
- **Suggestion:** Render a heading element for the title for all sizes (e.g. always use `Heading`, or use `Heading` with a prop for visual size / level). If design requires non-heading visuals, still expose a heading with an appropriate level (or `aria-level` if ever using a role workaround — native heading level is preferred).

---

## 5. Tooltip

### 1. P1 - Tooltip surface lacks `role="tooltip"` and is not exposed as a describable region
- **Repro:** Render `<Tooltip tooltip="Extra help" position="top"><Button>OK</Button></Tooltip>`; open on hover/focus and inspect the floating node — it is a `<div data-test="DesignSystem-Tooltip-Wrapper">` with no `role`.
- **Issue + impact:** Assistive technologies do not treat the floating content as a **tooltip**; users may not hear the string as **descriptive** content tied to the trigger, or may get inconsistent behavior across SR/browser combinations compared to a proper tooltip role.
- **Suggestion:** On the tooltip root element (the `Tooltip` wrapper `div`), set `role="tooltip"`. Ensure the tooltip is **not** made tabbable and does not contain focusable descendants (current `Text`/`span` usage is fine).

---

### 2. P1 - No `id` on the tooltip and no `aria-describedby` on the trigger
- **Repro:** Same as finding 1; inspect the `<button>` (or other trigger) while the tooltip is visible — no `aria-describedby` pointing at the floating description.
- **Issue + impact:** Supplementary text visible on hover/focus to sighted users is **not reliably exposed** as the accessible **description** of the control, so screen-reader users may miss instructions, hints, or clarifications that are not redundant with the control’s accessible name.
- **Suggestion:** Generate a stable unique `id` per Tooltip instance (e.g. `React.useId()`), apply it to the tooltip root. `cloneElement` the trigger `children` (or extend `PopperWrapper` to merge props into the real trigger) to set `aria-describedby` to that id while the tooltip is open, merging with any existing `aria-describedby` from the consumer (space-separated list). When the tooltip is unmounted/closed, remove or avoid leaving a stale id reference.

---

### 3. P1 - Keyboard access depends on the trigger being focusable
- **Repro:** Use `<Tooltip …><span>Label</span></Tooltip>` with no `tabIndex` — pointer hover may still show the tooltip (depending on hit target / wrapping), but keyboard users cannot focus the trigger to mirror “hover or focus” behavior.
- **Issue + impact:** Users who rely on keyboard navigation may **never see** the tooltip if the trigger is not focusable.
- **Suggestion:** Document that the **trigger must be a focusable element** (native button/link or `tabIndex={0}` with appropriate **accessible name** and keyboard semantics). Optionally warn in dev or enforce via types/docs for the `children` slot.

---

## 6. Message

### 1. P1 - Root API omits `id` and `aria-`*; blocks `aria-describedby` / `aria-errormessage` wiring on the message node
- **Repro:** Fails when a team renders `<Message appearance="alert" title="Error" description="Invalid value" />` next to an input and needs `aria-errormessage` / `aria-describedby` pointing at the message container — the root `div` has no supported `id` prop and no spread of HTML/ARIA attributes.
- **Issue + impact:** Validation and hint text patterns often require a stable `id` on the feedback container. Without it, consumers must wrap `Message` in an extra element; that works but duplicates layout/CSS concerns and is easy to get wrong. Assistive tech may still read nearby text, but the association is not robust.
- **Suggestion:** Extend `MessageProps` with `BaseHtmlProps<HTMLDivElement>` (or a curated subset: at least `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-atomic`, `role`) and merge onto the root after stripping component-only keys; or add an explicit optional `id` prop and document wiring from controls.

---

### 2. P1 - Live region can be empty while still exposing `role="status"` or `role="alert"`
- **Repro:** Fails when `Message` is used with `description=""`, no `title`, and no `children` (TypeScript still allows `description: ''` as a `string`).
- **Issue + impact:** The root keeps `role="status"` or `role="alert"` with only an icon marked `aria-hidden="true"`, so assistive technologies can expose an alert/status with no message text. That is confusing and wastes assertive interruptions for `alert` / `warning`.
- **Suggestion:** Omit `role` (or use `role="none"` / no implicit live region) when there is no non-empty textual content; or require non-empty `description`/children in types and runtime dev warning; or provide a fallback `aria-label` only when content exists.

---

## 7. OutsideClick

### 1. P1 - `removeEventListener` does not match the registered listener (capture flag)
- **Repro:** Mount `OutsideClick` in React 18 Strict Mode or unmount/remount; duplicate `document` capture listeners can accumulate because removal omits `capture: true`.
- **Issue + impact:** The effect adds `document.addEventListener('click', handleOutsideClick, true)` but removes with `document.removeEventListener('click', handleOutsideClick)` (defaults to **bubble** phase). Per the DOM spec, the listener is **not removed**. Users can see **duplicate `onOutsideClick` invocations**, **memory leaks**, and **ordering bugs** with other document-level handlers—undermining reliable dismiss behavior around modals and popovers.
- **Suggestion:** Call `removeEventListener` with the **same capture boolean** as `addEventListener` (e.g. `removeEventListener('click', handleOutsideClick, true)`), or register both add/remove via an options object consistently.

---

### 2. P1 - Stale `onOutsideClick` and stale `handleOutsideClick` (empty `useCallback` / `useEffect` deps)
- **Repro:** Use `<OutsideClick onOutsideClick={() => …}>` with a callback that depends on props/state that change after mount; after parent re-renders, outside clicks still run the **first-render** callback.
- **Issue + impact:** `handleOutsideClick` is memoized with `[]` and closes over the **initial** `onOutsideClick`. The `useEffect` that attaches the document listener also has `[]` and captures the **initial** `handleOutsideClick`. Parent updates to `onOutsideClick` are ignored. Inline handlers in real apps (e.g. `Select`’s `const onOutsideClickHandler = () => { onOutsideClick?.(); }`) get a **new function each render**, but the document listener keeps calling the **stale** closure—so optional `onOutsideClick` from props may never reflect updates, and close/focus logic can be wrong.
- **Suggestion:** Store `onOutsideClick` in a **ref** updated each render and read it inside a stable listener, or depend `useEffect` on a stable wrapper that always calls the latest callback; ensure the effect **re-subscribes** or uses a single function that reads refs.

---

## 8. Sidesheet

### 1. P1 - Custom `header` (or title only in children) without `aria-labelledby` / `aria-label` on the dialog
- **Repro:** Fails when `Sidesheet` is used with `header={<…>Title…</…>}` and **without** `'aria-labelledby'` pointing at that title’s `id` (and without a supported auto-heading path).
- **Issue + impact:** Screen readers announce an unnamed dialog despite a visible header; users cannot reliably identify the surface in the accessibility tree.
- **Suggestion:** Document required `'aria-labelledby'` (or `headerOptions.heading` + default header) for all open sidesheets; optionally add dev-only warning when `open && !aria-label && !aria-labelledby` on the dialog; consider a small `SidesheetTitle` helper with a generated `id` + context, similar to patterns used elsewhere in the design system.

---

## 9. StatusHint

### 1. P1 - Root API omits `id` and `aria-`*; blocks robust programmatic association
- **Repro:** Fails when a form or table caption must reference the status hint element with `aria-describedby` pointing at the hint’s `id`, or when teams need `aria-label` on the non-clickable root for context — props are not merged onto the root.
- **Issue + impact:** Consumers must wrap `StatusHint` in an extra element to host `id` / `aria-`*, which complicates layout and risks skipping the pattern in practice. Assistive technologies may still infer nearby relationships from reading order, but programmatic association is not supported on the component root.
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or a curated allowlist: at least `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-atomic`) and merge onto the root after stripping component-only keys; or document a required wrapper pattern for association.

---

## 10. HelpText

### 1. P1 - Programmatic association missing in primary docs and in-repo composition
- **Repro:** Use HelpText as in `Components/HelpText/All` or `With Error` beside `Select`/`Input` without `aria-describedby` / `aria-errormessage` and a stable shared `id`; or use `TextFieldWithInput` / `TextFieldWithTextarea`, which render `<HelpText />` without passing HelpText’s `id` into the input/textarea’s ARIA props.
- **Issue + impact:** Help text and error text are visible but often **not exposed as the control’s accessible description or error message**, so screen reader users may not hear them in context with the field when exploring by control or when the UA maps `aria-describedby` / `aria-errormessage`.
- **Suggestion:** Update stories and `RenderHelpText` to use an explicit `id` on HelpText and pass it to the field (`aria-describedby` for non-error; `aria-invalid` + `aria-errormessage` for error). Consider a small composed pattern or docs that enforce the same.

---

## 11. InlineMessage

### 1. P1 - Consumers cannot set `role`, `aria-live`, or other `aria-`* on the component root
- **Repro:** Fails when a form reveals `<InlineMessage appearance="alert" description="…" />` only after failed submit, focus remains in the input, and no wrapper sets `aria-live` / `role="alert"` — screen reader users may not hear the new error. Repro: TBD — verify in Storybook / a real form flow.
- **Issue + impact:** `InlineMessageProps` extends `BaseProps` only; the implementation spreads `extractBaseProps(props)`, which **omits** all `aria-`* and `role`. Teams must wrap the component in an extra element to add `aria-live` or `role="alert"`, which is easy to miss and duplicates layout concerns.
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or a curated subset: `role`, `aria-live`, `aria-atomic`, `aria-relevant`) and spread `...rest` onto the root `div` after stripping component-specific keys; **or** add documented props such as `announce` / `live` that apply `role="alert"` / `aria-live="polite"` for error/info variants. Align internal docs: `accessibilityProps.ts` currently lists `InlineMessage` under “manage a11y internally,” which is misleading given the narrow root API.

---

## 12. Label

### 1. P1 - Supplementary `info` is delivered via a hover-only tooltip; trigger is not keyboard-operable
- **Repro:** Render `<Label info="Password must be 8 characters">Password</Label>` with a matching `htmlFor`; use keyboard only (no pointer) — the tooltip does not open on focus; the `<i>` icon is not inserted into the tab order because `Icon` is used without `onClick`, so `useAccessibilityProps` does not add `tabIndex`.
- **Issue + impact:** Supplementary instructions may be **visible only on hover** for sighted users, and the **tooltip layer** is not exposed through an equivalent keyboard/focus path. Screen reader users may still encounter the `aria-label` on the icon while browsing the label subtree (see finding 2), but **keyboard-only sighted users** are left without the timed tooltip content.
- **Suggestion:** Use a focus + hover (or click) trigger for the popper, ensure the trigger is a native `<button type="button">` (or focusable control with `aria-expanded` / `aria-controls` if using a disclosure pattern), and align with APG tooltip / disclosure guidance. Alternatively, surface `info` as persistent text or as `aria-describedby` on the associated control (consumer wiring or a composed field API).

---

## 13. OverlayHeader

### 1. P1 - Back `Button` (`icon="arrow_back"`) has no accessible name when `backButton` or `backIcon` is true
- **Repro:** Fails when `OverlayHeader` is used with `backButton={true}` / `backIcon={true}` and callbacks, as in documented tests (`core/components/molecules/overlayHeader/__tests__/OverlayHeader.test.tsx`).
- **Issue + impact:** Screen readers announce an unnamed button; voice control users lack a reliable speakable name. Keyboard behavior is native (`<button>`) but the **name** channel is empty.
- **Suggestion:** Set a default `aria-label` (e.g. “Back”) and/or `tooltip="Back"` on that `Button` so `Button`’s existing logic can populate `aria-label`; allow an optional prop for i18n (e.g. `backButtonAriaLabel`).

---

## 14. ProgressBar

### 1. P1 - No accessible name on the progressbar; no supported way to add one
- **Repro:** Fails when `ProgressBar` is used as documented with only `value`, `max`, and `size` (e.g. tests and typical stories) — the root has `role="progressbar"` and value attributes but **no** accessible name.  
- **Issue + impact:** Assistive technologies announce role and values (e.g. “progress bar, 50%”) without context (“Upload”, “Saving…”). Multiple unnamed progress bars are indistinguishable. Consumers cannot attach an external visible label via `aria-labelledby` because `id` / `aria-labelledby` are dropped at the root.  
- **Suggestion:** Extend props with `aria-label` and/or `aria-labelledby` (and forward `id` if needed), or spread a constrained set of `React.HTMLAttributes<HTMLDivElement>` after internal `aria-value*` wiring. For parity with `ProgressRing`, consider a **overridable** default `aria-label` only if product accepts a generic fallback; prefer explicit consumer-provided names for task-specific progress.

---

## 15. ProgressRing

### 1. P1 - No supported way to align accessible name with visible label or to disambiguate multiple rings
- **Repro:** Fails when `ProgressRing` is used beside visible text such as “Profile completion: 75%” with no programmatic link and no way to override `aria-label` / set `aria-labelledby` via props (current API).
- **Issue + impact:** Screen reader users hear a generic name that may not match on-screen wording (2.5.3 risk where the ring is treated as the labeled control), and multiple instances are indistinguishable by name in the accessibility tree.
- **Suggestion:** Extend props to accept an accessible name API (e.g. optional `aria-label`, or `aria-labelledby` / `aria-describedby`, or `label` that sets `aria-label` when no `aria-labelledby` is provided). Prefer `aria-labelledby` when a visible label exists in the same view.

---

## 16. Spinner

### 1. P1 - Empty `aria-label` removes the accessible name
- **Repro:** Fails when `<Spinner appearance="primary" size="medium" aria-label="" />` is used without `aria-labelledby` pointing to a valid labelling element.
- **Issue + impact:** The element keeps `role="status"` but can end up with no effective accessible name, so screen readers may not convey what is loading.
- **Suggestion:** Treat empty string like “unset” and fall back to the default `"Loading"`, or omit `role="status"` / naming when intentionally decorative (see enhancement below). Document that an empty `aria-label` is invalid.

---

## 17. Toast

### 1. P1 - Root API omits `id` and `aria-*`; blocks stable relationships on the live region node
- **Repro:** Fails when a team mounts `<Toast title="Saved" message="…" />` (or error copy) and needs the toast root to be the ID target for a live association from the control that triggered it — `ToastProps` does not extend `BaseHtmlProps`, and the root does not spread arbitrary HTML/ARIA attributes.
- **Issue + impact:** Relationships that should target the live region must use a wrapper `div` with `id` / `aria-`*, which duplicates layout concerns and is easy to miswire. Assistive technologies may still hear the toast via `role` + live region behavior, but programmatic wiring to this node is not supported by the component API.
- **Suggestion:** Extend `ToastProps` with `BaseHtmlProps<HTMLDivElement>` (or a curated subset: at least `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, optional `role` / `aria-live` / `aria-atomic` overrides) and merge onto the root; document stacking / `aria-live` politeness for multiple toasts.
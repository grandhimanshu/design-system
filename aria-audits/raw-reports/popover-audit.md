# Popover — structural ARIA / semantic audit

## Implementation files

| Role | Path |
|------|------|
| Public API & popover surface markup | `core/components/molecules/popover/Popover.tsx` |
| Barrel export | `core/components/molecules/popover/index.tsx` |
| Positioning, trigger wiring, open/close, portal | `core/components/atoms/popperWrapper/PopperWrapper.tsx` |
| Trigger wrapper (outside click + event handlers) | `core/components/atoms/outsideClick/OutsideClick.tsx` |
| Styles (visual only; out of scope for this audit) | `css/src/components/popover.module.css` |
| Documented usage examples | `core/components/molecules/popover/__stories__/*`, `docs/src/pages/components/popover/usage.mdx` |

**APG / pattern:** Closest match is a **custom disclosure / popover** (supplementary content anchored to a trigger). It is **not** implemented as the native `popover` attribute pattern. Interactive popovers overlap with **non-modal dialog** expectations from APG when they contain focusable controls.

**Root cause / rollup:** `PopperWrapper` + `Popover` optimize for positioning and pointer/hover behavior. They do **not** map open/closed state to ARIA on the trigger, do **not** assign an exposed `id` to the floating surface, and default to **portaling to `document.body`**, which breaks a predictable tab sequence when the popover holds focusables. Several gaps share this single “positioning layer without disclosure semantics or keyboard shell” root cause.

---

## Findings

### 1. Missing `aria-expanded` (and relationship) on the trigger for click-driven disclosure

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** P1
- **Scope:** Component default (click / controlled `open` with `on="click"`)
- **Repro:** Fails when `Popover` is used as documented with `<Button>` trigger and `on="click"` (e.g. `__stories__/index.story.jsx` custom code, Menu/Actions/Inputs stories): assistive tech cannot read expanded/collapsed state from the component-supplied wiring.
- **Issue + impact:** `PopperWrapper.getTriggerElement` only forwards `ref` and pointer/click handlers (and hover/focus handlers in hover mode). It does not set `aria-expanded` from `open`, nor `aria-controls` pointing at the popover surface. Screen reader users lose the state that sighted users see when the panel opens/closes.
- **Suggestion:** Generate a stable `id` for the popover container, render it on the surface element in `Popover.tsx`, and merge onto `trigger` (via `React.cloneElement`) `aria-expanded={open}` and `aria-controls={id}` when `on === 'click'` (and when not `disabled`). Document optional `aria-labelledby` / label props if consumers need a named region/dialog.

---

### 2. No `Escape` key handler to dismiss an open popover

- **WCAG / basis:** 2.1.1 Keyboard
- **Severity:** P1
- **Scope:** Component default
- **Repro:** Fails for keyboard-only users when the popover is open (`on="click"` or controlled): there is no `keydown` listener in `PopperWrapper` / `Popover`; dismissal relies on outside click or trigger toggle.
- **Issue + impact:** APG-style popovers and non-modal dialogs typically close on **Escape**. Users who cannot use a pointer may have difficulty dismissing the layer without tabbing away or activating the trigger again, especially when focus is inside portaled content.
- **Suggestion:** On open, register a document/window `keydown` listener (or attach to the popover node) for `Escape` and call the same close path as `outsideClick` / `onToggle(false, …)`, with cleanup on close/unmount. Optionally move focus back to the trigger when closing from keyboard (see finding 4).

---

### 3. Default `appendToBody={true}` breaks focus order when the popover contains focusable elements

- **WCAG / basis:** 2.4.3 Focus Order
- **Severity:** P1
- **Scope:** Component default for interactive content; mitigated if consumers set `appendToBody={false}` and verify DOM order
- **Repro:** Fails when using documented patterns with form controls inside the popover (e.g. “Popover With Input” story): trigger is in the main document flow while the popover is portaled to the end of `body`, so **Tab** from the trigger typically moves to the next focusable in the main page, not into the overlay.
- **Issue + impact:** Keyboard users experience focus order that does not follow the visual stacking order; controls inside the popover are hard to reach in a predictable sequence.
- **Suggestion:** For popovers that contain focusables, either default to in-tree rendering when possible, or implement **focus move to the first focusable** in the panel on open and **restore focus** to the trigger on close (APG non-modal dialog pattern). Document that `appendToBody={true}` + interactive children requires explicit focus management or `appendToBody={false}`.

---

### 4. No initial focus move or focus restoration for interactive popovers

- **WCAG / basis:** 2.4.3 Focus Order; Best practice (APG non-modal dialog / composite widgets)
- **Severity:** P2
- **Scope:** Component default when content is interactive; less critical for static text-only panels
- **Repro:** TBD — verify in Storybook with “Popover With Input” / “Popover With Action” and keyboard-only navigation.
- **Issue + impact:** Even when users reach the popover content, opening/closing does not manage focus, increasing disorientation and click-trap-adjacent behavior in complex pages.
- **Suggestion:** Pair with finding 3: on open, `focus()` first tabbable or the surface if `tabIndex={-1}`; on close, return focus to the trigger (store `document.activeElement` or trigger ref).

---

### 5. Popover surface is a plain `<div>` with no accessible name or landmark role

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value (mild, context-dependent)
- **Severity:** P2
- **Scope:** Component default; severity rises if consumers omit headings/text that names the region
- **Repro:** TBD — verify with screen reader when panel contains only controls with no heading.
- **Issue + impact:** The floating panel in `Popover.tsx` is a `div` with `data-test`, `data-layer`, `data-opened`, and `data-name` only. `data-*` is not exposed as an accessible name. Users may not get a clear “region” boundary unless children include headings or labels.
- **Suggestion:** Support optional `aria-label` / `aria-labelledby` on the popover wrapper, or recommend/document a visible heading with `id` referenced by `aria-labelledby`. Consider `role="region"` when appropriate, or `role="dialog"` + `aria-modal="false"` for rich interactive content (with keyboard behavior from findings 2–4).

---

### 6. Trigger wrapped in a non-semantic `div` (`OutsideClick`)

- **WCAG / basis:** HTML; Best practice
- **Severity:** P2
- **Scope:** Component default
- **Repro:** TBD — verify with SR + rotor/landmarks; ensure trigger still exposes correct role from child.
- **Issue + impact:** `OutsideClick` renders a wrapping `div` with `className` and event handlers. The real control remains the child (`button`, etc.), which is usually fine, but the extra wrapper can complicate styling hit targets and, in edge cases, ref composition if consumers rely on refs on the trigger for external ARIA wiring.
- **Suggestion:** Prefer merging outside-click behavior onto the trigger via `cloneElement` when the trigger is a single element that accepts ref + handlers, or use the native `popover` API / a single wrapper that does not duplicate interactive handlers on an ancestor of `<button>`.

---

### 7. Hover-driven default examples and `hoverable` content

- **WCAG / basis:** 1.4.13 Content on Hover or Focus (context-dependent); Best practice
- **Severity:** P2
- **Scope:** Consumer-dependent / documentation (e.g. main `all` story uses `on="hover"`)
- **Repro:** Hover-only or hover-primary patterns without a click alternative can hide essential information from users who cannot hover (and some touch/AT setups).
- **Issue + impact:** Stories default to hover; supplementary text may be fine, but docs encourage “interactive elements” inside popovers—those should not be hover-only for essential tasks.
- **Suggestion:** Document that critical actions must use `on="click"` or a persistent pattern; ensure hover mode still opens on **focus** (PopperWrapper already wires `onFocus` / `onBlur` alongside hover for the trigger wrapper—verify across trigger types).

---

### 8. Optional: live region announcements for open/close

- **WCAG / basis:** Best practice; 4.1.3 Status Messages (only if status is essential and not conveyed elsewhere)
- **Severity:** P3 (enhancement — not a violation if content is perceivable when focused)
- **Scope:** Consumer-dependent
- **Issue + impact:** Opening/closing is not announced via `aria-live`; usually acceptable if focus management and naming are correct.
- **Suggestion:** Only add `aria-live` if product requirements need explicit announcements; avoid noisy polite regions for every toggle.

---

## Summary counts

- **P0:** 0  
- **P1:** 3  
- **P2:** 4  
- **P3:** 1 (enhancement)

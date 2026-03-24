# Divider, Backdrop, OutsideClick, PopperWrapper — structural ARIA / semantic audit

## Severity summary (this report)

**0 P0** · **3 P1** · **6 P2** · **3 P3** (P3 includes positive baselines)

### Prioritized backlog (by impact)

| Area | P1 | P2 | P3 |
|------|----|----|-----|
| **OutsideClick** | 2 | 0 | 0 |
| **Divider** | 1 | 1 | 1 |
| **PopperWrapper** | 0 | 3 | 0 |
| **Backdrop** | 0 | 2 | 2 |

### Deduped themes

- **`extractBaseProps` + narrow `BaseProps` on Divider / Backdrop** — neither primitive forwards arbitrary `aria-*`, `role`, `id`, or other HTML attributes; authors cannot adjust exposure or naming without forking or wrapping.
- **Layer / dismiss utilities (`OutsideClick`, PopperWrapper)** — correctness of dismiss behavior (listeners, stale closures, pointer vs keyboard) affects modal and popover stacks more than raw ARIA roles on the wrapper nodes themselves.

---

## Implementation scope

| Component | Primary file(s) | Barrel |
|-----------|-----------------|--------|
| **Divider** | `core/components/atoms/divider/Divider.tsx` | `core/components/atoms/divider/index.tsx` |
| **Backdrop** | `core/components/atoms/backdrop/Backdrop.tsx` | `core/components/atoms/backdrop/index.tsx` |
| **OutsideClick** | `core/components/atoms/outsideClick/OutsideClick.tsx` | _(exported via `@/index`; locate with grep)_ |
| **PopperWrapper** | `core/components/atoms/popperWrapper/PopperWrapper.tsx` | `core/components/atoms/popperWrapper/index.tsx` |

Supporting / reviewed files:

| File | Role |
|------|------|
| `css/src/components/divider.module.css` | Visual rule (horizontal line / vertical bar); no `outline` / focus styles (non-interactive). |
| `css/src/components/backdrop.module.css` | `display: none` / `visibility: hidden` when closed; `touch-action: none` when open. |
| `core/utils/types.tsx` | `BaseProps`, `extractBaseProps` (**only** `className` + `data-test`); `BaseHtmlProps` used by OutsideClick. |
| `core/index.tsx` | Public exports for `Backdrop`, `OutsideClick`, etc. |

Tests/stories (sampled for default DOM output):

| Path | Note |
|------|------|
| `core/components/atoms/divider/__tests__/Divider.test.tsx` | Asserts classes / `data-test`. |
| `core/components/atoms/backdrop/__tests__/Backdrop.test.tsx` | Open / animation classes. |
| `core/components/molecules/popover/Popover.tsx` | Primary consumer of `PopperWrapper`. |

---

## Component overview

| Component | DOM / role model | Structural ARIA notes |
|-----------|------------------|------------------------|
| **Divider** | Native `<hr>` + `aria-orientation` | Maps to **separator** semantics in accessibility APIs; must not be used as a generic layout spacer without considering AT exposure. |
| **Backdrop** | Empty `<div>` portaled to `document.body`, `data-layer` / `data-opened` | Non-focusable; hidden from tree when `display: none`. No `role` / `aria-*` on the node itself — inert overlay behavior is coordination with parent (Modal, Sidesheet). |
| **OutsideClick** | Wrapper `<div>` + document `click` listener (capture) | No widget role; pass-through of `BaseHtmlProps` allows consumer `aria-*`. Behavior bugs (listener cleanup, stale callbacks) affect dismiss and thus focus return / reading order indirectly. |
| **PopperWrapper** | `react-popper` **Manager / Reference / Popper**; trigger wrapped in **OutsideClick** `<div>`; popup **cloned** child portaled when `appendToBody` | Primitive positioning + open state; **no** `aria-haspopup`, `aria-expanded`, or `aria-controls` on the wrapper — correct for a layout primitive, but consumers must supply APG semantics on the **trigger** and popup. |

---

## Findings — Divider

### D-1. Native `<hr>` + `aria-orientation` — structurally sound for a *thematic* separator

- **WCAG / basis:** `4.1.2` (Name, Role, Value) — **HTML** / **APG** (separator pattern when meaningful)
- **Severity:** **P3** (positive baseline)
- **Scope:** **Component default**
- **Repro:** Render `<Divider />` — tree exposes an `hr` with horizontal orientation (implicit + `aria-orientation="horizontal"`).
- **Issue + impact:** Default markup matches a non-interactive separator; no spurious `tabindex` or button-like roles.
- **Suggestion:** Keep native `<hr>`; document that this is for semantic section breaks, not arbitrary flex gutters.

---

### D-2. No passthrough of HTML / ARIA attributes — authors cannot mark decorative instances or override exposure

- **WCAG / basis:** `1.3.1` (Info and Relationships) — **Best practice**; decorative noise **1.3.1** / **APG** (separator vs presentation)
- **Severity:** **P1** (author flexibility gap; becomes AA-relevant when `hr` is purely decorative layout)
- **Scope:** **Component default**
- **Repro:** Attempt to render `<Divider aria-hidden="true" />` or `role="none"` — props are **not** declared on `DividerProps` and are **discarded** (only `vertical`, `appearance`, `className`, `extractBaseProps` outputs are applied).
- **Issue + impact:** Purely visual dividers may still be exposed as separators, adding verbosity; authors cannot suppress or relabel without an extra wrapper element (which may weaken heading/landmark structure).
- **Suggestion:** Extend with `BaseHtmlProps<HTMLHRElement>` (or `Omit` conflicting props) and spread `...rest` onto `<hr>`, merging `className`; document recommended `role="none"` / `aria-hidden="true"` for decorative cases.

---

### D-3. Vertical orientation on `<hr>` — uncommon but valid; layout still relies on CSS height context

- **WCAG / basis:** **HTML** / **APG** (orientation on separator)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** (layout + semantics)
- **Repro:** `<Divider vertical />` — `aria-orientation="vertical"` is set; parent must give the `hr` vertical space (flex row, fixed height, etc.) or the control collapses visually while still being announced as a vertical separator.
- **Issue + impact:** Mismatch between visual presence and separator semantics if height collapses; keyboard users unaffected (non-focusable).
- **Suggestion:** Document required parent layout; optionally warn in docs when `vertical` is used outside a definite block-axis size.

---

## Findings — Backdrop

### B-1. Hidden from assistive technologies when closed (`display: none`)

- **WCAG / basis:** `4.1.2` — **HTML** / **Best practice**
- **Severity:** **P3** (positive)
- **Scope:** **Component default**
- **Repro:** `open={false}` after close timeout — `.Backdrop` uses `display: none` and `visibility: hidden` (see `backdrop.module.css`).
- **Issue + impact:** Inert overlay is not exposed when dismissed; avoids empty focusable-less clutter in the tree.
- **Suggestion:** Keep; ensure parents manage **inert** / **aria-modal** on the actual dialog surface (Modal/Sidesheet), not on Backdrop alone.

---

### B-2. No `role`, `aria-hidden`, or `aria-label` on the backdrop node

- **WCAG / basis:** `4.1.2`, APG dialog / modal — **Best practice** / **APG only**
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** (stacking with page content)
- **Repro:** Inspect open Modal: Backdrop is a bare `<div>`; sibling dialog carries dialog semantics in parent implementations.
- **Issue + impact:** The dimmed layer itself is correctly non-interactive for AT, but authors cannot pass `aria-*` through `BackdropProps` (only `BaseProps` + `open` + `zIndex`). Unusual patterns (e.g. announcing “dimmed layer” or tying to `aria-controls`) require a fork or wrapper.
- **Suggestion:** If product needs configurable semantics, add optional `aria-hidden={true}` default when used strictly as visual scrim, or extend props with `BaseHtmlProps` for the portal root.

---

### B-3. Body scroll lock side effect — unrelated to ARIA tree but affects mobile / zoom context

- **WCAG / basis:** `2.4.3` (Focus Order) / `2.4.11` (Focus Not Obscured) — **Non-WCAG structural** (behavioral)
- **Severity:** **P2**
- **Scope:** **Component default** when `open`
- **Repro:** Toggle `open` — `useEffect` sets `document.body` overflow `hidden` with `important` while open.
- **Issue + impact:** Can interact with sticky UI and focus visibility; not an ARIA attribute issue but affects real-world a11y QA for modal stacks.
- **Suggestion:** Ensure parent components restore focus and use `inert` on background where supported; align with design-system modal audit recommendations.

---

## Findings — OutsideClick

### O-1. `removeEventListener` omits capture flag — listener may **not** be removed

- **WCAG / basis:** **Non-WCAG** (implementation correctness; indirect **2.1.1** / **2.4.3** if duplicate handlers fire erratically)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** Mount `OutsideClick`, unmount — `addEventListener('click', handler, true)` vs `removeEventListener('click', handler)` without third argument `true`. Per HTML spec, the subscription remains.
- **Issue + impact:** Leaked listeners across route changes cause duplicate `onOutsideClick` invocations, stale closures, and unpredictable dismiss behavior (focus trap / modal close).
- **Suggestion:** Use `removeEventListener('click', handleOutsideClick, true)` (or extract stable handler ref) so teardown matches registration.

---

### O-2. Stale `onOutsideClick` — `useCallback(..., [])` + `useEffect(..., [])` ignores prop updates

- **WCAG / basis:** `2.4.3`, `3.2.4` — **Best practice** (consistent behavior)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** Render with `onOutsideClick={handlerA}`, change to `handlerB` without remount — document clicks still invoke `handlerA`.
- **Issue + impact:** Wrong close path (e.g. missing focus return, wrong `aria-live` update) when parent state identity changes; especially harmful inside animated or keyed modal trees.
- **Suggestion:** Depend on `onOutsideClick` in `useCallback` / `useEffect`, or read latest callback from a ref updated each render.

---

### O-3. Generic wrapper `<div>` — acceptable; consumers may set `role` / `aria-*` via `rest`

- **WCAG / basis:** `4.1.2` — **HTML**
- **Severity:** **P3** (positive)
- **Scope:** **Component default**
- **Repro:** `OutsideClickProps extends BaseHtmlProps<HTMLDivElement>` — spreading `{...rest}` onto the root allows `role`, `aria-modal` (on wrong element—discourage), `data-*`, etc.
- **Issue + impact:** None for default; flexibility is good.
- **Suggestion:** Document that the wrapper is **non-focusable** and should not replace dialog/document structure; semantics belong on dialog panels.

---

## Findings — PopperWrapper

### P-1. Trigger wrapped in extra `<div>` (`OutsideClick` + `PopperWrapper-trigger`) — APG state must live on the real control

- **WCAG / basis:** `4.1.2` — **APG** (combobox, menu button, disclosure)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent**
- **Repro:** `getTriggerElement` returns `<OutsideClick className="PopperWrapper-trigger" …>{trigger}</OutsideClick>`.
- **Issue + impact:** The library does not add `aria-expanded`, `aria-haspopup`, or `aria-controls` to the **actual** interactive child; if the trigger is a custom `<div>`, consumers may omit widget semantics.
- **Suggestion:** Document required ARIA on the passed `trigger` element for each pattern (Popover vs menu vs combobox); optionally offer a render-prop or `triggerProps` merge helper in higher-level components (Popover already wraps this).

---

### P-2. `on="hover"` pairs `mouse*` with `focus` / `blur` on the wrapper — keyboard + portaled content risk

- **WCAG / basis:** `2.1.1` (Keyboard), APG tooltip / disclosure — **APG only** / **Best practice**
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** (`on="hover"`, `appendToBody`)
- **Repro:** Hover mode attaches `onFocus: handleMouseEnter` and `onBlur: handleMouseLeave` to the **OutsideClick** div. Popup is portaled to `document.body`. Focus moving from trigger to focusables inside the popup depends on React/DOM **focus** / **blur** propagation semantics; pointer-only `onMouseEnter` on the cloned popup child has no keyboard analogue.
- **Issue + impact:** Possible **stuck-open** popover, **premature close**, or reliance on pointer-only paths for content that should be keyboard reachable.
- **Suggestion:** For keyboard-accessible rich content, default to `on="click"` or implement APG **disclosure** / **dialog** focus management in Popover; use hover mode only for purely supplementary tooltips with `aria-describedby` patterns.

---

### P-3. Outside-click / layer algorithm relies on `[data-opened="true"]` and computed `zIndex` — not AT-facing

- **WCAG / basis:** **Non-WCAG** (stacking logic)
- **Severity:** **P2**
- **Scope:** **Component default**
- **Repro:** `shouldPopoverClose` walks `document.querySelectorAll('[data-opened="true"]')` and compares `zIndex` — coordinates with `Backdrop`’s `data-opened` / `data-layer`.
- **Issue + impact:** No direct ARIA bug; if attributes drift between components, dismiss logic breaks and users may perceive “stuck” overlays (**2.4.7** / **2.4.11** indirectly).
- **Suggestion:** Keep `data-layer` contract documented for any new overlay primitives; add integration tests for nested Modal + Popover.

---

### P-4. Injected `<style>` keyframes for popper open/close — check `prefers-reduced-motion`

- **WCAG / basis:** `2.3.3` (Animation from Interactions) / `2.2.2` — **WCAG 2.2**
- **Severity:** **P2**
- **Scope:** **Component default** when `animationClass` is **not** provided
- **Repro:** `getPopperChildren` injects dynamic `@keyframes` and `animation: … 120ms` inline on the popper surface.
- **Issue + impact:** Motion-sensitive users may get non-essential motion without a `prefers-reduced-motion` guard at this layer (Popover may partially mitigate higher up — verify end-to-end).
- **Suggestion:** Respect `prefers-reduced-motion: reduce` in this module or in CSS tokens; shorten or disable animations.

---

## Cross-component notes (Modal / Sidesheet / Popover)

`Modal.tsx` and `Sidesheet.tsx` compose **Backdrop** + **OutsideClick**; **Popover** composes **PopperWrapper**. Structural ARIA for dialogs belongs in those molecules/organisms. This audit confirms the **atoms** are thin primitives with the gaps above (especially **Divider** / **Backdrop** attribute forwarding and **OutsideClick** listener lifecycle).

---

## Files referenced (quick index)

```text
core/components/atoms/divider/Divider.tsx
core/components/atoms/backdrop/Backdrop.tsx
core/components/atoms/outsideClick/OutsideClick.tsx
core/components/atoms/popperWrapper/PopperWrapper.tsx
core/utils/types.tsx
css/src/components/divider.module.css
css/src/components/backdrop.module.css
```

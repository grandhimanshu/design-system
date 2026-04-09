# Tags Layout Typography

This document contains the P0 (Critical) and P1 (High) ARIA audit issues for Tags Layout Typography.

**Total P0/P1 issues in this group:** 18

| Component | P0/P1 issues |
| :--- | :--- |
| AvatarSelection | 5 |
| Chips | 3 |
| Icon | 2 |
| Avatar | 2 |
| AvatarGroup | 2 |
| Badge | 1 |
| ChipGroup | 1 |
| Flex | 1 |
| Placeholder | 1 |

---

## 1. AvatarSelection

### 1. P0 - Nested `role="checkbox"` and split keyboard model (visible avatars)
- **Repro:** Tab through visible avatars in default `AvatarSelection`; focus lands on the inner `Avatar` span; Enter/Space do not run `SelectionAvatarsWrapper`’s `onKeyDown` (that handler is on the outer `div` with `tabIndex={-1}`).  
- **Issue + impact:** Outer wrapper is `role="checkbox"` with `tabIndex={-1}`; `SelectionAvatar` passes `role="checkbox"` into `Avatar`, which defaults to `tabIndex={0}` when not disabled. Assistive technologies see nested checkboxes; focus order follows the inner control, which has **no** `onKeyDown` / `onClick` for selection—only the outer `div` does—so keyboard users can reach a focus target that does not toggle selection as expected.  
- **Suggestion:** Single focusable surface per avatar (e.g. native `<button type="button">` or one `div`/`span` with `role="checkbox"` / `aria-checked` / `tabIndex={0}` and all click + keyboard handlers on that node); make inner `Avatar` decorative (`aria-hidden`, `tabIndex={-1}`, `role="presentation"`) or stop passing interactive `role`/`tabIndex` into it.

---

### 2. P1 - Overflow trigger (`+N`) lacks a meaningful accessible name
- **Repro:** Use `AvatarSelection` with `list.length > max`; inspect accessibility name of `AvatarSelectionCount`’s focusable control.  
- **Issue + impact:** `AvatarSelectionCount` renders `<Avatar tabIndex={-1}>…</Avatar>` with **no** `firstName`/`lastName`; visible text is `+{count}` via `Text`, but `Avatar` derives `aria-label` from names / tooltip string / initials—here that resolves to a **generic** value (e.g. `"Avatar"`), not “3 more people” / “Show 3 additional users,” etc. The **outer** `role="button"` has **no** `aria-label` / `aria-labelledby`, so its accessible name is dominated by the incorrectly labeled child tree.  
- **Suggestion:** Set an explicit `aria-label` (or `aria-labelledby`) on the `role="button"` wrapper (e.g. from `hiddenAvatarCount` + i18n), and/or pass `aria-label` / `aria-hidden` on `Avatar` so the trigger’s name is correct and not duplicated.

---

### 3. P1 - `role="button"` trigger does not handle Space
- **Repro:** Focus the `+N` trigger; press Space.  
- **Issue + impact:** `avatarsSelection/utils.tsx` `handleKeyDown` handles Enter and arrows but **not** Space. For `role="button"`, users expect Space to activate (HTML `button` behavior / APG button pattern).  
- **Suggestion:** On `keydown` / `keyup` for Space, prevent default page scroll and open the popover (mirror Enter), then move focus per existing arrow logic.

---

### 4. P1 - Visible “checkbox” rows: missing `aria-disabled` when `item.disabled`
- **Repro:** Disable a visible avatar; inspect `aria-*` on the interactive wrapper.  
- **Issue + impact:** `SelectionAvatarsWrapper` returns early in `onClickHandler` / `handleKeyDown` for `disabled`, but the outer `role="checkbox"` node does not expose `aria-disabled="true"` (or `disabled` on a native control), so AT may not treat the option as unavailable.  
- **Suggestion:** Set `aria-disabled={true}` when disabled (and avoid reporting `aria-checked` changes for disabled items, or keep checked state consistent with UX).

---

### 5. P1 - `aria-checked` may be omitted when `selectedItems` is undefined
- **Repro:** Inspect visible checkbox before `selectedItems` state is initialized.  
- **Issue + impact:** `aria-checked={selectedItems && selectedItems.includes(avatarItem)}` yields `undefined` when `selectedItems` is `undefined`, so React may **omit** `aria-checked`, leaving state ambiguous for `role="checkbox"`.  
- **Suggestion:** Coerce to boolean: `aria-checked={Boolean(selectedItems?.includes(avatarItem))}`.

---

## 2. Chip / GenericChip (`_chip`)

### 1. P1 - Nested focusable controls (`role="button"` inside `role="button"`)
- **Repro:** Use `Chip` or `GenericChip` as documented with `clearButton={true}` — outer wrapper is `role="button"` and contains a second focusable `role="button"` for clear.
- **Issue + impact:** Assistive technologies and accessibility APIs can expose conflicting or non-deterministic roles/focus semantics for nested buttons. Users may hear duplicate “button” announcements or get inconsistent focus/activation behavior compared to a flat structure (e.g. sibling buttons inside a `role="group"`).
- **Suggestion:** Restructure so the main chip and the dismiss control are **siblings** (e.g. wrapping `role="group"` with `aria-labelledby` pointing at the label text, or a single native `<button>` for the main action plus a separate `<button type="button">` for dismiss). Avoid focusable descendants inside a single `role="button"` widget.

---

### 2. P1 - Disabled state not exposed on the custom button (`aria-disabled`)
- **Repro:** Render `<Chip label="Chip" name="x" disabled type="selection" />` or `GenericChip` with `disabled` — wrapper gets `tabIndex={-1}` but no `aria-disabled="true"`.
- **Issue + impact:** Custom `role="button"` on a `<div>` relies on ARIA for state. Without `aria-disabled`, some screen readers may not announce the control as disabled/unavailable even though it is removed from the tab order; users lose parity with native `<button disabled>`.
- **Suggestion:** Set `aria-disabled={disabled}` on the outer widget. Mirror on the clear control when the chip is disabled. Keep `tabIndex={-1}` and ensure no activation via click/pointer if still reachable (prefer native `<button disabled>` where possible).

---

### 3. P1 - Direct `GenericChip` usage: `onClick` / `onClose` not gated on `disabled`
- **Repro:** `<GenericChip label="x" name="n" disabled onClick={fn} />` — `onClickHandler` in `_chip/index.tsx` still invokes `onClick` when the wrapper receives a click (visual `pointer-events` / CSS not audited here).
- **Issue + impact:** Disabled state can be inconsistent: focus is removed, but pointer activation may still run business logic, or AT may not hear “disabled” (combined with finding 2).
- **Suggestion:** In `GenericChip`, guard `onClickHandler` and `onCloseHandler` with `if (disabled) return` (and avoid firing keyboard handlers when disabled), or document that `GenericChip` is internal-only and must always be composed with external guards.

---

## 3. Icon - Himanshu could not understand these issues

### 1. P1 - `children` variant drops interactive and accessibility wiring from `useAccessibilityProps`
- **Repro:** Fails when `Icon` wraps a child element and is given `onClick` (and optionally `aria-label`): the root is `<span {...extractBaseProps} className={className}>` only — no `role`, no `tabIndex`, no `onKeyDown` bridge, and no `useAccessibilityProps` output.
- **Issue + impact:** The control is not consistently keyboard-activatable or exposed as the same widget type as the main icon path, so assistive technology and keyboard users can get a clickable-looking or intended-clickable wrapper that does not match the interactive `<i>` behavior.
- **Suggestion:** Either merge `useAccessibilityProps` (and consistent `data-test` / class application) onto the `children` wrapper, or document that the `children` API is **presentational only** and forbid `onClick` on `Icon` in that mode (types + docs).

---

### 2. P1 - Interactive branch omits `aria-labelledby` and `aria-describedby` even though the non-interactive branch forwards them
- **Repro:** Fails when `Icon` is used with `onClick` and `aria-labelledby` (and/or `aria-describedby`) at runtime: `useAccessibilityProps` returns only `aria-label` in the interactive object, not `aria-labelledby` / `aria-describedby` (see `useAccessibilityProps.ts` branches).
- **Issue + impact:** External labelling or description relationships are dropped for interactive icons, so the control may lack the intended accessible name or supplementary description in labelled-by patterns.
- **Suggestion:** Extend the interactive return object to forward `aria-labelledby` and `aria-describedby` the same way as the non-interactive branch; align the doc registry entry in `core/utils/docPage/accessibilityProps.ts` with actual behavior.

---

## 4. Avatar most fixed in this PR 2988

### 1. P1 - `tabIndex` forces `role="button"` but Avatar exposes no button semantics or keyboard behavior
- **Repro:** `<Avatar tabIndex={0} firstName="Ada" lastName="Lovelace" />` — focusable element with `role="button"` and no `onKeyDown` / `onClick` on the avatar root; consumers cannot attach handlers through `AvatarProps`.
- **Issue + impact:** Assistive technologies and keyboard users may expect **Space/Enter** to activate a control labeled as a **button**. Nothing in `Avatar` implements that pattern, and there is no prop to supply handlers on the labeled `span`.
- **Suggestion:** If the intent is static identity, avoid `role="button"` unless the component accepts `onClick`/`onKeyDown` (or renders a native `<button>`). If focus is only for tooltip, prefer `role="img"` (or no widget role) with tooltip wiring that does not mis-represent the control; document the contract explicitly.

---

### 2. P1 - Custom `children` (non-string) inside `role="img"` / `button` — risk of invalid or nested interactives
- **Repro:** TBD — verify in Storybook / docs if a consumer places `<button>` or `<a>` inside the avatar `span`.
- **Issue + impact:** **Nested interactive controls** inside a single named `img` (or `button`) confuse focus order and break role expectations.
- **Suggestion:** Document forbidden patterns; consider detecting or warning in dev; or use a neutral wrapper role when children are complex composites.

---

## 5. AvatarGroup

### 1. P1 - Overflow trigger: no `aria-expanded` / `aria-controls`; keyboard activation incomplete for click mode
- **Repro:** Open the overflow with keyboard only after tabbing to the “+N” control — `Enter`/`Space` do not toggle the popover; assistive technologies also lack a programmatic expanded state on the trigger.
- **Issue + impact:** `AvatarCount` is a `div` with `role="button"` and `tabIndex={0}`. `PopperWrapper` attaches `onClick` to the **wrapper** around the trigger, not `onKeyDown` for `Enter`/`Space` on the focused control. The trigger is not updated with `aria-expanded` or `aria-controls` tied to the popover surface. Screen reader users cannot tell whether the popup is open; keyboard-only users may be unable to open/close the overflow in click mode.
- **Suggestion:** Either use a native `<button type="button">` for the overflow control and wire `aria-expanded` / `aria-controls` from popover open state and a stable popup `id`, or extend `Popover`/`PopperWrapper` (or `AvatarGroup`) to clone the trigger with the same disclosure pattern used elsewhere (e.g. `Select`’s trigger merge) plus `onKeyDown` for primary key activation.

---

### 2. P1 - `aria-haspopup="listbox"` on overflow trigger vs actual popup structure
- **Repro:** Inspect the “+N” trigger (`aria-haspopup="listbox"`) and the default list: `Listbox` renders `<ul>` without `role="listbox"` when `type="description"` (see `Listbox.tsx`: `listRole` becomes `rest.role`, unset here).
- **Issue + impact:** Assistive technologies are told to expect a **listbox** popup, but the default content is a **list** (`<ul>`) with inner rows using `role="option"` from `ListboxItem`/`ListBody` — not a valid `listbox` → `option` tree. This misreports the interaction model and weakens correct navigation announcements.
- **Suggestion:** Align semantics: e.g. pass `role="listbox"` (and an `id`) on the `Listbox` in `AvatarPopperBody`, **or** remove `aria-haspopup="listbox"` from `AvatarCount` and use `aria-haspopup="dialog"` / `true` if the surface is treated as a generic panel, **and** adjust inner row roles for a static description list (`role="option"` only inside a `listbox`). Prefer one consistent pattern per APG.

---

## 6. Badge

### 1. P1 - Interactive span surface without guardrails
- **Repro:** Fails when `Badge` is given `onClick` and `tabIndex={0}` (or is otherwise focusable) without an appropriate role and keyboard activation consistent with that role.
- **Issue + impact:** A focusable or clickable `<span>` without a widget role and keyboard support is not reliably operable with the keyboard and may not expose a correct role to assistive technologies.
- **Suggestion:** In docs and usage guidance, state that interactive badges should be implemented with `<Button>` / `<Link>` wrapping or as a native control; optionally restrict or warn on interactive props in types or dev-only checks, or provide a dedicated “clickable badge” variant that uses `<button>`.

---

## 7. ChipGroup

### 1. P1 - `list` items claim full `ChipProps` but a11y-related chip props are not forwarded
- **Repro:** Render `<ChipGroup list={[{ …chip fields…, 'aria-label': 'Filter: Urgent', label: <IconOnly />, type: 'action', name: 'x' }]} onClick={…} />` — the chip wrapper in the tree will **not** receive `aria-label` from the list item because `ChipGroup` never passes it to `Chip`.
- **Issue + impact:** Assistive technologies may compute the wrong accessible name (e.g. missing or generic name for custom `label` nodes) or wrong tab order if the author relied on `tabIndex` / `clearButtonAriaLabel` from the typed list shape. This undermines trust in `ChipProps[]` as the list element type.
- **Suggestion:** Forward all `Chip`-relevant props (spread `Chip` props from each item after destructuring handlers, or explicitly pass the full set including `aria-label`, `aria-labelledby`, `clearButtonAriaLabel`, `tabIndex`, `labelPrefix`, `maxWidth`, `size`, `className`). Alternatively, narrow the `list` type to the props `ChipGroup` actually supports so consumers are not misled.

---

## 8. Flex

### 1. P1 - Pointer handlers on the root `<div>` without full custom-control semantics
- **Repro:** `FlexProps` inherits div attributes via `BaseHtmlProps<HTMLDivElement>`; `onClick` is type-allowed. Pattern matches known gaps for clickable `<div>`s in production layouts.
- **Issue + impact:** A non-interactive `<div>` with only `onClick` is typically not keyboard-focusable and does not expose button/link semantics; assistive technology users may not discover or operate the control from the keyboard.
- **Suggestion:** Treat `Flex` as a layout wrapper only; put actions on `<Button>`, links, or other native/interactive components. If the design system documents “clickable Flex,” document the full APG-aligned custom-control pattern or discourage it in component docs / Storybook.

---

## 9. Placeholder

### 1. P1 - Typed children only — bypassing types could hide meaningful content from AT
- **Repro:** TBD — verify in Storybook / docs; would require overriding children with meaningful text/controls inside `<Placeholder>` while relying on SR exposure.
- **Issue + impact:** The root is always `aria-hidden="true"`. Anything placed inside (if consumers break the intended API) is excluded from the accessibility tree, which can cause **silent** important content or unfocusable-looking focus traps in edge cases.
- **Suggestion:** Keep typings strict; in docs, state explicitly that `Placeholder` must not wrap real content or interactive elements. Run-time `__DEV__` warning for unexpected child types is optional hardening.

---
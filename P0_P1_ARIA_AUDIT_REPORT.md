# P0 and P1 Component ARIA Audit Issues

This document contains only the P0 (Critical) and P1 (High) issues extracted from the main ARIA audit report.

## Summary

**Total Critical (P0) Issues:** 7
**Total High (P1) Issues:** 131

### Severity summary

- **P0 (Critical):** 7
- **P1 (High):** 131
- **P0 + P1 in this document:** 138

### Prioritized backlog (by component)

| Component                 | P0 (Critical) | P1 (High) | Total |
| ------------------------- | ------------- | --------- | ----- |
| 1. AvatarSelection        | 1             | 4         | 5     |
| 2. DatePicker             | 0             | 4         | 4     |
| 3. DateRangePicker        | 0             | 4         | 4     |
| 4. FileUploader           | 1             | 3         | 4     |
| 5. Menu                   | 0             | 4         | 4     |
| 6. Navigation             | 1             | 3         | 4     |
| 7. PopperWrapper          | 0             | 4         | 4     |
| 8. Radio                  | 0             | 4         | 4     |
| 9. Select                 | 0             | 4         | 4     |
| 10. VerticalNav           | 0             | 4         | 4     |
| 11. Combobox              | 0             | 3         | 3     |
| 12. EditableInput         | 1             | 2         | 3     |
| 13. FullscreenModal       | 0             | 3         | 3     |
| 14. GenericChip (`_chip`) | 0             | 3         | 3     |
| 15. Listbox               | 0             | 3         | 3     |
| 16. MetricInput           | 0             | 3         | 3     |
| 17. Modal                 | 2             | 1         | 3     |
| 18. Popover               | 0             | 3         | 3     |
| 19. SegmentedControl      | 0             | 3         | 3     |
| 20. Tabs                  | 0             | 3         | 3     |
| 21. TextField             | 1             | 2         | 3     |
| 22. TimePicker            | 0             | 3         | 3     |
| 23. Tooltip               | 0             | 3         | 3     |
| 24. ASK ANURADHA AS NESTED TRIGGER or GRID- List | 0             | 2         | 2     |
| 25. Avatar                | 0             | 2         | 2     |
| 26. AvatarGroup           | 0             | 2         | 2     |
| 27. Calendar              | 0             | 2         | 2     |
| 28. Chip                  | 0             | 2         | 2     |
| 29. Collapsible           | 0             | 2         | 2     |
| 30. Dropdown              | 0             | 2         | 2     |
| 31. FileList              | 0             | 2         | 2     |
| 32. Icon                  | 0             | 2         | 2     |
| 33. MdsGrid               | 0             | 2         | 2     |
| 34. Message               | 0             | 2         | 2     |
| 35. MultiSlider / RangeSlider / Slider | 0             | 2         | 2     |
| 36. OutsideClick          | 0             | 2         | 2     |
| 37. Badge                 | 0             | 1         | 1     |
| 38. Button                | 0             | 1         | 1     |
| 39. ChipGroup             | 0             | 1         | 1     |
| 40. ChoiceList            | 0             | 1         | 1     |
| 41. Column                | 0             | 1         | 1     |
| 42. Divider               | 0             | 1         | 1     |
| 43. Dropzone              | 0             | 1         | 1     |
| 44. EditableChipInput     | 0             | 1         | 1     |
| 45. EditableDropdown      | 0             | 1         | 1     |
| 46. EmptyState            | 0             | 1         | 1     |
| 47. Flex                  | 0             | 1         | 1     |
| 48. HelpText              | 0             | 1         | 1     |
| 49. InlineMessage         | 0             | 1         | 1     |
| 50. Input                 | 0             | 1         | 1     |
| 51. InputMask             | 0             | 1         | 1     |
| 52. KeyValuePair          | 0             | 1         | 1     |
| 53. Label                 | 0             | 1         | 1     |
| 54. Link                  | 0             | 1         | 1     |
| 55. OverlayHeader         | 0             | 1         | 1     |
| 56. Placeholder           | 0             | 1         | 1     |
| 57. ProgressBar           | 0             | 1         | 1     |
| 58. ProgressRing          | 0             | 1         | 1     |
| 59. Row                   | 0             | 1         | 1     |
| 60. SelectionCard         | 0             | 1         | 1     |
| 61. Sidesheet             | 0             | 1         | 1     |
| 62. Spinner               | 0             | 1         | 1     |
| 63. StatusHint            | 0             | 1         | 1     |
| 64. Stepper               | 0             | 1         | 1     |
| 65. Text                  | 0             | 1         | 1     |
| 66. Textarea              | 0             | 1         | 1     |
| 67. Toast                 | 0             | 1         | 1     |
| 68. VerificationCodeInput | 0             | 1         | 1     |


---

## 1. AvatarSelection

### 1. P0 - Nested `role="checkbox"` and split keyboard model (visible avatars)
- **Repro:** Tab through visible avatars in default `AvatarSelection`; focus lands on the inner `Avatar` span; Enter/Space do not run `SelectionAvatarsWrapper`’s `onKeyDown` (that handler is on the outer `div` with `tabIndex={-1}`).  
- **Issue + impact:** Outer wrapper is `role="checkbox"` with `tabIndex={-1}`; `SelectionAvatar` passes `role="checkbox"` into `Avatar`, which defaults to `**tabIndex={0}`** when not disabled. Assistive technologies see nested checkboxes; focus order follows the inner control, which has **no** `onKeyDown` / `onClick` for selection—only the outer `div` does—so keyboard users can reach a focus target that does not toggle selection as expected.  
- **Suggestion:** Single focusable surface per avatar (e.g. native `<button type="button">` or one `div`/`span` with `role="checkbox"` / `aria-checked` / `tabIndex={0}` and all click + keyboard handlers on that node); make inner `Avatar` decorative (`aria-hidden`, `tabIndex={-1}`, `role="presentation"`) or stop passing interactive `role`/`tabIndex` into it.

---

### 2. P1 - Overflow trigger (`+N`) lacks a meaningful accessible name
- **Repro:** Use `AvatarSelection` with `list.length > max`; inspect accessibility name of `AvatarSelectionCount`’s focusable control.  
- **Issue + impact:** `AvatarSelectionCount` renders `<Avatar tabIndex={-1}>…</Avatar>` with **no** `firstName`/`lastName`; visible text is `+{count}` via `Text`, but `Avatar` derives `aria-label` from names / tooltip string / initials—here that resolves to a **generic** value (e.g. `"Avatar"`), not “3 more people” / “Show 3 additional users,” etc. The **outer** `role="button"` has **no** `aria-label` / `aria-labelledby`, so its accessible name is dominated by the incorrectly labeled child tree.  
- **Suggestion:** Set an explicit `aria-label` (or `aria-labelledby`) on the `role="button"` wrapper (e.g. from `hiddenAvatarCount` + i18n), and/or pass `aria-label` / `aria-hidden` on `Avatar` so the trigger’s name is correct and not duplicated.

---

### 3. P1 - `role="button"` trigger does not handle Space
- **Repro:** Focus the `+N` trigger; press Space.  
- **Issue + impact:** `avatarsSelection/utils.tsx` `handleKeyDown` handles Enter and arrows but **not**  `` (Space). For `role="button"`, users expect Space to activate (HTML `button` behavior / APG button pattern).  
- **Suggestion:** On `keydown` / `keyup` for Space, prevent default page scroll and open the popover (mirror Enter), then move focus per existing arrow logic.

---

### 4. P1 - Visible “checkbox” rows: missing `aria-disabled` when `item.disabled`
- **Repro:** Disable a visible avatar; inspect `aria-*` on the interactive wrapper.  
- **Issue + impact:** `SelectionAvatarsWrapper` returns early in `onClickHandler` / `handleKeyDown` for `disabled`, but the outer `role="checkbox"` node does not expose `**aria-disabled="true"`** (or `disabled` on a native control), so AT may not treat the option as unavailable.  
- **Suggestion:** Set `aria-disabled={true}` when disabled (and avoid reporting `aria-checked` changes for disabled items, or keep checked state consistent with UX).

---

### 5. P1 - `aria-checked` may be omitted when `selectedItems` is undefined
- **Repro:** Inspect visible checkbox before `selectedItems` state is initialized.  
- **Issue + impact:** `aria-checked={selectedItems && selectedItems.includes(avatarItem)}` yields `**undefined`** when `selectedItems` is `undefined`, so React may **omit** `aria-checked`, leaving state ambiguous for `role="checkbox"`.  
- **Suggestion:** Coerce to boolean: `aria-checked={Boolean(selectedItems?.includes(avatarItem))}`.

---

## 2. FileUploader

### 1. P0 - File input not operable from the keyboard in typical tab order
- **Repro:** Tab until focus is on the visible upload control, press Enter or Space — activation targets the underlying `<button type="button">`, not the `<input type="file">`, which uses `tabIndex={-1}` and is not in sequential focus order.  
- **Issue + impact:** Keyboard-only users may be unable to open the file picker. The CSS overlay (`FileUploaderButton-input`) makes pointer users hit the file input, but sequential keyboard focus lands on the `Button`, which does not forward activation to the input.  
- **Suggestion:** Use a documented pattern that works with keyboard: e.g. `<label htmlFor={inputId}>` wrapping visible text/control, `onClick`/`onKeyDown` on the visible button that calls `inputRef.current?.click()`, or remove `tabIndex={-1}` and ensure one logical focus target with a correct accessible name.

---

### 2. P1 - Focusable buttons nested inside `role="button"` when the row is “clickable”
- **Repro:** Use `FileUploaderList` with `onClick` set; the row container gets `role="button"` and `tabIndex={0}` while still containing native `<button>` elements (remove, retry).  
- **Issue + impact:** Screen readers and keyboard behavior are unreliable for nested interactives; violates APG structure for `button`.  
- **Suggestion:** Avoid `role="button"` on the outer wrapper; use a plain row with a separate named control for the primary action, or make only the file name a `<button>`/`<a>` while keeping remove/retry as siblings outside any `role="button"` container.

---

### 3. P1 - Row `onClick` may fire when activating inner buttons (event bubbling)
- **Repro:** With `onClick` and `onDelete` defined, activate the remove or retry button — the row’s `onClick` can also run unless propagation is stopped.  
- **Issue + impact:** Users can trigger two actions (e.g. open file + delete) unintentionally; assistive tech users get inconsistent outcomes.  
- **Suggestion:** Call `stopPropagation()` (and `preventDefault` where needed) on inner button handlers, or restructure events so the row is not a single bubbling click target.

---

### 4. P1 - `formatLabel` is not included in the file input’s `aria-describedby`
- **Repro:** Set `formatLabel` to accepted types; file input only references `sizeLabelId` in `aria-describedby` in `FileUploader.tsx`.  
- **Issue + impact:** Users who rely on the input’s description may not hear accepted-format constraints, only size text.  
- **Suggestion:** Assign a stable id to the format `Text` node and concatenate ids in `aria-describedby` (with `sizeLabelId`), or merge copy into one described-by target.

---

## 3. Menu

### 1. P1 - `aria-controls` on submenu trigger does not reference the menu element’s `id`
- **Repro:** Render nesting per `Menu.test.tsx` (“Menu component with Nesting snapshot”); inspect submenu trigger: `aria-controls` equals `DesignSystem-Menu--Popover-*` while the panel’s focusable menu root uses `id="menu-*"` from `Menu.tsx` (`generatedMenuId`). `Popover` exposes `data-name={name}`, not `id={name}` (`Popover.tsx`).
- **Issue + impact:** `aria-controls` must reference element `**id`s** (IDREF). Pointing at a string that only exists as `data-name` breaks the intended relationship in supporting AT; users may not get correct “controlled by” / popup association for the submenu panel.
- **Suggestion:** Align IDs: e.g. pass the same stable id into the nested `Menu`’s root `div` (or set `id={menuID}` on the actual menu container) and keep `aria-controls`/`aria-labelledby` consistent; avoid using `data-name` as a substitute for `id` in ARIA references.

---

### 2. P1 - `navigation` landmark (`<nav>`) nested inside `role="menu"`
- **Repro:** Use `Menu` + `Menu.List` as documented; inspect DOM: outer `div[role="menu"]` contains `nav` with implicit `navigation` role wrapping `menuitem` descendants.
- **Issue + impact:** A `menu`’s expected structure uses `menuitem` / `group` / `separator` (etc.); an intermediate `navigation` landmark is not a valid owned role for `menu` and can confuse the accessibility tree (nested landmark + invalid menu composition).
- **Suggestion:** Default `MenuList` to a non-landmark tag (`div`) or set explicit `role="none"` / `presentation"` on the list root when inside `Menu`; document if `nav` is kept for rare page-level menus outside a `role="menu"` wrapper.

---

### 3. P1 - Submenu trigger `aria-expanded` does not reflect open state
- **Repro:** Inspect submenu trigger after mount: `aria-expanded` is derived from `subListRef.current ? 'true' : 'false'` — the ref is attached to a wrapper `div` that exists whenever the submenu is mounted, not when the popover is open/closed.
- **Issue + impact:** Assistive technologies receive a static or misleading expanded state; the trigger does not track the nested popover’s `open` state.
- **Suggestion:** Tie `aria-expanded` to the nested `Menu`/`Popover` open state (lift state, callback, or clone props from the nested component when available).

---

### 4. P1 - Escape / ArrowLeft focus return from nested menus is unreliable
- **Repro:** `MenuItem` always passes `isSubMenuTrigger={false}` into `handleKeyDown` (`MenuItem.tsx`). `Escape` uses `if (triggerRef && !isSubMenuTrigger) { triggerRef.current?.focus() } else { menuTriggerRef… }` (`utils.tsx`). `triggerRef` is supplied from `SubMenuContext` for items inside the nested list even though they are not the submenu trigger row. `triggerRef` is attached via `cloneElement` on `Menu.Item` (`SubMenu.tsx`), but `**Menu.Item` / `Listbox.Item` are not `forwardRef` components**, so `**triggerRef.current` is typically `null`**. `navigateSubMenu` focuses `querySelector('#' + triggerID)?.firstChild` (`utils.tsx`) — `**firstChild` may be a text node or inner widget**, not the `menuitem` (`ListBody` has `id={triggerID}`).
- **Issue + impact:** Users may lose focus or land on the wrong node when closing or backing out of a submenu; violates expected submenu keyboard behavior.
- **Suggestion:** Forward refs to the focusable `menuitem` host; focus `#${triggerID}` directly (the element with `role="menuitem"`), not `firstChild`; for `Escape`, prefer focusing the parent submenu trigger when focus was in the child menu (track depth or use context), and only use `menuTriggerRef` for the root trigger.

---

## 4. Tabs

### 1. P1 - Arrow key focus uses `tabRefs` indices that do not match tab indices when disabled tabs exist
- **Repro:** Fails when `Tabs` is used as documented with `tabs` (or children) where a middle tab is `disabled`: focus ArrowLeft/ArrowRight from an enabled tab can move to the wrong tab or fail to move to the adjacent enabled tab because `tabRefs` only pushes non-disabled elements but `tabKeyDownHandler` indexes with `tabIndex ± 1` (map index), not the next/previous **focusable** tab.
- **Issue + impact:** Keyboard users cannot predict or complete horizontal tab navigation; focus may jump incorrectly or not reach the visually adjacent tab.
- **Suggestion:** Compute previous/next focusable tab index in tab order (skipping disabled), then `focus()` that element; or use a ref map keyed by tab index instead of a sparse array.

---

### 2. P1 - `Space` does not activate a tab; unit tests codify omission
- **Repro:** Fails when `Tabs` is used as documented: focus a tab and press Space — selection/`onTabChange` does not run (see `Tabs.test.tsx`, which expects Space **not** to call `onTabChange`).
- **Issue + impact:** Users accustomed to APG-style tabs (Space or Enter) may believe the control is broken; Space may also scroll the page depending on browser focus handling.
- **Suggestion:** On `role="tab"`, handle `event.key === ' '` (and `Space`) with `preventDefault()` and the same path as `Enter` for activation, aligned with APG manual activation.

---

### 3. P1 - Dismissible close control: focusable `role="button"` inside `role="tab"` without an accessible name
- **Repro:** TBD — verify with screen reader: focus lands on the clear icon control inside the tab; name may be missing or only the font/glyph name.
- **Issue + impact:** The secondary action is not clearly identified (e.g. “Remove tab”, “Close”); nested interactive also complicates tab semantics (see finding 6).
- **Suggestion:** Pass a concise `aria-label` (and optionally `onKeyDown` if overriding) on the dismiss `Icon`, e.g. “Close tab” / “Dismiss {label}”.

---

## 5. EditableInput

### 1. P0 - Collapsed `role="button"` can have no accessible name (error + empty display text)
- **Repro:** As in snapshots: `EditableInput` with `error`, `errorMessage`, empty `value`, and placeholder not contributing visible text — the collapsed control is a `role="button"` whose subtree is only the decorative error icon (`aria-hidden="true"`), yielding **no** computed accessible name.
- **Issue + impact:** Screen reader users get a “button” with no label; purpose and relation to validation are unclear; violates the requirement that user interface components have a name.
- **Suggestion:** Always expose a name in the collapsed state (e.g. `aria-label` / `aria-labelledby` derived from field label, or visible text such as placeholder / “Empty” / error summary). If the error icon is meant to convey state, pair it with visible text or non-hidden text alternative for the control name.

---

### 2. P1 - Global HTML/ARIA props on `EditableInput` are not applied to the root (naming not fixable via props)
- **Repro:** `<EditableInput aria-label="Project name" placeholder="…" onChange={fn} />` — `aria-label` is stripped and never rendered on the collapsed `role="button"`.
- **Issue + impact:** Consumers cannot attach `aria-label`, `aria-labelledby`, `id`, or `aria-describedby` to the actual interactive root; they cannot repair unnamed or weakly named instances without wrapping in another element (which may not match focus/activation behavior).
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or forward a defined subset) to the root `div`, or add explicit `label` / `ariaLabel` props documented as required for the collapsed control.

---

### 3. P1 - `errorMessage` is only in a hover `Popover` and is not wired to the input
- **Repro:** Enter edit mode with `error` + `errorMessage`; keyboard-focused users may not trigger hover popover behavior consistently; the `<input>` has `aria-invalid` from `error` but no stable ID-linked error text in the accessibility tree.
- **Issue + impact:** Error details may be unavailable or hard to discover; invalid state is not programmatically described per common WCAG techniques.
- **Suggestion:** Give `InlineMessage` a stable `id`, set `aria-errormessage` / `aria-describedby` on the `Input` (and ensure the message is not `aria-hidden`), and/or expose error text inline near the field; if using `Popover`, add keyboard/focus parity (e.g. open on focus) or avoid hover-only error disclosure.

---

## 6. FullscreenModal

### 1. ASK ANURADHA IF THIS IMPLEMENTED - P1 - No focus trap, initial focus, or focus restoration
- **Repro:** Repro: TBD — verify in Storybook / docs (Tab order escapes the dialog; focus does not move into the dialog on open; focus not returned to trigger on close—contrast with `core/components/molecules/modal/Modal.tsx` which calls `activateFocusTrap` / `deactivateFocusTrap`).
- **Issue + impact:** Keyboard users can tab into the obscured page while `aria-modal="true"` is set; opening does not move focus into the dialog; closing does not restore context—disorientation and extra effort for SR users.
- **Suggestion:** Reuse the same focus lifecycle as `Modal` (container ref, `handleFocusTrapKeyDown` on capture phase, initial focus on `aria-labelledby` target or dialog container, `restoreFocusToElementIfConnected` on close/unmount).

---

### 2. P1 - Escape closes only when `closeOnEscape` is truthy (no default)
- **Repro:** Repro: TBD — verify in Storybook / docs (open modal without `closeOnEscape`, press Escape; no `keydown` listener is registered unless `closeOnEscape` is true—see `componentDidMount` / `componentWillUnmount` in `FullscreenModal.tsx`).
- **Issue + impact:** Standard dialog dismissal via Escape is unavailable unless consumers opt in; differs from `Modal`, where Escape is always handled for accessibility.
- **Suggestion:** Always register Escape handling while open (respecting `OverlayManager.isTopOverlay`), default `closeOnEscape` to true or deprecate false the same way as `Modal`.

---

### 3. SKIP as consumer is responsible - P1 - Custom `header` node without `aria-labelledby` / `aria-label`
- **Repro:** Fails when `FullscreenModal` is used with `header={<Text>Heading</Text>}` and no `aria-label` / `aria-labelledby` (Jest snapshot: visible “Heading” text, dialog still has no `aria-labelledby` / `aria-label`).
- **Issue + impact:** Visible title is not exposed as the **dialog**’s accessible name; screen readers still report an unnamed dialog.
- **Suggestion:** Document that consumers must set `aria-labelledby` to the heading id or `aria-label`; optionally auto-assign `headingId` to a wrapper or require `headerOptions.headingId` even with custom header; dev-only warning when open dialog has no resolvable name.

---

## 7. MultiSlider / RangeSlider / Slider



*Note: `Slider` and `RangeSlider` are wrappers around the underlying `MultiSlider` implementation, so they share the exact same accessibility issues.*

### 1. SKIP as Low Priority - P1 - Track and axis ticks expose `role="button"` but are not keyboard-focusable
- **Repro:** Tab through a `MultiSlider` with `label`; focus moves between thumbs only — track and ticks never receive focus despite `role="button"` and `onKeyDown` for Enter/Space.
- **Issue + impact:** Assistive technologies and keyboard users get a **misleading role** (button that cannot be focused). Enter/Space handlers are dead for keyboard users. Users who depend on correct role semantics may be directed to controls they cannot operate from the keyboard.
- **Suggestion:** Either (a) restore `tabIndex={disabled ? -1 : 0}` and ensure each control has a proper **accessible name** (track: e.g. “Adjust value along track”; ticks: use visible value text or `aria-label`), or (b) remove `role="button"` and treat track/ticks as **non-widget** regions (e.g. `role="presentation"` / no role) if interaction is pointer-only and duplicates handle behavior—then document that value changes are via thumbs only.


```351:372:core/components/atoms/multiSlider/index.tsx
      // TODO(a11y): fix accessibility
      /* eslint-disable */
      labels.push(
        <div
          onClick={onClickHandler}
          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
            if (!this.props.disabled && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onClickHandler(event as unknown as React.MouseEvent<HTMLElement>);
            }
          }}
          className={styles['Slider-label']}
          // ...
          role="button"
          // tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
```

```465:481:core/components/atoms/multiSlider/index.tsx
          {/* TODO(a11y): fix accessibility  */}
          {/* eslint-disable */}
          <div
            className={styles['Slider-track']}
            // ...
            onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
              if (!this.props.disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                this.maybeHandleTrackClick(event as unknown as React.MouseEvent<HTMLDivElement>);
              }
            }}
            role="button"
            // tabIndex={this.props.disabled ? -1 : 0}
            aria-disabled={this.props.disabled || undefined}
```

---

### 2. SKIP as Low Priority - P1 - Multiple thumbs share the same `aria-labelledby` when a group label exists (RangeSlider & MultiSlider)
- **Repro:** `<MultiSlider label="Price"><Handle …/><Handle …/></MultiSlider>`; both thumbs reference the same `id` via `aria-labelledby`.
- **Issue + impact:** Each thumb is announced with the **same name**, so users cannot tell which thumb is minimum vs maximum (or nth handle) without inferring from value alone.
- **Suggestion:** Supply **distinct** names per thumb (e.g. `aria-label` on each handle, or `aria-labelledby` pointing to visually hidden spans, or APG-style `aria-valuetext` that includes role context — preferably explicit labels like “Minimum price”, “Maximum price”). Extend `HandleProps` or parent API accordingly.

---

## 8. Navigation

### 1. TRICKY FIX THOUGHTFULLY AND TEST- P0 - Collapsed vertical items without `menu.icon` can be focusable controls with no accessible name
- **Repro:** Fails when `Navigation` / `VerticalNavigation` is used with `expanded={false}` and a menu object `{ name, label, … }` without `icon`: the wrapper is still `role="button"` with `tabIndex={0}` (if not disabled) but can have **no** computed accessible name.
- **Issue + impact:** Screen reader users get a “button” with no name; keyboard users may focus an unnamed control. This is an unambiguous name failure for that configuration.
- **Suggestion:** Always expose a name when the item is focusable (e.g. set `aria-label={menu.label}` whenever `!expanded`, or render visually hidden text for `menu.label`, or remove `tabIndex`/role when there is nothing to show).

---

### 2. TEST IF ANY ISSUE WITH HOVER EXPANDING NAVS - P1 - Submenu parents do not expose expand/collapse state or a controlled region (`aria-expanded`, `aria-controls`)
- **Repro:** Fails when `Navigation` is used as documented with vertical layout, `expanded`, and any item that defines `subMenu`: assistive technologies cannot reliably report open/closed state or associate the button with the submenu panel.
- **Issue + impact:** Users relying on state announcements or structured relationships cannot tell whether a section is expanded or which content it controls; behavior diverges from APG disclosure expectations.
- **Suggestion:** Add stable `id`s to submenu containers; set `aria-expanded={Boolean(menuState[menu.name])}` on parents with submenus; use `aria-controls` pointing at the submenu panel id; consider `aria-haspopup="true"` if you keep a button-like pattern.

---

### 3. P1 - Vertical active item state is not exposed to assistive technologies (`aria-current` missing)
- **Repro:** Fails when comparing vertical vs horizontal usage with the same `active` prop: vertical items do not expose programmatic “current” state.
- **Issue + impact:** Users cannot hear which destination is current in the same way as the horizontal variant; inconsistent API behavior across `Navigation` layouts.
- **Suggestion:** Mirror `HorizontalNav`: set `aria-current="page"` (or `step` / `true` if more appropriate to your IA) on the active top-level and submenu items when `isMenuActive` is true.

---

### 4. P1 - `Menu.link` is ignored in vertical layout (no native links for destinations)
- **Repro:** Fails when consumers pass `link` expecting vertical items to behave as real links (open in new tab, copy URL, SR “link” semantics, middle-click).
- **Issue + impact:** Same data model yields different semantics by layout; users lose link affordances and predictable navigation behavior.
- **Suggestion:** Render `<a href={menu.link}>` (or `Link`) for vertical items when `link` is set, preserving keyboard and AT semantics; keep `role="button"` only for pure disclosure toggles if needed.

---

## 9. SegmentedControl

### 1. P1 - Selection state not exposed in the accessibility tree
- **Repro:** Documented usage with `SegmentedControl.Item label="Day"` etc. — buttons have no `aria-pressed`, `aria-checked`, or `aria-selected`, and no `role="radio"` + `aria-checked`.
- **Issue + impact:** Assistive technologies announce each segment as a generic **button** with no “selected/checked/pressed” state. Users cannot tell which option is active except by inferring from visible styling or reading all labels without state semantics.
- **Suggestion:** Choose one pattern and wire state: e.g. container `**role="radiogroup"`** with `**aria-labelledby` / `aria-label`**, items `**role="radio"`** + `**aria-checked={isSelected}**` (and `tabIndex` per APG radio group), or keep `<button>` and set `**aria-pressed={isSelected}**` if you treat them as toggle buttons in a group (document the pattern).

---

### 2.  NOT NECESSARY BUT FIX WITH ABOVE - P1 - Selected segment is removed from sequential focus (`tabIndex`)
- **Repro:** Render documented label-only control (e.g. Day / Week / Month) with index 0 selected — inspect first `<button>`: `tabindex="-1"` while unselected segments use `tabindex="0"`. Tab never moves focus onto the currently selected segment.
- **Issue + impact:** Users relying on Tab (and many screen-reader focus modes) cannot focus the active option. That diverges from APG **radio group** / roving `tabindex` patterns (one tab stop into the group, then arrows; or at minimum focusable selected item). It also makes keyboard re-activation of the selected choice impossible without clicking or focusing another segment first.
- **Suggestion:** Align with a documented pattern: e.g. **roving** `tabindex` (one `tabIndex={0}` on the selected item or on the group container, others `-1`) plus **ArrowLeft/ArrowRight/Home/End** to move selection/focus; or keep all segments `tabIndex={0}` if the product accepts multiple tab stops (still expose selection state — see finding 2).

---

### 3. P1 - No group role or group accessible name on the control root
- **Repro:** Use `SegmentedControl` as in docs/stories without an external wrapping `fieldset`/`role="group"` — the control has no programmatic “group” semantics for the set of segments.
- **Issue + impact:** Screen reader users hear a flat list of buttons with no indication they are **one control** choosing among related options. External copy/layout may supply a visible heading, but the component does not wire `**aria-labelledby`** to it or accept a dedicated `**aria-label`** on the group.
- **Suggestion:** Add optional props such as `**aria-label`** / `**aria-labelledby`** (and optionally `**id**`) on the root, and set `**role="radiogroup"**` (or `**role="group"**` with visible label association) per the chosen pattern. Forward those attributes on the outer element.

---

## 10. DatePicker

### 1. P1 - Popover trigger: open state and popup relationship not exposed to assistive tech
- **Repro:** Open Storybook or docs usage with input trigger; inspect the trigger in the accessibility tree while the calendar is open—state of the popup is not reflected on the reference control.

**Issue + impact:** `PopperWrapper` clones only positioning/ref and click (or hover) handlers onto the trigger wrapper; it does **not** set `aria-expanded`, `aria-haspopup`, or `aria-controls` pointing at the portaled panel. Screen reader users cannot reliably tell that a popup is attached, whether it is expanded, or which element it controls—breaking alignment with APG date-picker / disclosure patterns and weakening programmatic state for the composite.

**Suggestion:** Generate unique ids for the popup container; pass `aria-controls` / `id` through `Popover` → `PopperWrapper` → trigger; mirror `open` to `aria-expanded` (and choose `aria-haspopup="dialog"` or `"grid"` per chosen pattern). Ensure the popup node is findable and labelled (e.g. `role="dialog"` with `aria-modal` if modal, or documented non-modal behavior).

---

### 2. P1 - Portaled overlay: no focus move on open and no explicit focus return on close
- **Repro:** Tab to the date input, open the picker (click or typing path that sets `open: true`); focus remains in the input. Press Escape to close; observe whether focus is guaranteed on the trigger.

**Issue + impact:** The calendar lives in a **portal** under `document.body`. Focus is **not** moved into the calendar grid when the overlay opens, so keyboard users may need to tab through unrelated page controls to reach the grid, or miss it entirely depending on DOM order. On close (`escapeKeypress`, outside click, selection), there is **no explicit** `focus()` return to the input in `DatePicker` / `PopperWrapper`—focus may drop to `body` or an unpredictable element, harming predictability for keyboard and screen-reader users.

**Suggestion:** On open, move focus to the first sensible target (e.g. selected date cell or first enabled cell in `Calendar`). On close, return focus to the input (or prior element). If implementing a modal dialog pattern, add **focus trap** inside the popup; if non-modal, document and test tab order so the grid is reachable without excessive traversal.

---

### 3. P1 - Validation / help text from `InputMask` not associated with the `<input>`
- **Repro:** Use `DatePicker` with `withInput`, `required`, and invalid partial input to surface “Invalid value” / `caption`; inspect `<input>`—no `aria-describedby` / `aria-errormessage` pointing at the `HelpText` / `InlineMessage` id.

**Issue + impact:** `InputMask` renders `HelpText` (and error `InlineMessage` with a generated id) **below** the field but does **not** pass that id into `Input`’s `aria-describedby` or `aria-errormessage`. The `Input` component only merges `aria-describedby` with the optional inline label id. Users relying on AT to announce errors get a weaker or missing association between the control and the error description.

**Suggestion:** In `InputMask`, capture `HelpText`’s resolved id (or use a ref callback) and pass `aria-describedby` / `aria-errormessage` (and `aria-invalid` when appropriate) through to `Input`. DatePicker consumers then benefit automatically from the shared `Trigger` → `InputMask` path.

---

### 4. P1 - Inherited Calendar structural issues

**Issue + impact:** DatePicker does not mitigate Calendar’s known issues (e.g. `role="gridcell"` on `<button>`, header `aria-label` vs visible month/year). Users experience them inside the picker overlay.

**Suggestion:** Fix at `Calendar` (preferred) or document workarounds; re-run this audit after Calendar changes.

---

## 11. DateRangePicker

### 1. P1 - Popover open affordance is pointer-only; wrapper is not a keyboard-operable control
- **Repro:** Tab to the start (or single) `InputMask` field; attempt to open the calendar using only keyboard (no mouse). The toggle is attached to the `**OutsideClick` `div`** via `onClick` in `PopperWrapper.getTriggerElement`; that wrapper is not focusable and has no `onKeyDown` equivalent, so keyboard users cannot mirror the click behavior on the wrapper itself.

**Issue + impact:** Users who cannot use a pointing device may be unable to open the popup calendar at all, or must rely on incidental behaviors (e.g. some flows call `setState({ open: true })` from input handlers in dual-input mode, but that is inconsistent and not a documented keyboard contract).

**Suggestion:** Implement an APG-aligned keyboard contract: e.g. `**aria-expanded`** on the text field, **Alt+Down / Escape** (or similar) on the input, and/or make the **logical trigger** keyboard-activatable with **Enter/Space** without relying on a non-focusable parent `div`.

---

### 2. P1 - Portaled calendar: no focus move into overlay; tab order likely skips calendar until late in document
- **Repro:** Open the picker with input triggers; with focus in an input, press **Tab** repeatedly. The calendar is appended to `**document.body`**, typically **after** main page content in DOM order, so focus may traverse the rest of the page before reaching grid cells—if it reaches them at all without explicit focus management.

**Issue + impact:** Even when the grid implements roving tabindex internally, keyboard users get an **illogical focus sequence** and may not discover the calendar without excessive tabbing. This conflicts with expected date-picker dialog behavior (focus moves into the dialog or first focusable in the popup).

**Suggestion:** On open, **move focus** to the calendar (e.g. first enabled date cell or a “dialog” wrapper with `role="dialog"` and `aria-modal` if you adopt that pattern); on close, **return focus** to the invoking input. Optionally trap focus inside the overlay while open.

---

### 3. P1 - Visible `Label` is not programmatically tied to the `InputMask` / `<input>` (no `htmlFor` / `id` pair)
- **Repro:** Inspect the DOM: `<label>` (via `GenericText` / `Label`) sits as a **sibling** of the input; `**Input`** does not auto-generate an `id`, and `**Trigger` does not pass `htmlFor`** matching the input’s `id`.

**Issue + impact:** Assistive technologies may **not associate** “Start date” / “End date” with the correct field; click-to-focus from the label text may not work. Users hear the control name from **placeholder** or other heuristics instead of the designed label.

**Suggestion:** Generate stable **unique ids** per instance (e.g. `uidGenerator`) for start/end/single inputs; set `**id`** on the `<input>` and `**htmlFor`** on the label (or wrap the input inside the label if layout allows).

---

### 4. P1 - Inline error / caption text from `HelpText` is not referenced on the `<input>`
- **Repro:** Force `showStartError` / `showEndError` / `showError` so `HelpText` renders a message; check the `<input>` — it gets `**aria-invalid`** via `Input`, but `**aria-describedby` / `aria-errormessage`** is not wired to `**HelpText`’s `id`** (HelpText generates an id internally, but `InputMask` does not connect it).

**Issue + impact:** Screen reader users may hear “invalid” without an **explicit programmatic link** to the **error description** text.

**Suggestion:** In `**InputMask`**, pass `**id`** to `**HelpText**` and merge that id into `**aria-describedby**` (and/or `**aria-errormessage**` when in error) on the forwarded `**Input**` props.

---

## 12. GenericChip (`_chip`)

### 1. SKIP - P1 - Nested focusable controls — `role="button"` containing another `role="button"`
- **Repro:** `GenericChip` with `clearButton={true}` — wrapper and clear control are both `role="button"` with `tabIndex={0}` when not disabled (see snapshots in `__tests__/__snapshots__/_chip.test.tsx.snap`).
- **Issue + impact:** Assistive technologies may expose confusing nested button semantics, duplicate “button” announcements, or inconsistent activation/focus behavior compared to a flat structure (e.g. sibling buttons in a `role="group"`).
- **Suggestion:** Make the main action and dismiss **siblings** under a single non-button container or `role="group"` with `aria-labelledby` tied to the label text; use native `**<button type="button">`** for each actionable surface. Avoid a focusable dismiss control inside an outer `role="button"`.

---

### 2. P1 - Disabled state not exposed on the custom button (`aria-disabled`)
- **Repro:** Render `GenericChip` with `disabled` — wrapper uses `tabIndex={-1}` but does not set `aria-disabled="true"` (snapshots show `role="button"` without disabled state attributes).
- **Issue + impact:** A `div` with `role="button"` has no native `disabled` attribute; without `aria-disabled`, screen readers may not announce the control as unavailable even though it is removed from the tab order.
- **Suggestion:** Set `**aria-disabled={disabled}`** on the outer widget. Mirror on the clear control when the chip is disabled. Prefer native `<button disabled>` where possible.

---

### 3. P1 - Direct `GenericChip` usage: `onClick` / `onClose` not gated on `disabled`
- **Repro:** `<GenericChip label="x" name="n" disabled onClick={fn} />` — `onClickHandler` in `_chip/index.tsx` still invokes `onClick` when the wrapper receives a click (visual `pointer-events` / CSS not audited here).
- **Issue + impact:** Disabled state can be inconsistent: focus is removed, but pointer activation may still run business logic, or AT may not hear “disabled” (combined with finding 2).
- **Suggestion:** In `GenericChip`, guard `**onClickHandler`** and `**onCloseHandler`** with `if (disabled) return` (and avoid firing keyboard handlers when disabled), or document that `GenericChip` is internal-only and must always be composed with external guards.

---

## 13. ASK ANURADHA AS NESTED TRIGGER or GRID- List

### 1. P1 - Resource rows are pointer-only (no keyboard equivalent)
- **Repro:** Use `List` with `type="resource"` and `onRowClick` as in `core/components/organisms/list/__stories__/index.story.jsx` — row activation is wired to `onClick` on a non-focusable `<div>` with no `tabIndex`, `role`, or `onKeyDown`.
- **Issue + impact:** Keyboard and many assistive-technology users cannot trigger the same “open resource” behavior as mouse users. The codebase even marks the row container with `TODO(a11y)` comments.
- **Suggestion:** Expose row activation as a focusable control (e.g. `role="link"` or `role="button"` on the row or a per-row trigger), implement Enter/Space per APG, ensure a clear accessible name (from row content or `aria-label`), and avoid duplicate activation when inner controls are focused.

**Code reference (inherited):**

```148:156:core/components/organisms/grid/GridRow.tsx
  return (
    <div className={wrapperClasses} data-test="DesignSystem-Grid-rowWrapper">
      {/* TODO(a11y)  */}
      {/* eslint-disable-next-line */}
      <div data-test="DesignSystem-Grid-row" className={rowClasses} onClick={onClickHandler} ref={rowRef}>
        {renderSchema(leftPinnedSchema, !!leftPinnedSchema.length, 'left')}
        {renderSchema(unpinnedSchema, !leftPinnedSchema.length && !!unpinnedSchema.length)}
        {renderSchema(rightPinnedSchema, false, 'right')}
      </div>
```

---

### 2. P1 - No semantic table or ARIA grid structure for tabular data
- **Repro:** Render `List` with any schema — body is nested `<div>` elements (`Grid-body`, `Grid-row`, `Grid-cell` classes) without `role="table"` / `role="grid"` / `role="row"` / `role="gridcell"` (or equivalent native `<table>`).
- **Issue + impact:** Assistive technologies do not get a table/grid landmark model: rows, columns, and headers are not exposed in a standard way. With `showHead={false}`, **programmatic column headers are absent**, so column-to-cell relationships are not available.
- **Suggestion:** Either adopt native `<table>` (with visually hidden headers if needed) or implement the [APG grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) / [APG table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) roles with `aria-colcount`, header cells, and keyboard model; for a “list” visual, still expose column metadata for screen readers.

**Code reference (inherited — `List` forces `showHead` off):**

```19:21:core/components/organisms/list/List.tsx
export const List = (props: ListProps) => {
  return <Table {...props} showHead={false} filterPosition={'HEADER'} />;
};
```

```720:728:core/components/organisms/grid/Grid.tsx
            {showHead && (
              <GridHead
                schema={schema}
                onSelectAll={this.onSelectAll?.bind(this)}
                onMenuChange={this.onMenuChange.bind(this)}
                onFilterChange={this.onFilterChange.bind(this)}
                updateColumnSchema={this.updateColumnSchema.bind(this)}
                reorderColumn={this.reorderColumn.bind(this)}
              />
            )}
```

---

## 14. PopperWrapper

### 1. P1 - Open state not exposed on the trigger (`aria-expanded`, `aria-controls`, `aria-haspopup`)
- **Repro:** Use `PopperWrapper` / `Popover` with a typical trigger; inspect the `PopperWrapper-trigger` `div` and child trigger—no `aria-expanded` mirroring `open`, no `aria-controls` pointing at the floating node, no `aria-haspopup` reflecting the type of popup.
- **Issue + impact:** Assistive technologies cannot reliably report whether the popup is open or which element it controls. Users who rely on SR announcements and browse mode heuristics get an **incomplete or static** picture of the control.
- **Suggestion:** Generate a stable `**id`** for the floating root (or accept one via props), `**cloneElement`** or merge props so the **reference** node receives `**aria-expanded={open}`**, `**aria-controls={popupId}`**, and an appropriate `**aria-haspopup**` (e.g. `dialog`, `listbox`, `menu`, `true`) chosen by API or consumer. Ensure the floating root exposes that `**id**`.

---

### 2. P1 - Click mode: keyboard activation relies on the child trigger; wrapper has no key handling
- **Repro:** Documented-style usage where opening depends on **clicking** a **non-focusable** region of the trigger wrapper, or where the focused element’s **default key behavior** does not toggle the popover (e.g. text field).
- **Issue + impact:** Users who cannot use a pointer may be unable to **open** or **toggle** the surface, or may experience **inconsistent** behavior compared to pointer users.
- **Suggestion:** Prefer **native `<button type="button">`** (or documented requirement) for the trigger; or merge `**onKeyDown**` on the reference wrapper / cloned trigger to handle **Enter/Space** when appropriate, without breaking text inputs. Document which compositions are keyboard-supported.

---

### 3. P1 - No focus management when content is portaled (`appendToBody`)
- **Repro:** Open an interactive popover portaled to `body`; **Tab** from the trigger—focus follows **document order**, not necessarily the floating panel; closing via **Escape** does not **restore focus** to the reference in this component.
- **Issue + impact:** Keyboard and screen-reader users may need **excessive tabbing** to reach the popup or may **miss** it; on close, focus may land unpredictably, slowing task completion and disorienting users.
- **Suggestion:** For modal-like surfaces, coordinate `**focus()`** into the floating region on open, **trap** focus while open, and **return focus** to the trigger on close (consumer hooks or built-in optional behavior). For non-modal patterns, document **expected** tab order and optional **roving**/`aria-modal="false"` behavior.

---

### 4. P1 - Hover mode + portaled content: `onBlur` on the reference wrapper conflicts with focusing the popup
- **Repro:** Open via **focus** (`onFocus` → open). **Tab** from the last focusable node inside the reference toward the portaled panel—**focus leaves** the wrapper → `**onBlur`** → `**handleMouseLeave`** schedules close (`hoverable`) or closes immediately (`!hoverable`), often before focus can reach the panel.
- **Issue + impact:** Keyboard users may be **unable to use** hover-styled popovers/tooltips whose content is in a **portal**, or the surface may **flicker closed**. This undermines WCAG-aligned “content on hover **or focus**” expectations when the surface is interactive.
- **Suggestion:** Use `**focusin`/`focusout`** with checks that **relatedTarget** is inside the **floating node** (portal), or a **single** focus scope containing both reference and popup; alternatively treat keyboard-opened hover surfaces like **click** mode for focus lifecycle. Align with APG **tooltip** / **dialog** patterns as appropriate.

---

## 15. Radio

### 1. P1 - Consumer `id` via `{...rest}` overrides input `id` but `<label htmlFor>` stays on the internal id
- **Repro:** Render `<Radio id="my-radio" label="Option" name="g" value="a" />`; DOM input gets `id="my-radio"` while `label` keeps `htmlFor` equal to the internally generated id string — label no longer targets the focused control.
- **Issue + impact:** Clicking the visible label may not toggle the radio; screen readers may not associate the visible label with the input’s accessible name as intended.
- **Suggestion:** Apply `id={resolvedId}` **after** `{...rest}`, or omit `id` from the spread onto the input and map consumer `id` into a single `resolvedId` used for both input and `htmlFor` (same pattern as the Checkbox implementation’s ordering).

---

### 2. P1 - `error={true}` is visual-only — no `aria-invalid` (or error relationship)
- **Repro:** Use `<Radio error={true} label="x" name="n" value="v" />` as in unit tests — input has no `aria-invalid` from the component.
- **Issue + impact:** Users of assistive technologies are not informed that the control is in an error state; only sighted users see border styling.
- **Suggestion:** When `error` is true, set `aria-invalid={true}` on the input; optionally accept error message text or an error element id and set `aria-errormessage` when that content exists.

---

### 3. P1 - `helpText` is not programmatically associated with the input
- **Repro:** Render `Radio` with `label`, `helpText`, and focus the input — help text is not included via `aria-describedby` unless the author duplicates wiring manually with external ids.
- **Issue + impact:** On focus, many screen readers announce only the name/state of the radio, not the descriptive paragraph shown next to it; users must discover help text by linear reading.
- **Suggestion:** Assign a stable id to the help text node (e.g. `${resolvedId}-helptext`) and set / merge `aria-describedby` on the input (merge with any consumer `aria-describedby` from props).

---

### 4. P1 - Radio can render with no accessible name
- **Repro:** Render `<Radio name="g" value="a" />` with no `label`, `aria-label`, or `aria-labelledby`.
- **Issue + impact:** The control may be announced as “radio button” with no discernible purpose.
- **Suggestion:** Document that one of `label`, `aria-label`, or `aria-labelledby` is required; consider TypeScript discriminated props or runtime dev warning.

---

## 16. Select

### 1. P1 - Nested interactive: `<button>` inside `<button>` on default trigger
- **Repro:** Use `Select` with default trigger, select any value, then inspect DOM: outer `data-test="DesignSystem-Select-trigger"` wraps inner `data-test="DesignSystem-Select--closeIcon"` button.
- **Issue + impact:** HTML forbids nested `button` elements. Assistive technologies and focus management may not expose the clear action reliably; validation/HTML parsers may report errors.
- **Suggestion:** Make the clear control a non-button interactive (e.g. `type="button"` adjacent sibling) or use a single `button` + internal `span` with `role` only if spec-compliant; prefer pattern used by APG combobox clear affordances (separate focusable or in-toolbar control outside the primary button).

---

### 2. P1 - `aria-invalid` never applied on default `SelectTrigger` (prop dropped)
- **Repro:** Pass `triggerOptions={{ 'aria-invalid': true }}` or rely on docs claiming context `error` maps to `aria-invalid` — the attribute is absent on the trigger button.
- **Issue + impact:** `SelectTrigger` destructures `'aria-invalid': ariaInvalid` but does not spread it onto the `<button>`, so invalid state is not announced. Visual error styling still uses `error` from context (`Select-trigger--error`), so sighted users and AT diverge.
- **Suggestion:** Forward `aria-invalid={ariaInvalid ?? (error ? true : undefined)}` (or equivalent) on the trigger `<button>` and align docs with behavior.

---

### 3. P1 - Default trigger `aria-label` overrides visible label / placeholder text
- **Repro:** `Select` with `triggerOptions={{ inlineLabel: 'Country', placeholder: 'Choose' }}` and no `aria-label` — screen readers typically announce **“Select trigger”** (default), not “Country”.
- **Issue + impact:** `aria-label` wins over subtree text in accessible name calculation, so the visible field label does not describe the control for assistive technology users.
- **Suggestion:** Remove the unconditional default `aria-label`, or default to `undefined` and require an explicit label for icon-only cases; or generate `aria-labelledby` from visible label + value elements when present.

---

### 4. P1 - Default `aria-label` on each option overrides option content
- **Repro:** Options with text children (e.g. “Canada”) — exposed name is often **“option item”** because `aria-label={props['aria-label'] || 'option item'}` on `Listbox.Item`.
- **Issue + impact:** All options sound identical or generic in SR rotor / list navigation, hiding real option text.
- **Suggestion:** Default `aria-label` to `undefined` and let name come from children; set `aria-label` only when there is no visible text or for rare string-only option data.

---

## 17. TimePicker

### 1. P1 - `TimePickerWithInput` overwrites any consumer `inputOptions.id` and `InputMask` strips the `<input>` id
- **Repro:** Use `TimePicker` / `TimePickerWithInput` with `inputOptions={{ id: 'appointment-time' }}` and a `<label htmlFor="appointment-time">`; the association fails because the input has no id.

**Issue + impact:** Programmatic linking of a visible `<label>` (or `aria-labelledby` targeting a label element’s `id`) is **broken**. Multiple pickers also cannot be given distinct input ids through the documented `inputOptions` API. Assistive tech and automated tests that rely on stable `id`s are hindered.

**Suggestion:** Stop hardcoding `parent-TimePicker` as the final `id` prop, or generate a **unique id per instance** (e.g. `useId` / `uidGenerator`) and pass it through to `Input`. If `InputMask` must keep sentinel behavior for mask logic, scope it to internal state only and still emit a real `id` on the input for consumers.

---

### 2. P1 - Error state without associated error message (`InputMask` / `TimePickerWithInput`)
- **Repro:** Set `error` on `TimePicker` (input variant) with no `caption` / help message; inspect `<input>`—`aria-invalid` may be true (via `Input`) but there is **no** `aria-describedby` / `aria-errormessage` pointing at rendered error copy (`HelpText` returns `null` when `message` is empty).

**Issue + impact:** Users hear that the field is invalid but may not get the **specific** error text in the same announcement flow as the control.

**Suggestion:** In `InputMask`, wire `HelpText`’s resolved id into `Input`’s `aria-describedby` / `aria-errormessage` when `error` and message exist. In `TimePickerWithInput`, expose a prop for error message (or map `error` to a default message) so `caption` is populated when `error` is true.

---

### 3. P1 - `Dropdown` treats `tabIndex === 0` as “unset”, breaking `firstEnabledOption` for `TimePickerWithSearch`
- **Repro:** Open `TimePicker` with `withSearch`; on first open, `Dropdown.render()` uses `const firstEnabledOption = tabIndex ? tabIndex : …` — when `tabIndex` is `**0`**, the expression is **falsy** and the fallback branch runs, so the **highlighted / “first enabled” index** does not match index **0**.

**Issue + impact:** Active option styling, scroll targets, and keyboard “active” option selection (`Enter` from search in `DropdownList`) can desync from the intended first option (e.g. midnight / first slot), confusing keyboard and screen-reader users.

**Suggestion:** Replace the truthy check with an **undefined / null** check, e.g. `firstEnabledOption = tabIndex != null ? tabIndex : …`, or use a separate prop name (e.g. `focusedOptionIndex`) that allows `0`.

---

## 18. VerticalNav

### 1. P1 - Default documented menus omit `link`, yielding `<a>` without `href` (placeholder links)
- **Repro:** Fails when `VerticalNav` is used as documented in Flat-style stories: interactive items are placeholder `<a>` elements, not buttons or real destinations.
- **Issue + impact:** Assistive technologies often announce **“link”** without a URL; behavior is click/keyboard-driven like a button, so **role does not match behavior**. This also diverges from APG tree examples that avoid link role on tree items unless they are actual navigations.
- **Suggestion:** Use `<button type="button">` (or `role="button"` only if unavoidable) when `menu.link` is absent; reserve `<a href="…">` for real navigations. If SPA routing must use buttons, document required `link`/`href` patterns or provide a single composable primitive per item type.

---

### 2. P1 - Disabled menu items are not exposed with `aria-disabled="true"`
- **Repro:** Fails when `VerticalNav` is used with `menu.disabled: true` on any entry (see tests around disabled styling): the item is non-actionable for pointer and roving keyboard lists, yet the accessibility tree lacks an explicit **disabled** state.
- **Issue + impact:** Users who explore content linearly or use tools that list links/controls may not hear **unavailable** state; only visual styling and removal from the roving set imply disability.
- **Suggestion:** Set `aria-disabled="true"` on disabled tree items (and avoid activating `onClick` for disabled entries if any path still fires). Prefer native `disabled` on `<button>` if switching away from `<a>` for non-link items.

---

### 3. P1 - Tree container has no accessible name and props do not allow `aria-label` / `aria-labelledby`
- **Repro:** Fails when `VerticalNav` is used as documented with no wrapper supplying a name: the tree region is unnamed in the accessibility tree.
- **Issue + impact:** In landmarks/structure views or when the tree is announced in isolation, users get **“tree”** without context (e.g. “Main”, “Settings”, “Patient chart”).
- **Suggestion:** Add an optional `aria-label` or `aria-labelledby` prop (or render inside `<nav aria-label="…">` with appropriate `role` composition per APG), defaulting to a sensible string for the primary app nav case.

---

### 4. P1 - `customItemRenderer` / `customOptionRenderer` bypass built-in roles and keyboard wiring
- **Repro:** Fails when `customItemRenderer` is used without replicating tree roles, names, disabled state, and `data-menu-name` / focusability consistent with `VerticalNav`’s `onFocus` and `utils.ts` selectors.
- **Issue + impact:** Tree semantics and keyboard navigation can **silently break** for assistive technology users.
- **Suggestion:** Document required attributes (`data-menu-name`, `data-disabled`, `role`, `tabIndex`, `aria-expanded`, `aria-level`, `aria-disabled`) and provide a headless primitive or example that preserves the contract.

---

## 19. Modal

### 1. P0 - Composition pattern: dialog has no accessible name though `ModalHeader` shows a heading
- **Repro:** Fails when `Modal` is used with `<ModalHeader heading="…" />` (or equivalent) as a child and **without** `aria-labelledby` on `Modal`—the `[role="dialog"]` `Column` gets `aria-labelledby={undefined}` while a visible heading exists only inside children.
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

## 20. TextField

### 1. P0 - Visible `label` prop is not programmatically associated with the control
- **Repro:** Use `<TextField label="Email" />` (or with textarea): the `<label>` from `Label` is **not** wrapping the `<input>` / `<textarea>`, and `TextField` does not set `htmlFor` on `Label` or a stable `id` on the control, so there is no programmatic label–control relationship.
- **Issue + impact:** Clicking the label may not focus the field; screen readers may not treat the visible string as the accessible name of the textbox, so users can miss the purpose of the field or struggle with forms.
- **Suggestion:** In the field wrapper, generate a unique `id` (e.g. `uidGenerator`), pass it to `Input` / `Textarea` as `id`, and pass the same token to `Label` as `htmlFor`. Allow consumer override via props while keeping defaults correct.

```36:44:core/components/organisms/textField/TextFieldWithInput.tsx
  return (
    <div>
      {label && (
        <Label required={required} withInput={true} size={labelSize}>
          {label}
        </Label>
      )}
      <Input {...props} error={inputError} onChange={onChangeHandler} />
```

```75:89:core/components/organisms/textField/TextFieldWithTextarea.tsx
    <div>
      {label && (
        <Label required={required} withInput={true} size={size}>
          {label}
        </Label>
      )}
      <Textarea
        {...props}
        resize={resize}
        rows={rows}
        onChange={onChangeHandler}
        error={inputError}
        ref={textareaRef}
      />
```

---

### 2. P1 - Help and error copy from `HelpText` is not linked to the control
- **Repro:** `<TextField label="Notes" helpText="Max 50 characters" />` — `HelpText` assigns an `id` to the message container (`HelpText.tsx`), but `TextField` never sets `aria-describedby` (or `aria-errormessage` when in error) on the `<input>` / `<textarea>` to that `id`.
- **Issue + impact:** Assistive technologies may not expose hint or error text in the same “field” object as the control; users may not hear constraints or validation messaging when exploring or correcting input.
- **Suggestion:** Resolve a single `helpId` from `HelpText` (callback ref, render prop, or lift `id` generation into `TextField` and pass `id` into `HelpText` + `aria-describedby` on the control). For error state, prefer `aria-errormessage` pointing at the `InlineMessage` `id` where supported, in addition to or instead of mixing into `aria-describedby`, per project convention.

```10:16:core/components/organisms/textField/TextFieldCommon.tsx
export const RenderHelpText: React.FC<RenderHelpTextProps> = ({ helpText, error }) => (
  <HelpText
    className="d-flex"
    message={helpText.trim().length > 0 ? helpText : ' '}
    error={error ? error : undefined}
  />
);
```

---

### 3. P1 - `Label` does not accept `htmlFor` / `id` from `TextField` API
- **Repro:** Consumer sets `id="foo"` on `TextField` (forwarded to `Input` via `{...props}`) but cannot pass `htmlFor="foo"` to the internal `Label` because `TextField` only forwards `required`, `withInput`, and `size`.
- **Issue + impact:** Even knowledgeable consumers cannot complete `htmlFor` + `id` pairing through the documented `TextField` props surface.
- **Suggestion:** Expose optional `labelProps` / `inputProps` split (or `id` + auto `htmlFor`) so association and overrides are first-class.

---

## 21. Combobox

### 1. P1 - Multiselect options: `aria-selected` does not reflect chosen chips
- **Repro:** Use `Combobox` with `multiSelect`, `Combobox.List` + `Combobox.Option`, select one or more values; inspect option nodes’ `aria-selected` vs. chips.
- **Issue + impact:** `ComboboxOption` forces `selected={option.label === inputValue?.label}` and ignores multiselect membership (`chipInputValue`) and the optional `selected` prop (spread `...rest` is overridden). Assistive technologies announce incorrect selection state in the listbox; users cannot rely on the list to match the value shown in chips.
- **Suggestion:** Derive `selected` from `multiSelect ? chipInputValue?.some(...) : match inputValue` (and/or honor an explicit `selected` prop when provided). Thread `chipInputValue` from context into `ComboboxOption`.

---

### 2. P1 - Multiselect trigger: `role="button"` wrapper around `role="combobox"` input
- **Repro:** Inspect `MultiSelectTrigger` DOM: outer `div` has `role="button"` and `tabIndex={-1}` (from `ChipInputBox`), inner `input` has `role="combobox"` and associated `aria-`* (`ChipInputBox.tsx` → `MultiselectTrigger.tsx`).
- **Issue + impact:** Nested/interactive structure: a “button” contains an editable combobox. Screen readers and voice control may expose two overlapping roles for one field; the outer `role="button"` + click-to-focus is redundant with the real combobox and increases ambiguity.
- **Suggestion:** Use a non-interactive wrapper (`role="group"` or `role="presentation"`) with an accessible name via `aria-labelledby` / `aria-label` on the group or combobox input only; avoid `role="button"` on the container that wraps the combobox input.

---

### 3. P1 - `readOnly` single-select: input removed from tab order
- **Repro:** Pass `readOnly` to the combobox input path; `Input` sets `tabIndex={-1}` when `readOnly` is true.
- **Issue + impact:** Combobox cannot be focused via Tab; keyboard users cannot operate the control as documented for combobox.
- **Suggestion:** For combobox usage, do not force `tabIndex={-1}` on the combobox input when `readOnly`, or document that `readOnly` is unsupported / use `disabled` + alternative UX.

---

## 22. Dropdown

### 1. P1 - Module-level `inputRef` breaks search focus for multiple dropdown instances
- **Repro:** Render two such dropdowns; open each — `inputRef.current` points at a single shared ref, so `focus()` and `Input` `ref` from `componentDidUpdate` / open effects target the wrong or last-mounted search input.
- **Issue + impact:** Keyboard and programmatic focus can land in the wrong dropdown’s search field; one instance may never receive the ref. Screen reader users lose predictable focus and may edit/search the wrong control.
- **Suggestion:** Move `inputRef` to a per-instance ref (e.g. `React.createRef` in the `Dropdown` constructor or `useRef` if refactored) and pass that ref into `DropdownList`.

---

### 2. P1 - Custom trigger omits disclosure/list semantics unless the consumer adds them
- **Repro:** `customTrigger={() => <button type="button">…</button>}` without `aria-haspopup`, `aria-expanded`, or relationship to the popup.
- **Issue + impact:** AT may not expose the control as opening a list/menu or reflect open/closed state; users may not discover popup behavior or current state.
- **Suggestion:** Merge required ARIA into the cloned element in `DropdownList` (`aria-haspopup`, `aria-expanded={dropdownOpen}`, optional `aria-controls` once the list has a stable id), or document and enforce a render-prop contract that returns a focusable element accepting those props.

---

## 23. EmptyState

### 1. P1 - Title uses `<span>` (via `Text`) for non-`standard` sizes — heading structure lost
- **Repro:** Use documented compound API with `EmptyState size="compressed"` (or `tight`) and `EmptyState.Title` as in `__stories__/sizes/Compressed.story.jsx` — title is not a heading in the DOM.
- **Issue + impact:** `EmptyStateTitle` switches to `Text` → `GenericText` with `componentType="span"` for every size except `standard`. Users who navigate by headings or rely on a coherent document outline will not find the empty-state title as a heading; relationship to the surrounding page heading hierarchy is weakened.
- **Suggestion:** Render a heading element for the title for all sizes (e.g. always use `Heading`, or use `Heading` with a prop for visual size / level). If design requires non-heading visuals, still expose a heading with an appropriate level (or `aria-level` if ever using a role workaround — native heading level is preferred).

---

## 24. Icon

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

## 25. Listbox

### 1. P1 - Orphan `role="option"` when container is not a listbox (`description`, custom focus, draggable)
- **Repro:** Render `<Listbox type="description">` or `<Listbox draggable>` with default props; inspect DOM: root has no `role="listbox"` while item rows still use `role="option"` (`Listbox.tsx` `listRole` vs. `ListBody` default `role`).
- **Issue + impact:** In ARIA, options must be owned by / contained in a `listbox` (or compatible composite). A root with no `listbox` role but descendant `option` roles is structurally invalid; assistive technologies may not associate rows with a list, breaking list semantics and selection announcements.
- **Suggestion:** When the root intentionally is not a listbox (e.g. static description lists), default item `role` to something neutral (`role="presentation"` / `group` / no option) or require an explicit `role` on items; for draggable mode, default the list container to `role="listbox"` (or document that consumers must set it) and keep option semantics consistent.

---

### 2. P1 - Documented nested-panel props are not applied; no expansion semantics
- **Repro:** Use `Listbox.Item` with `nestedBody`, `nestedListId`, `nestedListAriaLabel`, and `expanded`; inspect `NestedList` output (`NestedList.tsx`)—wrapper is a plain `div` with no `id`, no accessible name, no landmark role.
- **Issue + impact:** Authors expect `nestedListId` and `nestedListAriaLabel` to wire `aria-controls` / named regions per JSDoc on `ListboxItem.tsx`, but `NestedList` only destructures `nestedBody` and `expanded`, so those props have no effect. There is no `aria-expanded` (or separate expand control) tying the row to the panel, so screen reader users do not get a correct expandable pattern.
- **Suggestion:** Extend `NestedList` to render e.g. `role="region"` with `id={nestedListId}`, `aria-label` or `aria-labelledby` from `nestedListAriaLabel` (or split label vs. labelledby if needed), and set `aria-expanded` / `aria-controls` on the visible expand trigger or on the option row per APG; align implementation with the documented props.

---

### 3. P1 - Draggable list: default container lacks `listbox`; reorder keyboard model is not APG listbox
- **Repro:** `DraggableList` merges `...rest` onto `<Tag>` but does not set `role="listbox"` by default (`DraggableList.tsx`); options still expose `role="option"` from `ListBody`.
- **Issue + impact:** Same structural orphan-option concern as finding 1. Additionally, `Draggable.tsx` implements Space + arrows for reorder selection/move, which is not the standard listbox key map (Enter/Space to select, arrows to move focus only)—authors and users may get inconsistent behavior vs. a plain listbox.
- **Suggestion:** Default `role="listbox"` on the draggable root when options keep `role="option"`, **or** drop `option`/`listbox` roles in draggable mode and document a dedicated “reorder list” pattern with explicit roles (`application` / `button` handles, etc.) per APG guidance—avoid mixing roles.

---

## 26. MetricInput

### 1. P1 - Stepper buttons stay keyboard-focusable when the field is `disabled` or `readOnly`
- **Repro:** Render `<MetricInput disabled showActionButton />` (or `readOnly`); Tab from prior focusable control — increment/decrement buttons remain in the tab order and can receive focus/activation even though `onArrowClick` no-ops and the wrapper uses `pointer-events: none` for mouse users.
- **Issue + impact:** Mouse users see a non-interactive control; keyboard and some AT users still land on operable-seeming buttons, producing inconsistent disabled behavior and wasted tab stops.
- **Suggestion:** Set `disabled={disabled || readOnly}` (or `aria-disabled` + `tabIndex={-1}` with documented behavior) on both stepper buttons when the field is not editable, matching the input’s state.

```321:341:core/components/atoms/metricInput/MetricInput.tsx
      {showActionButton && (
        <div className={arrowIconsClass}>
          <button
            type="button"
            className={`${arrowButtonClass} border-bottom`}
            onClick={(e) => onArrowClick(e, 'up')}
            aria-label="Increment value"
            data-test="DesignSystem-MetricInput--upIcon"
          >
            <Icon name="keyboard_arrow_up" size={actionButtonIconSize} />
          </button>
          <button
            type="button"
            className={`${arrowButtonClass} border-bottom-0`}
            onClick={(e) => onArrowClick(e, 'down')}
            aria-label="Decrement value"
            data-test="DesignSystem-MetricInput--downIcon"
          >
            <Icon name="keyboard_arrow_down" size={actionButtonIconSize} />
          </button>
        </div>
      )}
```

---

### 2. P1 - Stepper buttons not disabled (or otherwise inert) at `min` / `max` boundaries
- **Repro:** `<MetricInput min={0} defaultValue={0} />` — focus “Decrement value”; activate — nothing changes; same for `max` with “Increment value”.
- **Issue + impact:** Buttons retain enabled semantics and remain activatable while the handler silently no-ops, which is confusing for keyboard and screen-reader users who expect disabled controls when an action is unavailable.
- **Suggestion:** Drive `disabled` (or `aria-disabled` + keyboard blocking) from `min`/`max`/current numeric value on each button, or expose `aria-valuemin`/`aria-valuemax`-style relationships if you move to a single composite widget pattern.

---

### 3. P1 - `min` and `max` props are not applied as HTML attributes on the `<input>`
- **Repro:** Inspect DOM for `<MetricInput min={0} max={10} />` — `<input>` lacks `min`/`max` while clamping still occurs in script.
- **Issue + impact:** Assistive technologies and browser validation UX do not receive declared numeric bounds from the element; users may not hear or infer permitted range the way they would from a native number field.
- **Suggestion:** Pass `min={min}` and `max={max}` through to the `<input>` when defined (and keep JS clamping consistent with those attributes).

```127:152:core/components/atoms/metricInput/MetricInput.tsx
export const MetricInput = React.forwardRef<HTMLInputElement, MetricInputProps>((props, forwardedRef) => {
  const {
    size = 'regular',
    defaultValue,
    name,
    placeholder,
    icon,
    prefix,
    suffix,
    error,
    min,
    max,
    onChange,
    onClick,
    onBlur,
    onFocus,
    className,
    autoFocus,
    disabled,
    readOnly,
    value: valueProp,
    showActionButton = true,
    onKeyDown,
    iconType,
    ...rest
  } = props;
```

```297:315:core/components/atoms/metricInput/MetricInput.tsx
      <input
        data-test="DesignSystem-MetricInput"
        {...baseProps}
        {...rest}
        type="number"
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChangeHandler}
        onBlur={onBlur}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
      />
```

---

## 27. Popover

### 1. P1 - Trigger does not reflect open/closed state (`aria-expanded` / `aria-haspopup`)
- **Repro:** Fails when `Popover` is used as in unit tests with `<Button>Open Popup</Button>` and uncontrolled or controlled open state — the trigger remains a button with no `aria-expanded` or `aria-haspopup` tied to the popover.
- **Issue + impact:** Assistive technologies cannot reliably report whether the disclosure/popup is expanded; users lose parity with the visual “open” state.
- **Suggestion:** When the popover is click- or hover-controlled, clone/merge props onto `trigger` (or document a required pattern) to set `aria-expanded={open}` and an appropriate `aria-haspopup` (often `true` or `dialog` depending on content contract). Ensure controlled `open` stays in sync.

---

### 2. P1 - Default portaled surface (`appendToBody`) is not integrated into keyboard focus order
- **Repro:** Fails when `Popover` is used as documented with default `appendToBody`, a focusable trigger (e.g. `Button`), and focusable content inside the popover — after opening, **Tab** typically follows document order and may reach the portaled subtree only after traversing intervening focusables, or not in an order that matches the visual grouping.
- **Issue + impact:** Keyboard users can open the popover but may struggle to reach its controls predictably; focus order can diverge from the perceived “popup next to trigger” UI.
- **Suggestion:** On open, move focus to the first focusable in the popover or the popover container (with `tabIndex={-1}` if using a wrapper), document `appendToBody={false}` when in-flow order is required, and/or implement roving tabindex consistent with APG for the chosen pattern. On close, return focus to the trigger (see finding 5).

---

### 3. P1 - Non-focusable or improperly named `trigger` (generic element as trigger)
- **Repro:** Fails when `Popover` is used with a non-interactive element as `trigger` without keyboard support or accessible name.
- **Issue + impact:** Keyboard and assistive technology users cannot operate or identify the control; click-only `div` triggers are a common integration mistake.
- **Suggestion:** Document that `trigger` must be a native `button`/`a` (with `href`) or a component that forwards focus, keyboard activation, and an accessible name; optionally dev-warn when the trigger element is not inherently focusable.

---

## 28. Tooltip

### 1. P1 - Tooltip surface lacks `role="tooltip"` and is not exposed as a describable region
- **Repro:** Render `<Tooltip tooltip="Extra help" position="top"><Button>OK</Button></Tooltip>`; open on hover/focus and inspect the floating node — it is a `<div data-test="DesignSystem-Tooltip-Wrapper">` with no `role`.
- **Issue + impact:** Assistive technologies do not treat the floating content as a **tooltip**; users may not hear the string as **descriptive** content tied to the trigger, or may get inconsistent behavior across SR/browser combinations compared to a proper tooltip role.
- **Suggestion:** On the tooltip root element (the `Tooltip` wrapper `div`), set `**role="tooltip"`**. Ensure the tooltip is **not** made tabbable and does not contain focusable descendants (current `Text`/`span` usage is fine).

---

### 2. P1 - No `id` on the tooltip and no `aria-describedby` on the trigger
- **Repro:** Same as finding 1; inspect the `<button>` (or other trigger) while the tooltip is visible — no `aria-describedby` pointing at the floating description.
- **Issue + impact:** Supplementary text visible on hover/focus to sighted users is **not reliably exposed** as the accessible **description** of the control, so screen-reader users may miss instructions, hints, or clarifications that are not redundant with the control’s accessible name.
- **Suggestion:** Generate a stable unique `**id`** per Tooltip instance (e.g. `**React.useId()`**), apply it to the tooltip root. `**cloneElement`** the trigger `children` (or extend `PopperWrapper` to merge props into the real trigger) to set `**aria-describedby**` to that id while the tooltip is open, merging with any existing `**aria-describedby**` from the consumer (space-separated list). When the tooltip is unmounted/closed, remove or avoid leaving a stale id reference.

---

### 3. P1 - Keyboard access depends on the trigger being focusable
- **Repro:** Use `<Tooltip …><span>Label</span></Tooltip>` with no `tabIndex` — pointer hover may still show the tooltip (depending on hit target / wrapping), but keyboard users cannot focus the trigger to mirror “hover or focus” behavior.
- **Issue + impact:** Users who rely on keyboard navigation may **never see** the tooltip if the trigger is not focusable.
- **Suggestion:** Document that the **trigger must be a focusable element** (native button/link or `tabIndex={0}` with appropriate **accessible name** and keyboard semantics). Optionally warn in dev or enforce via types/docs for the `children` slot.

---

## 29. Avatar

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

## 30. AvatarGroup

### 1. P1 - Overflow trigger: no `aria-expanded` / `aria-controls`; keyboard activation incomplete for click mode
- **Repro:** Open the overflow with keyboard only after tabbing to the “+N” control — `Enter`/`Space` do not toggle the popover; assistive technologies also lack a programmatic expanded state on the trigger.
- **Issue + impact:** `AvatarCount` is a `div` with `role="button"` and `tabIndex={0}`. `PopperWrapper` attaches `onClick` to the **wrapper** around the trigger, not `onKeyDown` for `Enter`/`Space` on the focused control. The trigger is not updated with `aria-expanded` or `aria-controls` tied to the popover surface. Screen reader users cannot tell whether the popup is open; keyboard-only users may be unable to open/close the overflow in click mode.
- **Suggestion:** Either use a native `<button type="button">` for the overflow control and wire `aria-expanded` / `aria-controls` from popover open state and a stable popup `id`, or extend `Popover`/`PopperWrapper` (or `AvatarGroup`) to clone the trigger with the same disclosure pattern used elsewhere (e.g. `Select`’s trigger merge) plus `onKeyDown` for primary key activation.

---

### 2. P1 - `aria-haspopup="listbox"` on overflow trigger vs actual popup structure
- **Repro:** Inspect the “+N” trigger (`aria-haspopup="listbox"`) and the default list: `Listbox` renders `<ul>` without `role="listbox"` when `type="description"` (see `Listbox.tsx`: `listRole` becomes `rest.role`, unset here).
- **Issue + impact:** Assistive technologies are told to expect a **listbox** popup, but the default content is a **list** (`<ul>`) with inner rows using `**role="option"`** from `ListboxItem`/`ListBody` — not a valid `listbox` → `option` tree. This misreports the interaction model and weakens correct navigation announcements.
- **Suggestion:** Align semantics: e.g. pass `role="listbox"` (and an `id`) on the `Listbox` in `AvatarPopperBody`, **or** remove `aria-haspopup="listbox"` from `AvatarCount` and use `aria-haspopup="dialog"` / `true` if the surface is treated as a generic panel, **and** adjust inner row roles for a static description list (`role="option"` only inside a `listbox`). Prefer one consistent pattern per APG.

---

## 31. Button

### 1. P1 - Loading state removes text label from the accessibility tree
- **Repro:** Use `<Button loading>Submit</Button>` without `aria-label` / `aria-labelledby`; label text is wrapped in `Text` with `Button-text--hidden`, which uses `visibility: hidden` in CSS — typically excluded from the accessible name calculation, while the inner `Spinner` exposes `role="status"` and default `aria-label="Loading"`.
- **Issue + impact:** Assistive technologies may not associate the control with “Submit” (or similar) while loading; users hear a generic “Loading” (or a weakened name) and lose context for the pending action.
- **Suggestion:** Prefer an off-screen or `aria-hidden` visual treatment that **preserves** the text node for naming (e.g. visually hidden but not `visibility: hidden`), or automatically mirror `children` into `aria-label` while loading when no explicit label relation exists; consider marking the spinner decorative (`aria-hidden`) when the button already sets `aria-busy`.

---

## 32. Calendar

### 1. P1 - Header jump buttons: accessible name hides visible month/year text
- **Repro:** Use Calendar in date view; focus the month or year header control; assistive technologies use `aria-label` (“Select month” / “Select year”) as the name, not the visible `Jan` / `2026` text.

**Issue + impact:** The month and year header buttons set `aria-label="Select month"` and `aria-label="Select year"` while the visible label is the abbreviated month and numeric year. `aria-label` wins in the accessible name calculation, so users may not hear **which** month or year is displayed—hurting orientation and voice-control users who match visible text.

**Suggestion:** Prefer **visible text as the primary name** (remove overriding `aria-label`, or set `aria-label`/`aria-labelledby` to include both action and value, e.g. “January 2026, change month”). Optionally add `aria-haspopup` / `aria-expanded` if you model view switching as a disclosure pattern (align with chosen APG pattern).

---

### 2. P1 - `role="gridcell"` on native `<button>` (date, month, year views)
- **Repro:** Inspect accessibility tree for any calendar cell button; role is exposed as `gridcell` (explicit role overrides implicit `button` in common browser AX APIs).

**Issue + impact:** Combining **button** and **gridcell** by forcing `role="gridcell"` on a `<button>` yields an incorrect or inconsistent role in many AT/browser combinations; users may not get consistent “button” semantics for activation, while grid semantics expect the cell wrapper to own `gridcell` and the action to be a named child control.

**Suggestion:** Match APG: wrap focus target in `<div role="gridcell" …>` (roving `tabIndex` on the gridcell or inner `button`), **or** use a single interactive pattern that does not override `<button>`’s implicit role. Ensure one tab stop per logical cell and preserve current keyboard behavior.

---

## 33. Chip

### 1. P1 - Nested interactive controls (`role="button"` inside `role="button"`)
- **Repro:** Use `Chip` as documented with `clearButton={true}` (e.g. Storybook “All” story): outer wrapper is `role="button"` and contains a second focusable `role="button"` for clear.
- **Issue + impact:** Assistive technologies and accessibility APIs can expose conflicting or non-deterministic roles/focus semantics for nested buttons. Users may hear duplicate “button” nesting or get inconsistent focus/activation behavior compared to a flat structure (e.g. sibling buttons inside a `role="group"`).
- **Suggestion:** Restructure so the main chip and the dismiss control are **siblings** (e.g. wrapping `role="group"` with `aria-labelledby` pointing at the label text, or a single native `<button>` for the main action plus a separate `<button type="button">` for dismiss). Avoid focusable descendants inside a single `role="button"` widget.

---

### 2. P1 - Disabled state not exposed on the custom button (`aria-disabled`)
- **Repro:** Render `<Chip label="Chip" name="x" disabled type="selection" />` — wrapper gets `tabIndex={-1}` but no `aria-disabled="true"`.
- **Issue + impact:** Custom `role="button"` on a `<div>` relies on ARIA for state. Without `aria-disabled`, some screen readers may not announce the control as disabled/unavailable even though it is removed from the tab order; users lose parity with native `<button disabled>`.
- **Suggestion:** When `disabled`, set `**aria-disabled="true"`** on the outer widget (and consider `**aria-disabled`** on the clear control when the chip is disabled). Keep `tabIndex={-1}` and ensure no activation via click/pointer if still reachable (native `<button disabled>` is stronger).

---

## 34. ChoiceList

### 1. P1 - `title` does not programmatically name the `<fieldset>`
- **Repro:** `<ChoiceList title="Gender" choices={[...]} onChange={...} />` with no `aria-label` or `aria-labelledby` — matches common prop docs; `fieldset` has no computed accessible name from the visible title.
- **Issue + impact:** Screen readers may not announce a stable **group** name in forms mode / group navigation; users hear options without a clear grouping context even when a visual heading is present.
- **Suggestion:** Render `title` as a `**<legend>`** (styled to match `Label`), or give the title wrapper a stable `**id`** and set `**aria-labelledby`** on the `fieldset` to that id (prefer over duplicating text in `aria-label`). Ensure the visible group label and programmatic name stay in sync.

---

## 35. Collapsible

### 1. P1 - `withTrigger={false}` removes the only keyboard path while hover may still toggle expansion
- **Repro:** Fails when `Collapsible` is used with `withTrigger={false}` and `onToggle` provided; expansion depends on hover on `DesignSystem-CollapsibleBody` with no focusable control equivalent.
- **Issue + impact:** Keyboard and many assistive technology users cannot expand or collapse the panel if the footer trigger is omitted but hover remains enabled. That is a **keyboard access** gap for a real variant of the public API.
- **Suggestion:** If `withTrigger` is false, either **disable hover-driven toggling**, or **expose an alternative focusable control** (e.g. optional `renderTrigger`, or move keyboard/hover logic to a single native `<button>`). Document that **hover-only** use is not keyboard-accessible.

---

### 2. P1 - Footer appears operable by default but does nothing when `onToggle` is omitted
- **Repro:** Fails when `Collapsible` is rendered with default `withTrigger` and without `onToggle`; the footer still exposes `role="button"`, `tabIndex={0}`, and `aria-expanded`, but click/keyboard handlers no-op inside `onToggleHandler`.
- **Issue + impact:** Users get a **named, focusable button** whose activation **does not change** state or notify the app. Assistive technologies announce a button that appears broken, which undermines trust and **programmatic state** expectations.
- **Suggestion:** Require `onToggle` whenever the footer is shown, **or** omit `role` / `tabIndex` / `aria-expanded` when `onToggle` is missing, **or** implement a sensible controlled/uncontrolled default so activation always does something documented.

---

## 36. EditableChipInput

### 1. P1 - Nested interactive controls — outer `role="button"` contains focusable chip “buttons”
- **Repro:** Render `EditableChipInput` with `value={['Chip1','Chip2']}` and `chipInputOptions` matching tests (`chipOptions` with `clearButton: true`) — inspect DOM: root has `role="button"` and `tabIndex="0"` while each `Chip` exposes a focusable `role="button"` (and optionally a nested dismiss `role="button"`) inside that root.
- **Issue + impact:** Nesting focusable buttons inside a declared button produces invalid accessibility trees and unpredictable screen-reader / keyboard behavior (multiple tab stops “inside” one button, ambiguous activation, conflicting roles). Users may not know which control will activate on **Enter** / **Space** or how focus order relates to the control’s announced role.
- **Suggestion:** Avoid `role="button"` on the **outer** wrapper when chips are shown. Prefer e.g. `**role="group"`** with `**aria-labelledby`** / `**aria-label`** for the field, plus an explicit **native `<button type="button">` “Edit”** (or make the non-interactive region non-focusable and rely on chip + edit affordances). Align with **Chip** fixes that avoid nested buttons (see chip audit: sibling structure / `role="group"`).

---

## 37. FileList

### 1. P1 - Row is exposed as a focusable `role="button"` even when `onClick` is not provided
- **Repro:** Render `<FileList fileList={…} />` without `onClick`; focus a row — screen readers announce a button; Enter/Space do nothing because `handleKeyDown` returns early when `onClick` is absent.
- **Issue + impact:** Assistive technology users get a misleading role and a tab stop that does not perform the expected button activation, which erodes trust and wastes navigation effort.
- **Suggestion:** When `onClick` is undefined, omit `role="button"`, `tabIndex`, and row-level `aria-label` (or use `tabIndex={-1}` only if a different focus model is required). Prefer a non-interactive row container; keep any real actions as separate named controls.

---

### 2. P1 - Nested interactives: `role="button"` row wraps `actionRenderer` content (often real `<button>`s)
- **Repro:** Use `actionRenderer` returning a `Button` per row; inspect the tree — a focusable button sits inside a parent with `role="button"` and a row-level `click` handler.
- **Issue + impact:** Invalid nesting and conflicting semantics confuse assistive technologies and make activation/focus behavior unpredictable (e.g. bubbling click to the row, ambiguous “button inside button” trees).
- **Suggestion:** Restrict the `role="button"` / click target to a non-action subset of the row, or make the row a `div`/`li` and use an explicit inner `<button>` / link for the primary action; place `actions` outside the clickable surface or use event handling that does not rely on a wrapping button role.

---

## 38. Link

### 1. P1 - `{...rest}` spread order allows overriding accessibility-critical props
- **Repro:** `<Link href="/x" disabled aria-label="…" tabIndex={0} />` — consumer `tabIndex={0}` overrides the component’s `tabIndex={-1}` for disabled links, returning a disabled-marked control to the tab order; similarly `onClick` in `rest` can override the disabled-safe `onClick` handling.
- **Issue + impact:** Disabled links may remain keyboard-focusable and activatable, or `aria-disabled` may be forced false while the control still looks disabled—breaking the contract between visible state, ARIA state, and keyboard/pointer behavior.
- **Suggestion:** Spread `{...rest}` first, then apply explicit `tabIndex`, `aria-disabled`, and `onClick` last; or omit those keys from `rest` and merge via a small helper so component rules always win.

---

## 39. MdsGrid

### 1. P1 - Pointer handlers on the root `<div>` (or `GridItem`) without full custom-control semantics
- **Repro:** `MdsGridProps` / `GridItemProps` inherit div attributes via `BaseHtmlProps<HTMLDivElement>`; `onClick` is type-allowed.
- **Issue + impact:** A non-interactive `<div>` with only `onClick` is typically not keyboard-focusable and does not expose button/link semantics; assistive technology users may not discover or operate the control from the keyboard.
- **Suggestion:** Use `MdsGrid` / `GridItem` as layout wrappers only; place actions on `Button`, links, or other native/interactive components. If documentation shows “clickable grid areas,” document the full APG-aligned custom-control pattern or discourage it.

---

### 2. P1 - Risk of applying `role="grid"` (ARIA data grid) without the full Grid pattern
- **Repro:** `<MdsGrid role="grid" …>` with arbitrary children that are not structured as rows/`gridcell` with documented keyboard behavior.
- **Issue + impact:** A partial or incorrect ARIA grid misrepresents structure and interaction to assistive technologies (missing required owned elements, row/column relationships, and keyboard model), which can confuse navigation and expectations.
- **Suggestion:** Document explicitly that `MdsGrid` is **CSS Grid layout**, not the APG **Grid** widget. Discourage `role="grid"` unless the app implements the full pattern (structure, naming, keyboard). Link to APG Grid vs layout guidance in design-system docs if available.

---

## 40. Message

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

## 41. OutsideClick

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

## 42. SelectionCard

### 1. P1 - Single-select pattern exposes each card as `checkbox`, not `radio` in a `radiogroup`
- **Repro:** Open the documented SingleSelect story / render two `SelectionCard`s with `useSingleSelect`; assistive technologies treat them as separate checkboxes, not as a single mutually exclusive set.
- **Issue + impact:** Users may believe **multiple cards can be selected at once** (checkbox mental model) while the app enforces a single selection, causing confusion and interaction errors.
- **Suggestion:** For exclusive selection, expose `**role="radio"`** (or a native `<input type="radio">` pattern) inside a `**role="radiogroup"`** with a visible or `aria-labelledby` group name, **or** document that authors must supply group semantics externally and accept checkbox-only behavior as a known limitation. Consider a prop such as `selectionMode="single" | "multiple"` to drive role and optional group wiring.

---

## 43. Sidesheet

### 1. P1 - Custom `header` (or title only in children) without `aria-labelledby` / `aria-label` on the dialog
- **Repro:** Fails when `Sidesheet` is used with `header={<…>Title…</…>}` and **without** `'aria-labelledby'` pointing at that title’s `id` (and without a supported auto-heading path).
- **Issue + impact:** Screen readers announce an unnamed dialog despite a visible header; users cannot reliably identify the surface in the accessibility tree.
- **Suggestion:** Document required `'aria-labelledby'` (or `headerOptions.heading` + default header) for all open sidesheets; optionally add dev-only warning when `open && !aria-label && !aria-labelledby` on the dialog; consider a small `SidesheetTitle` helper with a generated `id` + context, similar to patterns used elsewhere in the design system.

---

## 44. StatusHint

### 1. P1 - Root API omits `id` and `aria-`*; blocks robust programmatic association
- **Repro:** Fails when a form or table caption must reference the status hint element with `aria-describedby` pointing at the hint’s `id`, or when teams need `aria-label` on the non-clickable root for context — props are not merged onto the root.
- **Issue + impact:** Consumers must wrap `StatusHint` in an extra element to host `id` / `aria-`*, which complicates layout and risks skipping the pattern in practice. Assistive technologies may still infer nearby relationships from reading order, but programmatic association is not supported on the component root.
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or a curated allowlist: at least `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-atomic`) and merge onto the root after stripping component-only keys; or document a required wrapper pattern for association.

---

## 45. Badge

### 1. P1 - Interactive span surface without guardrails
- **Repro:** Fails when `Badge` is given `onClick` and `tabIndex={0}` (or is otherwise focusable) without an appropriate role and keyboard activation consistent with that role.
- **Issue + impact:** A focusable or clickable `<span>` without a widget role and keyboard support is not reliably operable with the keyboard and may not expose a correct role to assistive technologies.
- **Suggestion:** In docs and usage guidance, state that interactive badges should be implemented with `<Button>` / `<Link>` wrapping or as a native control; optionally restrict or warn on interactive props in types or dev-only checks, or provide a dedicated “clickable badge” variant that uses `<button>`.

---

## 46. ChipGroup

### 1. P1 - `list` items claim full `ChipProps` but a11y-related chip props are not forwarded
- **Repro:** Render `<ChipGroup list={[{ …chip fields…, 'aria-label': 'Filter: Urgent', label: <IconOnly />, type: 'action', name: 'x' }]} onClick={…} />` — the chip wrapper in the tree will **not** receive `aria-label` from the list item because `ChipGroup` never passes it to `Chip`.
- **Issue + impact:** Assistive technologies may compute the wrong accessible name (e.g. missing or generic name for custom `label` nodes) or wrong tab order if the author relied on `tabIndex` / `clearButtonAriaLabel` from the typed list shape. This undermines trust in `ChipProps[]` as the list element type.
- **Suggestion:** Forward all `Chip`-relevant props (spread `Chip` props from each item after destructuring handlers, or explicitly pass the full set including `aria-label`, `aria-labelledby`, `clearButtonAriaLabel`, `tabIndex`, `labelPrefix`, `maxWidth`, `size`, `className`). Alternatively, narrow the `list` type to the props `ChipGroup` actually supports so consumers are not misled.

---

## 47. Column

### 1. P1 - `onClick` (and similar) on a non-interactive root can create a mouse-only control
- **Repro:** `Column.test.tsx` explicitly renders `<Column onClick={onClick}>` and fires a click — a pattern that, if copied into production without `tabIndex`, `role="button"` (or `role="link"`), `onKeyDown`/`onKeyUp` for Enter/Space (button), and `aria-label` / visible text that names the action, matches a known keyboard and role/value gap for `<div>` click targets.
- **Issue + impact:** A `<div>` with only `onClick` is not in the tab order and does not expose button/link semantics; screen-reader users may not discover or operate the control with the keyboard.
- **Suggestion:** Document that `Column` must not be used as the primary interactive target; use `<Button>`, `<LinkButton>`, `<a>`, or wrap content in a native interactive element. If a rare layout case requires the root to be clickable, document the full widget pattern (role, `tabIndex`, keys, name) or restrict/deprecate interactive props in favor of composition.

---

## 48. Divider

### 1. P1 - No way to mark decorative / layout-only dividers for assistive tech
- **Repro:** Fails when `Divider` is used as documented for vertical layout between adjacent columns and the product expects the line to be **purely decorative** (no “separator” / structural cue in AT).
- **Issue + impact:** Screen readers often announce `<hr>` / separator semantics. Consumers **cannot** pass through `aria-hidden="true"`, `role="presentation"` / `role="none"`, or similar overrides because those props are never spread onto `<hr>` and are not part of `DividerProps`.
- **Suggestion:** Extend `DividerProps` with `OmitNativeProps<HTMLHRElement, 'className'>` (or a narrowed set) and spread the remaining native props onto `<hr>` after `extractBaseProps`, **or** add explicit optional props (e.g. `decorative` / `aria-hidden`) and document when to use them.

---

## 49. Dropzone

### 1. P1 - `formatLabel` and `sizeLabel` are not programmatically related to the file input or browse trigger
- **Repro:** Use `<Dropzone formatLabel="PDF only" sizeLabel="Max 10 MB" />`; focus the “browse files” control or inspect the hidden `input` — there is no shared `id` / `aria-describedby` (or equivalent) linking helper text to the operable control.
- **Issue + impact:** Screen reader users may activate upload without hearing format/size rules that sighted users see below the trigger, increasing errors and rework.
- **Suggestion:** Generate stable ids (e.g. `useId` / existing `uidGenerator` pattern), put `id` on helper `Text` wrappers, and set `aria-describedby` on both the hidden `input` and the browse `Text` (and optionally root) to include those ids.

---

## 50. EditableDropdown

### 1. P1 - Focus lands on trigger that is immediately hidden (close / cancel / apply / outside close)
- **Repro:** Open `EditableDropdown` (keyboard or pointer), then close via Escape, outside click, or option selection; observe `document.activeElement` relative to `[data-test="DesignSystem-DropdownTrigger"]` and `display` on the dropdown wrapper after state settles.
- **Issue + impact:** `DropdownList`’s `onToggleDropdown` always calls `dropdownTriggerRef.current?.focus()` after `toggleDropdown` (`DropdownList.tsx`). `EditableDropdown` hides the entire `Dropdown` with `d-none` when not editing (`EditableDropdown.tsx`). After close, focus often remains on (or is moved to) a **display:none** button or is lost to `body`, so keyboard users lose a predictable focus position and screen readers get inconsistent reading context.
- **Suggestion:** After close in `EditableDropdown`, **move focus to the outer container** (or a dedicated native button replacing the outer `div`) in a `useEffect` / layout effect keyed on `dropdownOpen === false && !editing`, or coordinate with `Dropdown`/`DropdownList` to **skip trigger focus** when used inside this pattern. Prefer one owner for “return focus” semantics.

---

## 51. Flex

### 1. P1 - Pointer handlers on the root `<div>` without full custom-control semantics
- **Repro:** `FlexProps` inherits div attributes via `BaseHtmlProps<HTMLDivElement>`; `onClick` is type-allowed. Pattern matches known gaps for clickable `<div>`s in production layouts.
- **Issue + impact:** A non-interactive `<div>` with only `onClick` is typically not keyboard-focusable and does not expose button/link semantics; assistive technology users may not discover or operate the control from the keyboard.
- **Suggestion:** Treat `Flex` as a layout wrapper only; put actions on `<Button>`, links, or other native/interactive components. If the design system documents “clickable Flex,” document the full APG-aligned custom-control pattern or discourage it in component docs / Storybook.

---

## 52. HelpText

### 1. P1 - Programmatic association missing in primary docs and in-repo composition
- **Repro:** Use HelpText as in `Components/HelpText/All` or `With Error` beside `Select`/`Input` without `aria-describedby` / `aria-errormessage` and a stable shared `id`; or use `TextFieldWithInput` / `TextFieldWithTextarea`, which render `<HelpText />` without passing HelpText’s `id` into the input/textarea’s ARIA props.
- **Issue + impact:** Help text and error text are visible but often **not exposed as the control’s accessible description or error message**, so screen reader users may not hear them in context with the field when exploring by control or when the UA maps `aria-describedby` / `aria-errormessage`.
- **Suggestion:** Update stories and `RenderHelpText` to use an explicit `id` on HelpText and pass it to the field (`aria-describedby` for non-error; `aria-invalid` + `aria-errormessage` for error). Consider a small composed pattern or docs that enforce the same.

---

## 53. InlineMessage

### 1. P1 - Consumers cannot set `role`, `aria-live`, or other `aria-`* on the component root
- **Repro:** Fails when a form reveals `<InlineMessage appearance="alert" description="…" />` only after failed submit, focus remains in the input, and no wrapper sets `aria-live` / `role="alert"` — screen reader users may not hear the new error. Repro: TBD — verify in Storybook / a real form flow.
- **Issue + impact:** `InlineMessageProps` extends `BaseProps` only; the implementation spreads `extractBaseProps(props)`, which **omits** all `aria-`* and `role`. Teams must wrap the component in an extra element to add `aria-live` or `role="alert"`, which is easy to miss and duplicates layout concerns.
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or a curated subset: `role`, `aria-live`, `aria-atomic`, `aria-relevant`) and spread `...rest` onto the root `div` after stripping component-specific keys; **or** add documented props such as `announce` / `live` that apply `role="alert"` / `aria-live="polite"` for error/info variants. Align internal docs: `accessibilityProps.ts` currently lists `InlineMessage` under “manage a11y internally,” which is misleading given the narrow root API.

---

## 54. Input

### 1. P1 - `inlineLabel` wired with `aria-describedby` instead of labeling
- **Repro:** Use `<Input inlineLabel="USD" name="amount" />` without `aria-label` / external `<label htmlFor>`; assistive technologies typically treat `aria-describedby` as **supplementary description**, not the **accessible name**, so the field name may be wrong or missing while “USD” is only announced as extra description.
- **Issue + impact:** Visible prefix text that functions as the primary label should be referenced with `aria-labelledby` (or a native `<label>` + `htmlFor`). Using only `aria-describedby` misrepresents the relationship and can yield incorrect or confusing announcements in the name vs description order.
- **Suggestion:** Reference the inline label element with `aria-labelledby` (and keep `aria-describedby` only for true hints/errors/help). If both an external label and `inlineLabel` exist, merge IDs appropriately. Update unit tests that currently assert `aria-describedby` for this case.

```313:315:core/components/atoms/input/Input.tsx
        aria-describedby={
          [rest['aria-describedby'], inlineLabel ? inlineLabelId : undefined].filter(Boolean).join(' ') || undefined
        }
```

---

## 55. InputMask

### 1. P1 - `helpText` and `caption` are not programmatically associated with the textbox
- **Repro:** Render `<InputMask id="primary_phone_1" helpText="Enter your phone number" … />` as documented; the help line gets a generated `HelpText-*` id, but the `<input>` has no `aria-describedby` referencing it.
- **Issue + impact:** Screen reader users may not hear instructions or error copy **in the same object as the field** when navigating by form control or relying on `aria-describedby` / `aria-errormessage` mapping. `caption` is documented as error-related but is only shown via `HelpText` with no link to `aria-invalid` beyond `error` → `Input`’s `aria-invalid`.
- **Suggestion:** Generate or accept a stable id for the help/error region (reuse `HelpText`’s `id` prop), pass `aria-describedby` (and when `error`, prefer `aria-errormessage` + existing `aria-invalid` from `Input`) on the `Input` so it references that id. Merge with any consumer-provided `aria-describedby` from `…rest`.

---

## 56. KeyValuePair

### 1. P1 - Orphan `<dt>` or `<dd>` inside `<dl>` (single subcomponent only)
- **Repro:** `KeyValuePair.test.tsx` renders `<KeyValuePair><KeyValuePair.Key label={label} /></KeyValuePair>` and `<KeyValuePair><KeyValuePair.Value value={value} /></KeyValuePair>` — `dt`-only and `dd`-only lists.
- **Issue + impact:** A description list is meant to associate **names** (`dt`) with **values** (`dd`). A lone term or lone description breaks that association for users who rely on structure (including some assistive technologies exposing `dl` semantics).
- **Suggestion:** Document that each logical row should include **both** `Key` and `Value` (or custom equivalents in both slots). Optionally enforce via `dev` warning, Storybook docs, or types (e.g. require tuple children). For intentional “value only” display, recommend a non-`dl` pattern or `aria`-backed layout chosen with care.

---

## 57. Label

### 1. P1 - Supplementary `info` is delivered via a hover-only tooltip; trigger is not keyboard-operable
- **Repro:** Render `<Label info="Password must be 8 characters">Password</Label>` with a matching `htmlFor`; use keyboard only (no pointer) — the tooltip does not open on focus; the `<i>` icon is not inserted into the tab order because `Icon` is used without `onClick`, so `useAccessibilityProps` does not add `tabIndex`.
- **Issue + impact:** Supplementary instructions may be **visible only on hover** for sighted users, and the **tooltip layer** is not exposed through an equivalent keyboard/focus path. Screen reader users may still encounter the `aria-label` on the icon while browsing the label subtree (see finding 2), but **keyboard-only sighted users** are left without the timed tooltip content.
- **Suggestion:** Use a focus + hover (or click) trigger for the popper, ensure the trigger is a native `<button type="button">` (or focusable control with `aria-expanded` / `aria-controls` if using a disclosure pattern), and align with APG tooltip / disclosure guidance. Alternatively, surface `info` as persistent text or as `**aria-describedby` on the associated control** (consumer wiring or a composed field API).

---

## 58. OverlayHeader

### 1. P1 - Back `Button` (`icon="arrow_back"`) has no accessible name when `backButton` or `backIcon` is true
- **Repro:** Fails when `OverlayHeader` is used with `backButton={true}` / `backIcon={true}` and callbacks, as in documented tests (`core/components/molecules/overlayHeader/__tests__/OverlayHeader.test.tsx`).
- **Issue + impact:** Screen readers announce an unnamed button; voice control users lack a reliable speakable name. Keyboard behavior is native (`<button>`) but the **name** channel is empty.
- **Suggestion:** Set a default `aria-label` (e.g. “Back”) and/or `tooltip="Back"` on that `Button` so `Button`’s existing logic can populate `aria-label`; allow an optional prop for i18n (e.g. `backButtonAriaLabel`).

---

## 59. Placeholder

### 1. P1 - Typed children only — bypassing types could hide meaningful content from AT
- **Repro:** TBD — verify in Storybook / docs; would require overriding children with meaningful text/controls inside `<Placeholder>` while relying on SR exposure.
- **Issue + impact:** The root is always `aria-hidden="true"`. Anything placed inside (if consumers break the intended API) is excluded from the accessibility tree, which can cause **silent** important content or unfocusable-looking focus traps in edge cases.
- **Suggestion:** Keep typings strict; in docs, state explicitly that `Placeholder` must not wrap real content or interactive elements. Run-time `__DEV__` warning for unexpected child types is optional hardening.

---

## 60. ProgressBar

### 1. P1 - No accessible name on the progressbar; no supported way to add one
- **Repro:** Fails when `ProgressBar` is used as documented with only `value`, `max`, and `size` (e.g. tests and typical stories) — the root has `role="progressbar"` and value attributes but **no** accessible name.  
- **Issue + impact:** Assistive technologies announce role and values (e.g. “progress bar, 50%”) without context (“Upload”, “Saving…”). Multiple unnamed progress bars are indistinguishable. Consumers cannot attach an external visible label via `aria-labelledby` because `id` / `aria-labelledby` are dropped at the root.  
- **Suggestion:** Extend props with `aria-label` and/or `aria-labelledby` (and forward `id` if needed), or spread a constrained set of `React.HTMLAttributes<HTMLDivElement>` after internal `aria-value*` wiring. For parity with `ProgressRing`, consider a **overridable** default `aria-label` only if product accepts a generic fallback; prefer explicit consumer-provided names for task-specific progress.

---

## 61. ProgressRing

### 1. P1 - No supported way to align accessible name with visible label or to disambiguate multiple rings
- **Repro:** Fails when `ProgressRing` is used beside visible text such as “Profile completion: 75%” with no programmatic link and no way to override `aria-label` / set `aria-labelledby` via props (current API).
- **Issue + impact:** Screen reader users hear a generic name that may not match on-screen wording (2.5.3 risk where the ring is treated as the labeled control), and multiple instances are indistinguishable by name in the accessibility tree.
- **Suggestion:** Extend props to accept an accessible name API (e.g. optional `aria-label`, or `aria-labelledby` / `aria-describedby`, or `label` that sets `aria-label` when no `aria-labelledby` is provided). Prefer `aria-labelledby` when a visible label exists in the same view.

---

## 62. Row

### 1. P1 - Interactive `<div>` with click only (tests)
- **Repro:** `Row` is used with `onClick` and without `tabIndex`, `role` (or native `<button>` / `<a>`), and keyboard activation handlers—as in `Row.test.tsx` (“accepts other attributes”).
- **Issue + impact:** A plain `<div>` with `onClick` is not in the tab order and does not respond to Enter/Space like a button. Screen reader users and keyboard-only users cannot use the action. This is a common failure when layout primitives double as click targets.
- **Suggestion:** Prefer not to document or test `onClick` on `Row` without paired accessibility guidance. Encourage consumers to wrap interactive content in `<button>` / `LinkButton` / `<a>`, or pass `role="button"`, `tabIndex={0}`, `onKeyDown`/`onKeyUp` for Space/Enter, and an accessible name (`aria-label` or visible text). Long-term, consider deprecating interactive use on layout-only atoms or adding a dedicated interactive variant.

---

## 63. Spinner

### 1. P1 - Empty `aria-label` removes the accessible name
- **Repro:** Fails when `<Spinner appearance="primary" size="medium" aria-label="" />` is used without `aria-labelledby` pointing to a valid labelling element.
- **Issue + impact:** The element keeps `role="status"` but can end up with no effective accessible name, so screen readers may not convey what is loading.
- **Suggestion:** Treat empty string like “unset” and fall back to the default `"Loading"`, or omit `role="status"` / naming when intentionally decorative (see enhancement below). Document that an empty `aria-label` is invalid.

---

## 64. Stepper

### 1. P1 - Skipped steps (`skipIndexes`) have no programmatic “skipped” state
- **Repro:** Render `Stepper` with `skipIndexes` containing one or more indices; assistive technologies get the same step naming pattern as non-skipped steps (no “skipped” or equivalent in `aria-label` / `aria-describedby`).
- **Issue + impact:** Skipped steps remain focusable and activatable (`disabled` is false when `isSkipped` because `disabled = !activeStep && !isSkipped && completed + 1 < index`). Users who rely on SRs cannot tell which steps were skipped, which breaks parity with visual intent for that variant.
- **Suggestion:** Thread an `isSkipped` (or similar) flag into `Step` and reflect it in accessible name and/or description (e.g. append “, skipped” to `aria-label`, or use `aria-describedby` for a stable “Skipped” description). If skipped steps should not be actionable, align `disabled`, `tabIndex`, and `aria-disabled` with that product rule.

---

## 65. Text

### 1. P1 - `appearance="link"` is visual styling only — not a link in the accessibility tree
- **Repro:** Fails when `Text` with `appearance="link"` is the only control that navigates (e.g. “Learn more”) and no `<a>`, `Link`, or appropriate `role` + keyboard behavior is provided.
- **Issue + impact:** Storybook’s appearance story presents `link` as one of several styled labels on a `<span>`. Copying that pattern for in-app links yields text that may look like a link but is not exposed as a link, not in the tab order, and not activatable with standard link keys—blocking keyboard users and obscuring role from assistive tech.
- **Suggestion:** Document that `appearance="link"` must not be used alone for navigation; compose with `Link` or `<a>`. Optionally adjust stories to show `Link` + shared styles instead of `Text appearance="link"` for navigational examples.

---

## 66. Textarea

### 1. P1 - Size story: `htmlFor` / `id` mismatch and invalid `aria-labelledby` tokens
- **Repro:** Open Storybook **Components/Input/Textarea/Size**: `<Label htmlFor="regular">` / `htmlFor="small"` while `<Textarea>` has **no** `id="regular"` or `id="small"`; `aria-labelledby="Regular"` and `aria-labelledby="Small"` reference tokens that are **not** IDs of existing elements (they match visible label text, not `id` attributes).
- **Issue + impact:** Programmatic label association fails: clicking the label may not focus the field; assistive technologies may not resolve a correct **accessible name** from `aria-labelledby`. Users who mirror this pattern get broken naming and labeling behavior.
- **Suggestion:** Align with `Error.story.jsx`: set `id` on `Textarea` to match `Label`’s `htmlFor`, and set `aria-labelledby` to the **actual `id`** of the labeling element(s) (e.g. the label’s `id`), or drop redundant `aria-labelledby` when a native `<label>` is correctly associated. Remove placeholder-only naming assumptions from the example.

```7:16:core/components/atoms/textarea/__stories__/Size.story.tsx
      <Label withInput={true} htmlFor="regular">
        Regular
      </Label>
      <Textarea name="regular" size="regular" aria-labelledby="Regular" placeholder="Enter your comments here" />
    </div>
    <div className="w-50">
      <Label withInput={true} size="small" htmlFor="small">
        Small
      </Label>
      <Textarea name="small" size="small" aria-labelledby="Small" placeholder="Enter your comments here" />
```

---

## 67. Toast

### 1. P1 - Root API omits `id` and `aria-*`; blocks stable relationships on the live region node
- **Repro:** Fails when a team mounts `<Toast title="Saved" message="…" />` (or error copy) and needs the toast root to be the ID target for a live association from the control that triggered it — `ToastProps` does not extend `BaseHtmlProps`, and the root does not spread arbitrary HTML/ARIA props.
- **Issue + impact:** Relationships that should target the live region must use a wrapper `div` with `id` / `aria-`*, which duplicates layout concerns and is easy to miswire. Assistive technologies may still hear the toast via `role` + live region behavior, but programmatic wiring to this node is not supported by the component API.
- **Suggestion:** Extend `ToastProps` with `BaseHtmlProps<HTMLDivElement>` (or a curated subset: at least `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, optional `role` / `aria-live` / `aria-atomic` overrides) and merge onto the root; document stacking / `aria-live` politeness for multiple toasts.

---

## 68. VerificationCodeInput

### 1. P1 - Shared `aria-label` from `...rest` overwrites per-digit labels on every cell
- **Repro:** Fails when `VerificationCodeInput` is used with `aria-label="Verification code"` (or similar single string) while relying on the component to label each digit; every cell exposes the same accessible name.
- **Issue + impact:** Screen reader users lose **position context** (“which digit am I editing?”). This parallels the failure mode of non-unique names across a related set of controls.
- **Suggestion:** Do not forward a single `aria-label` to every `Input`. Prefer a **group** label (`aria-labelledby` / `legend`) plus per-cell labels, or synthesize per-cell labels when a group label is provided (e.g. append “, digit 2 of 6”).

---

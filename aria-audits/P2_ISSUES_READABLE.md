# 149 Medium/Low Severity (P2/3) accessibility issues

Medium-severity ARIA and structural issues from the aggregated design-system audits, with a **suggested fix order**. Many items are **APG polish**, duplicate naming, or shared primitives (overlays, list surfaces, **Input**); counts follow **one row per distinct P2 bullet** in the source reports.

## Issue count per component

| Fix order | Component                                                  | P2 issues |
| --------: | ---------------------------------------------------------- | --------: |
|         1 | Input                                                      |         3 |
|         2 | Button                                                     |         4 |
|         3 | Icon + useAccessibilityProps                               |         3 |
|         4 | Utils (Divider, Backdrop, OutsideClick, PopperWrapper)     |         2 |
|         5 | Popover                                                    |         4 |
|         6 | Dropdown                                                   |         5 |
|         7 | EditableDropdown                                           |         4 |
|         8 | Listbox                                                    |         5 |
|         9 | Select                                                     |         4 |
|        10 | Combobox                                                   |         4 |
|        11 | Menu                                                       |         5 |
|        12 | Radio                                                      |         2 |
|        13 | ChoiceList                                                 |         1 |
|        14 | Pagination                                                 |         1 |
|        15 | Breadcrumbs                                                |         3 |
|        16 | HorizontalNav                                              |         4 |
|        17 | VerticalNav                                                |         1 |
|        18 | Navigation                                                 |         2 |
|        19 | Tabs                                                       |         1 |
|        20 | Modal                                                      |         2 |
|        21 | Dialog                                                     |         3 |
|        22 | Sidesheet                                                  |         2 |
|        23 | FullscreenModal                                            |         1 |
|        24 | DatePicker                                                 |         5 |
|        25 | DateRangePicker                                            |         3 |
|        26 | Calendar                                                   |         3 |
|        27 | Table                                                      |         1 |
|        28 | List (KeyValuePair / MetaList)                             |         4 |
|        29 | Layout (Flex / MdsGrid)                                    |         1 |
|        30 | PageHeader                                                 |         4 |
|        31 | Chip / ChipGroup                                           |         3 |
|        32 | ChipInput                                                  |         3 |
|        33 | Card                                                       |         2 |
|        34 | Collapsible                                                |         2 |
|        35 | InputMask                                                  |         3 |
|        36 | VerificationCodeInput                                      |         3 |
|        37 | EditableInput                                              |         3 |
|        38 | EditableChipInput                                          |         3 |
|        39 | FileUploader                                               |         3 |
|        40 | Dropzone                                                   |         3 |
|        41 | MultiSlider / Slider / RangeSlider                         |         4 |
|        42 | Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter) |         1 |
|        43 | Tooltip                                                    |         2 |
|        44 | Typography (Text, Heading, Subheading, Paragraph, Caption) |         3 |
|        45 | Message / InlineMessage / Toast                            |         5 |
|        46 | StatusHint bundle (StatusHint, EmptyState, Placeholder)    |         2 |
|        47 | Link                                                       |         5 |
|        48 | LinkButton                                                 |         3 |
|        49 | Badge / Pills                                              |         2 |
|        50 | Avatar / AvatarGroup                                       |         1 |
|        51 | Chat                                                       |         1 |
|        52 | Checkbox                                                   |         1 |
|        53 | Textarea                                                   |         1 |
|        54 | SwitchInput                                                |         2 |
|        55 | Stepper                                                    |         1 |

---

## Suggested fix order

### 1.1 — Input: text input with `inlineLabel` only

|                          |                                                                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **What's wrong**   | When using `inlineLabel` without an external `<Label>`, there is no programmatic association between the label text and the input. |
| **Why it matters** | Screen readers cannot reliably identify what the field is for.                                                                         |
| **What to do**     | Generate and wire `id` / `htmlFor` or use `aria-labelledby` to connect the inline label to the input.                            |

### 1.2 — Input: `info` popover is hover-only

|                          |                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| **What's wrong**   | The info popover only appears on hover, making it inaccessible to keyboard-only users.           |
| **Why it matters** | Important help text is unavailable to users who cannot use a mouse.                              |
| **What to do**     | Add keyboard activation (focus/click) or use `aria-describedby` with always-visible help text. |

### 1.3 — Input: `clear` icon button lacks accessible name

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **What's wrong**   | The clear button is an**Icon** without `aria-label` or other naming. |
| **Why it matters** | Users cannot identify the purpose of the control.                            |
| **What to do**     | Add `aria-label="Clear"` or equivalent descriptive text.                   |

### 2.1 — Button: loading state may hide accessible name

|                          |                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **What's wrong**   | When `loading={true}`, the button text is visually hidden but may still contribute to the accessible name calculation. |
| **Why it matters** | The button might be announced as "Loading" without context about what action it performs.                                |
| **What to do**     | Preserve the action name in the accessible name (e.g., "Loading, Save" or use `aria-label`).                           |

### 2.2 — Button: `selected` state without `aria-pressed`

|                          |                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **What's wrong**   | The `selected` prop changes visual appearance but does not set `aria-pressed`.      |
| **Why it matters** | Toggle state is not communicated to assistive technology.                               |
| **What to do**     | Map `selected={true}` to `aria-pressed="true"` when the button represents a toggle. |

### 2.3 — Button: icon-only buttons may lack names

|                          |                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| **What's wrong**   | Buttons with only an icon and no text children may not have `aria-label` or `tooltip`. |
| **Why it matters** | The button purpose is unclear to screen reader users.                                      |
| **What to do**     | Require `aria-label` for icon-only buttons or use a tooltip with proper association.     |

### 2.4 — Button: inconsistent disabled state handling

|                          |                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **What's wrong**   | Disabled buttons may not consistently use `aria-disabled` alongside the `disabled` attribute. |
| **Why it matters** | Some assistive technologies work better with explicit `aria-disabled` state.                    |
| **What to do**     | Set `aria-disabled="true"` when `disabled={true}` for consistent AT support.                  |

### 3.1 — Icon + useAccessibilityProps: interactive icons without proper button semantics

|                          |                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **What's wrong**   | Icons with `onClick` may use `role="button"` on a `<div>` instead of native `<button>`. |
| **Why it matters** | Native button behavior (keyboard support, form participation) is missing.                       |
| **What to do**     | Use `<button>` elements for interactive icons or ensure full keyboard support.                |

### 3.2 — Icon + useAccessibilityProps: decorative icons not hidden from AT

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **What's wrong**   | Purely decorative icons may not have `aria-hidden="true"`.                         |
| **Why it matters** | Screen readers announce meaningless icon names, creating noise.                      |
| **What to do**     | Add `aria-hidden="true"` to decorative icons that don't convey unique information. |

### 3.3 — Icon + useAccessibilityProps: missing accessible names for functional icons

|                          |                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **What's wrong**   | Functional icons (like status indicators) may lack `aria-label` or equivalent naming. |
| **Why it matters** | Users cannot understand what the icon represents or its current state.                  |
| **What to do**     | Provide descriptive `aria-label` values for all meaningful icons.                     |

### 4.1 — Utils (Divider, Backdrop, OutsideClick, PopperWrapper): divider lacks semantic markup options

|                          |                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **What's wrong**   | **Divider** component may not support `role="separator"` or other semantic roles. |
| **Why it matters** | Screen readers cannot identify the purpose of visual separators.                          |
| **What to do**     | Add support for `role="separator"` and `aria-orientation` where appropriate.          |

### 4.2 — Utils (Divider, Backdrop, OutsideClick, PopperWrapper): backdrop click handling may interfere with AT

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | Backdrop click handlers might not account for assistive technology interaction patterns. |
| **Why it matters** | AT users may accidentally trigger backdrop actions or find them unpredictable.           |
| **What to do**     | Ensure backdrop interactions work consistently with keyboard and AT navigation.          |

### 5.1 — Popover: trigger lacks `aria-expanded` state

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | Popover triggers do not consistently set `aria-expanded` to reflect open/closed state. |
| **Why it matters** | Users cannot tell if the popover is currently open or closed.                            |
| **What to do**     | Bind `aria-expanded` to the popover's open state on the trigger element.               |

### 5.2 — Popover: missing `aria-haspopup` on triggers

|                          |                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **What's wrong**   | Triggers may not have `aria-haspopup` to indicate what type of popup they control.            |
| **Why it matters** | AT users don't know what to expect when activating the trigger.                                 |
| **What to do**     | Set appropriate `aria-haspopup` value (dialog, menu, listbox, etc.) based on popover content. |

### 5.3 — Popover: no `aria-controls` relationship

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| **What's wrong**   | Triggers lack `aria-controls` pointing to the popover surface ID.             |
| **Why it matters** | The relationship between trigger and popup is not programmatically exposed.     |
| **What to do**     | Generate stable IDs and wire `aria-controls` from trigger to popover surface. |

### 5.4 — Popover: keyboard navigation and focus management gaps

|                          |                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- |
| **What's wrong**   | Popover may not handle Escape key or manage focus return consistently.            |
| **Why it matters** | Keyboard users cannot reliably navigate or dismiss popovers.                      |
| **What to do**     | Implement standard popover keyboard patterns (Escape to close, focus management). |

### 6.1 — Dropdown: trigger missing popup relationship attributes

|                          |                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **What's wrong**   | Default trigger lacks `aria-expanded`, `aria-haspopup`, and `aria-controls`. |
| **Why it matters** | Popup relationship and state are hidden from assistive technology.                 |
| **What to do**     | Wire trigger to stable list/menu ID with proper ARIA attributes.                   |

### 6.2 — Dropdown: Escape key not handled in dropdown list

|                          |                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- |
| **What's wrong**   | Escape key press in `DropdownList` does not close the dropdown or return focus. |
| **Why it matters** | No standard keyboard dismiss pattern available.                                   |
| **What to do**     | Handle Escape to close dropdown and return focus to trigger.                      |

### 6.3 — Dropdown: search and arrow navigation state mismatch

|                          |                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **What's wrong**   | `cursor` state updates without corresponding DOM focus or `aria-activedescendant`. |
| **Why it matters** | Active option is not aligned with focus for screen readers.                            |
| **What to do**     | Implement consistent APG model: either roving focus or `aria-activedescendant`.      |

### 6.4 — Dropdown: excessive tab stops in option list

|                          |                                                              |
| ------------------------ | ------------------------------------------------------------ |
| **What's wrong**   | Each option has `tabIndex={0}`, creating a long tab chain. |
| **Why it matters** | Keyboard navigation becomes inefficient with many options.   |
| **What to do**     | Use roving tabindex or `aria-activedescendant` pattern.    |

### 6.5 — Dropdown: unstable checkbox IDs

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| **What's wrong**   | Checkbox IDs generated from `Date.getTime()` on render. |
| **Why it matters** | Unstable or colliding IDs break label associations.       |
| **What to do**     | Use `useId` or stable per-instance ID generation.       |

### 7.1 — EditableDropdown: nested interactive elements

|                          |                                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| **What's wrong**   | `Editable` with `role="button"` wraps `DropdownButton` `<button>`. |
| **Why it matters** | Nested interactives create duplicate tab stops and confusing navigation.   |
| **What to do**     | Use single focus target; remove `role="button"` from wrapper.            |

### 7.2 — EditableDropdown: trigger lacks expanded state

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| **What's wrong**   | Stock trigger does not expose `aria-expanded` (inherits from Dropdown issue). |
| **Why it matters** | Open state is not communicated to assistive technology.                         |
| **What to do**     | Fix underlying Dropdown trigger wiring.                                         |

### 7.3 — EditableDropdown: broken label associations

|                          |                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **What's wrong**   | Single-select rows have `<label htmlFor>` without matching ID on focusable `role="option"`. |
| **Why it matters** | Label association is broken or ineffective.                                                     |
| **What to do**     | Remove misuse; follow APG listbox naming patterns.                                              |

### 7.4 — EditableDropdown: inconsistent selection model

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| **What's wrong**   | Selection state may not be consistently exposed across edit and dropdown modes. |
| **Why it matters** | Users cannot reliably understand current selections.                            |
| **What to do**     | Ensure selection state is maintained and announced in both modes.               |

### 8.1 — Listbox: option state not exposed to AT

|                          |                                                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **What's wrong**   | `type="option"` with `selected`/`disabled` props, but focused `ListBody` lacks `aria-selected`/`aria-disabled`. |
| **Why it matters** | State is only visible visually, not programmatically.                                                                       |
| **What to do**     | Map state attributes to focused or option node per APG patterns.                                                            |

### 8.2 — Listbox: nested expansion lacks ARIA

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | `nestedBody` with `expanded` toggling has no `aria-expanded` or `aria-controls`. |
| **Why it matters** | Expand state is not programmatically exposed.                                            |
| **What to do**     | Add `aria-expanded` and region ID linkage on the expanding control.                    |

### 8.3 — Listbox: nested interactive elements in links

|                          |                                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **What's wrong**   | `tagName="a"` with inner focusable `div` creates nested interactives. |
| **Why it matters** | Ambiguous keyboard model and navigation conflicts.                        |
| **What to do**     | Use single focusable target; avoid `<a>` wrapping separate widgets.     |

### 8.4 — Listbox: inconsistent role hierarchy

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **What's wrong**   | Role structure may not follow APG listbox patterns consistently.                     |
| **Why it matters** | Screen readers cannot navigate the list structure reliably.                          |
| **What to do**     | Ensure proper `listbox` > `option` hierarchy with no invalid intermediate roles. |

### 8.5 — Listbox: keyboard navigation gaps

|                          |                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------- |
| **What's wrong**   | Arrow key navigation may not work consistently across all listbox variants.      |
| **Why it matters** | Standard listbox keyboard interaction is expected by users.                      |
| **What to do**     | Implement complete APG listbox keyboard support (arrows, Home, End, type-ahead). |

### 9.1 — Select: improper role nesting

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What's wrong**   | `role="listbox"` wraps `ul` (list) then `option` children.  |
| **Why it matters** | `option` elements are not directly under `listbox`/`group`. |
| **What to do**     | Flatten container roles; ensure direct option children.           |

### 9.2 — Select: duplicate popup state attributes

|                          |                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **What's wrong**   | Outer Select `div` and trigger `button` both set `aria-haspopup`/`aria-expanded`. |
| **Why it matters** | Duplicate state on non-focused wrapper creates confusion.                                 |
| **What to do**     | Keep popup state only on the focused trigger element.                                     |

### 9.3 — Select: custom trigger lacks ARIA wiring

|                          |                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **What's wrong**   | Custom `trigger` prop only merges `ref`, missing `aria-controls`/expanded/haspopup. |
| **Why it matters** | Custom triggers lose essential listbox relationship wiring.                               |
| **What to do**     | Merge listbox wiring or document mandatory consumer props.                                |

### 9.4 — Select: broken ID references in empty state

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | `SelectEmptyTemplate` uses `id={title}`, `aria-labelledby={title}` (text, not ID). |
| **Why it matters** | Broken ID references; duplicate ID risk.                                                 |
| **What to do**     | Generate stable IDs; correct `aria-labelledby`/`aria-describedby`.                   |

### 10.1 — Combobox: incorrect role on focused element

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Focused list node has `tablist` role inside option.    |
| **Why it matters** | Wrong role; invalid nesting per ARIA spec.               |
| **What to do**     | Align focus and role with APG listbox/combobox patterns. |

### 10.2 — Combobox: selection state not exposed

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **What's wrong**   | No `aria-selected` on options; selection is CSS-only.                              |
| **Why it matters** | Selection state is not available to assistive technology.                            |
| **What to do**     | Set `aria-selected` on accessible option node; use multiselect patterns as needed. |

### 10.3 — Combobox: chip input selection mismatch

|                          |                                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **What's wrong**   | Selection logic ignores `chipInputValue` in multiselect mode.    |
| **Why it matters** | Selected state is wrong for chip-based selections.                 |
| **What to do**     | Derive selection from `chipInputValue` when in multiselect mode. |

### 10.4 — Combobox: focus and state synchronization issues

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What's wrong**   | `focusedOption` vs DOM focus diverge; `Enter` uses stale context. |
| **Why it matters** | Keyboard actions may operate on wrong option.                         |
| **What to do**     | Use single handler model or sync on focus/use `activeElement`.      |

### 11.1 — Menu: conflicting keyboard handlers

|                          |                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------- |
| **What's wrong**   | ArrowDown on item triggers both listbox `onKeyDown` and menu `handleKeyDown`. |
| **Why it matters** | Unpredictable double navigation behavior.                                         |
| **What to do**     | Disable listbox handler for menu rows or establish single handler ownership.      |

### 11.2 — Menu: broken popup relationship

|                          |                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------- |
| **What's wrong**   | `aria-controls` references `menuID` but Popover surface has no matching `id`. |
| **Why it matters** | Relationship is broken for assistive technology.                                    |
| **What to do**     | Set `id={menuID}` on visible menu panel.                                          |

### 11.3 — Menu: incorrect expanded state logic

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | `aria-expanded` derived from ref presence, not actual open state. |
| **Why it matters** | Often reports wrong expanded state.                                 |
| **What to do**     | Bind to Popover `open` state instead.                             |

### 11.4 — Menu: submenu focus management

|                          |                                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| **What's wrong**   | Escape on submenu trigger returns to root menu button instead of parent menu. |
| **Why it matters** | Skips parent menu context in navigation hierarchy.                            |
| **What to do**     | Focus parent trigger/parent `menuitem` on submenu escape.                   |

### 11.5 — Menu: unnamed menu surfaces

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Menu surfaces may lack `aria-label` or `aria-labelledby`.       |
| **Why it matters** | Unnamed menu in screen reader rotor/navigation.                     |
| **What to do**     | Document requirement; optional dev warning or default from trigger. |

### 12.1 — Radio: help text not associated

|                          |                                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **What's wrong**   | `helpText` is not included in `aria-describedby`.              |
| **Why it matters** | Important help information is not announced with the radio button. |
| **What to do**     | Mirror Checkbox pattern for `aria-describedby` association.      |

### 12.2 — Radio: error state not exposed

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What's wrong**   | `error` prop does not set `aria-invalid`.               |
| **Why it matters** | Invalid state is not communicated to assistive technology.  |
| **What to do**     | Set `aria-invalid="true"` when `error` prop is present. |

### 13.1 — ChoiceList: inconsistent radio grouping

|                          |                                                                             |
| ------------------------ | --------------------------------------------------------------------------- |
| **What's wrong**   | Radio choices may have different `name` attributes within the same group. |
| **Why it matters** | Breaks native radio button grouping behavior.                               |
| **What to do**     | Ensure single `name` on `ChoiceList` or add development warning.        |

### 14.1 — Pagination: unnamed jump input

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | Jump `MetricInput` lacks accessible name; suffix text not associated. |
| **Why it matters** | Users cannot identify the purpose of the input field.                   |
| **What to do**     | Add `aria-label` or `aria-labelledby` to the jump input.            |

### 15.1 — Breadcrumbs: non-semantic root element

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What's wrong**   | Root element is `<div>` instead of `<nav>`.             |
| **Why it matters** | Navigation landmark is not exposed to assistive technology. |
| **What to do**     | Use `<nav aria-label="Breadcrumb">` (with i18n support).  |

### 15.2 — Breadcrumbs: limited HTML props support

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Only `BaseProps` supported; cannot set root `aria-*` or `id`. |
| **Why it matters** | Cannot customize accessibility attributes for the navigation.       |
| **What to do**     | Extend to support full HTML props on root element.                  |

### 15.3 — Breadcrumbs: separator accessibility

|                          |                                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **What's wrong**   | Visual separators may not be properly hidden from screen readers.         |
| **Why it matters** | Decorative separators create noise in screen reader output.               |
| **What to do**     | Ensure separators have `aria-hidden="true"` or use CSS-only separators. |

### 16.1 — HorizontalNav: link semantics vs button behavior

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What's wrong**   | Navigation items may use `role="button"` when they should be links. |
| **Why it matters** | Confuses navigation vs action semantics for users.                    |
| **What to do**     | Use `<a href>` for navigation; `<button>` only for actions.       |

### 16.2 — HorizontalNav: missing current page indicator

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Active/current page may not be marked with `aria-current="page"`. |
| **Why it matters** | Users cannot identify their current location in navigation.         |
| **What to do**     | Set `aria-current="page"` on the current page link.               |

### 16.3 — HorizontalNav: keyboard navigation gaps

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | Arrow key navigation may not work consistently across nav items. |
| **Why it matters** | Expected navigation keyboard patterns are missing.               |
| **What to do**     | Implement arrow key navigation or document tab-only interaction. |

### 16.4 — HorizontalNav: overflow handling accessibility

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | Overflow menus or collapsed items may not be properly announced. |
| **Why it matters** | Hidden navigation options are not discoverable.                  |
| **What to do**     | Ensure overflow indicators are named and keyboard accessible.    |

### 17.1 — VerticalNav: conflicting semantics

|                          |                                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| **What's wrong**   | Uses `role="treeitem"` on `<a>` with universal `preventDefault`. |
| **Why it matters** | Link semantics lost; native link behaviors broken.                     |
| **What to do**     | Choose either tree pattern OR native nav links; avoid mixing both.     |

### 18.1 — Navigation: missing link rendering

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Vertical mode ignores `menu.link` property; no `href` rendered. |
| **Why it matters** | Navigation items don't behave as proper links.                      |
| **What to do**     | Render `Link`/`<a>` when `link` property is set.              |

### 18.2 — Navigation: submenu disclosure missing ARIA

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| **What's wrong**   | Submenu parents lack `aria-expanded`/`aria-controls`. |
| **Why it matters** | Submenu state and relationship not exposed.               |
| **What to do**     | Add disclosure wiring with submenu `id` references.     |

### 19.1 — Tabs: Space key not handled

|                          |                                                              |
| ------------------------ | ------------------------------------------------------------ |
| **What's wrong**   | Space does not activate tab (Enter only).                    |
| **Why it matters** | Missing standard button activation pattern.                  |
| **What to do**     | Handle Space key with `preventDefault` for tab activation. |

### 20.1 — Modal: unnamed back button

|                          |                                                         |
| ------------------------ | ------------------------------------------------------- |
| **What's wrong**   | `headerOptions.backButton` lacks accessible name.     |
| **Why it matters** | Back control purpose is unclear to screen reader users. |
| **What to do**     | Fix in shared `OverlayHeader` component.              |

### 20.2 — Modal: dialog naming requirements

|                          |                                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| **What's wrong**   | Custom header or empty heading without `aria-labelledby`.                |
| **Why it matters** | Dialog may be unnamed for assistive technology.                            |
| **What to do**     | Require name, add dev validation, or auto-wire `ModalHeader` heading ID. |

### 21.1 — Dialog: fallback naming missing

|                          |                                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| **What's wrong**   | Custom Modal usage with falsy `heading` lacks `aria-labelledby`. |
| **Why it matters** | Dialog is unnamed for assistive technology.                          |
| **What to do**     | Add type/runtime guard or `aria-label` fallback.                   |

### 21.2 — Dialog: focus management gaps

|                          |                                                       |
| ------------------------ | ----------------------------------------------------- |
| **What's wrong**   | Focus may not be properly managed on open/close.      |
| **Why it matters** | Keyboard users lose track of focus position.          |
| **What to do**     | Implement proper focus trap and restoration patterns. |

### 21.3 — Dialog: keyboard interaction inconsistencies

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What's wrong**   | Escape key handling may not be consistent across dialog variants. |
| **Why it matters** | Standard dialog keyboard patterns expected by users.              |
| **What to do**     | Ensure consistent Escape key behavior for dialog dismissal.       |

### 22.1 — Sidesheet: animation state synchronization

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | Close animation handler not properly invoked.                    |
| **Why it matters** | `state.open`/`aria-modal`/visibility can desync.             |
| **What to do**     | Fix `handleAnimationEnd` invocation (bound method or wrapper). |

### 22.2 — Sidesheet: header naming requirements

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Custom header without heading lacks `aria-labelledby`. |
| **Why it matters** | Sidesheet dialog may be unnamed.                         |
| **What to do**     | Document naming requirement; optional dev warning.       |

### 23.1 — FullscreenModal: focus trap missing

|                          |                                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **What's wrong**   | Tab with open modal allows focus to escape despite `aria-modal="true"`. |
| **Why it matters** | Conflicts with modal semantics compared to Modal/Sidesheet.               |
| **What to do**     | Reuse Modal focus trap implementation.                                    |

### 24.1 — DatePicker: focus not moved into the overlay

|                          |                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **What's wrong**   | Focus is not moved into the picker surface when it opens; there is no documented trap or return pattern.   |
| **Why it matters** | Keyboard and screen-reader users may not land in the interactive calendar layer in a predictable way.      |
| **What to do**     | Define and implement a focus model (move focus in, restore on close) aligned with the date picker pattern. |

### 24.2 — DatePicker: popover lacks modal dialog semantics

|                          |                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **What's wrong**   | The floating surface is not exposed with dialog semantics such as `role="dialog"` and `aria-modal` where applicable. |
| **Why it matters** | Assistive technology may not treat the picker as a distinct modal context.                                               |
| **What to do**     | Apply appropriate dialog role and modal flag per APG when the picker behaves as a modal.                                 |

### 24.3 — DatePicker: validation not wired for live feedback

|                          |                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **What's wrong**   | Validation flows through**InputMask** / **InlineMessage** without live-region or invalid-state wiring called out for this flow. |
| **Why it matters** | Errors may not be announced or tied to the field consistently.                                                                              |
| **What to do**     | Wire `aria-invalid` and live error announcements as needed for dynamic validation.                                                        |

### 24.4 — DatePicker: "Today" chip is a `div` acting as a button

|                          |                                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **What's wrong**   | The "Today"**Chip** uses a non-button element with button behavior. |
| **Why it matters** | Native semantics and keyboard support may be missing or inconsistent.     |
| **What to do**     | Use a native `<button>` (or equivalent) with a clear name.              |

### 24.5 — DatePicker: calendar grid lacks proper table semantics

|                          |                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------- |
| **What's wrong**   | The calendar grid may not use proper `table`/`grid` roles and relationships. |
| **Why it matters** | Screen readers cannot navigate the calendar structure effectively.               |
| **What to do**     | Implement proper ARIA grid or table semantics for the calendar.                  |

### 25.1 — DateRangePicker: dual input labeling

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Root `aria-label` not merged into start/end input `aria-label`. |
| **Why it matters** | Individual inputs may lack proper context.                          |
| **What to do**     | Merge labels or document labeling strategy.                         |

### 25.2 — DateRangePicker: visible label without htmlFor

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What's wrong**   | Visible**Label** without `htmlFor`/IDs by default. |
| **Why it matters** | Label association is broken.                               |
| **What to do**     | Generate IDs and wire `htmlFor` relationships.           |

### 25.3 — DateRangePicker: range selection announcement

|                          |                                                                 |
| ------------------------ | --------------------------------------------------------------- |
| **What's wrong**   | Range selection changes may not be announced to screen readers. |
| **Why it matters** | Users cannot track range selection progress.                    |
| **What to do**     | Add live region announcements for range selection updates.      |

### 26.1 — Calendar: cell state not exposed

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | No `aria-selected`/`aria-current`/`aria-disabled` on cells; disabled via CSS only. |
| **Why it matters** | Cell state is not available to assistive technology.                                     |
| **What to do**     | Map visual state to ARIA attributes.                                                     |

### 26.2 — Calendar: keyboard navigation incomplete

|                          |                                                                           |
| ------------------------ | ------------------------------------------------------------------------- |
| **What's wrong**   | Arrow key navigation may not work consistently across all calendar views. |
| **Why it matters** | Standard calendar keyboard interaction expected by users.                 |
| **What to do**     | Implement complete APG calendar keyboard support.                         |

### 26.3 — Calendar: month/year navigation accessibility

|                          |                                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| **What's wrong**   | Month/year navigation controls may lack proper names or state.             |
| **Why it matters** | Users cannot effectively navigate between time periods.                    |
| **What to do**     | Ensure navigation controls are properly named and announce current period. |

### 27.1 — Table: div-based grid without proper semantics

|                          |                                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| **What's wrong**   | Uses div-based grid without `table`/`grid` roles or header relationships. |
| **Why it matters** | Screen readers cannot navigate table structure or understand relationships.   |
| **What to do**     | Use native `<table>` or implement full ARIA grid with proper roles.         |

### 28.1 — List (KeyValuePair / MetaList): separator icons not hidden

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | **MetaList** separator **Icon** is not `aria-hidden`. |
| **Why it matters** | Decorative separators are announced, creating noise.                |
| **What to do**     | Mark separator icons `aria-hidden="true"`.                        |

### 28.2 — List (KeyValuePair / MetaList): key-value relationships unclear

|                          |                                                                          |
| ------------------------ | ------------------------------------------------------------------------ |
| **What's wrong**   | Key-value pairs may not have clear programmatic relationships.           |
| **Why it matters** | Screen readers cannot associate keys with their values.                  |
| **What to do**     | Use proper labeling or description associations between keys and values. |

### 28.3 — List (KeyValuePair / MetaList): list semantics missing

|                          |                                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| **What's wrong**   | May not use proper `list`/`listitem` roles for structured content. |
| **Why it matters** | List navigation and context is not available to AT users.              |
| **What to do**     | Implement proper list semantics where appropriate.                     |

### 28.4 — List (KeyValuePair / MetaList): interactive items lack proper focus

|                          |                                                                             |
| ------------------------ | --------------------------------------------------------------------------- |
| **What's wrong**   | Interactive list items may not be properly focusable or have clear actions. |
| **Why it matters** | Keyboard users cannot access interactive functionality.                     |
| **What to do**     | Ensure interactive items are focusable with clear action semantics.         |

### 29.1 — Layout (Flex / MdsGrid): grid semantics missing

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| **What's wrong**   | **Grid** uses div scaffold without table/grid roles.                      |
| **Why it matters** | Same structural gaps as**Table** for semantics and navigation.            |
| **What to do**     | Consolidate with**Table** audit for shared **Grid** implementation. |

### 30.1 — PageHeader: heading level inappropriate

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | Title**Heading** defaults to `h4` for primary page title.   |
| **Why it matters** | Page title should typically be `h1` for proper heading hierarchy. |
| **What to do**     | Default to `h1` or provide `titleAs` API for customization.     |

### 30.2 — PageHeader: action buttons may lack context

|                          |                                                                             |
| ------------------------ | --------------------------------------------------------------------------- |
| **What's wrong**   | Action buttons in header may not have sufficient context in their names.    |
| **Why it matters** | Button purpose may be unclear when announced in isolation.                  |
| **What to do**     | Ensure button names include sufficient context or use `aria-describedby`. |

### 30.3 — PageHeader: breadcrumb integration

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What's wrong**   | Breadcrumb integration may not follow proper navigation patterns. |
| **Why it matters** | Navigation context may be unclear or inaccessible.                |
| **What to do**     | Ensure breadcrumbs follow proper navigation landmark patterns.    |

### 30.4 — PageHeader: responsive behavior accessibility

|                          |                                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **What's wrong**   | Responsive layout changes may not maintain accessibility features. |
| **Why it matters** | Mobile users may lose access to important functionality.           |
| **What to do**     | Ensure all functionality remains accessible across breakpoints.    |

### 31.1 — Chip / ChipGroup: div with button role

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | Uses `div` + `role="button"` instead of native `<button>`. |
| **Why it matters** | Missing native button behaviors and keyboard support.            |
| **What to do**     | Use native `<button>` elements.                                |

### 31.2 — Chip / ChipGroup: disabled state not exposed

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | `disabled` prop without `aria-disabled`.             |
| **Why it matters** | Disabled state not communicated to assistive technology. |
| **What to do**     | Set `aria-disabled` with interaction guards.           |

### 31.3 — Chip / ChipGroup: group labeling missing

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | ChipGroup does not forward per-chip `aria-label`/`aria-labelledby`. |
| **Why it matters** | Individual chips may lack proper context within the group.              |
| **What to do**     | Forward ARIA attributes from list items.                                |

### 32.1 — ChipInput: duplicate labeling

|                          |                                                        |
| ------------------------ | ------------------------------------------------------ |
| **What's wrong**   | Duplicate `aria-labelledby` on wrapper and input.    |
| **Why it matters** | Confusing or redundant labeling for screen readers.    |
| **What to do**     | Name primary `<input>` only; use non-button wrapper. |

### 32.2 — ChipInput: nested interactive pattern

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | Outer `role="button"` contains chips, input, and clear button. |
| **Why it matters** | Nested interactive widgets create navigation confusion.          |
| **What to do**     | Remove nested interactive widget pattern.                        |

### 32.3 — ChipInput: error state not exposed

|                          |                                                              |
| ------------------------ | ------------------------------------------------------------ |
| **What's wrong**   | `error` prop without `aria-invalid` on input.            |
| **Why it matters** | Error state not communicated to assistive technology.        |
| **What to do**     | Map `error` prop to `aria-invalid` on the input element. |

### 33.1 — Card: limited ARIA support on subcomponents

|                          |                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **What's wrong**   | **CardHeader**, **CardBody**, **CardFooter** only get `extractBaseProps`. |
| **Why it matters** | Cannot label regions or wire descriptions for card subsections.                               |
| **What to do**     | Add `BaseHtmlProps` support on subcomponent roots.                                          |

### 33.2 — Card: action card semantics confusion

|                          |                                                                             |
| ------------------------ | --------------------------------------------------------------------------- |
| **What's wrong**   | **ActionCard** uses `role="link"` with `onClick` but no `href`. |
| **Why it matters** | Behaves like button but uses link semantics.                                |
| **What to do**     | Use real `<a href>` for navigation; `role="button"` for actions.        |

### 34.1 — Collapsible: trigger missing expanded state

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| **What's wrong**   | Footer trigger missing `aria-expanded`.                 |
| **Why it matters** | Expansion state not communicated to assistive technology. |
| **What to do**     | Set `aria-expanded={expanded}` on trigger.              |

### 34.2 — Collapsible: trigger lacks accessible name

|                          |                                                         |
| ------------------------ | ------------------------------------------------------- |
| **What's wrong**   | Trigger name is**Icon** glyph only.               |
| **Why it matters** | Button purpose is unclear to screen reader users.       |
| **What to do**     | Add default `aria-label` and `aria-hidden` on icon. |

### 35.1 — InputMask: paste prevention too aggressive

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What's wrong**   | `onPaste` always calls `preventDefault` first.          |
| **Why it matters** | Prevents paste even when it could be handled appropriately. |
| **What to do**     | Only prevent default when actually handling paste.          |

### 35.2 — InputMask: help text not associated

|                          |                                                                |
| ------------------------ | -------------------------------------------------------------- |
| **What's wrong**   | `caption`/`helpText` siblings not in `aria-describedby`. |
| **Why it matters** | Help information not announced with the field.                 |
| **What to do**     | Generate IDs and merge `aria-describedby`.                   |

### 35.3 — InputMask: inherits Input accessibility gaps

|                          |                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **What's wrong**   | Inherits**Input** gaps for `aria-invalid`, clear control naming, and info affordance. |
| **Why it matters** | Masked fields remain broken until**Input** is fixed.                                    |
| **What to do**     | Fix**Input** component; optionally share `aria-describedby` for mask hints.           |

### 36.1 — VerificationCodeInput: duplicate IDs

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | One shared `id` applied to every OTP cell.                     |
| **Why it matters** | Duplicate IDs break uniqueness and label associations.           |
| **What to do**     | Use per-cell IDs or `baseId` pattern; document group labeling. |

### 36.2 — VerificationCodeInput: error state inheritance

|                          |                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------- |
| **What's wrong**   | With `error` set, `aria-invalid` not applied (inherits **Input** behavior). |
| **Why it matters** | Invalid state not exposed to assistive technology.                                    |
| **What to do**     | Fix**Input** and merge shared `aria-describedby` for code group.              |

### 36.3 — VerificationCodeInput: group labeling missing

|                          |                                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| **What's wrong**   | Individual cells may lack group context in their accessible names.   |
| **Why it matters** | Users may not understand the purpose of each input cell.             |
| **What to do**     | Provide group labeling strategy for the verification code input set. |

### 37.1 — EditableInput: nested interactive elements

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Text input inside**Editable** `role="button"`.   |
| **Why it matters** | Nested interactive elements create navigation confusion. |
| **What to do**     | Separate edit trigger from input subtree.                |

### 37.2 — EditableInput: unnamed trigger fallback

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What's wrong**   | Empty value + empty placeholder results in unnamed trigger. |
| **Why it matters** | Trigger purpose is unclear to screen reader users.          |
| **What to do**     | Require placeholder or `aria-label` for empty states.     |

### 37.3 — EditableInput: error handling gaps

|                          |                                                                            |
| ------------------------ | -------------------------------------------------------------------------- |
| **What's wrong**   | Error only in hover `Popover`; no `aria-describedby`/`aria-invalid`. |
| **Why it matters** | Error information not accessible to keyboard users.                        |
| **What to do**     | Use inline errors with ARIA wiring.                                        |

### 38.1 — EditableChipInput: complex nested interactives

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **What's wrong**   | **Editable** wraps chip buttons and **ChipInput** (nested interactives). |
| **Why it matters** | Complex nested interactive pattern is confusing to navigate.                         |
| **What to do**     | Restructure component composition to avoid nesting.                                  |

### 38.2 — EditableChipInput: edit mode transition

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | Transition between display and edit modes may not be clear to AT users. |
| **Why it matters** | Mode changes are not announced or predictable.                          |
| **What to do**     | Announce mode transitions and maintain focus appropriately.             |

### 38.3 — EditableChipInput: chip management accessibility

|                          |                                                               |
| ------------------------ | ------------------------------------------------------------- |
| **What's wrong**   | Adding/removing chips may not be announced to screen readers. |
| **Why it matters** | Dynamic content changes are not communicated.                 |
| **What to do**     | Use live regions to announce chip additions/removals.         |

### 39.1 — FileUploader: nested button pattern

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Row `role="button"` wraps inner `<button>`s.         |
| **Why it matters** | Nested interactive pattern creates navigation confusion. |
| **What to do**     | Remove nested pattern; use list with separate buttons.   |

### 39.2 — FileUploader: file input not associated

|                          |                                                               |
| ------------------------ | ------------------------------------------------------------- |
| **What's wrong**   | File input not associated with title/format copy.             |
| **Why it matters** | Input purpose and requirements not clear to AT users.         |
| **What to do**     | Use `aria-labelledby`/`aria-describedby` with stable IDs. |

### 39.3 — FileUploader: dynamic status not announced

|                          |                                                                          |
| ------------------------ | ------------------------------------------------------------------------ |
| **What's wrong**   | Dynamic error/progress without progressbar/live semantics.               |
| **Why it matters** | Upload status changes not communicated to screen readers.                |
| **What to do**     | Use `role="alert"`/`aria-live`; ProgressRing `role="progressbar"`. |

### 40.1 — Dropzone: hidden input unnamed

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What's wrong**   | Hidden file input unnamed/not tied to instructions.        |
| **Why it matters** | Input purpose not clear when accessed programmatically.    |
| **What to do**     | Add `aria-label` or `aria-labelledby`/`describedby`. |

### 40.2 — Dropzone: drag state not announced

|                          |                                                                 |
| ------------------------ | --------------------------------------------------------------- |
| **What's wrong**   | Drag over state changes may not be announced to screen readers. |
| **Why it matters** | Visual feedback not available to AT users.                      |
| **What to do**     | Use live regions to announce drag state changes.                |

### 40.3 — Dropzone: keyboard alternative missing

|                          |                                                                 |
| ------------------------ | --------------------------------------------------------------- |
| **What's wrong**   | Drag and drop interaction may not have keyboard alternative.    |
| **Why it matters** | Functionality not available to keyboard-only users.             |
| **What to do**     | Ensure file selection is available via keyboard (button/input). |

### 41.1 — MultiSlider / Slider / RangeSlider: label not associated

|                          |                                                        |
| ------------------------ | ------------------------------------------------------ |
| **What's wrong**   | Visible `Label` not associated with thumb(s).        |
| **Why it matters** | Slider purpose not clear to screen reader users.       |
| **What to do**     | Use IDs and `aria-labelledby` for label association. |

### 41.2 — MultiSlider / Slider / RangeSlider: thumbs not distinguishable

|                          |                                                              |
| ------------------------ | ------------------------------------------------------------ |
| **What's wrong**   | Two thumbs not distinguishable by name in range sliders.     |
| **Why it matters** | Users cannot tell which thumb they're interacting with.      |
| **What to do**     | Use "Start"/"End" labels or provide consumer API for naming. |

### 41.3 — MultiSlider / Slider / RangeSlider: track button semantics unclear

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | Track/ticks have `role="button"` and keyboard handlers but `tabIndex` commented out. |
| **Why it matters** | Button semantics without focusability is confusing.                                      |
| **What to do**     | Make focusable and named, or remove button role.                                         |

### 41.4 — MultiSlider / Slider / RangeSlider: value changes not announced

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Slider value changes may not be announced as user drags. |
| **Why it matters** | Current value not communicated during interaction.       |
| **What to do**     | Ensure value announcements during slider interaction.    |

### 42.1 — Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter): missing naming API

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What's wrong**   | No `aria-label`/`aria-labelledby` API.                          |
| **Why it matters** | Progress indicators lack context about what is loading/progressing. |
| **What to do**     | Add naming props; name indeterminate spinners appropriately.        |

### 43.1 — Tooltip: missing tooltip role

|                          |                                             |
| ------------------------ | ------------------------------------------- |
| **What's wrong**   | Portaled content has no `role="tooltip"`. |
| **Why it matters** | AT cannot classify surface as tooltip.      |
| **What to do**     | Add `role="tooltip"` on tooltip root.     |

### 43.2 — Tooltip: missing describedby relationship

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What's wrong**   | No tooltip `id`; trigger lacks `aria-describedby` when open. |
| **Why it matters** | Supplementary text not programmatically tied to control.         |
| **What to do**     | Use `useId`; manage `aria-describedby` with open state.      |

### 44.1 — Typography (Text, Heading, Subheading, Paragraph, Caption): Caption lacks HTML props

|                          |                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **What's wrong**   | **Caption** has no `BaseHtmlProps`, so callers cannot set `id` for `aria-describedby`. |
| **Why it matters** | Helper/error text cannot be wired to caption element by ID.                                        |
| **What to do**     | Extend props and forward `id`/ARIA to root.                                                      |

### 44.2 — Typography (Text, Heading, Subheading, Paragraph, Caption): Caption stringifies children

|                          |                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------- |
| **What's wrong**   | **Caption** stringifies children, so rich **ReactNode** children break. |
| **Why it matters** | Content can degrade to `[object Object]` and lose semantics.                      |
| **What to do**     | Render `children` normally instead of coercing to string.                         |

### 44.3 — Typography (Text, Heading, Subheading, Paragraph, Caption): heading level management

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What's wrong**   | Heading components may not provide clear guidance on level selection. |
| **Why it matters** | Improper heading hierarchy breaks document structure for AT users.    |
| **What to do**     | Document heading level best practices and provide level validation.   |

### 45.1 — Message / InlineMessage / Toast: button type missing in forms

|                          |                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **What's wrong**   | Toast**ActionButton** renders `<button>` without `type` inside `<form>`. |
| **Why it matters** | Browser treats as submit button, may post form unintentionally.                      |
| **What to do**     | Use `type="button"` on non-submit actions.                                         |

### 45.2 — Message / InlineMessage / Toast: alert role missing

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | Error messages may not use `role="alert"` for immediate announcement. |
| **Why it matters** | Critical messages not immediately announced to screen readers.          |
| **What to do**     | Use `role="alert"` for error messages and important notifications.    |

### 45.3 — Message / InlineMessage / Toast: toast positioning affects AT

|                          |                                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| **What's wrong**   | Toast positioning may interfere with screen reader navigation.       |
| **Why it matters** | Toasts may interrupt or confuse AT navigation patterns.              |
| **What to do**     | Ensure toast positioning doesn't interfere with AT focus management. |

### 45.4 — Message / InlineMessage / Toast: dismissal not keyboard accessible

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | Toast dismissal may not be available via keyboard.                      |
| **Why it matters** | Keyboard users cannot dismiss persistent toasts.                        |
| **What to do**     | Ensure dismiss buttons are keyboard accessible or provide auto-dismiss. |

### 45.5 — Message / InlineMessage / Toast: message priority not indicated

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What's wrong**   | Different message types may not indicate their priority level.        |
| **Why it matters** | Users cannot distinguish between informational and critical messages. |
| **What to do**     | Use appropriate ARIA attributes to indicate message priority/type.    |

### 46.1 — StatusHint bundle (StatusHint, EmptyState, Placeholder): button without name

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| **What's wrong**   | `onClick` + non-text children results in `div` `role="button"` that may lack name. |
| **Why it matters** | Button purpose unclear without accessible name.                                          |
| **What to do**     | Use `<button>` or require `aria-label`.                                              |

### 46.2 — StatusHint bundle (StatusHint, EmptyState, Placeholder): image without alt

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What's wrong**   | **Image** without required `alt` when `src` set. |
| **Why it matters** | Images not accessible to screen reader users.              |
| **What to do**     | Require `alt` or establish decorative contract.          |

### 47.1 — Link: onClick without href

|                          |                                                    |
| ------------------------ | -------------------------------------------------- |
| **What's wrong**   | `<Link onClick={…}>` without `href`.          |
| **Why it matters** | Wrong or ambiguous control semantics vs button.    |
| **What to do**     | Require `href` or render `button` for actions. |

### 47.2 — Link: external link indication missing

|                          |                                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| **What's wrong**   | External links may not indicate they open in new window/tab.                  |
| **Why it matters** | Unexpected navigation behavior not communicated to users.                     |
| **What to do**     | Add appropriate indication for external links (text or `aria-describedby`). |

### 47.3 — Link: visited state accessibility

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What's wrong**   | Visited link state may rely only on color for indication.             |
| **Why it matters** | Users with color vision differences cannot distinguish visited links. |
| **What to do**     | Ensure visited state has non-color indicators where important.        |

### 47.4 — Link: link context insufficient

|                          |                                                                          |
| ------------------------ | ------------------------------------------------------------------------ |
| **What's wrong**   | Link text may not be descriptive enough when read out of context.        |
| **Why it matters** | Screen reader users navigating by links cannot understand destinations.  |
| **What to do**     | Ensure link text is descriptive or use `aria-describedby` for context. |

### 47.5 — Link: keyboard activation inconsistent

|                          |                                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **What's wrong**   | Custom link behavior may not respond to Enter key consistently.    |
| **Why it matters** | Standard link activation pattern expected by keyboard users.       |
| **What to do**     | Ensure Enter key activates links consistently across all variants. |

### 48.1 — LinkButton: icon-only without name

|                          |                                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| **What's wrong**   | `icon` with empty/whitespace `children` and no `aria-label`. |
| **Why it matters** | Button purpose unclear to screen reader users.                     |
| **What to do**     | Enforce name requirement for icon-only buttons via types/docs.     |

### 48.2 — LinkButton: button vs link semantics

|                          |                                                               |
| ------------------------ | ------------------------------------------------------------- |
| **What's wrong**   | May use button styling but link semantics, causing confusion. |
| **Why it matters** | Users expect different behaviors from buttons vs links.       |
| **What to do**     | Clarify when to use LinkButton vs Button vs Link components.  |

### 48.3 — LinkButton: disabled state handling

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **What's wrong**   | Disabled LinkButtons may not handle state consistently with regular buttons. |
| **Why it matters** | Inconsistent disabled behavior across similar components.                    |
| **What to do**     | Align disabled state handling with Button component patterns.                |

### 49.1 — Badge / Pills: semantic meaning unclear

|                          |                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------- |
| **What's wrong**   | Badge/Pills may not convey their semantic meaning to screen readers.                    |
| **Why it matters** | Status or count information not accessible to AT users.                                 |
| **What to do**     | Use appropriate roles (`status`, `img` with `alt`) or `aria-label` for meaning. |

### 49.2 — Badge / Pills: interactive badges lack proper semantics

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What's wrong**   | Interactive badges may not use proper button semantics.           |
| **Why it matters** | Clickable badges don't behave like expected interactive elements. |
| **What to do**     | Use button semantics for interactive badges with proper naming.   |

### 50.1 — Avatar / AvatarGroup: non-interactive avatars focusable

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What's wrong**   | Static avatars use `tabIndex={0}` with `role="img"` without action. |
| **Why it matters** | Keyboard users encounter unnecessary tab stops.                         |
| **What to do**     | Make non-interactive avatars unfocusable; focus only when actionable.   |

### 51.1 — Chat: input lacks label association

|                          |                                               |
| ------------------------ | --------------------------------------------- |
| **What's wrong**   | **ChatInput** has no label association. |
| **Why it matters** | Input purpose unclear to screen reader users. |
| **What to do**     | Add label API or require `aria-label`.      |

### 52.1 — Checkbox: whitespace-only label

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **What's wrong**   | Whitespace-only `label` or no label/`aria-*` results in unnamed control. |
| **Why it matters** | Checkbox purpose unclear to users.                                           |
| **What to do**     | Trim whitespace; require accessible name.                                    |

### 53.1 — Textarea: readOnly prop not forwarded

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What's wrong**   | `readOnly` prop not forwarded to native `readonly` attribute. |
| **Why it matters** | AT cannot tell field is read-only from DOM.                       |
| **What to do**     | Forward `readOnly` to underlying `<textarea>`.                |

### 54.1 — SwitchInput: unlabeled switch

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What's wrong**   | Unlabeled switch without `aria-label`/`Label` pairing. |
| **Why it matters** | Switch purpose unclear to screen reader users.             |
| **What to do**     | Document labeling requirement; add dev warning.            |

### 54.2 — SwitchInput: switch state announcement

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| **What's wrong**   | Switch state changes may not be clearly announced.                              |
| **Why it matters** | Users may not understand current switch position.                               |
| **What to do**     | Ensure switch state is clearly communicated via accessible name or description. |

### 55.1 — Stepper: empty label leaves weak step name

|                          |                                                          |
| ------------------------ | -------------------------------------------------------- |
| **What's wrong**   | Empty `label` leaves weak step name (icon noise).      |
| **Why it matters** | Step purpose unclear when navigating with screen reader. |
| **What to do**     | Require labels or synthesize meaningful names.           |

_Several list and menu surfaces share `ListBody` behavior; fixing list roles and focus in **Listbox** reduces duplicate work in **Select**, **Combobox**, and **Menu**._

_**Table**, **List**, and **Layout** (Grid organism) overlap on grid semantics and row interactions; treat as one remediation track where the audits align._

## Index by component → issue id

| Component                                                  | Issues     |
| ---------------------------------------------------------- | ---------- |
| Avatar / AvatarGroup                                       | 50.1       |
| Badge / Pills                                              | 49.1–49.2 |
| Breadcrumbs                                                | 15.1–15.3 |
| Button                                                     | 2.1–2.4   |
| Calendar                                                   | 26.1–26.3 |
| Card                                                       | 33.1–33.2 |
| Chat                                                       | 51.1       |
| Checkbox                                                   | 52.1       |
| Chip / ChipGroup                                           | 31.1–31.3 |
| ChipInput                                                  | 32.1–32.3 |
| ChoiceList                                                 | 13.1       |
| Collapsible                                                | 34.1–34.2 |
| Combobox                                                   | 10.1–10.4 |
| DatePicker                                                 | 24.1–24.5 |
| DateRangePicker                                            | 25.1–25.3 |
| Dialog                                                     | 21.1–21.3 |
| Dropdown                                                   | 6.1–6.5   |
| Dropzone                                                   | 40.1–40.3 |
| EditableChipInput                                          | 38.1–38.3 |
| EditableDropdown                                           | 7.1–7.4   |
| EditableInput                                              | 37.1–37.3 |
| FileUploader                                               | 39.1–39.3 |
| FullscreenModal                                            | 23.1       |
| HorizontalNav                                              | 16.1–16.4 |
| Icon + useAccessibilityProps                               | 3.1–3.3   |
| Input                                                      | 1.1–1.3   |
| InputMask                                                  | 35.1–35.3 |
| Layout (Flex / MdsGrid)                                    | 29.1       |
| Link                                                       | 47.1–47.5 |
| LinkButton                                                 | 48.1–48.3 |
| List (KeyValuePair / MetaList)                             | 28.1–28.4 |
| Listbox                                                    | 8.1–8.5   |
| Menu                                                       | 11.1–11.5 |
| Message / InlineMessage / Toast                            | 45.1–45.5 |
| Modal                                                      | 20.1–20.2 |
| MultiSlider / Slider / RangeSlider                         | 41.1–41.4 |
| Navigation                                                 | 18.1–18.2 |
| PageHeader                                                 | 30.1–30.4 |
| Pagination                                                 | 14.1       |
| Popover                                                    | 5.1–5.4   |
| Radio                                                      | 12.1–12.2 |
| Select                                                     | 9.1–9.4   |
| Sidesheet                                                  | 22.1–22.2 |
| Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter) | 42.1       |
| StatusHint bundle (StatusHint, EmptyState, Placeholder)    | 46.1–46.2 |
| Stepper                                                    | 55.1       |
| SwitchInput                                                | 54.1–54.2 |
| Table                                                      | 27.1       |
| Tabs                                                       | 19.1       |
| Textarea                                                   | 53.1       |
| Tooltip                                                    | 43.1–43.2 |
| Typography (Text, Heading, Subheading, Paragraph, Caption) | 44.1–44.3 |
| Utils (Divider, Backdrop, OutsideClick, PopperWrapper)     | 4.1–4.2   |
| VerificationCodeInput                                      | 36.1–36.3 |
| VerticalNav                                                | 17.1       |

See aggregated reports under `aria-audits/`.

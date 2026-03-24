# 144 High Severity (P1) accessibility issues

High-severity ARIA and structural issues from the aggregated audits, with a **suggested fix order**.

## Issue count per component

| Fix order | Component | P1 issues |
| -: | --- | --: |
| 1 | Input | 4 |
| 2 | Button | 3 |
| 3 | Icon + useAccessibilityProps | 2 |
| 4 | Utils (Divider, Backdrop, OutsideClick, PopperWrapper) | 3 |
| 5 | Popover | 3 |
| 6 | Dropdown | 5 |
| 7 | EditableDropdown | 3 |
| 8 | Listbox | 3 |
| 9 | Select | 4 |
| 10 | Combobox | 4 |
| 11 | Menu | 5 |
| 12 | ChoiceList | 4 |
| 13 | Radio | 3 |
| 14 | Pagination | 3 |
| 15 | Breadcrumbs | 2 |
| 16 | VerticalNav | 3 |
| 17 | Navigation | 3 |
| 18 | Tabs | 4 |
| 19 | Modal | 2 |
| 20 | Dialog | 1 |
| 21 | Sidesheet | 3 |
| 22 | FullscreenModal | 5 |
| 23 | DatePicker | 3 |
| 24 | DateRangePicker | 3 |
| 25 | Calendar | 1 |
| 26 | Table | 5 |
| 27 | List | 3 |
| 28 | Layout (Flex, Row, Column, MdsGrid, Grid organism) | 1 |
| 29 | Chip / ChipGroup | 4 |
| 30 | ChipInput | 3 |
| 31 | Card | 4 |
| 32 | PageHeader | 1 |
| 33 | Collapsible | 4 |
| 34 | InputMask | 3 |
| 35 | VerificationCodeInput | 2 |
| 36 | EditableInput | 3 |
| 37 | EditableChipInput | 1 |
| 38 | FileUploader | 3 |
| 39 | MultiSlider / Slider / RangeSlider | 3 |
| 40 | Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter) | 2 |
| 41 | Tooltip | 2 |
| 42 | Typography (Text, Heading, Subheading, Paragraph, Caption) | 2 |
| 43 | StatusHint bundle (StatusHint, EmptyState, Placeholder) | 4 |
| 44 | Message / InlineMessage / Toast | 1 |
| 45 | Avatar / AvatarGroup | 4 |
| 46 | Chat | 2 |
| 47 | Checkbox | 1 |
| 48 | Textarea | 1 |
| 49 | SwitchInput | 1 |
| 50 | Link | 1 |
| 51 | LinkButton | 1 |
| 52 | Stepper | 1 |
| 53 | Dropzone | 1 |
| 54 | List — KeyValuePair / MetaList (from list-audit) | 1 |

---

## Suggested fix order

### 1.1 — Input

| | |
| --- | --- |
| **What's wrong** | `info` set; keyboard-only —  uses hover `Popover` |
| **Why it matters** | Help content not available equivalently for keyboard/SR. |
| **What to do** | Click/focus disclosure, inline `HelpText` + `aria-describedby`, or APG-aligned tooltip trigger. |

### 1.2 — Input

| | |
| --- | --- |
| **What's wrong** | Tab to info affordance — focusable `div` around icon, no explicit role/name |
| **Why it matters** | Ambiguous control in AT. |
| **What to do** | `<button type="button">` or `Icon` with `aria-label` from `info`. |

### 1.3 — Input

| | |
| --- | --- |
| **What's wrong** | `<Input error />` without manual `aria-invalid` |
| **Why it matters** | Invalid state not exposed. |
| **What to do** | Set `aria-invalid={true}` when `error`; document `aria-describedby` to error copy. |

### 1.4 — Input

| | |
| --- | --- |
| **What's wrong** | `inlineLabel` only, no `id`/label association |
| **Why it matters** | Name not tied to visible label. |
| **What to do** | `aria-labelledby` or `<label htmlFor>` / generated ids. |

### 2.1 — Button

| | |
| --- | --- |
| **What's wrong** | `selected={true}` without `aria-pressed` |
| **Why it matters** | Toggle state not exposed to AT. |
| **What to do** | Map `selected` to `aria-pressed` when semantically toggle. |

### 2.2 — Button

| | |
| --- | --- |
| **What's wrong** | `<Button loading>Save</Button>` — visible text `visibility:hidden` may drop from accname; spinner names control |
| **Why it matters** | "Loading" without action identity. |
| **What to do** | Preserve label in accname (sr-only / `aria-label` / `aria-hidden` spinner). |

### 2.3 — Button

| | |
| --- | --- |
| **What's wrong** | Icon-only without `tooltip` / `aria-label` / children |
| **Why it matters** | Unnamed button. |
| **What to do** | Dev warn or narrow types; document requirement. |

### 3.1 — Icon + useAccessibilityProps

| | |
| --- | --- |
| **What's wrong** | `onClick` + `aria-labelledby`/`aria-describedby`/`aria-hidden` — not merged in interactive branch |
| **Why it matters** | not merged in interactive branch. |
| **What to do** | Pass through all naming/description attrs with `onClick`. |

### 3.2 — Icon + useAccessibilityProps

| | |
| --- | --- |
| **What's wrong** | — Icon-only `onClick` without `aria-label`.  Require name or lint; fix (1) enables `aria-labelledby` |
| **Why it matters** | Icon-only `onClick` without `aria-label`. |
| **What to do** | Require name or lint; fix (1) enables `aria-labelledby`. |

### 4.1 — Utils (Divider, Backdrop, OutsideClick, PopperWrapper)

| | |
| --- | --- |
| **What's wrong** | () — `removeEventListener` missing capture flag.  Match `addEventListener` capture |
| **Why it matters** | `removeEventListener` missing capture flag. |
| **What to do** | Match `addEventListener` capture. |

### 4.2 — Utils (Divider, Backdrop, OutsideClick, PopperWrapper)

| | |
| --- | --- |
| **What's wrong** | () — Stale `onOutsideClick` in empty deps.  Update deps or ref callback |
| **Why it matters** | Stale `onOutsideClick` in empty deps. |
| **What to do** | Update deps or ref callback. |

### 4.3 — Utils (Divider, Backdrop, OutsideClick, PopperWrapper)

| | |
| --- | --- |
| **What's wrong** | () — Cannot pass `aria-hidden`/`role="none"` for decorative `hr`.  `BaseHtmlProps` on `<hr>` |
| **Why it matters** | Cannot pass `aria-hidden`/`role="none"` for decorative `hr`. |
| **What to do** | `BaseHtmlProps` on `<hr>`. |

### 5.1 — Popover

| | |
| --- | --- |
| **What's wrong** | Click trigger — no `aria-expanded` / `aria-controls` on trigger; no surface `id` |
| **Why it matters** | Disclosure state and relationship missing for AT. |
| **What to do** | Stable id on surface; merge `aria-expanded` / `aria-controls` onto trigger. |

### 5.2 — Popover

| | |
| --- | --- |
| **What's wrong** | Open popover; no Escape listener |
| **Why it matters** | Keyboard users cannot dismiss via standard gesture. |
| **What to do** | Escape closes; optional focus return to trigger. |

### 5.3 — Popover

| | |
| --- | --- |
| **What's wrong** | `appendToBody={true}` with focusables inside — Tab order skips portaled content |
| **Why it matters** | Focus order vs visual stack misaligned. |
| **What to do** | Move focus on open / restore on close, or default in-tree when interactive. |

### 6.1 — Dropdown

| | |
| --- | --- |
| **What's wrong** | Default trigger — no `aria-expanded` / `aria-haspopup` / `aria-controls` |
| **Why it matters** | Popup relationship and state hidden from AT. |
| **What to do** | Wire to stable list/menu `id`. |

### 6.2 — Dropdown

| | |
| --- | --- |
| **What's wrong** | Open list; Escape not handled in `DropdownList` |
| **Why it matters** | No standard dismiss. |
| **What to do** | Escape closes and returns focus to trigger. |

### 6.3 — Dropdown

| | |
| --- | --- |
| **What's wrong** | Search + arrows — `cursor` updates without DOM focus / `aria-activedescendant` |
| **Why it matters** | Active option not aligned with focus for SR. |
| **What to do** | One APG model: roving focus or `aria-activedescendant`. |

### 6.4 — Dropdown

| | |
| --- | --- |
| **What's wrong** | Tab through many options — each `tabIndex={0}` |
| **Why it matters** | Long tab chain. |
| **What to do** | Roving tabindex or `aria-activedescendant`. |

### 6.5 — Dropdown

| | |
| --- | --- |
| **What's wrong** | Checkbox ids from `Date.getTime()` on render |
| **Why it matters** | Unstable / colliding ids break label associations. |
| **What to do** | `useId` or stable per-instance ids. |

### 7.1 — EditableDropdown

| | |
| --- | --- |
| **What's wrong** | `Editable` `role="button"` wraps `DropdownButton` `<button>` |
| **Why it matters** | Nested interactives; duplicate tab stops. |
| **What to do** | Single focus target; remove `role="button"` around full composite. |

### 7.2 — EditableDropdown

| | |
| --- | --- |
| **What's wrong** | Stock trigger — no `aria-expanded` (Dropdown) |
| **Why it matters** | Open state not exposed. |
| **What to do** | Fix Dropdown trigger wiring. |

### 7.3 — EditableDropdown

| | |
| --- | --- |
| **What's wrong** | Single-select rows — outer `<label htmlFor>` without id on focusable `role="option"` control |
| **Why it matters** | Broken / ineffective label association. |
| **What to do** | Remove misuse; use APG listbox naming. |

### 8.1 — Listbox

| | |
| --- | --- |
| **What's wrong** | `type="option"` with `selected` / `disabled`; focused `ListBody` lacks `aria-selected` / `aria-disabled` |
| **Why it matters** | State visible only visually. |
| **What to do** | Map state on focused or `option` node per APG. |

### 8.2 — Listbox

| | |
| --- | --- |
| **What's wrong** | `nestedBody` with `expanded` toggling — no `aria-expanded` / `aria-controls` |
| **Why it matters** | Expand state not programmatic. |
| **What to do** | Add `aria-expanded` and region `id` linkage on the control that expands. |

### 8.3 — Listbox

| | |
| --- | --- |
| **What's wrong** | `tagName="a"` with inner focusable `div` |
| **Why it matters** | Nested interactives inside link; ambiguous keyboard model. |
| **What to do** | Single focusable target; avoid `a` wrapping separate widget. |

### 9.1 — Select

| | |
| --- | --- |
| **What's wrong** | `role="listbox"` wraps `ul` (list) then `option` children |
| **Why it matters** | `option` not directly under `listbox`/`group`. |
| **What to do** | Flatten container roles; direct option children. |

### 9.2 — Select

| | |
| --- | --- |
| **What's wrong** | Outer Select `div` and trigger `button` both set `aria-haspopup` / `aria-expanded` |
| **Why it matters** | Duplicate state on non-focused wrapper. |
| **What to do** | Keep popup state only on the focused trigger. |

### 9.3 — Select

| | |
| --- | --- |
| **What's wrong** | Custom `trigger` — only `ref` merged |
| **Why it matters** | No `aria-controls` / expanded / haspopup wiring. |
| **What to do** | Merge listbox wiring or document mandatory consumer props. |

### 9.4 — Select

| | |
| --- | --- |
| **What's wrong** | `SelectEmptyTemplate` uses `id={title}`, `aria-labelledby={title}` (text, not id) |
| **Why it matters** | Broken ID references; duplicate id risk. |
| **What to do** | Stable generated ids; correct `aria-labelledby` / `aria-describedby`. |

### 10.1 — Combobox

| | |
| --- | --- |
| **What's wrong** | Focused list node is `tablist` inside option |
| **Why it matters** | Wrong role; invalid nesting. |
| **What to do** | Same as Listbox — align focus + role with APG listbox/combobox. |

### 10.2 — Combobox

| | |
| --- | --- |
| **What's wrong** | No `aria-selected` on options; selection CSS-only. |
| **Why it matters** | No `aria-selected` on options; selection CSS-only. |
| **What to do** | Set on accessible option node; multiselect listbox pattern as needed. |

### 10.3 — Combobox

| | |
| --- | --- |
| **What's wrong** | Selection ignores `chipInputValue` |
| **Why it matters** | Selected state wrong for chips. |
| **What to do** | Derive from `chipInputValue` when multiselect. |

### 10.4 — Combobox

| | |
| --- | --- |
| **What's wrong** | `focusedOption` vs DOM focus diverge; `Enter` uses stale context. |
| **Why it matters** | `focusedOption` vs DOM focus diverge; `Enter` uses stale context. |
| **What to do** | Single handler model or sync on focus / use `activeElement`. |

### 11.1 — Menu

| | |
| --- | --- |
| **What's wrong** | ArrowDown on item — listbox `onKeyDown` and menu `handleKeyDown` both run |
| **Why it matters** | Unpredictable double navigation. |
| **What to do** | Disable listbox handler for menu rows or single handler ownership. |

### 11.2 — Menu

| | |
| --- | --- |
| **What's wrong** | `aria-controls` references `menuID` but Popover surface has no matching `id` |
| **Why it matters** | Relationship broken for AT. |
| **What to do** | Set `id={menuID}` on visible menu panel. |

### 11.3 — Menu

| | |
| --- | --- |
| **What's wrong** | `aria-expanded` from ref presence, not open state |
| **Why it matters** | Often wrong expanded state. |
| **What to do** | Bind to Popover `open`. |

### 11.4 — Menu

| | |
| --- | --- |
| **What's wrong** | Escape on submenu trigger returns to root menu button |
| **Why it matters** | Skips parent menu context. |
| **What to do** | Focus parent trigger / parent `menuitem`. |

### 11.5 — Menu

| | |
| --- | --- |
| **What's wrong** | Omit `aria-label` / `aria-labelledby` on `Menu` |
| **Why it matters** | Unnamed menu in rotor. |
| **What to do** | Document requirement; optional dev warn or default from trigger. |

### 12.1 — ChoiceList

| | |
| --- | --- |
| **What's wrong** | No `title`, `aria-label`, or `aria-labelledby` |
| **Why it matters** | Unnamed fieldset. |
| **What to do** | Require group name in API or docs. |

### 12.2 — ChoiceList

| | |
| --- | --- |
| **What's wrong** | Visible `title` via `Label` — orphan label, not legend / `aria-labelledby` |
| **Why it matters** | Visible caption may not name fieldset in AT. |
| **What to do** | `<legend>` or title `id` + `fieldset aria-labelledby`. |

### 12.3 — ChoiceList

| | |
| --- | --- |
| **What's wrong** | Radio choices with different `name` |
| **Why it matters** | Broken native radio grouping. |
| **What to do** | Single `name` on `ChoiceList` or dev warn. |

### 12.4 — ChoiceList

| | |
| --- | --- |
| **What's wrong** | Choice without `label` / help / `aria-label` |
| **Why it matters** | Unnamed input. |
| **What to do** | Type or document requirement. |

### 13.1 — Radio

| | |
| --- | --- |
| **What's wrong** | — `helpText` not in `aria-describedby`.  Mirror Checkbox pattern |
| **Why it matters** | `helpText` not in `aria-describedby`. |
| **What to do** | Mirror Checkbox pattern. |

### 13.2 — Radio

| | |
| --- | --- |
| **What's wrong** | — `error` without `aria-invalid`.  Set `aria-invalid` when `error` |
| **Why it matters** | `error` without `aria-invalid`. |
| **What to do** | Set `aria-invalid` when `error`. |

### 13.3 — Radio

| | |
| --- | --- |
| **What's wrong** | — `{...rest}` `id` overwrites input id vs `label htmlFor`.  Destructure `id`; single source for input + label |
| **Why it matters** | `{...rest}` `id` overwrites input id vs `label htmlFor`. |
| **What to do** | Destructure `id`; single source for input + label. |

### 14.1 — Pagination

| | |
| --- | --- |
| **What's wrong** | — Jump `MetricInput` unnamed; suffix text not associated.  `aria-label` or `aria-labelledby` |
| **Why it matters** | Jump `MetricInput` unnamed; suffix text not associated. |
| **What to do** | `aria-label` or `aria-labelledby`. |

### 14.2 — Pagination

| | |
| --- | --- |
| **What's wrong** | — `basic` type hides current page structurally.  Visible current page and/or `aria-current` |
| **Why it matters** | `basic` type hides current page structurally. |
| **What to do** | Visible current page and/or `aria-current`. |

### 14.3 — Pagination

| | |
| --- | --- |
| **What's wrong** | — Mobile flex `order` vs DOM tab order.  Match DOM to visual order |
| **Why it matters** | Mobile flex `order` vs DOM tab order. |
| **What to do** | Match DOM to visual order. |

### 15.1 — Breadcrumbs

| | |
| --- | --- |
| **What's wrong** | — Root `<div>`, not `<nav>`.  `<nav aria-label="Breadcrumb">` (i18n) |
| **Why it matters** | Root `<div>`, not `<nav>`. |
| **What to do** | `<nav aria-label="Breadcrumb">` (i18n). |

### 15.2 — Breadcrumbs

| | |
| --- | --- |
| **What's wrong** | — `BaseProps` only; cannot set root `aria-*`/`id`.  Extend root HTML props |
| **Why it matters** | `BaseProps` only; cannot set root `aria-*`/`id`. |
| **What to do** | Extend root HTML props. |

### 16.1 — VerticalNav

| | |
| --- | --- |
| **What's wrong** | — `role="treeitem"` on `<a>` + universal `preventDefault` — link semantics lost; native link behaviors broken.  Pick tree  native nav links; avoid both |
| **Why it matters** | link semantics lost; native link behaviors broken. |
| **What to do** | Pick tree  native nav links; avoid both. |

### 16.2 — VerticalNav

| | |
| --- | --- |
| **What's wrong** | — Tooltip  inserts wrapper between `tree` and `treeitem`.  Tooltip without wrapper or drop `role="tree"` |
| **Why it matters** | Tooltip **Popover** inserts wrapper between `tree` and `treeitem`. |
| **What to do** | Tooltip without wrapper or drop `role="tree"`. |

### 16.3 — VerticalNav

| | |
| --- | --- |
| **What's wrong** | — Root `aria-label`/`aria-labelledby` not forwardable ().  Extend API |
| **Why it matters** | Root `aria-label`/`aria-labelledby` not forwardable (**extractBaseProps**). |
| **What to do** | Extend API. |

### 17.1 — Navigation

| | |
| --- | --- |
| **What's wrong** | — Vertical ignores `menu.link` / no `href`.  Render `Link`/`<a>` when `link` set |
| **Why it matters** | Vertical ignores `menu.link` / no `href`. |
| **What to do** | Render `Link`/`<a>` when `link` set. |

### 17.2 — Navigation

| | |
| --- | --- |
| **What's wrong** | — Submenu parents lack `aria-expanded`/`aria-controls`.  Disclosure wiring + submenu `id` |
| **Why it matters** | Submenu parents lack `aria-expanded`/`aria-controls`. |
| **What to do** | Disclosure wiring + submenu `id`. |

### 17.3 — Navigation

| | |
| --- | --- |
| **What's wrong** | — No `aria-current` on active vertical item.  Match |
| **Why it matters** | No `aria-current` on active vertical item. |
| **What to do** | Match . |

### 18.1 — Tabs

| | |
| --- | --- |
| **What's wrong** | — Space does not activate tab (Enter only).  Handle Space with `preventDefault` |
| **Why it matters** | Space does not activate tab (Enter only). |
| **What to do** | Handle Space with `preventDefault`. |

### 18.2 — Tabs

| | |
| --- | --- |
| **What's wrong** | — Dismissible tab: nested Icon `button` inside `tab`; dismiss icon unnamed.  Avoid nesting; name dismiss |
| **Why it matters** | Dismissible tab: nested Icon `button` inside `tab`; dismiss icon unnamed. |
| **What to do** | Avoid nesting; name dismiss. |

### 18.3 — Tabs

| | |
| --- | --- |
| **What's wrong** | —  headers `role="button"` only, no tab semantics/selected state.  Align with APG tabs or document as non-tab switcher |
| **Why it matters** | **TabsWrapper** headers `role="button"` only, no tab semantics/selected state. |
| **What to do** | Align with APG tabs or document as non-tab switcher. |

### 18.4 — Tabs

| | |
| --- | --- |
| **What's wrong** | — Non-string `label` → missing `aria-label`.  Forward ARIA or tighten types |
| **Why it matters** | Non-string `label` → missing `aria-label`. |
| **What to do** | Forward ARIA or tighten types. |

### 19.1 — Modal

| | |
| --- | --- |
| **What's wrong** | `headerOptions.backButton` without extra labelling |
| **Why it matters** | Unnamed back control. |
| **What to do** | Fix in `OverlayHeader` (shared). |

### 19.2 — Modal

| | |
| --- | --- |
| **What's wrong** | Custom header or empty heading without `aria-labelledby` / composition `headingId` wiring |
| **Why it matters** | Generic unnamed dialog. |
| **What to do** | Require name, dev validation, or auto-wire `ModalHeader` heading id to root. |

### 20.1 — Dialog

| | |
| --- | --- |
| **What's wrong** | Custom Modal usage / falsy `heading` without `aria-labelledby` |
| **Why it matters** | Unnamed dialog. |
| **What to do** | Type/runtime guard or `aria-label` fallback. |

### 21.1 — Sidesheet

| | |
| --- | --- |
| **What's wrong** | Close animation — `onAnimationEnd={() => this.handleAnimationEnd}` does not invoke handler |
| **Why it matters** | `state.open` / `aria-modal` / visibility can desync. |
| **What to do** | Call `handleAnimationEnd` (bound or `()` wrapper). |

### 21.2 — Sidesheet

| | |
| --- | --- |
| **What's wrong** | Custom header / no heading without `aria-labelledby` |
| **Why it matters** | Unnamed dialog. |
| **What to do** | Document; optional dev warn. |

### 21.3 — Sidesheet

| | |
| --- | --- |
| **What's wrong** | `backButton` / `backIcon` — unnamed `OverlayHeader` button |
| **Why it matters** | Same as Modal/FullscreenModal rollup. |
| **What to do** | Shared `OverlayHeader` fix. |

### 22.1 — FullscreenModal

| | |
| --- | --- |
| **What's wrong** | Tab with open modal — focus can escape while `aria-modal="true"` |
| **Why it matters** | Conflicts with modal semantics vs Modal/Sidesheet. |
| **What to do** | Reuse Modal focus trap (capture Tab). |

### 22.2 — FullscreenModal

| | |
| --- | --- |
| **What's wrong** | No programmatic initial focus or restore on close. |
| **Why it matters** | No programmatic initial focus or restore on close. |
| **What to do** | Mirror Modal open/close focus lifecycle with `OverlayManager`. |

### 22.3 — FullscreenModal

| | |
| --- | --- |
| **What's wrong** | Omit `closeOnEscape` — no Escape listener |
| **Why it matters** | No standard keyboard dismiss. |
| **What to do** | Default `closeOnEscape` true when open and top of stack. |

### 22.4 — FullscreenModal

| | |
| --- | --- |
| **What's wrong** | Custom `header` without `aria-labelledby` / `aria-label` / string heading |
| **Why it matters** | Unnamed dialog. |
| **What to do** | Document; dev warn when open without name sources. |

### 22.5 — FullscreenModal

| | |
| --- | --- |
| **What's wrong** | `headerOptions.backButton` — same `OverlayHeader` pattern |
| **Why it matters** | Unnamed back. |
| **What to do** | Shared `OverlayHeader` fix. |

### 23.1 — DatePicker

| | |
| --- | --- |
| **What's wrong** | — Trigger vs popover: no `aria-expanded`/`aria-haspopup`/`aria-controls`; popover not `dialog`.  APG datepicker / disclosure wiring |
| **Why it matters** | Trigger vs popover: no `aria-expanded`/`aria-haspopup`/`aria-controls`; popover not `dialog`. |
| **What to do** | APG datepicker / disclosure wiring. |

### 23.2 — DatePicker

| | |
| --- | --- |
| **What's wrong** | `id="parent-DatePicker"` stripped on inner input () |
| **Why it matters** | `htmlFor` broken. |
| **What to do** | Real unique `id` + documented labeling. |

### 23.3 — DatePicker

| | |
| --- | --- |
| **What's wrong** | — Calendar unnamed if props omitted.  Default `aria-label` |
| **Why it matters** | Calendar unnamed if props omitted. |
| **What to do** | Default `aria-label`. |

### 24.1 — DateRangePicker

| | |
| --- | --- |
| **What's wrong** | — Popover/trigger relationship missing (same theme as DatePicker).  Central popover ARIA |
| **Why it matters** | Popover/trigger relationship missing (same theme as DatePicker). |
| **What to do** | Central popover ARIA. |

### 24.2 — DateRangePicker

| | |
| --- | --- |
| **What's wrong** | — Dual input: root `aria-label` not merged into start/end `aria-label`.  Merge or document |
| **Why it matters** | Dual input: root `aria-label` not merged into start/end `aria-label`. |
| **What to do** | Merge or document. |

### 24.3 — DateRangePicker

| | |
| --- | --- |
| **What's wrong** | — Visible  without `htmlFor`/ids by default.  Generated ids + `htmlFor` |
| **Why it matters** | Visible **Label** without `htmlFor`/ids by default. |
| **What to do** | Generated ids + `htmlFor`. |

### 25.1 — Calendar

| | |
| --- | --- |
| **What's wrong** | — No `aria-selected`/`aria-current`/`aria-disabled` on cells; disabled via CSS only.  Map visual state to ARIA |
| **Why it matters** | No `aria-selected`/`aria-current`/`aria-disabled` on cells; disabled via CSS only. |
| **What to do** | Map visual state to ARIA. |

### 26.1 — Table

| | |
| --- | --- |
| **What's wrong** | The data surface is a div grid without `table`/`grid` roles or header–cell relationships. |
| **Why it matters** | Screen readers cannot reliably infer structure or navigate like a table or ARIA grid. |
| **What to do** | Use a native `<table>` or a full ARIA grid pattern with keyboard support. |

### 26.2 — Table

| | |
| --- | --- |
| **What's wrong** | Sort controls do not expose `aria-sort`, pressed state, or direction in the accessible name. |
| **Why it matters** | Users cannot tell how the column is sorted or toggle it predictably with assistive tech. |
| **What to do** | Expose sort state in the name and/or `aria-sort` on the column header. |

### 26.3 — Table

| | |
| --- | --- |
| **What's wrong** | Nested row expand uses an **Icon** control with no name and no `aria-expanded`. |
| **Why it matters** | Expand/collapse state and purpose are unclear for assistive technologies. |
| **What to do** | Provide a clear name and bind `aria-expanded` to the actual open state. |

### 26.4 — Table

| | |
| --- | --- |
| **What's wrong** | An outer `aria-label` on **Table** is not forwarded to the **Grid** root. |
| **Why it matters** | The region users should hear may be missing or wrong on the focusable grid. |
| **What to do** | Forward the label to **Grid** or collapse to a single named wrapper. |

### 26.5 — Table

| | |
| --- | --- |
| **What's wrong** | Column resize grip labels use the internal column key instead of the human `displayName`. |
| **Why it matters** | Resize actions are announced with cryptic identifiers. |
| **What to do** | Use the same readable names users see in the UI. |

### 27.1 — List

| | |
| --- | --- |
| **What's wrong** | With no header row, column relationships are weaker than a proper grid or table. |
| **Why it matters** | Screen reader users get less context for what each column means. |
| **What to do** | Expose ARIA column headers or a documented first-row header pattern. |

### 27.2 — List

| | |
| --- | --- |
| **What's wrong** | Uses the same div-based grid as **Table** (inherited implementation). |
| **Why it matters** | Missing table/grid roles and header ties carry over from **Table**/**Grid**. |
| **What to do** | Remediate with the same track as **Table** / **Grid** (roles, names, keyboard). |

### 27.3 — List

| | |
| --- | --- |
| **What's wrong** | The **Table** → **Grid** `aria-label` forwarding gap applies to **List** as well. |
| **Why it matters** | The list/grid region may ship without the intended accessible name on the **Grid** root. |
| **What to do** | Forward the outer `aria-label` to **Grid** or adopt a single-wrapper naming strategy. |

### 28.1 — Layout (Flex, Row, Column, MdsGrid, Grid organism)

| | |
| --- | --- |
| **What's wrong** | **Grid** uses a div scaffold without table/grid roles; sort and nested expand lack proper exposure; root HTML props are narrow; resize grip labels use internal keys. |
| **Why it matters** | Same structural gaps as **Table** for semantics, state, and naming. |
| **What to do** | Consolidate with the **Table** audit — one remediation track for the shared **Grid** implementation. |

### 29.1 — Chip / ChipGroup

| | |
| --- | --- |
| **What's wrong** | — `div` + `role="button"` vs `<button>`.  Native `<button>` |
| **Why it matters** | `div` + `role="button"` vs `<button>`. |
| **What to do** | Native `<button>`. |

### 29.2 — Chip / ChipGroup

| | |
| --- | --- |
| **What's wrong** | — `disabled` without `aria-disabled`.  `aria-disabled` + guards |
| **Why it matters** | `disabled` without `aria-disabled`. |
| **What to do** | `aria-disabled` + guards. |

### 29.3 — Chip / ChipGroup

| | |
| --- | --- |
| **What's wrong** | /`P2` — `outline: none` on disabled chip CSS.  Avoid removing focus indicator; non-focusable disabled |
| **Why it matters** | `outline: none` on disabled chip CSS. |
| **What to do** | Avoid removing focus indicator; non-focusable disabled. |

### 29.4 — Chip / ChipGroup

| | |
| --- | --- |
| **What's wrong** | — ChipGroup does not forward per-chip `aria-label`/`aria-labelledby`.  Forward from `list` items |
| **Why it matters** | ChipGroup does not forward per-chip `aria-label`/`aria-labelledby`. |
| **What to do** | Forward from `list` items. |

### 30.1 — ChipInput

| | |
| --- | --- |
| **What's wrong** | — Duplicate `aria-labelledby` on wrapper + input.  Name primary `<input>` only; non-button wrapper |
| **Why it matters** | Duplicate `aria-labelledby` on wrapper + input. |
| **What to do** | Name primary `<input>` only; non-button wrapper. |

### 30.2 — ChipInput

| | |
| --- | --- |
| **What's wrong** | — Outer `role="button"` contains chips, input, clear.  Remove nested interactive widget pattern |
| **Why it matters** | Outer `role="button"` contains chips, input, clear. |
| **What to do** | Remove nested interactive widget pattern. |

### 30.3 — ChipInput

| | |
| --- | --- |
| **What's wrong** | — `error` without `aria-invalid`.  Map `error` on input |
| **Why it matters** | `error` without `aria-invalid`. |
| **What to do** | Map `error` on input. |

### 31.1 — Card

| | |
| --- | --- |
| **What's wrong** | **CardHeader**, **CardBody**, and **CardFooter** only get `extractBaseProps` — no `id` or `aria-*` on their roots. |
| **Why it matters** | Consumers cannot label regions or wire descriptions for card subsections. |
| **What to do** | Add `BaseHtmlProps` (or equivalent) on those roots, like the main **Card**. |

### 31.2 — Card

| | |
| --- | --- |
| **What's wrong** | **ActionCard** uses `role="link"` with `onClick` but no `href`. |
| **Why it matters** | It behaves like a button or custom widget, not a real link, which confuses semantics and expectations. |
| **What to do** | Use a real `<a href>` when navigating; otherwise use `role="button"` and full button semantics. |

### 31.3 — Card

| | |
| --- | --- |
| **What's wrong** | **ActionCard** responds to Enter but not Space. |
| **Why it matters** | Keyboard users expect both keys for activatable controls when using a button pattern. |
| **What to do** | If it is a button, handle Space (with `preventDefault`) as well as Enter. |

### 31.4 — Card

| | |
| --- | --- |
| **What's wrong** | **ActionCard** and **SelectionCard** can be `disabled` without `aria-disabled`. |
| **Why it matters** | Assistive tech may not know the card is inactive. |
| **What to do** | Set `aria-disabled="true"` when disabled and block interaction appropriately. |

### 32.1 — PageHeader

| | |
| --- | --- |
| **What's wrong** | — Title  default size →  for primary page title.  Default `h1` or `titleAs` API |
| **Why it matters** | Title **Heading** default size → **`h4`** for primary page title. |
| **What to do** | Default `h1` or `titleAs` API. |

### 33.1 — Collapsible

| | |
| --- | --- |
| **What's wrong** | — Footer trigger missing `aria-expanded`.  `aria-expanded={expanded}` |
| **Why it matters** | Footer trigger missing `aria-expanded`. |
| **What to do** | `aria-expanded={expanded}`. |

### 33.2 — Collapsible

| | |
| --- | --- |
| **What's wrong** | — Trigger name is  glyph only.  Default `aria-label` + `aria-hidden` on icon |
| **Why it matters** | Trigger name is **Icon** glyph only. |
| **What to do** | Default `aria-label` + `aria-hidden` on icon. |

### 33.3 — Collapsible

| | |
| --- | --- |
| **What's wrong** | — `withTrigger` + no `onToggle` → inert "button".  Hide trigger or `aria-disabled` + `tabIndex={-1}` |
| **Why it matters** | `withTrigger` + no `onToggle` → inert "button". |
| **What to do** | Hide trigger or `aria-disabled` + `tabIndex={-1}`. |

### 33.4 — Collapsible

| | |
| --- | --- |
| **What's wrong** | — `withTrigger={false}` + default `hoverable` — keyboard cannot expand.  Document external trigger or disable hover-only path |
| **Why it matters** | keyboard cannot expand. |
| **What to do** | Document external trigger or disable hover-only path. |

### 34.1 — InputMask

| | |
| --- | --- |
| **What's wrong** | — `onPaste` always `preventDefault` first.  Only prevent when handling paste |
| **Why it matters** | `onPaste` always `preventDefault` first. |
| **What to do** | Only prevent when handling paste. |

### 34.2 — InputMask

| | |
| --- | --- |
| **What's wrong** | — `caption`/`helpText` siblings not in `aria-describedby`.  Generate ids + merge `aria-describedby` |
| **Why it matters** | `caption`/`helpText` siblings not in `aria-describedby`. |
| **What to do** | Generate ids + merge `aria-describedby`. |

### 34.3 — InputMask

| | |
| --- | --- |
| **What's wrong** | Inherits **Input** gaps for `aria-invalid`, clear control naming, and info affordance. |
| **Why it matters** | Masked fields stay broken for error state and help until **Input** is fixed. |
| **What to do** | Fix **Input**; optionally share `aria-describedby` for mask-specific hints. |

### 35.1 — VerificationCodeInput

| | |
| --- | --- |
| **What's wrong** | One shared `id` is applied to every OTP cell. |
| **Why it matters** | Duplicate ids break uniqueness and label or description associations. |
| **What to do** | Use per-cell ids or a `baseId` pattern; document a group label if needed. |

### 35.2 — VerificationCodeInput

| | |
| --- | --- |
| **What's wrong** | With `error` set, `aria-invalid` is not applied (inherits **Input** behavior). |
| **Why it matters** | Invalid state is not exposed to assistive tech. |
| **What to do** | Fix **Input** and optionally merge shared `aria-describedby` for the code group. |

### 36.1 — EditableInput

| | |
| --- | --- |
| **What's wrong** | — Text input inside  `role="button"`.  Separate edit trigger from input subtree |
| **Why it matters** | Text input inside **Editable** `role="button"`. |
| **What to do** | Separate edit trigger from input subtree. |

### 36.2 — EditableInput

| | |
| --- | --- |
| **What's wrong** | — Empty value + empty placeholder → unnamed trigger.  Require placeholder or `aria-label` |
| **Why it matters** | Empty value + empty placeholder → unnamed trigger. |
| **What to do** | Require placeholder or `aria-label`. |

### 36.3 — EditableInput

| | |
| --- | --- |
| **What's wrong** | — Error only in hover `Popover`; no `aria-describedby`/`aria-invalid`.  Inline errors + ARIA wiring |
| **Why it matters** | Error only in hover `Popover`; no `aria-describedby`/`aria-invalid`. |
| **What to do** | Inline errors + ARIA wiring. |

### 37.1 — EditableChipInput

| | |
| --- | --- |
| **What's wrong** | —  wraps chip buttons and  (nested interactives).  Restructure  / composition |
| **Why it matters** | **Editable** wraps chip buttons and **ChipInput** (nested interactives). |
| **What to do** | Restructure  / composition. |

### 38.1 — FileUploader

| | |
| --- | --- |
| **What's wrong** | — Row `role="button"` wraps inner `<button>`s.  Remove nested interactive pattern; list + separate buttons |
| **Why it matters** | Row `role="button"` wraps inner `<button>`s. |
| **What to do** | Remove nested interactive pattern; list + separate buttons. |

### 38.2 — FileUploader

| | |
| --- | --- |
| **What's wrong** | — File input not associated with title/format copy.  `aria-labelledby` / `aria-describedby` with stable ids |
| **Why it matters** | File input not associated with title/format copy. |
| **What to do** | `aria-labelledby` / `aria-describedby` with stable ids. |

### 38.3 — FileUploader

| | |
| --- | --- |
| **What's wrong** | /  — Dynamic error/progress without progressbar/live semantics.  `role="alert"` / `aria-live`; ProgressRing `role="progressbar"` |
| **Why it matters** | Dynamic error/progress without progressbar/live semantics. |
| **What to do** | `role="alert"` / `aria-live`; ProgressRing `role="progressbar"`. |

### 39.1 — MultiSlider / Slider / RangeSlider

| | |
| --- | --- |
| **What's wrong** | ( / ) — Visible `Label` not associated with thumb(s).  Ids + `aria-labelledby` |
| **Why it matters** | Visible `Label` not associated with thumb(s). |
| **What to do** | Ids + `aria-labelledby`. |

### 39.2 — MultiSlider / Slider / RangeSlider

| | |
| --- | --- |
| **What's wrong** | ( / ) — Two thumbs not distinguishable by name.  "Start"/"End" or consumer API |
| **Why it matters** | Two thumbs not distinguishable by name. |
| **What to do** | "Start"/"End" or consumer API. |

### 39.3 — MultiSlider / Slider / RangeSlider

| | |
| --- | --- |
| **What's wrong** | — Track/ticks: `role="button"`, Enter/Space, but `tabIndex` commented out.  Focusable + named, or drop button role |
| **Why it matters** | Track/ticks: `role="button"`, Enter/Space, but `tabIndex` commented out. |
| **What to do** | Focusable + named, or drop button role. |

### 40.1 — Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter)

| | |
| --- | --- |
| **What's wrong** | () — No `aria-label`/`aria-labelledby` API.  Naming props; indeterminate named |
| **Why it matters** | No `aria-label`/`aria-labelledby` API. |
| **What to do** | Naming props; indeterminate named. |

### 40.2 — Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter)

| | |
| --- | --- |
| **What's wrong** | () — Optional `ariaLabel`; visible label not `aria-labelledby` when `showLabel`.  Wire label id |
| **Why it matters** | Optional `ariaLabel`; visible label not `aria-labelledby` when `showLabel`. |
| **What to do** | Wire label id. |

### 41.1 — Tooltip

| | |
| --- | --- |
| **What's wrong** | Portaled content has no `role="tooltip"` |
| **Why it matters** | AT cannot classify surface as tooltip. |
| **What to do** | `role="tooltip"` on tooltip root. |

### 41.2 — Tooltip

| | |
| --- | --- |
| **What's wrong** | No tooltip `id`; trigger lacks `aria-describedby` when open |
| **Why it matters** | Supplementary text not programmatically tied to control. |
| **What to do** | `useId`; merge/remove `aria-describedby` with open state; preserve existing ids. |

### 42.1 — Typography (Text, Heading, Subheading, Paragraph, Caption)

| | |
| --- | --- |
| **What's wrong** | **Caption** has no `BaseHtmlProps`, so callers cannot set `id` for `aria-describedby`. |
| **Why it matters** | Helper or error text cannot be wired to the caption element by id. |
| **What to do** | Extend props and forward `id` / ARIA to the root. |

### 42.2 — Typography (Text, Heading, Subheading, Paragraph, Caption)

| | |
| --- | --- |
| **What's wrong** | **Caption** stringifies `` `${children}` ``, so rich **ReactNode** children break. |
| **Why it matters** | Content can degrade to `[object Object]` and lose semantics. |
| **What to do** | Render `children` normally instead of coercing to string. |

### 43.1 — StatusHint bundle (StatusHint, EmptyState, Placeholder)

| | |
| --- | --- |
| **What's wrong** | `onClick` + non-text children — `div` `role="button"` may lack name; no ARIA pass-through |
| **Why it matters** | `div` `role="button"` may lack name; no ARIA pass-through. |
| **What to do** | `<button>` or required `aria-label`. |

### 43.2 — StatusHint bundle (StatusHint, EmptyState, Placeholder)

| | |
| --- | --- |
| **What's wrong** | () —  without required `alt` when `src` set.  Require `alt` or decorative contract |
| **Why it matters** | **Image** without required `alt` when `src` set. |
| **What to do** | Require `alt` or decorative contract. |

### 43.3 — StatusHint bundle (StatusHint, EmptyState, Placeholder)

| | |
| --- | --- |
| **What's wrong** | () — `compressed`/`tight` title uses  not heading.  Keep heading styled via CSS |
| **Why it matters** | `compressed`/`tight` title uses **Text** not heading. |
| **What to do** | Keep heading styled via CSS. |

### 43.4 — StatusHint bundle (StatusHint, EmptyState, Placeholder)

| | |
| --- | --- |
| **What's wrong** | () — No `aria-busy`/`aria-hidden` on skeleton.  Hide from AT + document parent `aria-busy` |
| **Why it matters** | No `aria-busy`/`aria-hidden` on skeleton. |
| **What to do** | Hide from AT + document parent `aria-busy`. |

### 44.1 — Message / InlineMessage / Toast

| | |
| --- | --- |
| **What's wrong** | Toast **ActionButton** renders `<button>` without `type` inside a `<form>`. |
| **Why it matters** | The browser treats it as a submit button and may post the form unintentionally. |
| **What to do** | Use `type="button"` on non-submit actions. |

### 45.1 — Avatar / AvatarGroup

| | |
| --- | --- |
| **What's wrong** | Static avatars use `tabIndex={0}` with `role="img"`, so they sit in the tab order without an action. |
| **Why it matters** | Keyboard users waste stops on non-interactive imagery. |
| **What to do** | Make non-interactive avatars unfocusable; only focus when they open a real action. |

### 45.2 — Avatar / AvatarGroup

| | |
| --- | --- |
| **What's wrong** | Consumer `tabIndex` can force `role="button"` without keyboard handlers. |
| **Why it matters** | The control looks actionable but does not respond to keyboard activation. |
| **What to do** | Use a native `<button>` or implement full keyboard support for the interactive mode. |

### 45.3 — Avatar / AvatarGroup

| | |
| --- | --- |
| **What's wrong** | Outer `role="img"` wraps an inner `<img>`, doubling image semantics; **Avatar.Image** sets `alt` from first name only. |
| **Why it matters** | Announcements can be redundant or omit the user's full name. |
| **What to do** | Use one naming source and set `alt` (or equivalent) to the full display name. |

### 45.4 — Avatar / AvatarGroup

| | |
| --- | --- |
| **What's wrong** | **AvatarCount** uses `aria-haspopup="listbox"` against a plain `ul` in a popover; the trigger is `role="button"` without Enter/Space and without `aria-expanded`. |
| **Why it matters** | Popup type, open state, and keyboard activation do not match what assistive tech expects. |
| **What to do** | Align `aria-haspopup` with the real pattern (e.g. `dialog`), use a real `<button>`, and wire `aria-expanded` (and **Popover** behavior). |

### 46.1 — Chat

| | |
| --- | --- |
| **What's wrong** | —  no label association.  Label API or required `aria-label` |
| **Why it matters** | **ChatInput** no label association. |
| **What to do** | Label API or required `aria-label`. |

### 46.2 — Chat

| | |
| --- | --- |
| **What's wrong** | — Action bar hover-only.  `:focus-within` / keyboard path |
| **Why it matters** | Action bar hover-only. |
| **What to do** | `:focus-within` / keyboard path. |

### 47.1 — Checkbox

| | |
| --- | --- |
| **What's wrong** | Whitespace-only `label` or no label/`aria-*` — unnamed control |
| **Why it matters** | unnamed control. |
| **What to do** | Trim whitespace; require name. |

### 48.1 — Textarea

| | |
| --- | --- |
| **What's wrong** | The `readOnly` prop is not forwarded to the native `readonly` attribute. |
| **Why it matters** | Assistive tech cannot tell the field is read-only from the DOM. |
| **What to do** | Forward `readOnly` to the underlying `<textarea>`. |

### 49.1 — SwitchInput

| | |
| --- | --- |
| **What's wrong** | — Unlabeled switch without `aria-label`/`Label` pairing.  Docs / dev warning |
| **Why it matters** | Unlabeled switch without `aria-label`/`Label` pairing. |
| **What to do** | Docs / dev warning. |

### 50.1 — Link

| | |
| --- | --- |
| **What's wrong** | `<Link onClick={…}>` without `href` |
| **Why it matters** | Wrong or ambiguous control semantics vs button. |
| **What to do** | Require `href` or render `button` for actions. |

### 51.1 — LinkButton

| | |
| --- | --- |
| **What's wrong** | `icon` with empty/whitespace `children` and no `aria-label` |
| **Why it matters** | Unnamed control. |
| **What to do** | Enforce name when icon-only; types/docs. |

### 52.1 — Stepper

| | |
| --- | --- |
| **What's wrong** | — Empty `label` leaves weak step name (icon noise).  Require labels or synthesize names |
| **Why it matters** | Empty `label` leaves weak step name (icon noise). |
| **What to do** | Require labels or synthesize names. |

### 53.1 — Dropzone

| | |
| --- | --- |
| **What's wrong** | — Hidden file input unnamed / not tied to instructions.  `aria-label` or `aria-labelledby`/`describedby` |
| **Why it matters** | Hidden file input unnamed / not tied to instructions. |
| **What to do** | `aria-label` or `aria-labelledby`/`describedby`. |

### 54.1 — List — KeyValuePair / MetaList (from list-audit)

| | |
| --- | --- |
| **What's wrong** | **MetaList** separator **Icon** is not `aria-hidden`, so it is announced between items. |
| **Why it matters** | Decorative separators add noise and slow down reading of the list. |
| **What to do** | Mark separator icons `aria-hidden="true"` when they are purely visual. |


_Several list and menu surfaces share `ListBody` behavior; fixing list roles and focus in **Listbox** reduces duplicate work in **Select**, **Combobox**, and **Menu**._

_**Table**, **List**, and **Layout** (Grid organism) overlap on grid semantics and row interactions; treat as one remediation track where the audits align._

## Index by component → issue id

| Component | Issues |
| --- | --- |
| Avatar / AvatarGroup | 45.1–45.4 |
| Breadcrumbs | 15.1–15.2 |
| Button | 2.1–2.3 |
| Calendar | 25.1 |
| Card | 31.1–31.4 |
| Chat | 46.1–46.2 |
| Checkbox | 47.1 |
| Chip / ChipGroup | 29.1–29.4 |
| ChipInput | 30.1–30.3 |
| ChoiceList | 12.1–12.4 |
| Collapsible | 33.1–33.4 |
| Combobox | 10.1–10.4 |
| DatePicker | 23.1–23.3 |
| DateRangePicker | 24.1–24.3 |
| Dialog | 20.1 |
| Dropdown | 6.1–6.5 |
| Dropzone | 53.1 |
| EditableChipInput | 37.1 |
| EditableDropdown | 7.1–7.3 |
| EditableInput | 36.1–36.3 |
| FileUploader | 38.1–38.3 |
| FullscreenModal | 22.1–22.5 |
| Icon + useAccessibilityProps | 3.1–3.2 |
| Input | 1.1–1.4 |
| InputMask | 34.1–34.3 |
| Layout (Flex, Row, Column, MdsGrid, Grid organism) | 28.1 |
| Link | 50.1 |
| LinkButton | 51.1 |
| List | 27.1–27.3 |
| List — KeyValuePair / MetaList (from list-audit) | 54.1 |
| Listbox | 8.1–8.3 |
| Menu | 11.1–11.5 |
| Message / InlineMessage / Toast | 44.1 |
| Modal | 19.1–19.2 |
| MultiSlider / Slider / RangeSlider | 39.1–39.3 |
| Navigation | 17.1–17.3 |
| PageHeader | 32.1 |
| Pagination | 14.1–14.3 |
| Popover | 5.1–5.3 |
| Radio | 13.1–13.3 |
| Select | 9.1–9.4 |
| Sidesheet | 21.1–21.3 |
| Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter) | 40.1–40.2 |
| StatusHint bundle (StatusHint, EmptyState, Placeholder) | 43.1–43.4 |
| Stepper | 52.1 |
| SwitchInput | 49.1 |
| Table | 26.1–26.5 |
| Tabs | 18.1–18.4 |
| Textarea | 48.1 |
| Tooltip | 41.1–41.2 |
| Typography (Text, Heading, Subheading, Paragraph, Caption) | 42.1–42.2 |
| Utils (Divider, Backdrop, OutsideClick, PopperWrapper) | 4.1–4.3 |
| VerificationCodeInput | 35.1–35.2 |
| VerticalNav | 16.1–16.3 |

See aggregated reports under `aria-audits/`.
# Complex Inputs Pickers

This document contains the P0 (Critical) and P1 (High) ARIA audit issues for Complex Inputs Pickers.

**Total P0/P1 issues in this group:** 31

| Component | P0/P1 Issues |
| :--- | :--- |
| FileUploader | 4 |
| EditableInput | 4 |
| MultiSlider / RangeSlider / Slider | 2 |
| DatePicker | 4 |
| DateRangePicker | 4 |
| TimePicker | 3 |
| MetricInput | 3 |
| Calendar | 2 |
| EditableChipInput | 1 |
| FileList | 2 |
| EditableDropdown | 1 |
| VerificationCodeInput | 1 |

---

## 1. FileUploader - Some issues fixed in PR 2991

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

## 2. EditableInput

### 1. P0 - Collapsed `role="button"` can have no accessible name (error + empty display text)
- **Repro:** As in snapshots: `EditableInput` with `error`, `errorMessage`, empty `value`, and placeholder not contributing visible text — the collapsed control is a `role="button"` whose subtree is only the decorative error icon (`aria-hidden="true"`), yielding **no** computed accessible name.
- **Issue + impact:** Screen reader users get a “button” with no label; purpose and relation to validation are unclear; violates the requirement that user interface components have a name.
- **Suggestion:** Always expose a name in the collapsed state (e.g. `aria-label` / `aria-labelledby` derived from field label, or visible text such as placeholder / “Empty” / error summary). If the error icon is meant to convey state, pair it with visible text or non-hidden text alternative for the control name.

---

### 2. P0 - Collapsed `role="button"` can have no accessible name (empty value and empty placeholder)
- **Repro:** `<EditableInput onChange={() => {}} />` with default `placeholder: ''` and no `value` — collapsed button has no text subtree for naming.
- **Issue + impact:** Unnamed interactive control; users cannot tell what field they are activating.
- **Suggestion:** Require a non-empty placeholder for the collapsed state, or add a dedicated prop (e.g. `label` / `aria-label`) and document it; avoid shipping a focusable unnamed control.

---

### 3. P1 - Global HTML/ARIA props on `EditableInput` are not applied to the root (naming not fixable via props)
- **Repro:** `<EditableInput aria-label="Project name" placeholder="…" onChange={fn} />` — `aria-label` is stripped and never rendered on the collapsed `role="button"`.
- **Issue + impact:** Consumers cannot attach `aria-label`, `aria-labelledby`, `id`, or `aria-describedby` to the actual interactive root; they cannot repair unnamed or weakly named instances without wrapping in another element (which may not match focus/activation behavior).
- **Suggestion:** Extend props with `BaseHtmlProps<HTMLDivElement>` (or forward a defined subset) to the root `div`, or add explicit `label` / `ariaLabel` props documented as required for the collapsed control.

---

### 4. P1 - `errorMessage` is only in a hover `Popover` and is not wired to the input
- **Repro:** Enter edit mode with `error` + `errorMessage`; keyboard-focused users may not trigger hover popover behavior consistently; the `<input>` has `aria-invalid` from `error` but no stable ID-linked error text in the accessibility tree.
- **Issue + impact:** Error details may be unavailable or hard to discover; invalid state is not programmatically described per common WCAG techniques.
- **Suggestion:** Give `InlineMessage` a stable `id`, set `aria-errormessage` / `aria-describedby` on the `Input` (and ensure the message is not `aria-hidden`), and/or expose error text inline near the field; if using `Popover`, add keyboard/focus parity (e.g. open on focus) or avoid hover-only error disclosure.

---

## 3. MultiSlider / RangeSlider / Slider

*Note: `Slider` and `RangeSlider` are wrappers around the underlying `MultiSlider` implementation, so they share the exact same accessibility issues.*

### 1. P1 - Track and axis ticks expose `role="button"` but are not keyboard-focusable

- **Issue + impact:** Assistive technologies and keyboard users get a **misleading role** (button that cannot be focused). Enter/Space handlers are dead for keyboard users. Users who depend on correct role semantics may be directed to controls they cannot operate from the keyboard.
- **Suggestion:**  Remove `role="button"` and treat track/ticks as **non-widget** regions (e.g. `role="presentation"` / no role) if interaction is pointer-only and duplicates handle behavior—then document that value changes are via thumbs only.

---

### 2. P1 - Multiple thumbs share the same `aria-labelledby` when a group label exists (RangeSlider & MultiSlider)
- **Issue + impact:** Each thumb is announced with the **same name**, so users cannot tell which thumb is minimum vs maximum (or nth handle) without inferring from value alone.
- **Suggestion:** Supply **distinct** names per thumb (e.g. `aria-label` on each handle, or `aria-labelledby` pointing to visually hidden spans, or APG-style `aria-valuetext` that includes role context — preferably explicit labels like “Minimum price”, “Maximum price”). Extend `HandleProps` or parent API accordingly.

---

## 4. DatePicker

### 1. P1 - Popover trigger: open state and popup relationship not exposed to assistive tech

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

## 5. DateRangePicker

### 1. P1 - Popover open affordance is pointer-only; wrapper is not a keyboard-operable control

**Issue + impact:** Users who cannot use a pointing device may be unable to open the popup calendar at all, or must rely on incidental behaviors (e.g. some flows call `setState({ open: true })` from input handlers in dual-input mode, but that is inconsistent and not a documented keyboard contract).

**Suggestion:** Implement an APG-aligned keyboard contract: e.g. `aria-expanded` on the text field, **Alt+Down / Escape** (or similar) on the input, and/or make the **logical trigger** keyboard-activatable with **Enter/Space** without relying on a non-focusable parent `div`.

---

### 2. P1 - Portaled calendar: no focus move into overlay; tab order likely skips calendar until late in document
**Suggestion:** On open, **move focus** to the calendar (e.g. first enabled date cell or a “dialog” wrapper with `role="dialog"` and `aria-modal` if you adopt that pattern); on close, **return focus** to the invoking input. Optionally trap focus inside the overlay while open.

---

### 3. P1 - Visible `Label` is not programmatically tied to the `InputMask` / `<input>` (no `htmlFor` / `id` pair)
- **Repro:** Inspect the DOM: `<label>` (via `GenericText` / `Label`) sits as a **sibling** of the input; `Input` does not auto-generate an `id`, and `Trigger` does not pass `htmlFor` matching the input’s `id`.

**Issue + impact:** Assistive technologies may **not associate** “Start date” / “End date” with the correct field; click-to-focus from the label text may not work. Users hear the control name from **placeholder** or other heuristics instead of the designed label.

**Suggestion:** Generate stable **unique ids** per instance (e.g. `uidGenerator`) for start/end/single inputs; set `id` on the `<input>` and `htmlFor` on the label (or wrap the input inside the label if layout allows).

---

### 4. P1 - Inline error / caption text from `HelpText` is not referenced on the `<input>`
- **Repro:** Force `showStartError` / `showEndError` / `showError` so `HelpText` renders a message; check the `<input>` — it gets `aria-invalid` via `Input`, but `aria-describedby` / `aria-errormessage` is not wired to `HelpText`’s `id` (HelpText generates an id internally, but `InputMask` does not connect it).

**Issue + impact:** Screen reader users may hear “invalid” without an **explicit programmatic link** to the **error description** text.

**Suggestion:** In `InputMask`, pass `id` to `HelpText` and merge that id into `aria-describedby` (and/or `aria-errormessage` when in error) on the forwarded `Input` props.

---

## 6. TimePicker

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

## 7. MetricInput

### 1. P1 - Stepper buttons stay keyboard-focusable when the field is `disabled` or `readOnly`

- **Issue + impact:** Mouse users see a non-interactive control; keyboard and some AT users still land on operable-seeming buttons, producing inconsistent disabled behavior and wasted tab stops.
- **Suggestion:** Set `disabled={disabled || readOnly}` (or `aria-disabled` + `tabIndex={-1}` with documented behavior) on both stepper buttons when the field is not editable, matching the input’s state.

---

### 2. P1 - Stepper buttons not disabled (or otherwise inert) at `min` / `max` boundaries

- **Suggestion:** Drive `disabled` (or `aria-disabled` + keyboard blocking) from `min`/`max`/current numeric value on each button, or expose `aria-valuemin`/`aria-valuemax`-style relationships if you move to a single composite widget pattern.

---

### 3. P1 - `min` and `max` props are not applied as HTML attributes on the `<input>`
- **Repro:** Inspect DOM for `<MetricInput min={0} max={10} />` — `<input>` lacks `min`/`max` while clamping still occurs in script.
- **Issue + impact:** Assistive technologies and browser validation UX do not receive declared numeric bounds from the element; users may not hear or infer permitted range the way they would from a native number field.
- **Suggestion:** Pass `min={min}` and `max={max}` through to the `<input>` when defined (and keep JS clamping consistent with those attributes).


---

## 8. Calendar

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

## 9. EditableChipInput

### 1. P1 - Nested interactive controls — outer `role="button"` contains focusable chip “buttons”
- **Repro:** Render `EditableChipInput` with `value={['Chip1','Chip2']}` and `chipInputOptions` matching tests (`chipOptions` with `clearButton: true`) — inspect DOM: root has `role="button"` and `tabIndex="0"` while each `Chip` exposes a focusable `role="button"` (and optionally a nested dismiss `role="button"`) inside that root.
- **Issue + impact:** Nesting focusable buttons inside a declared button produces invalid accessibility trees and unpredictable screen-reader / keyboard behavior (multiple tab stops “inside” one button, ambiguous activation, conflicting roles). Users may not know which control will activate on **Enter** / **Space** or how focus order relates to the control’s announced role.
- **Suggestion:** Avoid `role="button"` on the **outer** wrapper when chips are shown. Prefer e.g. `role="group"` with `aria-labelledby` / `aria-label` for the field, plus an explicit **native `<button type="button">` “Edit”** (or make the non-interactive region non-focusable and rely on chip + edit affordances). Align with **Chip** fixes that avoid nested buttons (see chip audit: sibling structure / `role="group"`).

---

## 10. FileList

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

## 11. EditableDropdown

### 1. P1 - Focus lands on trigger that is immediately hidden (close / cancel / apply / outside close)
- **Repro:** Open `EditableDropdown` (keyboard or pointer), then close via Escape, outside click, or option selection; observe `document.activeElement` relative to `[data-test="DesignSystem-DropdownTrigger"]` and `display` on the dropdown wrapper after state settles.
- **Issue + impact:** `DropdownList`’s `onToggleDropdown` always calls `dropdownTriggerRef.current?.focus()` after `toggleDropdown` (`DropdownList.tsx`). `EditableDropdown` hides the entire `Dropdown` with `d-none` when not editing (`EditableDropdown.tsx`). After close, focus often remains on (or is moved to) a **display:none** button or is lost to `body`, so keyboard users lose a predictable focus position and screen readers get inconsistent reading context.
- **Suggestion:** After close in `EditableDropdown`, **move focus to the outer container** (or a dedicated native button replacing the outer `div`) in a `useEffect` / layout effect keyed on `dropdownOpen === false && !editing`, or coordinate with `Dropdown`/`DropdownList` to **skip trigger focus** when used inside this pattern. Prefer one owner for “return focus” semantics.

---

## 12. VerificationCodeInput

### 1. P1 - Shared `aria-label` from `...rest` overwrites per-digit labels on every cell
- **Repro:** Fails when `VerificationCodeInput` is used with `aria-label="Verification code"` (or similar single string) while relying on the component to label each digit; every cell exposes the same accessible name.
- **Issue + impact:** Screen reader users lose **position context** (“which digit am I editing?”). This parallels the failure mode of non-unique names across a related set of controls.
- **Suggestion:** Do not forward a single `aria-label` to every `Input`. Prefer a **group** label (`aria-labelledby` / `legend`) plus per-cell labels, or synthesize per-cell labels when a group label is provided (e.g. append “, digit 2 of 6”).

---
# Structural ARIA audit: DatePicker

**Scope:** `DatePicker` organism and its direct composition (trigger, popover shell, embedded `Calendar`, footer chip).  
**Method:** Static review of implementation and immediate dependencies against HTML semantics, WAI-ARIA, WCAG 2.2 AA–relevant structure, and the [APG Date Picker pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-datepicker/) (as reference, not all APG items are WCAG failures).

---

## Implementation map

| Path | Role |
|------|------|
| `core/components/organisms/datePicker/DatePicker.tsx` | Main class component: state, `Popover` + `Trigger` when `withInput`, or bare `renderCalendar()` |
| `core/components/organisms/datePicker/Trigger.tsx` | Wraps `InputMask` as the popover trigger; opens popover on change/paste; validation UX |
| `core/components/organisms/datePicker/index.tsx` | Re-exports |
| `core/components/molecules/popover/Popover.tsx` | Popover shell (`div` + `PopperWrapper`) |
| `core/components/atoms/popperWrapper/PopperWrapper.tsx` | Positioning, open state, trigger wrapper (`OutsideClick`), no ARIA bridge |
| `core/components/molecules/inputMask/InputMask.tsx` | Masked input; special-cases `id === 'parent-DatePicker'` |
| `core/components/organisms/calendar/Calendar.tsx` | Calendar grid, navigation, selection (shared with other pickers) |

**Stories / patterns (secondary):** `core/components/organisms/datePicker/__stories__/`, `core/components/patterns/datePicker/`.

---

## Severity summary

| Tier | Count |
|------|------:|
| **P0** | 1 |
| **P1** | 3 |
| **P2** | 5 |
| **P3** | 2 |

---

## Findings

### 1. Calendar surface inside DatePicker is not keyboard-operable (inherited)

- **WCAG / basis:** 2.1.1 Keyboard (Level A); 4.1.2 Name, Role, Value — **P0** — **Component default** (any `DatePicker` that shows the calendar UI).  
- **Repro:** Open the picker (`withInput` flow). Tab through the UI: prev/next month controls are real `<button>` elements, but day cells use `Text` (`<span>`) with `onClick` only; month/year grids use `<div onClick>`; header drill-down uses `<div onClick>` (explicit `// TODO(a11y)` in source). None of these expose `tabIndex`, `role`, or `onKeyDown` for Space/Enter on the date/month/year/header controls.  
- **Impact:** Keyboard-only users cannot move focus to or activate most of the calendar; screen reader users get a flat text layout without grid semantics.  
- **Suggestion:** Implement the APG date picker / grid keyboard model (or use native `<button>`s for each day and navigable control), wire `role="grid"` / `gridcell` / `aria-selected` (or dialog + roving tabindex) as appropriate, and replace clickable `div`s in the header with disclosed controls.

**Code reference (date cell — span + click only):**

```1100:1115:core/components/organisms/calendar/Calendar.tsx
            return (
              <div key={`${row}-${col}`} className={wrapperClass} data-test="designSystem-Calendar-WrapperClass">
                {!dummy && (
                  <>
                    <Text
                      color={getTextColor}
                      size={size === 'small' ? 'small' : 'regular'}
                      appearance={disabled ? 'subtle' : 'default'}
                      data-test="DesignSystem-Calendar--dateValue"
                      className={valueClass}
                      onClick={onClickHandler(date)}
                      onMouseOver={onMouseOverHandler(date)}
                      onMouseEnter={onMouseEnterHandler.bind(this, date, today(), disabled)}
                    >
                      {date}
                    </Text>
```

---

### 2. Popover trigger and floating panel lack ARIA relationship (combo-box / disclosure pattern)

- **WCAG / basis:** 4.1.2 Name, Role, Value; **APG** disclosure / dialog-datepicker reference — **P1** — **Component default** (`withInput` path).  
- **Repro:** Inspect DOM with popover open. `PopperWrapper` wraps the trigger in `OutsideClick` and toggles visibility; neither adds `aria-expanded`, `aria-haspopup` (e.g. `dialog`), nor `aria-controls` pointing at a stable id on the popover content. The popover root is a plain `div` (`data-test="DesignSystem-Popover"`) without `role="dialog"` / `aria-modal` (and no `aria-labelledby` for the dialog title).  
- **Impact:** AT users may not perceive that the text field expands a date panel, whether it is expanded, or which node is the associated popup.  
- **Suggestion:** On the focusable trigger (`input`), set `aria-expanded`, `aria-haspopup="dialog"` (or follow APG combobox if treating as composite), and `aria-controls` matching the popover container id; give the popover `role="dialog"`, `aria-modal="true"`, and an accessible name; manage focus per APG when opening/closing.

---

### 3. Hardcoded trigger `id` is stripped from the actual `<input>`

- **WCAG / basis:** 3.3.2 Labels or Instructions; 1.3.1 Info and Relationships (programmatic label association) — **P1** — **Component default** (`Trigger` → `InputMask`).  
- **Repro:** `Trigger` passes `id="parent-DatePicker"` to `InputMask`. `InputMask` intentionally omits `id` on the inner `Input` when `id` is `parent-DatePicker` or `parent-TimePicker`, so `document.getElementById('parent-DatePicker')` is null and `<label htmlFor="parent-DatePicker">` does not hit the control.  
- **Impact:** Consumers cannot rely on id-based labeling; visible labels may not be associated unless `aria-label` / `aria-labelledby` is set on `inputOptions` or the root `DatePicker` props.  
- **Suggestion:** Use a generated unique id (per instance) passed through to the real input, or require `aria-labelledby` and document that `htmlFor` is unsupported; remove the misleading fixed id string.

**Code reference:**

```393:410:core/components/molecules/inputMask/InputMask.tsx
      <Input
        {...rest}
        id={id !== 'parent-TimePicker' && id !== 'parent-DatePicker' ? id : undefined}
        value={value}
        error={error}
        required={required}
        onFocus={onFocusHandler}
        onChange={onChangeHandler}
```

```82:101:core/components/organisms/datePicker/Trigger.tsx
  return (
    <InputMask
      icon="events"
      placeholder={inputFormat}
      {...inputOptions}
      ...
      id="parent-DatePicker"
    />
  );
```

---

### 4. No default accessible name on the calendar region from DatePicker

- **WCAG / basis:** 4.1.2 Name, Role, Value — **P1** — **Consumer-dependent** (worsened when consumers omit props).  
- **Repro:** Render `<DatePicker withInput … />` without `aria-label` / `aria-labelledby` on `DatePicker` or `inputOptions`, and without passing `aria-label`/`aria-labelledby` through to `Calendar` via remaining `...rest`. The calendar wrapper only gets a name if those props are provided.  
- **Impact:** The calendar group may appear in the accessibility tree without a meaningful name.  
- **Suggestion:** Default `aria-label` on the calendar container (e.g. “Choose date”) or require a prop at type level; ensure the name does not duplicate the input’s name in a confusing way.

---

### 5. Focus management when opening/closing the popover

- **WCAG / basis:** 2.4.3 Focus Order; **APG** dialog focus management — **P2** — **Component default**.  
- **Repro:** Open the date popover from the input; focus remains in the text field. No initial move to the calendar, no focus trap, and no documented return focus on close beyond native behavior.  
- **Impact:** Extra tab cycles; risk of focus landing “behind” the overlay in some configurations; not aligned with dialog-style date pickers.  
- **Suggestion:** On open, move focus to the first logical element in the dialog (or keep focus on combobox input if following combobox+popup APG—then document and implement full pattern); on close, restore focus to the trigger; trap tab within the popover while open if using `aria-modal="true"`.

---

### 6. Popover content is not exposed as a modal dialog

- **WCAG / basis:** Best practice / **APG** — **P2** — **Component default** (structural clarity; severity lower where WCAG SC not strictly failed without modal semantics).  
- **Repro:** Floating `DesignSystem-Popover` `div` has no `role="dialog"` or `aria-modal`.  
- **Impact:** Screen readers may not switch to dialog reading mode; sibling content remains in reading order context.  
- **Suggestion:** Align with APG dialog datepicker or combobox popup roles and document expected behavior.

---

### 7. Validation error presentation (InputMask → HelpText → InlineMessage)

- **WCAG / basis:** 3.3.1 Error Identification; 4.1.3 Status Messages — **P2** — **Shared stack** (`InputMask` / `HelpText` / `InlineMessage`).  
- **Repro:** Trigger validation error on the masked field; error renders via `InlineMessage` inside `HelpText` without `role="alert"` or `aria-live` on the status container.  
- **Impact:** Errors may not be announced reliably when they appear.  
- **Suggestion:** Use `role="alert"` or `aria-live="polite"` on the error region and associate the input with `aria-invalid` + `aria-describedby` pointing at the error id.

---

### 8. “Today” footer control uses `div role="button"` (Chip / GenericChip)

- **WCAG / basis:** HTML — prefer native `<button>` — **P2** — **Component default** (footer visible when `showTodayDate` is true).  
- **Repro:** Inspect `Chip` → `GenericChip` wrapper: `tabIndex={0}`, `role="button"`, keyboard handler — functional but not a native button.  
- **Impact:** Slightly weaker semantics and behavior vs native button (e.g. click activation, disabled handling).  
- **Suggestion:** Use `Button` atom or render a real `<button>` for the action chip.

---

### 9. `withInput={false}` renders only the calendar subtree

- **WCAG / basis:** 4.1.2; **APG** — **P2** — **Consumer-dependent**.  
- **Repro:** `DatePicker` `render()` returns `this.renderCalendar()` only; no built-in trigger, popover, or labeling.  
- **Impact:** Correctness of the overall “date picker” pattern depends entirely on the embedding page.  
- **Suggestion:** Document required wrapper semantics (label, button to open dialog, etc.) or provide a dedicated non-input variant with a trigger.

```314:349:core/components/organisms/datePicker/DatePicker.tsx
  render() {
    const { position, withInput, inputFormat, inputOptions, validators, popoverOptions } = this.props;

    const { open } = this.state;

    if (withInput) {
      ...
      return (
        <Popover
          trigger={...}
        >
          {this.renderCalendar()}
        </Popover>
      );
    }

    return this.renderCalendar();
  }
```

---

### 10. Paste handling in InputMask (design-system rule conflict)

- **WCAG / basis:** Project rule / UX — **P3** — **Shared** (`InputMask` used by `Trigger`).  
- **Repro:** `InputMask` `onPasteHandler` calls `e.preventDefault()` before conditional handling.  
- **Impact:** Some paste scenarios are blocked at the browser level; may conflict with repo accessibility guidelines that discourage blocking paste.  
- **Suggestion:** Revisit paste strategy (allow paste, then sanitize/validate) if this path is considered user-facing for date entry.

---

### 11. Missing APG-style grid / selected-date semantics on calendar wrapper

- **WCAG / basis:** **APG only** (enhancement for AT clarity) — **P3** — **Inherited from Calendar**.  
- **Repro:** Outer `Calendar` wrapper is a `div` with optional `aria-label` / `aria-labelledby` only; no `role="grid"`, `aria-selected` on cells, or `aria-current="date"` for today.  
- **Suggestion:** Add roles/states per APG grid pattern once keyboard navigation exists.

---

## Positive notes

- `DatePickerProps` exposes `'aria-label'` and `'aria-labelledby'` and merges them into `inputOptions` when `withInput`, so consumers can name the text trigger without editing internals.  
- Calendar prev/next navigation uses the design-system `Button` (native `<button>`).  
- `Chip` / `GenericChip` for “Today” implements keyboard activation (Enter/Space) and `role="button"` with `tabIndex`.

---

## Deduped themes

1. **Calendar interaction model** — Click-only `span`/`div` cells and headers drive most **P0**/**P1** structural gaps; fixing Calendar fixes DatePicker, DateRangePicker, and similar embeds.  
2. **Popover primitive** — No ARIA wiring between `PopperWrapper` trigger and floating `div`; affects DatePicker and any other popover-based widget until addressed centrally.  
3. **InputMask `parent-*` id hack** — Breaks id-based labels for DatePicker and TimePicker until ids are real and unique.

---

*End of report.*

# Structural ARIA audit: DateRangePicker

**Scope:** `DateRangePicker` organism and its direct composition (dual/single `InputMask` triggers, `Popover` / `PopperWrapper`, embedded `Calendar` in range mode, `children` slot).  
**Method:** Static review of implementation and immediate dependencies against HTML semantics, WAI-ARIA, WCAG 2.2 AA–relevant structure, and the [APG Date Picker Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-datepicker/) (reference; not every APG item is a WCAG failure).

---

## Implementation map

| Path | Role |
|------|------|
| `core/components/organisms/dateRangePicker/DateRangePicker.tsx` | Main class component: range state, `Popover` + `Trigger` or `SingleInputTrigger` when `withInput`, or bare `renderCalendar()` when `withInput` is false |
| `core/components/organisms/dateRangePicker/Trigger.tsx` | Two-column layout: start/end `InputMask` triggers; opens popover on change/paste/click handlers; `Label` + masked inputs |
| `core/components/organisms/dateRangePicker/SingleInputTrigger.tsx` | Single `InputMask` with range mask (`start - end`); same popover-open behavior via parent state |
| `core/components/organisms/dateRangePicker/utilities.tsx` | Pure date helpers (`getCurrentWeek`, etc.) — no DOM/ARIA |
| `core/components/organisms/dateRangePicker/index.tsx` | Re-exports |
| `css/src/components/dateRangePicker.module.css` | Layout/styles for trigger columns (no ARIA-specific classes observed) |

**Upstream dependencies (shared with DatePicker / Calendar):**

| Path | Role |
|------|------|
| `core/components/molecules/popover/Popover.tsx` | Shell: `div` (`data-test="DesignSystem-Popover"`, `data-opened`, `data-layer`) + `PopperWrapper` |
| `core/components/atoms/popperWrapper/PopperWrapper.tsx` | Positioning, portal to `document.body`, `OutsideClick` trigger wrapper — **no `aria-*` bridge** |
| `core/components/molecules/inputMask/InputMask.tsx` | Masked input → `Input` + `HelpText` |
| `core/components/organisms/calendar/Calendar.tsx` | Range selection UI when `rangePicker={true}` (day cells, navigation, headers) |
| `core/components/atoms/label/Label.tsx` | Visual label; supports `htmlFor` only if consumer passes it |

**Stories / patterns (secondary):** `core/components/organisms/dateRangePicker/__stories__/`, `core/components/patterns/dateRangePicker/withCustomPopover.story.tsx`, `figma/DateRangePicker.figma.tsx`.

---

## Severity summary

| Tier | Count |
|------|------:|
| **P0** | 1 |
| **P1** | 4 |
| **P2** | 4 |
| **P3** | 2 |

---

## Findings

### 1. Calendar surface (range mode) is not keyboard-operable — inherited from `Calendar`

- **WCAG / basis:** 2.1.1 Keyboard (A); 4.1.2 Name, Role, Value — **P0** — **Component default** for any usage that renders the calendar (both `withInput` and inline calendar-only).  
- **Repro:** Open the range picker and tab through the UI. Month navigation uses real `<button>` elements in places, but day cells render as `Text` → `<span>` with `onClick` / hover handlers only; month/year views and header drill-down rely on clickable non-button elements. There is no `tabIndex`, keyboard activation (`Enter`/`Space`), or grid roles on day cells.  
- **Impact:** Keyboard-only users cannot operate most of the calendar; screen readers do not get a proper grid or date-button semantics for range selection.  
- **Suggestion:** Align with APG (dialog + grid or native `button` per day): add focusable controls, `role="grid"` / `gridcell` / `aria-selected` (and range-specific `aria-selected` / described-by patterns as needed), replace clickable `div`/span interactions with buttons or roving tabindex, and ensure range start/end state is exposed to AT.

**Code reference (embedded calendar — range props only; structure is shared `Calendar`):**

```382:396:core/components/organisms/dateRangePicker/DateRangePicker.tsx
    return (
      <Calendar
        {...rest}
        monthsInView={this.monthsInView}
        rangePicker={true}
        startDate={convertToDate(startDate, inputFormat, validators)}
        endDate={convertToDate(endDate, inputFormat, validators)}
        disabledBefore={convertToDate(disabledBefore, inputFormat, validators)}
        disabledAfter={convertToDate(disabledAfter, inputFormat, validators)}
        onRangeChange={this.onRangeChangeHandler}
        yearNav={yearNav}
        monthNav={monthNav}
        rangeLimit={rangeLimit}
      />
    );
```

---

### 2. Popover trigger and floating panel lack an ARIA disclosure / dialog relationship

- **WCAG / basis:** 4.1.2 Name, Role, Value; APG disclosure / dialog-datepicker — **P1** — **Component default** (`withInput` path).  
- **Repro:** With `withInput`, inspect DOM while the popover is open. `PopperWrapper` toggles portal content but does not set `aria-expanded`, `aria-haspopup` (e.g. `dialog`), or `aria-controls` on the triggering control(s). The popover root from `Popover.tsx` is a plain `div` without `role="dialog"`, `aria-modal`, or an accessible name via `aria-labelledby` / `aria-label`.  
- **Impact:** Assistive technologies cannot reliably report that the field(s) open a date panel, whether it is expanded, or which element is the popup.  
- **Suggestion:** On the focusable trigger(s), set `aria-expanded` synced to `open`, `aria-haspopup="dialog"` (or follow APG combobox if modeled as composite), and `aria-controls` pointing at a stable id on the popover content; name the dialog and manage initial focus / return focus per APG when opening and closing.

---

### 3. Dual-input mode does not fall back to root `aria-label` for start/end fields

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships — **P1** — **Component default** when consumers rely on root `DateRangePicker` naming only.  
- **Repro:** Use `withInput`, `singleInput={false}`, set `aria-label="Trip dates"` on `DateRangePicker` but omit `aria-label` on `startInputOptions` / `endInputOptions`. Inspect merged props: `mergedStartInputOptions` / `mergedEndInputOptions` only forward their own `aria-label` keys, not the root value.  
- **Impact:** Start/end inputs may lack an accessible name unless each `*InputOptions` or `aria-labelledby` is set explicitly; single-input mode behaves differently (root `aria-label` is merged).  
- **Suggestion:** For parity and predictability, merge root `aria-label` / `aria-labelledby` into both start and end options when those fields do not already define them (e.g. suffix or combine with default labels), or document that root props apply only to the calendar wrapper and single-input trigger.

**Code reference:**

```422:437:core/components/organisms/dateRangePicker/DateRangePicker.tsx
      const mergedSingleInputOptions = {
        ...inputOptions,
        'aria-label': inputOptions['aria-label'] || ariaLabel,
        'aria-labelledby': inputOptions['aria-labelledby'] || ariaLabelledBy,
      };
      const mergedStartInputOptions = {
        ...startInputOptions,
        'aria-label': startInputOptions['aria-label'],
        'aria-labelledby': startInputOptions['aria-labelledby'] || ariaLabelledBy,
      };
      const mergedEndInputOptions = {
        ...endInputOptions,
        'aria-label': endInputOptions['aria-label'],
        'aria-labelledby': endInputOptions['aria-labelledby'] || ariaLabelledBy,
      };
```

---

### 4. Visible `Label` is not wired to inputs by default

- **WCAG / basis:** 3.3.2 Labels or Instructions; 1.3.1 Info and Relationships — **P1** — **Component default** for typical story/default usage.  
- **Repro:** In `Trigger.tsx` / `SingleInputTrigger.tsx`, `Label` is rendered with `withInput` and text from `label` / `startLabel` / `endLabel`, but no `htmlFor` is set by the component. `InputMask` forwards `id` only if provided via options. Unless the consumer manually pairs `htmlFor` on a custom label and `id` on the mask, the visible label is not programmatically associated with the `<input>`.  
- **Impact:** Screen readers may not announce the visible label with the control; click-to-focus from label may not work.  
- **Suggestion:** Generate stable ids (e.g. `useId`) for each input and pass `htmlFor` to `Label`, or pass `aria-labelledby` pointing at label element ids; document required props until automated.

---

### 5. Calendar wrapper naming depends on passed props — acceptable but easy to omit

- **WCAG / basis:** 4.1.2 Name, Role, Value — **P2** — **Consumer-dependent** (also **component default** when props omitted).  
- **Repro:** `Calendar` root is a `div` with optional `aria-label` / `aria-labelledby` from `...rest`. If the app omits both, the calendar region has no accessible name. Stories often set `aria-label` on `DateRangePicker`, which flows through `rest` — good — but nothing enforces it.  
- **Impact:** unnamed calendar region in AT when props are forgotten.  
- **Suggestion:** Default `aria-label` for range mode (e.g. “Date range calendar”) or require `aria-labelledby` when embedding in labeled dialogs.

---

### 6. Range-specific selection state is conveyed visually only (color / styling)

- **WCAG / basis:** 1.4.1 Use of Color (A); 4.1.2 (state) — **P2** — **Component default** (via `Calendar` range styling).  
- **Repro:** In range mode, in-range days, start/end, and errors use CSS classes and color; day `Text` nodes expose only the day number without `aria-selected`, `aria-current`, or text indicating “range start/end”.  
- **Impact:** Users who rely on non-color cues or AT may not perceive range boundaries or errors beyond generic text.  
- **Suggestion:** Expose `aria-selected` / `aria-current="date"` (or APG-recommended pattern for range), and ensure error/range-limit messages are textual and associated via `aria-describedby` where applicable.

---

### 7. No live region for dynamic range completion or validation

- **WCAG / basis:** 4.1.3 Status Messages (AA) — **P2** / **Best practice** where status is not focused — **Component default**.  
- **Repro:** When both dates are set, the component closes the popover (`open: false` in `componentDidUpdate`); range errors and limit violations update state without an `aria-live` announcement.  
- **Impact:** Screen reader users may not hear that a range was completed, cleared, or invalid without moving focus.  
- **Suggestion:** Add polite `aria-live` (or `role="status"`) for meaningful confirmations and errors, or move focus to a summary element.

---

### 8. Icon-only affordances on `InputMask` (calendar icon, clear) — inherited from `Input`

- **WCAG / basis:** 4.1.2 — **P2** — **Inherited** (`Input` + `Icon`).  
- **Repro:** Triggers pass `icon="events"` into `InputMask` → `Input`. Decorative treatment depends on `Icon` implementation (verify `aria-hidden` for decorative left icon; clear control should expose name).  
- **Impact:** If icons are exposed as images without names, AT noise or missing control names.  
- **Suggestion:** Audit `Icon` usage in `Input` for decorative vs actionable icons; ensure clear/ action buttons have visible text or `aria-label`.

---

### 9. `utilities.tsx` helpers return empty strings for `getCustomDates`

- **WCAG / basis:** Non-WCAG / API clarity — **P3** — **Consumer-dependent**.  
- **Repro:** `getCustomDates` returns `{ startDate: '', endDate: '' }` (strings, not `Date`). Consumers misusing this as real dates may break validation and empty states.  
- **Impact:** Indirect UX/a11y if invalid values propagate to inputs.  
- **Suggestion:** Type as `undefined` or document placeholder; align with `DateType` expectations.

---

### 10. Duplicate / redundant typing for `aria-label` on `DateRangePickerProps`

- **WCAG / basis:** Best practice (API hygiene) — **P3** — **N/A for users**.  
- **Repro:** `DateRangePickerProps` extends `SharedProps` (which already includes `aria-label` / `aria-labelledby` from `Calendar` shared types) and re-declares the same optional props.  
- **Impact:** None for runtime; mild maintainer confusion.  
- **Suggestion:** Remove duplicate declarations or document intent (picker vs calendar naming).

---

## Positive notes

- **Native text inputs as triggers:** `InputMask` ultimately renders a real `<input>`, which is preferable to `div` buttons for the typing surface.  
- **No `parent-DatePicker`-style `id` stripping:** Unlike `DatePicker`’s trigger, range pickers do not pass a magic `id` that `InputMask` drops, so consumer-supplied `id` + external `label htmlFor` can work if wired manually.  
- **Root `aria-labelledby` merge:** `aria-labelledby` from `DateRangePicker` is forwarded to both start and end input option objects when not overridden — helps composite labeling when ids exist.  
- **Disabled gating:** `onToggleHandler` respects disabled state on single or dual inputs before opening — avoids opening an unusable panel in that case.

---

## Out of scope / follow-up

- Full keyboard interaction matrix (tab order, Escape to close, focus trap) requires behavioral testing of `PopperWrapper` + `OutsideClick` + portaled content; this report flags structural gaps only.  
- A dedicated **`Calendar` audit** (`aria-audits/raw-reports/calendar-audit.md`) should be the source of truth for grid/header/month-year issues; fixes there benefit `DateRangePicker`, `DatePicker`, and any other consumer.

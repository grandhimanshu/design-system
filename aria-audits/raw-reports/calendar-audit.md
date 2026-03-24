# Calendar — structural ARIA audit

**Severity summary:** 4 P0 · 1 P1 · 4 P2 · 2 P3

---

## Implementation locations

| Area | Path |
|------|------|
| Main component | `core/components/organisms/calendar/Calendar.tsx` |
| Public exports | `core/components/organisms/calendar/index.tsx` → re-exported from `core/index.tsx` |
| Types / config / helpers | `core/components/organisms/calendar/types.ts`, `config.ts`, `utility.ts` |
| Styles | `css/src/components/calendar.module.css` |
| Unit tests / snapshots | `core/components/organisms/calendar/__tests__/Calendar.test.tsx`, `__tests__/utility.test.tsx`, `__snapshots__/Calendar.test.tsx.snap` |
| Stories | `core/components/organisms/calendar/__stories__/` (`index.story.jsx`, `withEvents.story.jsx`, `disabled.story.jsx`, `firstDayOfWeek.story.jsx`, `variants/size.story.jsx`, `variants/view.story.jsx`) |

**Composition note:** `DatePicker` (`core/components/organisms/datePicker/DatePicker.tsx`) renders this `Calendar` inside a popover and forwards `aria-label` / `aria-labelledby` from props or `inputOptions` when provided—see lines ~289–323. Standalone `Calendar` usage still carries all issues below.

**APG reference:** [Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) — calendar region typically uses `role="grid"`, row/column structure, weekday `columnheader`s, focusable cells (`gridcell` or native `button`), roving tabindex, and `aria-selected` / `aria-current` as appropriate.

---

## Component overview

`Calendar` is a class component supporting three views (`date`, `month`, `year`), prev/next header `Button`s, and clickable header regions to change view when `jumpView` is true. The outer wrapper is a `div` with optional `aria-label` / `aria-labelledby` (see ```1191:1197:core/components/organisms/calendar/Calendar.tsx```). Day, month, and year choices are implemented as non-semantic interactive elements: `<div>` or `<span>` (via `Text`) with `onClick` (and mouse handlers). Navigation arrows use design-system `Button` with icon only.

**Root cause / rollup:** Several `// TODO(a11y)` comments and `eslint-disable-next-line` suppressions align with one pattern: **mouse-only custom controls** without roles, keyboard handlers, or focus management, plus **no calendar grid semantics or cell state ARIA**. Addressing the APG-aligned grid (native `button` per cell or full `grid` + roving tabindex) fixes the bulk of P0/P1 items together.

---

## Findings

### 1. Icon-only prev/next `Button`s have no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value  
- **Severity:** P0  
- **Scope:** Component default  
- **Repro:** Render `Calendar` with default props; inspect prev/next header buttons in the accessibility tree—no computed name. Implementation: ```583:592:core/components/organisms/calendar/Calendar.tsx```. `Button` sets `aria-label` only from `aria-label` or `tooltip` when there are no children (`core/components/atoms/button/Button.tsx` ~189).  
- **Issue + impact:** Prev/next controls are exposed as buttons without an accessible name; screen reader users cannot tell what each control does (and the action changes by `view`: date vs month vs year).  
- **Suggestion:** Pass explicit, view-aware strings via `aria-label` or `tooltip` (e.g. “Previous month”, “Next month”, and equivalents for month/year views).

### 2. Date cells are non-focusable `<span>`s (`Text`) with pointer handlers only

- **WCAG / basis:** 2.1.1 Keyboard; 4.1.2 Name, Role, Value  
- **Severity:** P0  
- **Scope:** Component default  
- **Repro:** Keyboard-only: tab through the page—date numbers are not in tab order and have no `onKeyDown`. Implementation attaches `onClick` / `onMouseOver` / `onMouseEnter` to `Text` (renders `<span>`): ```1100:1115:core/components/organisms/calendar/Calendar.tsx``` and duplicate path for overflow days ```1119:1134:core/components/organisms/calendar/Calendar.tsx```.  
- **Issue + impact:** Date selection is not keyboard-operable and does not expose a widget role or name per day. This diverges from the APG date-picker keyboard model.  
- **Suggestion:** Use `<button type="button">` per day (day number as visible label), or implement `role="grid"` / `role="gridcell"` with roving `tabindex` and APG key bindings.

### 3. Year and month tiles use `<div onClick>` without button semantics or keyboard support

- **WCAG / basis:** 2.1.1 Keyboard; 4.1.2 Name, Role, Value  
- **Severity:** P0  
- **Scope:** Component default  
- **Repro:** Switch to year or month view; no focusable target for a year/month cell. Implementation: ```732:747:core/components/organisms/calendar/Calendar.tsx``` (year), ```795:809:core/components/organisms/calendar/Calendar.tsx``` (month).  
- **Issue + impact:** Same class of failure as finding 2: interactive tiles are not in the keyboard tab order and lack roles/names.  
- **Suggestion:** Replace with `<button>` (or gridcells with roving focus), using native `disabled` / `aria-disabled` for unavailable values.

### 4. Header “jump” controls are `<div onClick>` (month/year labels and drill-down)

- **WCAG / basis:** 2.1.1 Keyboard  
- **Severity:** P0  
- **Scope:** Component default  
- **Repro:** With `jumpView` true (default), try to activate month/year heading via keyboard—no focusable control. Implementation: ```651:682:core/components/organisms/calendar/Calendar.tsx``` (explicit TODO comments).  
- **Issue + impact:** View switching available to pointer users is unavailable to keyboard-only users.  
- **Suggestion:** Use `<button type="button">` with descriptive names (e.g. “Choose month: March”, “Choose year: 2025”) or a single disclosed control with appropriate `aria-expanded` if modeled as disclosure.

### 5. Missing grid/cell state mapping for assistive technologies

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships  
- **Severity:** P1  
- **Scope:** Component default  
- **Repro:** Inspect DOM for selected day, “today”, range start/end—state is expressed visually via CSS classes; no `aria-selected`, `aria-current="date"`, or `aria-disabled` on cells. Disabled dates rely on `.Calendar-value--disabled` → `pointer-events: none` in CSS (`css/src/components/calendar.module.css` ~312–313), which does not convey semantics to AT.  
- **Issue + impact:** Screen reader users cannot reliably determine selection, current date, or unavailable days in a structured way. Range endpoints and in-range styling are not exposed structurally.  
- **Suggestion:** After buttons or gridcells exist, map state to `aria-selected`, `aria-current`, `disabled`/`aria-disabled`, and document range mode naming (e.g. names that reflect “range start” / “range end” where needed).

### 6. Weekday labels are not column headers in a grid

- **WCAG / basis:** 1.3.1 Info and Relationships  
- **Severity:** P2  
- **Scope:** Component default  
- **Issue + impact:** `renderBodyDate` renders weekday abbreviations as `Text` in a row (```835:847:core/components/organisms/calendar/Calendar.tsx```) with no `role="row"` / `role="columnheader"` relationship to date columns.  
- **Suggestion:** If using `role="grid"`, add a header row with `role="row"` and `role="columnheader"` (abbreviations via `abbr` if needed).

### 7. Optional `aria-label` / `aria-labelledby`; default often unnamed; `monthsInView > 1` lacks distinction

- **WCAG / basis:** 4.1.2 Name, Role, Value (when the calendar is the primary control)  
- **Severity:** P2  
- **Scope:** Consumer-dependent for single month; component default for multi-month  
- **Issue + impact:** Props are optional (```1190:1196:core/components/organisms/calendar/Calendar.tsx```). With `monthsInView > 1`, multiple `data-test="DesignSystem-Calendar"` instances render (```1164:1175:core/components/organisms/calendar/Calendar.tsx```) without per-panel names unless the consumer supplies them—adjacent unnamed regions are hard to tell apart.  
- **Suggestion:** Default `aria-label` (overridable), or require documentation; for multi-month, label each month panel (e.g. “March 2025”, “April 2025”).

### 8. Decorative header chevron `Icon` may add redundant noise

- **WCAG / basis:** Best practice; 1.1.1 if the icon name is announced confusingly  
- **Severity:** P2  
- **Scope:** Component default  
- **Issue + impact:** `keyboard_arrow_down` beside headings (```637:646:core/components/organisms/calendar/Calendar.tsx```) hints drill-down visually; if `Icon` is not marked decorative, AT may announce non-essential content.  
- **Suggestion:** Mark decorative icons `aria-hidden="true"` once the control has a proper accessible name.

### 9. Event indicator is an empty `<span>` with no semantic meaning

- **WCAG / basis:** Best practice; 1.1.1 if treated as meaningful non-text without a name  
- **Severity:** P2  
- **Scope:** Component default  
- **Issue + impact:** `renderEventsIndicator` returns an empty styled `span` (```856:862:core/components/organisms/calendar/Calendar.tsx```).  
- **Suggestion:** If decorative: `aria-hidden="true"`. If “has event” is meaningful: convey via visible text, `aria-label` on the day control, or another non-empty accessible description.

### 10. `Heading` in header may affect document outline when multiple months or headings exist

- **WCAG / basis:** 1.3.1 Info and Relationships (heading hierarchy)  
- **Severity:** P3  
- **Scope:** Component default (embedding context varies)  
- **Issue + impact:** `renderHeading` uses `Heading` (likely heading element) for month/year strings (```643:646:core/components/organisms/calendar/Calendar.tsx```). Embedded in pages that already define an outline, this can introduce extra heading levels or duplicate levels across adjacent calendars.  
- **Suggestion:** Prefer non-heading typography inside the widget, or scope with `role="group"` + `aria-labelledby` pointing to plain text; align with page-level heading strategy.

### 11. No live region for navigated month/year (optional enhancement)

- **WCAG / basis:** Best practice; 4.1.3 Status Messages only if month changes are treated as status requiring announcement  
- **Severity:** P3  
- **Scope:** Component default  
- **Issue + impact:** Navigation updates the view without `aria-live`; some users benefit from polite announcements of the new visible month/year—balance against verbosity.  
- **Suggestion:** Tie visible month/year to `aria-live="polite"` or a visually hidden live region on navigation complete.

### 12. Root wrapper does not accept arbitrary HTML attributes beyond `extractBaseProps`

- **WCAG / basis:** HTML / best practice (limits `id`, `role`, relationship attributes)  
- **Severity:** P3  
- **Scope:** Consumer-dependent  
- **Issue + impact:** Root spreads `extractBaseProps` plus explicit `aria-label` / `aria-labelledby` only (```1182:1196:core/components/organisms/calendar/Calendar.tsx```)—no general `id`/`role` pass-through without API extension.  
- **Suggestion:** If integrators need stable `id` or `role="region"`, extend props (e.g. `BaseHtmlProps<HTMLDivElement>` or `wrapperProps`).

---

## Out of scope (this pass)

Color contrast, focus ring CSS (`:focus-visible`), touch target sizes, motion / `prefers-reduced-motion`—not verified in this structural audit.

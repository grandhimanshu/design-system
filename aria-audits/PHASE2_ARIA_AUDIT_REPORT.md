# Phase 2 & 3 — Aggregated ARIA / Semantic HTML Audit Report

This document aggregates structural ARIA audits from `aria-audits/raw-reports/` for the Phase 2 / Phase 3 component set requested by the orchestration plan. It follows the executive-summary shape from `.cursor/skills/use-aria-auditors/SKILL.md` (severity rollup, deduped themes, prioritized backlog, then detailed findings in backlog order).

## Scope and gaps

**Included (41 components with raw reports):**  
`input`, `textarea`, `checkbox`, `radio`, `switchInput`, `slider`, `rangeSlider`, `multiSlider`, `chipInput`, `editableChipInput`, `editableInput`, `verificationCodeInput`, `inputMask`, `fileUploader`, `dropzone`, `tabs`, `breadcrumbs`, `pagination`, `horizontalNav`, `verticalNav`, `navigation`, `stepper`, `pageHeader`, `calendar`, `datePicker`, `dateRangePicker`, `table`, `chat`, `avatar`, `badge`, `chip`, `spinner` (bundle with ProgressBar / ProgressRing / Meter), `message` (bundle with InlineMessage / Toast), `statusHint` (bundle with EmptyState / Placeholder), `icon`, `layout` (Flex / Row / Column / MdsGrid / Grid organism), `utils` (Divider / Backdrop / OutsideClick / PopperWrapper), `typography` (Text / Heading / Subheading / Paragraph / Caption), `card` (includes ActionCard / SelectionCard notes), `list` (includes KeyValuePair / MetaList), `collapsible`.

**No raw report found under `aria-audits/raw-reports/` for:** `textField`, `metricInput`, `timePicker`, `forms`, `actionCard` (dedicated). Treat these as **not covered** by this aggregation until raw reports exist.

**Counting note:** Per-component severity tallies from raw reports were summed independently. Shared implementations (**Calendar** in pickers, **Grid** in Table/List and partially in layout audit, **MultiSlider** for Slider/RangeSlider, **Popover/PopperWrapper**, **Icon / useAccessibilityProps**, **Input** in InputMask/VerificationCodeInput) mean **one engineering fix often closes multiple report lines**; the figures below are **gross** counts, not net unique defects.

---

## Total counts by severity (gross, from raw reports)

| Tier | Count |
|------|------:|
| **P0** | 31 |
| **P1** | 112 |
| **P2** | 157 |
| **P3** | 85 |
| **Total** | **385** |

---

## Deduped themes

1. **Icon-only `Button` / unnamed icon triggers** — `Button` only sets `aria-label` from props or `tooltip`; Pagination (first/prev/next/last), Breadcrumbs overflow, FileUploader remove/retry, Calendar prev/next, Table/Grid column filter & menu triggers share one remediation pattern (default labels + i18n props).

2. **`Input` validation & secondary controls** — `error` without `aria-invalid`; clear `Icon` without stable `aria-label`; `info` tooltip hover-only and focusable `div` wrapper. Fixes in **Input** benefit **InputMask**, **VerificationCodeInput**, and picker triggers.

3. **Calendar surface** — Non-focusable `span`/`div` cells and headers; missing grid/selection state ARIA. Fixing **Calendar** reduces **P0/P1** in **DatePicker** and **DateRangePicker** (inherited).

4. **Popover / trigger relationship** — Missing `aria-expanded`, `aria-haspopup`, `aria-controls`, dialog roles on floating panel; **InputMask** `parent-DatePicker` id stripping. Central **PopperWrapper/Popover** improvements benefit pickers, Avatar overflow, tooltips.

5. **MultiSlider / Handle** — Thumb lacks accessible **name** (`aria-valuetext` is value, not name); visible `Label` not associated; track/ticks use `role="button"` without focus or names. **Slider**, **RangeSlider**, and **MultiSlider** audits overlap one implementation.

6. **Nested interactive / wrong roles** — **Chip** clear inside outer `role="button"`; **ChipInput** outer `role="button"` around input and chips; **Editable** wrapping **ChipInput** / **Input**; **FileUploader** row `role="button"` with inner buttons; **Tabs** dismissible tab + inner Icon button.

7. **`extractBaseProps` / narrow `BaseProps`** — Many atoms/organisms only forward `className` and `data-test`, blocking `id`, `aria-*`, landmarks on roots (**Breadcrumbs**, **VerticalNav**, **PageHeader** wrapper, **CardHeader/Body/Footer**, **Caption**, **Collapsible**, **MetaList**, **Divider**, etc.).

8. **`Icon` + `useAccessibilityProps`** — Interactive branch drops `aria-labelledby` / `aria-describedby` / `aria-hidden`; unnamed icon-only buttons; `<i role="button">` vs native `<button>`. Cascades to **ChipInput**, **Navigation** footer, **Grid** nested row trigger, and many consumers.

9. **Div-based data grid** — **Grid** (Table/List) lacks table/grid roles and header–cell relationships; resource rows click-only; sort state not exposed. **Layout** audit duplicates **Grid** findings.

10. **Faux buttons** — **Chat** `NewMessage` / `UnreadMessage`; **Collapsible** footer; **AvatarCount** — `role="button"` without full keyboard contract or native `<button>`.

11. **Radio vs Checkbox parity** — **Radio** missing `helpText` → `aria-describedby`, missing `aria-invalid` for `error`, `id`/`htmlFor` drift when consumer passes `id`, unstable generated `id`.

---

## Prioritized backlog (effort vs impact)

Ordered for **high user impact relative to effort** (fix once, propagate; or small targeted API additions). Component lines show **gross** P0/P1/P2 from raw reports.

1. **Input** — 0 P0, 4 P1, 3 P2: Map `error` → `aria-invalid`; name clear control; keyboard-accessible `info` or inline help; fix `inlineLabel` association. *Impact:* Multiple molecules inherit.

2. **Pagination** — 1 P0, 3 P1, 4 P2: Default `aria-label`/`tooltip` on four icon nav buttons; name jump field; expose current page; `nav` landmark; consider `MetricInput` `showActionButton={false}`.

3. **Breadcrumbs** — 1 P0, 2 P1, 3 P2: Overflow `Button` name; `<nav aria-label>`; forward root ARIA; optional `<ol>`/`<li>`; hide decorative `/`; `aria-current` API.

4. **FileUploader** — 3 P0, 3 P1, 2 P2: Keyboard opens file dialog from focus target; remove/retry names; refactor row `role="button"` nesting; associate label text with file input; progress/error live semantics.

5. **Radio** — 1 P0, 3 P1, 2 P2: Require name or warn; mirror Checkbox `aria-describedby`/`aria-invalid`; stable `id` + label match.

6. **Chip / GenericChip** — 1 P0, 4 P1, 4 P2: Eliminate nested buttons; prefer native `<button>`; `aria-disabled`; ChipGroup forwards `aria-*`; decorative icons.

7. **ChipInput** — 1 P0, 3 P1, 4 P2: Clear-all `aria-label`; remove outer `role="button"` nesting; dedupe `aria-*` on input only; `error` → `aria-invalid`; forward `id`.

8. **EditableInput / EditableChipInput** — 1–2 P0 each, multiple P1: Save/Discard `aria-label`; fix **Editable** nesting; error not hover-only; trigger naming when empty.

9. **Chat** — 3 P0, 3 P1, 4 P2: Fix `aria-labelledby` id; replace faux buttons with `<button>`; action bar focus-within / keyboard.

10. **Navigation (VerticalNavigation)** — 2 P0, 3 P1, 3 P2: Footer and collapsed rail names; `menu.link` as `<a>` where appropriate; submenu `aria-expanded`/`aria-controls`; `aria-current`.

11. **Tabs** — 1 P0, 4 P1, 7 P2: Ref array vs disabled tab index bug; Space activates tab; dismissible nested control; **TabsWrapper** roles vs buttons.

12. **Calendar** — 4 P0, 1 P1, 4 P2, 2 P3: Names on nav buttons; keyboard-focusable day/month/year/header controls; grid roles and `aria-selected`/`aria-current`/`aria-disabled`; weekday row semantics.

13. **DatePicker / DateRangePicker** — 1 P0, 3–4 P1, 4–5 P2: Disclosure/dialog ARIA; default calendar name; focus management; dual-input naming merge; label `htmlFor` (range).

14. **Table / List / Grid** — Table 2 P0, 5 P1, 4 P2; List inherits Grid + no header row. Row keyboard, header icon names, table/grid ARIA, sort state, nested row trigger, forward `aria-label` to Grid, resize label uses display name.

15. **MultiSlider** (incl. Slider & RangeSlider) — MultiSlider 1 P0, 4 P1, 4 P2; RangeSlider extra P0 on dual-thumb naming. Thumb names, label association, track/tick role vs focus, optional `role="group"` for range.

16. **VerificationCodeInput** — 0 P0, 2 P1, 3 P2: Unique ids per cell; inherits Input `aria-invalid`; optional group semantics; `type`/OTP defaults.

17. **InputMask** — 0 P0, 3 P1, 4 P2: Paste `preventDefault` policy; wire HelpText to `aria-describedby`; sentinel `id` handling; inherits Input fixes.

18. **Dropzone** — 0 P0, 1 P1, 4 P2: Name/associate file input; root vs browse keyboard story; decorative SVG `aria-hidden`.

19. **VerticalNav** — 0 P0, 3 P1, 4 P2: `treeitem` on `<a>` + `preventDefault`; tooltip wrapper breaks tree; forward root `aria-*`; `aria-current`; decorative icons.

20. **HorizontalNav** — 0 P0, 0 P1, 4 P2, 2 P3: `aria-labelledby` on nav; list structure; `aria-current` nuance on buttons; icon `aria-hidden`.

21. **Avatar / AvatarGroup** — 0 P0, 8 P1, 8 P2: Tab order on static avatars; `AvatarCount` popup semantics + keyboard + `aria-expanded`; listbox/haspopup mismatch; image `alt` full name.

22. **PageHeader** — 0 P0, 1 P1, 5 P2, 2 P3: Title default `h4` vs `h1`; banner landmark; `aria-label` on generic div; Breadcrumbs slot rollup.

23. **Stepper** — 0 P0, 1 P1, 6 P2, 2 P3: Icon noise in names; `aria-current="step"`; native `<button>`; group label API.

24. **Collapsible** — 0 P0, 4 P1, 4 P2, 1 P3: `aria-expanded`; trigger name; bogus button without `onToggle`; native button; collapsed focus trap doc/fix.

25. **Card** — 0 P0, 5 P1, 2 P2, 4 P3: CardHeader/Body/Footer `BaseHtmlProps`; ActionCard role vs keyboard; `aria-disabled` on custom cards.

26. **Typography / Caption** — 0 P0, 2 P1, 6 P2, 3 P3: Caption `id`/ARIA pass-through and stop stringifying children; Heading level override.

27. **Message / Toast / InlineMessage** — 0 P0, 1 P1, 6 P2, 3 P3: Toast `type="button"` on actions; InlineMessage decorative icon + live region API; root `id` passthrough.

28. **StatusHint bundle** — 0 P0, 5 P1, 6 P2, 4 P3: StatusHint native button or naming; EmptyState `alt`/heading sizes; Placeholder `aria-busy`/`aria-hidden` / reduced motion.

29. **Icon + useAccessibilityProps** — 0 P0, 2 P1, 3 P2, 2 P3: Merge ARIA in interactive branch; native button; types/docs.

30. **Utils bundle** — 0 P0, 3 P1, 6 P2, 3 P3: OutsideClick listener cleanup + stale callback; Divider `BaseHtmlProps`; PopperWrapper docs/animation/reduced motion.

31. **Badge / Pills** — 0 P0, 0 P1, 3 P2, 5 P3: Color-only meaning; Pills pass-through.

32. **Spinner bundle** — 1 P0 (ProgressRing), 4 P1, 2 P2, 1 P3: ProgressRing `role="progressbar"` + values; ProgressBar naming API.

33. **SwitchInput** — 0 P0, 1 P1, 2 P2, 2 P3: Naming requirement doc/dev warn; decorative span; `defaultChecked`+`checked`.

34. **Checkbox / Textarea** — Checkbox 0 P0, 1 P1; Textarea 0 P0, 1 P1: Whitespace label edge case; Textarea forward `readOnly`.

35. **List / KeyValuePair / MetaList** — List inherits Table; MetaList separator `aria-hidden` P1; list roles; KeyValuePair `BaseHtmlProps`.

36. **Layout primitives** — Flex/Row/Column/MdsGrid low risk; **Grid organism** same as Table backlog (dedupe with §14).

---

## Detailed Findings

Findings are listed in **prioritized backlog order** (see above). Each bullet mirrors the subagent schema: **WCAG / basis**, **Severity**, **Scope**, **Repro** (for P0/P1 where applicable), impact, **Suggestion**.

### 1. Input

- **WCAG / basis:** 2.1.1 · **P1** · **Component default** · **Repro:** `info` set; keyboard-only — **Tooltip** uses hover `Popover`. **Impact:** Help content not available equivalently for keyboard/SR. **Suggestion:** Click/focus disclosure, inline `HelpText` + `aria-describedby`, or APG-aligned tooltip trigger.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** Tab to info affordance — focusable `div` around icon, no explicit role/name. **Impact:** Ambiguous control in AT. **Suggestion:** `<button type="button">` or `Icon` with `aria-label` from `info`.

- **WCAG / basis:** 3.3.1 / 4.1.2 · **P1** · **Component default** · **Repro:** `<Input error />` without manual `aria-invalid`. **Impact:** Invalid state not exposed. **Suggestion:** Set `aria-invalid={true}` when `error`; document `aria-describedby` to error copy.

- **WCAG / basis:** 1.3.1 / 4.1.2 / 3.3.2 · **P1** · **Consumer-dependent** · **Repro:** `inlineLabel` only, no `id`/label association. **Impact:** Name not tied to visible label. **Suggestion:** `aria-labelledby` or `<label htmlFor>` / generated ids.

- **WCAG / basis:** 2.1.1 · **P2** · **Component default** · **Repro:** `readOnly` sets `tabIndex={-1}`. **Impact:** Keyboard users cannot focus/copy. **Suggestion:** Default allow focus or prop to opt out.

- **WCAG / basis:** 1.1.1 / Best practice · **P2** · **Consumer-dependent** — Leading decorative icon not `aria-hidden`. **Suggestion:** Default or prop for decorative leading icon.

- **WCAG / basis:** 4.1.2 · **P2** · **Component default** — Clear `Icon` lacks stable `aria-label`. **Suggestion:** Localized “Clear” label.

- **WCAG / basis:** HTML / Best practice · **P3** · **Component default** — Wrapper `role="presentation"` + `onClick` focus. **Suggestion:** Document or pointer-only handlers without misleading role.

### 2. Pagination

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Icon-only nav `Button`s without `aria-label`/`tooltip`. **Impact:** Unnamed buttons. **Suggestion:** Default labels (“First page”, etc.) + override props.

- **WCAG / basis:** 4.1.2 / 3.3.2 · **P1** · **Component default** — Jump `MetricInput` unnamed; suffix text not associated. **Suggestion:** `aria-label` or `aria-labelledby`.

- **WCAG / basis:** 1.3.1 · **P1** · **Component default** — `basic` type hides current page structurally. **Suggestion:** Visible current page and/or `aria-current`.

- **WCAG / basis:** 2.4.3 · **P1** · **Component default** — Mobile flex `order` vs DOM tab order. **Suggestion:** Match DOM to visual order.

- **WCAG / basis:** Best practice · **P2** — Root not `<nav>`; hidden steppers in DOM; `onKeyPress`; optional live region on page change. **Suggestion:** `<nav aria-label="Pagination">`; `showActionButton={false}`; `onKeyDown`; optional `aria-live`.

### 3. Breadcrumbs

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** (`list.length > 4`) · **Repro:** Overflow `Button` icon-only, no `aria-label`. **Impact:** Unnamed trigger. **Suggestion:** `aria-label` + optional `tooltip`; fix `DropdownList` `customTrigger` merge.

- **WCAG / basis:** 1.3.1 / APG · **P1** · **Component default** — Root `<div>`, not `<nav>`. **Suggestion:** `<nav aria-label="Breadcrumb">` (i18n).

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** — `BaseProps` only; cannot set root `aria-*`/`id`. **Suggestion:** Extend root HTML props.

- **WCAG / basis:** 1.3.1 / APG · **P2** — Items as `div`, not list. **Suggestion:** `<ol>`/`<li>` or roles with CSS.

- **WCAG / basis:** Best practice · **P2** — `/` separators announced. **Suggestion:** `aria-hidden` on separators.

- **WCAG / basis:** APG · **P2** · **Consumer-dependent** — No `aria-current` on current crumb. **Suggestion:** API for current segment.

- **WCAG / basis:** Best practice · **P3** — Tooltip on all links when `showTooltip`. **Suggestion:** Truncation-gated tooltip.

### 4. FileUploader

- **WCAG / basis:** 2.1.1 · **P0** · **Component default** · **Repro:** Focus on visible `Button`; file input `tabIndex={-1}` — keyboard does not open picker. **Suggestion:** Single operable pattern (`label`/`input` or programmatic click with one tab stop).

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Remove icon `Button` unnamed. **Suggestion:** `aria-label` with file name.

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Retry icon `Button` unnamed. **Suggestion:** `aria-label` / `tooltip`.

- **WCAG / basis:** 4.1.2 / APG · **P1** · **Component default** — Row `role="button"` wraps inner `<button>`s. **Suggestion:** Remove nested interactive pattern; list + separate buttons.

- **WCAG / basis:** 1.3.1 / 4.1.2 · **P1** — File input not associated with title/format copy. **Suggestion:** `aria-labelledby` / `aria-describedby` with stable ids.

- **WCAG / basis:** 4.1.3 · **P1** / **P2** — Dynamic error/progress without progressbar/live semantics. **Suggestion:** `role="alert"` / `aria-live`; ProgressRing `role="progressbar"`.

- **WCAG / basis:** 1.3.1 · **P2** — List is plain `div`s. **Suggestion:** `ul`/`li` or list roles.

- **WCAG / basis:** 4.1.1 · **P2** · **Consumer-dependent** — Duplicate `id` across instances. **Suggestion:** `useId` or document uniqueness.

### 5. Radio

- **WCAG / basis:** 4.1.2 · **P0** · **Consumer-dependent** · **Repro:** No `label`, no `aria-label`/`aria-labelledby`. **Impact:** Unnamed radio. **Suggestion:** Require name or dev warning.

- **WCAG / basis:** 3.3.2 / 4.1.2 · **P1** · **Component default** — `helpText` not in `aria-describedby`. **Suggestion:** Mirror Checkbox pattern.

- **WCAG / basis:** 3.3.1 / 4.1.2 · **P1** · **Component default** — `error` without `aria-invalid`. **Suggestion:** Set `aria-invalid` when `error`.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Consumer-dependent** — `{...rest}` `id` overwrites input id vs `label htmlFor`. **Suggestion:** Destructure `id`; single source for input + label.

- **WCAG / basis:** Best practice · **P2** — Unstable generated `id` each render. **Suggestion:** `useId` or ref-stable id.

- **WCAG / basis:** Best practice · **P2** — Redundant `tabIndex={0}` on native radio. **Suggestion:** Omit unless required.

- **WCAG / basis:** Best practice · **P3** — Decorative ring span. **Suggestion:** `aria-hidden` if needed.

### 6. Chip / ChipGroup

- **WCAG / basis:** 4.1.2 / HTML · **P0** · **Component default** · **Repro:** `clearButton` — nested `role="button"`. **Suggestion:** Sibling native buttons, no nesting.

- **WCAG / basis:** HTML · **P1** · **Component default** — `div` + `role="button"` vs `<button>`. **Suggestion:** Native `<button>`.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** — `disabled` without `aria-disabled`. **Suggestion:** `aria-disabled` + guards.

- **WCAG / basis:** 2.4.7 · **P1**/`P2` — `outline: none` on disabled chip CSS. **Suggestion:** Avoid removing focus indicator; non-focusable disabled.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** — ChipGroup does not forward per-chip `aria-label`/`aria-labelledby`. **Suggestion:** Forward from `list` items.

- **WCAG / basis:** 1.3.1 · **P2** — ChipGroup no `role="group"` / label. **Suggestion:** Optional group label.

- **WCAG / basis:** HTML · **P2** — `div` label inside `role="button"`. **Suggestion:** `span` + CSS truncation.

- **WCAG / basis:** Best practice · **P2** — Leading icon noise; fixed English “Remove”. **Suggestion:** `aria-hidden` on decorative icon; i18n `clearAriaLabel`.

### 7. ChipInput

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Clear-all `Icon` `role="button"` without name. **Suggestion:** `aria-label` / native button.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Consumer-dependent** — Duplicate `aria-labelledby` on wrapper + input. **Suggestion:** Name primary `<input>` only; non-button wrapper.

- **WCAG / basis:** 4.1.2 / 2.1.1 · **P1** · **Component default** — Outer `role="button"` contains chips, input, clear. **Suggestion:** Remove nested interactive widget pattern.

- **WCAG / basis:** 3.3.1 / 4.1.2 · **P1** — `error` without `aria-invalid`. **Suggestion:** Map `error` on input.

- **WCAG / basis:** 4.1.2 · **P2** — Misleading `role="button"` for text entry. **Suggestion:** Combobox/group pattern per APG.

- **WCAG / basis:** 1.3.1 · **P2** — No forwarded `id` for `htmlFor`. **Suggestion:** `id` / `inputProps`.

- **WCAG / basis:** 3.3.1 · **P2** — Silent `chipValidator` failure. **Suggestion:** Live region or documented callback.

- **WCAG / basis:** Best practice · **P3** — Dynamic chips not announced. **Suggestion:** Optional polite live region.

### 8. EditableInput

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Save/Discard icon `Button`s without `aria-label`/`tooltip`. **Suggestion:** Named actions.

- **WCAG / basis:** 4.1.2 / APG · **P1** · **Component default** — Text input inside **Editable** `role="button"`. **Suggestion:** Separate edit trigger from input subtree.

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** — Empty value + empty placeholder → unnamed trigger. **Suggestion:** Require placeholder or `aria-label`.

- **WCAG / basis:** 3.3.1 / 4.1.3 · **P1** · **Component default** — Error only in hover `Popover`; no `aria-describedby`/`aria-invalid`. **Suggestion:** Inline errors + ARIA wiring.

- **WCAG / basis:** APG · **P2** — No `aria-expanded`. **Suggestion:** `aria-expanded` / `aria-controls` on trigger.

- **WCAG / basis:** 4.1.3 · **P2** — `InlineMessage` not live region. **Suggestion:** `role="alert"` or polite live when dynamic.

- **WCAG / basis:** HTML · **P2** — `role="presentation"` ancestor `onKeyDown`. **Suggestion:** Handlers on input or semantic wrapper.

### 9. EditableChipInput

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Save/Discard unnamed (same as EditableInput). **Suggestion:** `aria-label` / `tooltip`.

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Empty placeholder default → unnamed edit trigger. **Suggestion:** Default copy or required `aria-label`.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** — **Editable** wraps chip buttons and **ChipInput** (nested interactives). **Suggestion:** Restructure **Editable** / composition.

- **WCAG / basis:** APG · **P2** — No `aria-expanded` for edit mode. **Suggestion:** Wire disclosure state.

- **WCAG / basis:** 4.1.2 · **P2** · **Consumer-dependent** — Root `aria-*` on outer `div` vs **Editable** focus target. **Suggestion:** Forward naming to focusable trigger.

- **WCAG / basis:** 4.1.2 · **P2** — **ChipInput** naming optional via `chipInputOptions`. **Suggestion:** Document required ARIA.

### 10. Chat

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** `aria-labelledby="chat-bubble-header"` with no matching `id`. **Impact:** Broken group name. **Suggestion:** Real id, `aria-label`, or drop `role="group"`.

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Component default** — **NewMessage** `role="button"` without keyboard/focus. **Suggestion:** Native `<button>`.

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Component default** — **UnreadMessage** inner `span` `role="button"` not keyboard-accessible; `...rest` on outer `div`. **Suggestion:** Single `<button>`.

- **WCAG / basis:** 1.3.1 / 3.3.2 / 4.1.2 · **P1** · **Component default** — **ChatInput** no label association. **Suggestion:** Label API or required `aria-label`.

- **WCAG / basis:** 2.1.1 · **P1** · **Component default** — Action bar hover-only. **Suggestion:** `:focus-within` / keyboard path.

- **WCAG / basis:** Best practice · **P2** — Chat root no landmark/log contract; **DateSeparator** `role="separator"` nuance; toolbar APG; live region mixed with button on **NewMessage**. **Suggestion:** Document composition; separate status from button.

### 11. Navigation

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Footer `Icon` `onClick` unnamed button. **Suggestion:** `aria-label` + `aria-expanded`.

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** (`expanded={false}`) — Collapsed rail items empty or icon-only without human name. **Suggestion:** Always `aria-label` from `menu.label`.

- **WCAG / basis:** 4.1.2 / 2.4.4 · **P1** · **Consumer-dependent** — Vertical ignores `menu.link` / no `href`. **Suggestion:** Render `Link`/`<a>` when `link` set.

- **WCAG / basis:** 4.1.2 / APG · **P1** — Submenu parents lack `aria-expanded`/`aria-controls`. **Suggestion:** Disclosure wiring + submenu `id`.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** — No `aria-current` on active vertical item. **Suggestion:** Match **HorizontalNav**.

- **WCAG / basis:** HTML · **P2** — `div role="button"` vs native elements; flat structure vs list. **Suggestion:** `<button>`/`<a>`; optional list markup.

- **WCAG / basis:** APG · **P2** — Footer toggle no `aria-expanded`. **Suggestion:** `aria-expanded` + optional `aria-controls`.

### 12. Tabs

- **WCAG / basis:** 2.1.1 · **P0** · **Component default** · **Repro:** Disabled tab in middle; ArrowLeft uses compressed `tabRefs` index vs visual index — focus wrong target. **Suggestion:** Fixed-length refs; skip disabled by index walk.

- **WCAG / basis:** 2.1.1 / APG · **P1** — Space does not activate tab (Enter only). **Suggestion:** Handle Space with `preventDefault`.

- **WCAG / basis:** 4.1.2 / 2.1.1 · **P1** — Dismissible tab: nested Icon `button` inside `tab`; dismiss icon unnamed. **Suggestion:** Avoid nesting; name dismiss.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** — **TabsWrapper** headers `role="button"` only, no tab semantics/selected state. **Suggestion:** Align with APG tabs or document as non-tab switcher.

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** — Non-string `label` → missing `aria-label`. **Suggestion:** Forward ARIA or tighten types.

- **WCAG / basis:** 2.1.1 / APG · **P2** — Arrows without `preventDefault`; `tabs` prop-only mode no `tabpanel`; unnamed `tablist`; no Home/End; roving tabindex optional; `Tab.name` detection fragile; redundant `aria-label`; shared `aria-controls` id. **Suggestion:** APG polish per raw report.

### 13. Calendar

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Prev/next icon `Button`s unnamed. **Suggestion:** View-aware `aria-label`/`tooltip`.

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Component default** — Date cells `Text`/`span` click-only, not focusable. **Suggestion:** `<button>` per day or grid + roving tabindex.

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** — Month/year tiles `div onClick` only. **Suggestion:** Focusable controls + keyboard.

- **WCAG / basis:** 2.1.1 · **P0** — Header jump `div onClick` only (`jumpView`). **Suggestion:** Real buttons with names.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** — No `aria-selected`/`aria-current`/`aria-disabled` on cells; disabled via CSS only. **Suggestion:** Map visual state to ARIA.

- **WCAG / basis:** 1.3.1 / APG · **P2** — Weekdays not `columnheader` in grid. **Suggestion:** Header row roles when using `grid`.

- **WCAG / basis:** 4.1.2 · **P2** — Optional naming; multi-month unnamed panels. **Suggestion:** Default/required labels per panel.

- **WCAG / basis:** Best practice · **P2** — Decorative chevron `Icon`; empty event dot `span`. **Suggestion:** `aria-hidden` or meaningful label on day.

- **WCAG / basis:** 1.3.1 · **P3** — **Heading** in widget affects outline. **Suggestion:** Non-heading typography or grouped label.

### 14. DatePicker

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Component default** — Inherited Calendar keyboard gaps. **Suggestion:** Fix **Calendar**.

- **WCAG / basis:** 4.1.2 / APG · **P1** — Trigger vs popover: no `aria-expanded`/`aria-haspopup`/`aria-controls`; popover not `dialog`. **Suggestion:** APG datepicker / disclosure wiring.

- **WCAG / basis:** 1.3.1 / 3.3.2 · **P1** · **Repro:** `id="parent-DatePicker"` stripped on inner input (**InputMask**). **Impact:** `htmlFor` broken. **Suggestion:** Real unique `id` + documented labeling.

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** — Calendar unnamed if props omitted. **Suggestion:** Default `aria-label`.

- **WCAG / basis:** 2.4.3 / APG · **P2** — Focus not moved into dialog; no trap/return. **Suggestion:** Documented focus model.

- **WCAG / basis:** APG · **P2** — Popover not modal dialog semantics. **Suggestion:** `role="dialog"` + `aria-modal` if applicable.

- **WCAG / basis:** 3.3.1 / 4.1.3 · **P2** — Validation via **InputMask**/**InlineMessage** without live wiring. **Suggestion:** `aria-invalid` + live errors.

- **WCAG / basis:** HTML · **P2** — “Today” **Chip** as `div` button. **Suggestion:** Native `<button>`.

- **WCAG / basis:** Best practice · **P2** — `withInput={false}` bare calendar. **Suggestion:** Document required shell.

### 15. DateRangePicker

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** — Inherited **Calendar**. **Suggestion:** Same as DatePicker.

- **WCAG / basis:** 4.1.2 / APG · **P1** — Popover/trigger relationship missing (same theme as DatePicker). **Suggestion:** Central popover ARIA.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** — Dual input: root `aria-label` not merged into start/end `aria-label`. **Suggestion:** Merge or document.

- **WCAG / basis:** 3.3.2 / 1.3.1 · **P1** — Visible **Label** without `htmlFor`/ids by default. **Suggestion:** Generated ids + `htmlFor`.

- **WCAG / basis:** 4.1.2 · **P2** — Optional calendar naming; range state color-only / lacks `aria-selected` text (via **Calendar**). **Suggestion:** Fix grid + range announcements.

- **WCAG / basis:** 4.1.3 · **P2** — No live region for completion/errors. **Suggestion:** Polite status or focus move.

- **WCAG / basis:** 4.1.2 · **P2** — Inherited **Input** icon/clear naming. **Suggestion:** **Input** fixes.

### 16. Table

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Component default** (`type="resource"`) — Row `div` `onClick` only, not focusable. **Suggestion:** Keyboard-operable row pattern per APG.

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** — Column filter / more menu icon `Button`s unnamed. **Suggestion:** Labels with column display name.

- **WCAG / basis:** 1.3.1 / APG · **P1** — Div grid without `table`/`grid` roles and header associations. **Suggestion:** Native `<table>` or full ARIA grid + keyboard.

- **WCAG / basis:** 4.1.2 / APG · **P1** — Sort control: no `aria-sort`/pressed/name with direction. **Suggestion:** Expose sort state in name or `aria-sort` on columnheader.

- **WCAG / basis:** 4.1.2 · **P1** — Nested row expand **Icon** unnamed, no `aria-expanded`. **Suggestion:** Named control + expanded state.

- **WCAG / basis:** 4.1.2 · **P1** — Outer `aria-label` not forwarded to **Grid** root. **Suggestion:** Forward or single wrapper strategy.

- **WCAG / basis:** 4.1.2 · **P1** — Resize grip label uses column key not `displayName`. **Suggestion:** Human-readable name.

- **WCAG / basis:** Best practice · **P2** — Unnamed table when props omitted; drag-only column reorder; decorative sort icons; virtualization + roles; toolbar not landmark; checkbox labeling verify. **Suggestion:** Per raw report.

### 17. List

- **WCAG / basis:** N/A · **P3** — Thin wrapper over **Table** (`showHead={false}`). **Impact:** Fixes live in **Grid**/**Table**. **Suggestion:** Cross-link docs; migrate to Listbox per deprecation note.

- **WCAG / basis:** 1.3.1 / APG · **P1** · **Component default** — No header row — weaker column context. **Suggestion:** ARIA column headers or first-row pattern.

- **WCAG / basis:** 1.3.1 / APG · **P1** — Same div grid as **Table** (inherited).

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** · **Consumer-dependent** — `type="resource"` + `onRowClick` inherits Grid row gap.

- **WCAG / basis:** 4.1.2 · **P1** — `Table` → `Grid` `aria-label` forward issue applies.

### 18. MultiSlider / Slider / RangeSlider

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** (**MultiSlider** / **RangeSlider**) — Thumbs lack accessible **name**; `aria-valuetext` is numeric label only. **Suggestion:** `aria-labelledby`/`aria-label` per thumb + group label.

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** (**Slider** / **MultiSlider**) — Visible `Label` not associated with thumb(s). **Suggestion:** Ids + `aria-labelledby`.

- **WCAG / basis:** 4.1.2 · **P1** (**RangeSlider** / **MultiSlider**) — Two thumbs not distinguishable by name. **Suggestion:** “Start”/“End” or consumer API.

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P1** — Track/ticks: `role="button"`, Enter/Space, but `tabIndex` commented out. **Suggestion:** Focusable + named, or drop button role.

- **WCAG / basis:** 4.1.2 · **P2** — Misleading `role="button"` on non-focusable track/ticks. **Suggestion:** Align role with behavior.

- **WCAG / basis:** 4.1.2 · **P2** (**Slider**) — No ARIA pass-through to **Handle**. **Suggestion:** `handleProps` / forward subset.

- **WCAG / basis:** 1.3.1 / APG · **P2** (**RangeSlider**) — No `role="group"` for range. **Suggestion:** Group + `aria-labelledby`.

- **WCAG / basis:** Best practice · **P2**–**P3** — Tooltip duplicate; `aria-orientation`; **Handle** `onRelease` stale value (**MultiSlider**). **Suggestion:** Per raw reports.

### 19. VerificationCodeInput

- **WCAG / basis:** 4.1.1 / 4.1.2 · **P1** · **Consumer-dependent** · **Repro:** Single `id` on molecule duplicated on each cell. **Suggestion:** Per-cell ids or `baseId`; group label pattern.

- **WCAG / basis:** 3.3.1 / 4.1.2 · **P1** — `error` without `aria-invalid` (inherits **Input**). **Suggestion:** Fix **Input** + optional shared `aria-describedby`.

- **WCAG / basis:** 1.3.1 / APG · **P2** — Root not `group`/`fieldset` by default. **Suggestion:** Optional built-in grouping.

- **WCAG / basis:** 4.1.2 / HTML · **P2** — Default `type="number"` for OTP. **Suggestion:** `text` + `inputMode="numeric"` where appropriate.

- **WCAG / basis:** 1.3.5 · **P2** — `autoComplete` omitted from API. **Suggestion:** Expose `one-time-code` pattern.

- **WCAG / basis:** HTML · **P3** — No `maxLength={1}` per cell. **Suggestion:** Add with paste override.

### 20. InputMask

- **WCAG / basis:** Best practice / project rule · **P1** · **Component default** — `onPaste` always `preventDefault` first. **Suggestion:** Only prevent when handling paste.

- **WCAG / basis:** 3.3.2 / 4.1.2 · **P1** — `caption`/`helpText` siblings not in `aria-describedby`. **Suggestion:** Generate ids + merge `aria-describedby`.

- **WCAG / basis:** 3.3.1 / 4.1.2 · **P1** — Inherits **Input** `aria-invalid`/clear/`info` gaps. **Suggestion:** Fix **Input**.

- **WCAG / basis:** 1.3.1 / 4.1.2 · **P2** — Sentinel ids drop real input `id`. **Suggestion:** Explicit API vs magic strings.

- **WCAG / basis:** 4.1.2 · **P2** — Mask as `value` on focus may confuse AT. **Suggestion:** `placeholder` + describedby for format.

- **WCAG / basis:** 1.3.5 · **P2** — Forced `autoComplete="off"`. **Suggestion:** Allow prop / smart default.

### 21. Dropzone

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** — Hidden file input unnamed / not tied to instructions. **Suggestion:** `aria-label` or `aria-labelledby`/`describedby`.

- **WCAG / basis:** 2.1.1 / Best practice · **P2** — **DropzoneBase** `getRootProps` omits keyboard/focus callbacks (dead code path). **Suggestion:** Wire or remove; document browse-only keyboard path.

- **WCAG / basis:** Best practice · **P2** — Root click vs browse-only pointer parity. **Suggestion:** Whole-surface `label` or `onClick` open.

- **WCAG / basis:** 1.1.1 · **P2** — **DropzoneIcon** SVG without `aria-hidden`. **Suggestion:** Hide decorative SVGs.

- **WCAG / basis:** 4.1.3 · **P3** — Drag states without live region. **Suggestion:** Optional assertive/polite regions.

### 22. VerticalNav

- **WCAG / basis:** 4.1.2 / 2.1.1 / HTML · **P1** · **Component default** — `role="treeitem"` on `<a>` + universal `preventDefault` — link semantics lost; native link behaviors broken. **Suggestion:** Pick tree **or** native nav links; avoid both.

- **WCAG / basis:** 4.1.2 / APG · **P1** — Tooltip **Popover** inserts wrapper between `tree` and `treeitem`. **Suggestion:** Tooltip without wrapper or drop `role="tree"`.

- **WCAG / basis:** 1.3.1 / 4.1.2 · **P1** — Root `aria-label`/`aria-labelledby` not forwardable (**extractBaseProps**). **Suggestion:** Extend API.

- **WCAG / basis:** Best practice · **P2** — No `aria-current` on active item; icon/chevron noise; section labels without `group`/`aria-labelledby`; submenu parent resolution via dotted `name` string. **Suggestion:** Data-driven hierarchy; decorative `aria-hidden`.

- **WCAG / basis:** 2.4.7 · **P3** — `:focus` vs `:focus-visible` in CSS. **Suggestion:** `focus-visible` token ring.

### 23. HorizontalNav

- **WCAG / basis:** 1.3.1 / 4.1.2 · **P2** · **Component default** — Only `aria-label` on `<nav>`, no `aria-labelledby`/id. **Suggestion:** Extend props.

- **WCAG / basis:** 1.3.1 · **P2** — Flat `a`/`button` list, no list markup. **Suggestion:** Optional `ul`/`li`.

- **WCAG / basis:** ARIA · **P2** — `aria-current="page"` on `<button>` items. **Suggestion:** `true` vs `page` policy.

- **WCAG / basis:** 1.1.1 · **P2** — Leading `Icon` not decorative. **Suggestion:** `aria-hidden` when label suffices.

- **WCAG / basis:** 1.3.1 · **P3** — Duplicate default `aria-label` across instances. **Suggestion:** Document unique labels.

### 24. Avatar / AvatarGroup

- **WCAG / basis:** 2.4.3 / 4.1.2 · **P1** · **Component default** — Static avatar `tabIndex={0}` + `role="img"`. **Suggestion:** Non-focusable unless interactive.

- **WCAG / basis:** 4.1.2 / 2.1.1 · **P1** · **Consumer-dependent** — `tabIndex` forces `role="button"` without key handlers. **Suggestion:** Interactive mode with `<button>` or explicit keyboard support.

- **WCAG / basis:** 1.1.1 / HTML · **P1** — `role="img"` wrapper + inner `<img>` double semantics; **Avatar.Image** `alt={firstName}` only. **Suggestion:** Single naming source; full-name `alt`.

- **WCAG / basis:** 4.1.2 / APG · **P1** — **AvatarCount** `aria-haspopup="listbox"` vs plain `ul` popover; `role="button"` without Enter/Space; no `aria-expanded`. **Suggestion:** `dialog`/`true` haspopup; `<button>`; wire expanded state (**Popover**).

- **WCAG / basis:** Best practice · **P2** — Initials + `aria-label` duplication; presence dot; status slot; placeholder **Icon**; weak “+N” name; stacked `div`s not list. **Suggestion:** Per raw report.

### 25. PageHeader

- **WCAG / basis:** 1.3.1 · **P1** · **Component default** — Title **Heading** default size → **`h4`** for primary page title. **Suggestion:** Default `h1` or `titleAs` API.

- **WCAG / basis:** 1.3.1 / Best practice · **P2** — No `<header>`/`role="banner"`. **Suggestion:** Semantic banner when appropriate.

- **WCAG / basis:** 4.1.2 · **P2** — `aria-label` on generic `div` without landmark role. **Suggestion:** Pair with `header`/region role.

- **WCAG / basis:** 1.3.1 / APG · **P2** — Breadcrumbs slot not `<nav>` (rollup **Breadcrumbs**). **Suggestion:** Fix **Breadcrumbs**.

- **WCAG / basis:** HTML · **P2** — **Nav** wrapper `div` around slotted nav. **Suggestion:** Reduce wrappers / document.

- **WCAG / basis:** Best practice · **P3** — Limited `extractBaseProps`; badge vs title relationship. **Suggestion:** `headerProps`; `aria-describedby` for badge.

### 26. Stepper

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** — Empty `label` leaves weak step name (icon noise). **Suggestion:** Require labels or synthesize names.

- **WCAG / basis:** 4.1.2 / Best practice · **P2** — Step **Icon** not `aria-hidden`; no `aria-current="step"`; completed state not programmatic; `div role="button"`; fixed `aria-label="Steps"` only; ArrowLeft/Right not RTL-aware. **Suggestion:** Native `<button>`; state in name or ARIA; group label API; RTL.

- **WCAG / basis:** APG · **P3** — `aria-posinset`/`setsize`; duplicate labels in stories. **Suggestion:** Document unique labels.

### 27. Collapsible

- **WCAG / basis:** 4.1.2 / APG · **P1** · **Component default** — Footer trigger missing `aria-expanded`. **Suggestion:** `aria-expanded={expanded}`.

- **WCAG / basis:** 4.1.2 · **P1** — Trigger name is **Icon** glyph only. **Suggestion:** Default `aria-label` + `aria-hidden` on icon.

- **WCAG / basis:** 4.1.2 / 2.1.1 · **P1** · **Consumer-dependent** — `withTrigger` + no `onToggle` → inert “button”. **Suggestion:** Hide trigger or `aria-disabled` + `tabIndex={-1}`.

- **WCAG / basis:** 2.1.1 / APG · **P1** · **Consumer-dependent** — `withTrigger={false}` + default `hoverable` — keyboard cannot expand. **Suggestion:** Document external trigger or disable hover-only path.

- **WCAG / basis:** HTML · **P2** — `div role="button"` vs `<button>`. **Suggestion:** Native button styles.

- **WCAG / basis:** Best practice · **P2** — No `aria-*`/`id` passthrough; collapsed `hoverable` + focusable children clipping. **Suggestion:** `inert`/`aria-hidden` + tab management when collapsed.

- **WCAG / basis:** 2.3.3 · **P3** — Width transition without `prefers-reduced-motion`. **Suggestion:** Media query.

### 28. Card

- **WCAG / basis:** 4.1.2 / HTML · **P1** · **Component default** — **CardHeader**/**Body**/**Footer** only `extractBaseProps` — no `id`/`aria-*` on roots. **Suggestion:** `BaseHtmlProps` like **Card**.

- **WCAG / basis:** 1.3.1 · **P3** — Subcomponents use `div` vs `<header>`/`<footer>`. **Suggestion:** Semantic tags if layout allows.

- **WCAG / basis:** APG / 4.1.2 · **P1** (**ActionCard**) — `role="link"` without `href` for in-app `onClick`. **Suggestion:** Real `<a>` when navigating, else `role="button"`.

- **WCAG / basis:** 2.1.1 / APG · **P1** (**ActionCard**) — Enter only, not Space. **Suggestion:** Space + Enter if button.

- **WCAG / basis:** 4.1.2 · **P1** (**ActionCard** / **SelectionCard**) — `disabled` without `aria-disabled`. **Suggestion:** `aria-disabled`.

- **WCAG / basis:** Best practice · **P2** — `...rest` override footgun (**ActionCard**); **SelectionCard** overlay `aria-hidden`; disabled `outline: none` CSS. **Suggestion:** Per raw report.

- **WCAG / basis:** Best practice · **P2** — **Card** optional landmark pattern undocumented. **Suggestion:** Docs for `role="region"` + `aria-labelledby`.

### 29. Typography (Text, Heading, Subheading, Paragraph, Caption)

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** (**Caption**) — No `BaseHtmlProps`; cannot set `id` for `aria-describedby`. **Suggestion:** Extend props; forward to root.

- **WCAG / basis:** 1.3.1 · **P1** · **Component default** (**Caption**) — `` `${children}` `` stringifies **ReactNode**. **Impact:** Loses semantics (`[object Object]`). **Suggestion:** Render `children` properly.

- **WCAG / basis:** 1.1.1 · **P2** (**Caption**) — Error **Icon** not `aria-hidden`. **Suggestion:** Hide when text repeats meaning.

- **WCAG / basis:** HTML / TS · **P2** — **GenericText** `componentType: string`; **Paragraph** allows block children in `<p>`. **Suggestion:** Narrow types / docs.

- **WCAG / basis:** 1.3.1 · **P2** — **Heading** visual size locks semantic level; **Subheading** always `h4` + redundant `aria-level`. **Suggestion:** `as`/level override.

### 30. Message / InlineMessage / Toast

- **WCAG / basis:** 3.2.2 / HTML · **P1** (**Toast**) · **Component default** · **Repro:** `ActionButton` `<button>` without `type` inside `<form>` submits. **Suggestion:** `type="button"`.

- **WCAG / basis:** 4.1.3 / Best practice · **P2** (**Message**) — `status`/`alert` roles; optional explicit `aria-live`; `warning` assertive like `alert`. **Suggestion:** Tune politeness; document.

- **WCAG / basis:** 4.1.2 · **P2** — **Message**/**InlineMessage** roots lack `id`/ARIA pass-through (**BaseProps** only). **Suggestion:** Allow stable ids for `aria-describedby`.

- **WCAG / basis:** 1.1.1 · **P2** (**InlineMessage**) — Leading icon not `aria-hidden`. **Suggestion:** Match **Message**.

- **WCAG / basis:** 4.1.3 · **P2** (**InlineMessage**) — Dynamic errors may need live region. **Suggestion:** Optional `live` prop.

- **WCAG / basis:** HTML · **P2** (**Toast**) — Close as `<i role="button">`. **Suggestion:** Real `<button>`.

### 31. StatusHint bundle (StatusHint, EmptyState, Placeholder)

- **WCAG / basis:** 4.1.2 / HTML · **P1** (**StatusHint**) · **Repro:** `onClick` + non-text children — `div` `role="button"` may lack name; no ARIA pass-through. **Suggestion:** `<button>` or required `aria-label`.

- **WCAG / basis:** 1.1.1 · **P1** (**EmptyState**) — **Image** without required `alt` when `src` set. **Suggestion:** Require `alt` or decorative contract.

- **WCAG / basis:** 1.3.1 · **P1** (**EmptyState**) — `compressed`/`tight` title uses **Text** not heading. **Suggestion:** Keep heading styled via CSS.

- **WCAG / basis:** 4.1.3 / Best practice · **P1** (**Placeholder**) — No `aria-busy`/`aria-hidden` on skeleton. **Suggestion:** Hide from AT + document parent `aria-busy`.

- **WCAG / basis:** 2.3.3 · **P2** (**Placeholder**) — Shimmer animation without `prefers-reduced-motion`. **Suggestion:** Respect reduced motion.

- **WCAG / basis:** 4.1.2 · **P2** — Various `extractBaseProps`-only surfaces; legacy `imageSrc` `alt`; region optional on **EmptyState**. **Suggestion:** Per raw report.

### 32. Icon + useAccessibilityProps

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** · **Repro:** `onClick` + `aria-labelledby`/`aria-describedby`/`aria-hidden` — not merged in interactive branch. **Suggestion:** Pass through all naming/description attrs with `onClick`.

- **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent** — Icon-only `onClick` without `aria-label`. **Suggestion:** Require name or lint; fix (1) enables `aria-labelledby`.

- **WCAG / basis:** 4.1.2 / HTML · **P2** — `children` branch skips `useAccessibilityProps`. **Suggestion:** Consistent behavior or restricted API.

- **WCAG / basis:** HTML / APG · **P2** — `<i role="button">` vs native `<button>`. **Suggestion:** Wrap glyph in `<button>` with `aria-hidden` decorative span.

- **WCAG / basis:** 1.1.1 · **P2** — Decorative glyphs not default hidden. **Suggestion:** Docs / optional `decorative` prop.

### 33. Utils (Divider, Backdrop, OutsideClick, PopperWrapper)

- **WCAG / basis:** Non-WCAG / indirect 2.4.3 · **P1** (**OutsideClick**) — `removeEventListener` missing capture flag. **Suggestion:** Match `addEventListener` capture.

- **WCAG / basis:** 2.4.3 / 3.2.4 · **P1** (**OutsideClick**) — Stale `onOutsideClick` in empty deps. **Suggestion:** Update deps or ref callback.

- **WCAG / basis:** 1.3.1 / Best practice · **P1** (**Divider**) — Cannot pass `aria-hidden`/`role="none"` for decorative `hr`. **Suggestion:** `BaseHtmlProps` on `<hr>`.

- **WCAG / basis:** APG / 2.1.1 · **P2** (**PopperWrapper**) — Extra wrapper div; hover mode focus vs portaled content; z-index stack; injected animation without reduced motion. **Suggestion:** Document trigger ARIA; click mode for rich content; motion prefs.

- **WCAG / basis:** Best practice · **P2** (**Backdrop**) — No `aria-*` pass-through; body scroll lock side effects. **Suggestion:** Optional props; modal coordination docs.

### 34. Badge / Pills

- **WCAG / basis:** 1.4.1 · **P2** · **Consumer-dependent** — Meaning from `appearance`/color only with generic children. **Suggestion:** Redundant text or `aria-label`.

- **WCAG / basis:** 4.1.2 · **P2** (**Pills**) — No `BaseHtmlProps` / `...rest`. **Suggestion:** Match **Badge** pass-through.

- **WCAG / basis:** APG / 4.1.2 · **P3** (**Pills**) — `role="status"` only when `aria-label` set. **Suggestion:** Explicit live-region prop.

### 35. Spinner bundle (Spinner, ProgressBar, ProgressRing, Meter)

- **WCAG / basis:** 4.1.2 · **P0** (**ProgressRing**) · **Repro:** Determinate ring has no `role="progressbar"` or value attrs. **Suggestion:** `role="progressbar"` + min/max/now/text + naming.

- **WCAG / basis:** 4.1.2 · **P1** (**ProgressBar**) — No `aria-label`/`aria-labelledby` API. **Suggestion:** Naming props; indeterminate named.

- **WCAG / basis:** 4.1.2 · **P1** (**Meter**) — Optional `ariaLabel`; visible label not `aria-labelledby` when `showLabel`. **Suggestion:** Wire label id.

- **WCAG / basis:** Best practice · **P2** — Spinner redundant `aria-live`; Meter duplicate value text; Meter erroneous `type` in `defaultProps`. **Suggestion:** Polish per raw report.

### 36. SwitchInput

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Consumer-dependent** — Unlabeled switch without `aria-label`/`Label` pairing. **Suggestion:** Docs / dev warning.

- **WCAG / basis:** HTML · **P2** — `checked` + `defaultChecked` both passed. **Suggestion:** Controlled-only DOM attrs.

- **WCAG / basis:** Best practice · **P2** — Decorative track span. **Suggestion:** `aria-hidden`.

- **WCAG / basis:** APG · **P3** — Enter toggles in addition to Space. **Suggestion:** Document intentional keys.

### 37. Checkbox

- **WCAG / basis:** 4.1.2 · **P1** · **Component default** · **Repro:** Whitespace-only `label` or no label/`aria-*` — unnamed control. **Suggestion:** Trim whitespace; require name.

- **WCAG / basis:** Best practice · **P2** — Unstable id when `id` omitted; decorative SVG; `aria-invalid` without error text id. **Suggestion:** Stable id; `aria-hidden` on glyph; document `aria-describedby`.

### 38. Textarea

- **WCAG / basis:** 4.1.2 / 1.3.1 · **P1** · **Component default** · **Repro:** `readOnly` prop not forwarded to DOM `readonly`. **Suggestion:** Forward `readOnly`.

- **WCAG / basis:** 4.1.2 · **P2** — Consumer `aria-invalid` can override `error` via spread order. **Suggestion:** Document merge precedence.

- **WCAG / basis:** 4.1.2 / 3.3.2 · **P3** — Bare usage / error description wiring consumer-dependent. **Suggestion:** Docs.

### 39. List — KeyValuePair / MetaList (from list-audit)

- **WCAG / basis:** 1.1.1 / 4.1.2 · **P1** (**MetaList**) · **Component default** — Separator **Icon** not `aria-hidden` — noise between items. **Suggestion:** `aria-hidden` on separators.

- **WCAG / basis:** 1.3.1 · **P2** (**MetaList**) — No list semantics (`ul`/`role="list"`). **Suggestion:** List structure.

- **WCAG / basis:** 4.1.2 · **P2** (**MetaList**) — `extractBaseProps` only on root. **Suggestion:** `BaseHtmlProps`.

- **WCAG / basis:** 4.1.2 · **P2** (**KeyValuePair**) — No `BaseHtmlProps` on `dl`/`dt`/`dd`. **Suggestion:** Forward ids/ARIA.

- **WCAG / basis:** 1.3.1 · **P2** — Invalid `<dl>` children risk; icon-only key without label. **Suggestion:** Document composition.

### 40. Layout (Flex, Row, Column, MdsGrid, Grid organism)

- **WCAG / basis:** 2.1.1 / 4.1.2 · **P0** (**Grid**) — Same as **Table** §16: resource row click-only; unnamed filter/menu triggers (**Cell**).

- **WCAG / basis:** 1.3.1 / APG · **P1** (**Grid**) — Div scaffold without table/grid roles; sort state; nested expand; root HTML props narrow; resize label uses key. **Suggestion:** Consolidate with **Table** audit — single remediation track.

- **WCAG / basis:** Best practice · **P2** (**Flex**/**MdsGrid**) — Responsive style maps may only apply `xs` slice; indirect reading-order risk. **Suggestion:** Align with layout spec.

- **WCAG / basis:** HTML · **P3** — **Row**/**Column** naming vs table rows — docs only. **Suggestion:** Clarify layout vs data table.

---

## Maintenance

- **Source raw reports:** `aria-audits/raw-reports/*.md`  
- **Orchestration:** `.cursor/skills/use-aria-auditors/SKILL.md`  
- **When new raw reports land** (`textField`, `metricInput`, `timePicker`, `forms`, `actionCard`): re-run aggregation and update counts and detailed sections.

---

*End of Phase 2 & 3 aggregated report.*

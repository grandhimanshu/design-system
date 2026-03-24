# Stepper — structural ARIA / semantic audit

## Component overview

- **APG pattern:** Closest alignment is a **composite widget with roving `tabindex`** (similar in spirit to [Toolbar](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/) keyboard model) applied to a **linear step indicator / wizard-style control**. There is no dedicated WAI-ARIA APG pattern named “Stepper”; breadcrumb-style guidance for **current step** (`aria-current`) and native **ordered lists + buttons** are relevant comparators.
- **Implementation files:**
  - `core/components/molecules/stepper/index.tsx` — re-exports `Stepper` and types.
  - `core/components/molecules/stepper/Stepper.tsx` — root `role="group"`, maps `steps`, computes disabled/skipped state, **roving tab stop** (`isTabStop`), **ArrowLeft/ArrowRight/Home/End** focus management via refs.
  - `core/components/molecules/stepper/Step.tsx` — each step: `div` with `role="button"`, `tabIndex`, `aria-disabled`, click + **Enter/Space** activation, delegates arrow keys to parent.
  - Styling: `css/src/components/stepper.module.css` (layout only for this audit).
- **Stories / tests (usage context):** `core/components/molecules/stepper/__stories__/`, `core/components/molecules/stepper/__tests__/Stepper.test.tsx`.

### Root cause / rollup

Several naming and semantics gaps share one structural pattern: **each step is a single `role="button"` container** that includes a **Material `Icon` rendered as `<i>{name}</i>` without `aria-hidden`**, while **progress/completion is communicated visually** (check vs circle + text styles) **without consistent programmatic state**. Using **native `<button>` / ordered list semantics** would reduce duplicate work and clarify the accessibility tree.

---

## Findings (severity order)

### 1. Decorative step icons can pollute or dominate the step control’s accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (meaningful, predictable naming).
- **Severity:** **P2**
- **Scope:** **Component default** for every step that renders `Icon` (always, in current `Step.tsx`).
- **Issue + impact:** `Icon` outputs a ligature/text node for the Material symbol name (e.g. `check_circle`, `radio_button_unchecked`) inside `<i>` and `Step` does **not** pass `aria-hidden` on the icon. That text can be folded into the **accessible name** of the parent `role="button"` alongside the visible label, producing redundant or confusing announcements (e.g. glyph names before/after the real step title).
- **Suggestion:** Pass **`aria-hidden={true}`** (or equivalent) on the step `Icon` when the label carries the meaning, or switch to a presentation-only icon path that does not expose ligature text to the name calculation.

### 2. Empty or missing visible label yields a weak or non-human step name

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when a step’s `label` is `""` or otherwise omitted from the tree (`{label && (…)}` skips `Text` when `label` is falsy).
- **Repro:** Use `steps={[{ label: '', value: '1' }, …]}`; inspect the step node — the **primary name may reduce to icon-related text** (see finding 1) rather than a meaningful step title.
- **Issue + impact:** Screen reader users may not get a distinguishable name per step; activation is still possible but **purpose is unclear**, which is a name/value gap for a custom button.
- **Suggestion:** Require non-empty labels in types/docs, or synthesize an accessible name (e.g. `aria-label` from `value` + position, or `aria-labelledby`) when `label` is empty.

### 3. Active step is not marked with `aria-current="step"`

- **WCAG / basis:** 1.3.1 Info and Relationships; **APG** (breadcrumb / “current” location patterns).
- **Severity:** **P2**
- **Scope:** **Component default** whenever `active` identifies the current step in a process.
- **Issue + impact:** Assistive technologies can infer “active” only indirectly (tab stop + `aria-disabled` on others). **`aria-current="step"`** on the active step is the standard hook for “current step in a process” and improves orientation in multi-step flows.
- **Suggestion:** On the step where `active === true`, set **`aria-current="step"`**; ensure it is removed/absent on inactive steps (only one current step).

### 4. Completed vs incomplete (and skipped) progress is not programmatically exposed

- **WCAG / basis:** 1.3.1 Info and Relationships; 4.1.2 Name, Role, Value (state where applicable).
- **Severity:** **P2**
- **Scope:** **Component default** — `completed` / `active` / skip logic exist in React but are not mapped to ARIA state on the step control (beyond disabled affordance).
- **Issue + impact:** Sighted users get check vs circle and styling; AT users hear **“button” + label** without a consistent **“completed” / “current” / “upcoming”** (or skipped) state. Color/icon alone is partly redundant visually but **state is not serialized** for AT the way `aria-checked`/`aria-selected` would be for other patterns.
- **Suggestion:** Expose state in the **accessible name** (concise suffix) and/or **aria-label** composition, or adopt a documented pattern (e.g. list of `button` elements with **`aria-current`** for current and text for completed) so state is not icon-only in the accessibility tree.

### 5. Steps are `div` + `role="button"` instead of native `<button>`

- **WCAG / basis:** 4.1.2 Name, Role, Value; **HTML** (prefer native interactive elements).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Enter/Space and roving tabindex are implemented, so **keyboard operability is largely preserved**, but native `<button>` gives correct **disabled semantics**, default **Space/Enter** behavior, and simpler **role/name** mapping without duplicating button-like behavior on a `div`.
- **Suggestion:** Refactor each step to **`button type="button"`** (or `BaseButton`-style) with disabled styling; keep roving `tabIndex` rules; drop redundant `role="button"` on a non-button element.

### 6. Root grouping label is fixed and the public props surface does not forward ARIA overrides

- **WCAG / basis:** **Best practice** (context-specific labeling); 1.3.1 (landmark/group context when reused).
- **Severity:** **P2**
- **Scope:** **Component default** for extensibility; **Consumer-dependent** for teams that need a specific group name (e.g. “Checkout steps”).
- **Issue + impact:** `Stepper` sets **`role="group"`** and **`aria-label="Steps"`** after `{...baseProps}`, but **`extractBaseProps` only passes `className` / `data-test`** (`core/utils/types.tsx`), and **`StepperProps` extends `BaseProps` only** — consumers **cannot** legally pass `aria-label` / `aria-labelledby` through the typed API to override or refine the group description.
- **Suggestion:** Add optional **`aria-label` / `aria-labelledby`** (or `groupProps`) to `StepperProps` and merge them onto the root, or extend `BaseHtmlProps` for the wrapper with documented precedence vs the default “Steps” label.

### 7. Arrow key navigation is hard-coded to physical Left/Right

- **WCAG / basis:** **Best practice** (RTL / logical direction); **APG** (directional composites often mirror for RTL).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** in RTL locales or mirrored layouts.
- **Issue + impact:** `ArrowLeft` / `ArrowRight` always move focus along index order, which may **not match visual “previous/next”** in RTL.
- **Suggestion:** Use **logical keys** (`ArrowLeft` vs `ArrowRight` based on `document.dir` / CSS direction) or document that consumers must handle locale at a higher level.

### 8. Optional: step position (`aria-posinset` / `aria-setsize`)

- **WCAG / basis:** **APG only** / **Best practice** (structural hint for collections).
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Component default**.
- **Issue + impact:** Steps are a finite sequence; some AT users benefit from **“2 of 5”** style context.
- **Suggestion:** Set **`aria-setsize={steps.length}`** and **`aria-posinset={index + 1}`** on each step control if you keep a single composite without native list semantics.

### 9. Optional: identical `label` strings across steps (documentation / examples)

- **WCAG / basis:** 4.1.2 Name, Role, Value (distinguishable controls); **Best practice**.
- **Severity:** **P3** (enhancement — stories are not production UI, but they model bad naming)
- **Scope:** **Consumer-dependent** — e.g. `__stories__/Steps.tsx` uses the same `"Step"` label for every item.
- **Issue + impact:** Multiple siblings with the **same accessible name** are hard to tell apart in speech output and when listing form controls.
- **Suggestion:** Use **unique labels** in examples (`Billing`, `Shipping`, …) and document the requirement.

---

## Positive notes (brief)

- **Roving tabindex:** Only the **active** step (or first enabled when `active` is invalid) is **`tabIndex={0}`**; other enabled steps use **`-1`**, matching a standard composite pattern.
- **Keyboard:** **ArrowLeft/ArrowRight/Home/End** move focus among **enabled** steps only (`getEnabledIndexes`); **Enter/Space** activate (with **`preventDefault`** and **repeat guard** on activation).
- **Disabled steps:** **`tabIndex={-1}`** and **`aria-disabled`** when `disabled`, reducing accidental focus on non-actionable steps.
- **Root:** **`role="group"`** with an **`aria-label`** gives the set a name in the accessibility tree.

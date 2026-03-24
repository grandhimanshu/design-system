# SwitchInput (`Switch`) — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/switchInput/Switch.tsx` |
| Public exports | `core/components/atoms/switchInput/index.tsx` |
| Barrel export (named `Switch`) | `core/index.tsx` |
| Styles (stacking / hit target vs. visual) | `css/src/components/switch.module.css` |
| Keyboard helper (Space detection) | `core/accessibility/utils/isSpaceKey.ts` |
| Tests / stories (documented usage) | `core/components/atoms/switchInput/__tests__/Switch.test.tsx`, `core/components/atoms/switchInput/__stories__/**` |

**Note:** The package folder is `switchInput`; the React component is **`Switch`** (exported from `@/index` as `Switch`).

**APG reference:** [Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

---

## Component overview

`Switch` renders a **native `<input type="checkbox">`** with **`role="switch"`**, **`aria-checked`** mirroring internal/controlled `checked` state, **`disabled`** forwarded to the input, and **`{...rest}`** spread first so explicit props (type, role, aria-checked, checked, etc.) win. The visible track/thumb is a **following sibling `<span>`** styled in CSS; the input is **opacity 0** and sized to cover the control (**`Switch-input`**), so the **real focus target and activation surface** is the native input. **Keyboard:** `onChange` handles **`change`**; **`onKeyDown`** calls the same handler and **`preventDefault()`** for **Space** (via `isSpaceKey`) and **Enter**, then toggles state and invokes **`onChange(event, !checked)`**. Documented labeling uses an external **`Label`** with **`htmlFor`** + matching **`id`** on the switch (`__stories__/withLabel.story.jsx`).

**Root cause / rollup:** There is **no single shared subcomponent** stripping ARIA props; gaps are mostly **authoring requirements** (accessible name, optional description wiring) and **DOM/React correctness** around **`defaultChecked` vs `checked`** on the same element.

---

## Findings (severity order)

### 1. Switch has no accessible name unless consumers associate a label or set ARIA naming props

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic label); 2.4.6 Headings and Labels (context).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when `<Switch />` is used **without** visible/associated text and **without** `aria-label`, `aria-labelledby`, or an associated `<label htmlFor={id}>` (or equivalent `id` on the input via `...rest`).
- **Repro:** Render `<Switch checked={false} onChange={() => {}} />` with no `id` + label pair and no `aria-label` / `aria-labelledby`; the focused control has **no computed accessible name** while still exposing **switch** role and **on/off** state.
- **Issue + impact:** Screen reader and voice-control users cannot tell **what** the switch toggles; the control fails **Name, Role, Value** in that usage.
- **Suggestion:** Document **required** naming for standalone usage; consider dev-only warnings when neither `aria-label`, `aria-labelledby`, nor `id` (for label association) is provided. Stories already demonstrate `Label` + `htmlFor` — keep that as the primary pattern in docs.

---

### 2. Both `checked` (always) and `defaultChecked` (optional) are passed to the same `<input>`

- **WCAG / basis:** 4.1.1 Parsing (robust markup — indirect); **HTML** / **Best practice** (React controlled-field conventions).
- **Severity:** **P2**
- **Scope:** **Component default** whenever the implementation renders the input; **misuse surface** is largest when consumers pass **`defaultChecked`** while the component still drives **`checked`** from React state (internally controlled).
- **Issue + impact:** Supplying **`defaultChecked`** together with a React-controlled **`checked`** is **discouraged** and can cause **React warnings** or **confusing first-paint behavior** across versions; it does not strengthen accessibility and can undermine predictable **value** exposure in edge cases.
- **Suggestion:** Omit **`defaultChecked`** on the DOM node when the field is driven by **`checked`** state (initialize state from `defaultChecked` only in `useState`, as you already do, and do not forward `defaultChecked` to the input unless you truly need an uncontrolled-only API path).

---

### 3. Visual track `<span>` is presentational but not removed from the accessibility tree

- **WCAG / basis:** Best practice; **APG only** (redundant / decorative structure next to a named control).
- **Severity:** **P2**
- **Scope:** **Component default** — the styled **`Switch-wrapper`** span always follows the input.
- **Issue + impact:** The span is **not** the named control (focus stays on the input), but it is still a **generic element** in the tree with **visual-only** `::before` thumb content. Some assistive technologies or inspection workflows may expose **extra noise** or redundant structure next to the real switch.
- **Suggestion:** Set **`aria-hidden="true"`** on the decorative **`span`** (and ensure no essential information exists only in that subtree — it should not).

---

### 4. `Enter` toggles the switch in addition to APG-documented `Space`

- **WCAG / basis:** **APG only** / **Best practice** (keyboard pattern parity with APG examples).
- **Severity:** **P3**
- **Scope:** **Component default** — `onKeyDown` treats **Enter** like **Space** (`Switch.tsx`).
- **Issue + impact:** WAI-ARIA APG **Switch** documents **Space** for toggling; adding **Enter** is **not** an AA violation and can help parity with **checkbox** habits, but behavior may **differ** from strict APG examples or from other switch implementations in the same product.
- **Suggestion:** Align keyboard docs and tests with the **intended** keys; if you keep **Enter**, document it explicitly so authors and QA do not assume APG-only **Space**.

---

### 5. Optional: wire `aria-describedby` / invalid semantics for form contexts

- **WCAG / basis:** 3.3.1 Error Identification; 3.3.2 Labels or Instructions — **when** validation or helper text applies.
- **Severity:** **P3**
- **Scope:** **Consumer-dependent** — `...rest` already allows **`aria-describedby`**, **`aria-invalid`**, **`required`**, etc.; benefit depends on pairing with **`HelpText`** / error messages elsewhere in the form.
- **Issue + impact:** Not a violation by itself; authors may forget to connect helper or error copy to the switch in complex forms.
- **Suggestion:** Document a **labeled switch + help text** pattern (reuse **`HelpText`** `id` in **`aria-describedby`** on the switch) next to the existing label story.

---

## Positive observations (no issue)

- **Native focusable control** (`<input>`) rather than **`div` + click handlers** — supports **2.1.1** and predictable **tab order**.
- **`role="switch"`** with **`aria-checked`** aligned to **`checked`** state maps to the **Switch** pattern’s **state** requirements.
- **`disabled`** on the native input exposes the correct **disabled** semantics to AT.
- **Space** handling uses **`preventDefault()`** on **`keydown`** so manual toggling is less likely to **double-fire** with the user agent’s default **checkbox** activation (verify in target browsers in Storybook if regressions appear).
- **Explicit props after `{...rest}`** prevents consumers from accidentally overriding **`type`**, **`role`**, or **`aria-checked`** via the spread (they would need to apply duplicate props after the spread, which this file does not do).

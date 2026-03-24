# ChipInput — structural ARIA audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/molecules/chipInput/ChipInput.tsx` | Main implementation |
| `core/components/molecules/chipInput/index.tsx` | Re-export only |

Related (not re-audited in depth; referenced for wiring): `core/components/atoms/chip/Chip.tsx` → `core/components/atoms/_chip/index.tsx` (`GenericChip`), `core/components/atoms/icon/Icon.tsx` + `core/accessibility/utils/useAccessibilityProps.ts`.

## Component overview

**Pattern:** Free-form multi-value text field with removable “tags” (chips). Closest APG references: patterns for **combobox** / multi-select inputs and general guidance to avoid **interactive elements nested inside other interactive elements** (especially `role="button"` containers with focusable descendants).

**Root cause / rollup**

1. **Wrapper semantics:** The outer focusable `role="button"` container is used to forward focus to the `<input>` and duplicate labeling ARIA on both wrapper and input, which drives duplicate naming and invalid “button contains buttons/fields” structure.
2. **Icon-as-control:** The “clear all” control is an `Icon` with `onClick` + `tabIndex`, which `useAccessibilityProps` turns into `role="button"` without a default accessible name—so ChipInput must supply one and currently does not.

---

## Findings

### 1. Clear-all control has no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P0**
- **Scope:** **Component default** (when `chips.length > 0`, the clear `Icon` is always rendered this way)
- **Repro:** Use `ChipInput` with at least one chip; focus the trailing clear control (snapshot: `DesignSystem-ChipInput--Icon` has `role="button"` and `tabIndex="0"` but no `aria-label`).
- **Issue + impact:** `Icon` with `onClick` receives `role="button"` and keyboard handling via `useAccessibilityProps`, but ChipInput does not pass `aria-label` (or `aria-labelledby`). The visible content is a font icon glyph, not a reliable accessible name. Screen reader users get an unnamed button for “clear all.”
- **Suggestion:** Pass a concise `aria-label` (e.g. “Remove all tags” / “Clear all values”) on the clear `Icon`, or replace with a native `<button type="button">` with visible or sr-only text.

---

### 2. Duplicate labeling on wrapper and `<input>`

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (redundant/confusing naming)
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** when `aria-label`, `aria-labelledby`, or `aria-describedby` are provided (recommended in docs/story); both the outer `div` and the inner `input` receive the same attributes.
- **Repro:** Fails when `ChipInput` is used as documented with `Label` + `aria-labelledby` (e.g. `index.story.jsx`): the label association is applied twice to two different roles (button + textbox).
- **Issue + impact:** Assistive technologies may announce the same label twice or expose two separately named controls for one field, which obscures the actual text entry point.
- **Suggestion:** Apply `aria-labelledby` / `aria-describedby` only to the primary control (`<input>`), or use a single grouping wrapper with `role`/`aria-*` appropriate to a text field group—not `role="button"`—and avoid duplicating the same ids on both elements.

---

### 3. `role="button"` wrapper contains nested focusable controls

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (focus order / predictable widgets); APG / HTML — nested interactive controls
- **Severity:** **P1**
- **Scope:** **Component default** when chips are shown (each chip is a focusable `role="button"` inside the outer button; plus `<input>` and clear `Icon`).
- **Repro:** Render `ChipInput` with `chipOptions.clearButton: true` and one or more chips; tab through the control.
- **Issue + impact:** A `button` (or `role="button"`) must not contain other focusable elements or interactive ARIA roles. Here the outer wrapper is focusable (`tabIndex={0}`) and contains chip buttons, the text field, and another button-like icon—invalid structure and confusing tab order (extra stop on the outer “button” before the field).
- **Suggestion:** Remove `role="button"` and positive `tabIndex` from the outer container; use a non-interactive wrapper (or `role="group"` with a single label) and rely on the native `<input>` for primary keyboard entry; keep click-to-focus via `onClick` only if it does not require a misleading role (or use `pointer-events` + label association instead).

---

### 4. `error` prop not reflected in ARIA state

- **WCAG / basis:** 3.3.1 Error Identification; 4.1.2 Name, Role, Value
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** when `error={true}` is used without additional consumer wiring
- **Repro:** Use `ChipInput` with `error` set after failed validation and no extra `aria-*` on the input.
- **Issue + impact:** Visual error styling exists, but the `<input>` (and wrapper) do not set `aria-invalid`. Screen reader users may not be informed that the value failed validation.
- **Suggestion:** Map `error` to `aria-invalid={true}` on the `<input>` (and ensure an error message id is referenced via `aria-describedby` when consumers supply one).

---

### 5. Misleading role for primary interaction (text entry)

- **WCAG / basis:** 4.1.2 Name, Role, Value; Best practice / APG alignment
- **Severity:** **P2**
- **Scope:** **Component default**
- **Issue + impact:** The primary task is typing into a textbox; exposing the outer region as `role="button"` does not match the control’s behavior and diverges from tag/combobox patterns.
- **Suggestion:** Align the outer semantics with a text-input group (e.g. labeled `<input>` only, or APG-aligned combobox if suggestions are added later); reserve `role="button"` for true push-button actions.

---

### 6. No programmatic association for consumer-supplied `id` / `<label htmlFor>`

- **WCAG / basis:** 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — consumers must use `aria-labelledby` (as in stories) because ChipInput does not forward an `id` prop to the `<input>`.
- **Issue + impact:** Standard `<label htmlFor="...">` cannot target the internal input without an exposed `id` (or `inputProps`), increasing the chance of unlabeled fields in real apps.
- **Suggestion:** Accept `id` (or spread `inputProps`) and set it on the `<input>`; document pairing with `Label` `htmlFor` as an alternative to `aria-labelledby`.

---

### 7. Silent rejection when `chipValidator` returns false

- **WCAG / basis:** 3.3.1 Error Identification (if validation is the only feedback)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when `chipValidator` is used without external error messaging
- **Issue + impact:** Entering an invalid chip does nothing visible/audible by default; users may not know why the chip was not added.
- **Suggestion:** Optionally surface validation state (`aria-invalid`, `aria-describedby` to an error region, or live region) when validation fails—either in the component or via documented callback patterns.

---

### 8. Dynamic chip list changes not announced

- **WCAG / basis:** Best practice (dynamic content feedback)
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Component default**
- **Issue + impact:** Adding/removing chips updates the DOM without `aria-live`; some users may benefit from a polite announcement of count or last change.
- **Suggestion:** Consider `aria-live="polite"` on a dedicated status element or follow APG patterns for the chosen widget role if the component moves to a full combobox model.

---

## P0 / P1 summary

- **P0:** 1 (unnamed clear-all `Icon` when chips are present)
- **P1:** 3 (duplicate `aria-*` on wrapper + input; nested focusables inside `role="button"`; missing `aria-invalid` for `error`)
- **P2 / P3:** 4 (role mismatch, missing `id` forwarding, validator feedback, optional live region)

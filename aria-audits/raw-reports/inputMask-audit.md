# InputMask — structural ARIA / semantic audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/molecules/inputMask/InputMask.tsx` | Main implementation (`forwardRef` → underlying native `<input>` via `Input`) |
| `core/components/molecules/inputMask/utilites.tsx` | Pure helpers (`getDefaultValue`, `isEditable`) — no DOM / ARIA |
| `core/components/molecules/inputMask/index.tsx` | Re-exports |

Related dependencies reviewed for wiring:

| Dependency | Relevance |
|------------|-----------|
| `core/components/atoms/input/Input.tsx` | Renders native `<input>`; clear affordance, `error` styling, `...rest` passthrough |
| `core/components/atoms/helpText/HelpText.tsx` | Sibling `caption` / `helpText` below the field |
| `core/components/organisms/inlineMessage/InlineMessage.tsx` | Used for `error` caption path |
| `core/accessibility/utils/useAccessibilityProps.ts` | `Icon` + `onClick` → `role="button"`, keyboard activation |
| `aria-audits/raw-reports/input-audit.md` | Prior audit of shared `Input` behavior |

---

## Component overview

**APG / pattern:** A **native textbox** (`<input>`) with in-component masking logic (cursor rules, fixed mask characters, optional validators). It is **not** a composite ARIA widget (no `combobox`, `spinbutton`, etc.); assistive tech should treat it as a standard text field whose value is the masked string.

**Root cause / rollup:** Most interactive DOM and ARIA surface area is delegated to **`Input`**. Several high-severity gaps (invalid state, clear control naming, `info` tooltip keyboard access, `inlineLabel` association) are **shared with `Input`** and are documented in `input-audit.md`. This report emphasizes **InputMask-specific** composition and behavior (paste handling, `HelpText` wiring, forced `autoComplete`, special `id` handling).

---

## Findings

### 1. `onPaste` always calls `preventDefault`, so paste is blocked unless the custom branch accepts the clipboard text

- **WCAG / basis:** **Best practice** (input modalities / robust operation); aligns with repo anti-pattern “`onPaste` with `preventDefault` blocking paste” (`CLAUDE.md`)
- **Severity:** **P1**
- **Scope:** **Component default** — `InputMask` always passes `onPaste={onPasteHandler}` (`InputMask.tsx`), and the handler starts with `e.preventDefault()` before conditional logic.
- **Repro:** Paste any text that fails `sameFormat` or `validators` — the default action is canceled and no alternative path applies the paste.
- **Issue + impact:** Users who rely on paste (motor limitations, password managers, copied dates) may be unable to populate the field even when partial or normalized paste could be supported. Clipboard content is silently discarded in many cases.
- **Suggestion:** Avoid unconditional `preventDefault`; only prevent default when the component actually handles the paste, or sanitize/normalize then update value. If paste must be restricted, expose a documented keyboard-accessible alternative (e.g. open picker / paste dialog) per product requirements.

---

### 2. Built-in `caption` / `helpText` are not programmatically associated with the `<input>`

- **WCAG / basis:** `3.3.1` (Error Identification), `3.3.2` (Labels or Instructions), `4.1.2` (Name, Role, Value — relationship to instructions/errors)
- **Severity:** **P1**
- **Scope:** **Component default** when `caption` (with `error`) or `helpText` is set — `HelpText` is a **sibling** of `Input` with no shared `id` / `aria-describedby` wiring (`InputMask.tsx`).
- **Repro:** Use `InputMask` with `error` + `caption` or with `helpText`; focus the input — the message is not referenced from the control unless the consumer also passes `aria-describedby` via `...rest`.
- **Issue + impact:** Screen reader users may not hear helper or error text in the same focus/read flow as the field, so they can miss format rules or validation errors tied to this component API.
- **Suggestion:** Generate stable unique ids for help/error nodes (e.g. `useId`), render `HelpText`/`InlineMessage` with those ids, and set `aria-describedby` on the `Input` (merging with any consumer-provided ids). For errors, pair with `aria-invalid` (see finding 3).

---

### 3. Inherits `Input` gaps: `error` styling without `aria-invalid`; clear control often lacks an accessible name

- **WCAG / basis:** `3.3.1`, `4.1.2`; `2.1.1` / `4.1.2` when `info` is used on the same `Input` stack (see `input-audit.md`)
- **Severity:** **P1**
- **Scope:** **Component default** when `error` or clear UI is used without consumers supplying compensating ARIA on `...rest` / external labels.
- **Repro:** Render `<InputMask error caption="Invalid" />` or a filled masked value so the clear icon appears — inspect DOM: `<input>` lacks `aria-invalid` from the atom; clear `Icon` has `role="button"` from `useAccessibilityProps` but no `aria-label` from `Input.tsx`.
- **Issue + impact:** Invalid state and the “clear” action are not reliably exposed to assistive technologies; users may not know the field failed validation or what the secondary control does.
- **Suggestion:** Fix in `Input` (preferred): set `aria-invalid={error || undefined}`, add `aria-label` (or use `<button type="button">`) for clear. Optionally have `InputMask` pass through merged `aria-describedby` once finding 2 is implemented.

---

### 4. `id` is dropped when `id` is `parent-TimePicker` or `parent-DatePicker`

- **WCAG / basis:** `1.3.1` (Info and Relationships), `4.1.2` (label association)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — affects pickers that set these sentinel ids (`InputMask.tsx` passes `id={undefined}` in that case).
- **Issue + impact:** Any `<label htmlFor>` or `aria-labelledby` pointing at that `id` no longer matches the input node, breaking programmatic association unless the parent wires a different labeling strategy.
- **Suggestion:** Use non-colliding internal ids for the real input and expose `aria-labelledby` / `aria-describedby` from the parent container, or replace sentinel string ids with explicit props (`omitLabelAssociation`) so consumers do not rely on magic `id` values.

---

### 5. On focus with empty value, the masked template becomes the `<input>`’s `value`

- **WCAG / basis:** `4.1.2` (programmatic value vs user intent) — **contextual**; **Best practice** for AT clarity
- **Severity:** **P2**
- **Scope:** **Component default** when focusing an empty mask (`onFocusHandler` sets `getPlaceholderValue()`).
- **Issue + impact:** Assistive technologies may announce the placeholder mask as the current “value,” which can sound like data already entered or obscure that the field is still empty/incomplete.
- **Suggestion:** Consider keeping an empty accessible value pattern (e.g. `value=""` with `placeholder` for visual mask only — if feasible with masking logic), or expose concise format instructions via `aria-describedby` / `aria-placeholder` (limited support) / visible hint text wired as in finding 2.

---

### 6. `autoComplete={'off'}` is always forced on the inner `Input`

- **WCAG / basis:** `1.3.5` (Identify Input Purpose) — **contextual**; **Best practice** for autofill-friendly fields
- **Severity:** **P2**
- **Scope:** **Component default** (`InputMask.tsx`).
- **Issue + impact:** For date, telephone, or other typed inputs, disabling browser autofill can force redundant entry and frustrate users who depend on password managers or saved form data.
- **Suggestion:** Default to allowing the platform default (`autoComplete` unset) or derive from `type` / a dedicated `autoComplete` prop instead of hard-coding `off`, unless a documented security exception applies.

---

### 7. Mask / format requirements are not structurally exposed beyond placeholder / visible text

- **WCAG / basis:** `3.3.2` (Labels or Instructions) — **enhancement** when placeholder + label already convey format
- **Severity:** **P3**
- **Scope:** **Consumer-dependent** unless mask-only placeholders are the sole instruction.
- **Issue + impact:** Complex masks may be easier to understand with persistent instructions; this is optional if visible label/help text already describes the format.
- **Suggestion:** Encourage pairing with visible `helpText` (once wired per finding 2) or document required `aria-describedby` from the page for non-obvious masks.

---

### 8. Error `InlineMessage` path has no dedicated live-region semantics (inherited from `InlineMessage`)

- **WCAG / basis:** `4.1.3` (Status Messages) — **enhancement** for dynamic validation
- **Severity:** **P3**
- **Scope:** **Component default** when `error` + `caption` toggles at runtime; behavior inherited from `InlineMessage` + `HelpText`.
- **Issue + impact:** When errors appear after submission without moving focus, some AT may not announce the new message unless focus moves or `aria-live` is used.
- **Suggestion:** If validation messages are injected dynamically without focus change, add `role="alert"` or `aria-live="polite"` on the error container (coordinate with design system-wide `InlineMessage` behavior).

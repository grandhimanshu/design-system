# VerificationCodeInput — structural ARIA / semantic audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/molecules/verificationCodeInput/VerificationCodeInput.tsx` | Main implementation: maps N cells to N `Input` instances, keyboard navigation, paste spread |
| `core/components/molecules/verificationCodeInput/index.tsx` | Re-exports |
| `core/components/molecules/verificationCodeInput/__tests__/VerificationCodeInput.test.tsx` | Unit tests (snapshots, events, `error` / `disabled` variants) |

Related dependency reviewed for forwarded attributes and error state:

| Dependency | Relevance |
|------------|-----------|
| `core/components/atoms/input/Input.tsx` | Renders native `<input>`; spreads `...rest` after `extractBaseProps` (only `className`, `data-test`); **does not** set `aria-invalid` when `error` is true |
| `core/utils/types.tsx` | `BaseHtmlProps` allows `id`, `name`, ARIA, etc., on `VerificationCodeInputProps` |

Documented usage (Storybook pattern):

| File | Relevance |
|------|-----------|
| `core/components/patterns/forms/VerificationCodeInput.story.tsx` | Example wraps control in `role="group"` + `aria-labelledby` + `Label` — good **consumer** grouping pattern |

---

## Component overview

**APG / pattern:** Multi-field one-time code / PIN entry implemented as **several native text inputs** (not a single `role="textbox"` composite with `aria-owns`). This aligns with common HTML practice when each cell is a real `<input>`. Keyboard handling (Backspace, Left/Right, blocking `e`/`E` and arrow keys for `type="number"`) is implemented in the molecule.

**Root cause / rollup:** (1) **`{...rest}` is applied to every cell** — any global `id`, `name`, or other singleton DOM attributes valid on one `<input>` are duplicated across N inputs. (2) **`error` styling flows through `Input` without programmatic invalid state** — same gap as audited on `Input` (`input-audit.md` finding 3); `VerificationCodeInput` inherits it whenever `error` is passed.

---

## Findings

### 1. Passing `id` (or other singleton attributes) via props duplicates them on every cell

- **WCAG / basis:** `4.1.1` (Parsing — unique `id`s), `4.1.2` (Name, Role, Value — predictable identity/relationships)
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — breaks when consumers pass `id`, or other attributes that must be unique per element, once on `VerificationCodeInput` expecting a single control (allowed by `VerificationCodeInputProps` / `BaseHtmlProps`).
- **Repro:** Render `<VerificationCodeInput id="otp" fields={4} />` and inspect the DOM — four `<input>` elements share the same `id`.
- **Issue + impact:** Invalid HTML, broken `aria-labelledby` / `for` associations, and unreliable querying or labeling. Assistive technologies and browser APIs that resolve by `id` may target the wrong node or behave inconsistently.
- **Suggestion:** Strip or namespace `id` / `name` inside the molecule (e.g. `${baseId}-${index}`), document that consumers must not pass a single `id`, or accept a `baseId` prop and generate per-cell ids. Prefer associating a visible label with a **group** (`<fieldset>` / `<legend>` or `role="group"` + `aria-labelledby`) rather than `htmlFor` to a single input.

---

### 2. `error={true}` does not expose an invalid state on the inputs (`Input` does not set `aria-invalid`)

- **WCAG / basis:** `3.3.1` (Error Identification), `4.1.2` (states and properties)
- **Severity:** **P1**
- **Scope:** **Component default** when `error` is used without consumers also passing `aria-invalid` (and usually `aria-describedby`) on each cell via `...rest`.
- **Repro:** Use `<VerificationCodeInput error={true} />` as in unit tests — cells get error styling through `Input` but the underlying `<input>` elements receive no `aria-invalid` from `Input` (`Input.tsx`).
- **Issue + impact:** Screen readers may not announce fields as invalid; users relying on AT miss the error state that sighted users get from styling.
- **Suggestion:** Fix in `Input` when `error` is true (`aria-invalid="true"`), which automatically benefits `VerificationCodeInput`. Optionally add docs/examples wiring a single error message `id` to each cell’s `aria-describedby`, or support a dedicated `errorMessage` / `aria-describedby` prop on the molecule that fans out to all cells.

---

### 3. Root wrapper is a generic `<div>` with no built-in grouping semantics

- **WCAG / basis:** `1.3.1` (Info and Relationships), **APG only** / **Best practice** (group label for related inputs)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — the default export is an unlabeled group; the Storybook pattern correctly adds `role="group"` and `aria-labelledby`.
- **Repro:** Render bare `<VerificationCodeInput />` without an outer group/legend — cells only expose per-field `aria-label` (`Digit ${index + 1} of ${fields}`).
- **Issue + impact:** Users may hear “Digit 1 of 4” without context (“verification code”, “OTP”) unless the app wraps the widget or overrides labels. Relationship between cells is implied visually but not declared on the root by default.
- **Suggestion:** Optionally render `<fieldset>` + `<legend>` (visually hidden legend if needed), or set `role="group"` and require / default `aria-labelledby` to a passed label id. Document the Storybook pattern as required for bare usage.

---

### 4. Default `type="number"` for OTP-style fields can confuse roles and native behavior

- **WCAG / basis:** `4.1.2` (Role exposure — contextual), **HTML** / **Best practice**
- **Severity:** **P2**
- **Scope:** **Component default** (`type` defaults to `number` in `VerificationCodeInput` and `defaultProps`).
- **Repro:** Use default `VerificationCodeInput` — each cell is `type="number"`; some AT expose number inputs with spinbutton-like semantics; arrow keys are suppressed in `onKeyDown` for that type.
- **Issue + impact:** Mismatch between expected “one digit per box” and native number field semantics; potential confusing announcements or expectations compared to `inputMode="numeric"` + `type="text"` patterns often used for OTP.
- **Suggestion:** Consider defaulting OTP-style entry to `type="text"` with `inputMode="numeric"` and `pattern` where appropriate, or document that `type="text"` is recommended for accessibility-sensitive deployments.

---

### 5. No `autoComplete="one-time-code"` (or related) guidance in the component

- **WCAG / basis:** `1.3.5` (Identify Input Purpose) — **enhancement / Best practice** for SMS/email OTP; `autoComplete` is omitted from the props type but browsers benefit when set on a control or field group
- **Severity:** **P2**
- **Scope:** **Component default** — `VerificationCodeInputProps` explicitly omits `autoComplete` from `InputProps`, so authors cannot type-safely pass OTP autocomplete hints through the molecule API.
- **Repro:** Typical usage does not set OTP-oriented autocomplete; mobile OTP autofill may be weaker than necessary.
- **Suggestion:** Re-expose a vetted `autoComplete` (e.g. `one-time-code`) on the molecule, applied to the first cell or documented for a hidden field pattern per HTML spec evolution; document iOS/Android OTP behavior.

---

### 6. Cells lack `maxLength={1}` (and related per-slot constraints on the native element)

- **WCAG / basis:** **HTML** / **Best practice** (constraint clarity); weak direct WCAG mapping
- **Severity:** **P3** (enhancement — not labeled as a violation)
- **Scope:** **Component default**
- **Repro:** Inspect each cell — no `maxLength`; behavior relies on controlled value and change handlers plus paste handling.
- **Issue + impact:** Native constraint is not expressed on the element; minor robustness gap vs. explicit single-character fields (paste path is handled in code).
- **Suggestion:** Set `maxLength={1}` per cell when each slot is single-character, keep paste handling as override, and consider `inputMode="numeric"` for numeric variants.

---

### 7. Optional: completion and error feedback are not announced via a live region

- **WCAG / basis:** **Best practice** for dynamic success/error copy; **Non-WCAG** strict requirement unless instructions rely solely on non-announced updates
- **Severity:** **P3** (enhancement)
- **Scope:** **Consumer-dependent** — Storybook example uses `Message` for feedback; no live region in the molecule.
- **Issue + impact:** If the app updates status only visually, some users may miss completion or failure unless focus moves or `aria-live` is used elsewhere.
- **Suggestion:** Document pairing with `role="status"` / `aria-live="polite"` (or `role="alert"` for critical errors) when `onComplete` or validation results change page messaging.

---

## Summary counts

- **P0:** 0  
- **P1:** 2  
- **P2:** 3  
- **P3:** 2  

# Input — structural ARIA / semantic audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/atoms/input/Input.tsx` | Main `Input` implementation (`forwardRef` to native `<input>`) |
| `core/components/atoms/input/index.tsx` | Re-exports |
| `core/components/atoms/input/actionButton/ActionButton.tsx` | Thin wrapper: `Icon` + styles for input action slot |

Related dependencies reviewed for behavior wiring:

| Dependency | Relevance |
|------------|-----------|
| `core/components/atoms/icon/Icon.tsx` | Renders `<i>` with optional `onClick`; pairs with `useAccessibilityProps` |
| `core/accessibility/utils/useAccessibilityProps.ts` | Adds `role="button"`, `tabIndex`, Enter/Space → `onClick` when `onClick` is set |
| `core/components/molecules/tooltip/Tooltip.tsx` | Wraps `Popover` with `on="hover"` for `info` UI |
| `core/utils/types.tsx` | `BaseHtmlProps` / `extractBaseProps` (only `className`, `data-test` extracted for base) |

## Component overview

**APG / pattern:** Native textbox (`<input>`) with optional adornments (inline label text, leading icon, info tooltip trigger, clear/action icons). No composite ARIA widget role on the root; the meaningful control is the native input.

**Root cause / rollup:** Several issues cluster around **non-input affordances** (info tooltip, clear control, `inlineLabel`) rather than the core `<input>` element. The native input correctly forwards most HTML attributes via `{...rest}`, so **labeling and error description are primarily consumer-dependent** unless the atom misleads authors (e.g. `inlineLabel` looks like a label but is not associated).

---

## Findings

### 1. `info` tooltip is hover-driven; keyboard users likely cannot access the same help content

- **WCAG / basis:** `2.1.1` (Keyboard), `4.1.2` (Name, Role, Value — pattern completeness for supplementary content)
- **Severity:** **P1**
- **Scope:** **Component default** when `info` is set (documented/story usage includes `info="…"`).
- **Repro:** Use `Input` with `info` set; navigate with keyboard only — `Tooltip` uses `Popover` with `on={'hover'}` (`Tooltip.tsx`), so opening the help layer does not follow the usual keyboard/focus pattern for disclosure.
- **Issue + impact:** Supplementary instructions in `info` are exposed on hover for pointer users but are not structurally guaranteed for keyboard-only or many screen-reader workflows. Users may miss required format hints or field guidance that pointer users see in the tooltip.
- **Suggestion:** Use a pattern that supports keyboard and focus (e.g. `Popover` `on="click"` / focus-within, or a visible inline `HelpText` with `id` wired via `aria-describedby` on the input). If keeping tooltip, align trigger with APG tooltip/disclosure (focusable trigger, `aria-expanded` / `aria-controls` where applicable, and keyboard open/close).

---

### 2. Info trigger is a focusable non-semantic wrapper (`<div tabIndex={0}>`) around an icon

- **WCAG / basis:** `4.1.2` (Name, Role, Value), **APG only** (focusable custom control should have clear role and name)
- **Severity:** **P1**
- **Scope:** **Component default** when `info` is set.
- **Repro:** Tab to the info affordance next to the field — focus lands on the wrapper `div` (`Input.tsx`), not a native `<button>`, with no explicit `role` or `aria-label` on the wrapper (eslint override `jsx-a11y/no-noninteractive-tabindex` is present).
- **Issue + impact:** Assistive technologies get an ambiguous focus target (generic container + icon). Name may fall through from descendant text inconsistently; role is not explicitly `button` / `img` with name. This weakens predictability even if some AT announce inner icon text.
- **Suggestion:** Replace the focusable `div` with `<button type="button">` (or a single focusable `Icon` with explicit `aria-label` derived from `info` or a dedicated prop), and ensure keyboard operation opens the same content as pointer hover.

---

### 3. `error={true}` does not set `aria-invalid` (or error description wiring)

- **WCAG / basis:** `3.3.1` (Error Identification), `4.1.2` (state exposed programmatically)
- **Severity:** **P1**
- **Scope:** **Component default** when `error` is used without consumers also passing `aria-invalid` / `aria-describedby` via `...rest`.
- **Repro:** Render `<Input error />` with visible error styling only — the `<input>` receives no `aria-invalid` from the component (`Input.tsx`).
- **Issue + impact:** The invalid state is visual (CSS) but not exposed as an invalid form field to AT unless the app duplicates props. Screen readers and other AT may not announce the field as in error.
- **Suggestion:** When `error` is true, set `aria-invalid={true}` on the `<input>` (and document pairing with an error message element `id` + `aria-describedby` from the parent `TextField` or page).

---

### 4. `inlineLabel` is not programmatically associated with the `<input>`

- **WCAG / basis:** `1.3.1` (Info and Relationships), `4.1.2` (accessible name), `3.3.2` (Labels or Instructions — when inline text is the only label)
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — fails when `inlineLabel` is the **only** visible label and consumers do not also set `aria-label`, `aria-labelledby`, or an external `<Label htmlFor>`.
- **Repro:** Use `Input` with `inlineLabel="Email"` and no `id`/`aria-label`/`aria-labelledby` — the label text is in a separate `div`; the input’s accessible name is not derived from it.
- **Issue + impact:** Users who rely on accessible name / label association may not hear the purpose of the field tied to the visible inline label text.
- **Suggestion:** Generate a stable `id` for the input (or require `id`), set `aria-labelledby` to the inline label element’s `id`, or render a native `<label>` (or reuse the design system `Label`) wrapping or referencing the input. Document that `inlineLabel` is decorative unless wired.

---

### 5. `readOnly` forces `tabIndex={-1}` on the `<input>`

- **WCAG / basis:** `2.1.1` (Keyboard) — **contextual**; **Best practice** for forms that must remain readable/copyable via keyboard
- **Severity:** **P2**
- **Scope:** **Component default** whenever `readOnly` is true; harmful only when the value must remain in tab order (e.g. copy, review).
- **Repro:** Set `readOnly` on `Input` and tab through the page — the field is skipped (`Input.tsx` comment explains intent).
- **Issue + impact:** Keyboard users cannot focus the control to read character-by-character, select, or copy text. That may be intentional for “display-only” UIs but breaks common expectations for readonly fields in forms.
- **Suggestion:** Default `tabIndex` for `readOnly` to `0` (or undefined) unless a prop explicitly opts into removing the field from the tab sequence; document the tradeoff.

---

### 6. Leading `icon` has no automatic `aria-hidden` when decorative

- **WCAG / basis:** `1.1.1` (Non-text Content) — **when icon is purely decorative**; **Best practice**
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — matters when the icon duplicates or adds no meaning; if the icon conveys unique information, consumers should expose that in the label or `aria-describedby`.
- **Issue + impact:** Decorative glyphs may add redundant or noisy announcements depending on AT and font text content.
- **Suggestion:** If the leading icon is decorative by default, pass `aria-hidden="true"` on `Icon` (or expose a prop on `Input` to mark leading icon decorative vs meaningful).

---

### 7. Clear control: `Icon` with `onClick` gets `role="button"` via `useAccessibilityProps`, but no dedicated accessible name prop from `Input`

- **WCAG / basis:** `4.1.2` (Name, Role, Value)
- **Severity:** **P2**
- **Scope:** **Component default** for clear affordance; mitigated if visible/announced text `"close"` inside `<i>` is reliably exposed (implementation-dependent).
- **Issue + impact:** Icon-only buttons should have a clear accessible name (e.g. “Clear” / “Clear input”). Relying on ligature/text content of the icon font is fragile across AT and fonts.
- **Suggestion:** Pass a stable `aria-label` (and optional `aria-describedby`) from `Input` to the clear `Icon`, localized per product.

---

### 8. Wrapper `div` uses `role="presentation"` with `onClick` to focus the input

- **WCAG / basis:** **HTML** / **Best practice** (event target semantics)
- **Severity:** **P3** (enhancement / clarity, not a clear AA failure by itself)
- **Scope:** **Component default**
- **Issue + impact:** `role="presentation"` is intended to strip implicit semantics; attaching `onClick` for focus management is a common pattern but can confuse maintainers. The wrapper is not in the tab order.
- **Suggestion:** Prefer `onPointerDown`/`onMouseDown` on a non-presentational wrapper, or document that the wrapper is purely visual hit-area extension; ensure no essential action exists only on this wrapper without an equivalent on the input.

---

### 9. `actionIcon` slot is fully author-controlled

- **WCAG / basis:** `4.1.2`, `2.1.1` — **Consumer-dependent**
- **Severity:** **P3** (documentation / API contract)
- **Scope:** **Consumer-dependent**
- **Issue + impact:** Consumers must supply an accessible interactive (e.g. `Icon` with `aria-label` and keyboard support, or `ActionButton` with `onKeyDown` if overriding defaults).
- **Suggestion:** Document required a11y props for `actionIcon`; consider constraining the type to known accessible primitives.

---

## Positive notes (structural)

- Core control is a **native `<input>`**, which is the correct semantic foundation for a text field.
- **`required`** is forwarded to the native attribute.
- **Consumers can pass** `id`, `aria-*`, `aria-describedby`, etc. via `InputProps` / `{...rest}`; stories demonstrate **`Label` + `htmlFor`** (`InputWithLabel.story.jsx`).
- **`Icon` + `useAccessibilityProps`** provides **Enter/Space activation** when `onClick` is used (e.g. clear icon), addressing basic keyboard mechanics for that glyph.

---

## Counts

- **P0:** 0  
- **P1:** 4  
- **P2:** 3  
- **P3:** 2  

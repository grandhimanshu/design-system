# Radio — structural ARIA / semantic audit

## Implementation files reviewed

| Path | Role |
|------|------|
| `core/components/atoms/radio/Radio.tsx` | Component implementation |
| `core/components/atoms/radio/index.tsx` | Re-exports |
| `css/src/components/radio.module.css` | Layout, custom control visuals, focus-within styling |

**APG pattern:** [Radio Group / Radio button](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) — this atom is a **native** `<input type="radio">` with a styled visual; group semantics (`fieldset` / `legend`, group label) are expected from the **parent** (e.g. `ChoiceList`).

**Root cause / rollup:** Several gaps mirror **Checkbox** (`core/components/atoms/checkbox/Checkbox.tsx`), which already wires `aria-describedby` for help text, `aria-invalid` for `error`, and a more careful `id` / spread order. Radio is **behind Checkbox** on the same structural patterns.

---

## Findings (severity order)

### 1. Missing accessible name when `label` is omitted

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships  
- **Severity:** **P0**  
- **Scope:** **Consumer-dependent** — fails if the app renders `<Radio name="…" value="…" />` without `label` and without passing an accessible name on the input (e.g. `aria-label` / `aria-labelledby` via `…rest`).  
- **Repro:** Use `Radio` with `name` and `value` only; focus the control — SR exposes a radio with no name.  
- **Issue + impact:** `label` is optional in `RadioProps`, but there is no default `aria-label`. Unlabeled radios are not perceivable or understandable for assistive technology.  
- **Suggestion:** Require an accessible name (type-level or runtime dev warning), or document that consumers **must** supply `label` or `aria-label` / `aria-labelledby`.

---

### 2. `helpText` not associated with the input (`aria-describedby`)

- **WCAG / basis:** 3.3.2 Labels or Instructions; 4.1.2 Name, Role, Value  
- **Severity:** **P1**  
- **Scope:** **Component default** when `helpText` is set (documented prop).  
- **Repro:** `Radio` with `label`, `helpText`, `name`, `value` — focus the input; supplementary text is not referenced from the control.  
- **Issue + impact:** Help copy is rendered next to the label but not programmatically tied to the radio, so it may not be announced when the control receives focus (unlike the sibling **Checkbox** implementation, which merges `aria-describedby` and assigns an `id` to the help `Text`).  
- **Suggestion:** Mirror Checkbox: stable suffix id for help text (e.g. `${inputId}-helptext`), `id` on the help `Text`, and `aria-describedby` combining consumer `aria-describedby` with the help id.

---

### 3. `error` styling without `aria-invalid` on the input

- **WCAG / basis:** 3.3.1 Error Identification; 4.1.2 Name, Role, Value  
- **Severity:** **P1**  
- **Scope:** **Component default** when `error={true}` and consumers rely on the prop for validation state (no extra attrs passed).  
- **Repro:** `Radio` with `error`, `label`, `name`, `value` — inspect the `<input>`; `aria-invalid` is absent unless passed manually.  
- **Issue + impact:** The failure state is communicated visually (wrapper class) but not structurally on the control; screen readers and other AT may not expose “invalid” state. Checkbox sets `aria-invalid={error || undefined}`.  
- **Suggestion:** Set `aria-invalid={error ? true : undefined}` on the `<input>` (and wire error message ids if/when error text is added).

---

### 4. `id` on `<input>` can be overridden by `{...rest}` while `<label htmlFor>` stays on the internal id

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships  
- **Severity:** **P1**  
- **Scope:** **Consumer-dependent** — occurs when native props include `id` (allowed via `OmitNativeProps<HTMLInputElement, 'onChange'>`).  
- **Repro:** `<Radio id="custom" label="Option" name="g" value="1" />` — label’s `for` does not match the input’s `id` because `{...rest}` follows explicit `id={id}` and overwrites it.  
- **Issue + impact:** Broken label–control association; visible label no longer names the focused control for SR / click-to-activate.  
- **Suggestion:** Destructure `id` from props (optional prop with default), pass **one** id to both `input` and `label`; apply `{...rest}` **without** `id`, or place consumer `id` after destructuring so it cannot diverge from `htmlFor`.

---

### 5. Unstable `id` on every render

- **WCAG / basis:** 4.1.2 (robustness); **Best practice** / HTML  
- **Severity:** **P2**  
- **Scope:** **Component default** whenever no stable external id is supplied.  
- **Issue + impact:** `const id = \`${name}-${label}-${uidGenerator()}\`;` runs each render, so `id` values change every update. `htmlFor` and `id` stay matched, but DOM churn and unstable identifiers complicate testing, extensions, and stable `aria-describedby` / external references.  
- **Suggestion:** Use React `useId()` (or a ref-initialized id) so the value is stable for the instance lifetime; optionally accept an explicit `id` prop like Checkbox.

---

### 6. Explicit `tabIndex={0}` on native radio

- **WCAG / basis:** 2.1.1 Keyboard — **Best practice** / APG only (not a clear AA failure for native `radio`)  
- **Severity:** **P2**  
- **Scope:** **Component default**  
- **Issue + impact:** Native radios already participate in focus order; forcing `tabIndex={0}` is redundant and can interact oddly with custom group patterns (less common).  
- **Suggestion:** Omit unless a product requirement needs it; allow `tabIndex` via props if consumers must align with a roving tabindex host (ChoiceList already passes `tabIndex` from choices).

---

### 7. Decorative radio circle `<span>` without `aria-hidden`

- **WCAG / basis:** **Best practice** (redundant / decorative content)  
- **Severity:** **P3** *(enhancement — not labeled as a violation)*  
- **Scope:** **Component default**  
- **Issue + impact:** The visible ring/dot is purely presentational; the real control is the opaque `<input>`. An empty span is usually ignored, but `aria-hidden="true"` makes the intent explicit.  
- **Suggestion:** Add `aria-hidden="true"` on the visual `Radio-wrapper` span if it should never contribute to the accessibility tree.

---

## Positive notes (structural)

- Uses **native** `<input type="radio">` (correct role and keyboard behavior, including arrow-key group navigation when `name` matches).  
- When `label` is provided, **`<label htmlFor={id}>`** correctly associates visible label text with the control.  
- **Disabled** state uses the native `disabled` attribute.  
- **Focus visibility** is handled via `.Radio:focus-within` on the wrapper (CSS; out of scope for this structural audit beyond noting focus is not lost on a non-focusable-only UI).  
- Input is layered above the decorative span (`z-index` in CSS), preserving a sensible hit target and focus target.

---

## Integration note (outside Radio.tsx, for context)

Typical **group** usage goes through `ChoiceList`, which wraps radios in a `<fieldset>` with `aria-label` / `aria-labelledby`. The atom itself does not enforce a group label; consumers assembling raw `Radio` lists should provide `fieldset`/`legend` or an equivalent group naming pattern per APG.

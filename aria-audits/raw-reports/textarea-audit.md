# Textarea — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/textarea/Textarea.tsx` |
| Public exports | `core/components/atoms/textarea/index.tsx` |
| Props / HTML passthrough base type | `core/utils/types.tsx` (`BaseHtmlProps`, `BaseProps`) |
| Tests / stories (documented usage) | `core/components/atoms/textarea/__tests__/Textarea.test.tsx`, `core/components/atoms/textarea/__stories__/**` |

**APG / HTML reference:** Native multiline text input — use **`<textarea>`** with correct **label association** (`<label for>` / `aria-labelledby`) and **programmatic states** (`readonly`, `disabled`, `required`, `aria-invalid` when invalid). No custom ARIA widget role is required when native semantics are used.

---

## Component overview

`Textarea` is a thin wrapper around a **native `<textarea>`** with design-system styling. It uses **`React.forwardRef`** to the underlying element, maps **`error`** to **`aria-invalid`**, and passes through **`BaseHtmlProps<HTMLTextAreaElement>`** via **`{...rest}`** (after an initial **`aria-invalid={error}`**, so later spread keys can override). It exposes **`required`**, **`disabled`**, **`name`**, **`placeholder`**, **`rows`**, **`value`** / **`defaultValue`**, and event handlers explicitly. **Keyboard and text-editing behavior** are handled by the **user agent** (standard text field interactions).

**Root cause / rollup:** The **`readOnly`** prop is **destructured for styling only** and is **never applied** to the DOM **`readonly`** attribute. That single gap breaks both **visual/behavioral contract** (docs: “unable to type”) and **exposed state** for assistive technologies.

---

## Findings (severity order)

### 1. `readOnly` prop does not set the native `readonly` attribute

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic state vs. presentation).
- **Severity:** **P1**
- **Scope:** **Component default** whenever **`readOnly={true}`** is used — styling applies (**`Textarea--readOnly`**), but the control is not actually read-only in the accessibility tree or in native behavior.
- **Repro:** Render `<Textarea readOnly defaultValue="x" />`; the element has no **`readonly`** attribute and remains editable unless consumers redundantly pass **`readOnly`** again via a path that still does not exist (the prop is stripped from **`...rest`** because it is destructured out of props).
- **Issue + impact:** Screen readers may not announce the field as **read-only**; keyboard users can still edit unless other means block input. This contradicts the documented intent of **`readOnly`** and fails parity between CSS and semantics/behavior.
- **Suggestion:** Forward **`readOnly`** to the **`<textarea>`** as **`readOnly={readOnly}`** (or **`readOnly`** when true). Add a test asserting the **`readonly`** attribute when the prop is set.

---

### 2. `error`-driven `aria-invalid` can be overridden by `{...rest}`

- **WCAG / basis:** 4.1.2 Name, Role, Value; Best practice (consistent state mapping).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — occurs when **`error`** is used together with **`aria-invalid`** (or other overrides) passed as remaining HTML props, because **`{...rest}`** is spread **after** **`aria-invalid={error}`**.
- **Repro:** `<Textarea error aria-invalid={false} />` (or string **"false"**) — consumer **`aria-invalid`** wins; invalid styling may still apply via **`error`**, producing **mismatched** visual vs. AT state.
- **Issue + impact:** Assistive technologies may report the field as **valid** while the UI shows an error treatment, or the reverse if authors rely on **`error`** alone and later pass conflicting ARIA.
- **Suggestion:** Merge **`aria-invalid`** explicitly **after** **`{...rest}`** (e.g. compute from **`error`** unless consumer override is intentional — document precedence), or document that **`aria-invalid` in props overrides **`error`** and discourage combining them.

---

### 3. No accessible name unless consumers wire labels or ARIA

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships; 3.3.2 Labels or Instructions (when instructions are missing).
- **Severity:** **P3** (enhancement / documentation — not labeled a violation)
- **Scope:** **Consumer-dependent** — bare **`<Textarea />`** or placeholder-only usage without **`aria-label`**, **`aria-labelledby`**, or **`id`** + associated **`<label htmlFor>`**.
- **Repro:** TBD — verify in Storybook / docs; e.g. render without label wiring.
- **Issue + impact:** Placeholder text is **not** a reliable substitute for an accessible name; fields may be announced generically or ambiguously.
- **Suggestion:** Keep as atom responsibility: document that every instance **must** have an associated label (as in **`defaultTextarea.story.jsx`**: **`Label`** + **`htmlFor`** + **`id`**) or **`aria-label` / `aria-labelledby`**. Optional: examples in docs for **`aria-describedby`** pairing with help/error copy.

---

### 4. `error` sets `aria-invalid` only — no description wiring in the atom

- **WCAG / basis:** 3.3.1 Error Identification; 1.3.1 Info and Relationships — **Best practice / consumer composition**.
- **Severity:** **P3** (enhancement)
- **Scope:** **Consumer-dependent** — the atom does not render help or error message elements; authors should reference message containers with **`aria-describedby`** / **`aria-errormessage`** (where supported) when they supply inline validation text.
- **Issue + impact:** Users may hear that the field is invalid without an associated **explanation** unless the page wires descriptions.
- **Suggestion:** Document pairing **`error`** with **`aria-describedby`** pointing to visible error text; higher-level composites (e.g. **`TextField`**) should own id generation and relationships if that is the primary API.

---

## Positive observations (structural)

- **Native `<textarea>`** — appropriate semantic role; no unnecessary **`div`** button anti-patterns.
- **`required`** and **`disabled`** map to native attributes — good default state exposure.
- **`forwardRef`** — supports focus management and form libraries.
- **`BaseHtmlProps`** allows **`id`**, **`aria-*`**, **`aria-describedby`**, etc., for correct relationships when consumers use them (stories demonstrate **`id`** + **`Label`**).

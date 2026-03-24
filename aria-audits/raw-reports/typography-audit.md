# Structural ARIA audit — Typography atoms

**Scope:** `Text`, `Heading`, `Subheading`, `Paragraph`, `Caption`  
**Method:** Static review of implementation (semantic HTML, ARIA roles/states, prop surfaces, composition), shared `GenericText` primitive, and related CSS for visibility behavior.

**Severity summary (this bundle):** 0 P0 · 2 P1 · 6 P2 · 3 P3  

---

## Implementation map

| Component    | Primary files |
|-------------|---------------|
| **Text**    | `core/components/atoms/text/Text.tsx`, `core/components/atoms/text/index.tsx` |
| **Heading** | `core/components/atoms/heading/Heading.tsx`, `core/components/atoms/heading/index.tsx` |
| **Subheading** | `core/components/atoms/subheading/Subheading.tsx`, `core/components/atoms/subheading/index.tsx` |
| **Paragraph** | `core/components/atoms/paragraph/Paragraph.tsx`, `core/components/atoms/paragraph/index.tsx` |
| **Caption** | `core/components/atoms/caption/Caption.tsx`, `core/components/atoms/caption/index.tsx` |
| **Shared primitive** | `core/components/atoms/_text/index.tsx` (`GenericText` — dynamic `React.createElement(componentType, …)`) |

---

## Shared primitive: `GenericText`

**Role:** Renders `children` into a host element determined by `componentType` (e.g. `span`, `p`, `h1`–`h5`), forwarding `className`, `ref`, and remaining props to the DOM.

- **WCAG / basis:** HTML — correct use of native elements when `componentType` is a valid semantic tag.  
- **Severity:** **P2** · **Component default**  
  **Issue:** `componentType` is typed as `string` (not a union of known tags). Any string is forwarded to `createElement`; invalid or custom values affect the accessibility tree unpredictably.  
  **Impact:** Internal mistakes or future API changes could produce non-semantic or invalid elements without type-time guardrails.  
  **Suggestion:** Narrow the type to a union of allowed tags (or `React.ElementType`) and document which atoms may set which values.

- **WCAG / basis:** Best practice / TypeScript hygiene — not a direct WCAG failure.  
- **Severity:** **P3** · **Component default**  
  **Issue:** `Props` on `GenericText` under-declares what is spread (`...rest`); a11y-related DOM attributes are still passed at runtime from callers.  
  **Impact:** Weaker static guarantees when auditing prop surfaces.  
  **Suggestion:** Align `GenericText` props with `BaseHtmlProps` for the polymorphic element or use a small set of overloads.

---

## 1. Text

**DOM:** `<span>` (via `componentType="span"`).

- **WCAG / basis:** HTML / 1.3.1 — `span` is appropriate for styled inline phrasing with no implied role.  
- **Severity:** **P3** · **Consumer-dependent**  
  **Issue:** `children` is `React.ReactText` only (strings/numbers). That avoids invalid nesting inside `span` but pushes any richer semantics to wrappers outside `Text`.  
  **Impact:** Correct for “styled string” usage; consumers must not misuse `Text` for blocks of structured content that need lists, paragraphs, etc.  
  **Suggestion:** Document intended use (inline phrasing / design-token typography) in component docs.

- **WCAG / basis:** 4.1.2 Name, Role, Value — **pass-through**  
  **Note:** `TextProps` extends `BaseHtmlProps<HTMLSpanElement>`; `id`, `aria-*`, and other span attributes reach the DOM via `...rest` → `GenericText`. Consumers can supply names/roles when needed (e.g. `aria-label` on a focusable ancestor, not on static text).

---

## 2. Heading

**DOM:** Native heading element from size → tag map: `s`→`h5`, `m`→`h4`, `l`→`h3`, `xl`→`h2`, `xxl`→`h1` (`Heading.tsx`).

- **WCAG / basis:** HTML / 1.3.1 — Native headings expose correct implicit level in the accessibility tree.  
- **Severity:** **P2** · **Consumer-dependent**  
  **Issue:** Visual size is coupled to semantic level with no `as`/level override. Designs often need a larger visual style with a lower heading rank (or vice versa) to preserve a logical outline.  
  **Impact:** Teams may skip `Heading` and use non-heading elements with heading-like styles, harming document structure, or misuse levels to match visuals.  
  **Suggestion:** Consider an optional prop to set the heading level (or element) independently of `size`, with clear docs on outline responsibility.

- **WCAG / basis:** Best practice  
- **Severity:** **P3** · **Component default**  
  **Issue:** No redundant ARIA on headings (good). Consumers must manage heading order across the page (not enforceable inside the atom).

---

## 3. Subheading

**DOM:** `<h4>` with `aria-level={4}` (`Subheading.tsx`).

- **WCAG / basis:** HTML — `h4` correctly exposes heading level 4.  
- **Severity:** **P3** · **Component default**  
  **Issue:** `aria-level="4"` on a native `h4` is redundant; level is already implied by the tag.  
  **Impact:** Generally harmless; spec notes native headings do not require `aria-level`. Slight noise for maintainers.  
  **Suggestion:** Remove `aria-level` unless the component ever renders `role="heading"` on a non-`h*` element.

- **WCAG / basis:** 1.3.1 Info and Relationships — **Consumer-dependent**  
- **Severity:** **P2** · **Consumer-dependent**  
  **Issue:** Subheading is always `h4`. Unlike `Heading`, there is no size-to-level mapping; every subheading sits at the same rank.  
  **Impact:** Pages that need a subsection title at another level (e.g. `h2`/`h3` subtitle) cannot express it without a different component or raw HTML.  
  **Suggestion:** Optional level or `as` prop aligned with `Heading` patterns.

---

## 4. Paragraph

**DOM:** `<p>` (`componentType="p"`).

- **WCAG / basis:** HTML / 1.3.1 — `p` is the correct landmark for paragraph text.  
- **Severity:** **P2** · **Consumer-dependent**  
  **Issue:** `children` is `React.ReactNode`, so consumers can pass block-level or interactive content, producing invalid HTML (e.g. `p` > `div`) or confusing structure.  
  **Impact:** Invalid nesting can cause browser repair of the DOM and inconsistent AT behavior.  
  **Suggestion:** Tighten types or document supported children; lint or test for common anti-patterns in stories.

- **WCAG / basis:** 4.1.2 — **pass-through**  
  **Note:** `BaseHtmlProps<HTMLParagraphElement>` allows `aria-*`, `id`, etc., on the `p` element.

---

## 5. Caption

**DOM:** Outer `<div>` with optional leading error `Icon`, inner `Text` as `<span>` (`Caption.tsx`). Styles: `css/src/components/caption.module.css`.

- **WCAG / basis:** 4.1.2 Name, Role, Value / form accessibility patterns  
- **Severity:** **P1** · **Component default**  
  **Issue:** `CaptionProps` extends only `BaseProps` (`className`, `data-test`). It does **not** extend `BaseHtmlProps`, so consumers cannot pass `id`, `aria-*`, `role`, or `data-*` (beyond `data-test`) to the root `div`.  
  **Impact:** Pairing helper or error text with controls via `aria-describedby` / `aria-labelledby` typically requires a stable `id` on the description node. The current API forces wrappers or hacks.  
  **Repro (pattern):** Intended usage `<Caption id="email-hint">…</Caption>` is a type/API gap; the `id` is not applied to the visible caption container.  
  **Suggestion:** Extend `BaseHtmlProps<HTMLDivElement>` (or at least allow `id` and `aria-*`) on the root, forwarding after `extractBaseProps`.

- **WCAG / basis:** 1.3.1 Info and Relationships  
- **Severity:** **P1** · **Component default**  
  **Issue:** Body is rendered as `` `${children}` `` — `children` is typed as `React.ReactNode` but coerced to string.  
  **Impact:** Non-text nodes become useless strings (e.g. `"[object Object]"`), stripping semantics (links, abbreviations with `<abbr>`, visually hidden segments, etc.).  
  **Repro:** `<Caption><span>Hello</span></Caption>` does not render the span as markup; it stringifies.  
  **Suggestion:** Render `children` directly (e.g. wrap with `Text` only when the child is plain text, or pass `children` into `Text` if `Text` is extended to accept `ReactNode` safely).

- **WCAG / basis:** 1.1.1 Non-text Content / Best practice (decorative icons)  
- **Severity:** **P2** · **Component default**  
  **Issue:** Error `Icon` does not set `aria-hidden="true"`. `Icon` without `onClick` only forwards explicit `aria-hidden` via `useAccessibilityProps`; default is unset. Material-style `<i>` content may be announced in addition to the adjacent text.  
  **Impact:** Redundant or confusing announcements when the message text already states the error.  
  **Suggestion:** Pass `aria-hidden={true}` (or equivalent) for the decorative error glyph when error text is present.

- **WCAG / basis:** 3.3.1 Error Identification / 4.1.3 Status Messages (AA where applicable)  
- **Severity:** **P2** · **Consumer-dependent**  
  **Issue:** The component does not set `role="alert"`, `aria-live`, or `aria-invalid` on related fields.  
  **Impact:** Dynamic validation errors may not be announced unless the parent form pattern supplies live regions / associations.  
  **Suggestion:** Document recommended pairing (e.g. `aria-describedby` + live region on error) or optional props for assertive announcements.

- **WCAG / basis:** HTML / 2.4.3 Focus Order  
- **Severity:** **P3** · **Component default**  
  **Issue:** `.Caption--hidden` uses `display: none`, removing content from both display and the accessibility tree.  
  **Impact:** Appropriate when “hidden” means not applicable; if a “visually hidden but available to AT” pattern were desired, this class would be wrong (not currently claimed by the prop docs).

---

## Cross-cutting themes

1. **Caption API vs. other atoms** — `Text`, `Heading`, `Subheading`, and `Paragraph` all forward rich HTML/a11y attributes via `BaseHtmlProps`; `Caption` does not, creating an inconsistency and a concrete barrier to `aria-describedby` wiring (**P1**).

2. **Fixed heading levels** — `Heading` maps visual size to `h1`–`h5`; `Subheading` is fixed at `h4`. Document outline correctness remains **consumer-dependent**; lack of overrides is a recurring **P2** theme.

3. **Children typing vs. rendering** — `Paragraph` allows any `ReactNode`; `Caption` stringifies `ReactNode`. The latter is the stronger structural bug (**P1**).

---

## Suggested fix order (effort vs. impact)

1. **Caption:** Forward `id` / `BaseHtmlProps` and stop stringifying `children`.  
2. **Caption:** Mark error icon decorative for AT when paired with text.  
3. **GenericText / Heading / Subheading:** Tighten types and consider optional semantic level independent of visual size.  
4. **Paragraph:** Document or constrain children to phrasing/inline content where possible.

---

*End of report.*

# Link — structural ARIA / semantic audit

## Implementation files reviewed

| File | Role |
|------|------|
| `core/components/atoms/link/Link.tsx` | Component implementation |
| `core/components/atoms/link/index.tsx` | Re-exports |
| `core/components/atoms/_text/index.tsx` | `GenericText` primitive (`React.createElement(componentType, …)`) |
| `css/src/components/link.module.css` | Disabled styling / `pointer-events` (behavior-relevant) |

**APG pattern:** Native [hyperlink](https://www.w3.org/WAI/ARIA/apg/patterns/link/) — should be a real `<a href="…">` for navigation; otherwise prefer `<button>` for in-page actions.

---

## Component overview

`Link` renders a native **anchor** via `GenericText` with `componentType="a"`. It applies typography classes, optional `aria-disabled`, `tabIndex` (`0` when enabled, `-1` when `disabled`), and forwards remaining native anchor props (via `OmitNativeProps<HTMLLinkElement, 'onClick'>` plus a typed `onClick`). Disabled styling uses **`pointer-events: none`** on the disabled modifier classes, which blocks pointer activation in typical browsers.

**Root cause / rollup:** Most behavioral gaps stem from **optional `href`** combined with a **native `<a>`** (placeholder / click-only usage) and from **not forwarding a ref** to the underlying element (primitive limitation + `Link` not wrapped in `forwardRef`).

---

## Findings

### 1. Optional `href` encourages non-link or ambiguous `<a>` usage

- **WCAG / basis:** `4.1.2` (Name, Role, Value); `2.1.1` (Keyboard) when keyboard activation is inconsistent; **HTML** / **APG only** for “use `<button>` for actions.”
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — fails when `href` is omitted (or invalid) and the control is meant to be interactive (e.g. `onClick`-only “link”).
- **Repro:** Use `<Link onClick={…}>Do thing</Link>` without `href` and compare keyboard vs mouse behavior and how assistive tech exposes the control across browsers.
- **Issue + impact:** An `<a>` without a valid `href` is not a reliable hyperlink in the accessibility tree; keyboard support for activation can differ from a true link, and actions that do not navigate are the wrong semantic control. Users relying on role expectations or predictable keyboard behavior can be confused or blocked.
- **Suggestion:** Require `href` for `Link`, or render `<button type="button">` (or another appropriate pattern) when there is no navigation URL; document the rule in component docs.

---

### 2. `target="_blank"` without pairing `rel` (docs / typical usage)

- **WCAG / basis:** **Best practice** (security and stable external navigation context); not a pure WCAG DOM failure.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — e.g. default story uses `target: '_blank'` without `rel="noopener noreferrer"` (see `core/components/atoms/link/__stories__/index.story.jsx`).
- **Issue + impact:** Missing `rel` on `target="_blank"` is a known security and UX issue; some environments also expect explicit indication when a link opens a new window (often content-level, not component-level).
- **Suggestion:** Document that consumers should pass `rel="noopener noreferrer"` (and optional visible or visually hidden “opens in new tab” text where required by policy).

---

### 3. No `forwardRef` — ref does not reach the `<a>`

- **WCAG / basis:** **Best practice** / **2.4.3** (focus order and focus management are easier when refs work); not an automatic AA failure if consumers do not need refs.
- **Severity:** **P2**
- **Scope:** **Component default** — `Link` is a function component that does not forward refs; `GenericText` is `forwardRef` but `Link` never forwards the ref into it.
- **Issue + impact:** Consumers cannot attach a ref for programmatic focus (e.g. skip links, route change focus, dialog return focus), which complicates correct focus management patterns.
- **Suggestion:** Implement `Link` with `React.forwardRef` and pass `ref` to `GenericText` (or render `<a>` directly with the same props).

---

### 4. Unconditional `tabIndex={0}` when not disabled

- **WCAG / basis:** **HTML** / **Best practice**
- **Severity:** **P2**
- **Scope:** **Component default** — enabled links always get `tabIndex={0}` even when `href` is present (native links are already focusable).
- **Issue + impact:** Redundant `tabIndex` is usually harmless but overrides the default “no tabindex” state and can interact oddly with custom tab order or future focus logic; for `<a>` without `href`, `tabIndex={0}` is what makes the element focusable, which reinforces the questionable pattern in finding 1.
- **Suggestion:** Omit `tabIndex` when `href` is defined and the link is enabled; only set `tabIndex={0}` when necessary (e.g. placeholder `<a>` if that pattern is retained).

---

### 5. “Disabled” `<a>` is non-native; mitigation is partial by design

- **WCAG / basis:** **APG only** / **Best practice** (disabled controls pattern)
- **Severity:** **P2**
- **Scope:** **Component default** — uses `aria-disabled`, `tabIndex={-1}`, and CSS `pointer-events: none` (see `.Link--default-disabled` / `.Link--subtle-disabled`).
- **Issue + impact:** HTML does not define a disabled state for links; `aria-disabled` does not disable activation in all assistive technology paths the way `disabled` does on `<button>`. CSS blocks pointer events for mouse users; tab order is removed for keyboard users. This is a reasonable approximation but not equivalent to a native disabled button.
- **Suggestion:** Prefer removing `href`, using `role="link"` only if appropriate, or switching to a non-interactive element when “disabled”; document limitations. If the design must keep `<a>`, document that consumers should also cancel navigation in `onClick` when disabled if `href` remains.

---

### 6. Accessible name depends on children / passed ARIA

- **WCAG / basis:** `4.1.2`; `2.4.4` (Link Purpose (In Context))
- **Severity:** **P2** (P1 if the only content is non-text and no name is provided)
- **Scope:** **Consumer-dependent** — icon-only or unclear text requires `aria-label` / visible text; stories demonstrate `aria-label` alongside visible text (redundant but valid).
- **Issue + impact:** The component does not enforce a non-empty accessible name; empty or meaningless children produce a poor or empty name.
- **Suggestion:** Optional dev-time warning or docs: require visible text or `aria-label` when children are icon-only.

---

### 7. `hreflang` prop name vs React’s `hrefLang`

- **WCAG / basis:** **HTML** (attribute correctness)
- **Severity:** **P3**
- **Scope:** **Consumer-dependent** — `LinkProps` documents `hreflang`; React’s typings use `hrefLang` for `<a>`.
- **Issue + impact:** Minor inconsistency; consumers may pass the wrong prop name and miss language hinting on the link.
- **Suggestion:** Align the public API with `hrefLang` (and re-export types from React’s anchor attributes where possible).

---

### 8. `GenericText` `componentType: string`

- **WCAG / basis:** **Non-WCAG** (type safety / maintainability)
- **Severity:** **P3**
- **Scope:** Internal primitive; `Link` always passes `"a"`.
- **Issue + impact:** No direct user-facing a11y bug for `Link`; weaker guarantees if the primitive is reused incorrectly.
- **Suggestion:** Narrow the type (e.g. `keyof JSX.IntrinsicElements`) for internal use.

---

## Summary counts

| Severity | Count |
|----------|-------|
| P0 | 0 |
| P1 | 1 |
| P2 | 5 |
| P3 | 2 |

No **P0** issues identified in static review of the default DOM/ARIA structure for a typical `<Link href="…">` with text children.

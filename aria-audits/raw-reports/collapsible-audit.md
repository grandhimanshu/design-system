# Collapsible — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/collapsible/Collapsible.tsx` |
| Public exports | `core/components/atoms/collapsible/index.tsx` |
| Styles (layout, focus, motion) | `css/src/components/collapsible.module.css` |
| Footer trigger icon (name / decoration) | `core/components/atoms/icon/Icon.tsx` |
| `BaseProps` / attribute passthrough | `core/utils/types.tsx` (`extractBaseProps`) |
| Keyboard helpers | `core/accessibility/utils/index.ts` (`isEnterKey`, `isSpaceKey`) |
| Tests / snapshots (documented DOM) | `core/components/atoms/collapsible/__tests__/Collapsible.test.tsx`, `__tests__/__snapshots__/Collapsible.test.tsx.snap` |
| Stories (usage) | `core/components/atoms/collapsible/__stories__/index.story.jsx`, `CustomTrigger.story.jsx` |
| Representative consumers | `core/components/organisms/verticalNav/__stories__/**` (multiple stories compose `Collapsible`) |

**APG reference:** [Disclosure (Show/Hide)](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) — expand/collapse control with associated content; trigger should expose expanded state and (recommended) association to the controlled content.

---

## Component overview

`Collapsible` is a **controlled** layout panel: **`expanded`**, optional **`onToggle`**, optional bottom **`withTrigger`** footer, and **`hoverable`** hover-to-expand behavior on the **body** (`Collapsible-body`). The **inner shell** (`data-test="DesignSystem-Collapsible"`) receives only **`extractBaseProps`** output (**`className`**, **`data-test`**), so **no general `aria-*` / `id` passthrough** from `CollapsibleProps` onto the root or footer.

When **`withTrigger`** is true (default), the footer is a **`div`** with **`role="button"`**, **`tabIndex={0}`**, **click** and **Enter/Space** handlers (`isEnterKey` / `isSpaceKey`), and a single **`Icon`** (chevron direction reflects **`expanded`**). The **body** is a non-focusable **`div`** with **`onMouseEnter` / `onMouseLeave`** calling **`onToggle`** when **`hoverable`** allows it.

**Root cause / rollup:** The built-in trigger is a **custom disclosure control** without **`aria-expanded`** or a stable **region id** / **`aria-controls`**, and naming relies on **`Icon`** content inside a **`role="button"`** host. Fixing **disclosure semantics** and an **explicit accessible name** (with **`Icon`** marked **decorative**) addresses several findings together.

---

## Severity summary

**0 P0 · 4 P1 · 4 P2 · 1 P3**

---

## Findings (severity order)

### 1. Disclosure trigger does not expose expanded state (`aria-expanded`)

- **WCAG / basis:** 4.1.2 Name, Role, Value; APG Disclosure pattern.
- **Severity:** **P1**
- **Scope:** **Component default** whenever **`withTrigger={true}`** (default) and **`onToggle`** is used.
- **Repro:** Render with default footer; inspect or use AT on the footer control — it has **`role="button"`** but **no `aria-expanded`**, so the relationship between the control and the open/closed panel state is not exposed in the accessibility tree.
- **Issue + impact:** Screen reader users cannot tell from the trigger alone whether the panel is **expanded** or **collapsed**, which is core behavior for a disclosure/collapsible region.
- **Suggestion:** Set **`aria-expanded={expanded}`** on the footer trigger. If the pattern is strictly “width animation” and content is not removed from the tree, still expose the logical expanded state that **`onToggle`** / **`expanded`** represent.

---

### 2. No programmatic association between trigger and panel (`id` / `aria-controls`)

- **WCAG / basis:** Best practice; APG Disclosure (recommended association).
- **Severity:** **P2**
- **Scope:** **Component default** with **`withTrigger={true}`**.
- **Issue + impact:** Assistive technologies cannot reliably relate the **footer button** to the **body** that shows/hides or resizes content, making the structure harder to understand than a minimal disclosure implementation.
- **Suggestion:** Assign a stable **`id`** to the body (or a wrapper around panel content) and set **`aria-controls`** on the trigger to that **`id`**. Optionally use **`role="region"`** with **`aria-labelledby`** when the panel has a visible title (often consumer-supplied).

---

### 3. Built-in trigger lacks a dependable accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Component default** for the footer trigger (only child is **`Icon`**).
- **Repro:** Default story / tests: footer contains **`Icon`** (`<i>` + Material Symbols ligature). Many AT/browser combinations do **not** announce a clear, human purpose (e.g. “Expand sidebar”) from the glyph alone.
- **Issue + impact:** Users may hear **no name**, a **cryptic icon name**, or **inconsistent** output; voice control users may struggle to refer to the control.
- **Suggestion:** Provide a default **`aria-label`** (or **`aria-labelledby`**) on the trigger, e.g. derived from **`expanded`** (“Collapse …” / “Expand …”) plus optional **`triggerAriaLabel`** / **`aria-label`** prop for i18n. Mark **`Icon`** **`aria-hidden={true}`** so the **button name** is not duplicated or polluted by ligature text.

---

### 4. Focusable footer behaves as a button when `onToggle` is omitted

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (meaningful interaction).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — `onToggle` is optional in types; footer still renders with **`role="button"`** and **`tabIndex={0}`**.
- **Repro:** Render **`<Collapsible expanded={false}>`** without **`onToggle`**; tab to footer and activate — **`onToggleHandler`** no-ops because **`if (onToggle)`** guards all behavior, but the control remains **focusable** and **activatable** with no state change.
- **Issue + impact:** Keyboard and screen reader users get a **bogus interactive control** that appears operable but does nothing.
- **Suggestion:** If **`onToggle`** is missing, either **omit** the footer trigger entirely, render it **`aria-disabled="true"`** with **`tabIndex={-1}`**, or narrow types so **`withTrigger`** requires **`onToggle`**.

---

### 5. `withTrigger={false}` with default `hoverable={true}` leaves no keyboard path inside the component

- **WCAG / basis:** 2.1.1 Keyboard; APG (disclosure should be keyboard operable).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — intentional in stories like “external trigger,” but easy to miscompose.
- **Repro:** **`<Collapsible withTrigger={false} onToggle={fn} expanded={…} />`** with default **`hoverable`** — expansion is driven only by **mouseenter/mouseleave** on the body; **no** footer, **no** focusable internal toggle.
- **Issue + impact:** Keyboard-only users **cannot** change expanded state unless the **consumer** supplies a separate focusable control wired to the same state (as in `usingExternalTrigger.story.jsx`).
- **Suggestion:** Document **required** external keyboard trigger when using **`withTrigger={false}`**; or detect the combination and **warn in dev** / force **`hoverable={false}`** with documented requirement for an external **accessible** toggle.

---

### 6. Native `<button>` not used for the footer trigger

- **WCAG / basis:** HTML (preferred native semantics); project **AGENTS** / **CLAUDE** guidance (“`<button>` for actions”).
- **Severity:** **P2**
- **Scope:** **Component default** when **`withTrigger={true}`**.
- **Issue + impact:** **`div` + `role="button"`** relies on custom **keydown** handling and is easier to get wrong than a **native `<button>`** (built-in activation, disabled state, form constraints, and consistent AT support).
- **Suggestion:** Replace the footer **`div`** with **`<button type="button">`**, moving classes and handlers; keep **`aria-expanded`** / **`aria-controls`** as needed. Reset browser button styles to match design.

---

### 7. `extractBaseProps` prevents consumers from passing `aria-*` / `id` through `CollapsibleProps`

- **WCAG / basis:** Best practice; 4.1.2 (author flexibility for names/relationships).
- **Severity:** **P2**
- **Scope:** **Component default** — **`CollapsibleProps` extends `BaseProps` only**; **`{...baseProps}`** on the inner shell is **`className` + `data-test` only**.
- **Issue + impact:** Authors cannot attach **`aria-label`**, **`aria-labelledby`**, **`id`**, or **`data-*`** for integration tests to the **component root** or footer **via props** without forking or wrapping.
- **Suggestion:** Extend with **`BaseHtmlProps`** (or split **`triggerProps`** / **`regionProps`**) so common **`aria-*`** and **`id`** pass through to the appropriate nodes.

---

### 8. Collapsed + `hoverable` may leave focusable descendants in a clipped panel

- **WCAG / basis:** 2.4.3 Focus Order; 4.1.2 (visibility vs focusability) — **consumer-dependent** content.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when **`hoverable={true}`**, **`expanded={false}`**, and **children** include **links**, **buttons**, or other **tab stops** (common in **`VerticalNav`** stories).
- **Issue + impact:** The body uses **`overflow-hidden`** when collapsed; **focus** can still move to **off-screen or clipped** interactive elements, producing a **confusing tab order** or **invisible focused element**.
- **Suggestion:** When **`expanded` is false**, use **`visibility: hidden` / `inert` / `aria-hidden` + `tabIndex={-1}`** on a **consumer hook** or document that **children must not be focusable** while collapsed; ideally the **component** offers a **`collapseMode`** that removes **interactive descendants** from the tab order (e.g. **`inert`** on the body when collapsed).

---

### 9. Width transition without `prefers-reduced-motion` handling

- **WCAG / basis:** 2.3.3 Animation from Interactions (AAA); 2.3.4 Reduced Motion — **best practice / optional AA** context.
- **Severity:** **P3**
- **Scope:** **Component default** — **`collapsible.module.css`** sets **`transition: width 240ms`** on **`.Collapsible`**.
- **Issue + impact:** Users who enable **reduced motion** may still see **layout animation**; low severity for structural ARIA but relevant to motion-sensitive users.
- **Suggestion:** Under **`@media (prefers-reduced-motion: reduce)`**, set **`transition: none`** or shorten to **instant** width change.

---

## Positive notes

- **Enter** and **Space** are handled on the footer with **`preventDefault`** for Space, aligning with common **button** / **disclosure** keyboard expectations.
- **Focus visibility** on **`.Collapsible-footer`** uses **`:focus-visible`** with a token-based **outline** in **`collapsible.module.css`** (meets the design-system focus visibility direction).
- **Controlled** **`expanded`** API keeps state in React, which is compatible with correct **`aria-expanded`** wiring once added.

---

## Files cited (implementation)

```39:131:core/components/atoms/collapsible/Collapsible.tsx
export const Collapsible = (props: CollapsibleProps) => {
  // ... wrapper / body / optional footer with role="button", keyboard handlers, Icon
};
```

```35:42:core/utils/types.tsx
export const extractBaseProps = (props: Record<string, any>) => {
  const baseProps = ['className', 'data-test'];
  // ...
};
```

```10:18:css/src/components/collapsible.module.css
.Collapsible {
  display: inline-flex;
  flex-direction: column;
  /* ... */
  transition: width 240ms;
  transition-timing-function: cubic-bezier(0.4, 0.14, 0.3, 1);
}
```

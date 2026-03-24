# Icon — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/icon/Icon.tsx` |
| Public exports | `core/components/atoms/icon/index.tsx` |
| Accessibility helper (paired) | `core/accessibility/utils/useAccessibilityProps.ts` |
| Helper tests | `core/accessibility/utils/__tests__/useAccessibilityProps.test.tsx` |
| Base prop extraction | `core/utils/types.tsx` (`BaseProps`, `extractBaseProps`) |
| Styles (color / visibility; not hiding from AT by default) | `css/src/components/icon.module.css` |
| Unit tests / snapshots | `core/components/atoms/icon/__tests__/Icon.test.tsx`, `__tests__/__snapshots__/Icon.test.tsx.snap` |
| Stories | `core/components/atoms/icon/__stories__/index.story.jsx`, `__stories__/variants/*.story.jsx` |

**APG / HTML reference:** Decorative images and redundant icons: [WAI-ARIA — Hiding decorative elements](https://www.w3.org/WAI/tutorials/images/decision-tree/) (conceptually: hide decorative non-text from AT). Custom controls: [Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (native `<button>` preferred when the control is a button). HTML: `<i>` is a generic span-like element with no intrinsic interactive semantics.

---

## Component overview

`Icon` supports two render paths:

1. **Glyph path (default):** Renders a **Material Symbols** `<i>` with ligature text from the **`name`** prop, `fontSize` / `width` from **`size`**, and CSS module classes for appearance. It spreads **`extractBaseProps(props)`** (only **`className`** and **`data-test`**) and **`useAccessibilityProps(props)`**.

2. **Custom child path:** If **`children`** is a **valid React element**, it returns a **`<span>`** with only **`{...baseProps}`** and **`className`** — **no** `useAccessibilityProps` output, **no** material icon classes, **no** `style` for size.

**`useAccessibilityProps`** (when **`onClick`** is set): adds **`role`** (default **`button`**), **`tabIndex`** (default **`0`**), **`onClick`**, synthesized **`onKeyDown`** (Enter / Space for `role="button"`, Enter only for `link`, etc.), and passes through **`aria-label`** from the rest object. When **`onClick`** is **absent**, it only forwards **`aria-label`**, **`aria-labelledby`**, **`aria-describedby`**, and **`aria-hidden`** when those are provided.

**Rollup themes:** (1) **Interactive path in `useAccessibilityProps` drops several ARIA attributes** that the non-interactive path forwards. (2) **`<i role="button">`** instead of native **`<button>`**. (3) **Children branch** does not apply the same accessibility contract as the glyph branch. (4) **Naming** for icon-only controls is entirely **consumer-dependent**; **`IconProps`** under-documents **`aria-*`** compared to what the hook reads at runtime.

---

## Findings (severity order)

### 1. `useAccessibilityProps` omits `aria-labelledby`, `aria-describedby`, and `aria-hidden` when `onClick` is present

- **WCAG / basis:** **4.1.2** Name, Role, Value (accessible name / description must be programmatically determinable); **1.3.1** Info and Relationships where description is required.
- **Severity:** **P1**
- **Scope:** **Component default** for any **`Icon`** (or other consumer) that uses **`onClick`** and relies on **`aria-labelledby`** / **`aria-describedby`** / **`aria-hidden`** — the hook’s interactive return object only includes **`aria-label`**, not the other attributes (`core/accessibility/utils/useAccessibilityProps.ts`, lines 51–67 vs 37–49).
- **Repro:** Render `<Icon name="close" onClick={fn} aria-labelledby="label-id" />` (or with **`aria-describedby`** / **`aria-hidden`**). Inspect DOM: the `<i>` has **`role="button"`** and **`tabIndex`** but **no** **`aria-labelledby`** / **`aria-describedby`** / **`aria-hidden`**.
- **Issue + impact:** Authors cannot name or describe an interactive icon via **`aria-labelledby`** (e.g. visible text elsewhere) while keeping **`onClick`** on **`Icon`**. They cannot hide redundant glyphs on an interactive control via **`aria-hidden`** without losing keyboard handling from this hook pattern. Assistive technologies may get wrong or duplicate naming.
- **Suggestion:** In the **`onClick`** branch, merge through the same **`aria-labelledby`**, **`aria-describedby`**, and **`aria-hidden`** (and any other needed ARIA pass-through) as the non-interactive branch, in addition to **`aria-label`**.

---

### 2. Interactive `Icon` with `onClick` and no accessible name exposes an unnamed button

- **WCAG / basis:** **4.1.2** Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when **`onClick`** is set and neither **`aria-label`** nor (today) a working **`aria-labelledby`** is applied (see finding 1 for **`aria-labelledby`**). Ligature **`name`** text inside **`<i>`** is **not** a reliable accessible name across AT + icon fonts.
- **Repro:** `<Icon name="close" size={24} onClick={() => {}} />` with no **`aria-label`**; accessibility tree shows a button with no name (or an inconsistent name from glyph text).
- **Issue + impact:** Screen reader and voice-control users cannot identify the control; WCAG 4.1.2 fails for this usage.
- **Suggestion:** Document **`aria-label`** (or fixed **`aria-labelledby`**) as **required** when **`onClick`** is used; consider TypeScript (`onClick` implies required accessible name) or a dev warning. Fixing finding 1 enables **`aria-labelledby`** as an alternative.

---

### 3. Custom `children` branch drops `useAccessibilityProps` and glyph semantics

- **WCAG / basis:** **4.1.2**; **HTML** / **Best practice** (component API consistency).
- **Severity:** **P2**
- **Scope:** **Component default** whenever **`children`** is a valid element (`core/components/atoms/icon/Icon.tsx`, lines 171–177).
- **Repro:** Pass **`onClick`**, **`aria-hidden`**, or **`tabIndex`** together with **`children={<SomeSvg />}`**. The rendered root is **`<span {...baseProps} className={className}>`** only — **no** **`useAccessibilityProps`**, so **no** **`role="button"`**, **no** **`tabIndex`**, **no** keyboard delegation, **no** forwarded **`aria-*`** from the hook.
- **Issue + impact:** Props documented on **`Icon`** (e.g. **`onClick`**, **`aria-hidden`**) silently do nothing in this mode; authors may assume keyboard and naming behavior matches the glyph path.
- **Suggestion:** Apply **`useAccessibilityProps`** (and consistent **`data-test`** / styling policy) to the **`children`** wrapper, or remove **`onClick`** / **`onKeyDown`** from **`IconProps`** for the children API and document that the child must handle interactivity.

---

### 4. Interactive icon uses `<i role="button" tabIndex={0}>` instead of a native `<button>`

- **WCAG / basis:** **HTML** (prefer native interactive elements); **2.1.1** Keyboard (mitigated — hook adds Enter/Space); **2.4.7** Focus Visible (depends on global focus styles for `[role="button"]` / `i`); **APG** Button pattern (recommends native button when possible).
- **Severity:** **P2**
- **Scope:** **Component default** when **`onClick`** is used without replacing the root element.
- **Issue + impact:** Custom roles on **`<i>`** rely on shared keyboard logic and CSS for focus rings; behavior and discoverability are more fragile than a **`<button type="button">`** wrapping the glyph or an **`aria-hidden`** decorative icon inside a **`<button>`**.
- **Suggestion:** For **`onClick`**, render **`<button type="button">`** (reset styles via tokens/CSS modules) with **`aria-label`** / labeling props, or nest **`<span className={iconClass} aria-hidden>`** inside **`<button>`** when the visible label is elsewhere.

---

### 5. Non-interactive icons do not default to `aria-hidden`; ligature text may be announced

- **WCAG / basis:** **1.1.1** Non-text Content (decorative); **Best practice** / **APG** (redundant icons next to visible text).
- **Severity:** **P2** (polish / noise); **P3** when **`name`** accidentally provides a useful text cue (unreliable).
- **Scope:** **Consumer-dependent** — decorative icons should pass **`aria-hidden={true}`** explicitly today.
- **Repro:** `<Icon name="info" size={16} />` adjacent to visible **“Help”** text; some AT may announce both the word **“info”** (or ligature behavior) and the label.
- **Issue + impact:** Redundant or confusing announcements; authors must remember to hide decorative glyphs.
- **Suggestion:** Document **decorative vs meaningful** usage; optional prop **`decorative`** defaulting to **`true`** when **`onClick`** is absent is a breaking change risk — prefer documentation + lint/examples over silent default unless product accepts churn.

---

### 6. `IconProps` omits several ARIA / role fields that `useAccessibilityProps` accepts

- **WCAG / basis:** **Non-WCAG** (TypeScript / API clarity); indirectly affects **4.1.2** if authors skip naming because types omit **`aria-label`**.
- **Severity:** **P3**
- **Scope:** **Developer experience** — `IconProps` lists **`aria-hidden`** but not **`aria-label`**, **`aria-labelledby`**, **`aria-describedby`**, or **`role`** (`core/components/atoms/icon/Icon.tsx`, lines 50–92), while the hook implements them (`core/accessibility/utils/useAccessibilityProps.ts`).
- **Issue + impact:** Consumers may not discover supported attributes; excess-property rules may discourage valid props unless cast.
- **Suggestion:** Extend **`IconProps`** with the same ARIA surface the hook uses (and **`role`** where intentional), or extend **`BaseHtmlProps<HTMLElement>`** selectively for **`i`**.

---

### 7. `extractBaseProps` strips `id`, `title`, and other native attributes from the root

- **WCAG / basis:** **2.4.4** Link Purpose (in context); **4.1.2** (programmatic id for **`aria-labelledby`** / **`aria-controls`**); **Best practice**.
- **Severity:** **P3**
- **Scope:** **Component default** — only **`className`** and **`data-test`** reach the root (`core/utils/types.tsx`, lines 35–41).
- **Issue + impact:** Consumers cannot set **`id`** on **`Icon`** for labeling or scripting without forking; **`title`** is not forwarded (usually poor substitute for accessible name anyway).
- **Suggestion:** If broader pass-through is desired, spread a whitelisted subset of **`BaseHtmlProps`** onto the **`<i>`** / wrapper after accessibility props, or document that **`id` must live on a parent**.

---

## Positive notes

- **`useAccessibilityProps`** provides **Enter** / **Space** activation for **`role="button"`**, aligning with common button keyboard expectations when **`onClick`** is used.
- When **`onClick`** is **absent**, the hook **does not** force **`role`** / **`tabIndex`**, avoiding spurious focusable “buttons” (see tests in **`useAccessibilityProps.test.tsx`** — “does not add interactive props when onClick is not provided”).
- **`aria-hidden`** is explicitly documented on **`IconProps`** for decorative use when non-interactive.
- **`data-test="DesignSystem-Icon"`** supports consistent test selectors on the glyph path.

---

## Files summary (quick reference)

| Role | Path |
|------|------|
| Implementation | `core/components/atoms/icon/Icon.tsx` |
| Export barrel | `core/components/atoms/icon/index.tsx` |
| Paired a11y logic | `core/accessibility/utils/useAccessibilityProps.ts` |

**Severity summary (this component + paired hook behavior):** **P1:** 2 · **P2:** 3 · **P3:** 2

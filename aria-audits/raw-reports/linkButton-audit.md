# LinkButton — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/linkButton/LinkButton.tsx` |
| Public exports | `core/components/atoms/linkButton/index.tsx` |
| Icon child (glyph, a11y props) | `core/components/atoms/icon/Icon.tsx` |
| Icon accessibility helper | `core/accessibility/utils/useAccessibilityProps.ts` |
| Styles (layout only; not audited for contrast/focus) | `css/src/components/linkButton.module.css` |
| Tests (documented usage) | `core/components/atoms/linkButton/__tests__/LinkButton.test.tsx` |

**APG reference:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/). The control is implemented as a native **`<button>`** (action control with button semantics), not the [Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) pattern (`<a href>`).

---

## Component overview

`LinkButton` renders a **native `<button>`** with optional **Material `Icon`**, required text **`children`** (`React.ReactText`), optional **`disabled`**, and spreads **`BaseHtmlProps<HTMLButtonElement>`** (`{...rest}`) for **`aria-*`**, **`id`**, **`title`**, etc. Keyboard activation is handled by the **user agent** for `<button>` (Enter / Space). There is **no** custom popup, list, or live region in this component.

**Root cause / rollup:** When **`icon`** is set, markup around the icon uses a **`<div>`** inside the button and leaves the **icon glyph** exposed to assistive technologies without **`aria-hidden`**. Both issues stem from the same icon-rendering branch and can be addressed together by switching the wrapper to **phrasing-level** elements and marking decorative icons hidden when adjacent to visible text.

---

## Findings (severity order)

### 1. Icon with empty or whitespace-only `children` yields an unnamed control

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when `icon` is used with **`children=""`** or visually meaningless whitespace, or when authors rely on the icon alone without supplying **`aria-label`** / **`aria-labelledby`** on the button via props.
- **Repro:** Render `<LinkButton icon="events" children="" />` (or equivalent) without `aria-label`; the focused control has **no computed accessible name** while still being activatable if not disabled.
- **Issue + impact:** Screen reader users get **no spoken name** for the control; voice control users may struggle to target it by name.
- **Suggestion:** In docs/types, discourage empty text; if product needs icon-only link-styled actions, require **`aria-label`** (or extend the API to enforce a name when `children` is empty and `icon` is set). Optionally warn in dev or narrow types.

---

### 2. Non-phrasing content (`<div>`) inside `<button>` when `icon` is present

- **WCAG / basis:** HTML (content model); 1.3.1 Info and Relationships (robust, predictable structure); Best practice.
- **Severity:** **P2**
- **Scope:** **Component default** whenever **`icon`** is truthy (wrapper around `Icon`).
- **Issue + impact:** In HTML, **`button`**’s content model is **phrasing content**; **`div`** is **flow** content, so **`button` → `div` → …** is **invalid**. Browsers repair this inconsistently; some assistive technologies or future parsers may expose **unexpected structure** or traversal quirks.
- **Suggestion:** Replace the wrapper **`div`** with **`span`** (phrasing) and achieve layout via **CSS** (e.g. `display: inline-flex` / flex on the button) so the DOM stays valid without changing visuals.

---

### 3. Adjacent icon glyph not marked decorative for assistive technologies

- **WCAG / basis:** Best practice; APG only (redundant non-text alongside visible label).
- **Severity:** **P2**
- **Scope:** **Component default** when **`icon`** and visible **`children`** are both present.
- **Issue + impact:** `Icon` renders an **`<i>`** with the **icon ligature/name** as text content. Without **`aria-hidden="true"`**, some screen readers may announce **both** the icon name and the button’s name from **`children`**, causing **redundant or confusing** output.
- **Suggestion:** Pass **`aria-hidden={true}`** to **`Icon`** in the “icon + label text” configuration (or set it inside `LinkButton` whenever `children` supplies the accessible name).

---

### 4. Component name vs. role: navigation should not use this control

- **WCAG / basis:** 2.4.4 Link Purpose (In Context); 4.1.2 Name, Role, Value (expectations for links vs buttons); Best practice.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — applies when authors use **`LinkButton`** for **in-app or external URL navigation** instead of a real **`<a href>`** / **`Link`**.
- **Issue + impact:** Users expect a **link** to behave like a link (e.g. open in new tab, copy URL, screen reader “link” role). A **`button`** does not expose that contract; **misused** instances harm predictability and discoverability.
- **Suggestion:** Document clearly that **`LinkButton`** is for **actions** (submit, open dialog, etc.) with link-like visuals; route real navigation to **`Link`** / **`href`**.

---

### 5. JSDoc claims default `tabIndex` of `0` but `defaultProps` omits it

- **WCAG / basis:** Non-WCAG (documentation accuracy).
- **Severity:** **P3**
- **Scope:** **Component default** (docs only).
- **Issue + impact:** Authors may assume **`tabIndex={0}`** is always set explicitly; native **`<button>`** is already in the tab order when not **`disabled`**, so behavior is usually correct but **documentation is misleading**.
- **Suggestion:** Align JSDoc with implementation (state that the native button is focusable by default) or add **`tabIndex: 0`** to **`defaultProps`** if explicit parity is desired.

---

## Positive notes (no finding)

- **Native `<button>`** for an action-styled control: appropriate **role** and **keyboard** behavior without custom **`role`** overrides in the component itself.
- **`disabled`** maps to the **native disabled** state (removed from tab order, not activated).
- **`type`** defaults to **`"button"`**, reducing accidental form submission.
- **`...rest`** allows consumers to supply **`aria-label`**, **`aria-labelledby`**, **`aria-describedby`**, **`id`**, etc., for correct **relationships** when used intentionally.

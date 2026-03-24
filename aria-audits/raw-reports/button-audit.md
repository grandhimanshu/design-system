# Button — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| Component implementation | `core/components/atoms/button/Button.tsx` |
| Public exports | `core/components/atoms/button/index.tsx` |
| Icon child (glyph, a11y props) | `core/components/atoms/icon/Icon.tsx` |
| Icon accessibility helper | `core/accessibility/utils/useAccessibilityProps.ts` |
| Spinner (loading subtree) | `core/components/atoms/spinner/Spinner.tsx` |
| Tooltip wrapper (icon-only + tooltip path) | `core/components/molecules/tooltip/Tooltip.tsx` |
| Styles (relevant to a11y tree / visibility) | `css/src/components/button.module.css` |
| Tests / stories (documented usage) | `core/components/atoms/button/__tests__/Button.test.tsx`, `core/components/atoms/button/__stories__/**` |

**APG reference:** [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Optional toggle semantics: [Button — toggle pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) (pressed state via `aria-pressed` when the control behaves as a toggle).

---

## Component overview

`Button` renders a **native `<button>`** with optional **`Icon`**, optional text **`children`** (`React.ReactText` only), optional **`loading`** / **`disabled`**, optional **`selected`** (visual styling for basic/transparent appearances), optional **`tooltip`** (used for icon-only naming and, when `icon && tooltip && !children`, wraps the inner button in **`Tooltip`**). It sets **`aria-busy`** when loading, derives **`aria-label`** from **`tooltip`** when there are no **`children`**, and spreads **`BaseHtmlProps<HTMLButtonElement>`** (`{...rest}`) after explicit attributes so consumers can supply **`aria-expanded`**, **`aria-controls`**, **`id`**, etc. Keyboard activation for the native control is handled by the **user agent** (Enter / Space).

**Root cause / rollup:** Several findings share the **icon branch**: a **`<div>`** wrapper around **`Icon`**, **`Icon`** not marked **decorative** when text **`children`** supply the name, and **icon-only** configurations that rely on authors passing **`tooltip`** and/or **`aria-label`**. Addressing wrapper semantics, **`aria-hidden`** on decorative icons, and documented/enforced naming for icon-only buttons reduces multiple issues together.

---

## Findings (severity order)

### 1. `selected` state is visual-only — no `aria-pressed` (or alternative) on the control

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Component default** whenever **`selected={true}`** is used (styling is applied; no corresponding ARIA state is set).
- **Repro:** Use `Button` with `selected` and `appearance="basic"` or `transparent` as documented; assistive technologies do not reliably expose **on/off** or **pressed** state for a toggle-styled control.
- **Issue + impact:** Users who rely on screen readers or other AT may not perceive that the button is in a **distinct selected/pressed** state, which breaks parity with the visual treatment described in props.
- **Suggestion:** When **`selected`** represents a toggle, map it to **`aria-pressed={selected}`** (and document that consumers must not use **`selected`** for purely decorative styling). If the control is a single-select in a group, consider whether **`aria-pressed`** or a different pattern (e.g. `role="radio"` in a `radiogroup`) matches the real behavior.

---

### 2. Loading state may remove the visible label from the accessibility name

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.6 Headings and Labels (context for actions).
- **Severity:** **P1**
- **Scope:** **Component default** for **`loading`** with non-empty **`children`** and **no** explicit **`aria-label`** / **`aria-labelledby`** on the button.
- **Repro:** Render `<Button loading>Save</Button>` without `aria-label`; in common engines, the label text is wrapped in **`Text`** using **`Button-text--hidden`** (`visibility: hidden` in `button.module.css`), which typically **excludes** that subtree from the accessibility tree, while the **`Spinner`** exposes a name like **“Loading”**.
- **Issue + impact:** The control may be announced as **busy** and **“Loading”** without **“Save”**, so users may not know **which** action is in progress.
- **Suggestion:** Prefer an **sr-only / clip** visually-hidden pattern that keeps the label in the **accessible name**, or mirror **`children`** into **`aria-label`** while loading (stable string), or set **`aria-hidden="true"`** on the spinner and rely on **`aria-busy`** plus an unchanged name from visible or off-screen text—avoid **`visibility: hidden`** on the sole source of the name.

---

### 3. Icon-only button without `tooltip`, `children`, or `aria-label` has no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — occurs when **`icon`** is set, **`children`** are omitted, and neither **`tooltip`** nor **`aria-label`** / **`aria-labelledby`** (via props) is provided.
- **Repro:** `<Button icon="close" />` with no `aria-label` or `tooltip`; focused control has no computed accessible name.
- **Issue + impact:** Screen reader and voice-control users cannot identify the purpose of the control.
- **Suggestion:** Document as **required** for icon-only usage; narrow types or add a dev warning when **`icon`** is set without **`children`** and without an accessible name source. The existing **`tooltip`** → **`aria-label`** shortcut helps when authors use **`tooltip`** consistently.

---

### 4. Non-phrasing content (`<div>`) inside `<button>` when `icon` is present

- **WCAG / basis:** HTML (content model); 1.3.1 Info and Relationships; Best practice.
- **Severity:** **P2**
- **Scope:** **Component default** whenever **`icon`** is truthy (wrapper around **`Icon`**).
- **Issue + impact:** **`button`** allows **phrasing** content; **`div`** is **flow** content, so **`button` → `div` → …** is **invalid** HTML. Repair behavior varies; structure may be less predictable for AT or validation tooling.
- **Suggestion:** Replace the icon wrapper **`div`** with **`span`** and use CSS (`display: inline-flex`, flex on the button) to preserve layout.

---

### 5. Adjacent icon glyph not marked decorative when text `children` provide the name

- **WCAG / basis:** Best practice; APG only (redundant non-text alongside visible label).
- **Severity:** **P2**
- **Scope:** **Component default** when both **`icon`** and visible **`children`** are present.
- **Issue + impact:** **`Icon`** renders an **`<i>`** with **ligature/name** text content. Without **`aria-hidden="true"`**, some screen readers may announce **icon name + button text**, causing **redundant or noisy** output.
- **Suggestion:** Pass **`aria-hidden={true}`** to **`Icon`** when **`children`** supply the accessible name (or handle inside **`Button`** for the “icon + label” case).

---

### 6. Nested live region: `Spinner` (`role="status"`, `aria-live`) inside `aria-busy` button

- **WCAG / basis:** Best practice (live region / busy semantics).
- **Severity:** **P2**
- **Scope:** **Component default** when **`loading`** is true ( **`Spinner`** is a child of the button).
- **Issue + impact:** **`aria-busy="true"`** already signals an update; **`Spinner`** adds **`role="status"`** and **`aria-live="polite"`**, which can produce **duplicate or chatty** announcements (“Loading”, busy state) depending on the AT.
- **Suggestion:** Prefer **`aria-hidden="true"`** on the spinner when the button’s **`aria-busy`** and **accessible name** convey enough context, or use a decorative spinner without **`aria-live`** inside busy controls.

---

### 7. `type` prop optional — implicit `submit` in forms

- **WCAG / basis:** HTML; Non-WCAG (predictable behavior).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — relevant when **`type`** is omitted and the button sits inside a **`<form>`**.
- **Issue + impact:** Missing **`type`** defaults to **`submit`**, which can cause **unintended submission** on Enter from other fields; not a pure ARIA issue but affects operability in forms.
- **Suggestion:** Default **`type="button"`** in the component or document that authors must set **`type`** explicitly in forms.

---

### 8. `Tooltip` wrapper only used for hover; icon-only naming still relies on `aria-label` equivalence

- **WCAG / basis:** Best practice.
- **Severity:** **P3** (enhancement / documentation clarity).
- **Scope:** **Component default** for the **`icon && tooltip && !children`** branch.
- **Issue + impact:** **`Tooltip`** is hover-driven via **`Popover`**; keyboard-only users may not see the tooltip surface, but **`aria-label`** (from **`tooltip`**) still provides the **name**—behavior is generally acceptable. Authors might mistakenly assume the tooltip is the **only** required affordance.
- **Suggestion:** Clarify in docs that **`tooltip`** duplicates as **`aria-label`** for icon-only buttons so the name is available without hover.

---

## Positive notes (no finding)

- Uses a **native `<button>`** (correct role and keyboard behavior by default).
- **`disabled={disabled || loading}`** prevents activation while loading; **`aria-busy`** is set when loading.
- **`forwardRef`** preserves focus management scenarios for parents.
- **`BaseHtmlProps`** spread allows **`aria-expanded`**, **`aria-controls`**, **`aria-describedby`**, **`id`**, etc., for composite patterns (menus, dialogs) without the component stripping them.
- **`Icon`** does not receive **`onClick`** from **`Button`**, so **`useAccessibilityProps`** does not promote the glyph to a nested **interactive** role.

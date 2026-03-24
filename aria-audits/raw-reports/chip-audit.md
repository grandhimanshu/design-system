# Chip & ChipGroup — structural ARIA / semantic audit

## Implementation files reviewed

| Area | Path |
|------|------|
| **Chip** (public API) | `core/components/atoms/chip/Chip.tsx` |
| Chip exports | `core/components/atoms/chip/index.tsx` |
| **GenericChip** (DOM / behavior — shared implementation) | `core/components/atoms/_chip/index.tsx` |
| **ChipGroup** | `core/components/atoms/chipGroup/ChipGroup.tsx` |
| ChipGroup exports | `core/components/atoms/chipGroup/index.tsx` |
| Styles (focus / disabled / layout) | `css/src/components/chip.module.css`, `css/src/components/chipGroup.module.css` |
| Icon (glyph subtree) | `core/components/atoms/icon/Icon.tsx` (via `GenericChip`) |
| Tooltip wrapper (truncation path) | `core/components/molecules/tooltip/Tooltip.tsx` |
| Tests / stories (documented usage) | `core/components/atoms/chip/__tests__/Chip.test.tsx`, `core/components/atoms/_chip/__tests__/_chip.test.tsx`, `core/components/atoms/chipGroup/__tests__/chipGroup.test.tsx`, `core/components/atoms/chip/__stories__/**`, `core/components/atoms/chipGroup/_stories_/**` |

**Note:** `Chip` is a thin wrapper around **`GenericChip`**. Any structural ARIA finding on the rendered tree applies to **both** `Chip` and any other consumer of `GenericChip`.

**APG references (informative):** There is no dedicated “chip” role in WAI-ARIA. Chips are usually modeled as **[Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)** (including toggle via `aria-pressed`), **[Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)** / **`menuitemcheckbox`**, or options inside a composite widget. Groups of related chips often use **`role="group"`** (with **`aria-label`** / **`aria-labelledby`**) or a **toolbar** / **listbox** pattern when selection is constrained.

---

## Component overview

### Chip / GenericChip

- Renders a **focusable** outer **`div`** with **`role="button"`** (overridable via **`role`** on `Chip`), **`tabIndex={0}`** when not disabled (**`-1`** when disabled), **`onClick`**, and **`onKeyDown`** that activates on **Enter** / **Space** (with **`preventDefault`**).
- **`type === 'selection'`** adds state props via **`getAriaProps()`**: **`aria-pressed`** when **`role`** resolves to **`button`**; **`aria-checked`** for **`checkbox`** / **`menuitemcheckbox`**; **`aria-selected`** for **`option`** / **`tab`** / **`treeitem`**.
- Optional **prefix icon**, **string or `ReactElement` label**, and optional **clear** affordance implemented as a **second** **`div`** with **`role="button"`**, **`aria-label="Remove"`**, **`tabIndex`**, **`onClick`**, and **`onKeyDown`** (Enter / Space) with **`stopPropagation`** on the close handler.
- The whole control can be wrapped in **`Tooltip`** when truncated text is detected (**`showTooltip={isTextTruncated}`**); when not truncated, **`Tooltip`** returns children without **`Popover`**.
- **`Chip`** forwards **`role`**, **`aria-label`**, and **`aria-labelledby`** to **`GenericChip`**. **`extractBaseProps`** only passes **`className`** and **`data-test`** (see `core/utils/types.tsx`), so **arbitrary HTML/ARIA passthrough is not available** beyond the explicit chip props.

### ChipGroup

- Renders a **plain `div`** container with layout class; each entry in **`list`** is wrapped in a **`span`** and rendered as a **`Chip`**, with **`onClick` / `onClose`** delegated to group-level handlers.
- Only **`role`** is destructured from each **`list`** item and passed through to **`Chip`**; **`aria-label`** / **`aria-labelledby`** on list objects are **not** forwarded even though **`Chip`** supports them.

---

## Findings (severity order)

### 1. Nested **`role="button"`** — clear control inside the main chip button

- **WCAG / basis:** 4.1.2 Name, Role, Value; HTML / ARIA (interactive descendants); **Best practice** (APG — avoid nested interactive controls).
- **Severity:** **P0**
- **Scope:** **Component default** whenever **`clearButton`** is **true** (outer wrapper **`role="button"`**, inner clear **`role="button"`**).
- **Repro:** Render a chip with **`clearButton`** (e.g. `ChipGroup` selection story); inspect the accessibility tree: two **button** roles where one is **descendant** of the other.
- **Issue + impact:** Nesting **buttons** (native or **`role="button"`**) is **invalid** and confuses assistive technologies and keyboard semantics. Users may get **duplicate** or **ambiguous** actions, unpredictable **focus** / **activation** behavior, or incorrect announcements.
- **Suggestion:** Use **sibling** native **`<button type="button">`** elements (or a single **`button`** + separate control **outside** the primary button’s accessibility subtree). Typical pattern: flex row with **primary** **`button`** and **dismiss** **`button`**, **not** one inside the other. Ensure only one tab stop per logical “chip” if that matches the design, or two **explicit** stops for **two** distinct actions **without** role nesting.

---

### 2. Primary chip and clear affordance use **`div` + `role="button"`** instead of **`<button>`**

- **WCAG / basis:** 4.1.2; HTML (native semantics first — project **CLAUDE.md**); **Best practice**.
- **Severity:** **P1**
- **Scope:** **Component default** for all interactive chips.
- **Repro:** Inspect DOM: outer chip and clear control are **`div`** elements with **`role="button"`** and scripted **Space** / **Enter** handling.
- **Issue + impact:** Custom buttons miss **native** behaviors (e.g. **`disabled`** attribute semantics, consistent **form** behavior, platform **activation** quirks). Authors must duplicate behavior already provided by **`<button>`**.
- **Suggestion:** Prefer **`<button type="button">`** for both the main chip action and the dismiss control (styled unambiguously), unless a documented composite pattern requires a different role.

---

### 3. Disabled state lacks **`aria-disabled`** on the custom button

- **WCAG / basis:** 4.1.2 Name, Role, Value (state).
- **Severity:** **P1**
- **Scope:** **Component default** when **`disabled={true}`** on **`Chip`** ( **`tabIndex={-1}`** only).
- **Repro:** Disable a chip; in the accessibility inspector, the control may still expose **button** without an **unavailable** state in some AT/engine combinations.
- **Issue + impact:** Without **`aria-disabled="true"`** (or **`disabled`** on a native **`<button>`**), screen readers may not consistently report the control as **disabled** while it retains **`role="button"`**.
- **Suggestion:** Set **`aria-disabled={disabled}`** on the main wrapper (and align the clear subtree when disabled). Pair with **`pointer-events`** / **handler guards** as already done in **`Chip`**.

---

### 4. **`outline: none`** on disabled chip styles

- **WCAG / basis:** 2.4.7 Focus Visible (Minimum); **Best practice** (project rules: no **`outline: none`** without a visible replacement).
- **Severity:** **P1** (if the element can receive focus); **P2** if strictly non-focusable in all paths.
- **Scope:** **Component default** — e.g. **`.Chip-action--disabled`**, **`.Chip-selection--disabled:focus-visible`**, **`.Chip-input--disabled:focus-visible`**, **`.Chip-selection--selectedDisabled:focus-visible`**, etc. in `chip.module.css`.
- **Repro:** Compare focus outline behavior for disabled vs enabled chips; disabled rules remove outline on **`:focus-visible`** / base disabled classes.
- **Issue + impact:** If focus ever lands on these nodes (programmatic focus, browser quirks, or future prop changes), **focus may be invisible**. Even when **`tabIndex={-1}`**, **`:focus`** rules can still be risky for maintenance.
- **Suggestion:** Rely on **non-focusable** disabled controls and **avoid** **`outline: none`**, or provide an **equally visible** non-outline focus indicator that still meets **3:1** contrast. Prefer **native** **`disabled`** **`<button>`** where possible.

---

### 5. **`ChipGroup` does not forward per-chip `aria-label` / `aria-labelledby` from `list` items

- **WCAG / basis:** 4.1.2; **Best practice** (named controls in groups).
- **Severity:** **P1**
- **Scope:** **Component default** for **`ChipGroup`** — authors cannot supply **`aria-label`** / **`aria-labelledby`** via **`list`** objects without modifying **`ChipGroup`**.
- **Repro:** Pass **`aria-label`** on an object in **`list`**; it is ignored because **`ChipGroup`** only spreads **`role`** into **`Chip`**.
- **Issue + impact:** **`label`** as **`ReactElement`** or ambiguous visible text may **lack** a reliable **accessible name**; authors have no supported way to name chips at the group API level.
- **Suggestion:** Destructure and forward **`aria-label`** / **`aria-labelledby`** (and any other documented a11y props) from each **`list`** item to **`Chip`**.

---

### 6. **`ChipGroup` container has no group semantics for related chips

- **WCAG / basis:** 1.3.1 Info and Relationships; **Best practice** / **APG** (related controls).
- **Severity:** **P2**
- **Scope:** **Component default** — outer element is a **generic `div`** with no **`role`** or **`aria-*`**.
- **Repro:** Render **`ChipGroup`** with multiple selection chips; screen reader users hear isolated buttons with **no** explicit “group” relationship.
- **Issue + impact:** Related filters/tags are harder to understand as a **set** (purpose, boundaries, and how many items belong together).
- **Suggestion:** Support optional **`aria-label`** / **`aria-labelledby`** on **`ChipGroup`** and render **`role="group"`** (or document a **toolbar** / **listbox** pattern when appropriate). For **single-select** semantics, consumers may need **`radiogroup`** / **`role="radio"`** — that is **consumer-dependent** but should be **documented**.

---

### 7. **Flow content (`div`) inside a `role="button"` subtree**

- **WCAG / basis:** HTML (content model); 1.3.1; **Best practice**.
- **Severity:** **P2**
- **Scope:** **Component default** for **string** labels — **`renderLabel()`** wraps content in a **`div`** (**.`Chip-text--truncate`**) inside the **button** **`div`**.
- **Repro:** Inspect DOM under **`DesignSystem-GenericChip--Wrapper`**.
- **Issue + impact:** **`button`** (and **`role="button"`**) expects **phrasing** content; nested **`div`** is **flow** content and yields **invalid** HTML in strict terms; repair and AT behavior can vary.
- **Suggestion:** Use **`span`** with **`display`** / layout via CSS modules to preserve truncation and flex layout.

---

### 8. Leading **`Icon` + visible text label — possible redundant announcement

- **WCAG / basis:** **Best practice**; **APG only** (redundant non-text with text label).
- **Severity:** **P2**
- **Scope:** **Component default** when **`icon`** is set alongside a **string** **`label`**.
- **Issue + impact:** **`Icon`** may expose **ligature / name** text; some AT may announce **icon + label** redundantly.
- **Suggestion:** Pass **`aria-hidden={true}`** on the **leading** icon when the **label** supplies the **accessible name** (mirror patterns used elsewhere in the design system).

---

### 9. **`aria-label="Remove"` on clear control is fixed English

- **WCAG / basis:** 3.1.2 Language of Parts (if UI language varies); **Best practice** (i18n).
- **Severity:** **P2**
- **Scope:** **Component default** for **`clearButton`**.
- **Issue + impact:** Non-English locales get an English **“Remove”** name; may also be vague without context (which item is removed).
- **Suggestion:** Use **`Intl`** / messages API or allow a **`clearAriaLabel`** prop; prefer a phrase that includes the chip’s visible name when it is a stable string.

---

### 10. **`list.map((item, ind) => … key={ind})` in `ChipGroup`**

- **WCAG / basis:** **Non-WCAG** (React list stability); **Best practice** for stateful / reorderable lists.
- **Severity:** **P3**
- **Scope:** **Component default**.
- **Issue + impact:** Reordering **`list`** can confuse **focus** and **state** restoration; not strictly an ARIA bug but affects **keyboard** UX for dynamic lists.
- **Suggestion:** Prefer stable **`key`** from **`name`** or **`id`** when available.

---

## Positive notes

- **`type === 'selection'`** maps **`selected`** to **`aria-pressed`**, **`aria-checked`**, or **`aria-selected`** depending on **`role`** — a thoughtful alignment with multiple APG patterns.
- **Enter** / **Space** activation is implemented on the main chip; the clear handler uses **`stopPropagation`** so activation does not double-fire the parent **`onClick`**.
- **`:focus-visible`** outlines are defined for **action**, **selection**, and **input** interactive styles; clear **icon** region has **focus-visible** styling when not disabled.
- **Truncation** path surfaces full text via **`Tooltip`** when overflow is detected (`Tooltip` short-circuits when **`showTooltip`** is false).
- **`Chip`** documents **`role`**, **`aria-label`**, and **`aria-labelledby`** for authors who use **`Chip`** directly.

---

## Severity summary (this audit)

| Tier | Count |
|------|-------|
| **P0** | 1 |
| **P1** | 4 |
| **P2** | 4 |
| **P3** | 1 |

**Roll-up themes:** (1) **Nested interactive / fake buttons** — outer **`role="button"`** + inner clear **`role="button"`** and **`div`**-based buttons share one fix direction (**native sibling buttons**, no nesting). (2) **Disabled + focus CSS** — **`aria-disabled`** and **`outline: none`** on disabled classes should be addressed together. (3) **`ChipGroup` API gaps** — group labeling and per-item **`aria-*`** forwarding improve real-world usage without changing **`Chip`** internals.

# Card — structural ARIA / semantic HTML audit

## Severity summary (this scope)

| Tier | Count |
|------|------:|
| **P0** | 0 |
| **P1** | 5 |
| **P2** | 2 |
| **P3** | 4 |

---

## Implementation scope

### Core `Card` family (layout / container)

| File | Role |
|------|------|
| `core/components/atoms/card/Card.tsx` | `Card` root: `forwardRef` → `<div>`, `BaseHtmlProps<HTMLDivElement>` + `{...rest}` after explicit props |
| `core/components/atoms/card/index.tsx` | Re-exports |
| `core/components/atoms/cardHeader/CardHeader.tsx` | `CardHeader`: `<div>`, `extractBaseProps` only |
| `core/components/atoms/cardHeader/index.tsx` | Re-exports |
| `core/components/atoms/cardBody/CardBody.tsx` | `CardBody`: `<div>`, `extractBaseProps` only |
| `core/components/atoms/cardBody/index.tsx` | Re-exports |
| `core/components/atoms/cardFooter/CardFooter.tsx` | `CardFooter`: `<div>`, `extractBaseProps` only |
| `core/components/atoms/cardFooter/index.tsx` | Re-exports |
| `core/components/atoms/cardSubdued/CardSubdued.tsx` | `CardSubdued`: `forwardRef` → `<div>`, `BaseHtmlProps` + `{...rest}` |
| `core/components/atoms/cardSubdued/index.tsx` | Re-exports |

### Styling (reviewed for focus / interaction only)

| File | Role |
|------|------|
| `css/src/components/card.module.css` | `Card`, `Card-header`, `Card-body`, `Card-footer` (+ modifier) |
| `css/src/components/cardSubdued.module.css` | Subdued surface / border variants |

### Shared types

| Dependency | Relevance |
|------------|-----------|
| `core/utils/types.tsx` | `BaseProps`, `BaseHtmlProps`, `extractBaseProps` — extraction is **`className`** and **`data-test`** only (no `id`, `aria-*`, `role`, etc.) |

### Related interactive card atoms (same product area; not composed inside `Card.tsx`)

| File | Role |
|------|------|
| `core/components/atoms/actionCard/ActionCard.tsx` | Clickable marketing-style card: `<div role="link" tabIndex={0\|-1}>`, Enter-only keyboard |
| `core/components/atoms/selectionCard/SelectionCard.tsx` | Selectable card: `<div role="checkbox" aria-checked tabIndex={0\|-1}>`, Space + click |

Stories sampled for authoring patterns:

| File | Note |
|------|------|
| `core/components/atoms/card/__stories__/nested.story.jsx` | Nested cards + `CardHeader` / `CardBody` / `CardFooter` |
| `core/components/atoms/card/__stories__/empty.story.jsx` | `Card` + header/body |
| `core/components/atoms/actionCard/__stories__/index.story.jsx` | `aria-label` on `ActionCard` |
| `core/components/atoms/selectionCard/__stories__/*.story.jsx` | Selection groups |

---

## Component overview

**APG / HTML:** The design system splits **presentational cards** (`Card`, `CardSubdued`, `CardHeader`, `CardBody`, `CardFooter`) from **interactive card widgets** (`ActionCard`, `SelectionCard`). Presentational roots correctly default to **non-widget** `<div>` semantics. Interactive variants use **custom roles** on `<div>` and must fully expose **name, role, value/state**, and **keyboard** behavior per [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) patterns.

**Root cause / rollup:** **`CardHeader`, `CardBody`, and `CardFooter` do not extend `BaseHtmlProps` and only spread `extractBaseProps`**, so authors **cannot** pass `id`, `aria-labelledby`, `aria-label`, `role`, or other HTML attributes through the public API without an extra wrapper element. **`Card` and `CardSubdued`** align with the preferred pattern (`BaseHtmlProps` + `{...rest}`).

---

## Findings — `Card`

### 1. Root is a generic `<div>` with full HTML pass-through — appropriate baseline

- **WCAG / basis:** `4.1.2` (Name, Role, Value) — **HTML** / **Best practice** for a non-interactive layout container
- **Severity:** **P3** (positive baseline)
- **Scope:** **Component default**
- **Repro:** Render `<Card><span>Content</span></Card>` — no tab stop, no spurious widget role unless the author adds one via `...rest`.
- **Issue + impact:** None for the default; `Card` behaves as a styled grouping element.
- **Suggestion:** Keep; document optional `role="region"` + `aria-labelledby` when the card is a named landmark in a page.

### 2. No built-in landmark or heading association

- **WCAG / basis:** `1.3.1` (Info and Relationships), `2.4.1` (Bypass Blocks) — **Best practice** / **APG only** (landmark pattern)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent**
- **Repro:** Use `Card` as the sole grouping for a titled panel but omit `role`, `aria-labelledby`, and visible heading structure inside.
- **Issue + impact:** Screen reader users get less efficient navigation by landmark; structure relies entirely on author markup inside children.
- **Suggestion:** Document a recommended pattern: visible `Heading` + optional `role="region"` and `aria-labelledby` pointing at the heading `id` (passed on `Card` via `BaseHtmlProps`).

---

## Findings — `CardHeader`, `CardBody`, `CardFooter`

### 3. No `BaseHtmlProps` / `...rest` — ARIA and most HTML attributes cannot target the root

- **WCAG / basis:** `4.1.2`, `1.3.1` — **HTML** / **Best practice** (author control of names and relationships)
- **Severity:** **P1**
- **Scope:** **Component default** (API limitation)
- **Repro:** Attempt `<CardHeader id="card-title" aria-label="Summary">…</CardHeader>` — `id` / `aria-*` are **not** in `CardHeaderProps` and are **not** forwarded; only `className` / `data-test` pass through `extractBaseProps`.
- **Issue + impact:** Authors must wrap content in extra DOM nodes to attach `id` for `aria-labelledby` on a parent `Card`, or to set sub-region labels. That duplicates layout hooks and complicates CSS.
- **Suggestion:** Extend each component with `BaseHtmlProps<HTMLDivElement>` (or the appropriate element if you adopt native `<header>` / `<footer>` — see finding 6) and spread remaining props on the root, matching `Card`.

### 4. All three use `<div>` instead of semantic sectioning elements

- **WCAG / basis:** `1.3.1` — **HTML** (semantic structure; not a strict WCAG failure if relationships are otherwise programmatic)
- **Severity:** **P3** (enhancement)
- **Scope:** **Component default**
- **Repro:** Inspect DOM: `CardHeader` → `<div class="…Card-header">`.
- **Issue + impact:** Slightly weaker default document outline / semantics compared to `<header>`, `<footer>`, or a labelled `<section>` for body.
- **Suggestion:** Consider `CardHeader` → `<header>`, `CardFooter` → `<footer>`, and `CardBody` → `<div>` or `<section>` with optional `aria-label` prop — only if visual/CSS constraints allow.

### 5. `CardFooter` prop name `withSeperator` (typo) — non-a11y but affects docs/API clarity

- **WCAG / basis:** N/A
- **Severity:** **P3** (maintainability)
- **Scope:** **Component default**
- **Repro:** TypeScript / props table show `withSeperator`.
- **Issue + impact:** No direct AT impact; increases author error when searching for “separator”.
- **Suggestion:** Alias or rename to `withSeparator` with deprecation path.

---

## Findings — `CardSubdued`

### 6. Same pass-through model as `Card` — good for author-supplied semantics

- **WCAG / basis:** `4.1.2` — **Best practice**
- **Severity:** **P3** (positive)
- **Scope:** **Component default**
- **Repro:** `<CardSubdued aria-label="Secondary details">…</CardSubdued>` — attributes flow via `{...rest}` on the root `<div>`.
- **Issue + impact:** None structural; authors can name the subdued region when needed.
- **Suggestion:** Keep pattern; document when to use vs plain `Card`.

---

## Findings — `ActionCard` (interactive)

### 7. `role="link"` on `<div>` with no `href` — confused semantics vs behavior

- **WCAG / basis:** `4.1.2` — **APG only** / **Best practice** (link vs button pattern)
- **Severity:** **P1**
- **Scope:** **Component default** when `onClick` is used for in-page actions; **consumer-dependent** if the handler always performs navigation
- **Repro:** Render `<ActionCard onClick={fn}>…</ActionCard>` — tree exposes a **link** role without a URL; activation is scripted.
- **Issue + impact:** Users expect **links** to navigate (and often open in new tab, show URL, etc.). **Buttons** trigger actions. Mislabeled role harms predictability and can conflict with AT heuristics.
- **Suggestion:** If the control navigates, render **`as` `<a>`** or `Link` with `href`. If it performs an action, use **`role="button"`** (or native `<button>` with appropriate layout) per APG.

### 8. Keyboard handling only activates on **Enter**, not **Space**

- **WCAG / basis:** `2.1.1` (Keyboard) — **APG** (button pattern expects Space + Enter)
- **Severity:** **P1**
- **Scope:** **Component default** when interpreted as `role="button"`; for **native link** semantics, Space is not required, but then the element should be a real `<a>`.
- **Repro:** Focus the card, press **Space** with `onClick` provided — **no** handler fire (only `Enter` in `onKeyDownHandler`).
- **Issue + impact:** Users who activate controls with Space (standard for buttons) may believe the control is broken.
- **Suggestion:** If staying with custom widget semantics, handle **Space** (`preventDefault` to avoid scroll) and **Enter**; align `role` with that behavior.

### 9. Disabled state omits `aria-disabled="true"`

- **WCAG / basis:** `4.1.2` (Name, Role, Value — **state**)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** `<ActionCard disabled onClick={fn}>…</ActionCard>` — `tabIndex={-1}` but no `aria-disabled`.
- **Issue + impact:** Assistive technologies may not announce the control as unavailable; state is conveyed only visually (and via `tabIndex` removal, which is insufficient for “disabled” in all AT).
- **Suggestion:** Set `aria-disabled={disabled}` when using a non-native element; ensure no `onClick` when disabled (already guarded).

### 10. `{...rest}` spread order allows consumers to override `role`, `tabIndex`, and handlers

- **WCAG / basis:** `4.1.2` — **Best practice** (predictable component contract)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** (footgun)
- **Repro:** Pass `role="button"` and custom `onKeyDown` via `rest` — overrides follow spread order (after built-ins in source — here `...rest` is last, so consumer **can** override `role` / `onKeyDown`).
- **Issue + impact:** Accidental or intentional overrides can break the intended keyboard/ARIA contract.
- **Suggestion:** Document risky props; optionally merge `onKeyDown` or omit `role`/`tabIndex` from allowed overrides.

---

## Findings — `SelectionCard` (interactive)

### 11. `role="checkbox"` + `aria-checked` — appropriate core pattern

- **WCAG / basis:** `4.1.2` — **APG** (checkbox pattern)
- **Severity:** **P3** (positive)
- **Scope:** **Component default**
- **Repro:** Toggle `selected` — `aria-checked` reflects boolean state; Space handled via `isSpaceKey` in `onKeyDownHandler`.
- **Issue + impact:** Baseline checkbox semantics are present for a single card.
- **Suggestion:** When multiple cards share one selection group, document **`aria-labelledby`** / visible label association and consider `fieldset`/`legend` or group `role` patterns at the composition level (consumer responsibility).

### 12. Disabled state omits `aria-disabled="true"`

- **WCAG / basis:** `4.1.2` (state)
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** `<SelectionCard id="a" disabled selected={false} />` — `tabIndex={-1}`, no `aria-disabled`.
- **Issue + impact:** Same as ActionCard: disabled state not consistently exposed as **disabled** to AT.
- **Suggestion:** Add `aria-disabled={disabled}` on the root.

### 13. Decorative overlay `<div>` is empty but not marked `aria-hidden`

- **WCAG / basis:** `4.1.2` — **Best practice** (prune decorative nodes from tree where applicable)
- **Severity:** **P3**
- **Scope:** **Component default**
- **Repro:** Inspect `DesignSystem-SelectionCard-Overlay` — no text, used for visual layering.
- **Issue + impact:** Usually ignored as empty generic; explicit `aria-hidden="true"` reduces noise in some AT / browse mode edge cases.
- **Suggestion:** Set `aria-hidden="true"` on the overlay if it never conveys information.

### 14. CSS: disabled modifier sets `outline: none`

- **WCAG / basis:** `2.4.7` (Focus Visible) — **HTML** / **Best practice**
- **Severity:** **P2**
- **Scope:** **Component default** (disabled is not focusable via `tabIndex={-1}`, so impact is limited)
- **Repro:** `selectionCard.module.css` → `.Selection-card--disabled { outline: none; }`.
- **Issue + impact:** If focus is moved programmatically to a disabled card (buggy app code), focus ring could be suppressed. Low likelihood for default use.
- **Suggestion:** Prefer removing the rule or scoping so **focus-visible** remains when an element is focusable; rely on `tabIndex={-1}` for disabled instead of `outline: none`.

---

## Deduped themes

1. **`extractBaseProps`-only subcomponents** — `CardHeader`, `CardBody`, `CardFooter` share one structural gap: no HTML/ARIA pass-through (finding 3).
2. **Custom `<div>` widgets missing `aria-disabled`** — `ActionCard` and `SelectionCard` both omit explicit disabled state in the accessibility tree (findings 9, 12).
3. **ActionCard role vs keyboard mismatch** — `role="link"` combined with Enter-only activation and scripted `onClick` (findings 7, 8).

---

## Prioritized suggestions (effort vs impact)

1. **High impact:** Add `BaseHtmlProps` + root prop spread to `CardHeader`, `CardBody`, `CardFooter` (unblocks landmarks and labelling without wrappers).
2. **High impact:** Add `aria-disabled` to `ActionCard` and `SelectionCard` when `disabled`.
3. **Medium impact:** Reconcile `ActionCard` role + keyboard model (real link, or `role="button"` + Space/Enter).
4. **Lower impact:** Document `Card` landmark pattern; optional semantic tags for header/footer; `aria-hidden` on selection overlay; revisit disabled `outline: none` in CSS.

---

## Files not creating separate structural issues

- `core/components/atoms/card/__tests__/Card.test.tsx` — snapshot / class tests only; no a11y assertions.
- `core/components/atoms/card/__stories__/data.tsx` — fixture data only.

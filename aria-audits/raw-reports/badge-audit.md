# Badge & Pills — structural ARIA / semantic audit

## Implementation scope

| File | Role |
|------|------|
| `core/components/atoms/badge/Badge.tsx` | `Badge` implementation: root `<span>`, `extractBaseProps` + `classNames`, **`{...rest}`** for remaining DOM props |
| `core/components/atoms/badge/index.tsx` | Re-exports |
| `core/components/atoms/pills/Pills.tsx` | `Pills` implementation: root `<span>`, conditional `role="status"` when `aria-label` is set; **no** `...rest` / `BaseHtmlProps` |
| `core/components/atoms/pills/index.tsx` | Re-exports |

Styling (reviewed only for layout/interaction cues, not token violations):

| File | Role |
|------|------|
| `css/src/components/badge.module.css` | Badge / shared appearance classes (also consumed by Pills for color variants) |
| `css/src/components/pills.module.css` | Pills-specific layout class |
| `css/src/components/pageHeader.module.css` | `pageHeaderStyles.Badge` merged into `Badge` root (`Badge.tsx`) |

Related shared types:

| Dependency | Relevance |
|------------|-----------|
| `core/utils/types.tsx` | `BaseProps`, `BaseHtmlProps`, `extractBaseProps` — base extraction is **`className`** and **`data-test`** only |

Stories sampled for default authoring patterns:

| File | Note |
|------|------|
| `core/components/atoms/badge/_stories_/Solid.story.jsx` | Docs mention span HTML props acceptable |
| `core/components/atoms/pills/__stories__/Alert.story.jsx` | `aria-label` + numeric child (`10`) |

---

## Component overview

**APG / pattern:** Both components are **static, non-interactive phrasing labels** by default: a `<span>` with text (`React.ReactText`). They are **not** buttons, links, or composite widgets; keyboard focus and APG widget roles do not apply unless consumers add interactive behavior (unsupported and discouraged on the root).

**Root cause / rollup:** **Badge** and **Pills** diverge on **HTML / ARIA pass-through**: `Badge` extends `BaseHtmlProps<HTMLSpanElement>` and forwards arbitrary attributes via `{...rest}`; **`Pills` only declares `aria-label` explicitly** and does not spread remaining props, so authors lose typed, first-class access to `id`, `aria-labelledby`, `role` overrides, `data-*`, etc., without an extra wrapper DOM node.

---

## Findings — Badge

### 1. Default `<span>` + text children — appropriate for static labels

- **WCAG / basis:** `4.1.2` (Name, Role, Value) — **HTML** / **Best practice** for non-interactive text
- **Severity:** **P3** (positive baseline; listed for completeness)
- **Scope:** **Component default**
- **Repro:** Render `<Badge appearance="primary">Draft</Badge>` — accessibility tree exposes a text container whose name is derived from visible text (no spurious widget role).
- **Issue + impact:** None for the default pattern; native semantics match the intended “label chip” use.
- **Suggestion:** Keep as-is; document that badges are not interactive targets (use `Button` / `Chip` for actions).

---

### 2. `BaseHtmlProps` + `{...rest}` correctly forwards ARIA and other span attributes

- **WCAG / basis:** `4.1.2`, `1.3.1` (Info and Relationships) — **Best practice** (author flexibility)
- **Severity:** **P3** (positive)
- **Scope:** **Component default**
- **Repro:** `<Badge aria-label="Status: success" role="status">Success</Badge>` — covered in unit tests (`Badge.test.tsx`); attributes reach the root `<span>` after `className` merge.
- **Issue + impact:** Authors can supply `aria-label`, `role`, `aria-live`, `id`, `aria-labelledby`, etc., when the design requires (e.g. live status, explicit naming).
- **Suggestion:** Maintain this pattern; keep story/docs aligned with `propDescription` on span props.

---

### 3. Meaning conveyed by `appearance` / color is not duplicated in programmatic semantics

- **WCAG / basis:** `1.4.1` (Use of Color)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — fails when **only** hue (e.g. `appearance="warning"`) communicates state and visible text is generic (“!”, “1”, icon-only adjacent content).
- **Repro:** Use short or symbolic `children` with `appearance="alert"` / `"warning"` / `"success"` and no `aria-label` / no surrounding text explaining the state.
- **Issue + impact:** Assistive technology users who do not perceive color the same way may not infer “error”, “warning”, or “success” from the token alone.
- **Suggestion:** Document that authors should include redundant wording in `children` or use `aria-label` / visible adjacent text when color is the primary differentiator; do not rely on `appearance` name as an accessible state announcement (it is not exposed as such).

---

## Findings — Pills

### 4. No `BaseHtmlProps` / `...rest` — most span attributes cannot be passed through the component API

- **WCAG / basis:** `4.1.2`, `1.3.1` — **Best practice** / authoring ergonomics (workaround: wrap in another element)
- **Severity:** **P2**
- **Scope:** **Component default** (API surface)
- **Repro:** Attempt to pass `id="pill-1"` or `aria-labelledby="heading-id"` on `<Pills />` — props are not applied to the root (`Pills.tsx` destructures only `appearance`, `children`, `subtle`, `className`, `aria-label` and spreads only `extractBaseProps`).
- **Issue + impact:** Pages that need a stable `id`, heading association, or custom `data-*` / `title` on the **same** node as the pill must add an extra wrapper, complicating layout and sometimes breaking flex/grid child semantics expectations.
- **Suggestion:** Align with `Badge`: extend `BaseHtmlProps<HTMLSpanElement>`, destructure declared props, and spread `...rest` on the root **after** explicit `role` / `aria-label` logic (or merge `role` so consumers can override when documented).

---

### 5. `role="status"` is tied to presence of `aria-label` only

- **WCAG / basis:** **APG only** (live region / `status` pattern); **4.1.2** — contextual
- **Severity:** **P3**
- **Scope:** **Component default**
- **Repro:** Render `<Pills>3</Pills>` with no `aria-label` — no `role="status"` (`Pills.tsx` uses `role={ariaLabel ? 'status' : undefined}`). There is no supported way to mark the element as a polite live region while using **only** visible text as the accessible name.
- **Issue + impact:** Uncommon, but authors cannot opt into `status` without supplying `aria-label`, even when inner text is sufficient naming.
- **Suggestion:** Consider an explicit prop (e.g. `liveRegion` / `polite`) or allow `role` from `...rest` once pass-through exists; document recommended use of `status` for **dynamic** counts/messages only.

---

### 6. `role="status"` + `aria-label` + text children — watch for redundant or divergent naming

- **WCAG / basis:** **Best practice** (accessible name computation, live region verbosity)
- **Severity:** **P3**
- **Scope:** **Consumer-dependent**
- **Repro:** `<Pills aria-label="Alert count">10</Pills>` (`Alert.story.jsx`) — accessible name is driven by `aria-label`; inner text remains content inside the status region (generally acceptable).
- **Issue + impact:** If `aria-label` duplicates visible text unnecessarily, some AT may be verbose; if `aria-label` **contradicts** updating `children`, users can hear inconsistent messaging.
- **Suggestion:** Document: keep `aria-label` stable and high-level; let `children` carry the changing value; avoid duplicating the full message in both.

---

### 7. Same “color as information” caveat as Badge

- **WCAG / basis:** `1.4.1` (Use of Color)
- **Severity:** **P2**
- **Scope:** **Consumer-dependent**
- **Repro:** Same as Badge finding #3 — symbolic or very short `children` with strong hue from `appearance`.
- **Issue + impact:** Pills reuse `badge.module.css` appearance classes; semantic issue is identical.
- **Suggestion:** Same as Badge #3; the `Alert` story’s `aria-label` is a good example when the numeric child alone is insufficient context.

---

## Cross-cutting notes

- **`extractBaseProps`:** Both components apply the same limited base extraction (`className`, `data-test`). Only **Badge** additionally forwards the rest of HTML span props via `{...rest}`.
- **Interactivity:** Neither component implements `tabIndex`, `onKeyDown`, or click handlers. If product code adds pointer-only affordances on these roots, that would be a **consumer** `2.1.1` / `4.1.2` concern, not introduced by these files.
- **Testing gap:** `Pills.test.tsx` does not assert `role` / `aria-label` behavior; **Badge** tests include accessibility-oriented cases — consider mirroring for Pills when API stabilizes.

---

## Severity summary (this audit)

| Tier | Count |
|------|-------|
| **P0** | 0 |
| **P1** | 0 |
| **P2** | 3 (Badge #3 · Pills #4 · Pills #7 — themes: `1.4.1` ×2 scoped bullets, API pass-through ×1) |
| **P3** | 5 (Badge #1–#2 positives; Pills #5–#6 polish; cross-cutting testing note) |

*The two `1.4.1` items share one root cause (appearance/color vs text) but are listed per component for aggregation.*

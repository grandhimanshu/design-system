# Structural ARIA audit: Pagination

**Component:** `Pagination` (molecule)  
**Audit type:** Static code review against semantic HTML, WAI-ARIA APG navigation/pagination guidance, and WCAG 2.2 AA structural expectations.  
**Date:** 2025-03-24  

---

## Implementation files

| Path | Role |
|------|------|
| `core/components/molecules/pagination/Pagination.tsx` | Main implementation |
| `core/components/molecules/pagination/index.tsx` | Re-exports |
| `css/src/components/pagination.module.css` | Layout (includes mobile `order` overrides) |
| `core/components/molecules/pagination/__tests__/Pagination.test.tsx` | Unit tests |
| `core/components/molecules/pagination/__stories__/Basic.story.jsx` | Storybook (basic) |
| `core/components/molecules/pagination/__stories__/Jump.story.jsx` | Storybook (jump) |

**Dependencies (accessibility-relevant):**

- `Button` (`core/components/atoms/button/Button.tsx`) — `aria-label` / `tooltip` behavior for icon-only usage.
- `MetricInput` (`core/components/atoms/metricInput/MetricInput.tsx`) — jump field; native `<input type="number">`; optional stepper UI (hidden in pagination via CSS).

---

## Severity summary

| Tier | Count | Notes |
|------|-------|--------|
| **P0** | 1 | Unnamed icon-only navigation buttons in default API |
| **P1** | 3 | Missing accessible name for jump control; basic variant omits current page; possible focus vs visual order on small viewports |
| **P2** | 4 | No navigation landmark; hidden stepper still in DOM; deprecated `onKeyPress`; optional live-region / state announcements |

---

## Detailed findings

### 1. Icon-only `Button`s ship without accessible names

- **WCAG / basis:** 4.1.2 Name, Role, Value (Level A) · **P0** · **Component default** · **Repro:** Render `<Pagination type="basic" page={1} totalPages={50} onPageChange={…} />` (or jump variant). Inspect the four navigation controls in the accessibility tree: First, Previous, Next, Last use `Button` with `icon` only—no `children`, no `tooltip`, no `aria-label`.
- **Evidence:** `Button` sets `aria-label` only from `props['aria-label']` or, when there are no children, from `tooltip` (`core/components/atoms/button/Button.tsx`). `Pagination` does not pass either for any of the four buttons (`Pagination.tsx` ~127–171).
- **Impact:** Assistive technologies typically cannot announce a meaningful name for these controls. Users hear a generic “button” or noisy fallback from icon/font content, which fails the expectation that controls have a programmatic name.
- **Suggestion:** Provide default `aria-label` strings on each `Button` (and optional `tooltip` for visual hover parity), e.g. “First page”, “Previous page”, “Next page”, “Last page”. Alternatively expose props for consumers to override labels for i18n.

---

### 2. Jump (`MetricInput`) field lacks an associated name in Pagination

- **WCAG / basis:** 4.1.2 Name, Role, Value · 3.3.2 Labels or Instructions (context) · **P1** · **Component default** · **Repro:** `type="jump"`. The page field is a `MetricInput` with `name="page"` only. Adjacent `Text` (` of ${totalPages} pages`) is not wired with `htmlFor` / `id` or `aria-labelledby` / `aria-describedby` on the input.
- **Impact:** Screen reader users may not get a clear field purpose (“current page”, “go to page”, etc.) separate from the suffix text.
- **Suggestion:** Pass `aria-label` (e.g. “Current page, editable”) or associate visible text via `aria-labelledby` on `MetricInput` (may require `id` on the suffix pattern or a visually hidden label).

---

### 3. `basic` variant does not expose current page in structure

- **WCAG / basis:** 1.3.1 Info and Relationships (when page position is only conveyed by this control) · **P1** · **Component default** · **Repro:** `type="basic"` renders only first/prev/next/last buttons—no text or `aria-*` stating the active page.
- **Impact:** In isolation (or when the surrounding table/list does not expose page state), assistive technology users cannot determine the current page from this component alone.
- **Suggestion:** Add visually styled current page text and/or `aria-current` on an appropriate element, or document that parent regions must expose page state (weaker than fixing the component).

---

### 4. Narrow viewport: visual order vs tab order (flex `order`)

- **WCAG / basis:** 2.4.3 Focus Order (Level A) · **P1** · **Component default** · **Repro:** Below 575px width, `pagination.module.css` sets `.Pagination-pageIndex { order: -1 }` so the jump row appears first visually, while DOM order remains previous buttons → page field → next buttons.
- **Impact:** Keyboard focus sequence may not match the visual reading order on small screens, which can confuse users who rely on focus order to follow layout.
- **Suggestion:** Reorder DOM to match intended visual/reading order at that breakpoint, or avoid `order` for major layout shifts without matching DOM order.

---

### 5. Root wrapper is a generic `<div>` (no navigation landmark)

- **WCAG / basis:** Best practice / APG (Landmarks) · 1.3.1 enhancement · **P2** · **Component default** · **Repro:** Outer element is `<div data-test="DesignSystem-Pagination">` with no `role="navigation"` and no default accessible name.
- **Impact:** Users navigating by landmarks may not discover pagination as a distinct navigation region; structure is weaker than APG’s pagination/navigation examples.
- **Suggestion:** Use `<nav aria-label="Pagination">` (or allow `aria-label` override prop) as the root, or set `role="navigation"` with a default `aria-label` if a `<div>` must stay for styling.

---

### 6. Jump variant: stepper controls remain in DOM but are only hidden in CSS

- **WCAG / basis:** Best practice (cleaner semantics, less noise) · **P2** · **Component default** · **Repro:** `MetricInput` defaults `showActionButton={true}`; pagination hides `.MetricInput-arrowIcons` with `display: none` in `pagination.module.css`.
- **Impact:** Generally acceptable (hidden content often excluded from AT), but DOM still contains extra buttons; clearer to omit them with `showActionButton={false}` if the API supports it without regressions.
- **Suggestion:** Pass `showActionButton={false}` from `Pagination` for the jump field if behavior and styles remain correct.

---

### 7. `onKeyPress` on jump `MetricInput`

- **WCAG / basis:** Robustness / HTML · **P2** · **Component default** · **Repro:** `Pagination` passes `onKeyPress={onKeyPressHandler}`; `onKeyPress` is legacy and behaves inconsistently across browsers compared to `onKeyDown`.
- **Impact:** Key filtering for non-natural keys may be less reliable; not a pure ARIA issue but affects keyboard robustness of the jump field.
- **Suggestion:** Implement filtering with `onKeyDown` (and ensure it composes with `MetricInput`’s internal `onKeyDown`).

---

### 8. No live region or explicit announcement on page change

- **WCAG / basis:** 4.1.3 Status Messages (AA, contextual) · **P2** / enhancement · **Component default** · **Repro:** Changing page updates internal state and callbacks but does not set `aria-live` or move focus.
- **Impact:** Some screen reader users may not hear that the page index changed after using buttons or the jump field (especially if focus stays on the control).
- **Suggestion:** Optional `aria-live="polite"` on a dedicated status element, or document that the consuming view (e.g. table) must announce updated content; align with product pattern.

---

## Positive notes

- Controls are native `<button>` elements (via `Button`), not `div` click targets—good baseline for keyboard and role.
- Disabled state is correctly applied at boundaries (`disabled={page <= 1}` / `page >= totalPages}`).
- Jump variant exposes the numeric value in a real form control (`<input type="number">` inside `MetricInput`), which is structurally appropriate for a page index when properly named.

---

## References (external)

- [WAI-ARIA APG — Navigation Landmark Practice](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)  
- [WCAG 2.2 — 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)  
- [WCAG 2.2 — 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

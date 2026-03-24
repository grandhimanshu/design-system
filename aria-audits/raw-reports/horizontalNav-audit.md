# Structural ARIA audit: HorizontalNav

**Component:** `HorizontalNav`  
**Audit type:** Static code review (semantic HTML, WAI-ARIA usage, APG alignment). No runtime AT testing.

---

## Implementation map

| Role | Path |
|------|------|
| Main implementation | `core/components/organisms/horizontalNav/HorizontalNav.tsx` |
| Barrel export | `core/components/organisms/horizontalNav/index.tsx` |
| Public re-exports | `core/index.tsx`, `core/index.type.tsx` (`HorizontalNavProps` from `./HorizontalNav`) |
| Styles (focus, layout) | `css/src/components/horizontalNav.module.css` |
| Shared menu types / helpers | `core/utils/navigationHelper.tsx` (`Menu`, `ActiveMenu`, `isMenuActive`, `getNavItemColor`, `getPillsAppearance`, `formatCount`) |
| Consumer reference | `core/components/organisms/navigation/Navigation.tsx` (wraps `HorizontalNav`) |
| Tests | `core/components/organisms/horizontalNav/__tests__/HorizontalNav.test.tsx` |
| Stories | `core/components/organisms/horizontalNav/__stories__/` (`index.story.jsx`, `leftAlign.story.jsx`, `withAnimation.story.jsx`, `variants/*.story.jsx`) |

---

## Severity summary

| Tier | Count |
|------|------:|
| **P0** | 0 |
| **P1** | 0 |
| **P2** | 4 |
| **P3** | 2 |

---

## Positive findings

- **Landmark:** Root is a native `<nav>` with a default `aria-label` of `"Horizontal Navigation"`, overridable via the `aria-label` prop. Satisfies the need for a discernible landmark name when only one generic nav is present.
- **Interactive roles:** Items with `menu.link` render as `<a href="...">`; items without a link render as `<button type="button">`. No `div`/`span` click handlers for enabled items — aligns with project rules and **4.1.2 Name, Role, Value** for basic widgets.
- **Current item:** Active items set `aria-current="page"` when `isActive` is true (on both links and buttons), exposing the current location in the set — supports orientation for AT users.
- **Disabled items:** Disabled menus render as a non-focusable `<span>` with `aria-disabled="true"`, avoiding focus on inert controls; `pointer-events: none` is applied via `.HorizontalNav-menu--disabled`.
- **Keyboard:** Native links and buttons receive focus and activation per the platform; no custom roving tabindex that would break tab order for the default markup.
- **Focus visibility:** `.HorizontalNav-menu--default` and `--active` define `:focus-visible` / `:focus` outlines using design tokens (`var(--primary-focus)`). Disabled items use `outline: none` on a non-focusable `<span>` — acceptable in this structure.
- **Text overflow:** Menu label text uses ellipsis-friendly styles via `.HorizontalNav-menuText` (overflow, text-overflow, nowrap), reducing clipped unreadable overflow in narrow layouts.

---

## Findings (detailed)

### 1. Landmark naming API is limited to `aria-label`

- **WCAG / basis:** 1.3.1 Info and Relationships · 2.4.1 Bypass Blocks (landmark labeling techniques) · **4.1.2** Name, Role, Value — **Best practice / HTML**
- **Severity:** **P2**
- **Scope:** **Component default** (props + root element wiring)
- **Issue:** The root `<nav>` only applies `extractBaseProps` (`className`, `data-test`) plus `aria-label`. There is no supported prop for `aria-labelledby`, `aria-describedby`, or `id` on the `<nav>`. Pages that label navigation with a visible heading (preferred pattern in many audits) cannot associate that heading without forking the component or invalid prop casting.
- **Impact:** Duplicate or vague nav names if multiple horizontal regions exist; missed opportunity to tie the landmark to visible text for SR users.
- **Suggestion:** Extend props to allow `aria-labelledby` / `aria-describedby` / `id` on the `<nav>` (and document that `aria-label` vs `aria-labelledby` should not conflict). Prefer explicit prop types over a blind `HTMLAttributes<HTMLElement>` spread if the team wants to keep the API narrow.

---

### 2. Navigation list not structured as a list

- **WCAG / basis:** **1.3.1** Info and Relationships — **P2** (structure enhancement; not a hard failure if names/roles are correct)
- **Scope:** **Component default**
- **Issue:** Children of `<nav>` are a flat sequence of `<a>`, `<button>`, and `<span>` elements. There is no `<ul>` / `<ol>` with `<li>` (or equivalent explicit list structure).
- **Impact:** Some screen readers expose list semantics and item counts for grouped nav links; without a list, users get less structural context for “how many items” in the region.
- **Suggestion:** Wrap items in `<ul className={...}>` / `<li>` (style as flex row), or document as an intentional minimalist pattern. If Safari list semantics are a concern, consider `role="list"` on the container where appropriate.

---

### 3. `aria-current="page"` on `<button>` items

- **WCAG / basis:** **ARIA / APG** — **P2** (interpretation nuance)
- **Scope:** **Component default** when `menu.link` is omitted
- **Issue:** For button-based items (in-app actions, no `href`), the code sets `aria-current="page"` the same as for real links. In ARIA, `page` is oriented toward “current page” within a navigation set; for view-switching that is not a document location, `aria-current="true"` is often cited as the more neutral value.
- **Impact:** Minor risk of confusing wording or heuristics in some AT when the control is not a link to a page resource.
- **Suggestion:** Use `aria-current={isActive ? 'page' : undefined}` for `<a>` and `aria-current={isActive ? 'true' : undefined}` for `<button>`, or document the SPA convention explicitly if `page` is intentional app-wide.

---

### 4. Leading `Icon` is not explicitly decorative in markup

- **WCAG / basis:** **1.1.1** Non-text Content (if ligature/name is exposed redundantly) · **Best practice**
- **Severity:** **P2**
- **Scope:** **Component default** (icon + text pattern)
- **Issue:** `Icon` is rendered beside `<Text>` with the menu label. `Icon` does not receive `aria-hidden="true"` from `HorizontalNav`. Depending on `Icon` / font implementation, the icon glyph or inner text may add redundant or noisy output to the link/button’s accessible name calculation.
- **Impact:** Possible duplicate or cryptic announcements next to the visible label.
- **Suggestion:** Pass `aria-hidden={true}` (or an equivalent supported prop) on `Icon` when the adjacent text fully names the item, per decorative icon guidance in the design system.

---

### 5. Default `aria-label` collisions across multiple instances

- **WCAG / basis:** **1.3.1** · **2.4.1** — **P3**
- **Scope:** **Consumer-dependent** (mitigated by passing a distinct `aria-label`)
- **Issue:** Default label is always `"Horizontal Navigation"`. Multiple `HorizontalNav` instances on one page without overrides produce duplicate landmark names in the landmarks rotor.
- **Impact:** Users distinguishing regions by name may hear identical labels.
- **Suggestion:** Document that each instance should receive a unique `aria-label` (or support `aria-labelledby` per finding 1). Optionally avoid a generic default and require an explicit label in a future major version.

---

### 6. `Menu` type includes `subMenu` but component ignores it

- **WCAG / basis:** **N/A** (API / expectations)
- **Severity:** **P3**
- **Scope:** **Documentation / consumer expectation**
- **Issue:** `Menu` from `navigationHelper` allows `subMenu`, but `HorizontalNav` does not render nested navigation or related ARIA (`aria-expanded`, `aria-controls`, etc.).
- **Impact:** No direct structural ARIA bug in current output, but consumers might assume hierarchical behavior from the shared type.
- **Suggestion:** Clarify in docs or narrow the props type for horizontal nav so consumers do not expect flyouts/menus from this organism.

---

## Out of scope / not flagged as defects

- **Color contrast:** Not verified in this structural pass (would need token/state matrix and visual measurement).
- **Touch target size:** CSS uses fixed height/spacing tokens; physical px depends on root font size — not asserted here.
- **Behavior when `onClick` is set:** `preventDefault()` on linked items is intentional for SPA routing; middle-click / “open in new tab” may still use `href` — product decision, not an ARIA structure error.

---

## Suggested verification (manual / automated)

1. VoiceOver / NVDA: navigate by landmarks; confirm nav name(s) are unique when multiple instances exist.
2. Tab through enabled items; confirm focus order matches visual order and focus rings are visible.
3. With icon + label + count variants, listen for redundant icon announcements.
4. Optional axe-core pass on Storybook stories for landmark and `aria-current` rules.

---

*End of report.*

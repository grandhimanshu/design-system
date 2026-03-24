# Structural ARIA audit: StatusHint, EmptyState, Placeholder

Audit type: static code review of implementation (semantic HTML, roles, ARIA usage, keyboard structure, and related WCAG 2.2 AA structural expectations). No runtime AT testing.

---

## Implementation map

| Component | Role | Primary files |
|-----------|------|----------------|
| **StatusHint** | Atom | `core/components/atoms/statusHint/StatusHint.tsx`, `index.tsx` |
| **EmptyState** | Molecule (compound) | `core/components/molecules/emptyState/EmptyState.tsx`, `EmptyStateTitle.tsx`, `EmptyStateDescription.tsx`, `EmptyStateImage.tsx`, `EmptyStateActions.tsx`, `EmptyStateContext.tsx`, `index.tsx` |
| **Placeholder** | Molecule | `core/components/molecules/placeholder/Placeholder.tsx`, `index.tsx` |
| **Placeholder (dependencies)** | Atoms | `core/components/atoms/placeholderImage/PlaceholderImage.tsx`, `core/components/atoms/placeholderParagraph/PlaceholderParagraph.tsx` |

**Shared infrastructure:** `extractBaseProps` in `core/utils/types.tsx` only forwards `className` and `data-test` — not `aria-*`, `id`, `role`, or other HTML attributes — for components that use it (`StatusHint`, `Placeholder`, `PlaceholderImage`, `PlaceholderParagraph`, and the legacy `EmptyState` branch).

---

## 1. StatusHint

### What it renders

- Root: `<div>` with optional `role="button"`, `tabIndex={0}` when `onClick` is set.
- Decorative status dot: `<span aria-hidden="true">` (appropriate for a purely visual cue next to text).
- String/number children: wrapped in `Text` (`<span>` via `GenericText`).
- Enter/Space on keydown call `onClick` when clickable.

### Findings

- **WCAG 4.1.2 Name, Role, Value · APG (button) · HTML · P1 · Component default (when `onClick` is used)**  
  **Repro:** Use `StatusHint` with `onClick` and non-textual `children` (e.g. only icons or empty content).  
  **Issue:** The control is a `div` with `role="button"`, not a native `<button>`. Accessible name is not guaranteed by the API (no `aria-label` / `aria-labelledby` prop, and `BaseProps` does not allow passing `aria-*` through `extractBaseProps`).  
  **Impact:** Screen readers may get a weak, missing, or confusing name; activation semantics differ from native buttons (e.g. disabled handling).  
  **Suggestion:** Prefer rendering a real `<button type="button">` when interactive, or extend props with `aria-label` / passthrough for naming; ensure every interactive instance has an explicit or reliable computed name.

- **WCAG 2.1.1 Keyboard · APG · P2 · Component default (interactive)**  
  **Issue:** Space/Enter activation is implemented; focusability is provided via `tabIndex={0}`. This is broadly aligned with the button pattern, but custom div-buttons still miss native disabled semantics and form submission behavior.  
  **Suggestion:** Native `<button>` removes most of this gap.

- **WCAG 2.4.7 Focus Visible · P3 · Component default**  
  **Issue:** `statusHint.module.css` and the referenced `pageHeader` styles do not define a component-level `:focus-visible` treatment for the interactive `div`. Reliance on UA defaults may or may not meet design-system contrast expectations.  
  **Suggestion:** Add a token-based `:focus-visible` outline/box-shadow on the interactive root (or use `<button>` with existing button focus styles).

- **WCAG 1.4.1 Use of Color · P2 · Consumer-dependent**  
  **Issue:** `appearance` drives dot color (`alert`, `success`, `warning`, etc.). If `children` do not restate the meaning (e.g. text is generic), meaning may be color-only.  
  **Suggestion:** Document that visible text (or an accessible name) must convey the same information as color.

- **WCAG 4.1.3 Status Messages · Best practice / APG · P3 · Consumer-dependent**  
  **Issue:** No `role="status"` / live-region behavior for dynamic status text.  
  **Suggestion:** If used for asynchronous or live updates, consumers should wrap or augment with `aria-live` / `role="status"` as appropriate.

### Positive notes

- Decorative icon span uses `aria-hidden="true"`.
- Non-clickable usage avoids spurious `role`/`tabIndex`.

---

## 2. EmptyState

### What it renders

Two patterns:

1. **Legacy/template props:** `title`, `description`, `imageSrc` / `image` on a single wrapper `<div>` with `Heading` + `Text` + optional `<img>`.
2. **Composable:** `EmptyStateContext.Provider` → outer layout `<div>` → inner `<div {...baseProps}>` containing `EmptyState.Title`, `.Description`, `.Image`, `.Actions`.

### Findings

- **WCAG 1.1.1 Non-text Content · P1 · Component default (`EmptyState.Image` with `src`)**  
  **Repro:** `<EmptyState.Image src="…" />` without `alt`.  
  **Issue:** `EmptyStateImage` types `alt` as optional and passes `alt={alt}` to `<img>`, which can produce an image with no alternative text.  
  **Impact:** Screen readers cannot describe the image; fails 1.1.1 when the image conveys information.  
  **Suggestion:** Require `alt` when `src` is set, or default to `alt=""` only when the image is strictly decorative and document that contract.

- **WCAG 1.3.1 Info and Relationships · HTML heading hierarchy · P1 · Component default (composable, non-`standard` size)**  
  **Repro:** Use `EmptyState` with `size` `compressed` or `tight` and `EmptyState.Title`.  
  **Issue:** `EmptyStateTitle` renders a `Heading` only when `size === 'standard'`; for `compressed` / `tight` it renders `Text` (still using `data-test="DesignSystem-EmptyState--Heading"`). The visible “title” is no longer a heading in the accessibility tree.  
  **Impact:** Document outline and “jump by heading” navigation break for smaller layouts.  
  **Suggestion:** Keep a real heading element with visual styling via classes, or expose a `headingLevel` / `as` prop to preserve semantics across sizes.

- **WCAG 1.1.1 · P2 · Component default (legacy `imageSrc`)**  
  **Repro:** `imageSrc` set without `title` or `description`.  
  **Issue:** `alt={title || description || ''}` becomes `alt=""`. If the image is informative, this is incorrect.  
  **Suggestion:** Require explicit `alt` for `imageSrc`, or separate `imageAlt` prop for the legacy API.

- **WCAG 1.3.1 · P2 · Enhancement**  
  **Issue:** The empty state block is a plain `<div>` group with no `role="region"` / `aria-labelledby` wiring to the title.  
  **Impact:** Users can still read content in order; landmark grouping is weaker.  
  **Suggestion:** Optional region pattern: `role="region"` + `aria-labelledby` pointing to the title id when a title exists.

- **WCAG 4.1.2 · P3 · Consumer-dependent**  
  **Issue:** `EmptyStateActions` is a generic `<div>`; semantics depend entirely on children (e.g. `Button`).  
  **Suggestion:** Document that primary actions should be real controls with visible names; consider `aria-label` on the group if multiple actions need a group name.

### Positive notes

- Legacy path uses real `Heading` + `Text` for title/description.
- `EmptyStateDescription` uses `Text` with `appearance="subtle"` — structurally fine as body copy.
- `EmptyStateImage` with `children` wraps custom content in a `<div>` (appropriate for non-`<img>` illustrations; consumer must supply accessible names for meaningful icons).

---

## 3. Placeholder (molecule + PlaceholderImage / PlaceholderParagraph)

### What it renders

- **Placeholder:** Root `<div>`; optional `PlaceholderImage` (`<span>`); optional column of `PlaceholderParagraph` children inside a `<div>`.
- **PlaceholderImage:** `<span>` with shimmer animation classes.
- **PlaceholderParagraph:** Wrapper `<div>` containing inner `<span>` (shimmer) with no text content.

### Findings

- **WCAG 4.1.3 Status Messages / Best practice (loading/skeleton) · P1 · Component default**  
  **Repro:** Render `Placeholder` inside a loading view without wrapping announcements.  
  **Issue:** No `aria-busy` on a relevant ancestor, and no `aria-hidden="true"` (or similar) on the decorative skeleton subtree. Assistive technologies may traverse empty or meaningless structures while content is loading, with no programmatic “busy” signal from this component.  
  **Impact:** Confusing or noisy experience during loading; inconsistent with common skeleton patterns.  
  **Suggestion:** Mark the loading region with `aria-busy="true"` (typically on a parent the app controls) and hide decorative placeholders from AT (`aria-hidden="true"` on the placeholder root or skeleton spans), or expose props to set these without breaking `extractBaseProps` limitations.

- **WCAG 2.3.3 Animation from Interactions · P2 · Component default**  
  **Issue:** `placeholder.module.css` defines continuous `shimmer` animation without an apparent `@media (prefers-reduced-motion: reduce)` override in the reviewed rules.  
  **Impact:** Users who need reduced motion may still get infinite animation.  
  **Suggestion:** Respect `prefers-reduced-motion` (disable or replace animation).

- **WCAG 4.1.2 · P2 · API limitation**  
  **Issue:** `Placeholder`, `PlaceholderImage`, and `PlaceholderParagraph` all use `extractBaseProps` only — consumers cannot pass `aria-hidden`, `aria-busy`, or `role` through the public props surface without wrapping in an extra element.  
  **Suggestion:** Extend `BaseProps` / extraction for ARIA passthrough, or add first-class props (`ariaHidden`, `busy`, etc.).

### Positive notes

- Skeleton spans are not focusable by default.
- Composition is layout-only; no fake interactive roles.

---

## Severity summary (this report)

| Tier | Count (approx.) |
|------|-----------------|
| **P1** | 5 |
| **P2** | 6 |
| **P3** | 4 |

*(Counts are unique issues across the three components; some items are consumer-dependent or enhancements.)*

---

## Suggested fix order (impact vs. effort)

1. **EmptyStateImage / legacy `imageSrc`:** Enforce or default meaningful `alt` semantics.  
2. **Placeholder / skeleton:** `aria-hidden` + document `aria-busy` on parent; consider reduced-motion CSS.  
3. **StatusHint interactive:** Native `<button>` or explicit naming + focus-visible.  
4. **EmptyStateTitle:** Preserve heading semantics for all `size` values.  
5. Landmarks / live regions / documentation for dynamic status and empty regions.

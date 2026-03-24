# Breadcrumbs — structural ARIA / semantic audit

## Implementation files reviewed

| File | Role |
|------|------|
| `core/components/atoms/breadcrumbs/Breadcrumbs.tsx` | Component implementation (links, items, overflow dropdown) |
| `core/components/atoms/breadcrumbs/index.tsx` | Re-exports |
| `core/components/atoms/breadcrumbs/__tests__/Breadcrumbs.test.tsx` | Documented usage / expectations |
| `core/components/atoms/breadcrumbs/__stories__/*.story.jsx` | Storybook examples |
| `css/src/components/breadcrumbs.module.css` | Layout / focus outline on overflow control (`Breadcrumbs-Button:focus`) |
| `core/utils/types.tsx` | `BaseProps`, `extractBaseProps` (root prop forwarding) |
| `core/components/atoms/link/Link.tsx` | Native `<a>` for each crumb (via `GenericText`) |
| `core/components/atoms/button/Button.tsx` | `aria-label` / `tooltip` behavior for icon-only overflow trigger |
| `core/components/atoms/dropdown/Dropdown.tsx` | `Dropdown` container; passes `customTrigger` into list |
| `core/components/atoms/dropdown/DropdownList.tsx` | Popover trigger; `customTrigger` cloned with `tabIndex` + `ref` only |

**APG pattern:** [Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) — labeled navigation region (`<nav>` + accessible name), structured trail (commonly `<ol>` / `<li>`), current location identified (`aria-current="page"` where applicable), decorative separators kept out of the accessibility tree where possible.

---

## Component overview

`Breadcrumbs` renders a horizontal trail of `Link` components. When `list.length > 4`, middle segments are collapsed into a `Dropdown` with `menu={true}` and a **custom** icon-only `Button` trigger (`more_horiz_filled`). Each segment is wrapped in a `div` (`Breadcrumbs-item`); separators are literal `/` in `<span>` elements. The root is a `<div>` with `data-test="DesignSystem-Breadcrumbs"`.

`extractBaseProps` only forwards `className` and `data-test` — not `id`, `role`, `aria-*`, or other HTML attributes — so the public surface cannot attach landmark naming to the real root without API changes.

**Roll-up:** Gaps cluster around **non-semantic wrappers** (`<div>` root and items), **no list / current-page semantics**, **decorative slash text in the a11y tree**, and the **overflow path**: icon-only `Button` without `aria-label` or `tooltip`, compounded by **`DropdownList` not merging `aria-label` from `Dropdown` props into `customTrigger`** (only the default `DropdownButton` path receives those attributes).

---

## Findings

### 1. Overflow menu trigger is icon-only with no accessible name

- **WCAG / basis:** `4.1.2` (Name, Role, Value); **Best practice** aligned with `2.4.6` (Headings and Labels) for control purpose
- **Severity:** **P0**
- **Scope:** **Component default** when `list.length > 4`.
- **Repro:** Render `Breadcrumbs` with five or more items. Inspect the overflow control: `renderDropdown` returns a `Button` with `icon="more_horiz_filled"`, `largeIcon`, no `children`, no `tooltip`, and no `aria-label`.

```94:105:core/components/atoms/breadcrumbs/Breadcrumbs.tsx
  const customTrigger = () => {
    return (
      <Button
        type="button"
        size="tiny"
        appearance="transparent"
        icon="more_horiz_filled"
        largeIcon={true}
        className={styles['Breadcrumbs-Button']}
        data-test="DesignSystem-Breadcrumbs--Button"
      />
    );
  };
```

`Button` sets `aria-label` only from an explicit `aria-label` or from `tooltip` when there are no children:

```189:190:core/components/atoms/button/Button.tsx
      aria-label={props['aria-label'] || (!children && tooltip ? tooltip : undefined)}
      {...rest}
```

- **Issue + impact:** Assistive technologies typically announce an unnamed “button”. Users cannot tell that it reveals hidden breadcrumb destinations.
- **Suggestion:** Set `aria-label` (and optionally `tooltip` for hover parity) on the overflow `Button`, e.g. “Show hidden breadcrumbs” / “More trail items”, with optional i18n via a new prop. Alternatively pass `aria-label` on `<Dropdown … />` **and** extend `DropdownList` so `customTrigger` clones merge `props['aria-label']` / `aria-labelledby` onto the custom element (today only `tabIndex` and `ref` are applied in the `customTrigger` branch).

---

### 2. Trail is not exposed as a breadcrumb / navigation landmark

- **WCAG / basis:** `1.3.1` (Info and Relationships); **APG only** / **Best practice** for labeled `nav`
- **Severity:** **P1**
- **Scope:** **Component default**
- **Repro:** Render with any non-empty `list`; root remains a generic `div`:

```136:137:core/components/atoms/breadcrumbs/Breadcrumbs.tsx
  return (
    <div data-test="DesignSystem-Breadcrumbs" {...baseProps} className={BreadcrumbClass}>
```

- **Issue + impact:** Users cannot rely on landmark navigation to find or skip the breadcrumb region; grouping of the trail is weaker than with `<nav aria-label="Breadcrumb">` (or equivalent).
- **Suggestion:** Use `<nav>` with a default accessible name (localizable), or `role="navigation"` plus `aria-label` / `aria-labelledby`, and document the pattern.

---

### 3. Root / landmark props are not forwardable through the public API

- **WCAG / basis:** `1.3.1`; `4.1.2` (named region); **Best practice**
- **Severity:** **P1**
- **Scope:** **Component default** — `BreadcrumbsProps` extends `BaseProps` (`className`, `data-test` only); `extractBaseProps` does not pass `aria-label` / `id` to the root.

```35:42:core/utils/types.tsx
export const extractBaseProps = (props: Record<string, any>) => {
  const baseProps = ['className', 'data-test'];
  const basePropsObj = baseProps.reduce((acc, curr) => {
    return props[curr] ? { ...acc, [curr]: props[curr] } : { ...acc };
  }, {});

  return basePropsObj;
};
```

- **Issue + impact:** Consumers cannot attach standard landmark attributes to the component’s root without wrapping an extra element (duplicate focus ring / layout hacks) or casting props.
- **Suggestion:** Extend the public props with a pick of `React.HTMLAttributes<HTMLElement>` (or `ComponentPropsWithoutRef<'nav'>`) merged onto the root `<nav>`.

---

### 4. List structure uses generic `div` items instead of an ordered list

- **WCAG / basis:** `1.3.1`; **APG only** (pattern examples use `<ol>` / `<li>`)
- **Severity:** **P2**
- **Scope:** **Component default**

```73:84:core/components/atoms/breadcrumbs/Breadcrumbs.tsx
const RenderItem = ({ item, onClick, index, showTooltip }: renderItemProps) => {
  return (
    <div key={index} className={styles['Breadcrumbs-item']} data-test="DesignSystem-Breadcrumbs-item">
      {showTooltip ? (
        <Tooltip tooltip={item.label} position="bottom">
          <RenderLink item={item} onClick={onClick} />
        </Tooltip>
      ) : (
        <RenderLink item={item} onClick={onClick} />
      )}
      <span className={styles['Breadcrumbs-itemSeparator']}>/</span>
    </div>
  );
};
```

- **Issue + impact:** Trail length and “list of steps” semantics are not exposed; some screen readers will not treat crumbs as a structured sequence.
- **Suggestion:** Wrap items in `<ol className={…}>` / `<li>` (with `list-style: none` in CSS), preserving flex layout.

---

### 5. Visual separators (`/`) are exposed as text nodes

- **WCAG / basis:** **Best practice** / `1.3.1` (reduce redundant structure)
- **Severity:** **P2**
- **Scope:** **Component default** — separators after each item and beside the dropdown (`list.length > 4`).
- **Issue + impact:** Many screen readers announce “slash” between items, adding noise.
- **Suggestion:** `aria-hidden="true"` on separator spans and keep visuals via CSS (or `::after` content with care for list semantics).

---

### 6. Current page / last crumb is not distinguished with `aria-current`

- **WCAG / basis:** **APG only** / `1.3.1` when the last segment is the current page
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — every entry is a `Link`; the component does not know which `href` is “current”.
- **Issue + impact:** The final crumb is not announced as the current page when it represents one.
- **Suggestion:** Optional API (`currentIndex`, `currentHref`, or per-item flags) to set `aria-current="page"` on the appropriate link, or render the last segment as static text when it must not be activated.

---

### 7. `showTooltip` uses `Tooltip` without truncation-gating

- **WCAG / basis:** **Best practice** (equivalence of hover vs focus for supplementary content)
- **Severity:** **P3**
- **Scope:** **Component default** when `showTooltip={true}`

```76:79:core/components/atoms/breadcrumbs/Breadcrumbs.tsx
      {showTooltip ? (
        <Tooltip tooltip={item.label} position="bottom">
          <RenderLink item={item} onClick={onClick} />
        </Tooltip>
```

Default `Tooltip` behavior uses `showOnTruncation: false` unless set, so tooltips are hover-driven and duplicate the link’s accessible name (`item.label`) even when text is not truncated.

- **Issue + impact:** Low: redundant name; keyboard-only users may not see tooltip content depending on `Tooltip` implementation, but they already get the same string from the link name.
- **Suggestion:** Prefer `showOnTruncation={true}` with an `elementRef` on the truncated text (see `Tabs` usage) so tooltips only appear when overflow occurs; verify focus behavior matches product a11y rules.

---

### 8. Dropdown menu list has a default accessible name; trigger does not inherit it

- **WCAG / basis:** **Best practice** / **Non-WCAG** (implementation note)
- **Severity:** **P3**
- **Scope:** **Component default** for overflow — `Dropdown` is used with `menu={true}`; `DropdownList` sets `role="menu"` and `aria-label` on the options container to `"Menu options"` when no `optionsAriaLabel` / trigger label is provided. The **trigger** remains unnamed (see finding 1).
- **Suggestion:** No separate fix beyond naming the trigger; documented for aggregation / deduplication with Dropdown audits.

---

## Summary counts

| Severity | Count |
|----------|------:|
| P0 | 1 |
| P1 | 2 |
| P2 | 3 |
| P3 | 2 |

---

## Positive notes

- Crumbs use the design-system **`Link`** → real `<a href="…">` with visible text from `item.label`, which satisfies basic link naming (`4.1.2` / `2.4.4`) when labels are meaningful.
- Overflow panel uses **`Dropdown`** in **`menu`** mode with a **`role="menu"`** options region and default **`aria-label`** on that region (`DropdownList.tsx`), which partially structures the popup for AT once opened.
- CSS defines a visible **focus outline** on `.Breadcrumbs-Button:focus` for the overflow control.

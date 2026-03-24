# PageHeader — structural ARIA / semantic HTML audit

**Audit type:** Static structural review (ARIA roles, landmarks, heading semantics, slot wrappers).  
**Out of scope:** Color/contrast, focus visibility, motion, and full behavior of slotted organisms except where PageHeader strips or blocks accessibility attributes (it does not).

---

## Implementation files

| File | Role |
|------|------|
| `core/components/organisms/pageHeader/PageHeader.tsx` | Root layout: optional breadcrumbs row, back `button` slot, title row (`Row`/`Column`), center or bottom nav, tabs slot, optional `Divider`; `extractBaseProps` + optional `aria-label` on inner wrapper. |
| `core/components/organisms/pageHeader/utils.tsx` | `Status`, `Action`, `Nav`, `CenterNav`, `BackButton`, `Title` (renders `Heading` for the `title` string). |
| `core/components/organisms/pageHeader/index.tsx` | Re-exports `PageHeader` and types. |
| `css/src/components/pageHeader.module.css` | Layout/styles only (no ARIA). |

**Usage / contract context:** `core/components/organisms/pageHeader/__stories__/`, `core/components/organisms/pageHeader/__tests__/PageHeader.test.tsx`, `figma/PageHeader.figma.tsx`.

**Related primitives (not duplicated here but cited for behavior):**

- `core/components/atoms/heading/Heading.tsx` — maps `size` to `h1`–`h5` via `GenericText` / `componentType`.
- `core/components/atoms/breadcrumbs/Breadcrumbs.tsx` — root is `<div>`, not `<nav>`.
- Slotted: `HorizontalNav` (root `<nav>`), `Navigation` (outer `<div>` wrapping nav content), `Tabs`, `Stepper`, `Button`, etc.

---

## Component overview

- **Intended pattern:** Document/app **banner**-style chrome: optional breadcrumb trail, primary **heading** for the page title, secondary navigation (center or bottom), tabs, actions, status/meta.
- **Interactivity:** PageHeader adds **no** custom ARIA roles, roving tabindex, or keyboard handlers. Keyboard and roles come entirely from children.
- **Rollup:** The shell is mostly **non-semantic `<div>`** wrappers **without a banner landmark**; the **required title** is rendered as **`h4`** by default via `Heading` defaults, which conflicts with typical **page-level heading** expectations.

---

## Code anchors (implementation)

```114:142:core/components/organisms/pageHeader/PageHeader.tsx
  return (
    <div data-test="DesignSystem-PageHeader">
      <div {...baseProps} className={wrapperClasses} aria-label={ariaLabel}>
        {breadcrumbs && (
          <div className="pl-6" data-test="DesignSystem-PageHeader--Breadcrumbs">
            {breadcrumbs}
          </div>
        )}
        <div className="d-flex pl-6">
          <BackButton button={button} />
          <div className={classes}>
            <Row className="w-100">
              ...
            </Row>
            <Status {...statusProps} />
          </div>
        </div>

        <div className="pl-3">
          {navigationPosition === 'bottom' && <Nav navigation={navigation} stepper={stepper} />}
          {tabs && <div data-test="DesignSystem-PageHeader--Tabs">{tabs}</div>}
        </div>
      </div>
      {separator && <Divider appearance="header" />}
    </div>
  );
```

```98:105:core/components/organisms/pageHeader/utils.tsx
export const Title = (props: { badge: React.ReactNode; title: string }) => {
  const { badge, title } = props;
  return (
    <div className={styles['PageHeader-titleWrapper']} data-test="DesignSystem-PageHeader--Title">
      <Heading className={styles['PageHeader-title']}>{title}</Heading>
      {badge}
    </div>
  );
};
```

```29:35:core/components/atoms/heading/Heading.tsx
const sizeMap = {
  s: 'h5',
  m: 'h4',
  l: 'h3',
  xl: 'h2',
  xxl: 'h1',
};
```

```35:41:core/utils/types.tsx
export const extractBaseProps = (props: Record<string, any>) => {
  const baseProps = ['className', 'data-test'];
  const basePropsObj = baseProps.reduce((acc, curr) => {
    return props[curr] ? { ...acc, [curr]: props[curr] } : { ...acc };
  }, {});

  return basePropsObj;
};
```

---

## Severity summary

| Tier | Count |
|------|------:|
| **P1** | 1 |
| **P2** | 5 |
| **P3** | 2 |

---

## Findings (severity order)

### 1. Page title defaults to `Heading` → semantic **`h4`**, not a typical page **`h1`**

- **WCAG / basis:** 1.3.1 Info and Relationships (programmatic heading structure).
- **Severity:** **P1**
- **Scope:** **Component default** — `title` is required and rendered only through `Title` → `<Heading>{title}</Heading>` with **no `size` prop**, so `Heading` uses **`size="m"` → `h4`**.
- **Repro:** Render `<PageHeader title="Patients" navigationPosition="center" separator={true} />` (or any story/test usage that only sets `title`). Inspect the heading node in the accessibility tree — role is **heading** level **4**.
- **Issue + impact:** When this block represents the **primary page title** (common for an organism named PageHeader), the document outline **skips `h1`–`h3`**, which weakens **heading-based navigation** and can conflict with team/content rules that expect a single top-level heading.
- **Suggestion:** Default the title to a page-appropriate level (e.g. `size="xxl"` → `h1`) or add an explicit API (`titleSize`, `headingLevel`, `titleAs`, etc.) and document when to use nested vs. document-level headers.

---

### 2. No `<header>` / `role="banner"` on the page chrome wrapper

- **WCAG / basis:** 1.3.1 Info and Relationships; **Best practice** (landmark navigation; supports 2.4.1 Bypass Blocks when combined with page structure).
- **Severity:** **P2**
- **Scope:** **Component default** — outer and inner roots are `<div>` (`PageHeader.tsx`).
- **Repro:** Open any PageHeader story; use the screen reader **landmarks** rotor / dialog — there is **no banner** contributed by PageHeader itself unless a parent wraps it in `<header>`.
- **Issue + impact:** Users who navigate by **landmarks** may not discover this chrome as the **banner** region unless the app supplies an outer semantic wrapper.
- **Suggestion:** Render the main labeled/layout wrapper as **`<header>`** where it represents site/page header (respecting HTML rules for nested headers), or expose a prop to choose **`role="banner"`** when this instance is the document-level banner.

---

### 3. Optional `aria-label` on a generic `<div>` — documented as a “region” but no landmark role

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (name should pair with a meaningful role).
- **Severity:** **P2**
- **Scope:** **Component default** when `aria-label` is set; prop is optional (`PageHeaderProps` in `PageHeader.tsx`).
- **Repro:** Pass `aria-label="Page tools"` to `PageHeader`. Inspect a11y tree: the wrapper remains **generic** unless a role is added elsewhere.
- **Issue + impact:** Authors may expect a **named region** in landmark lists; a **generic** div with a name may **not** surface like `banner` or `region`, depending on UA/AT. This can **mismatch documentation** (“Accessible label for the page header **region**”).
- **Suggestion:** After adopting **`<header>`/banner** (finding 2), rely on banner semantics and visible title for naming, or use **`role="region"`** only when a sub-region label is truly needed (avoid duplicate/conflicting banners).

---

### 4. Breadcrumbs slot + design-system `Breadcrumbs` use `<div>` roots, not `<nav aria-label="Breadcrumb">`

- **WCAG / basis:** 1.3.1 Info and Relationships; **APG** [Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/) (`nav` with accessible name).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when using `Breadcrumbs`; PageHeader adds an extra **`div`** wrapper around the slot (`DesignSystem-PageHeader--Breadcrumbs`).
- **Repro:** `breadcrumbs={<Breadcrumbs list={…} />}` as in tests/stories. `Breadcrumbs` returns `<div data-test="DesignSystem-Breadcrumbs">` (`Breadcrumbs.tsx` ~136–152).
- **Issue + impact:** The trail is harder to find via **landmark navigation** and is structurally weaker than APG’s **`nav`** wrapper.
- **Suggestion:** Fix **`Breadcrumbs`** to render `<nav aria-label="Breadcrumb">` (or localized equivalent); optionally drop redundant wrappers around the slot. **Rollup:** root cause lives primarily in `Breadcrumbs`, not only PageHeader.

---

### 5. `Nav` wrapper is a `<div>`; landmark depends on slotted content

- **WCAG / basis:** **HTML** / **Best practice** (prefer `nav` for navigation blocks).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — `Nav` (`utils.tsx`) wraps `navigation || stepper` in `<div className={…PageHeader-navigationWrapper}>` (`data-test="DesignSystem-PageHeader--Nav"`).
- **Repro:** With **`navigation={<HorizontalNav … />}`**, the tree is **div (Nav) → nav (HorizontalNav)** — a **landmark exists** but is **nested inside an unnamed div**. With **`navigation={<Navigation … />}`**, structure is **div (Nav) → div (Navigation) → nav (HorizontalNav)** — still a **nav** landmark, with extra generic ancestors. With **only `stepper`**, a **`nav`** wrapper would be **inappropriate**; the current neutral `div` is reasonable.
- **Issue + impact:** Extra **generic** wrappers slightly **obscure structure** in the a11y tree and may complicate **landmark lists**; harm is **lower** when children expose their own `<nav>`.
- **Suggestion:** Avoid redundant wrappers, or document that **HorizontalNav** / **Navigation** must supply landmarks; do not blindly wrap **Stepper** in `<nav>`.

---

### 6. Limited passthrough to the main chrome wrapper (`className`, `data-test`, optional `aria-label` only)

- **WCAG / basis:** **Best practice** (extensibility for skip links, `aria-labelledby`, `id`).
- **Severity:** **P3**
- **Scope:** **Consumer-dependent**.
- **Issue + impact:** `extractBaseProps` only forwards **`className`** and **`data-test`** (`types.tsx`). Consumers cannot pass **`id`**, **`aria-labelledby`**, or other HTML attributes through `PageHeaderProps` to the inner wrapper without an extra DOM wrapper.
- **Suggestion:** Add **`headerProps` / `wrapperProps`** extending `BaseHtmlProps<HTMLElement>` (or similar) merged onto the future semantic header element.

---

### 7. Badge next to title with no explicit programmatic relationship

- **WCAG / basis:** **Best practice** (related content); 1.3.1 if badge conveys non-redundant meaning.
- **Severity:** **P3**
- **Scope:** **Consumer-dependent** when `badge` communicates status beyond decoration.
- **Issue + impact:** `Title` places **`Heading`** and **`badge`** as siblings in a **`div`** with no **`aria-describedby`** / **`aria-labelledby`** association.
- **Suggestion:** If the badge supplements the title for AT users, link via **`aria-describedby`** on the heading (stable **`id`** on badge container) or fold critical text into the visible title.

---

## Positive notes

- **No stripping of child ARIA:** Slots render `React.ReactNode` as-is; PageHeader does not override `aria-*` on children.
- **Reading order:** Breadcrumbs (when present) precede the title row in the DOM — sensible for linear navigation.
- **Optional `aria-label`:** When paired with a future **banner** landmark, gives authors a way to disambiguate multiple header instances (document the intended use).
- **Slotted nav:** Common composition **`HorizontalNav`** exposes a **`<nav aria-label={…}>`** root (`HorizontalNav.tsx` ~142–145), so **in-page navigation** can still be discoverable despite PageHeader’s `div` wrappers.

---

## Out of scope (not scored in this pass)

- Visual focus rings, contrast, target size, `prefers-reduced-motion`.
- Full audits of **`Tabs`**, **`Stepper`**, **`Divider`**, **`Button`**, **`StatusHint`**, **`MetaList`**, etc., except as referenced above.

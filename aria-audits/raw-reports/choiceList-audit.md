# ChoiceList — Structural ARIA / Semantic Audit

## Implementation files

| Role | Path |
|------|------|
| Main implementation | `core/components/organisms/choiceList/ChoiceList.tsx` |
| Public exports | `core/components/organisms/choiceList/index.tsx` |
| Tests (reference) | `core/components/organisms/choiceList/__tests__/ChoiceList.test.tsx` |
| Dependencies (atoms) | `Checkbox` (`core/components/atoms/checkbox/Checkbox.tsx`), `Radio` (`core/components/atoms/radio/Radio.tsx`), `Label` (`core/components/atoms/label/Label.tsx`) |

## Component overview

**APG / HTML pattern:** Group of related options using a native **`<fieldset>`** with either multiple **checkbox** inputs (`allowMultiple`) or **radio** inputs. This matches the recommended native pattern for grouped radios/checkboxes rather than a custom `radiogroup` / `group` ARIA widget.

**Root cause / rollup:** The visible **`title`** is not wired as the fieldset’s **accessible name**. It is rendered with **`Label`**, which produces a wrapper **`div`** and an inner **`<label>`** without **`htmlFor`**, instead of a **`<legend>`** or **`fieldset aria-labelledby`** pointing at a stable caption `id`. Several findings below roll up to this missing **name–caption** wiring for the group.

---

## Findings

### 1. Fieldset may have no accessible name when `title` and ARIA naming props are omitted

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (programmatic group context).
- **Severity:** **P1**
- **Scope:** **Component default** — `title`, `aria-label`, and `aria-labelledby` are all optional on `ChoiceListProps`.
- **Repro:** Fails when `ChoiceList` is used with only `choices` (and optional handlers) and no `title`, `aria-label`, or `aria-labelledby`.
- **Issue + impact:** The `<fieldset>` can be exposed without a computed accessible name. Screen reader users may hear options without a clear group question or section label, especially when tabbing through radios/checkboxes.
- **Suggestion:** Require a group name in API or docs (e.g. mandate `title` or `aria-label` / `aria-labelledby`), and/or default to deriving an accessible name when a title is present (see finding 2).

---

### 2. Visible `title` does not reliably name the `<fieldset>` (no `<legend>` / `aria-labelledby`)

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships; **HTML** / **APG** (fieldset caption via first `legend` or `aria-labelledby` / `aria-label`).
- **Severity:** **P1**
- **Scope:** **Component default** when consumers use **`title`** as the only group label (no `aria-label` / `aria-labelledby` on `ChoiceList`).
- **Repro:** Fails when `ChoiceList` is used as documented with `title="…"` and without `aria-label` or `aria-labelledby` on the list.
- **Issue + impact:** HTML expects the fieldset’s caption from **`legend`** or explicit ARIA naming. The current markup uses **`Label`**, which renders a **`div`** containing a **`<label>`** that is not associated with any control (**orphan `label`**). The visible title may not become the fieldset’s accessible name across browsers/AT, so the group can still appear unnamed or inconsistently named.
- **Suggestion:** Use **`<legend>`** for `title` (styled to match design), or render the title in an element with a **stable `id`** and set **`aria-labelledby`** on the `<fieldset>` to that `id`. Avoid orphan `<label>` for non-control captions.

---

### 3. Radio mutual exclusion depends on a shared `name` across all `choices`

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (expected radio-group behavior).
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — each `Choice` carries its own required **`name`**; the component does not normalize or validate equality.
- **Repro:** Fails when radio-mode `choices` use different `name` values for options that should be one-of-many.
- **Issue + impact:** Browsers only treat radios as one group when they share the same **`name`**. Mixed names break grouping, selection, and arrow-key expectations for native radio groups.
- **Suggestion:** Accept a single **`name`** on `ChoiceList` for radio (and checkbox) mode and pass it through to each child, or document and dev-warn when `name` differs across choices in radio mode.

---

### 4. Options without visible `label` need explicit accessible naming on the input

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships.
- **Severity:** **P1**
- **Scope:** **Consumer-dependent** — `Choice.label` is optional; `Checkbox` / `Radio` only render a `<label htmlFor={id}>` when `label` is truthy.
- **Repro:** Fails when a choice omits **`label`** (and meaningful **`helpText`**) and does not set **`aria-label`** or **`aria-labelledby`** on that choice (forwarded to the underlying input).
- **Issue + impact:** The input may lack an accessible name, so the option is not perceivable by name in the accessibility tree.
- **Suggestion:** Document that each choice must have **`label`** or **`aria-label`** / **`aria-labelledby`**; optionally type or runtime-check in development builds.

---

### 5. Layout wrappers are non-semantic `div`s (acceptable; optional grouping role)

- **WCAG / basis:** **Best practice** / **APG only** (clarity of “group” vs “list” semantics).
- **Severity:** **P2**
- **Scope:** **Component default**
- **Issue + impact:** Checkboxes/radios are wrapped in **`div`** containers for alignment. This is structurally fine with **`fieldset`**; no `role` is required. If product semantics need a “list of options,” consider whether an **`ul`/`li`** pattern is desired (not required for WCAG AA if names/roles/values are correct on inputs).
- **Suggestion:** No change required for AA; only revisit if design system standards require list semantics.

---

### 6. React `key` uses array index

- **WCAG / basis:** **Non-WCAG** (React reconciliation / focus stability when reordering).
- **Severity:** **P3**
- **Scope:** **Component default**
- **Issue + impact:** Reordering or inserting choices can remount inputs and disrupt focus or state; not a direct WCAG SC mapping.
- **Suggestion:** Prefer **`key={value}`** (or a stable choice id) when values are unique.

---

## Positive notes (structural)

- Uses native **`<fieldset>`** for the group container instead of a generic `div` with a custom ARIA role.
- Delegates to native **`checkbox`** / **`radio`** inputs with **`Label`** / **`htmlFor`** wiring on **`Checkbox`** and **`Radio`** when `label` is provided.
- Forwards per-choice **`aria-label`**, **`aria-labelledby`**, **`aria-describedby`**, **`tabIndex`**, and **`required`** to **`Checkbox`**; the same ARIA props (except `required` typing) are forwarded to **`Radio`** via spread onto the input.
- **`Checkbox`** wires **`aria-invalid`** from **`error`** and supports **`aria-checked="mixed"`** for indeterminate state (not used by `ChoiceList` directly but available downstream).

---

## Summary counts

| Severity | Count |
|----------|-------|
| P0 | 0 |
| P1 | 4 |
| P2 | 1 |
| P3 | 1 |

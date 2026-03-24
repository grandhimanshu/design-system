# EditableChipInput — Structural ARIA / Semantic Audit

## Component Overview

**APG / pattern:** Inline “click to edit” field that toggles between a read-only chip list (or placeholder) and an embedded **ChipInput**. The molecule composes **`Editable`** (focusable `role="button"` wrapper with Enter/Space to open edit mode), **`Chip`** / **`GenericChip`** (focusable `role="button"` per chip, with nested clear control), **`ChipInput`** (outer `role="button"` container around `<input>` and optional clear-all **Icon**), **`Button`** (Save / Discard), and **`Text`** for placeholder.

**Implementation files**

| File | Role |
|------|------|
| `core/components/molecules/editableChipInput/EditableChipInput.tsx` | Main implementation |
| `core/components/molecules/editableChipInput/index.tsx` | Re-exports |
| `core/components/atoms/editable/Editable.tsx` | `role="button"` wrapper, `tabIndex={0}`, click + Enter/Space → `onChange('edit')` |
| `core/components/molecules/chipInput/ChipInput.tsx` | Used when `showComponent === true`; composite `role="button"` + `<input>` |
| `core/components/atoms/chip/Chip.tsx` + `core/components/atoms/_chip/index.tsx` | Default-state chips (`role="button"`, optional nested clear `role="button"`) |

**Root cause / rollup:** Most structural problems come from **`Editable`** exposing a single large **`role="button"`** region around **all** child content. That forces **nested interactive widgets** (chips, ChipInput shell, and in edit mode a text field inside the same ancestry) and duplicates keyboard affordances. **`EditableChipInput`** does not add `aria-expanded`, `aria-controls`, or default accessible names for Save/Discard. Fixing the rollup likely requires changing **`Editable`** usage (or **`Editable`** itself) so the edit affordance is not a `button` wrapping other buttons/inputs.

---

## Findings (severity order)

### 1. Icon-only Save and Discard buttons have no accessible name

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P0**
- **Scope:** **Component default** whenever edit mode is shown (`showComponent === true`); `EditableChipInput` passes only `icon`, `size`, `disabled`, and `onClick`—no `children`, `tooltip`, or `aria-label`.
- **Repro:** Open edit mode as in Storybook `all` / `Uncontrolled`; inspect `DesignSystem-EditableChipInput--SaveButton` and `DesignSystem-EditableChipInput--DiscardButton` (`Button` → native `<button>`): `aria-label` is absent (`Button` sets it only from `aria-label` or icon-only + `tooltip`).
- **Issue + impact:** Screen readers announce a generic “button” with no name; users cannot tell Save vs Discard or their purpose.
- **Suggestion:** Pass explicit `aria-label` (and optionally `tooltip` for visual hover text) for both actions, or add visible text labels; align strings with product copy (“Save changes”, “Discard changes”).

---

### 2. Default / empty `placeholder` yields an unnamed edit trigger

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P0**
- **Scope:** **Component default** when `value` is empty/undefined and `placeholder` is omitted or left as default (`EditableChipInput.defaultProps.placeholder === ''`).
- **Repro:** Render `<EditableChipInput chipInputOptions={{ allowDuplicates: false, defaultValue: [], autoFocus: false }} />` without `placeholder`; focus `DesignSystem-EditableWrapper` (`role="button"`): visible name may be empty.
- **Issue + impact:** The sole focusable “edit” control has no computed accessible name; users cannot identify the field’s purpose.
- **Suggestion:** Require a non-empty placeholder in types/docs, default placeholder to a sensible string, and/or support `aria-label` / `aria-labelledby` on the **actual** edit trigger (today `extractBaseProps` on `EditableChipInput` applies to the **outer** `div`, not `Editable`’s inner `role="button"`).

---

### 3. Nested interactive controls: `Editable` `role="button"` wraps chip buttons and (in edit mode) ChipInput + text field

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships
- **Severity:** **P1**
- **Scope:** **Component default** with any chips (`clearButton` or not, chip body is still `role="button"` on `GenericChip`), and **Component default** in edit mode when `ChipInput` mounts (outer `role="button"` + `<input>` inside `Editable`’s `role="button"` subtree).
- **Repro:** Use `value={['Chip1','Chip2']}` with `chipInputOptions.chipOptions.clearButton: true` (see Jest snapshot); DOM under `DesignSystem-EditableWrapper` is `div[role="button"]` containing `div[role="button"]` chips, each optionally containing another `div[role="button"]` for remove. Toggle edit mode: `ChipInput` adds another `div[role="button"]` wrapping the `<input>`.
- **Issue + impact:** Nesting focusable widgets and roles that behave like buttons breaks APG expectations, can produce duplicate tab stops, conflicting keyboard handling (wrapper Enter/Space vs chip vs input), and unreliable announcements.
- **Suggestion:** Do not use a single `role="button"` around the whole field; restrict the edit affordance to one focus target (e.g. explicit “Edit” control or make the container a non-widget with a dedicated trigger), or restructure so chips/input are **not** descendants of a `button`/`role="button"` (coordinate with **`Editable`**).

---

### 4. Edit trigger does not expose expanded state or relationship to the editing region

- **WCAG / basis:** 4.1.2 Name, Role, Value; APG only (disclosure-style behavior)
- **Severity:** **P2**
- **Scope:** **Component default**; `Editable` does not set `aria-expanded` / `aria-controls` based on `editing` / `showComponent`.
- **Repro:** Toggle default vs edit mode; `DesignSystem-EditableWrapper` remains `role="button"` with no `aria-expanded`.
- **Issue + impact:** Assistive tech cannot reliably reflect that the field has expanded into an editing surface with extra actions.
- **Suggestion:** Pass `editing` into `Editable` (or wrap with props) so the trigger exposes `aria-expanded={boolean}` and, if stable ids exist, `aria-controls` pointing at the chip input/actions region.

---

### 5. `aria-*` on `EditableChipInput` root vs actual interactive target

- **WCAG / basis:** 4.1.2 Name, Role, Value; Best practice
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when consumers pass `aria-label` / `aria-labelledby` via `BaseProps` on `EditableChipInput` expecting to name the “edit” control.
- **Repro:** Pass `aria-label="Tags"` to `EditableChipInput`; it lands on the outer `div` (`DesignSystem-EditableChipInput`), not on `DesignSystem-EditableWrapper` (`role="button"`).
- **Issue + impact:** The labeled element may not be the control that receives focus and activation; naming can be ineffective or misleading.
- **Suggestion:** Forward naming props to `Editable`’s focusable wrapper, or document that consumers must wrap with an external `<label>` + `id` wired to a real focus target (after restructuring).

---

### 6. ChipInput accessible naming relies on `chipInputOptions` (optional)

- **WCAG / basis:** 4.1.2 Name, Role, Value
- **Severity:** **P2** (and **Consumer-dependent** for the inner field name)
- **Scope:** **Consumer-dependent**; `ChipInputProps` supports `'aria-label' | 'aria-labelledby' | 'aria-describedby'`, and `chipInputOptions` spreads onto `ChipInput` except `placeholder` / `value` / `defaultValue` are owned by the molecule.
- **Repro:** Omit `aria-label` on `chipInputOptions`; `ChipInput` outer `role="button"` and `<input>` may lack names unless placeholder text suffices for the input.
- **Issue + impact:** Without consumer-provided ARIA, the composite chip field may have a weak or ambiguous accessible name in edit mode.
- **Suggestion:** Document required `aria-label` or visible `<Label>` + `aria-labelledby` for production forms; optionally default `aria-label` from `placeholder` when no other name is provided (would be a **`ChipInput`** / API design change).

---

### 7. Dynamic chip list updates are not surfaced via a live region

- **WCAG / basis:** Best practice; 4.1.3 Status Messages (only if changes are essential and not otherwise conveyed)
- **Severity:** **P3** (enhancement, not framed as a violation)
- **Scope:** **Component default** when chips are removed via `onChipDelete` or updated on Save.
- **Issue + impact:** Screen reader users may not hear that the list length or contents changed unless focus/announcement happens elsewhere.
- **Suggestion:** Optionally tie a polite `aria-live` region to chip count or use page-level form feedback; only add if product requires off-focus announcements.

---

## Summary counts

- **P0:** 2  
- **P1:** 1  
- **P2:** 3  
- **P3:** 1  

---

## Out of scope (per audit charter)

Contrast, focus ring CSS, touch targets, motion/`prefers-reduced-motion` were not evaluated.

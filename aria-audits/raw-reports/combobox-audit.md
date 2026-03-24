# Combobox — structural ARIA / semantic audit

## Component overview

- **APG pattern:** [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) (listbox popup); implementation uses a **focus-moves-into-list** style (arrow keys move DOM focus to list item wrappers) rather than `aria-activedescendant` on the input.
- **Primary implementation files:**
  - `core/components/organisms/combobox/Combobox.tsx` — shell, popover, context, `popoverId` (`uidGenerator`), list wrapper `id`.
  - `core/components/organisms/combobox/ComboboxContext.tsx` — shared state (`openPopover`, `focusedOption`, refs, etc.).
  - `core/components/organisms/combobox/ComboboxList.tsx` — `Listbox` with `role="listbox"`.
  - `core/components/organisms/combobox/ComboboxOption.tsx` — `Listbox.Item` + option keyboard handling.
  - `core/components/organisms/combobox/utils.tsx` — option `Enter` / `Escape` / arrow navigation; uses `focusedOption` + `[data-test="DesignSystem-Listbox-ItemWrapper"]`.
  - `core/components/organisms/combobox/trigger/ComboboxTrigger.tsx` — single vs multi branch.
  - `core/components/organisms/combobox/trigger/InputBox.tsx` — single-select `role="combobox"` on `Input`.
  - `core/components/organisms/combobox/trigger/ChipInputBox.tsx` — multiselect combobox wiring.
  - `core/components/organisms/combobox/trigger/MultiselectTrigger.tsx` — chip UI + inner `<input>`.
  - `core/components/organisms/combobox/trigger/utils.tsx` — trigger-level arrows / `focusListItem`.
- **Shared dependency (high impact):** `core/components/organisms/listbox/listboxItem/ListBody.tsx` — inner focusable `[data-test="DesignSystem-Listbox-ItemWrapper"]` node used for focus and listbox arrow keys.

### Root cause / rollup

Several findings trace to **one DOM shape**: `Listbox.Item` renders an outer tag (e.g. `<li role="option">`) and an **inner** focusable `div` (`ListBody`) with a **fixed `role="tablist"`** and `listbox/utils.ts` arrow behavior. Combobox keyboard logic in `combobox/utils.tsx` keys off the same inner nodes but updates `focusedOption` separately. That coupling drives wrong roles, missing `aria-selected`, and possible **stale `focusedOption` vs actual focus** when inner and outer handlers both run.

---

## Findings (severity order)

### 1. Wrong role on the focused list item node (`tablist` inside `option`)

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships (structure/roles).
- **Severity:** **P1**
- **Scope:** **Component default** (any `Combobox` using `Combobox.Option` → `Listbox.Item` → `ListBody`).
- **Repro:** Open list, move focus with arrows; inspect focused node — it is `DesignSystem-Listbox-ItemWrapper` with `role="tablist"`, nested inside an ancestor intended as `option`.
- **Issue + impact:** Assistive technologies expect listbox options to behave as `option` (or focus + `aria-activedescendant` on the combobox). Here, **DOM focus lands on a `tablist`**, not on the `role="option"` host. Parent/child role combination (`option` containing `tablist`) is structurally invalid and misreports the control to screen readers.
- **Suggestion:** For `type === 'option'` listbox rows, remove or override `role="tablist"` on `ListBody` (use `presentation`/`none` or no redundant role), and align focus target with the element that exposes `role="option"` **or** adopt APG’s `aria-activedescendant` pattern so focus stays on the combobox.

### 2. Options do not expose `aria-selected` (or multiselect equivalent)

- **WCAG / basis:** 4.1.2 Name, Role, Value; APG listbox option states.
- **Severity:** **P1**
- **Scope:** **Component default** for all combobox lists.
- **Repro:** Render `Combobox` with `Combobox.List` / `Combobox.Option`; inspect DOM — no `aria-selected` on options (confirmed: no `aria-selected` in `combobox/` sources).
- **Issue + impact:** Selected state is only reflected via styling (`selected` → CSS); assistive tech may not announce which option is selected while navigating.
- **Suggestion:** Set `aria-selected={true|false}` on the **accessible** option node (aligned with fix #1). For `multiSelect`, follow APG for multiselectable listbox (`aria-multiselectable` on list + `aria-selected` per option).

### 3. Multiselect: “selected” state ignores `chipInputValue`

- **WCAG / basis:** 4.1.2 Name, Role, Value.
- **Severity:** **P1**
- **Scope:** **Component default** when `multiSelect` is true.
- **Repro:** Use documented multiselect combobox; select chips from list — `ComboboxOption` still computes `selected={option.label === inputValue?.label}` and never reads `chipInputValue` from context.
- **Issue + impact:** Selected styling/state (and any future `aria-selected`) will not match chips chosen in multiselect mode, so users get incorrect selection feedback.
- **Suggestion:** Derive selection from `chipInputValue` (and/or `option.value`) when `multiSelect` is true; keep single-select on `inputValue` otherwise.

### 4. `focusedOption` can diverge from actual DOM focus (dual key handlers)

- **WCAG / basis:** 2.1.1 Keyboard; 4.1.2 Name, Role, Value (state vs focus).
- **Severity:** **P1**
- **Scope:** **Component default** when navigating with arrow keys inside the list.
- **Issue + impact:** `ListBody` attaches `listbox/utils.ts` `onKeyDown` (moves focus between item wrappers). `ComboboxOption` attaches `combobox/utils.tsx` `handleKeyDown` on the outer item (bubbles after inner handler). **`focusedOption` is only updated in combobox `navigateOptions` / `focusListItem`, not when the inner listbox handler moves focus.** `Enter` uses `focusedOption.click()` in `handleEnterKey`, not `document.activeElement`, so the activated option can disagree with the visibly focused row if context is stale or handlers disagree.
- **Suggestion:** Single source of truth: either remove redundant handlers, or on every focus change (including inner arrow navigation) update `focusedOption` / use `activeElement` inside the list container for `Enter`, or consolidate on one APG pattern (`aria-activedescendant`).

### 5. `aria-controls` IDs the scroll wrapper, not the `listbox` root

- **WCAG / basis:** 4.1.2 Name, Role, Value (relationships); **APG** relationship clarity.
- **Severity:** **P2**
- **Scope:** **Component default** (`Combobox.tsx` puts `id={popoverId}` on the wrapping `div` around `children`; `role="listbox"` is on `ComboboxList` inside).
- **Issue + impact:** `aria-controls` should point at the popup’s **listbox** (or dialog) element where possible; pointing at a generic wrapper is weaker for assistive tech mapping.
- **Suggestion:** Move the stable `id` to the `Listbox` root (or pass `popoverId` into `ComboboxList` and set `id` there) so `aria-controls` references the listbox.

### 6. Accessible name: placeholder / generic fallbacks and simultaneous `aria-label` + `aria-labelledby`

- **WCAG / basis:** 4.1.2 Name, Role, Value; **Best practice** (placeholder as sole name).
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** for correct naming (`aria-label` / `aria-labelledby` on `Combobox`); **Component default** for fallback behavior when props omitted.
- **Issue + impact:** `InputBox` / `ChipInputBox` set `aria-label={… || placeholder || 'Combobox-…-Trigger'}` **and** pass `aria-labelledby` through. Relying on placeholder as the name is fragile (placeholder hidden when filled). Generic fallback strings are not a meaningful name. If both label props are passed incorrectly, accname resolution can be confusing.
- **Suggestion:** Prefer requiring `aria-label` or `aria-labelledby` in docs/types; avoid placeholder as primary name; omit `aria-label` when `aria-labelledby` is provided and sufficient.

### 7. Multiselect trigger: `role="button"` wrapper around `role="combobox"` input

- **WCAG / basis:** 4.1.2; **Best practice** (nested interactive semantics).
- **Severity:** **P2**
- **Scope:** **Component default** for `multiSelect` (`MultiselectTrigger.tsx`).
- **Issue + impact:** Outer `div` is `role="button"` with click/keyboard-to-focus behavior while inner `input` is `role="combobox"`. Creates nested widget semantics and extra keyboard handling (`Enter`/`Space` on wrapper) that can confuse assistive tech even when `tabIndex={-1}` on the wrapper (as `ChipInputBox` sets).
- **Suggestion:** Use a non-widget wrapper (`div` without `role="button"`) and rely on the input for combobox semantics and focus, or a single composite pattern documented for AT.

### 8. No `aria-autocomplete` on combobox inputs

- **WCAG / basis:** **APG only** / **Best practice** (not a clear AA failure if behavior is otherwise clear).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Filter-as-you-type behavior is typical for combobox; `aria-autocomplete="list"` (and/or `"inline"`) helps AT expose behavior consistently with APG examples.
- **Suggestion:** Set `aria-autocomplete` appropriate to filtering behavior.

### 9. Error / hint text not wired through Combobox API

- **WCAG / basis:** 3.3.1 Error Identification; 3.3.2 Labels or Instructions — **enhancement** unless error is communicated only via color.
- **Severity:** **P3** (enhancement)
- **Scope:** **Consumer-dependent** — consumers can pass through to `Input` if exposed; Combobox does not document `aria-describedby` / `aria-invalid` passthrough on the root props interface.
- **Issue + impact:** Validation messages may not be programmatically associated with the combobox trigger.
- **Suggestion:** Extend props to forward `aria-describedby`, `aria-invalid`, and document pairing with `Message` / `HelpText` ids.

### 10. Optional: live region for filtered result counts

- **WCAG / basis:** **Best practice** / **Non-WCAG** polish for dynamic suggestions.
- **Severity:** **P3** (enhancement)
- **Scope:** **Consumer-dependent** (filtering is usually app logic).
- **Suggestion:** If options change asynchronously, consider `aria-live="polite"` for result count or empty state — only if it does not duplicate redundant announcements.

---

## Summary counts

| P0 | P1 | P2 | P3 |
| -- | -- | -- | -- |
| 0  | 4  | 4  | 2  |

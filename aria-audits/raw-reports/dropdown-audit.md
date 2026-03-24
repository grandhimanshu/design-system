# Dropdown — structural ARIA / semantic audit
## Implementation files reviewed
| Area | Path |
|------|------|
| Class orchestration | `core/components/atoms/dropdown/Dropdown.tsx` |
| Popover, list, keyboard, options rendering | `core/components/atoms/dropdown/DropdownList.tsx` |
| Trigger button | `core/components/atoms/dropdown/DropdownButton.tsx` |
| Option dispatcher & custom renderer | `core/components/atoms/dropdown/option/index.tsx` |
| Option row variants | `core/components/atoms/dropdown/option/DefaultOption.tsx`, `CheckboxOption.tsx`, `IconOption.tsx`, `MetaOption.tsx` (same interaction pattern as `DefaultOption` / `IconOption`) |
| Helpers | `core/components/atoms/dropdown/utility.tsx` |
| States | `core/components/atoms/dropdown/Loading.tsx`, `ErrorTemplate.tsx` |
| Popover shell | `core/components/molecules/popover/Popover.tsx` → `core/components/atoms/popperWrapper/PopperWrapper.tsx` |
**APG reference:** [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) / [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/) (when `menu` is used). The component is **deprecated** in source (`Dropdown.tsx`); this audit still applies to current code.
## Component overview
The Dropdown composes a **Popover**-hosted panel with a **`role="listbox"`** or **`role="menu"`** region (`DropdownList.tsx`), options implemented as **`div`**s with **`role="option"`** / **`menuitem`** / **`menuitemcheckbox`**, plus optional search **`Input`**, “Select all” **`Checkbox`**, and Apply/Cancel **`Button`**s. The default trigger is a native **`<button>`** (`DropdownButton.tsx`).
**Root cause / rollup:** Several findings share the same gaps: (1) the **trigger is not wired** to the list with `aria-haspopup`, `aria-expanded`, and `aria-controls` + stable element `id`s; (2) **keyboard “cursor” state** (`cursor`) drives highlighting and synthetic `click()` on Enter but **does not follow APG focus or `aria-activedescendant` semantics**; (3) **checkbox / option `id`s are regenerated with `Date.getTime()` on render**, which breaks stable label relationships and risks duplicate ids in edge cases.
---
## Findings (severity order)
### 1. Trigger omits popup state and relationship attributes
- **WCAG / basis:** 4.1.2 Name, Role, Value; APG listbox / menu button trigger expectations.
- **Severity:** **P1**
- **Scope:** **Component default** (default `DropdownButton` trigger).
- **Repro:** Use Dropdown with default trigger and open/close the panel; inspect the `<button>` — it receives `aria-label` / `aria-labelledby` via spread but **no `aria-expanded` or `aria-haspopup`**, and **no `aria-controls`** pointing at the list/menu container.
- **Issue + impact:** Assistive technologies cannot reliably expose **expanded/collapsed** state or the **relationship** between the trigger and the popup list. Users may not discover that a list is attached or whether it is open.
- **Suggestion:** On the trigger, set `aria-expanded={dropdownOpen}`, `aria-haspopup` appropriate to the pattern (`listbox` vs `menu`), and `aria-controls` referencing a **stable `id`** on the list/menu root. Ensure the list root exposes that `id`.
---
### 2. No Escape key handler to dismiss the popup
- **WCAG / basis:** 2.1.1 Keyboard; APG (Escape closes listbox/menu popup).
- **Severity:** **P1**
- **Scope:** **Component default**.
- **Repro:** Open the dropdown; with focus on the wrapper trigger path or search field, press **Escape** — `onkeydown` in `DropdownList.tsx` has no `case 'Escape'` (only `ArrowDown`, `ArrowUp`, `Enter`, `Tab`).
- **Issue + impact:** Users who expect the **standard dismiss gesture** for overlays/lists may be unable to close the widget from the keyboard without tabbing away or using outside click (if provided by Popper).
- **Suggestion:** On keydown (when open), handle `Escape` to call the same close path as `onToggleDropdown(false, …)` and return focus to the trigger.
---
### 3. Listbox/menu keyboard model does not sync focus with the active option
- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.4.3 Focus Order (with 2.1.1 operability); APG listbox.
- **Severity:** **P1**
- **Scope:** **Component default**.
- **Repro:** Open dropdown with search (`withSearch` / async). Focus stays in the **search field**; use **ArrowDown/Up** — `focusOption` updates `cursor` and scrolls nodes but **does not move DOM focus** or set **`aria-activedescendant`** on the listbox. Enter then **clicks** the node at `cursor` while focus may still be on the input.
- **Issue + impact:** Screen reader users may not hear the **active option** as focus moves; the implementation mixes **input focus** with a **separate highlight index**, which is fragile and not aligned with APG single-select listbox or combobox patterns.
- **Suggestion:** Prefer one APG pattern: e.g. **`aria-activedescendant`** on the listbox (or combobox input) with option `id`s, **or** roving `tabIndex` with **actual `.focus()`** on the active option, and arrow keys moving that focus.
---
### 4. Every enabled option is in the tab sequence (`tabIndex={0}`)
- **WCAG / basis:** 2.4.3 Focus Order (Level A).
- **Severity:** **P1**
- **Scope:** **Component default** for standard option rows (`DefaultOption`, `IconOption`, `MetaOption`, `CheckboxOption`, etc.).
- **Repro:** Open a list with many options; repeatedly press **Tab** — each option participates in sequential focus navigation.
- **Issue + impact:** Large lists create a **very long tab chain**, making the control heavy to leave and non-standard compared to platform listboxes (typically one tab stop + arrows).
- **Suggestion:** Use **roving tabindex** (one `tabIndex={0}` in the list, others `-1`) or `aria-activedescendant` so Tab moves **out** of the list predictably.
---
### 5. Unstable `id` values for checkbox / “Select all” (`Date.getTime()` in render)
- **WCAG / basis:** 4.1.1 Parsing (duplicate / invalid id usage); 4.1.2 (label association); 1.3.1 Info and Relationships.
- **Severity:** **P1**
- **Scope:** **Component default** wherever checkboxes are rendered (`renderSelectAll`, `renderOptions` in `DropdownList.tsx`).
- **Repro:** Re-render the dropdown (e.g. state update) and observe `id` / `htmlFor` — values **change every render**, breaking consistent association; rapid mounts can also risk **colliding** ids across instances in the same millisecond.
- **Issue + impact:** **`label`/`htmlFor` pairing becomes unstable**; assistive technologies and speech tools may reference the wrong control or lose the relationship after updates.
- **Suggestion:** Generate ids with **`useId()`** (React 18+) or a **stable per-instance + per-index** key; never `new Date().getTime()` in render.
---
### 6. `aria-label` and `aria-labelledby` both applied to the list/menu container
- **WCAG / basis:** 4.1.2 Name, Role, Value (accessible name calculation); Best practice.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** when `aria-labelledby` is passed for the trigger/list; **component default** always sets `aria-label={resolvedOptionsAriaLabel}` and may also set `aria-labelledby={triggerAriaLabelledBy}`.
- **Issue + impact:** **Redundant or conflicting naming** depending on browser/AT heuristics; harder for authors to reason about the exposed name.
- **Suggestion:** If `aria-labelledby` is provided and sufficient, omit `aria-label` (or the inverse), per **one primary naming mechanism** per element.
---
### 7. Missing `aria-controls` / stable list `id` (trigger ↔ list)
- **WCAG / basis:** APG only / Best practice (relationships).
- **Severity:** **P2**
- **Scope:** **Component default**.
- **Issue + impact:** Without `id` on the list/menu root and `aria-controls` on the trigger, the **programmatic relationship** is incomplete for some assistive technologies.
- **Suggestion:** Add a stable `id` on the `role="listbox"` / `role="menu"` wrapper and reference it from the trigger’s `aria-controls`.
---
### 8. `role="menu"` path is only partially implemented
- **WCAG / basis:** 2.1.1 Keyboard; APG menu / menubar patterns.
- **Severity:** **P2**
- **Scope:** **Component default** when `menu={true}`.
- **Issue + impact:** Container uses **`role="menu"`** with **`menuitem` / `menuitemcheckbox`**, but **focus management** and **menu-specific key handling** (roving focus within menu, wrapping, typeahead, etc.) are not fully aligned with APG; behavior still leans on the generic `DropdownList` keydown and per-option `tabIndex={0}`.
- **Suggestion:** Either fully implement the **Menu Button** APG keyboard model or document this as a **non-APG menu** and avoid implying full menu semantics.
---
### 9. “Select all” row participates in cursor index but is not consistently focusable like options
- **WCAG / basis:** 2.1.1 Keyboard; APG only.
- **Severity:** **P2**
- **Scope:** **Component default** when `withCheckbox` + select-all visible.
- **Issue + impact:** `focusOption` targets `.OptionWrapper` nodes including the select-all wrapper, but that wrapper is **not** given the same **tabIndex** treatment as options; keyboard and pointer “active” styling can **diverge** from focus and from the underlying **checkbox** (`tabIndex={-1}` on `Checkbox`).
- **Suggestion:** Treat select-all as a single focusable widget (or move roving focus to the checkbox with visible focus) and align cursor index with focus/`aria-activedescendant`.
---
### 10. Custom trigger (`customTrigger`) — no built-in ARIA or popup wiring
- **WCAG / basis:** 4.1.2; 2.1.1.
- **Severity:** **P2**
- **Scope:** **Consumer-dependent** — consumers must supply correct semantics.
- **Issue + impact:** `React.cloneElement` only forces **`tabIndex={0}`** and a ref — **no `aria-expanded` / `aria-haspopup` / `aria-controls` / keyboard** contract is enforced.
- **Suggestion:** Document required props; optionally wrap with a small **Trigger** helper that injects ARIA + key handlers, or use a render prop with typed contracts.
---
### 11. Loading and empty/error content — no live region or busy state
- **WCAG / basis:** 4.1.3 Status Messages (AA, where applicable); Best practice.
- **Severity:** **P3** (enhancement — not asserted as AA failure unless status is the only channel).
- **Scope:** **Component default** (`Loading.tsx`, `ErrorTemplate.tsx`, blank list messaging in `DropdownList.tsx`).
- **Issue + impact:** When options transition between **loading**, **error**, and **results**, there is **no `aria-live` / `role="status"`** and no **`aria-busy`** on the list region; users may not hear that state changed.
- **Suggestion:** Add `aria-busy` on the list container while loading; for error/no-results text after async updates, use a polite live region or `role="status"`.
---
### 12. Custom `optionRenderer` — accessibility delegated entirely to consumer
- **WCAG / basis:** 4.1.2; 1.3.1.
- **Severity:** **P3** (enhancement / contract).
- **Scope:** **Consumer-dependent**.
- **Issue + impact:** Custom renderers can omit roles, names, and keyboard support.
- **Suggestion:** Document required **role**, **name**, **disabled** handling, and keyboard activation; provide an example pattern.
---
## Summary counts
- **P0:** 0  
- **P1:** 5  
- **P2:** 5  
- **P3:** 2  
No color/contrast, focus ring CSS, or touch-target sizing were evaluated (out of scope for this structural audit).

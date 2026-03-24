# Tabs — Structural ARIA / Semantic HTML Audit

## Implementation map

| Role | Path |
|------|------|
| Main tabs widget | `core/components/molecules/tabs/Tabs.tsx` |
| Panel slot / props carrier | `core/components/molecules/tabs/Tab.tsx` |
| Alternate header + panel swap | `core/components/molecules/tabs/TabsWrapper.tsx` |
| Public API | `core/components/molecules/tabs/index.tsx` |
| Styles (focus, layout) | `css/src/components/tabs.module.css` |
| Stories / tests (usage context) | `core/components/molecules/tabs/__stories__/`, `core/components/molecules/tabs/__tests__/` |

**APG reference:** [Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — `tablist`, `tab`, `tabpanel`, labelling, keyboard.

**Related primitives:** `core/components/atoms/icon/Icon.tsx` + `core/accessibility/utils/useAccessibilityProps.ts` (interactive icon → `role="button"`, Enter/Space); `Tooltip` wraps truncated tab labels in `Tabs.tsx`.

---

## Architectural summary

1. **`Tabs`** — With **composed `children`** (`<Tab>`), renders `role="tablist"`, per-header `role="tab"` on focusable `<div>`s, and a single `role="tabpanel"` whose content is `tabs[activeIndex]`. With **`tabs={TabConfig[]}` only** (no children), headers still render as tabs but **no `tabpanel`** is emitted and `aria-controls` is omitted.

2. **`TabsWrapper`** — Visually similar strip + content swap, but headers use **`role="button"`** only; there is **no `tablist` / `tab` / `tabpanel`** wiring and **no selected state** in the accessibility tree.

3. **Root rollup:** `tabRefs` is built by **pushing only non-disabled** tab DOM nodes during render, while **ArrowLeft / ArrowRight** index that array with the **visual tab index** (`tabIndex` argument). Those two coordinate systems diverge whenever a disabled tab appears **before** a focused enabled tab, so keyboard navigation can focus the **wrong** control or **no-op**.

---

## Findings

### 1. ArrowLeft / ArrowRight index `tabRefs` with tab index, but `tabRefs` only lists enabled tabs

- **WCAG / basis:** 2.1.1 Keyboard  
- **Severity:** **P0**  
- **Scope:** **Component default** whenever at least one tab is `disabled` and a disabled tab is not only a suffix of the list (any disabled tab with a lower index than a focused enabled tab).  
- **Repro:** Three tabs: enabled (0), **disabled** (1), enabled (2). Focus tab 2; press ArrowLeft. `tabRefs` is `[el0, el2]` (length 2). Handler uses `tabRefs[tabIndex - 1]` → `tabRefs[1]` → **tab 2’s element**, not tab 0. Focus does not move to the previous tab as expected.  
- **Issue + impact:** `ref={(element) => element && !disabled && tabRefs.push(element)}` compresses the array; `tabKeyDownHandler` uses `tabRefs[tabIndex ± 1]` as if indices matched tab positions. Keyboard users cannot reliably traverse the tab strip; behavior violates APG expectations and breaks a common configuration (disabled middle tab).  
- **Suggestion:** Keep a **fixed-length** ref array keyed by tab index (`useRef<(HTMLDivElement \| null)[]>([])`, assign `refs.current[i] = el`), and resolve next/previous focus by **walking indices** while skipping `disabled`. Alternatively, compute the next enabled target from tab metadata only.

---

### 2. `Space` does not activate a tab (only `Enter`)

- **WCAG / basis:** 2.1.1 Keyboard; APG tabs (activation with Space)  
- **Severity:** **P1**  
- **Scope:** **Component default** for `Tabs` `role="tab"` headers  
- **Repro:** Focus a tab; press Space — `tabKeyDownHandler` only invokes `tabClickHandler` for `Enter`.  
- **Issue + impact:** Common tab widgets and APG documentation expect Space to select; users may get scrolling or no action.  
- **Suggestion:** Treat `event.key === ' '` / `Spacebar` like `Enter`; call `preventDefault()` when handling.

---

### 3. Arrow keys do not call `preventDefault()` when moving focus

- **WCAG / basis:** 2.1.1 Keyboard; Best practice  
- **Severity:** **P2**  
- **Scope:** **Component default**  
- **Repro:** Focus a tab in a scrollable page; ArrowDown/ArrowUp may be unaffected, but if the browser maps horizontal arrows to scroll in some contexts, unconsumed defaults can compete with widget behavior.  
- **Issue + impact:** Lower risk than (1)–(2), but explicit `preventDefault()` when ArrowLeft/Right are handled is standard for composite widgets.  
- **Suggestion:** When moving focus between tabs, `preventDefault()` on handled arrow keys.

---

### 4. Dismissible tabs: nested interactive control (`role="button"` Icon inside `role="tab"`)

- **WCAG / basis:** 4.1.2 Name, Role, Value; 2.1.1 Keyboard (focus order); HTML / Best practice (avoid nested interactive elements)  
- **Severity:** **P1**  
- **Scope:** **Component default** when `isDismissible` is true  
- **Repro:** Tab through the strip: each dismissible tab is **two** tab stops (tab container + inner `Icon` with `onClick` → `useAccessibilityProps` adds `role="button"`, `tabIndex={0}`).  
- **Issue + impact:** Confusing composite for AT and keyboard users; close affordance has **no** `aria-label` in `renderDismissIcon` (glyph name alone is not a reliable accessible name).  
- **Suggestion:** Single tab stop where possible (e.g. dismiss as separate control, keyboard shortcut on tab, or explicit `aria-label` on the dismiss action and documented pattern); avoid nested buttons inside tabs per HTML guidance.

---

### 5. `TabsWrapper`: tab-like UI without `tablist` / `tab` / selected state

- **WCAG / basis:** 4.1.2 Name, Role, Value; 1.3.1 Info and Relationships  
- **Severity:** **P1**  
- **Scope:** **Component default** for `TabsWrapper`  
- **Repro:** Inspect headers: `role="button"` only; content panel is a plain `div` without `tabpanel` / `aria-labelledby` / `aria-controls`; no `aria-selected` or `aria-pressed` for the active header.  
- **Issue + impact:** Visually reads as tabs; the tree reads as unrelated buttons with no “which panel is active” state.  
- **Suggestion:** Align with `Tabs` ARIA model, or document as a non-tab switcher and expose state via `aria-pressed` / `aria-current="page"` (or similar) on the active header plus labelled panel semantics.

---

### 6. Missing accessible name on `tab` when `label` is not a string

- **WCAG / basis:** 4.1.2 Name, Role, Value  
- **Severity:** **P1**  
- **Scope:** **Consumer-dependent** — composed `<Tab label={…}>` with non-string `label` without another naming prop  
- **Repro:** `aria-label={typeof label === 'string' ? label : undefined}` leaves the tab unnamed if the visible name is only in non-text children.  
- **Issue + impact:** Tabs can appear unnamed in the accessibility tree.  
- **Suggestion:** Forward `aria-label` / `aria-labelledby` from `Tab` props to the header `div`, or tighten types/docs to require a string or explicit ARIA name.

---

### 7. `tabs` prop-only mode: no in-component `tabpanel`

- **WCAG / basis:** 4.1.2; APG (tab–panel relationship)  
- **Severity:** **P2**  
- **Scope:** **Consumer-dependent** — `<Tabs tabs={config} />` without `children`  
- **Repro:** No `{children && (… tabpanel …)}` branch; `aria-controls` stays undefined.  
- **Issue + impact:** Headers are exposed as tabs without an associated panel in this component; consumers must wire panels and ids externally or the pattern is incomplete.  
- **Suggestion:** Document required external pairing, or extend the API to supply panel content and stable ids.

---

### 8. `tablist` often has no accessible name

- **WCAG / basis:** 4.1.2; Best practice  
- **Severity:** **P2**  
- **Scope:** **Consumer-dependent** — `aria-labelledby` on `Tabs` is optional  
- **Repro:** Use `Tabs` without `aria-labelledby` and without a referenced visible title.  
- **Issue + impact:** Screen reader users get a list of tabs without group context.  
- **Suggestion:** Default examples with `aria-labelledby` or optional `aria-label` on the tablist container.

---

### 9. No Home / End navigation on the tablist

- **WCAG / basis:** APG only / Best practice  
- **Severity:** **P2**  
- **Scope:** **Component default**  
- **Repro:** Home/End do not move focus first/last (enabled) tab.  
- **Issue + impact:** Less efficient for keyboard users; not always an AA failure if other navigation works.  
- **Suggestion:** Home → first enabled tab, End → last enabled tab (skip disabled), matching APG.

---

### 10. All enabled tabs use `tabIndex={0}` (no roving tabindex)

- **WCAG / basis:** APG (recommended); Best practice  
- **Severity:** **P2**  
- **Scope:** **Component default**  
- **Repro:** Sequential Tab visits every tab header.  
- **Issue + impact:** More tab stops than roving pattern; not inherently invalid if arrows work correctly.  
- **Suggestion:** Roving `tabindex` on the active/focused tab with arrow-key focus moves.

---

### 11. Child detection uses `element.type.name === Tab.name`

- **WCAG / basis:** Non-WCAG (robustness / production builds)  
- **Severity:** **P2**  
- **Scope:** **Component default** under minification or renamed components  
- **Repro:** Bundler renames `Tab`; `filterTabs` may fail to recognize `<Tab>`.  
- **Issue + impact:** Composition and tabpanel wiring can break silently.  
- **Suggestion:** Use `displayName`, a dedicated property, or explicit structure instead of `type.name`.

---

### 12. Redundant `aria-label` when `label` is a plain string

- **WCAG / basis:** Best practice (name computation)  
- **Severity:** **P3**  
- **Scope:** **Component default** for string labels  
- **Repro:** Outer `div` sets `aria-label={label}` while visible text inside repeats the same string.  
- **Issue + impact:** Possible duplicate announcements in some AT.  
- **Suggestion:** Prefer `aria-labelledby` pointing at the visible text node, or omit `aria-label` when the name is fully exposed in descendants.

---

### 13. Single shared `tabpanel` id for all tabs (`aria-controls`)

- **WCAG / basis:** Best practice / APG (document intent)  
- **Severity:** **P3**  
- **Scope:** **Component default** with children mode  
- **Repro:** Every `tab` shares the same `aria-controls={panelId}`; panel content swaps; `aria-labelledby` tracks `${id}-tab-${activeIndex}`.  
- **Issue + impact:** Valid for one live panel; differs from multi-panel DOM patterns. Low risk if documented.  
- **Suggestion:** Document intentional single-panel behavior; optional per-index panel ids if needed.

---

### 14. `aria-selected` / `activeIndex` edge cases with disabled tabs

- **WCAG / basis:** 4.1.2 (state consistency)  
- **Severity:** **P3**  
- **Scope:** **Consumer-dependent** — controlled `activeIndex` vs `disabled`  
- **Repro:** If `activeIndex` targets a disabled tab during transient state, `aria-selected` uses `!disabled && activeIndex === index` (false for that tab).  
- **Issue + impact:** Rare mismatch between visual and declared state.  
- **Suggestion:** Clamp selection to enabled indices or document constraints.

---

## Severity summary

| Tier | Count |
|------|------:|
| **P0** | 1 |
| **P1** | 4 |
| **P2** | 7 |
| **P3** | 3 |

---

## Positive notes (structural)

- **`Tabs`** exposes `role="tablist"`, `role="tab"`, stable `id`s on tabs, `aria-selected`, `aria-disabled`, optional `aria-labelledby` on the tablist, and (with children) `role="tabpanel"` with `id` + `aria-labelledby` tied to the active tab.  
- **`TabsWrapper`** implements **Enter** and **Space** on its header `role="button"` nodes (unlike `Tabs` tabs for Space).  
- **Styles:** `.Tab:focus` defines a visible outline; disabled tabs use `tabIndex={-1}` and `.Tab--disabled:focus { outline: none }`, which is acceptable when disabled nodes are not focusable.

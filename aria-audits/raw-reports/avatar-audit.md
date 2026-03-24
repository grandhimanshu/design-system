# Avatar & AvatarGroup — structural ARIA / semantic audit

## Component overview

- **APG patterns (reference):** Avatar stacks are often treated as **decorative or informational imagery** with optional **tooltips**; a “+N more” control that reveals additional people maps most closely to a **disclosure** / **menu button** / **dialog** pattern depending on interaction, not a **listbox** unless the popover is an actual single-select options list with `role="listbox"` and `role="option"`.
- **Implementation map:**
  - **Avatar:** `core/components/atoms/avatar/Avatar.tsx` composes `Tooltip` → `Popover` / `PopperWrapper`, optional `Avatar.Image` / `Avatar.Icon` subcomponents, `AvatarProvider` context.
  - **AvatarGroup:** `core/components/atoms/avatarGroup/AvatarGroup.tsx` renders visible avatars via `Avatars.tsx`, overflow via `Popover` + `AvatarCount.tsx`, default popover body via `AvatarPopperBody.tsx` (`Listbox` + `AvatarOptionItem` + `AvatarInput`).
- **Rollup themes:** (1) **Default focus/tab order** on non-interactive avatars; (2) **Conflicting or duplicated naming** when `role="img"` wraps real `<img>` / initials; (3) **AvatarCount** declares **listbox** semantics while the popover content is a **plain list** (`ul` / `li`); (4) **Popover** layer does not add **`aria-expanded` / `aria-controls`** (shared with other components — see `aria-audits/raw-reports/popover-audit.md`).

### Files reviewed

| Area | Path |
|------|------|
| Avatar | `core/components/atoms/avatar/Avatar.tsx`, `core/components/atoms/avatar/index.tsx` |
| Context | `core/components/atoms/avatar/AvatarProvider.tsx` |
| Avatar.Image | `core/components/atoms/avatar/avatarImage/AvatarImage.tsx` |
| Avatar.Icon | `core/components/atoms/avatar/avatarIcon/AvatarIcon.tsx` |
| AvatarGroup | `core/components/atoms/avatarGroup/AvatarGroup.tsx` |
| Visible stack | `core/components/atoms/avatarGroup/Avatars.tsx` |
| +N trigger | `core/components/atoms/avatarGroup/AvatarCount.tsx` |
| Popover body | `core/components/atoms/avatarGroup/AvatarPopperBody.tsx`, `AvatarOptionItem.tsx`, `AvatarInput.tsx` |
| Shared primitives | `core/components/molecules/tooltip/Tooltip.tsx`, `core/components/atoms/popperWrapper/PopperWrapper.tsx`, `core/components/organisms/listbox/Listbox.tsx`, `core/components/organisms/listbox/listboxItem/ListboxItem.tsx`, `core/components/atoms/icon/Icon.tsx`, `core/accessibility/utils/useAccessibilityProps.ts` |

---

## Avatar — findings

### 1. Static avatars are in the tab order by default (`tabIndex={0}` + `role="img"`)

- **WCAG / basis:** **2.4.3** Focus Order (focus moves to controls that are not operable); **4.1.2** (focusable `img` / `role="img"` without keyboard operation — AT may treat as interactive). Aligns with **HTML** expectation that `img` is not normally focusable unless part of an interactive widget.
- **Severity:** **P1**
- **Scope:** **Component default** — when `disabled` is false and the consumer does not pass `tabIndex`, the root `<span>` receives `tabIndex={0}` while `resolvedRole` defaults to **`img`** (unless `tabIndex` is explicitly provided, which switches role to **`button`** — see finding 2).
- **Repro:** Render `<Avatar firstName="Ada" lastName="Lovelace" />` with defaults; tab through the page: the avatar receives focus though it has no `onClick` / keyboard action at the Avatar layer.
- **Issue + impact:** Keyboard users traverse many focus stops for decorative or read-only identity chips; screen readers may imply an actionable control.
- **Suggestion:** Default to **`tabIndex={undefined}`** (omit attribute) for non-interactive avatars; only set `tabIndex={0}` (and an appropriate `role`, usually `button`, or use a real `<button>`) when the avatar is explicitly interactive (e.g. new prop `interactive` or when `onClick` is passed via `extractBaseProps` if ever supported). Pair with clear docs.

---

### 2. `role` / `tabIndex` coupling is easy to misuse (`role` defaults to `button` when `tabIndex` is set)

- **WCAG / basis:** **4.1.2** Name, Role, Value; **APG** button pattern (buttons must support activation keys and appropriate semantics).
- **Severity:** **P1** (when consumers set `tabIndex` without wiring activation); **P2** (API clarity).
- **Scope:** **Consumer-dependent** — `resolvedRole = role ?? (tabIndex !== undefined ? 'button' : 'img')` means any explicit `tabIndex` forces **`button`** role, but Avatar does not implement **`onKeyDown`** for **Enter** / **Space** at the root.
- **Repro:** `<Avatar tabIndex={0} firstName="A" lastName="B" />` → `role="button"` with no keyboard activation handler on the span.
- **Issue + impact:** Announced as a button without behaving like one for keyboard users.
- **Suggestion:** If `tabIndex` is set, require `role` explicitly or default interactive mode with documented keyboard handlers, or render a **native `<button type="button">`** (with safe styling) when interactive.

---

### 3. `role="img"` wrapper around real `<img>` (Avatar.Image) duplicates / nests image semantics

- **WCAG / basis:** **1.1.1** Non-text Content (accurate single name for the image); **Best practice** / **HTML** (avoid nested redundant graphics in the accessibility tree).
- **Severity:** **P1**
- **Scope:** **Component default** when using **`Avatar.Image`** inside **`Avatar`** with custom `children` (pattern: `<Avatar ...>{image}</Avatar>` as in `Avatars.tsx`).
- **Repro:** Use `Avatar` with `Avatar.Image` / `src`; outer span has `role="img"` and `aria-label` derived from names while inner `img` uses `alt={firstName}` (see finding 8).
- **Issue + impact:** Potential **double announcement** or conflicting accessible names; invalid / fragile combination of **group** semantics.
- **Suggestion:** When children include a native **`img`**, either: drop outer `role="img"` and rely on **`img` `alt`**, or set inner **`alt=""`** and keep one naming source on the wrapper — not both competing names.

---

### 4. Initials inside `role="img"` — redundant name vs visible text

- **WCAG / basis:** **1.3.1** Info and Relationships; **Best practice** (visible label vs `aria-label` duplication).
- **Severity:** **P2**
- **Scope:** **Component default** for string-initials path — visible initials (`Text`) plus `aria-label` often repeating the same letters/name.
- **Issue + impact:** Some AT may read name twice or prefer `aria-label` over visible text inconsistently.
- **Suggestion:** If visible initials fully convey identity, consider **`aria-hidden="true"`** on decorative text and a single concise `aria-label`, or omit `role="img"` and expose text as **plain text** with a wrapping `aria-label` only when needed.

---

### 5. Presence indicator (`span`) is purely visual with no `aria-hidden`

- **WCAG / basis:** **Best practice** (decorative status chrome); **1.4.1** Use of Color — presence is also color-coded (`active` / `away`), but naming is not exposed structurally here.
- **Severity:** **P2**
- **Scope:** **Component default** — empty `<span>` with class-based color in `Avatar.tsx`.
- **Issue + impact:** May create silent or confusing extra nodes; **active/away** state is not exposed to AT unless folded into the main accessible name/description.
- **Suggestion:** Mark presence dot **`aria-hidden="true"`** if redundant with `aria-label`/tooltip; if not redundant, expose state in **`aria-label`** or **`aria-describedby`** (e.g. “Away”).

---

### 6. `status` slot renders arbitrary `ReactNode` without live region or semantics

- **WCAG / basis:** **4.1.3** Status Messages (if status is dynamic); **Best practice** for supplementary badge content.
- **Severity:** **P2** (dynamic status could be **P1** if it conveys important changes without announcement).
- **Scope:** **Consumer-dependent** — wrapper `<span>` has no `role` or `aria-live`.
- **Suggestion:** Document that consumers should pass accessible content or use **`aria-hidden`** for purely decorative badges; consider optional **`role="img"`** + **`aria-label`** on the status container when icon-only.

---

### 7. Fallback / placeholder `Icon` (person, groups) — no default `aria-hidden`

- **WCAG / basis:** **Best practice** — decorative icon when parent supplies **`aria-label`** on `role="img"` parent.
- **Severity:** **P2**
- **Scope:** **Component default** — `Icon` in `Avatar.tsx` / `AvatarImage.tsx` does not pass **`aria-hidden`**; `useAccessibilityProps` does not default hidden for non-clickable icons.
- **Issue + impact:** Possible extra noise from icon font / roleless `<i>` content in some AT.
- **Suggestion:** Pass **`aria-hidden={true}`** on placeholder icons when the outer avatar already has an accessible name.

---

### 8. Avatar.Image: `alt` uses only `firstName`

- **WCAG / basis:** **1.1.1** Non-text Content (alt should serve the same purpose as the image — usually full display name).
- **Severity:** **P1**
- **Scope:** **Component default** — `alt={firstName}` on the `<img>` in `AvatarImage.tsx`.
- **Repro:** `lastName` only, or `firstName` empty → **`alt`** empty or incomplete while the visible tooltip/name may use both names.
- **Issue + impact:** Incorrect or missing name for the photo in the accessibility tree.
- **Suggestion:** Build **`alt`** from **`firstName` + `lastName`** (trimmed), with a sensible fallback string or consumer prop **`imageAlt`**.

---

## AvatarGroup — findings

### 9. Root container has no accessible name or `role="group"`

- **WCAG / basis:** **1.3.1** Info and Relationships; **Best practice** for related UI chunks.
- **Severity:** **P2**
- **Scope:** **Component default** — outer `<div data-test="DesignSystem-AvatarGroup">` has no **`aria-label`** / **`aria-labelledby`**.
- **Issue + impact:** Screen reader users hear a flat sequence of avatars without “Members” / “Assignees” (or similar) grouping context.
- **Suggestion:** Optional prop **`aria-label`** / **`aria-labelledby`**; consider **`role="group"`** when a label is provided.

---

### 10. `AvatarCount`: `aria-haspopup="listbox"` does not match popover content

- **WCAG / basis:** **4.1.2** Name, Role, Value (relationship between trigger and popup type); **APG** listbox pattern requires **`role="listbox"`**, **`role="option"`,** keyboard selection model.
- **Severity:** **P1**
- **Scope:** **Component default** — `AvatarCount.tsx` sets **`aria-haspopup="listbox"`** while `AvatarPopperBody` renders **`Listbox`** with **`tagName="ul"`** and **no `role="listbox"`** on the list (`Listbox.tsx` renders a plain **`ul`**). `ListboxItem` uses **`li`** without **`role="option"`** for `type="description"`.
- **Repro:** Open overflow popover; inspect DOM: trigger claims **listbox** popup; list is a **semantic HTML list**, not an ARIA listbox widget.
- **Issue + impact:** Assistive technologies expect listbox keyboard behavior and structure; mismatch causes wrong instructions and expectations.
- **Suggestion:** Use **`aria-haspopup="dialog"`** or **`true`** (legacy) for generic popovers, or **`menu`** if actions are menu-like; align with actual **`Popover`** semantics. If the content is only informational, **disclosure** naming (`aria-expanded`) is more important than `haspopup` flavor.

---

### 11. `AvatarCount`: `role="button"` without guaranteed keyboard activation

- **WCAG / basis:** **2.1.1** Keyboard; **4.1.2** (button role implies operability).
- **Severity:** **P1**
- **Scope:** **Component default** — `div` with **`role="button"`** and **`tabIndex={0}`**; opening/closing is handled by **`PopperWrapper`** (click for `on="click"`, mouse + **focus/blur** for `on="hover"`). No **`onKeyDown`** for **Enter** / **Space** on this trigger.
- **Repro:** Set `popoverOptions.on` to **`click`**; focus **+N** and press **Space** — no key handler on the `AvatarCount` div itself (depends on whether `PopperWrapper` attaches key handlers — it does not in reviewed code).
- **Issue + impact:** Keyboard users may be unable to open the overflow popover reliably.
- **Suggestion:** Use **`<button type="button">`** as the trigger (styled), or add **keyboard handlers** consistent with `PopperWrapper`’s open toggle.

---

### 12. Missing `aria-expanded` (and typically `aria-controls`) on overflow trigger

- **WCAG / basis:** **4.1.2** States and properties for expandable UI; **WAI-ARIA** for disclosure-like widgets. (See also shared **Popover** limitations.)
- **Severity:** **P1**
- **Scope:** **Component default** — `AvatarCount` does not set **`aria-expanded`**; **`PopperWrapper`** does not wire expansion state to ARIA on the trigger.
- **Repro:** Toggle popover open/closed; trigger element unchanged in ARIA state.
- **Issue + impact:** Users cannot tell whether the “+N” panel is open or closed from the accessibility tree.
- **Suggestion:** Fix in **`PopperWrapper`** / **`Popover`** for all consumers, or pass through props from **`AvatarGroup`** once the primitive supports them.

---

### 13. Weak accessible name for “+N” control

- **WCAG / basis:** **4.1.2** Accessible Name (purpose of control); **2.4.4** Link Purpose (in spirit — control purpose in name).
- **Severity:** **P2**
- **Scope:** **Component default** — visible text is **`+{count}`** only (e.g. “+3”) with no **`aria-label`** explaining “3 more people” / “Show additional assignees”.
- **Issue + impact:** Name may be unclear out of visual context.
- **Suggestion:** Add **`aria-label`** derived from **`hiddenAvatarCount`** and optional consumer override.

---

### 14. Each stacked avatar wrapped in a `div` (no list semantics)

- **WCAG / basis:** **Best practice** / **HTML** — a set of similar items can be a **`ul`** / **`li`** or **`role="list"`** with **`aria-label`**.
- **Severity:** **P3**
- **Scope:** **Component default** — `Avatars.tsx` maps to **`<div>`** per item.
- **Suggestion:** Optional list semantics or document that consumers should provide surrounding context.

---

### 15. `AvatarPopperBody` default `Listbox` + `AvatarOptionItem`: interactive semantics only if consumer wires them

- **WCAG / basis:** **2.1.1** Keyboard; **4.1.2** if items are meant to be activated.
- **Severity:** **P2** (informational list); **P1** if product treats rows as actionable without handlers.
- **Scope:** **Component default** — `Listbox.Item` forwards **`onClick`** only when provided; `AvatarOptionItem` does **not** pass **`onClick`** → items may be inert while looking like rich list rows.
- **Suggestion:** Clarify in docs whether rows are **static** (consider **`aria-readonly`** / plain structure) or **actionable** (provide **`onClick`** + keyboard focus model).

---

### 16. Search field (`AvatarInput` → `Input`)

- **WCAG / basis:** **3.3.2** Labels or Instructions — depends on **`Input`** implementation and whether **`placeholder`** / **`aria-label`** is set by callers (`searchPlaceholder` only).
- **Severity:** **P2** (consumer / composition)
- **Scope:** **Consumer-dependent** — `AvatarPopperBody` passes **`placeholder={searchPlaceholder}`**; verify **`Input`** exposes an accessible name when used without a visible label.
- **Suggestion:** Ensure default popover search supplies **`aria-label`** (e.g. “Search people”) when no visible **`Label`** is used.

---

### 17. Custom `popperRenderer` escape hatch — accessibility fully consumer-owned

- **WCAG / basis:** N/A structural guarantee — **consumer-dependent**.
- **Severity:** **P3** (documentation)
- **Scope:** When `popperRenderer` is set, **AvatarPopperBody** returns arbitrary JSX with no structural guardrails.
- **Suggestion:** Document required ARIA for custom bodies (focus trap rules if modal, etc.).

---

## Severity summary (this audit)

| Tier | Count (approx.) |
|------|-----------------|
| **P1** | 8 |
| **P2** | 8 |
| **P3** | 2 |

---

## Out of scope (not audited here)

- Visual focus ring CSS, color contrast, motion, touch target measurements.
- Full **`Tooltip`** / **`Popover`** deep-dive (cross-reference `aria-audits/raw-reports/tooltip-audit.md` and `popover-audit.md`).
- **`AvatarSelection`** and related atoms (separate components).

---

## Positive notes

- **Avatar** exposes **`aria-label`**, **`role`**, and **`tabIndex`** overrides for advanced consumers.
- **Tooltip** integration uses **`PopperWrapper`** hover + **focus** open path, which helps pointer-free discovery when tooltips are shown (separate from Tooltip `role` / `aria-describedby` gaps in the shared stack).
- **Disabled** avatars set **`tabIndex={-1}`**, removing keyboard focus when disabled.

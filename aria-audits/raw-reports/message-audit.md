# Structural ARIA audit: Message, InlineMessage, Toast

**Audit type:** Static implementation review (semantic HTML, WAI-ARIA roles/states, live regions, keyboard exposure).  
**Scope:** Default component output and props surface only; consumer wiring (forms, portals, focus management) noted where relevant.

---

## Implementation map

| Component       | Layer     | Primary files |
|-----------------|-----------|---------------|
| **Message**     | Atom      | `core/components/atoms/message/Message.tsx`, `core/components/atoms/message/index.tsx` |
| **InlineMessage** | Organism | `core/components/organisms/inlineMessage/InlineMessage.tsx`, `core/components/organisms/inlineMessage/index.tsx` |
| **Toast**       | Atom      | `core/components/atoms/toast/Toast.tsx`, `core/components/atoms/toast/ActionButton.tsx`, `core/components/atoms/toast/index.tsx` |

**Shared dependencies (relevant to structure):**

- `extractBaseProps` (`core/utils/types.tsx`) — only forwards `className` and `data-test`; no generic `id` / `aria-*` passthrough on these components.
- **Message** `Heading` — `core/components/atoms/heading/Heading.tsx` (semantic heading level via `GenericText` / `componentType`, e.g. `size="s"` → `h5`).
- **Toast** close **Icon** — `core/components/atoms/icon/Icon.tsx` + `useAccessibilityProps` (`core/accessibility/utils/useAccessibilityProps.ts`) when `onClick` is set (adds `role="button"`, `tabIndex`, Enter/Space → click).

---

## Severity summary (this audit)

| Tier | Count (approx.) | Notes |
|------|-----------------|--------|
| **P0** | 0 | No single issue identified that reliably breaks WCAG 2.2 AA in isolation for all default usages. |
| **P1** | 1 | Toast action buttons inside `<form>` may submit unintentionally (`type` not set). |
| **P2** | 6 | Live-region semantics, decorative icon, non-`<button>` close control, prop surface for `id`/ARIA. |
| **P3** | 3 | Polish / APG alignment / heading order in context. |

---

## 1. Message (`Message.tsx`)

### What the implementation does

- Root: `<div>` with `role="alert"` when `appearance` is `alert` or `warning`; otherwise `role="status"`.
- Leading **Icon**: `aria-hidden="true"` (decorative relative to text).
- **Title**: `Heading` (`size="s"` → `h5` in current mapping).
- **Description**: `Text` or a plain `<div>` when `children` is non-string React content.
- **Actions**: Plain `<div>` wrapping consumer `actions` node.

### Findings

- **WCAG / basis:** 4.1.3 Status Messages · **P2** · **Component default** · **Repro:** Render `<Message appearance="info" description="Saved" />` — region is `role="status"` (appropriate for many success/info messages). No explicit `aria-live`; implicit live behavior comes from the `status` role (generally polite). Acceptable pattern; optional explicit `aria-live="polite"` for consistency across engines.  
  **Impact:** Minor inconsistency risk across AT/browser combinations.  
  **Suggestion:** If you want identical announcements everywhere, set `aria-live` explicitly to match intent (polite for `status`, assertive for `alert`).

- **WCAG / basis:** 4.1.3 · **P2** · **Component default** · **Repro:** `<Message appearance="warning" description="Heads up" />` uses `role="alert"` (assertive).  
  **Impact:** Warnings that are not urgent errors may interrupt users; same mapping as `appearance="alert"`.  
  **Suggestion:** Consider `role="status"` + polite live for non-blocking warnings, or document that `warning` is intentionally assertive.

- **WCAG / basis:** Best practice (flexible naming/relationships) · **P2** · **Component default**  
  **Issue:** `MessageProps` extends `BaseProps` only; root cannot receive `id`, `aria-labelledby`, `aria-describedby`, etc., without changing the component API.  
  **Impact:** Harder to associate the message with controls or error summaries (`aria-describedby` / `aria-errormessage` patterns often need a stable id on the message container).  
  **Suggestion:** Extend props with safe passthrough (e.g. `Omit<BaseHtmlProps<HTMLDivElement>, ...>`) or explicit `id` / `messageId` for the root.

- **WCAG / basis:** 1.3.1 · **P3** · **Consumer-dependent**  
  **Issue:** Optional `Heading` inside the live region can affect document heading outline when many messages exist.  
  **Impact:** Skipped levels or noisy outlines depending on page structure.  
  **Suggestion:** Document recommended heading level / avoid title when embedded in dense forms; or offer `titleAs` / visual-only title variant (careful not to remove semantics without replacement).

- **WCAG / basis:** HTML / APG · **P3** · **Consumer-dependent**  
  **Issue:** Non-string `children` render inside a `<div>` without a complementary landmark role.  
  **Impact:** Usually fine; rich content may need lists/paragraph semantics from the consumer.  
  **Suggestion:** Document that consumers should supply appropriate semantics inside `children`.

---

## 2. InlineMessage (`InlineMessage.tsx`)

### What the implementation does

- Root: `<div>` with **no** `role` or `aria-live`.
- **Icon** (when `appearance !== 'default'`): **No** `aria-hidden`; maps appearance to Material icon name.
- **Description:** `Text` as `span` (via `GenericText`).

### Findings

- **WCAG / basis:** 1.1.1 Non-text Content / Best practice (decorative vs informative images) · **P2** · **Component default** · **Repro:** `<InlineMessage appearance="alert" description="Invalid email" />` — icon is exposed to AT as text/icon glyph; description already states the problem.  
  **Impact:** Possible redundant or noisy announcements (icon name + message text).  
  **Suggestion:** If the icon duplicates the text meaning, set `aria-hidden="true"` on the icon (mirror **Message**). If the icon is the sole carrier of meaning (no suitable text), that would be a different failure — here text is required.

- **WCAG / basis:** 4.1.3 · **P2** · **Consumer-dependent**  
  **Issue:** No live region on the root. For **static** helper text next to a field, this is normal. For text that **updates** (e.g. validation after blur) without moving focus, some AT users benefit from `role="status"` / `aria-live="polite"` on the message container.  
  **Impact:** Dynamic updates might not be announced unless the author wraps the component or sets live region attributes.  
  **Suggestion:** Document dynamic vs static usage; optionally add prop `live?: 'off' | 'polite' | 'assertive'` or `role` override for field error patterns.

- **WCAG / basis:** 3.3.1 Error Identification / 1.3.1 · **P2** · **Consumer-dependent**  
  **Issue:** Component does not set `id` or wire `aria-describedby` / `aria-invalid` on related inputs.  
  **Impact:** Errors are not programmatically tied to the field unless the app does so.  
  **Suggestion:** Document pattern: put stable `id` on wrapper (or extend API) and reference from `Input`/`TextField` `aria-describedby` / `aria-errormessage` as supported.

- **WCAG / basis:** Best practice · **P2** · **Component default**  
  **Issue:** Same `BaseProps`-only surface as Message — no `id` passthrough on root.  
  **Impact:** Consumers must add a wrapper element to obtain an id for `aria-describedby`.  
  **Suggestion:** Forward `id` (and optionally `role` / `aria-live`) via props.

- **WCAG / basis:** 1.4.1 Use of Color · **P3** · **Component default**  
  **Note:** Non-`default` appearances show icon + text, which helps avoid color-only cues. `default` is text-only — still acceptable if wording conveys state.

---

## 3. Toast (`Toast.tsx`, `ActionButton.tsx`)

### What the implementation does

- Root: `<div>` with `role="alert"` for `appearance` `alert` or `warning`, else `role="status"`, plus explicit `aria-live` (`assertive` vs `polite`) aligned with that split.
- Decorative state **Icon** (left): `aria-hidden="true"`.
- **Title:** `Heading` (`size="s"`).
- **Close:** **Icon** with `onClick`, `aria-label="Close"` — `useAccessibilityProps` supplies `role="button"`, `tabIndex={0}`, and keyboard activation (Enter / Space).
- **Actions:** `ActionButton` renders native `<button>` with `Text` child.

### Findings

- **WCAG / basis:** 3.2.2 On Input (forms) / HTML · **P1** · **Component default** · **Repro:** Place Toast with `actions` inside a `<form>` and activate an action button — HTML `<button>` defaults to `type="submit"`.  
  **Impact:** Unexpected form submission.  
  **Suggestion:** Set `type="button"` on `ActionButton`.

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P2** · **Component default** · **Repro:** Inspect close control in accessibility tree — it is an `<i>` with `role="button"`. Keyboard and name are present.  
  **Impact:** Works with many ATs; still weaker than a real `<button>` for behavior (e.g. disabled state, native focus ring conventions, file activation).  
  **Suggestion:** Replace with **Button** / **IconButton** primitive or `<button type="button">` wrapping the icon per design-system rules (“use `<button>` for actions”).

- **WCAG / basis:** 2.4.3 Focus Order · **P2** · **Consumer-dependent**  
  **Issue:** Toast container is not focus-managed here; close is focusable (`tabIndex={0}`). In a portal stack, tab order depends on DOM order and mounting.  
  **Impact:** Focus may jump unexpectedly if toast mounts late.  
  **Suggestion:** Document: prefer `aria-live` announcements without moving focus for transient toasts; if focus is required, manage in the toast host.

- **WCAG / basis:** 4.1.3 · **P3** · **Component default**  
  **Note:** `role="alert"` plus `aria-live="assertive"` is redundant but valid; harmless.

- **WCAG / basis:** 1.3.1 · **P3** · **Consumer-dependent**  
  **Issue:** Same heading-level considerations as Message when multiple toasts or page headings exist.

---

## Cross-cutting themes

1. **Limited HTML/ARIA surface on roots** — `extractBaseProps` + `BaseProps` prevent `id` and `aria-*` on **Message** and **InlineMessage** roots (**Toast** root also only gets `className` / `data-test` from base). One API extension fixes several authoring patterns.

2. **Alert vs status mapping** — **Message** and **Toast** both treat `warning` like `alert` (assertive). Worth validating against product/UX intent.

3. **Decorative icons** — **Message** and **Toast** hide state icons; **InlineMessage** does not. Align **InlineMessage** with the others if the text is always sufficient.

---

## Positive observations

- **Message** and **Toast** use `role="alert"` / `role="status"` to expose status messages in the accessibility tree; **Toast** also sets `aria-live` explicitly.
- **Message** and **Toast** mark leading state icons `aria-hidden="true"`, avoiding duplicate meaning with text.
- **Toast** close control has an accessible name (`aria-label="Close"`) and keyboard support via shared `useAccessibilityProps`.
- **Toast** actions use real `<button>` elements (aside from the missing `type` attribute).

---

## Suggested verification (manual)

1. **NVDA / VoiceOver:** Trigger info vs alert toasts and messages; confirm politeness vs interrupt behavior matches expectations.
2. **Keyboard:** Tab to Toast close; activate with Enter and Space; check focus visibility (`:focus-visible` in CSS modules).
3. **Form:** Toast with actions inside `<form>` — confirm no accidental submit after `type="button"` fix.

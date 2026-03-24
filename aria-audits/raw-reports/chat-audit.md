# Structural ARIA audit: Chat (molecule)

**Scope:** Static code review of the Chat molecule and its subcomponents for semantic HTML, WAI-ARIA usage, and alignment with WCAG 2.2 AA structural requirements and common APG patterns. No runtime assistive-technology verification.

**Severity summary:** 3 **P0** · 3 **P1** · 4 **P2** · 2 **P3**

---

## Implementation map

| Area | Path | Role in UI |
|------|------|------------|
| Root compound export | `core/components/molecules/chat/index.tsx` | Re-exports `Chat` |
| Shell | `core/components/molecules/chat/Chat.tsx` | Wrapper `div` + static `Chat.*` attachments |
| Incoming bubble | `core/components/molecules/chat/chatBubble/IncomingBubble.tsx` | Metadata row, avatar, message body, optional toolbar |
| Outgoing bubble | `core/components/molecules/chat/chatBubble/OutgoingBubble.tsx` | Metadata, message body, status icon, optional toolbar |
| Bubble router | `core/components/molecules/chat/chatBubble/ChatBubble.tsx` | Chooses incoming vs outgoing |
| Input | `core/components/molecules/chat/chatInput/ChatInput.tsx` | `textarea` + send/stop `Button` |
| Date separator | `core/components/molecules/chat/dateSeparator/DateSeparator.tsx` | Centered date line |
| New messages marker | `core/components/molecules/chat/newMessage/NewMessage.tsx` | “New messages” style control |
| Unread jump | `core/components/molecules/chat/unreadMessage/UnreadMessage.tsx` | Unread banner / control |
| Typing indicator | `core/components/molecules/chat/typingIndicator/TypingIndicator.tsx` | Status text |

Supporting styles (not audited for contrast): `css/.../chatBubble.module.css`, `chatInput.module.css`, `chatSeparator.module.css`.

---

## P0 — Critical (plausible AA failure or serious AT breakage)

### 1. `role="group"` with broken `aria-labelledby` (Incoming + Outgoing bubbles)

- **WCAG / basis:** 4.1.2 Name, Role, Value · **P0** · **Component default**
- **Repro:** Render any `Chat.ChatBubble` (incoming or outgoing). Inspect the outer wrapper: `aria-labelledby="chat-bubble-header"` is present, but **no descendant (or document node) defines `id="chat-bubble-header"`** in these components (confirmed via repository search; only bubbles reference this string).
- **Issue / impact:** Assistive technologies cannot resolve an accessible name for the group. The `group` role is only useful when named (or labelled); a dangling reference yields an unnamed group, weakening structure for users navigating by landmark/region semantics and failing the programmatic name requirement for that object.
- **Suggestion:** Either (a) add a stable visible heading (or other text node) with `id="chat-bubble-header"` inside each bubble that carries the label intent, or (b) replace with `aria-label` built from sender + time (or pass-through props), or (c) drop `role="group"` if no meaningful grouping name exists and rely on native semantics of children.

**Files:** `IncomingBubble.tsx` (lines 47–52), `OutgoingBubble.tsx` (lines 52–58).

---

### 2. `NewMessage`: `role="button"` without keyboard support or activation contract

- **WCAG / basis:** 2.1.1 Keyboard · 4.1.2 Name, Role, Value · **P0** · **Component default** (consumer may partially patch via `...rest`)
- **Repro:** Use `<Chat.NewMessage text="…" />` as in unit tests—no `tabIndex`, no `onKeyDown`, no `onClick` in the component API by default. The root is a `div` with `role="button"`.
- **Issue / impact:** A `button` in the accessibility tree must be operable with keyboard (typically focusable `tabIndex={0}` plus Enter/Space). Screen readers announce a button; keyboard users cannot focus or activate it unless the consumer forwards props through `...rest`—which is undocumented as a requirement and not reflected in prop types.
- **Suggestion:** Use a native `<button type="button">` for the interactive surface (preferred), or implement full roving focus + key handlers. If the control is non-interactive, remove `role="button"` and any misleading `aria-label` that implies action.

**File:** `newMessage/NewMessage.tsx`.

---

### 3. `UnreadMessage`: `role="button"` on inner `span` without keyboard support

- **WCAG / basis:** 2.1.1 Keyboard · 4.1.2 · **P0** · **Component default**
- **Repro:** Default markup: outer `div` receives `...rest`; the element with `role="button"` is an inner `span` with no `tabIndex`, no keyboard handlers, and no click handler defined by the component.
- **Issue / impact:** Same class of failure as `NewMessage`: advertised as a button but not keyboard-operable. Additionally, consumers cannot attach `onClick`/`tabIndex` to the `span` via the primary `...rest` surface without wrapping or forking, because spread props apply to the outer `div`, not the `role="button"` node.
- **Suggestion:** Flatten to a single `<button type="button">` (or make the outer element the button with full keyboard support). Ensure decorative `Icon` does not duplicate the accessible name (see P3).

**File:** `unreadMessage/UnreadMessage.tsx`.

---

## P1 — High (significant barrier; often fixable with clear API or behavior change)

### 4. `ChatInput`: no built-in label association for the `textarea`

- **WCAG / basis:** 1.3.1 Info and Relationships · 3.3.2 Labels or Instructions · 4.1.2 · **P1** · **Component default** (mitigated if consumers pass `aria-label` / `aria-labelledby` via `...rest`)
- **Repro:** Default usage sets `placeholder` via `defaultProps` but the component does not render a `<label>` nor set `aria-label`/`aria-labelledby` itself.
- **Issue / impact:** Placeholder alone is not a durable accessible name; many AT users do not get an equivalent to a persistent label.
- **Suggestion:** Add an optional `label` / `labelId` prop pair, or document and type `aria-label` as required for unlabelled usage; align with design-system `TextField` / `Label` patterns.

**File:** `chatInput/ChatInput.tsx`.

---

### 5. Bubble action bar: hover-only visibility

- **WCAG / basis:** 2.1.1 Keyboard · **P1** · **Component default** when `actionBar` is provided
- **Repro:** `showActionBar` toggles on `Row` `onMouseEnter` / `onMouseLeave` only. The toolbar is not shown on focus-within, and there is no keyboard path to reveal it.
- **Issue / impact:** Keyboard and many mobile AT users cannot reach actions that only appear on hover.
- **Suggestion:** Also toggle on `onFocus`/`onBlur` or use `:focus-within` in CSS; ensure toolbar contents are tabbable when visible; consider persistent overflow menu pattern per APG.

**Files:** `IncomingBubble.tsx`, `OutgoingBubble.tsx`.

---

### 6. `Row` with mouse handlers (no `role` / keyboard parity)

- **WCAG / basis:** 2.1.1 Keyboard · **P1** · **Component default** (when `actionBar` used)
- **Repro:** The `Row` wrapping the bubble content uses mouse enter/leave to reveal UI; `Row` renders a plain `div` with no complementary focus handling.
- **Issue / impact:** Paired with finding 5—structurally the “hover surface” is a non-interactive `div` controlling visibility of `role="toolbar"` content.
- **Suggestion:** Same as #5; optionally move handlers to a focusable control or use CSS `:focus-within` on a wrapper that includes the toolbar.

---

## P2 — Medium (APG / best-practice gaps, polish, or ambiguous semantics)

### 7. `Chat` root: no landmark or live-region contract for a conversation surface

- **WCAG / basis:** Best practice / APG (Feed, log-like regions) · **P2** · **Consumer-dependent** layout
- **Issue / impact:** The root is a generic `div` with only `data-test`. Real chat UIs usually expose a `region`/`log` (with careful `aria-live` usage) so users can find the transcript and hear new messages appropriately.
- **Suggestion:** Document recommended composition: e.g. wrap the scrollable message list in `role="log"` or `role="region"` with `aria-label`, and coordinate live regions for new messages at the app level.

**File:** `Chat.tsx`.

---

### 8. `DateSeparator`: `role="separator"` for date text

- **WCAG / basis:** ARIA semantics / HTML · **P2** · **Component default**
- **Issue / impact:** A date string functions more like a section heading or static label than a thematic `separator` in many designs. `role="separator"` is valid for non-focusable dividers but may not match user mental model; combined with `aria-label={String(date)}` it duplicates visible text (acceptable but worth reviewing).
- **Suggestion:** Consider a heading level appropriate to the page outline, or `role="presentation"` on a wrapper with visible text only, if design intent is “date heading” not “divider.”

**File:** `dateSeparator/DateSeparator.tsx`.

---

### 9. `NewMessage`: `aria-live="polite"` co-located with `role="button"`

- **WCAG / basis:** Best practice · **P2** · **Component default**
- **Issue / impact:** Mixing live-region behavior with interactive `button` semantics on one node is uncommon; updates may interact oddly with AT focus and announcements.
- **Suggestion:** If live announcements are needed, use a separate visually hidden `role="status"` sibling; keep the interactive control as a native `button`.

**File:** `newMessage/NewMessage.tsx`.

---

### 10. `role="toolbar"` without documented keyboard pattern

- **WCAG / basis:** APG Toolbar pattern · **P2** · **Consumer-dependent** (toolbar contents are render props)
- **Issue / impact:** The shell sets `role="toolbar"` and `aria-label="Action bar"` but does not implement roving `tabindex` or arrow-key navigation between items—acceptable if a single tab stop, but if consumers inject multiple controls, behavior may fall short of APG expectations.
- **Suggestion:** Document expected child count and keyboard behavior; or delegate to a Toolbar primitive that implements APG when multiple commands exist.

**Files:** `IncomingBubble.tsx`, `OutgoingBubble.tsx`.

---

## P3 — Low (minor redundancy or small improvements)

### 11. Time / metadata `Text` nodes: `aria-label` mirrors visible content

- **WCAG / basis:** Best practice · **P3** · **Component default**
- **Issue / impact:** `aria-label={`Time: ${time}`}` (and similar for metadata) can duplicate what is already visible, sometimes causing redundant announcements depending on AT heuristics.
- **Suggestion:** Prefer visible text sufficiency; use `aria-label` only when the visible string is ambiguous.

**Files:** `IncomingBubble.tsx`, `OutgoingBubble.tsx`.

---

### 12. `UnreadMessage` icon alongside text

- **WCAG / basis:** 1.1.1 Non-text Content (decorative) · **P3** · **Component default**
- **Issue / impact:** The arrow `Icon` may be announced in addition to `aria-label` on the parent `span`, causing verbosity if the icon is decorative.
- **Suggestion:** Pass `aria-hidden` on decorative icons or use `Icon` props so the graphic does not expose a redundant name when the text already conveys meaning.

**File:** `unreadMessage/UnreadMessage.tsx`.

---

## Positive findings

- **`TypingIndicator`:** Uses `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` on the text node—appropriate for non-interactive typing feedback.
- **Urgent / failed messages:** Wrappers use `role="alert"` and `aria-live="assertive"` for high-priority content.
- **`ChatInput` actions:** Send and stop use design-system `Button` with explicit `aria-label` (`Send`, `Stop Generating`).
- **Outgoing success state:** Status `Icon` includes `aria-label="Message sent successfully"`.
- **Incoming avatar:** `aria-label={`Avatar of ${fullName}`}` provides a name when avatar is shown (verify `fullName` trimming when names are partial).

---

## Deduped themes

1. **Faux buttons (`div`/`span` + `role="button"`)** — `NewMessage` and `UnreadMessage` share the same root cause class: custom button semantics without native `<button>` or full keyboard/focus contract.
2. **Dangling ARIA references** — `aria-labelledby="chat-bubble-header"` without a matching `id` breaks naming for every bubble instance.
3. **Hover-gated toolbars** — Incoming/outgoing bubbles tie `role="toolbar"` visibility to mouse hover only, excluding keyboard and some AT workflows.

---

## Suggested fix order (impact vs effort)

1. Fix or remove `aria-labelledby` on bubble wrappers (small change, high AT correctness).
2. Replace `NewMessage` / `UnreadMessage` interactive surfaces with `<button>` or add full keyboard + focus support.
3. Reveal action bars on focus-within / keyboard and ensure toolbar children are reachable.
4. Add labelling API or documented required `aria-*` on `ChatInput`.
5. Layer in landmark / log guidance on `Chat` composition and refine `DateSeparator` / `NewMessage` live-region structure as follow-ups.

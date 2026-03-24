# Structural ARIA audit: Spinner, ProgressBar, ProgressRing, Meter

**Scope:** Static review of implementation source for WAI-ARIA roles, states/properties, semantic structure, and alignment with WCAG 2.2 **4.1.2 Name, Role, Value** and related patterns (progressbar / meter / status live regions).  
**Date:** 2025-03-24  

---

## Implementation map

| Component     | Primary implementation | Barrel / entry | Supporting modules |
|---------------|------------------------|----------------|--------------------|
| **Spinner**   | `core/components/atoms/spinner/Spinner.tsx` | `core/components/atoms/spinner/index.tsx` | — |
| **ProgressBar** | `core/components/atoms/progressBar/ProgressBar.tsx` | `core/components/atoms/progressBar/index.tsx` | `css/components/progressBar.module.css` |
| **ProgressRing** | `core/components/atoms/progressRing/ProgressRing.tsx` | `core/components/atoms/progressRing/index.tsx` | `css/components/progressRing.module.css` |
| **Meter**     | `core/components/atoms/meter/Meter.tsx` | `core/components/atoms/meter/index.tsx` | `Step.tsx`, `useMeterValues.tsx` |

---

## Severity summary (this pass)

| Tier | Count | Components |
|------|-------|------------|
| **P0** | 1 | ProgressRing |
| **P1** | 4 | ProgressBar (×2), Meter (×2) |
| **P2** | 2 | Meter |
| **P3** | 1 | Spinner |

---

## 1. Spinner

**DOM:** Root is `<svg>` with one decorative `<circle>`.

**Observed ARIA / semantics:**

- `role="status"` — valid live-region role for advisory / loading status ([WAI-ARIA `status`](https://www.w3.org/TR/wai-aria/#status)).
- `aria-live="polite"` — matches default implicit live politeness for `status` in ARIA 1.2; redundant but harmless.
- `aria-label` — defaulted to `"Loading"`; overridable via `'aria-label'` prop.

**Strengths**

- Non-interactive SVG is not forced into tab order.
- Spinner has an explicit accessible name by default.
- `extractBaseProps` only forwards `className` / `data-test`, so `role` / `aria-*` are not accidentally stripped.

**Findings**

1. **WCAG / basis:** Best practice / ARIA spec · **P3** · **Component default**  
   **Issue:** `role="status"` already implies a polite live region; explicit `aria-live="polite"` duplicates the implicit behavior.  
   **Impact:** Slight markup noise; no known AT breakage.  
   **Suggestion:** Optionally drop explicit `aria-live` and rely on `status`, or document intentional duplication for older engines.

2. **WCAG / basis:** 1.3.1 / APG · **P2 (enhancement)** · **Consumer-dependent**  
   **Issue:** Component does not support `aria-labelledby` / `aria-describedby` on the API surface (only `aria-label` is typed).  
   **Impact:** When “Loading” is too generic, consumers cannot point at page context without a wrapper.  
   **Suggestion:** Extend props to allow `aria-labelledby` / `aria-describedby` (or spread safe SVG ARIA attributes).

---

## 2. ProgressBar

**DOM:** Outer `<div role="progressbar">` with inner `<div>` for the visual indicator.

**Observed ARIA / semantics:**

- `role="progressbar"` — correct for task completion ([WAI-ARIA `progressbar`](https://www.w3.org/TR/wai-aria/#progressbar)).
- `aria-valuemin={0}`, `aria-valuemax={max}`, `aria-valuenow={clampedValue}`, `aria-valuetext` as rounded percentage when determinate.

**Indeterminate state (`state === 'indeterminate'`):**

- `clampedValue` is `undefined`; React omits `aria-valuenow` / `aria-valuetext` when undefined — aligns with omitting unknown progress for indeterminate bars (APG / HTML `progress` indeterminate pattern).

**Strengths**

- Progress semantics live on the container that wraps the visual fill; inner indicator correctly has no competing role.
- Guards `max > 0` before computing `aria-valuetext` percentage (avoids `NaN%`).

**Findings**

1. **WCAG / basis:** 4.1.2 · **P1** · **Component default**  
   **Issue:** `ProgressBarProps` extends only `BaseProps` and does not allow `aria-label`, `aria-labelledby`, or other ARIA pass-through to the root `div`.  
   **Repro:** Use default `ProgressBar` in a region where multiple progress bars exist; the accessibility tree exposes “progressbar” with values but **no author-defined name**.  
   **Impact:** Screen reader users may hear identical or ambiguous objects (“progressbar, 50%”) with no task label.  
   **Suggestion:** Add optional `aria-label` / `aria-labelledby` (and optionally `aria-describedby`) on the root, or extend props with a narrow ARIA subset.

2. **WCAG / basis:** 4.1.2 · **P1** · **Component default**  
   **Issue:** Indeterminate mode exposes `aria-valuemax` (and `aria-valuemin`) but no accessible name and no programmatic hint such as `aria-busy` on a parent (not required on `progressbar` itself).  
   **Impact:** Users hear a progressbar with no value; without a name, purpose may be unclear.  
   **Suggestion:** Same as above — require or encourage naming props; document pattern for indeterminate + visible text.

---

## 3. ProgressRing

**DOM:** Root `<svg>` with two `<circle>` elements (track + indicator). `strokeDashoffset` encodes completion.

**Observed ARIA / semantics:**

- **No** `role`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, or `aria-valuetext` on the SVG.
- The control is purely graphical in the accessibility tree unless the host adds a wrapper with semantics.

**Findings**

1. **WCAG / basis:** 4.1.2 · **P0** · **Component default**  
   **Issue:** A determinate circular progress control does not expose `role="progressbar"` or the required value-related attributes for that role.  
   **Repro:** Render `<ProgressRing value={40} max={100} />` and inspect the a11y tree: the SVG is not announced as a progressbar with 40% (or equivalent).  
   **Impact:** Assistive technologies cannot report progress; users relying on SR get no structured status for long-running operations.  
   **Suggestion:** On the root `svg`, set `role="progressbar"`, `aria-valuemin={0}`, `aria-valuemax={max}`, `aria-valuenow` (clamped), and `aria-valuetext` (e.g. rounded percent or consumer-provided string). Add optional `aria-label` / `aria-labelledby` for naming.

2. **WCAG / basis:** 1.1.1 / 4.1.2 · **P2** · **Component default**  
   **Issue:** Decorative circles have no `aria-hidden`; the entire SVG may be traversed as generic content without semantics.  
   **Impact:** Once `role="progressbar"` is added, child circles should stay presentational (or SVG graphics treated as part of the single widget).  
   **Suggestion:** After assigning `role="progressbar"` on the root, ensure inner shapes do not create nested accessible objects (typically fine for SVG paths/circles without roles).

---

## 4. Meter

**DOM:** Root `<div role="meter">` containing step `<span>`s (`Step`) and optional `Text` label.

**Child steps (`Step.tsx`):**

- `role="presentation"` and `aria-hidden="true"` — appropriate for purely visual segments inside a single meter widget.

**Observed ARIA on root:**

- `role="meter"` — matches gauge-style display ([WAI-ARIA `meter`](https://www.w3.org/TR/wai-aria/#meter)).
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` — value wiring is present.
- `aria-label` via optional `ariaLabel` prop; remainder of `HTMLAttributes<HTMLDivElement>` can be passed via `...rest` (so `aria-labelledby` is possible from consumers).

**Strengths**

- Decorative steps are hidden from AT.
- `aria-valuetext` reflects human-readable state (`percentage%` or `renderLabel` output).

**Findings**

1. **WCAG / basis:** 4.1.2 · **P1** · **Consumer-dependent / default**  
   **Issue:** `ariaLabel` is optional; default stories/usage may render a meter with **no** `aria-label` / `aria-labelledby` while `showLabel` is true.  
   **Impact:** The visible percentage is in a `Text` child; it is **not** referenced via `aria-labelledby`, so the meter’s **accessible name** may be missing or weak in some AT while `aria-valuetext` still conveys magnitude. Name vs value should both be clear for 4.1.2.  
   **Suggestion:** When `showLabel` is true, generate an `id` on the label `Text` and set `aria-labelledby` on the meter; or default `aria-label` when no label prop is provided.

2. **WCAG / basis:** 4.1.2 · **P2** · **Component default**  
   **Issue:** With `showLabel={true}`, both `aria-valuetext` and visible `Text` repeat the same percentage.  
   **Impact:** Possible redundant announcements (polish / verbosity), varies by AT.  
   **Suggestion:** Prefer a single source of truth for the value string, or hide redundant text from the accessibility tree only if a robust naming pattern exists (`aria-labelledby` + `aria-valuetext` strategy).

3. **WCAG / basis:** HTML / Best practice · **P2** · **Component default**  
   **Issue:** `Meter.defaultProps` includes `type: 'empty'`, which is not part of `MeterProps` and is not destructured; it likely lands on `...rest` and renders as a non-standard `type` attribute on a `div`.  
   **Impact:** Invalid or meaningless global attribute on a generic div; noise for validators and future maintenance (not strictly an ARIA failure).  
   **Suggestion:** Remove erroneous `type` from `defaultProps` or filter it from `rest` before spreading onto the DOM.

---

## Cross-cutting themes

1. **Progress primitives lack a consistent ARIA API** — `ProgressBar` is partially wired (role + values) but cannot be named via props; `ProgressRing` omits role/values entirely. Align both with the same `progressbar` attribute set and naming options.

2. **Meter vs progressbar** — `Meter` correctly uses `role="meter"` for scalar gauges; `ProgressBar` / `ProgressRing` should use `role="progressbar"` for task completion. Keeping that distinction explicit in docs reduces misuse.

3. **`extractBaseProps` pattern** — Spinner and progress components only forward `className` / `data-test`, which protects internal `role`/`aria-*` but also blocks consumer ARIA unless the API is extended (relevant for ProgressBar and ProgressRing naming).

---

## References

- [WAI-ARIA 1.2: `progressbar`](https://www.w3.org/TR/wai-aria/#progressbar)  
- [WAI-ARIA 1.2: `meter`](https://www.w3.org/TR/wai-aria/#meter)  
- [WAI-ARIA 1.2: `status`](https://www.w3.org/TR/wai-aria/#status)  
- WCAG 2.2 **4.1.2** Name, Role, Value  

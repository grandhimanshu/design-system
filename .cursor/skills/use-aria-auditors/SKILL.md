---
name: use-aria-auditors
description: Orchestrates a dynamic, multi-agent structural ARIA and semantic HTML audit across UI components. Use when requested to audit components for ARIA patterns, semantic HTML, or WCAG 2.2 structural compliance.
---

# Orchestrating ARIA Audits

Delegate to the `aria-auditor` subagent to perform static code analysis on components for WAI-ARIA APG and WCAG 2.2 AA alignment. This skill manages orchestration and the final report shape.

## When to Use This Skill
When the user menitons this skill, use this to run an ARIA audit.

## Orchestration Pipeline

You MUST follow these steps strictly in order. Do not skip steps.

### Step 1: Discovery
1. Find all relevant UI components (e.g. under `core/components/`) or use a user-provided list.
2. List the discovered components to the user.
3. **WAIT** for user confirmation before creating a plan or running audits.

### Step 2: Dynamic Plan Creation
Once the user confirms:
1. Create `.cursor/plans/AriaAudit.plan.md` (add numbering if duplicate exists).
2. Add a `todo` per component plus one `todo` for aggregation.

### Step 3: Subagent Execution
1. Launch the `aria-auditor` subagent via the Task tool.
2. Run up to 4 subagents concurrently, if user specifies, follow that number
3. Mark each component `todo` completed when its raw report exists.

**Delegation Template for Subagent:**
```text
Run a structural ARIA audit on the [Component Name] component.
Locate its implementation files.
Write your detailed findings to `aria-audits/raw-reports/[component-name]-audit.md`.
```

### Step 4: Aggregation
Read all raw reports and write `aria-audits/COMPONENT_ARIA_AUDIT_REPORT.md`.

**Executive summary (top of file):**
- Total counts by severity: **P0**, **P1**, **P2**, **P3** 
- Short **Deduped themes** section: group findings that share one root cause (e.g. “Icon omits a11y pass-through → affects N components”) so one implementation fix is not counted as N unrelated P0s in narrative. You may still list per-component detail below.
- **Prioritized backlog** — bullet list of components with counts per tier, e.g. `Button: 1 P0, 2 P1, 1 P2`. Order by **effort vs impact** (high user benefit / lower effort first); do not label internal tier names like “matrix” in prose.

**Detailed Findings:**
- Same **prioritized component order** as the backlog.
- Per component: mirror the subagent schema. **Every** bullet must have **WCAG / basis** (SC id or `Best practice` / `HTML` / `APG only` / `Non-WCAG`), **Severity**, **Scope** (component default vs consumer-dependent), **Repro** for P0/P1, concise issue + impact, **Suggestion** (high-level).
- Omit **Warnings** as a separate bucket if unused; P2/P3 cover polish and APG/HTML.

**Example (shape only):**
```markdown
# Component ARIA Audit Report

**Severity summary:** 
4 Critical(P0) · 12 High(P1) · 8 Medium(P2) · 3 Low(P3)

### Prioritized backlog
- **MenuButton (example):** 1 P0, 0 P1, 1 P2
- **TextField (example):** 0 P0, 1 P1, 1 P3

### Deduped themes
- **Icon / wrapper drops `aria-*` pass-through** — root cause for Button, Link, Chip (fix once in shared primitive).

---

## Detailed Findings

### 1. MenuButton (example)

- **WCAG / basis:** 4.1.2 · **P0** · **Component default** · **Repro:** Fails in default usage with the menu visibly open: the trigger is a `<div>` that does not expose a button role in the accessibility tree, and omits `aria-haspopup`, `aria-expanded`, and/or `aria-controls` pointing at the menu element’s stable `id`.  
  **Impact:** Assistive technologies cannot tell that the control opens a menu, whether it is expanded, or which element is the controlled popup.  
  **Potential Fix:** Give the trigger an appropriate role/name for a menu button, set `aria-haspopup="menu"` (or `true` if legacy), bind `aria-expanded` to open state, and set `aria-controls` to the menu container’s `id`.

### 2. Input
...
```

4. Write the master report to `aria-audits/COMPONENT_ARIA_AUDIT_REPORT.md`.
5. Keep `aria-audits/raw-reports/` adjacent to the master report.
6. Mark the aggregation `todo` completed and notify the user.

## Strict Mandates
- **NEVER** perform the component audit yourself; use the `aria-auditor` subagent.
- Preserve folder layout: `aria-audits/COMPONENT_ARIA_AUDIT_REPORT.md` and `aria-audits/raw-reports/`.

## Tips
- If a component has no P2/P3, omit empty tier lines from the summary for that component.
- When in doubt between violation vs enhancement, prefer **P2/P3** and state “enhancement” in the issue line—reserve **P0/P1** for plausible AA failures or serious AT breakage.

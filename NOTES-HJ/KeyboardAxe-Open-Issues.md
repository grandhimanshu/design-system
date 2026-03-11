# WCAG 2.2 AA — Keyboard audit summary

Concise reference: component, issue, severity. **Solved** items are ~~struck through~~ (no action needed).  
Update strikethrough as fixes ship. Avoid aria things unless they affect keyboard interactions.

**Implementation order:** Top = quick/minimal code changes first. For reusable patterns (Overlays, Editable, Sliders, Chip+ChipGroup), implement for the hardest component first, then apply to the rest.

**PR to align with:** [innovaccer/design-system#2792](https://github.com/innovaccer/design-system/pull/2792) — Tooltip/Popover Escape via PopperWrapper, Tooltip `hoverable` default true, OverlayManager lifecycle. Bring those changes here.

---

## Component × Issue × Severity × Notes

*Order: quick/easy at top; reusable = hardest first then easier. Notes column for "discuss later" or cross-refs.*

| Order | Component | Issue | Severity | Notes |
|------:|-----------|--------|----------|-------|
| 1 | isSpaceKey utility | Bug: `e.key === 'Space'` (should be `' '` or `'Spacebar'`) | Low | 1-line fix; unblocks Switch and others. |
| 1 | Switch | isSpaceKey bug; onKeyUp vs onKeyDown | High | After isSpaceKey fix. |
| 2 | Tooltip | No Escape to dismiss; may not show on focus | High | Align with PR #2792 (PopperWrapper Escape; default hoverable true). |
| 2 | Popover | No Escape to close; no focus management on open/close | Critical | Align with PR #2792. Same PopperWrapper as Tooltip. |
| 3 | Collapsible | Toggles on ANY key (Tab, Shift, arrows) | Critical | Restrict to Enter/Space only; small change. |
| 4 | SelectionCard | No Space to toggle; Enter incorrectly toggles | Critical | Space to toggle; fix Enter behavior. |
| 5 | Modal, Dialog, FullscreenModal, Sidesheet | No focus trap; closeOnEscape defaults false; no initial/return focus | Critical | **Discuss later:** shared focus-trap primitive vs per-component. Default closeOnEscape→true done elsewhere. Implement hardest (e.g. Modal) first, then rest. |
| 6 | Editable | No keyboard to enter edit mode; no Enter to confirm, no Escape to cancel | Critical | **Discuss later:** Editable atom vs molecules — who owns Enter confirm / Escape cancel? Implement atom contract first. |
| 6 | EditableChipInput | No keyboard to enter edit mode (uses Editable); no Escape to cancel | Critical | After Editable; uses same contract. |
| 6 | EditableDropdown | Same as Editable — no keyboard to enter edit mode | Critical | After Editable. |
| 7 | [Chip](PLAN-chip-chipgroup.md) | No Space activation; no Delete/Backspace for dismissible; no preventDefault for Space | Critical | Plan exists. Chip first (atom). |
| 7 | [ChipGroup](PLAN-chip-chipgroup.md) | No arrow nav, no roving tabindex | High | After Chip. |
| 8 | SegmentedControl | No Arrow Left/Right, Enter/Space, Home/End; no roving tabindex | Critical | Self-contained. |
| 9 | Listbox | No Space to select; no Home/End, type-ahead | Critical | PLAYBOOK has list patterns. |
| 10 | AvatarSelection | No keyboard to open, navigate, or select | Critical | Combobox-like pattern. |
| 11 | Calendar | No keyboard support; date cells click-only | Critical | Implement here first; DatePicker/DateRangePicker inherit. |
| 11 | DatePicker | Inherits Calendar — no keyboard | Critical | After Calendar. |
| 11 | DateRangePicker | Inherits Calendar — no keyboard | Critical | After Calendar. |
| 12 | Grid/Table | No cell/row keyboard nav or activation | Critical | Implement here first; List uses Grid. |
| 12 | List | Uses Grid — inherits no keyboard | Critical | After Grid. |
| 13 | VerticalNav | No Arrow Up/Down, no expand/collapse (Arrow Right/Left); no Home/End | Critical | |
| 14 | Slider / RangeSlider / MultiSlider | No Arrow Up/Down, Home, End, Page Up/Down | High | Reusable: implement hardest (e.g. MultiSlider or RangeSlider) first, then Slider. |
| 15 | Toast | No Escape to dismiss; no focus management | High | |
| 16 | Tabs | No Space to activate; no Home/End; all tabs in tab order | High | |
| 17 | HorizontalNav | No Space to activate; no Arrow Left/Right; no roving tabindex | High | |
| 18 | ActionCard | Space activation when used as button (conditional) | Partial | |
| 18 | Input | Info icon and clear icon not keyboard-operable | Partial | |
| 18 | MetricInput | Optional Home/End for min/max | Partial | |
| 18 | ChipInput | No arrow key chip navigation | Partial | |
| 18 | EditableInput | No keyboard to enter edit mode (Editable is mouse-only) | Partial | After Editable family. |
| 18 | Stepper | No Space to activate; no arrow navigation | Partial | |
| 18 | FileUploader | Verify button triggers file input (keyboard opens dialog) | Partial | |
| 18 | Dropzone | Root drop area not keyboard-operable; only "Browse files" link works | Partial | |
| 18 | Combobox | Missing Home/End in option list | Partial | |
| 18 | Menu | Missing Space to activate, Home/End, type-ahead | Partial | |
| 18 | TimePicker | Inherits Dropdown gaps (Space, Escape, Home/End) | Partial | Dropdown is deprecated — out of scope. |
| — | ~~Dropdown~~ | ~~Deprecated component~~ | ~~Out of scope~~ | Component deprecated; not fixing. |
| — | ~~Button~~ | ~~None~~ | ~~—~~ | |
| — | ~~Checkbox~~ | ~~None~~ | ~~—~~ | |
| — | ~~Radio~~ | ~~None~~ | ~~—~~ | |
| — | ~~Link~~ | ~~None~~ | ~~—~~ | |
| — | ~~LinkButton~~ | ~~None~~ | ~~—~~ | |
| — | ~~Textarea~~ | ~~None~~ | ~~—~~ | |
| — | ~~Breadcrumbs~~ | ~~None (keyboard)~~ | ~~—~~ | |
| — | ~~Pills~~ | ~~None (non-interactive)~~ | ~~—~~ | |
| — | ~~Badge~~ | ~~None (non-interactive)~~ | ~~—~~ | |
| — | ~~Pagination~~ | ~~None (keyboard)~~ | ~~—~~ | |
| — | ~~InputMask~~ | ~~None~~ | ~~—~~ | |
| — | ~~VerificationCodeInput~~ | ~~None (keyboard)~~ | ~~—~~ | |
| — | ~~ChoiceList~~ | ~~None~~ | ~~—~~ | |
| — | ~~InlineMessage~~ | ~~None (keyboard)~~ | ~~—~~ | |
| — | ~~PageHeader~~ | ~~None~~ | ~~—~~ | |
| — | ~~TextField~~ | ~~None~~ | ~~—~~ | |
| — | ~~Select~~ | ~~Missing Space to open, Home/End, type-ahead~~ | ~~Partial → addressed~~ | |

---

## Severity legend

| Severity | Meaning |
|----------|--------|
| **Critical** | Full keyboard inaccessibility or wrong key behavior (SC 2.1.1, 2.1.2). Fix first. |
| **High** | Broken key patterns (SC 2.1.1, 2.1.2). Fix after critical. |
| **Partial** | Core keys work; gaps (e.g. one key or sub-control). Fix when touching component. |
| **Low** | Utility bug. Fix with related work. |

---

## WCAG criteria (reference)

- **2.1.1** Keyboard — all functionality via keyboard  
- **2.1.2** No Keyboard Trap — focus not trapped (modals: trap + Escape)  
- **2.4.3** Focus Order — logical order  
- **2.4.7** Focus Visible — visible focus indicator  
- **4.1.2** Name, Role, Value — correct roles/states  
- **4.1.3** Status Messages — announced  
- **1.4.13** Content on Hover/Focus — dismissible (e.g. Escape)

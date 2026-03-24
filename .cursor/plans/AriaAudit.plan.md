---
name: AriaAudit
overview: This plan audits all design system components for ARIA accessibility, prioritized by interactive complexity.
todos:
  - id: audit-modal
    content: Audit modal
    status: completed
  - id: audit-dialog
    content: Audit dialog
    status: completed
  - id: audit-fullscreenmodal
    content: Audit fullscreenModal
    status: completed
  - id: audit-sidesheet
    content: Audit sidesheet
    status: completed
  - id: audit-popover
    content: Audit popover
    status: completed
  - id: audit-tooltip
    content: Audit tooltip
    status: completed
  - id: audit-select
    content: Audit select
    status: completed
  - id: audit-combobox
    content: Audit combobox
    status: completed
  - id: audit-listbox
    content: Audit listbox
    status: completed
  - id: audit-dropdown
    content: Audit dropdown
    status: completed
  - id: audit-editabledropdown
    content: Audit editableDropdown
    status: completed
  - id: audit-menu
    content: Audit menu
    status: completed
  - id: audit-choicelist
    content: Audit choiceList
    status: completed
  - id: audit-button
    content: Audit button
    status: completed
  - id: audit-link
    content: Audit link
    status: completed
  - id: audit-linkbutton
    content: Audit linkButton
    status: completed
  - id: collate-phase-1
    content: Collate Phase 1 Summary
    status: completed
  - id: audit-input
    content: Audit input
    status: completed
  - id: audit-textarea
    content: Audit textarea
    status: completed
  - id: audit-checkbox
    content: Audit checkbox
    status: completed
  - id: audit-radio
    content: Audit radio
    status: completed
  - id: audit-switchinput
    content: Audit switchInput
    status: completed
  - id: audit-slider
    content: Audit slider
    status: completed
  - id: audit-rangeslider
    content: Audit rangeSlider
    status: completed
  - id: audit-multislider
    content: Audit multiSlider
    status: completed
  - id: audit-textfield
    content: Audit textField
    status: pending
  - id: audit-chipinput
    content: Audit chipInput
    status: completed
  - id: audit-editablechipinput
    content: Audit editableChipInput
    status: completed
  - id: audit-editableinput
    content: Audit editableInput
    status: completed
  - id: audit-verificationcodeinput
    content: Audit verificationCodeInput
    status: completed
  - id: audit-inputmask
    content: Audit inputMask
    status: completed
  - id: audit-metricinput
    content: Audit metricInput
    status: pending
  - id: audit-fileuploader
    content: Audit fileUploader
    status: completed
  - id: audit-dropzone
    content: Audit dropzone
    status: completed
  - id: audit-tabs
    content: Audit tabs
    status: completed
  - id: audit-breadcrumbs
    content: Audit breadcrumbs
    status: completed
  - id: audit-pagination
    content: Audit pagination
    status: completed
  - id: audit-horizontalnav
    content: Audit horizontalNav
    status: completed
  - id: audit-verticalnav
    content: Audit verticalNav
    status: completed
  - id: audit-navigation
    content: Audit navigation
    status: completed
  - id: audit-stepper
    content: Audit stepper
    status: completed
  - id: audit-pageheader
    content: Audit pageHeader
    status: completed
  - id: audit-calendar
    content: Audit calendar
    status: completed
  - id: audit-datepicker
    content: Audit datePicker
    status: completed
  - id: audit-daterangepicker
    content: Audit dateRangePicker
    status: completed
  - id: audit-timepicker
    content: Audit timePicker
    status: pending
  - id: audit-table
    content: Audit table
    status: completed
  - id: audit-chat
    content: "Audit chat (and subcomponents: chatMessage, chatInput, etc.)"
    status: completed
  - id: audit-avatar-avatargroup
    content: Audit avatar & avatarGroup
    status: completed
  - id: audit-badge-pills
    content: Audit badge & pills
    status: completed
  - id: audit-chip-chipgroup
    content: Audit chip & chipGroup
    status: completed
  - id: audit-spinner-progressbar-progressring-meter
    content: Audit spinner, progressBar, progressRing, meter
    status: completed
  - id: audit-message-inlinemessage-toast
    content: Audit message, inlineMessage, toast
    status: completed
  - id: audit-statushint-emptystate-placeholder
    content: Audit statusHint, emptyState, placeholder
    status: completed
  - id: audit-icon
    content: Audit icon
    status: completed
  - id: audit-flex-row-column-grid-mdsgrid
    content: Audit flex, row, column, grid, mdsGrid
    status: completed
  - id: audit-divider-backdrop-outsideclick-popperwrapper
    content: Audit divider, backdrop, outsideClick, popperWrapper
    status: completed
  - id: audit-text-heading-subheading-paragraph-caption
    content: Audit text, heading, subheading, paragraph, caption
    status: completed
  - id: audit-label-legend-helptext
    content: Audit label, legend, helpText
    status: completed
  - id: audit-card
    content: Audit card (and subcomponents)
    status: completed
  - id: audit-list-keyvaluepair-metalist
    content: Audit list, keyValuePair, metaList
    status: completed
  - id: audit-collapsible
    content: Audit collapsible
    status: completed
  - id: audit-actioncard-selectioncard
    content: Audit actionCard, selectionCard
    status: completed
  - id: collate-final-summary
    content: Collate Final Summary
    status: completed
isProject: false
---

# Comprehensive ARIA Audit Plan

This plan audits all design system components. Work is prioritized by interactive complexity, executing 10 subagents concurrently. Mark todos as compelete as they get done by editing this file using StrReplace to update all the status: pending entries to status: completed.

## Phase 1: Critical Interactive Components

*Focusing on components with the highest risk of P0/P1 WCAG violations (focus traps, complex keyboard navigation, listboxes, etc).*

### Batch A: Modals & Overlays

- Audit `modal`
- Audit `dialog`
- Audit `fullscreenModal`
- Audit `sidesheet`
- Audit `popover`
- Audit `tooltip`

### Batch B: Complex Selections & Menus

- Audit `select`
- Audit `combobox`
- Audit `listbox`
- Audit `dropdown`
- Audit `editableDropdown`
- Audit `menu`
- Audit `choiceList`

### Batch C: Core Interactive Primitives

- Audit `button`
- Audit `link`
- Audit `linkButton`

### 🛑 Phase 1 Collation

- Collate Phase 1 Summary: Read all completed raw reports and write to `aria-audits/PHASE1_ARIA_AUDIT_REPORT.md` following the skill schema.

---

## Phase 2: Remaining Interactive Controls & Navigation

*Focusing on standard form inputs, complex organisms, and navigation patterns.*

### Batch D: Form Inputs

- Audit `input`
- Audit `textarea`
- Audit `checkbox`
- Audit `radio`
- Audit `switchInput`
- Audit `slider`
- Audit `rangeSlider`
- Audit `multiSlider`
- Audit `textField`
- Audit `chipInput`
- Audit `editableChipInput`
- Audit `editableInput`
- Audit `verificationCodeInput`
- Audit `inputMask`
- Audit `metricInput`
- Audit `fileUploader`
- Audit `dropzone`

### Batch E: Navigation & Organisms

- Audit `tabs`
- Audit `breadcrumbs`
- Audit `pagination`
- Audit `horizontalNav`
- Audit `verticalNav`
- Audit `navigation`
- Audit `stepper`
- Audit `pageHeader`
- Audit `calendar`
- Audit `datePicker`
- Audit `dateRangePicker`
- Audit `timePicker`
- Audit `table`
- Audit `chat` (and subcomponents: `chatMessage`, `chatInput`, etc.)

---

## Phase 3: Static, Layout, & Typography

*Focusing on components that rarely have complex ARIA needs, mostly checking for semantic HTML and base attributes.*

### Batch F: Visuals & Feedback

- Audit `avatar` & `avatarGroup`
- Audit `badge` & `pills`
- Audit `chip` & `chipGroup`
- Audit `spinner`, `progressBar`, `progressRing`, `meter`
- Audit `message`, `inlineMessage`, `toast`
- Audit `statusHint`, `emptyState`, `placeholder`
- Audit `icon`

### Batch G: Layout & Typography

- Audit `flex`, `row`, `column`, `grid`, `mdsGrid`
- Audit `divider`, `backdrop`, `outsideClick`, `popperWrapper`
- Audit `text`, `heading`, `subheading`, `paragraph`, `caption`
- Audit `label`, `legend`, `helpText`
- Audit `card` (and subcomponents)
- Audit `list`, `keyValuePair`, `metaList`
- Audit `collapsible`
- Audit `actionCard`, `selectionCard`

### 🛑 Phase 2 & 3 Collation

- [x] Collate Final Summary: Read raw reports from Phases 2 and 3, and write to `aria-audits/PHASE2_ARIA_AUDIT_REPORT.md`.


---
name: Storybook A11y Testing
overview: Systematically test all MDS components for keyboard interactions and ARIA compliance using bug-hunter subagent in organized batches.
todos:
  - id: batch-1-buttons
    content: "Test Batch 1: Button Components (Button, LinkButton, AIButton, AIIconButton)"
    status: pending
  - id: batch-2-chips-badges
    content: "Test Batch 2: Chips & Selection (Chip, ChipGroup, Pills, SelectionCard)"
    status: pending
  - id: batch-3-basic-forms
    content: "Test Batch 3: Basic Form Controls (Input, Checkbox, Radio, SwitchInput)"
    status: pending
  - id: batch-4-enhanced-inputs
    content: "Test Batch 4: Enhanced Inputs (ChipInput, EditableInput, InputMask, VerificationCodeInput)"
    status: pending
  - id: batch-5-sliders-controls
    content: "Test Batch 5: Sliders & Controls (Slider, RangeSlider, SegmentedControl, Collapsible)"
    status: pending
  - id: batch-6-selection-lists
    content: "Test Batch 6: Selection & Lists (Select, Combobox, Listbox, ChoiceList)"
    status: pending
  - id: batch-7-navigation
    content: "Test Batch 7: Navigation Components (Tabs, Menu, VerticalNav, Breadcrumbs)"
    status: pending
  - id: batch-8-overlays
    content: "Test Batch 8: Overlays & Modals (Modal, Sidesheet, Popover, Toast)"
    status: pending
  - id: batch-9-complex-data
    content: "Test Batch 9: Complex Data & Interactions (Calendar, Table, Dropdown, FileUploader)"
    status: pending
isProject: true
---

# Comprehensive Storybook A11y Testing Plan

## Overview

Test all components on `feat-ally` branch at [https://mds-dev.innovaccer.com/](https://mds-dev.innovaccer.com/) (port 5001) for keyboard interactions and ARIA compliance using bug-hunter subagent.

## Testing Strategy

- **9 batches** of 3-4 components each (expanded to include all interactive components)
- **Focus**: Keyboard navigation + ARIA attributes
- **Tool**: Bug-hunter with Chrome DevTools instrumentation
- **Evidence**: Runtime logs for all issues found

## Component Batches

### Batch 1: Button Components

- `[Button](core/components/atoms/button/)` - Enter/Space activation, disabled states, focus management
- `[LinkButton](core/components/atoms/linkButton/)` - Navigation vs action semantics, keyboard support
- `[AIButton](core/ai-components/AIButton/)` - AI-specific interactions, loading states
- `[AIIconButton](core/ai-components/AIIconButton/)` - Icon button accessibility, aria-label

### Batch 2: Chips & Selection

- `[Chip](core/components/atoms/chip/)` - Removable chips, selection states, keyboard removal
- `[ChipGroup](core/components/atoms/chipGroup/)` - Group navigation, multi-selection
- `[Pills](core/components/atoms/pills/)` - Similar to chips but different interaction patterns
- `[SelectionCard](core/components/atoms/selectionCard/)` - Selection states, keyboard activation

### Batch 3: Basic Form Controls

- `[Input](core/components/atoms/input/)` - Text input, focus management, validation states
- `[Checkbox](core/components/atoms/checkbox/)` - Space activation, group navigation
- `[Radio](core/components/atoms/radio/)` - Arrow keys within groups, selection
- `[SwitchInput](core/components/atoms/switchInput/)` - Space/Enter toggle, state announcements

### Batch 4: Enhanced Inputs

- `[ChipInput](core/components/molecules/chipInput/)` - Chip creation/removal via keyboard
- `[EditableInput](core/components/molecules/editableInput/)` - Inline editing interactions
- `[InputMask](core/components/molecules/inputMask/)` - Masked input keyboard behavior
- `[VerificationCodeInput](core/components/molecules/verificationCodeInput/)` - Auto-focus, paste handling

### Batch 5: Sliders & Controls

- `[Slider](core/components/atoms/slider/)` - Arrow keys, Home/End, value announcements
- `[RangeSlider](core/components/atoms/rangeSlider/)` - Dual handle navigation
- `[SegmentedControl](core/components/atoms/segmentedControl/)` - Arrow keys, selection states
- `[Collapsible](core/components/atoms/collapsible/)` - Enter/Space toggle, state announcement

### Batch 6: Selection & Lists

- `[Select](core/components/organisms/select/)` - Arrow keys, typing, option selection
- `[Combobox](core/components/organisms/combobox/)` - Typing, filtering, arrow navigation
- `[Listbox](core/components/organisms/listbox/)` - Multi-select, arrow keys, selection states
- `[ChoiceList](core/components/organisms/choiceList/)` - Radio/checkbox groups, navigation

### Batch 7: Navigation Components

- `[Tabs](core/components/molecules/tabs/)` - Arrow keys, Home/End, activation
- `[Menu](core/components/organisms/menu/)` - Arrow navigation, Enter/Escape, submenus
- `[VerticalNav](core/components/organisms/verticalNav/)` - Arrow keys, expansion, focus management
- `[Breadcrumbs](core/components/atoms/breadcrumbs/)` - Tab order, active states

### Batch 8: Overlays & Modals

- `[Modal](core/components/molecules/modal/)` - Focus trap, Escape close, return focus
- `[Sidesheet](core/components/molecules/sidesheet/)` - Focus management, Escape behavior
- `[Popover](core/components/molecules/popover/)` - Escape close, hover/focus triggers
- `[Toast](core/components/atoms/toast/)` - ARIA live regions, dismiss behavior

### Batch 9: Complex Data & Interactions

- `[Calendar](core/components/organisms/calendar/)` - Arrow navigation, date selection, month/year
- `[Table](core/components/organisms/table/)` - Row navigation, sorting, cell focus
- `[Dropdown](core/components/atoms/dropdown/)` - Arrow navigation, selection, escape
- `[FileUploader](core/components/molecules/fileUploader/)` - Drag/drop alternatives, keyboard file selection

## Bug-Hunter Command Template

For each batch:

```
Use bug-hunter to test [Batch X components]

**Context:**
- Server running on port 5001 (https://mds-dev.innovaccer.com/)
- Components: [specific file paths]
- **MANDATE:** Check EACH story for keyboard + ARIA issues
- **MANDATE:** Instrument thoroughly for runtime evidence

**Critical:** Server already running, don't start it.
```

## Success Criteria

- All keyboard interactions follow WAI-ARIA APG patterns
- All ARIA attributes present and correctly updated
- Focus management meets accessibility standards
- Screen reader compatibility verified with runtime evidence
- Comprehensive bug report with specific evidence for each issue

## Key Files

- Test plan: `[STORYBOOK_A11Y_TEST_PLAN.md](STORYBOOK_A11Y_TEST_PLAN.md)`
- WCAG patterns: `[.cursor/rules/wcag-audit-patterns.md](.cursor/rules/wcag-audit-patterns.md)`
- Component inventory: `[core/index.tsx](core/index.tsx)`


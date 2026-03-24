---
name: Story Analysis Plan
overview: Analyze existing Storybook stories for all 36 components to identify specific stories and edge cases for accessibility testing, outputting results as structured markdown.
todos:
  - id: analyze-batch-1
    content: "Analyze Batch 1 stories: Button, LinkButton, AIButton, AIIconButton"
    status: pending
  - id: analyze-batch-2
    content: "Analyze Batch 2 stories: Chip, ChipGroup, Pills, SelectionCard"
    status: pending
  - id: analyze-batch-3
    content: "Analyze Batch 3 stories: Input, Checkbox, Radio, SwitchInput"
    status: pending
  - id: analyze-batch-4
    content: "Analyze Batch 4 stories: ChipInput, EditableInput, InputMask, VerificationCodeInput"
    status: pending
  - id: analyze-batch-5
    content: "Analyze Batch 5 stories: Slider, RangeSlider, SegmentedControl, Collapsible"
    status: pending
  - id: analyze-batch-6
    content: "Analyze Batch 6 stories: Select, Combobox, Listbox, ChoiceList"
    status: pending
  - id: analyze-batch-7
    content: "Analyze Batch 7 stories: Tabs, Menu, VerticalNav, Breadcrumbs"
    status: pending
  - id: analyze-batch-8
    content: "Analyze Batch 8 stories: Modal, Sidesheet, Popover, Toast"
    status: pending
  - id: analyze-batch-9
    content: "Analyze Batch 9 stories: Calendar, Table, Dropdown, FileUploader"
    status: pending
  - id: create-output-file
    content: Create STORYBOOK_A11Y_STORIES_ANALYSIS.md with structured story lists and edge cases
    status: pending
isProject: true
---

# Story Analysis & Plan Enhancement

## Objective

Analyze existing Storybook stories for all 36 components to create a structured markdown file containing:

- **Specific story names** to target for each component
- **Edge cases** to test within each story
- **Missing stories** needed for comprehensive accessibility coverage

## Analysis Approach

For each component:

1. **Read .stories.tsx files** to catalog all available stories
2. **Identify best stories** for accessibility testing based on:
  - Interactive state coverage (hover, focus, disabled, error, loading)
  - Keyboard scenario coverage (navigation, activation, escape patterns)
  - Edge case coverage (long text, empty states, validation, overflow)
  - ARIA state demonstrations (expanded, selected, checked, etc.)

## Output Format

Create `STORYBOOK_A11Y_STORIES_ANALYSIS.md` with this structure:

```markdown
# Storybook A11y Stories Analysis

## Batch 1: Button Components

### Button
**Stories to Test:**
- Default - Basic keyboard activation
- WithIcon - Icon accessibility patterns
- Disabled - Disabled state handling
- Loading - Loading state announcements

**Edge Cases per Story:**
- Default: Long button text, overflow scenarios
- WithIcon: Missing aria-label, icon-only buttons
- Disabled: Focus behavior, screen reader announcements
- Loading: Spinner accessibility, state changes

**Missing Stories Needed:**
- ButtonWithTooltip - For complex labeling scenarios
- ButtonGroup - For grouped button navigation

### LinkButton
**Stories to Test:**
- [List of specific stories...]

**Edge Cases per Story:**
- [Specific edge cases...]

**Missing Stories Needed:**
- [Missing story recommendations...]
```

## Component Analysis Batches

### Batch 1: Button Components

- `[Button](core/components/atoms/button/__stories__/)` - Focus on activation, states, icons
- `[LinkButton](core/components/atoms/linkButton/__stories__/)` - Navigation semantics
- `[AIButton](core/ai-components/AIButton/__stories__/)` - AI-specific interactions
- `[AIIconButton](core/ai-components/AIIconButton/__stories__/)` - Icon accessibility

### Batch 2: Chips & Selection

- `[Chip](core/components/atoms/chip/__stories__/)` - Removable, selectable variants
- `[ChipGroup](core/components/atoms/chipGroup/__stories__/)` - Multi-selection, overflow
- `[Pills](core/components/atoms/pills/__stories__/)` - Selection patterns
- `[SelectionCard](core/components/atoms/selectionCard/__stories__/)` - Card selection states

### Batch 3: Basic Form Controls

- `[Input](core/components/atoms/input/__stories__/)` - Validation, states, labeling
- `[Checkbox](core/components/atoms/checkbox/__stories__/)` - Group scenarios, indeterminate
- `[Radio](core/components/atoms/radio/__stories__/)` - Group navigation
- `[SwitchInput](core/components/atoms/switchInput/__stories__/)` - Toggle states

### Batch 4: Enhanced Inputs

- `[ChipInput](core/components/molecules/chipInput/__stories__/)` - Creation, removal
- `[EditableInput](core/components/molecules/editableInput/__stories__/)` - Edit transitions
- `[InputMask](core/components/molecules/inputMask/__stories__/)` - Mask patterns
- `[VerificationCodeInput](core/components/molecules/verificationCodeInput/__stories__/)` - Auto-focus, paste

### Batch 5: Sliders & Controls

- `[Slider](core/components/atoms/slider/__stories__/)` - Value ranges, keyboard control
- `[RangeSlider](core/components/atoms/rangeSlider/__stories__/)` - Dual handles
- `[SegmentedControl](core/components/atoms/segmentedControl/__stories__/)` - Selection states
- `[Collapsible](core/components/atoms/collapsible/__stories__/)` - Expand/collapse

### Batch 6: Selection & Lists

- `[Select](core/components/organisms/select/__stories__/)` - Options, groups, search
- `[Combobox](core/components/organisms/combobox/__stories__/)` - Filtering, custom values
- `[Listbox](core/components/organisms/listbox/__stories__/)` - Multi-select, virtualization
- `[ChoiceList](core/components/organisms/choiceList/__stories__/)` - Group validation

### Batch 7: Navigation Components

- `[Tabs](core/components/molecules/tabs/__stories__/)` - Overflow, disabled tabs
- `[Menu](core/components/organisms/menu/__stories__/)` - Submenus, separators
- `[VerticalNav](core/components/organisms/verticalNav/__stories__/)` - Nested navigation
- `[Breadcrumbs](core/components/atoms/breadcrumbs/__stories__/)` - Overflow scenarios

### Batch 8: Overlays & Modals

- `[Modal](core/components/molecules/modal/__stories__/)` - Focus trap, scrolling
- `[Sidesheet](core/components/molecules/sidesheet/__stories__/)` - Positioning, scrolling
- `[Popover](core/components/molecules/popover/__stories__/)` - Triggers, auto-close
- `[Toast](core/components/atoms/toast/__stories__/)` - Types, actions, persistence

### Batch 9: Complex Data & Interactions

- `[Calendar](core/components/organisms/calendar/__stories__/)` - Date navigation, ranges
- `[Table](core/components/organisms/table/__stories__/)` - Sorting, selection, actions
- `[Dropdown](core/components/atoms/dropdown/__stories__/)` - Options, positioning
- `[FileUploader](core/components/molecules/fileUploader/__stories__/)` - Drag/drop, validation

## Success Criteria

- **Complete story inventory** for all 36 components
- **Specific edge cases** identified for each story
- **Missing story recommendations** for accessibility gaps
- **Structured markdown output** ready for bug-hunter testing
- **Story-level granularity** replacing component-level testing approach

## Key Files

Story files typically located at:

- `core/components/atoms/[component]/__stories__/[Component].stories.tsx`
- `core/components/molecules/[component]/__stories__/[Component].stories.tsx`  
- `core/components/organisms/[component]/__stories__/[Component].stories.tsx`
- `core/ai-components/[component]/__stories__/[Component].stories.tsx`

Output file: `STORYBOOK_A11Y_STORIES_ANALYSIS.md`
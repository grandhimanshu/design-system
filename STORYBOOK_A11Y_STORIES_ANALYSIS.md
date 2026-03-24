# Storybook A11y Stories Analysis

## Batch 1: Button Components

### Button
**Stories to Test:**
- Basic - Core interaction and focus
- Loading - Loading state announcements
- SplitButton - Complex interactions and grouping
- IconButton - Icon accessibility without text labels
- Alert / Primary - Visual state representations

**Edge Cases per Story:**
- Basic: Extremely long text wrapping/overflow, hit target sizes
- Loading: Screen reader announcements (aria-live), focus management when disabled during load
- SplitButton: Dual action focus separation, keyboard activation of secondary action
- IconButton: Verifying presence and correctness of aria-labels

**Missing Stories Needed:**
- Disabled (explicit story for disabled testing, though might be covered in states)
- ButtonWithTooltip (for hover/focus testing)

### LinkButton
**Stories to Test:**
- index / subtle - Basic link interaction
- disabled - Disabled links (e.g. `aria-disabled="true"`)
- WithIcon - Link navigation with iconography

**Edge Cases per Story:**
- index: Navigation semantics (role="link" vs role="button")
- disabled: Preventing keyboard activation and tab focus handling
- WithIcon: Ensuring icon is `aria-hidden="true"` when redundant

**Missing Stories Needed:**
- Overflow / Text Wrapping links

### AIButton
**Stories to Test:**
- index / state - AI triggering
- withoutSparkle - Visual variants

**Edge Cases per Story:**
- index: Loading/generating states
- withoutSparkle: Reduced motion preferences on animations

**Missing Stories Needed:**
- Explicit Loading State

### AIIconButton
**Stories to Test:**
- index - Core icon trigger
- states - Hover/active/disabled

**Edge Cases per Story:**
- index: Requires clear `aria-label` since it triggers AI actions
- states: Hit target verification and contrast

**Missing Stories Needed:**
- Tooltip integration

---

## Batch 2: Chips & Selection

### Chip
**Stories to Test:**
- index / Size - Standard text chips
- Action - Clickable behavior
- Selection - Selectable behavior
- OverflowBehavior - Text truncation

**Edge Cases per Story:**
- Action vs Selection: Correct ARIA roles (button vs checkbox/radio)
- OverflowBehavior: Tooltip accessibility on truncated text
- Action: "Delete/Remove" cross icon accessibility

**Missing Stories Needed:**
- Disabled state chip

### ChipGroup
*(Note: Component not found in typical stories list, possibly merged into ChipInput or omitted)*
**Stories to Test:**
- N/A

**Edge Cases per Story:**
- Group labeling (aria-labelledby)
- Arrow key navigation between chips

**Missing Stories Needed:**
- Basic ChipGroup, Multi-selection

### Pills
**Stories to Test:**
- Solid / Subtle - Selection forms
- Alert - Validation styles

**Edge Cases per Story:**
- Keyboard selection (Space/Enter)
- Focus indicator contrast

**Missing Stories Needed:**
- Keyboard navigation explicit examples

### SelectionCard
**Stories to Test:**
- singleSelect - Radio behavior
- multiSelect - Checkbox behavior
- state - Error/disabled

**Edge Cases per Story:**
- singleSelect: Focus inside entire card or specific input
- multiSelect: Descriptive text associated with selection (aria-describedby)

**Missing Stories Needed:**
- SelectionCard with interactive elements inside (nested interactive controls)

---

## Batch 3: Basic Form Controls

### Input
**Stories to Test:**
- InputWithLabel / LabelPosition - Label associations
- RequiredVsOptional - Semantics for required fields
- IconLeft / ActionIcon - Inputs with embedded actions
- Error (from Input patterns) - Validation state

**Edge Cases per Story:**
- InputWithLabel: Clicking label focuses input
- RequiredVsOptional: `aria-required` usage and screen reader announcements
- ActionIcon: Tabbing to the icon vs tabbing out of the input

**Missing Stories Needed:**
- Input with long placeholder text

### Checkbox
**Stories to Test:**
- DefaultChecked / Controlled - Basic toggles
- Nested - Hierarchy and indeterminate states
- Error - Validation
- Overflow / HelpText - Supplementary information

**Edge Cases per Story:**
- Nested: `aria-checked="mixed"`
- HelpText: Associating description text correctly (`aria-describedby`)

**Missing Stories Needed:**
- Checkbox group with overall group validation

### Radio
**Stories to Test:**
- Horizontal / Vertical - Layout flow
- RadioError - Invalid state
- HelpText - Detailed options

**Edge Cases per Story:**
- Keyboard arrow navigation moving focus AND selection within the radiogroup
- Group labeling (role="radiogroup" with `aria-labelledby`)

**Missing Stories Needed:**
- RadioGroup disabled state

### SwitchInput
**Stories to Test:**
- index / withLabel - Standard toggles
- State - Disabled/checked

**Edge Cases per Story:**
- role="switch" usage
- Spacebar/Enter to toggle
- High contrast in checked vs unchecked states

**Missing Stories Needed:**
- Long label wrapping for Switch

---

## Batch 4: Enhanced Inputs

### ChipInput
**Stories to Test:**
- index - Tag creation
- OverflowBehavior - Handling many chips
- ChipValidation - Error states on chips

**Edge Cases per Story:**
- index: Backspace to select/delete chips, aria-live announcements for addition/removal
- ChipValidation: Focus behavior when a chip is invalid

**Missing Stories Needed:**
- Pasting multiple comma-separated values

### EditableInput
**Stories to Test:**
- index / Uncontrolled - Core edit mode
- Error - Invalid edits

**Edge Cases per Story:**
- Focus transitions: Switching from Read to Edit mode must move focus into the input
- Escape key to cancel editing, Enter to save

**Missing Stories Needed:**
- Long text truncation in read mode

### InputMask
**Stories to Test:**
- CardNumber - Format restrictions
- HelpText - Additional context

**Edge Cases per Story:**
- Cursor jumping issues for screen reader users
- Announcement of format requirements

**Missing Stories Needed:**
- Phone number / Date formatting examples

### VerificationCodeInput
**Stories to Test:**
- sixFields / fourFields - OTP entry
- Error - Invalid code
- Disabled - Not editable

**Edge Cases per Story:**
- Auto-advancing focus from field to field
- Pasting full code handling and announcements
- Group context for separated fields

**Missing Stories Needed:**
- Resend code action interaction

---

## Batch 5: Sliders & Controls

### Slider
**Stories to Test:**
- FreeSlider / DiscreteSlider - Drag and drop interaction
- CustomLabels - Labeled steps
- Disabled - Immobile handle

**Edge Cases per Story:**
- Keyboard manipulation: Arrow keys, Page Up/Down, Home/End
- Correct roles: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`

**Missing Stories Needed:**
- Slider with explicit linked external numeric input

### RangeSlider
**Stories to Test:**
- FreeSlider / DiscreteSlider - Two handles
- CustomLabels - Visual labels

**Edge Cases per Story:**
- Dual handles focus and overlapping (one handle cannot pass the other)
- Tab order: Left handle then right handle

**Missing Stories Needed:**
- Range validation errors

### SegmentedControl
**Stories to Test:**
- WithCustomContent / WithIcons - Visual content
- Disabled / Controlled - State
- Expanded - Fluid width

**Edge Cases per Story:**
- Semantics: Should behave as a radio group or tab list
- Keyboard: Arrow key navigation without breaking page scroll

**Missing Stories Needed:**
- Very narrow container overflow behavior

### Collapsible
**Stories to Test:**
- index - Basic expansion
- CustomTrigger - Alternate triggers

**Edge Cases per Story:**
- Trigger must have `aria-expanded="true/false"` and `aria-controls`
- Focusable elements inside collapsible region must not be focusable when collapsed

**Missing Stories Needed:**
- Nested collapsibles

---

## Batch 6: Selection & Lists

### Select
**Stories to Test:**
- select - Single select
- selectWithSearch - Filtering
- multiselect / withSelectAll - Checkbox lists
- error / loadingState - Fetch / validation

**Edge Cases per Story:**
- Focus trapped inside dropdown when open
- Typing to find/filter options (typeahead)
- Combobox pattern for `selectWithSearch`

**Missing Stories Needed:**
- Virtualized select for large lists (1000+ items)

### Combobox
**Stories to Test:**
- all / controlled / uncontrolled - Core interaction
- multiselect - Tags
- error - Validation

**Edge Cases per Story:**
- `aria-activedescendant` implementation
- Screen reader announcements of filtered result counts

**Missing Stories Needed:**
- Highlighting matched text

### Listbox
**Stories to Test:**
- optionList / descriptionList - Standard rendering
- reorderList - Drag/drop interaction
- nestedList - Hierarchical data

**Edge Cases per Story:**
- Arrow key navigation
- `reorderList`: Keyboard alternatives for drag and drop

**Missing Stories Needed:**
- Empty listbox state

### ChoiceList
**Stories to Test:**
- AllowMultiple / Controlled - Core logic
- Overflow / Alignment - Layouts

**Edge Cases per Story:**
- Group context with `fieldset` and `legend`
- Visual focus clarity on custom styled options

**Missing Stories Needed:**
- Searchable ChoiceList

---

## Batch 7: Navigation Components

### Tabs
**Stories to Test:**
- BasicTabs / TabsWithIcon - Layout
- overflow - Scrolling/dropdown behavior
- DismissibleTab - Actionable tabs

**Edge Cases per Story:**
- ARIA semantics: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Arrow key navigation (automatic vs manual activation)
- `DismissibleTab`: Deleting a tab should shift focus to next logical tab

**Missing Stories Needed:**
- Vertical tabs

### Menu
**Stories to Test:**
- standard / withSubInfo / nesting - Dropdowns
- rightClick - Context menus
- overflow - Scrollable regions

**Edge Cases per Story:**
- Right-click menu: Keyboard alternative (Shift+F10)
- Escape key to close and return focus to trigger
- Nested submenus: Right arrow to open, Left arrow to close

**Missing Stories Needed:**
- Menu with complex custom content (forms inside menu)

### VerticalNav
**Stories to Test:**
- CollapsibleNavigation / Grouping - Accordion structure
- LabelOverflow - Truncation
- InsideCard / FloatingPanel - Contexts

**Edge Cases per Story:**
- Identifying active item with `aria-current="page"`
- Tabbing vs Arrow keys in the navigation tree

**Missing Stories Needed:**
- Dark mode navigation contrast

### Breadcrumbs
**Stories to Test:**
- lessThan4Levels / moreThan4Levels - Hierarchy
- LabelTruncate - Long names

**Edge Cases per Story:**
- Nav element with `aria-label="Breadcrumb"`
- `moreThan4Levels`: Keyboard focus on the "..." expand trigger and subsequent menu

**Missing Stories Needed:**
- Current page lacking link (just text)

---

## Batch 8: Overlays & Modals

### Modal
**Stories to Test:**
- Dialog / Confirmation - Actions
- Layering - Multiple overlays
- Scrolling - Large content

**Edge Cases per Story:**
- Focus trap: Tab must loop within modal
- Return focus: Closing must return focus to trigger element
- `aria-modal="true"`, `role="dialog"`

**Missing Stories Needed:**
- Modal dynamically opening based on an error (focus shift)

### Sidesheet
**Stories to Test:**
- Regular / Large / scrolling - Containers
- twoSteps / stickyFooter - Complex layouts
- LayeringWithModal - Stacking contexts

**Edge Cases per Story:**
- Same as Modal: Focus trap, esc-to-close, initial focus management
- Slide animation respecting `prefers-reduced-motion`

**Missing Stories Needed:**
- Sidesheet triggered by a non-button (e.g. table row click)

### Popover
**Stories to Test:**
- Actions / Inputs - Interactive contents
- DisabledTrigger - Edge cases
- Layering / Menu - Stacking

**Edge Cases per Story:**
- Tabbing out of popover closes it or traps focus? (Depends on `aria-haspopup`)
- Escape key to dismiss

**Missing Stories Needed:**
- Hover-triggered popovers (should be hover, focus, and touch accessible)

### Toast
**Stories to Test:**
- ToastWithActions - Actionable
- SuccessToast / AlertToast / InfoToast - Types

**Edge Cases per Story:**
- `aria-live="polite"` vs `assertive` based on toast type
- Actions within toasts must be reachable via keyboard before the toast disappears
- Pausing dismissal timer on focus/hover

**Missing Stories Needed:**
- Toast region wrapper to contain multiple toasts

---

## Batch 9: Complex Data & Interactions

### Calendar
**Stories to Test:**
- view / size - Basic grids
- disabled / withEvents - Complex states

**Edge Cases per Story:**
- Keyboard navigation across the grid (up/down/left/right)
- Month/Year changes announcing properly
- Grid vs Table semantics

**Missing Stories Needed:**
- Date range selection (via keyboard)

### Table
**Stories to Test:**
- basicPagination / jumpPagination - Paging
- PinnedColumn / HighlightSearch - Manipulations
- ToggleForHeaderRow / ErrorInTable - States
- BulkAction / syncTable - Selections

**Edge Cases per Story:**
- Tabbing through interactive cells vs arrow key navigation
- Checkbox selection announcing row context
- Sorting buttons having `aria-sort` on headers

**Missing Stories Needed:**
- Expandable rows (nested tables)

### Dropdown
**Stories to Test:**
- StandardDropdown / SearchInDropdown - Basic
- MultiSelect / DropdownWithActionButtons - Advanced
- DisabledOption / FetchErrorTemplate - Edge conditions

**Edge Cases per Story:**
- Typing letters to jump to options
- Focus cycling
- Focus return on selection

**Missing Stories Needed:**
- Very narrow dropdown constraint

### FileUploader
**Stories to Test:**
- index / Format / Disabled (Dropzone/FileUploader)

**Edge Cases per Story:**
- Hidden `<input type="file">` correctly linked to visible button
- Drag and drop text overlay announcements
- Delete button on uploaded files

**Missing Stories Needed:**
- Invalid file type error handling

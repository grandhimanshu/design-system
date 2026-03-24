# 34 critical accessibility issues

Critical ARIA issues identified by AI assisted DS audit with a **suggested fix order**

## Issue count per component

|  # | Component                 | Critical issues |
| -: | ------------------------- | --------------: |
|  1 | Calendar                  |               4 |
|  2 | Chat                      |               3 |
|  3 | FileUploader              |               3 |
|  4 | Listbox                   |               1 |
|  5 | EditableChipInput         |               2 |
|  6 | Navigation (vertical)     |               2 |
|  7 | Table                     |               2 |
|  8 | Breadcrumbs               |               1 |
|  9 | Chip                      |               1 |
| 10 | ChipInput                 |               1 |
| 11 | DatePicker                |               1 |
| 12 | DateRangePicker           |               1 |
| 13 | Dialog                    |               1 |
| 14 | EditableInput             |               1 |
| 15 | FullscreenModal           |               1 |
| 16 | Grid (layout)             |               1 |
| 17 | List                      |               1 |
| 18 | Modal                     |               1 |
| 19 | MultiSlider / RangeSlider |               1 |
| 20 | Pagination                |               1 |
| 21 | ProgressRing              |               1 |
| 22 | Radio                     |               1 |
| 23 | Sidesheet                 |               1 |
| 24 | Tabs                      |               1 |

---

## Suggested fix order

### 1.1 — Calendar: previous/next buttons unnamed

|                          |                                                 |
| ------------------------ | ----------------------------------------------- |
| **What’s wrong**  | Icon prev/next buttons have no accessible name. |
| **Why it matters** | Direction and purpose are unclear.              |
| **What to do**     | View-aware `aria-label` / `tooltip`.        |

### 1.2 — Calendar: day cells not keyboard-focusable

|                          |                                                      |
| ------------------------ | ---------------------------------------------------- |
| **What’s wrong**  | Date cells are text/span, click-only, not focusable. |
| **Why it matters** | Keyboard users cannot move through dates.            |
| **What to do**     | `<button>` per day or grid + roving tabindex.      |

### 1.3 — Calendar: month/year tiles not keyboard-accessible

|                          |                                            |
| ------------------------ | ------------------------------------------ |
| **What’s wrong**  | Month/year tiles use `div` + click only. |
| **Why it matters** | No keyboard path to change month/year.     |
| **What to do**     | Focusable controls and keyboard handling.  |

### 1.4 — Calendar: header “jump” control not keyboard-accessible

|                          |                                             |
| ------------------------ | ------------------------------------------- |
| **What’s wrong**  | Header jump view uses `div onClick` only. |
| **Why it matters** | Keyboard users cannot use the affordance.   |
| **What to do**     | Real buttons with names.                    |

### 2.1 — Chat: broken group label reference

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What’s wrong**  | `aria-labelledby` points at an id that does not exist in the DOM.     |
| **Why it matters** | Group name is broken for assistive tech.                                |
| **What to do**     | Wire a real id, use `aria-label`, or drop incorrect `role="group"`. |

### 2.2 — Chat: “New message” control not keyboard-accessible

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What’s wrong**  | `role="button"` without keyboard support or proper focus. |
| **Why it matters** | Keyboard users cannot use the control.                      |
| **What to do**     | Native `<button>` or full keyboard support.               |

### 2.3 — Chat: “Unread” control not keyboard-accessible

|                          |                                                                   |
| ------------------------ | ----------------------------------------------------------------- |
| **What’s wrong**  | Inner `span` with `role="button"` is not keyboard-accessible. |
| **Why it matters** | Action unavailable from keyboard.                                 |
| **What to do**     | Single real `<button>` with focus and key handling.             |

### 3.1 — FileUploader: remove file action unnamed

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What’s wrong**  | Remove icon button has no accessible name.                 |
| **Why it matters** | Purpose of the control is unclear.                         |
| **What to do**     | `aria-label` with file name or clear “Remove …” text. |

### 3.2 — FileUploader: retry action unnamed

|                          |                                           |
| ------------------------ | ----------------------------------------- |
| **What’s wrong**  | Retry icon button has no accessible name. |
| **Why it matters** | Users cannot tell what the button does.   |
| **What to do**     | `aria-label` or `tooltip`.            |

### 3.3 — FileUploader: keyboard cannot open picker from visible control

|                          |                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **What’s wrong**  | Focus on visible `Button` while file input is not keyboard-reachable as expected (`tabIndex={-1}` pattern). |
| **Why it matters** | Keyboard users may not open the file dialog from the primary control.                                           |
| **What to do**     | One operable pattern: label/input association or one tab stop that reliably opens the picker.                   |

### 4.1 — Listbox list row: wrong role and focus (`ListBody`)

|                          |                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What’s wrong**  | The focused row uses inner markup exposed as `role="tablist"` instead of proper listbox/option (or menu item) structure; focus lands on the wrong node in composed widgets.                                                                                                                                             |
| **Why it matters** | Assistive tech gets tabs without tabs, invalid list/menu subtrees, and wrong roles inside options or menu items.                                                                                                                                                                                                          |
| **What to do**     | Remove incorrect `tablist` from list row internals; align focus and roles with the listbox pattern (e.g. option on the focused node or `aria-activedescendant` from parent). For menu composition, ensure the focused element ultimately exposes correct **menu item** semantics after the shared row is fixed. |

*The same fix addresses the matching P0 wherever this primitive is used — **Select**, **Combobox** (list portion), and **Menu**. Plan separate follow-ups for unrelated findings in those components (e.g. combobox trigger `aria-controls` / disclosure, menu submenu wiring).*

### 5.1 — EditableChipInput: save/discard unnamed

|                          |                                                    |
| ------------------------ | -------------------------------------------------- |
| **What’s wrong**  | Same as EditableInput: icon actions without names. |
| **Why it matters** | Unnamed controls in the editing flow.              |
| **What to do**     | `aria-label` / `tooltip` on both actions.      |

### 5.2 — EditableChipInput: empty placeholder leaves edit trigger unnamed

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| **What’s wrong**  | Default empty placeholder yields an unnamed edit trigger. |
| **Why it matters** | No meaningful name for “start editing.”                 |
| **What to do**     | Default copy or require `aria-label` on the trigger.    |

### 6.1 — Vertical navigation: footer control unnamed

|                          |                                                           |
| ------------------------ | --------------------------------------------------------- |
| **What’s wrong**  | Footer icon `onClick` acts as an unnamed button.        |
| **Why it matters** | No name or expanded state for the footer affordance.      |
| **What to do**     | `aria-label` and `aria-expanded` where it toggles UI. |

### 6.2 — Vertical navigation: collapsed rail items unnamed

|                          |                                                                      |
| ------------------------ | -------------------------------------------------------------------- |
| **What’s wrong**  | Collapsed rail items can be icon-only without a human-readable name. |
| **Why it matters** | Users cannot identify each item.                                     |
| **What to do**     | Always expose `aria-label` from `menu.label` (or equivalent).    |

### 7.1 — Table: column filter / menu triggers unnamed

|                          |                                                            |
| ------------------------ | ---------------------------------------------------------- |
| **What’s wrong**  | Icon buttons for filter / more menu lack names.            |
| **Why it matters** | Actions are not tied to column context for assistive tech. |
| **What to do**     | Labels that include the column display name.               |

### 7.2 — Table: resource rows are click-only

|                          |                                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| **What’s wrong**  | Row is `div` + `onClick` only, not focusable or keyboard-operable. |
| **Why it matters** | Keyboard users cannot activate rows that mouse users can click.        |
| **What to do**     | Keyboard-operable row pattern (focusable row or inner control).        |

### 8.1 — Breadcrumbs: overflow trigger unnamed

|                          |                                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| **What’s wrong**  | Overflow trigger is icon-only with no accessible name.                       |
| **Why it matters** | Trigger is unnamed in the accessibility tree.                                |
| **What to do**     | `aria-label` and optional `tooltip`; fix custom trigger merge if needed. |

### 9.1 — Chip: nested button on clear control

|                          |                                                                                |
| ------------------------ | ------------------------------------------------------------------------------ |
| **What’s wrong**  | Clear control introduces nested interactive `role="button"` inside the chip. |
| **Why it matters** | Invalid nesting; unpredictable keyboard and AT behavior.                       |
| **What to do**     | Sibling native buttons or a single focusable target; no nested buttons.        |

### 10.1 — ChipInput: clear-all control unnamed

|                          |                                                             |
| ------------------------ | ----------------------------------------------------------- |
| **What’s wrong**  | Clear-all icon behaves as `role="button"` without a name. |
| **Why it matters** | Unnamed action in the form.                                 |
| **What to do**     | `aria-label` or native `<button>` with accessible text. |

### 11.1 — DatePicker: inherits Calendar keyboard gaps

|                          |                                                                       |
| ------------------------ | --------------------------------------------------------------------- |
| **What’s wrong**  | Same keyboard/focus gaps as Calendar inside the picker.               |
| **Why it matters** | Date picking stays broken for keyboard users until Calendar is fixed. |
| **What to do**     | Fix Calendar, then re-verify the picker.                              |

### 12.1 — DateRangePicker: inherits Calendar keyboard gaps

|                          |                                                  |
| ------------------------ | ------------------------------------------------ |
| **What’s wrong**  | Same as DatePicker.                              |
| **Why it matters** | Range selection blocked at the calendar surface. |
| **What to do**     | Same remediation as Calendar / DatePicker.       |

### 13.1 — Dialog close control has no accessible name

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **What’s wrong**  | Same as Modal: icon-only close, Tooltip wrapper, no name on the button. |
| **Why it matters** | Unnamed dismiss control.                                                |
| **What to do**     | Fix at Modal/Button so Dialog inherits a named close action.            |

### 14.1 — EditableInput: save/discard unnamed

|                          |                                                                  |
| ------------------------ | ---------------------------------------------------------------- |
| **What’s wrong**  | Save and discard icon buttons lack `aria-label` / `tooltip`. |
| **Why it matters** | Users cannot distinguish actions.                                |
| **What to do**     | Named actions for both buttons.                                  |

### 15.1 — Fullscreen modal close has no accessible name

|                          |                                                                     |
| ------------------------ | ------------------------------------------------------------------- |
| **What’s wrong**  | Icon-only close `Button` in Tooltip without naming on `Button`. |
| **Why it matters** | Unnamed dismiss control.                                            |
| **What to do**     | `tooltip` / `aria-label` on `Button`.                         |

### 16.1 — Grid (layout): same themes as Table

|                          |                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------- |
| **What’s wrong**  | Resource rows click-only; column filter/menu triggers unnamed (same themes as Table). |
| **Why it matters** | Same impact as table/grid tooling.                                                    |
| **What to do**     | One remediation track with Table/Grid implementation (avoid duplicating work).        |

### 17.1 — List: resource rows inherit Grid/Table gap

|                          |                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------- |
| **What’s wrong**  | Resource row +`onRowClick` inherits the same click-only row issue as Table/Grid. |
| **Why it matters** | Same keyboard gap in list layouts.                                                 |
| **What to do**     | Fix shared Grid/row pattern used by Table and List.                                |

### 18.1 — Modal close control has no accessible name

|                          |                                                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **What’s wrong**  | Icon-only close `Button` without `tooltip` or `aria-label` (outer Tooltip does not name the button). |
| **Why it matters** | Dismiss control is unnamed for screen readers.                                                             |
| **What to do**     | Pass `tooltip` and/or `aria-label` on `Button` (or forward via API).                                 |

### 19.1 — MultiSlider / RangeSlider: thumbs lack an accessible name

|                          |                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **What’s wrong**  | Thumbs expose value text but not a proper accessible name; dual thumbs are hard to tell apart.     |
| **Why it matters** | Screen readers lack clear labels (e.g. start vs end).                                              |
| **What to do**     | `aria-labelledby` / `aria-label` per thumb, group labeling, and distinct names for two thumbs. |

### 20.1 — Pagination: icon page buttons unnamed

|                          |                                                                        |
| ------------------------ | ---------------------------------------------------------------------- |
| **What’s wrong**  | Icon-only nav buttons have no `aria-label` or `tooltip`.           |
| **Why it matters** | Users hear “button” with no purpose.                                 |
| **What to do**     | Sensible default labels (first/previous/next/last) and override props. |

### 21.1 — ProgressRing: missing progressbar semantics

|                          |                                                                          |
| ------------------------ | ------------------------------------------------------------------------ |
| **What’s wrong**  | Determinate ring lacks `role="progressbar"` and value attributes.      |
| **Why it matters** | Progress state is not exposed to assistive tech.                         |
| **What to do**     | Add `role="progressbar"`, min/max/current (or equivalent), and a name. |

### 22.1 — Radio can render with no name

|                          |                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **What’s wrong**  | With no `label` and no `aria-label` / `aria-labelledby`, the control is unnamed. |
| **Why it matters** | Screen readers cannot identify the field.                                              |
| **What to do**     | Require a name or dev warning; document usage.                                         |

### 23.1 — Sidesheet close has no accessible name

|                          |                                                                 |
| ------------------------ | --------------------------------------------------------------- |
| **What’s wrong**  | Default close `Button` in Tooltip without name on `Button`. |
| **Why it matters** | Unnamed dismiss control.                                        |
| **What to do**     | `tooltip` / `aria-label` on `Button`.                     |

### 24.1 — Tabs: arrow key focus wrong when a tab is disabled

|                          |                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **What’s wrong**  | With a disabled tab in the middle, ArrowLeft ref/index logic does not match visual order. |
| **Why it matters** | Focus lands on the wrong tab.                                                             |
| **What to do**     | Stable model that walks tabs and skips disabled correctly.                                |

---

## Finish!

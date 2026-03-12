# Select keyboard & focus: challenge and guide for future agents

This note explains the **Select** keyboard/focus issues that appeared after the unified keyboard architecture refactor, how they were fixed, and how to avoid regressions or similar bugs when touching Select (or Listbox/options patterns) again.

---

## 1. What went wrong (short)

After moving Tab/Escape handling into **Popover** and removing the old `handlePopoverKeyDown` from Select’s list container:

- **Arrow Down/Up from the search input** did nothing (focus stayed in the search field).
- **After moving from search to the first option**, pressing Arrow Down again did not move to the second option (focus stayed on the first).
- **Single select** arrow navigation could feel broken or inconsistent.

Root cause was not “who handles the key” alone, but **which DOM element we focus and store as “the focused option”** (list item vs inner wrapper), and **inconsistent handling** across different code paths.

---

## 2. Why it was hard

### Two elements per option

Each Select option is built from:

- **List item (LI)**  
  The `<li>` (or `Tag`) from `Listbox.Item`. This has `tabIndex` (0 or -1 for roving tabindex) and receives keyboard events. **This is the real focus target.**

- **ItemWrapper (div)**  
  An inner div with `data-test="DesignSystem-Listbox-ItemWrapper"` from `ListBody`. It has no `tabIndex`. Code that queried options often used this (e.g. `querySelectorAll('[data-test="DesignSystem-Listbox-ItemWrapper"]')`).

If we **focus or store the wrapper** instead of the list item:

- The “which index is focused?” logic (e.g. in `navigateOptions`, `getRovingIndex`) may not find a match when we later store the **list item** (e.g. after coming from search).
- Or the opposite: we store the list item but the rest of the code only compared against wrappers, so index was always -1 and “next” reverted to first/last.

So the bug was largely **inconsistent focus target**: sometimes the LI, sometimes the wrapper.

### data-test override

`Listbox.Item` defaults to `data-test="DesignSystem-Listbox-Item"` on the `<Tag>`, but **SelectOption** passes `data-test="DesignSystem-Select-Option"` via `...rest`, which **overrides** it. So in Select, the list item has `data-test="DesignSystem-Select-Option"`, not `DesignSystem-Listbox-Item`.

Using `closest('[data-test="DesignSystem-Listbox-Item"]')` from the ItemWrapper therefore returns `null` in Select. Any logic that relied on that selector to “get the list item from the wrapper” would fail and fall back to the wrapper (wrong focus target).

### Where Arrow was handled

After the refactor:

- **Popover** handles Tab and Escape only.
- **Options** handle Arrow/Enter/Space when the **option** has focus.
- The **search Input** may or may not forward `onKeyDown` to our handler.

So when focus was **in the search input**, Arrow Down/Up often never reached a handler that moved focus to the list. The event bubbled to the list container, which had no Arrow logic. Fix: **also handle Arrow Down/Up on the list container when focus is inside the search input** (and delegate to the same “focus first/last option” logic).

---

## 3. What we fixed (for agents)

### A. One rule: focus and store the list item (LI), not the wrapper

Everywhere we move focus to an option we should:

1. **Focus** the list item (the element with `tabIndex`), not the ItemWrapper div.
2. **Store** that same list item in `focusedOption` (and keep roving index in sync).

So:

- From **search** (Arrow Down/Up): resolve “first/last option” from the wrapper list, then `toFocus = wrapper.parentElement ?? wrapper.closest('[data-test="DesignSystem-Select-Option"]') ?? wrapper`, and focus/set `focusedOption` to `toFocus`.
- In **navigateOptions** (arrow between options): `targetWrapper = listItems[index]`, then `toFocus = targetWrapper.parentElement ?? targetWrapper`; focus and `setFocusedOption(toFocus)`.
- In **focusPopoverInitial** (open popover): same idea — get wrapper by index, then `option = wrapper?.parentElement ?? wrapper`, focus and set that.
- In **focusListItem** (Home/End): if the target is an ItemWrapper, use `parentElement` to get the LI; otherwise (e.g. search input) focus the element as-is.

This keeps “current option” and the actual focused element in sync everywhere.

### B. “Which index is focused?” must accept both wrapper and list item

`focusedOption` can be either the **ItemWrapper** (from older paths) or the **list item** (from search path or the fixes above). So any logic that finds the current index must treat both as the same option:

- **navigateOptions:**  
  `index = listItems.findIndex((item) => item === focusedOption || (item as HTMLElement).parentElement === focusedOption);`
- **getRovingIndex:**  
  Same idea: `items.findIndex((el) => el === focusedOption || el.parentElement === focusedOption)` (and then use the matching item for focusability checks).

This avoids “index always -1” when we’ve just stored the LI after moving from search.

### C. Arrow from search: handle on the list container

When focus is in the search input, the Input may not run our handler, so the key event only reaches the list container. Therefore:

- On the **listbox container** `onKeyDown`: if the key is Arrow Down or Arrow Up and `document.activeElement` is the search input (or inside it), call the same logic that moves focus to the first (Arrow Down) or last (Arrow Up) option — i.e. **handleInputKeyDown** (or equivalent) so that focus and `focusedOption` move to the correct list item.

Relevant check:  
`searchEl = listRef.current?.querySelector('[data-test="DesignSystem-Select--Input"]')`  
and  
`searchEl && active && (searchEl === active || searchEl.contains(active))`.

---

## 4. File-level checklist for future changes

When you touch Select keyboard or focus:

| Area | What to check |
|------|----------------|
| **Select.tsx** | Listbox div: Arrow Down/Up when focus in search → call `handleInputKeyDown`. No need to re-attach full `handlePopoverKeyDown`; Popover owns Tab/Escape. |
| **utils.tsx** | `handleInputKeyDown`: after resolving first/last wrapper, focus **list item** (`wrapper.parentElement` or `closest('[data-test="DesignSystem-Select-Option"]')`), not the wrapper. |
| **utils.tsx** | `navigateOptions`: find index with `item === focusedOption \|\| item.parentElement === focusedOption`; focus and set `focusedOption` to the **list item** (parent of wrapper). |
| **utils.tsx** | `getRovingIndex`: same index rule — accept both wrapper and list item. |
| **utils.tsx** | `focusPopoverInitial` / `focusListItem`: when targeting an option, focus (and set) the list item, not the ItemWrapper. |
| **SelectOption** | Passes `data-test="DesignSystem-Select-Option"` to Listbox.Item, so the **LI** has that attribute, not `DesignSystem-Listbox-Item`. Use this when resolving “wrapper → list item” in Select. |
| **Listbox.Item / ListBody** | ItemWrapper is the inner div; the **Tag** (e.g. `<li>`) is the focusable list item. Don’t assume `data-test="DesignSystem-Listbox-Item"` on the Tag when used inside Select. |

---

## 5. Quick reference: DOM shape

```
Listbox.Item (Tag = li, data-test="DesignSystem-Select-Option" in Select)
└── ListBody (div, data-test="DesignSystem-Listbox-ItemWrapper")
    └── …option content…
```

- **Focus and store:** the **Tag** (li), not the ListBody div.
- **Query options:** still often by `DesignSystem-Listbox-ItemWrapper`; then use `.parentElement` or `DesignSystem-Select-Option` to get the list item for focus/setState.

---

## 6. Related docs

- **Unified keyboard plan:** `unified_keyboard_architecture_7e8c5bf9.plan.md` — Popover owns Tab/Escape; list owns arrow/Enter/Space.
- **Select complexities:** `NOTES-select-complexities.md` — Search, footer, multi-select, roving tabindex.
- **Playbook:** `PLAYBOOK-keyboard-a11y.md` — D1 (Tab trap), D14 (arrow navigation), etc.

If a future change breaks “Arrow from search” or “Arrow from first option to second” or single-select arrows, first check: **are we focusing and storing the list item (LI) everywhere, and does index lookup accept both wrapper and LI?**

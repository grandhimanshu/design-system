# Keyboard A11y PR Review Learnings

Patterns from PRs [#2792](https://github.com/innovaccer/design-system/pull/2792) (Tooltip/Popover Escape) and [#2801](https://github.com/innovaccer/design-system/pull/2801) (Select keyboard a11y) to avoid repeating in future PRs.

---

## Common Issues & Fixes

### 1. State Sync with Controlled Components

**Issue:** When adding keyboard handlers that call state setters (e.g., `setOpenPopover`), controlled vs uncontrolled mode can have sync issues.

**Example from #2792:**
- Escape key was closing tooltip but not syncing state with controlled consumers
- Fixed: Check if component is controlled before calling internal setter; use `onToggle` callback pattern

**Prevention:**
```typescript
// Bad
case 'Escape':
  setOpenPopover(false);  // Doesn't respect controlled mode
  break;

// Good
case 'Escape':
  onToggle?.(false);  // Let parent control state
  if (!open) {        // Only set internal state if uncontrolled
    setOpenPopover(false);
  }
  break;
```

---

### 2. Event Listener Lifecycle

**Issue:** Keyboard event listeners added but not properly cleaned up, or cleaned up at wrong time.

**Example from #2792:**
- Escape listener was being removed too early (before transition finished)
- Fixed: Defer teardown to open transition completion

**Prevention:**
```typescript
React.useEffect(() => {
  if (!open) return;
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // handle escape
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [open]);  // Re-run when open changes
```

**Checklist:**
- [ ] Listener added only when needed (e.g., when popover is open)
- [ ] Cleanup in `useEffect` return
- [ ] Consider transition/animation timing for cleanup

---

### 3. Double Event Handling

**Issue:** Parent component adds keyboard handler; child component has its own handler → both fire.

**Example from #2801:**
- Listbox had built-in keyboard handler
- Select also added its own handler
- Both were firing, causing unexpected behavior

**Fixed:** Added `suppressKeyboard` prop to Listbox so parent can take over

**Prevention:**
- When parent takes over keyboard handling, add opt-out prop to child
- Document which component owns keyboard interaction
- Test that only one handler fires

---

### 4. tabIndex Placement

**Issue:** `tabIndex` applied to wrong element (inner vs outer), breaking focus trap or roving tabindex.

**Example from #2801:**
- `tabIndex` was on inner checkbox, not outer list item
- `getFocusableElements` utility was finding unexpected elements

**Fixed:** Apply `tabIndex` to outer Tag that has ARIA role

**Prevention:**
```typescript
// Bad
<li>
  <input tabIndex={0} />  // Wrong element
</li>

// Good
<li tabIndex={0} role="option">  // Outer element with role
  <input tabIndex={-1} />
</li>
```

**Remember:** `getFocusableElements` excludes `tabindex="-1"`, so ensure your roving tabindex logic matches

---

### 5. Null/Undefined Guards

**Issue:** Refs, DOM queries, or arrays accessed without null checks → runtime errors.

**Example from #2801:**
- `optionValuesOrderRef.current` could be null when children were null
- Fixed: Added guard before accessing

**Prevention:**
```typescript
// Bad
inputTriggerRef.current.focus();
const items = listRef.current.querySelectorAll('[data-test="..."]');

// Good
inputTriggerRef.current?.focus();
const items = listRef.current?.querySelectorAll('[data-test="..."]') || [];
```

**Common null cases:**
- Refs before mount
- Optional children
- Dynamic lists that can be empty
- DOM queries that might not find elements

---

### 6. Design Tokens Over Hard-Coded Values

**Issue:** Hard-coded pixel values, colors, or other style constants in code or stories.

**Example from #2792:**
- Story had `maxWidth: '200px'`
- Fixed: `maxWidth: 'var(--spacing-320)'` (design token)

**Prevention:**
- Use CSS variables from `css/src/variables/index.css`
- Check Storybook stories too (not just component code)
- Reviewers will flag this quickly

**Common violations:**
```typescript
// Bad
style={{ maxWidth: '200px', padding: '16px', color: '#333' }}

// Good
style={{ 
  maxWidth: 'var(--spacing-320)', 
  padding: 'var(--spacing-4)', 
  color: 'var(--text)' 
}}
```

---

### 7. Roving tabIndex Edge Cases

**Issue:** Roving tabindex implementation has gaps, doesn't handle disabled items, or breaks with dynamic lists.

**Example from #2801:**
- Initially used non-contiguous indices (relied on child order)
- Fixed: Use contiguous option indices that account for disabled/missing items

**Prevention:**
- Handle empty lists (no focusable items)
- Skip disabled items when moving focus
- Re-calculate indices when list changes
- Test with dynamic lists (add/remove items)

**Pattern:**
```typescript
const focusables = getFocusableElements(container);
const enabledFocusables = focusables.filter(el => !el.hasAttribute('disabled'));
const currentIndex = enabledFocusables.indexOf(document.activeElement);
// Move to next enabled element
```

---

### 8. Focus Return on Close

**Issue:** Focus doesn't return to trigger when closing via Escape or other means.

**Example from #2801:**
- Home key worked but focus return on Escape didn't work from footer
- Fixed: Ensure Escape handler works from all zones (search, options, footer)

**Prevention:**
```typescript
case 'Escape':
  setOpenPopover(false);
  triggerRef.current?.focus();  // Always return focus
  break;
```

**Test matrix:**
- [ ] Escape from search input
- [ ] Escape from option
- [ ] Escape from footer button
- [ ] Escape from any custom zone

---

### 9. OverlayManager Lifecycle

**Issue:** Overlay elements (popovers, modals) not properly registered/unregistered with OverlayManager.

**Example from #2792:**
- PopperWrapper overlay lifecycle needed refactoring
- Fixed: Proper registration on mount, unregistration on unmount

**Prevention:**
- Use OverlayManager for z-index management
- Register when overlay opens, unregister when closes
- Test with multiple overlays (stacking order)

---

## Pre-Submit Checklist for Keyboard A11y PRs

Before requesting review:

**Code:**
- [ ] Event handlers have cleanup (`useEffect` return)
- [ ] Null guards on all refs (`ref.current?.method()`)
- [ ] No double key handling (parent/child conflict)
- [ ] Design tokens used (no hard-coded px/colors)
- [ ] tabIndex on correct element (outer, with ARIA role)
- [ ] Roving tabindex handles edge cases (empty, disabled, dynamic)
- [ ] Focus returns to trigger on close (test all paths)
- [ ] Controlled/uncontrolled mode both work

**Tests:**
- [ ] Tests added for new keyboard behavior
- [ ] Tests cover edge cases (null refs, empty lists, disabled items)
- [ ] Tests verify focus management (where focus goes)

**Docs:**
- [ ] Interactions.mdx updated with keyboard table
- [ ] Each key documented (what it does, when)
- [ ] Any caveats or special cases noted

**General:**
- [ ] One commit (unless logically separate changes)
- [ ] Commit message follows convention (`feat(component): description`)
- [ ] No linter errors
- [ ] All tests pass

---

## Quick Reference: Common Fixes

| Issue | Quick Fix |
|-------|-----------|
| Ref might be null | Add `?.` → `ref.current?.focus()` |
| Hard-coded value | Replace with design token → `var(--spacing-4)` |
| Double key handling | Add `suppressKeyboard` prop or similar opt-out |
| Focus not returning | Add `triggerRef.current?.focus()` after close |
| Listener not cleaned up | Add cleanup in `useEffect` return |
| Wrong element focused | Move `tabIndex` to outer element with ARIA role |
| Controlled mode broken | Check if controlled before calling internal setter |

---

## Related

- [PLAYBOOK-keyboard-a11y.md](../PLAYBOOK-keyboard-a11y.md) — Implementation patterns
- [KeyboardAxe-Open-Issues.md](KeyboardAxe-Open-Issues.md) — Audit status
- [REVIEW_GUIDELINE.md](../REVIEW_GUIDELINE.md) — General review guidelines

# Focus Restoration Bug Fix

## The Problem

Focus was NOT returning to the modal trigger button when the modal closed. This was a **timing issue** in how we captured `previousActiveElement`.

## Root Cause

We were capturing `previousActiveElement` in the **wrong order**:

```typescript
// ❌ WRONG ORDER (before fix)
componentDidMount() {
  if (this.state.open) {
    // Adding to FocusScopeManager with this.previousActiveElement
    // BUT this.previousActiveElement is still null!
    FocusScopeManager.add(this.modalRef.current, this.previousActiveElement, null);
  }
  
  if (this.state.open) {
    this.activateFocusTrap(); // Captures previousActiveElement HERE (too late!)
  }
}

activateFocusTrap = () => {
  this.previousActiveElement = document.activeElement; // Captured AFTER registration
  // ... rest of focus trap
}
```

**What happened:**
1. `componentDidMount` runs
2. `FocusScopeManager.add()` called with `this.previousActiveElement` = `null`
3. THEN `activateFocusTrap()` captures the active element
4. But FocusScopeManager already registered with `null`!
5. On close, there's no element to restore focus to

## The Solution

Capture `previousActiveElement` BEFORE registering with FocusScopeManager:

```typescript
// ✅ CORRECT ORDER (after fix)
componentDidMount() {
  if (this.state.open) {
    // Capture FIRST
    this.previousActiveElement = document.activeElement as HTMLElement | null;
    
    // THEN register with the captured value
    DismissableLayerManager.add(this.modalRef.current);
    FocusScopeManager.add(this.modalRef.current, this.previousActiveElement, null);
  }
  
  if (this.state.open) {
    this.activateFocusTrap(); // No longer captures previousActiveElement
  }
}

activateFocusTrap = () => {
  // previousActiveElement already captured before FocusScopeManager.add
  const container = this.modalContentRef.current;
  // ... rest of focus trap (no capture here)
}
```

## Files Fixed

Applied this fix to all three overlay components:

1. **Modal.tsx**
   - `componentDidMount()` - capture before registration
   - `componentDidUpdate()` - capture before registration
   - `activateFocusTrap()` - removed capture (already done)

2. **Sidesheet.tsx**
   - Same changes as Modal

3. **FullscreenModal.tsx**
   - Same changes as Modal

## Why This Works

Now the flow is correct:

1. Modal opens
2. **Capture current focus** (the button that opened modal)
3. Register with FocusScopeManager (passing the captured button)
4. Activate focus trap (move focus into modal)
5. User interacts, opens select, clicks "Test Close"
6. Modal closes
7. FocusScopeManager has the correct button reference
8. **Focus returns to button** ✅

## Testing

Test with the "Input Modals" story:
1. Click "Open Modal"
2. Click first Select dropdown
3. Click "Test Close" button
4. **Result:** Focus should return to "Open Modal" button

Before fix: Focus was lost
After fix: Focus returns correctly

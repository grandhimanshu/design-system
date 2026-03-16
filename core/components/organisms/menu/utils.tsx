import React from 'react';
import { getAllFocusableElements } from '@/utils/overlayHelper';

// Phase 1: REMOVED module-level state (Hypothesis A)
// Now using context-based ref passed as parameter

export const handleKeyDown = (
  event: React.KeyboardEvent,
  focusedOption: Element | undefined,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  setOpenPopover?: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  menuTriggerRef?: React.RefObject<HTMLButtonElement>,
  listRef?: React.RefObject<HTMLDivElement>,
  subListRef?: React.RefObject<HTMLDivElement> | null,
  isSubMenuTrigger?: boolean,
  triggerRef?: React.RefObject<HTMLDivElement> | React.MutableRefObject<HTMLDivElement>,
  menuID?: string,
  triggerID?: string,
  parentListRef?: React.RefObject<HTMLDivElement> | null,
  isKeyboardNavigating?: React.MutableRefObject<boolean>,
  lastKeyboardActionTime?: React.MutableRefObject<number>,
  lastNavigationCall?: React.MutableRefObject<{
    key: string;
    triggerID: string | undefined;
    timestamp: number;
  } | null>
) => {
  // Phase 6: Use context ref instead of module state (Hypothesis A)
  const now = Date.now();
  if (lastNavigationCall?.current && 
      lastNavigationCall.current.key === event.key && 
      lastNavigationCall.current.triggerID === triggerID &&
      now - lastNavigationCall.current.timestamp < 50) {
    // #region agent log
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:handleKeyDown',message:'BLOCKED duplicate key',data:{key:event.key,triggerID,timeSince:now-lastNavigationCall.current.timestamp},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return; // Skip duplicate call
  }
  
  if (lastNavigationCall) {
    lastNavigationCall.current = { key: event.key, triggerID, timestamp: now };
  }
  
  // #region agent log
  typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:handleKeyDown',message:'Key handler started',data:{key:event.key,triggerID,menuID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  // Update keyboard action timestamp for grace period
  if (lastKeyboardActionTime) {
    lastKeyboardActionTime.current = Date.now();
  }
  
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      navigateOptions('up', focusedOption, setFocusedOption, listRef, isKeyboardNavigating);
      break;
    case 'ArrowDown':
      event.preventDefault();
      navigateOptions('down', focusedOption, setFocusedOption, listRef, isKeyboardNavigating);
      break;
    case 'Home':
      event.preventDefault();
      navigateOptions('first', focusedOption, setFocusedOption, listRef, isKeyboardNavigating);
      break;
    case 'End':
      event.preventDefault();
      navigateOptions('last', focusedOption, setFocusedOption, listRef, isKeyboardNavigating);
      break;
    case 'Enter':
      (focusedOption as HTMLElement)?.click();
      setOpenPopover?.(false);
      break;
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      (focusedOption as HTMLElement)?.click();
      setOpenPopover?.(false);
      break;
    case 'Escape':
      event.preventDefault();
      event.stopPropagation();
      
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:Escape',message:'Escape key pressed',data:{triggerID,menuID,hasParentList:!!parentListRef?.current,isSubmenu:!!(triggerID&&parentListRef?.current)},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`Escape pressed: triggerID=${triggerID} menuID=${menuID} isSubmenu=${!!(triggerID&&parentListRef?.current)}`);
      }
      // #endregion
      
      // Phase 5: Direct state management instead of event simulation (Hypothesis C & E)
      if (triggerID && parentListRef?.current) {
        // We're in a submenu - close only this level
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:Escape',message:'Closing submenu via direct state',data:{triggerID,menuID},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Escape: Closing submenu`);
        }
        // #endregion
        
        // CRITICAL: Update keyboard timestamp FIRST to extend grace period
        // This prevents root menu from closing via outsideClick when we focus parent trigger
        if (lastKeyboardActionTime) {
          lastKeyboardActionTime.current = Date.now();
        }
        
        // Focus parent trigger BEFORE closing submenu
        // This ensures focus lands correctly before DOM changes
        const triggerWrapper = document.getElementById(triggerID);
        let submenuTrigger: HTMLElement | null = null;
        let strategyUsed = '';
        
        // Strategy 1: Look for [role="menuitem"] child
        submenuTrigger = triggerWrapper?.querySelector('[role="menuitem"]') as HTMLElement;
        if (submenuTrigger) strategyUsed = 'child-query';
        
        // Strategy 2: Check if wrapper itself is the menuitem
        if (!submenuTrigger && triggerWrapper?.getAttribute('role') === 'menuitem') {
          submenuTrigger = triggerWrapper as HTMLElement;
          strategyUsed = 'wrapper-itself';
        }
        
        // Strategy 3: Look at parent
        if (!submenuTrigger) {
          submenuTrigger = triggerWrapper?.closest('[role="menuitem"]') as HTMLElement;
          if (submenuTrigger) strategyUsed = 'closest-ancestor';
        }
        
        if (submenuTrigger) {
          // #region agent log
          const triggerText = submenuTrigger.textContent?.trim();
          typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:Escape',message:'Focusing parent trigger',data:{triggerText,triggerID,strategy:strategyUsed},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
          if (typeof window !== 'undefined' && (window as any).addDebugLog) {
            (window as any).addDebugLog(`Escape: ✅ Focusing parent trigger: "${triggerText}" (strategy: ${strategyUsed})`);
          }
          // #endregion
          submenuTrigger.focus();
          
          // #region agent log - Check if focus actually landed
          setTimeout(() => {
            const actualFocus = document.activeElement as HTMLElement;
            const focusText = actualFocus?.textContent?.trim();
            const focusMatches = actualFocus === submenuTrigger;
            if (typeof window !== 'undefined' && (window as any).addDebugLog) {
              (window as any).addDebugLog(`Escape: 🔍 After focus - activeElement="${focusText}" matches=${focusMatches} tag=${actualFocus?.tagName}`);
            }
          }, 10);
          // #endregion
        } else {
          // #region agent log
          if (typeof window !== 'undefined' && (window as any).addDebugLog) {
            (window as any).addDebugLog(`Escape: ❌ Could not find submenu trigger with ID ${triggerID}`);
          }
          // #endregion
        }
        
        // Close this submenu AFTER focusing parent
        setOpenPopover?.(false);
      } else {
        // Root menu - close it and focus root trigger
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:Escape',message:'Closing root menu',data:{hasMenuTriggerRef:!!menuTriggerRef?.current,hasTriggerRef:!!triggerRef?.current,isSubMenuTrigger},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Escape: Closing root menu`);
        }
        // #endregion
        setOpenPopover?.(false);
        if (triggerRef && !isSubMenuTrigger) {
          triggerRef?.current?.focus();
        } else {
          menuTriggerRef?.current?.focus();
        }
      }
      setFocusedOption?.(undefined);
      break;
    case 'Tab':
      // Close all menus and let Tab proceed naturally
      setOpenPopover?.(false);
      // Don't prevent default - let Tab work naturally
      break;
    case 'ArrowRight':
      event.preventDefault();
      event.stopPropagation();
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:ArrowRight',message:'ArrowRight pressed',data:{menuID,isSubMenuTrigger,hasSubListRef:!!subListRef},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      navigateSubMenu(isSubMenuTrigger, 'right', subListRef, menuID, triggerID, parentListRef, isKeyboardNavigating, lastKeyboardActionTime);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      event.stopPropagation();
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:ArrowLeft',message:'ArrowLeft pressed',data:{menuID,isSubMenuTrigger,hasTriggerID:!!triggerID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      navigateSubMenu(isSubMenuTrigger, 'left', subListRef, menuID, triggerID, parentListRef, isKeyboardNavigating, lastKeyboardActionTime);
      break;
    default:
      break;
  }
};

const navigateOptions = (
  direction: string,
  focusedOption: Element | undefined,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  listRef?: any,
  isKeyboardNavigating?: React.MutableRefObject<boolean>
) => {
  if (!listRef?.current) return;

  // Scope to 'menu' role to exclude nested submenu items
  const focusables = getAllFocusableElements(listRef.current, 'menu');
  if (focusables.length === 0) return;

  let index = focusables.findIndex((item) => item === focusedOption || item === document.activeElement);

  if (direction === 'first') {
    index = 0;
  } else if (direction === 'last') {
    index = focusables.length - 1;
  } else if (index === -1) {
    index = direction === 'up' ? focusables.length - 1 : 0;
  } else {
    index = direction === 'up' ? (index - 1 + focusables.length) % focusables.length : (index + 1) % focusables.length;
  }

  const targetOption = focusables[index];
  targetOption.focus({ preventScroll: true });
  setFocusedOption && setFocusedOption(targetOption);
  targetOption.scrollIntoView?.({ block: 'center' });
};

const navigateSubMenu = (
  isSubMenuTrigger?: boolean,
  direction?: string,
  subListRef?: React.RefObject<HTMLDivElement> | null,
  menuID?: string,
  triggerID?: string,
  parentListRef?: React.RefObject<HTMLDivElement> | null,
  isKeyboardNavigating?: React.MutableRefObject<boolean>,
  lastKeyboardActionTime?: React.MutableRefObject<number>
) => {
  // #region agent log
  typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:navigateSubMenu',message:'navigateSubMenu called',data:{isSubMenuTrigger,direction,triggerID,menuID,hasSubListRef:!!subListRef?.current},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (!menuID) {
    // #region agent log
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:navigateSubMenu',message:'ABORT - no menuID',data:{},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return;
  }
  
  const element = document.querySelector(`[data-name="${menuID}"]`);
  const menuPlacement = element?.getAttribute('data-placement');

  // Case 1: On a SubMenu trigger item - ArrowRight/Left opens the submenu
  if (isSubMenuTrigger && subListRef?.current) {
    if (
      (direction === 'right' && menuPlacement?.includes('right')) ||
      (direction === 'left' && menuPlacement?.includes('left'))
    ) {
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:navigateSubMenu',message:'CASE 1: Opening submenu',data:{placement:menuPlacement,menuID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const focusables = getAllFocusableElements(subListRef.current);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      }
    }
  }

  // Case 2: Go back to parent trigger
  // This applies to:
  // - Regular MenuItems inside a submenu (!isSubMenuTrigger)
  // - SubMenu triggers that are themselves inside a parent submenu (isSubMenuTrigger with parent context)
  if (triggerID && parentListRef?.current) {
    const isGoingBackDirection = 
      (direction === 'left' && menuPlacement?.includes('right')) ||
      (direction === 'right' && menuPlacement?.includes('left'));
    
    // Only proceed if we're going in the "back" direction
    if (isGoingBackDirection) {
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'utils.tsx:navigateSubMenu',message:'CASE 2: Going back to parent',data:{placement:menuPlacement,triggerID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`ArrowLeft: Going back to parent trigger ID=${triggerID}`);
      }
      // #endregion

      // Debug: Check if parentListRef exists and what we can find
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        const hasParent = !!parentListRef.current;
        const elementById = document.getElementById(triggerID);
        const elementByQuery = parentListRef.current?.querySelector(`#${triggerID}`);
        const roleOnElement = elementById?.getAttribute('role');
        const hasMenuitemChild = !!elementById?.querySelector('[role="menuitem"]');
        const menuitemParent = elementById?.closest('[role="menuitem"]');
        (window as any).addDebugLog(`🔍 Debug: hasParent=${hasParent} foundById=${!!elementById} foundByQuery=${!!elementByQuery}`);
        (window as any).addDebugLog(`🔍 Structure: roleOnElement="${roleOnElement}" hasMenuitemChild=${hasMenuitemChild} hasMenuitemParent=${!!menuitemParent}`);
        (window as any).addDebugLog(`🔍 Element: tagName=${elementById?.tagName} className=${elementById?.className}`);
      }

      // Find the trigger element
      // The triggerID might be on the menuitem itself, or on a wrapper
      let triggerWrapper = document.getElementById(triggerID);
      let triggerElement: HTMLElement | null = null;
      let strategyUsed = '';
      
      // Strategy 1: querySelector for child [role="menuitem"]
      triggerElement = triggerWrapper?.querySelector('[role="menuitem"]') as HTMLElement;
      if (triggerElement) strategyUsed = 'child-query';
      
      // Strategy 2: Check if the wrapper itself has role="menuitem"
      if (!triggerElement && triggerWrapper?.getAttribute('role') === 'menuitem') {
        triggerElement = triggerWrapper as HTMLElement;
        strategyUsed = 'wrapper-itself';
      }
      
      // Strategy 3: Use closest() to find ancestor with role="menuitem"
      if (!triggerElement) {
        triggerElement = triggerWrapper?.closest('[role="menuitem"]') as HTMLElement;
        if (triggerElement) strategyUsed = 'closest-ancestor';
      }
      
      if (triggerElement) {
        // #region agent log
        const triggerText = triggerElement.textContent?.trim();
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`ArrowLeft: ✅ Focusing parent trigger: "${triggerText}" (strategy: ${strategyUsed})`);
        }
        // #endregion
        
        // CRITICAL: Update keyboard timestamp to extend grace period
        // This prevents root menu from closing via outsideClick when we focus parent trigger
        if (lastKeyboardActionTime) {
          lastKeyboardActionTime.current = Date.now();
        }
        
        // Focus the parent trigger - submenu will close naturally via blur
        triggerElement.focus();
        
        // #region agent log - Check if focus actually landed
        setTimeout(() => {
          const actualFocus = document.activeElement as HTMLElement;
          const focusText = actualFocus?.textContent?.trim();
          const focusMatches = actualFocus === triggerElement;
          if (typeof window !== 'undefined' && (window as any).addDebugLog) {
            (window as any).addDebugLog(`ArrowLeft: 🔍 After focus - activeElement="${focusText}" matches=${focusMatches} tag=${actualFocus?.tagName}`);
          }
        }, 10);
        // #endregion
      } else {
        // #region agent log
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`ArrowLeft: ❌ Could not find parent trigger with ID ${triggerID}`);
        }
        // #endregion
      }
    }
  }
};

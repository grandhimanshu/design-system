import React from 'react';
import { getAllFocusableElements } from '@/utils/overlayHelper';

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
  inputMode?: React.MutableRefObject<'mouse' | 'keyboard'>,
  setInputMode?: (mode: 'mouse' | 'keyboard') => void
) => {
  // Switch to keyboard mode on first keyboard input
  if (setInputMode && inputMode?.current !== 'keyboard') {
    setInputMode('keyboard');
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
      
      // If we're inside a submenu, focus the parent trigger
      if (triggerID && parentListRef?.current) {
        const submenuTrigger = parentListRef.current.querySelector(`#${triggerID}`)?.firstChild;
        if (submenuTrigger) {
          (submenuTrigger as HTMLElement)?.focus();
        }
      } else {
        // Root menu - close it and focus the root trigger
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
      setOpenPopover?.(false);
      break;
    case 'ArrowRight':
      event.preventDefault();
      event.stopPropagation();
      navigateSubMenu(isSubMenuTrigger, 'right', subListRef, menuID, triggerID, parentListRef, isKeyboardNavigating);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      event.stopPropagation();
      navigateSubMenu(isSubMenuTrigger, 'left', subListRef, menuID, triggerID, parentListRef, isKeyboardNavigating);
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
  isKeyboardNavigating?: React.MutableRefObject<boolean>
) => {
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(
      `navigateSubMenu: isSubMenuTrigger=${isSubMenuTrigger}, direction=${direction}, menuID=${menuID}, triggerID=${triggerID}`
    );
  }
  // #endregion
  
  const element = document.querySelector(`[data-name="${menuID}"]`);
  const menuPlacement = element?.getAttribute('data-placement');
  
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`navigateSubMenu: menuPlacement=${menuPlacement}`);
  }
  // #endregion

  // Case 1: On a SubMenu trigger item - ArrowRight/Left opens the submenu
  if (isSubMenuTrigger && subListRef?.current) {
    if (
      (direction === 'right' && menuPlacement?.includes('right')) ||
      (direction === 'left' && menuPlacement?.includes('left'))
    ) {
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`navigateSubMenu: CASE 1 - opening submenu from trigger`);
      }
      // #endregion
      // Don't scope by role here because subListRef points to a wrapper div,
      // not the Menu.List component with role="menu"
      const focusables = getAllFocusableElements(subListRef.current);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      }
    }
  }

  // Case 2: Inside a submenu - ArrowLeft/Right goes back to parent trigger
  if (!isSubMenuTrigger && triggerID && parentListRef?.current) {
    if (
      (direction === 'left' && menuPlacement?.includes('right')) ||
      (direction === 'right' && menuPlacement?.includes('left'))
    ) {
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`navigateSubMenu: CASE 2 - going back to parent trigger from submenu`);
      }
      // #endregion

      const triggerElement = parentListRef.current.querySelector(`#${triggerID}`)?.firstChild;
      
      // Focus the parent trigger - submenu will close naturally via blur
      (triggerElement as HTMLElement)?.focus();
    }
  }
};

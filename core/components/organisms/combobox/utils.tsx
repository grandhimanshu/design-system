import React from 'react';
import { getAllFocusableElements } from '@/utils/overlayHelper';

export const handleKeyDown = (
  event: React.KeyboardEvent,
  focusedOption: Element | undefined,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  setOpenPopover?: React.Dispatch<React.SetStateAction<boolean>>,
  inputTriggerRef?: any,
  setHighlightFirstItem?: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightLastItem?: React.Dispatch<React.SetStateAction<boolean>>,
  multiSelect?: boolean,
  listRef?: any
) => {
  // #region agent log
  const focusedText = (focusedOption as HTMLElement)?.textContent?.trim();
  const activeText = document.activeElement?.textContent?.trim();
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`🎹 Combobox keyDown: key=${event.key} focusedOption="${focusedText}" activeElement="${activeText}"`);
  }
  // #endregion
  
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      navigateOptions('up', focusedOption, setFocusedOption, listRef);
      break;
    case 'ArrowDown':
      event.preventDefault();
      navigateOptions('down', focusedOption, setFocusedOption, listRef);
      break;
    case 'Enter':
      handleEnterKey(focusedOption, multiSelect, inputTriggerRef, listRef, setFocusedOption);
      setHighlightLastItem?.(false);
      setHighlightFirstItem?.(false);
      break;
    case 'Escape':
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`🎹 Combobox Escape: closing popover and focusing input`);
      }
      // #endregion
      setOpenPopover?.(false);
      inputTriggerRef.current.focus();
      setFocusedOption?.(undefined);
      break;
    case 'Tab':
      event.preventDefault();
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`🎹 Combobox Tab: closing popover and focusing input`);
      }
      // #endregion
      setOpenPopover?.(false);
      inputTriggerRef.current?.focus();
      break;
    default:
      break;
  }
};

const handleEnterKey = (
  focusedOption: Element | undefined,
  multiSelect?: boolean,
  inputTriggerRef?: any,
  listRef?: any,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>
) => {
  (focusedOption as HTMLElement)?.click();
  if (!multiSelect) {
    inputTriggerRef.current.focus();
  } else {
    // to focus first option by default when last option is selected
    if (!listRef?.current) return;

    // Scope to 'listbox' role to exclude nested elements
    const focusables = getAllFocusableElements(listRef.current, 'listbox');
    const index = focusables.findIndex((item) => item === focusedOption);

    if (index === focusables.length - 1 && focusables.length > 0) {
      focusables[0].focus({ preventScroll: true });
      setFocusedOption && setFocusedOption(focusables[0]);
      focusables[0].scrollIntoView({ block: 'center' });
    }
  }
};

const navigateOptions = (
  direction: string,
  focusedOption: Element | undefined,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  listRef?: any
) => {
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    const focusedText = (focusedOption as HTMLElement)?.textContent?.trim();
    (window as any).addDebugLog(`⬆️⬇️ navigateOptions: direction=${direction} focusedOption="${focusedText}" hasListRef=${!!listRef?.current}`);
  }
  // #endregion
  
  if (!listRef?.current) {
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`❌ navigateOptions ABORT: no listRef.current`);
    }
    // #endregion
    return;
  }

  // Scope to 'listbox' role to exclude nested elements
  const focusables = getAllFocusableElements(listRef.current, 'listbox');
  
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`🔍 navigateOptions: found ${focusables.length} focusable items`);
  }
  // #endregion
  
  if (focusables.length === 0) {
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`❌ navigateOptions ABORT: no focusable items`);
    }
    // #endregion
    return;
  }

  let index = focusables.findIndex((item) => item === focusedOption || item === document.activeElement);

  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`🔍 navigateOptions: current index=${index} (${index === -1 ? 'not found' : 'found'})`);
  }
  // #endregion

  if (index === -1) {
    index = direction === 'up' ? focusables.length - 1 : 0;
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`🔍 navigateOptions: no current focus, setting index=${index}`);
    }
    // #endregion
  } else {
    index = direction === 'up' ? (index - 1 + focusables.length) % focusables.length : (index + 1) % focusables.length;
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`🔍 navigateOptions: moving to index=${index}`);
    }
    // #endregion
  }

  const targetOption = focusables[index];
  const targetText = (targetOption as HTMLElement)?.textContent?.trim();
  
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`✅ navigateOptions: focusing "${targetText}"`);
  }
  // #endregion
  
  targetOption.focus({ preventScroll: true });
  setFocusedOption && setFocusedOption(targetOption);
  targetOption.scrollIntoView?.({ block: 'center' });
  
  // #region agent log - Verify focus landed
  setTimeout(() => {
    const actualFocus = document.activeElement as HTMLElement;
    const actualText = actualFocus?.textContent?.trim();
    const matches = actualFocus === targetOption;
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`🔍 navigateOptions verify: activeElement="${actualText}" matches=${matches}`);
    }
  }, 10);
  // #endregion
};

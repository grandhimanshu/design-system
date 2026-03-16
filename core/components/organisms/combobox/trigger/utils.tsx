import React from 'react';

export const handleKeyDown = (
  event: React.KeyboardEvent,
  setOpenPopover?: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightFirstItem?: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightLastItem?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  switch (event.key) {
    case 'ArrowUp':
      setOpenPopover?.(true);
      setHighlightLastItem?.(true);
      break;
    case 'ArrowDown':
      setOpenPopover?.(true);
      setHighlightFirstItem?.(true);
      break;
    case 'Escape':
    case 'Tab':
      setOpenPopover?.(false);
      break;
    default:
      break;
  }
};

export const focusListItem = (
  position: string,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  listRef?: any
) => {
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`⚡ focusListItem: position=${position} hasListRef=${!!listRef?.current}`);
  }
  // #endregion
  
  const listItems = listRef.current?.querySelectorAll('[data-test="DesignSystem-Listbox-ItemWrapper"]');
  
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`🔍 focusListItem: found ${listItems?.length || 0} items with data-test="DesignSystem-Listbox-ItemWrapper"`);
  }
  // #endregion
  
  let targetOption;

  if (position === 'down') {
    targetOption = listItems?.[0];
  } else {
    targetOption = listItems[listItems.length - 1];
  }
  
  // #region agent log
  const targetText = (targetOption as HTMLElement)?.textContent?.trim();
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`✅ focusListItem: targeting "${targetText}" exists=${!!targetOption}`);
  }
  // #endregion
  
  (targetOption as HTMLElement)?.focus();

  if (targetOption && typeof targetOption.scrollIntoView === 'function') {
    (targetOption as HTMLElement)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  setFocusedOption && setFocusedOption(targetOption);
  
  // #region agent log - Verify focus landed
  setTimeout(() => {
    const actualFocus = document.activeElement as HTMLElement;
    const actualText = actualFocus?.textContent?.trim();
    const matches = actualFocus === targetOption;
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`🔍 focusListItem verify: activeElement="${actualText}" matches=${matches}`);
    }
  }, 50); // Longer timeout for smooth scroll
  // #endregion
};

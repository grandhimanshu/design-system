import React from 'react';

export const handleKeyDown = (
  event: React.KeyboardEvent,
  setOpenPopover?: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  setHighlightFirstItem?: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightLastItem?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      setOpenPopover?.(true);
      setHighlightLastItem?.(true);
      break;
    case 'ArrowDown':
      event.preventDefault();
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
  const stack = new Error().stack;
  const caller = stack?.split('\n')[2]?.trim();
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`⚡ focusListItem called: position=${position} caller=${caller?.substring(0, 80)}`);
  }
  // #endregion
  
  const listItems = listRef?.current?.querySelectorAll('[data-test="DesignSystem-Listbox-ItemWrapper"]');
  const itemCount = listItems ? listItems.length : 0;
  
  let targetOption;

  if (position === 'down') {
    targetOption = listItems?.[0];
  } else {
    targetOption = listItems?.[listItems.length - 1];
  }
  
  // Focus the parent <li> element (Listbox.Item) which has tabIndex={-1}, not the inner div
  const focusableElement = targetOption?.parentElement as HTMLElement;
  
  // #region agent log
  const targetText = focusableElement?.textContent?.trim();
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`⚡ focusListItem focusing: "${targetText}"`);
  }
  // #endregion
  
  focusableElement?.focus();
  const focusMoved = focusableElement && document.activeElement === focusableElement;

  if (focusableElement && typeof focusableElement.scrollIntoView === 'function') {
    focusableElement.scrollIntoView({ block: 'end' });
  }
  setFocusedOption && setFocusedOption(focusableElement);
};

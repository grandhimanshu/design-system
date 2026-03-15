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
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`focusListItem START: position=${position}, listRefExists=${!!listRef?.current}`);
  }
  // #endregion
  const listItems = listRef?.current?.querySelectorAll('[data-test="DesignSystem-Listbox-ItemWrapper"]');
  const itemCount = listItems ? listItems.length : 0;
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`focusListItem found items: ${itemCount}`);
  }
  // #endregion
  let targetOption;

  if (position === 'down') {
    targetOption = listItems?.[0];
  } else {
    targetOption = listItems?.[listItems.length - 1];
  }
  const hadTarget = !!targetOption;
  
  // Focus the parent <li> element (Listbox.Item) which has tabIndex={-1}, not the inner div
  const focusableElement = targetOption?.parentElement as HTMLElement;
  
  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(`focusListItem about to call focus() on parent <li>: ${focusableElement?.tagName}`);
  }
  // #endregion
  focusableElement?.focus();
  const activeAfter = document.activeElement;
  const focusMoved = focusableElement && activeAfter === focusableElement;

  // #region agent log
  if (typeof window !== 'undefined' && (window as any).addDebugLog) {
    (window as any).addDebugLog(
      `focusListItem RESULT: focusMoved=${focusMoved}, activeAfterTag=${(activeAfter as HTMLElement)?.tagName}, itemCount=${itemCount}`
    );
  }
  // #endregion

  if (focusableElement && typeof focusableElement.scrollIntoView === 'function') {
    focusableElement.scrollIntoView({ block: 'end' });
  }
  setFocusedOption && setFocusedOption(focusableElement);
};

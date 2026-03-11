import React from 'react';
import { getAllFocusableElements } from '@/utils/overlayHelper';

export const handleKeyDown = (
  event: React.KeyboardEvent,
  setOpenPopover?: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  setHighlightFirstItem?: React.Dispatch<React.SetStateAction<boolean>>,
  setHighlightLastItem?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      setOpenPopover?.(true);
      setHighlightFirstItem?.(true);
      break;
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      setOpenPopover?.(true);
      setHighlightFirstItem?.(true);
      break;
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
  if (!listRef?.current) return;

  // Scope to 'menu' role to exclude nested submenu items
  const focusables = getAllFocusableElements(listRef.current, 'menu');
  if (focusables.length === 0) return;

  const targetOption = position === 'down' ? focusables[0] : focusables[focusables.length - 1];

  targetOption.focus({ preventScroll: true });

  if (typeof targetOption.scrollIntoView === 'function') {
    targetOption.scrollIntoView({ block: 'end' });
  }
  setFocusedOption && setFocusedOption(targetOption);
};

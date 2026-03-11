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
  parentListRef?: React.RefObject<HTMLDivElement> | null
) => {
  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      navigateOptions('up', focusedOption, setFocusedOption, listRef);
      break;
    case 'ArrowDown':
      event.preventDefault();
      navigateOptions('down', focusedOption, setFocusedOption, listRef);
      break;
    case 'Home':
      event.preventDefault();
      navigateOptions('first', focusedOption, setFocusedOption, listRef);
      break;
    case 'End':
      event.preventDefault();
      navigateOptions('last', focusedOption, setFocusedOption, listRef);
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
      setOpenPopover?.(false);
      if (triggerRef && !isSubMenuTrigger) {
        triggerRef?.current?.focus();
      } else {
        menuTriggerRef?.current?.focus();
      }
      setFocusedOption?.(undefined);
      break;
    case 'Tab':
      setOpenPopover?.(false);
      break;
    case 'ArrowRight':
      navigateSubMenu(isSubMenuTrigger, 'right', subListRef, menuID, triggerID, parentListRef);
      break;
    case 'ArrowLeft':
      navigateSubMenu(isSubMenuTrigger, 'left', subListRef, menuID, triggerID, parentListRef);
      break;
    default:
      break;
  }
};

const navigateOptions = (
  direction: string,
  focusedOption: Element | undefined,
  setFocusedOption?: React.Dispatch<React.SetStateAction<HTMLElement | undefined>>,
  listRef?: any
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
  parentListRef?: React.RefObject<HTMLDivElement> | null
) => {
  const element = document.querySelector(`[data-name="${menuID}"]`);
  const menuPlacement = element?.getAttribute('data-placement');

  if (isSubMenuTrigger) {
    if (
      (direction === 'right' && menuPlacement?.includes('right')) ||
      (direction === 'left' && menuPlacement?.includes('left'))
    ) {
      if (subListRef?.current) {
        // Scope to 'menu' role for submenu navigation
        const focusables = getAllFocusableElements(subListRef.current, 'menu');
        if (focusables.length > 0) {
          focusables[0].focus({ preventScroll: true });
        }
      }
    }
  } else if (
    (direction === 'left' && menuPlacement?.includes('right')) ||
    (direction === 'right' && menuPlacement?.includes('left'))
  ) {
    const triggerElement = parentListRef?.current?.querySelector(`#${triggerID}`)?.firstChild;
    (triggerElement as HTMLElement)?.focus();
  }
};

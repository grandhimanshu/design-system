import React from 'react';
import { BaseProps } from '@/utils/types';
import { Popover } from '@/index';
import { PopoverProps } from '@/index.type';
import { MenuGroup } from './MenuGroup';
import { MenuItem } from './MenuItem';
import { MenuList } from './MenuList';
import { MenuTrigger } from './trigger/MenuTrigger';
import SubMenu from './SubMenu';
import classNames from 'classnames';
import MenuContext from './MenuContext';
import { focusListItem } from './trigger/utils';
import SubMenuContext from './SubMenuContext';
import { getNextFocusableAfterTrigger } from '@/utils/overlayHelper';
import styles from '@css/components/menu.module.css';

export interface MenuProps extends BaseProps {
  /**
   * Element to be rendered inside `Menu`
   */
  children: React.ReactNode;
  /**
   * Controls open/close of `Menu`
   */
  open?: boolean;
  /**
   * Defines position of `Menu`
   */
  position: PopoverProps['position'];
  /**
   * Defines trigger for the `Menu`
   */
  trigger?: React.ReactElement;
  /**
   * Specifies max height of `Menu`
   */
  maxHeight?: number;
  /**
   * Specifies min height of `Menu`
   */
  minHeight?: number;
  /**
   * Specifies width of `Menu`
   */
  width?: number;
  /**
   * Defines coordinates where you need to position a popover
   */
  triggerCoordinates?: {
    x: number;
    y: number;
  };
  /**
   * Callback after `Menu` is toggled
   */
  onToggle?: (open?: boolean) => void;
  /**
   * Disables the `Menu`
   */
  disabled?: boolean;
}

export const Menu = (props: MenuProps) => {
  const { children, width, minHeight, maxHeight, className, open, onToggle, ...rest } = props;
  const [openPopover, setOpenPopover] = React.useState(open);
  const [highlightFirstItem, setHighlightFirstItem] = React.useState<boolean>(false);
  const [highlightLastItem, setHighlightLastItem] = React.useState<boolean>(false);
  const [focusedOption, setFocusedOption] = React.useState<HTMLElement | undefined>();
  const listRef = React.createRef<HTMLDivElement>();
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
  const isKeyboardNavigating = React.useRef<boolean>(false);
  
  // Shared timestamp for keyboard action grace period (150ms)
  const parentContext = React.useContext(MenuContext);
  const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || React.useRef<number>(0);
  
  const subMenuContextProp = React.useContext(SubMenuContext);

  const { menuID } = subMenuContextProp;

  const popoverClassName = classNames(styles.Menu, className);

  React.useEffect(() => {
    setOpenPopover(open);
  }, [open]);

  React.useEffect(() => {
    // #region agent log
    const listReady = !!listRef.current;
    const itemCount = listRef.current
      ? listRef.current.querySelectorAll('[data-test="DesignSystem-Listbox-ItemWrapper"]').length
      : 0;
    const msg = `Effect highlightFirstItem: highlightFirstItem=${highlightFirstItem}, openPopover=${openPopover}, listReady=${listReady}, itemCount=${itemCount}`;
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(msg);
    }
    // #endregion
    if (highlightFirstItem && openPopover) {
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog('About to call requestAnimationFrame -> focusListItem');
      }
      requestAnimationFrame(() => focusListItem('down', setFocusedOption, listRef));
    }
  }, [highlightFirstItem]);

  React.useEffect(() => {
    if (highlightLastItem && openPopover) {
      requestAnimationFrame(() => focusListItem('up', setFocusedOption, listRef));
    }
  }, [highlightLastItem]);

  React.useEffect(() => {
    if (!openPopover) {
      setHighlightFirstItem(false);
      setHighlightLastItem(false);
    }
    onToggle?.(openPopover);
  }, [openPopover]);

  const onToggleHandler = (open: boolean, type?: string) => {
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      const timeSince = Date.now() - lastKeyboardActionTime.current;
      (window as any).addDebugLog(
        `onToggleHandler: open=${open}, type=${type}, timeSinceKbd=${timeSince}ms`
      );
    }
    // #endregion
    
    // Grace period: Block outsideClick for 150ms after keyboard action
    if (!open && type === 'outsideClick') {
      const timeSinceKeyboard = Date.now() - lastKeyboardActionTime.current;
      if (timeSinceKeyboard < 150) {
        // #region agent log
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`onToggleHandler: BLOCKED outsideClick (${timeSinceKeyboard}ms grace period)`);
        }
        // #endregion
        return;
      }
    }
    
    // Don't close on mouseLeave if focus is within menu (keyboard nav active)
    if (!open && (type === 'mouseLeave' || type === 'onMouseLeave')) {
      const menuElement = listRef.current;
      if (menuElement && menuElement.contains(document.activeElement)) {
        // #region agent log
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog('onToggleHandler: BLOCKED close (mouseLeave but focus within menu)');
        }
        // #endregion
        return;
      }
    }
    
    setOpenPopover(open);
    // Only auto-focus on click/keyboard opens, not hover
    if (open && type !== 'mouseEnter' && type !== 'onMouseEnter') {
      setHighlightFirstItem(true);
    }
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!openPopover || e.key !== 'Tab' || !listRef.current) return;
    const container = listRef.current;
    if (!container.contains(document.activeElement as Node)) return;

    e.preventDefault();
    setOpenPopover(false);

    const nextFocusable = getNextFocusableAfterTrigger(menuTriggerRef.current, e.shiftKey, container);
    if (nextFocusable) {
      nextFocusable.focus({ preventScroll: true });
    } else {
      menuTriggerRef.current?.focus({ preventScroll: true });
    }
  };

  const contextProp = {
    openPopover,
    setOpenPopover,
    setHighlightFirstItem,
    setHighlightLastItem,
    focusedOption,
    setFocusedOption,
    menuTriggerRef,
    listRef,
    isKeyboardNavigating,
    lastKeyboardActionTime,
  };

  return (
    <MenuContext.Provider value={contextProp}>
      <Popover
        data-test="DesignSystem-Menu"
        name={menuID}
        offset="medium"
        {...rest}
        open={openPopover}
        customStyle={{ width }}
        onToggle={onToggleHandler}
      >
        <div
          ref={listRef}
          role="menu"
          tabIndex={-1}
          data-test={props['data-test'] || 'DesignSystem-Menu-Wrapper'}
          className={popoverClassName}
          style={{ maxHeight, minHeight }}
          onKeyDown={handlePopoverKeyDown}
        >
          {children}
        </div>
      </Popover>
    </MenuContext.Provider>
  );
};

Menu.Group = MenuGroup;
Menu.Item = MenuItem;
Menu.List = MenuList;
Menu.Trigger = MenuTrigger;
Menu.SubMenu = SubMenu;

Menu.defaultProps = {
  width: 176,
  maxHeight: 256,
  position: 'bottom-start',
};

export default Menu;

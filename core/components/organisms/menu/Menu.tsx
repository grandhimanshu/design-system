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
  
  // Input mode tracking: 'mouse' or 'keyboard'
  // This is the source of truth for how the menu should behave
  const inputMode = React.useRef<'mouse' | 'keyboard'>('mouse');
  
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

  const setInputModeHandler = React.useCallback((mode: 'mouse' | 'keyboard') => {
    if (inputMode.current !== mode) {
      inputMode.current = mode;
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`setInputMode: switched to ${mode} mode`);
      }
      // #endregion
    }
  }, []);

  const onToggleHandler = (open: boolean, type?: string) => {
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(
        `onToggleHandler: open=${open}, type=${type}, inputMode=${inputMode.current}, isKeyboardNavigating=${isKeyboardNavigating.current}`
      );
    }
    // #endregion
    
    // In keyboard mode: ignore ALL mouse-triggered events
    if (inputMode.current === 'keyboard') {
      const mouseEvents = ['mouseEnter', 'onMouseEnter', 'mouseLeave', 'onMouseLeave', 'outsideClick'];
      if (mouseEvents.includes(type || '')) {
        // #region agent log
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`onToggleHandler: BLOCKED ${type} (keyboard mode active)`);
        }
        // #endregion
        return;
      }
    }
    
    // In mouse mode: block blur if focus is within menu (keyboard fallback)
    if (inputMode.current === 'mouse') {
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
    inputMode,
    setInputMode: setInputModeHandler,
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

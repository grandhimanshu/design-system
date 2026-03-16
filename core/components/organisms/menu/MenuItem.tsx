import React from 'react';
import { BaseProps, BaseHtmlProps } from '@/utils/types';
import { Listbox } from '@/index';
import classNames from 'classnames';
import MenuContext from './MenuContext';
import { handleKeyDown } from './utils';
import SubMenuContext from './SubMenuContext';
import styles from '@css/components/menu.module.css';
import { MenuListContext } from './MenuList';

type ItemTagType = 'li' | 'div' | 'a';

export interface MenuItemProps extends BaseProps, BaseHtmlProps<HTMLLIElement | HTMLDivElement> {
  /**
   * Set a custom element for `Menu List Item`
   */
  tagName?: ItemTagType;
  /**
   * Handler to be called when `Menu List Item` is clicked
   */
  onClick?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  /**
   * React Element to be added inside `Menu List Item`
   */
  children: React.ReactNode;
  /**
   * Disables the menu item
   */
  disabled?: boolean;
  /**
   * Handler to be called when `Menu List Item` is in focus
   */
  onFocus?: (event: React.FocusEvent) => void;
  /**
   * Handler to be called when `Menu List Item` is out of focus
   */
  onBlur?: (event: React.FocusEvent) => void;
}

export const MenuItem = (props: MenuItemProps) => {
  const { children, className, onClick, disabled, onFocus, ...rest } = props;
  const contextProp = React.useContext(MenuContext);
  const subMenuContextProp = React.useContext(SubMenuContext);
  const { size } = React.useContext(MenuListContext);
  const isSubMenuTrigger = false;
  const subListRef = null;

  const { triggerRef, menuID, setParentOpen, triggerID, parentListRef } = subMenuContextProp;

  const { setOpenPopover, focusedOption, setFocusedOption, menuTriggerRef, listRef, isKeyboardNavigating, lastKeyboardActionTime, lastNavigationCall } =
    contextProp;

  const MenuItemClassName = classNames(
    styles['Menu-Item'],
    {
      [styles['Menu-Item--tight']]: size === 'tight',
    },
    className
  );

  React.useEffect(() => {
    if (!triggerID || !parentListRef?.current) return;

    const handlePopoverOpen = () => {
      setOpenPopover?.(true);
    };

    const handlePopoverClose = (event: FocusEvent) => {
      // #region agent log
      const target = event.target as HTMLElement;
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const targetText = target?.textContent?.trim();
      const relatedText = relatedTarget?.textContent?.trim();
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`🔔 Blur on submenu trigger: from="${targetText}" to="${relatedText}" isKeyboardNav=${isKeyboardNavigating?.current}`);
      }
      // #endregion
      
      // Don't close during keyboard navigation
      if (isKeyboardNavigating?.current) {
        // #region agent log
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`🔔 Blur BLOCKED: keyboard navigation in progress`);
        }
        // #endregion
        return;
      }

      if (relatedTarget) {
        // Find the submenu wrapper associated with this trigger
        const triggerElement = parentListRef.current?.querySelector(`#${triggerID}`);

        // Check if focus is moving into the same submenu by checking if relatedTarget
        // is a descendant of any element with the same submenu's aria-controls
        const submenuId = triggerElement?.getAttribute('aria-controls');

        if (submenuId) {
          // Find the submenu popover container
          const submenuPopover = document.querySelector(`[data-name="${submenuId}"]`);

          if (submenuPopover && submenuPopover.contains(relatedTarget)) {
            // Focus moved into the submenu - keep parent menu open
            // #region agent log
            if (typeof window !== 'undefined' && (window as any).addDebugLog) {
              (window as any).addDebugLog(`🔔 Blur BLOCKED: focus moving into submenu`);
            }
            // #endregion
            return;
          }
        }
      }

      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`🔔 Blur CLOSING PARENT MENU via setOpenPopover(false)`);
      }
      // #endregion
      setOpenPopover?.(false);
    };

    const triggerElement = parentListRef.current.querySelector(`#${triggerID}`)?.firstChild;

    triggerElement?.addEventListener('focus', handlePopoverOpen);
    triggerElement?.addEventListener('blur', handlePopoverClose);

    return () => {
      triggerElement?.removeEventListener('focus', handlePopoverOpen);
      triggerElement?.removeEventListener('blur', handlePopoverClose);
    };
  }, [triggerID]);

  const onFocusHandler = (event: React.FocusEvent) => {
    setFocusedOption?.(event.target as HTMLElement);
    setOpenPopover?.(true);
    onFocus?.(event);
  };

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    // #region agent log
    const itemText = (event.currentTarget as HTMLElement)?.textContent?.trim();
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'MenuItem.tsx:onKeyDown',message:'MenuItem key pressed',data:{key:event.key,itemText,triggerID,menuID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    handleKeyDown(
      event,
      focusedOption,
      setFocusedOption,
      setOpenPopover,
      menuTriggerRef,
      listRef,
      subListRef,
      isSubMenuTrigger,
      triggerRef,
      menuID,
      triggerID,
      parentListRef,
      isKeyboardNavigating,
      lastKeyboardActionTime,
      lastNavigationCall // Phase 6: Pass context ref
    );
  };

  const onClickHandler = (event: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) {
      return;
    }
    setOpenPopover?.(false);
    onClick?.(event);
    setParentOpen?.(false);
  };

  const onMouseEnterHandler = (event: React.MouseEvent) => {
    (rest as any).onMouseEnter?.(event);
  };

  const onMouseLeaveHandler = (event: React.MouseEvent) => {
    (rest as any).onMouseLeave?.(event);
  };

  return (
    <Listbox.Item
      data-test="DesignSystem-Menu-ListItem"
      className={MenuItemClassName}
      tabIndex={-1}
      onKeyDown={onKeyDownHandler}
      onFocus={onFocusHandler}
      onClick={onClickHandler}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
      disabled={disabled}
      role="menuitem"
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </Listbox.Item>
  );
};

MenuItem.displayName = 'MenuItem';

MenuItem.defaultProps = {
  tagName: 'a',
};

export default MenuItem;

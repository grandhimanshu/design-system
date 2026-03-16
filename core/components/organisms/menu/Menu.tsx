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
import RootMenuContext from './RootMenuContext';
import { getNextFocusableAfterTrigger } from '@/utils/overlayHelper';
import uidGenerator from '@/utils/uidGenerator';
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
  // Root menu creates the ref ONCE, nested menus inherit it
  const ownKeyboardTimeRef = React.useRef<number>(0);
  const lastKeyboardActionTime = parentContext.lastKeyboardActionTime || ownKeyboardTimeRef;
  
  // Phase 1: Move lastNavigationCall to context (Hypothesis A)
  // Root menu creates the ref ONCE, nested menus inherit it (same pattern as lastKeyboardActionTime)
  const ownNavigationCallRef = React.useRef<{
    key: string;
    triggerID: string | undefined;
    timestamp: number;
  } | null>(null);
  const lastNavigationCall = parentContext.lastNavigationCall || ownNavigationCallRef;
  
  const subMenuContextProp = React.useContext(SubMenuContext);
  const { menuID } = subMenuContextProp;
  
  // Phase 3: Root menu context (Hypothesis D)
  const parentRootContext = React.useContext(RootMenuContext);
  const isRootMenu = parentRootContext.isRootMenu;
  // Use existing uidGenerator instead of React.useId() (React 18+ only)
  const rootMenuID = React.useMemo(() => 
    isRootMenu ? `root-menu-${uidGenerator()}` : parentRootContext.rootMenuID,
    [isRootMenu, parentRootContext.rootMenuID]
  );
  
  // #region agent log
  React.useEffect(() => {
    const logData = {sessionId:'fcaea9',location:'Menu.tsx:mount',message:'Menu mounted',data:{isRootMenu,rootMenuID,menuID,hasParentContext:!!parentContext.menuTriggerRef},timestamp:Date.now(),hypothesisId:'D'};
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify(logData)}).catch(()=>{});
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`Menu mounted: isRoot=${isRootMenu} rootID=${rootMenuID} menuID=${menuID}`);
    }
  }, []);
  // #endregion

  const popoverClassName = classNames(styles.Menu, className);

  React.useEffect(() => {
    setOpenPopover(open);
  }, [open]);

  React.useEffect(() => {
    // #region agent log
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`📍 Effect highlightFirstItem: highlightFirstItem=${highlightFirstItem}, openPopover=${openPopover}`);
    }
    // #endregion
    if (highlightFirstItem && openPopover) {
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
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:onToggle',message:'onToggleHandler called',data:{open,type,timeSinceKbd:Date.now()-lastKeyboardActionTime.current,rootMenuID,menuID},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
    if (typeof window !== 'undefined' && (window as any).addDebugLog) {
      (window as any).addDebugLog(`📍 onToggleHandler: open=${open} type=${type} menuID=${menuID}`);
    }
    // #endregion
    
    // Grace period: Block outsideClick for 150ms after keyboard action
    if (!open && type === 'outsideClick') {
      const timeSinceKeyboard = Date.now() - lastKeyboardActionTime.current;
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`⏱️ onToggle outsideClick check: timeSince=${timeSinceKeyboard}ms lastTime=${lastKeyboardActionTime.current} now=${Date.now()} menuID=${menuID}`);
      }
      // #endregion
      if (timeSinceKeyboard < 150) {
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:onToggle',message:'BLOCKED outsideClick (grace period)',data:{timeSinceKeyboard,menuID},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`📍 onToggle BLOCKED: outsideClick grace period (${timeSinceKeyboard}ms < 150ms)`);
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
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:onToggle',message:'BLOCKED mouseLeave (focus within)',data:{menuID},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`📍 onToggle BLOCKED: mouseLeave but focus within`);
        }
        // #endregion
        return;
      }
    }
    
    setOpenPopover(open);
    // Only auto-focus on click/keyboard opens, not hover
    if (open && type !== 'mouseEnter' && type !== 'onMouseEnter') {
      // #region agent log
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`📍 onToggle: Setting highlightFirstItem=true (will trigger focusListItem)`);
      }
      // #endregion
      setHighlightFirstItem(true);
    }
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Update keyboard timestamp for all menu-level key events
    if (lastKeyboardActionTime) {
      lastKeyboardActionTime.current = Date.now();
    }
    
    if (!openPopover || !listRef.current) return;
    
    // Phase 4: Handle Tab - close ALL menus and focus next after root trigger
    if (e.key === 'Tab') {
      const container = listRef.current;
      if (!container.contains(document.activeElement as Node)) return;

      e.preventDefault();
      
      // #region agent log
      const activeEl = document.activeElement?.textContent?.trim();
      const logData = {sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'Tab pressed in menu',data:{isRootMenu,menuID,rootMenuID,shiftKey:e.shiftKey,activeElement:activeEl,hasSubMenuContext:!!subMenuContextProp.setParentOpen},timestamp:Date.now(),hypothesisId:'D'};
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify(logData)}).catch(()=>{});
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`Tab pressed: isRoot=${isRootMenu} shift=${e.shiftKey} active="${activeEl}"`);
      }
      // #endregion
      
      // Close this menu
      setOpenPopover(false);
      
      // Close all parent menus up to root
      if (subMenuContextProp.setParentOpen) {
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'Closing parent menu via setParentOpen',data:{menuID},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Tab: Closing parent menu`);
        }
        // #endregion
        subMenuContextProp.setParentOpen(false);
      }
      if (parentRootContext.closeRootMenu && !isRootMenu) {
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'Closing root menu via closeRootMenu',data:{menuID,rootMenuID},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Tab: Closing root menu`);
        }
        // #endregion
        parentRootContext.closeRootMenu();
      }

      // Focus next element after ROOT trigger (Hypothesis D)
      const triggerToUse = isRootMenu 
        ? menuTriggerRef.current 
        : parentRootContext.rootTriggerRef?.current;
      
      // #region agent log
      typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'Finding next focusable',data:{isRootMenu,hasTrigger:!!triggerToUse,triggerType:isRootMenu?'local':'root'},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
      if (typeof window !== 'undefined' && (window as any).addDebugLog) {
        (window as any).addDebugLog(`Tab: Finding next focusable, triggerType=${isRootMenu?'local':'root'} hasTrigger=${!!triggerToUse}`);
      }
      // #endregion
      
      const nextFocusable = getNextFocusableAfterTrigger(
        triggerToUse, 
        e.shiftKey, 
        container
      );
      
      if (nextFocusable) {
        // #region agent log
        const nextText = nextFocusable.textContent?.trim();
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'Focusing next element',data:{nextElement:nextText,tagName:nextFocusable.tagName},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Tab: ✅ Focusing next element: "${nextText}" <${nextFocusable.tagName}>`);
        }
        // #endregion
        nextFocusable.focus({ preventScroll: true });
      } else {
        // #region agent log
        typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:Tab',message:'No next element, focusing trigger',data:{hasTrigger:!!triggerToUse},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
        if (typeof window !== 'undefined' && (window as any).addDebugLog) {
          (window as any).addDebugLog(`Tab: ⚠️ No next element found, focusing trigger fallback`);
        }
        // #endregion
        triggerToUse?.focus({ preventScroll: true });
      }
    }
    
    // Phase 2: REMOVED Escape handler - let items handle it (Hypothesis B)
    // Escape is now only handled in utils.tsx to prevent race condition
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
    lastNavigationCall, // Phase 1: Add to context (Hypothesis A)
  };
  
  // Phase 3: Root menu context value (Hypothesis D)
  const rootMenuContextValue = isRootMenu
    ? {
        rootTriggerRef: menuTriggerRef,
        closeRootMenu: () => {
          // #region agent log
          typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'Menu.tsx:closeRootMenu',message:'closeRootMenu called',data:{rootMenuID},timestamp:Date.now(),hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          setOpenPopover(false);
        },
        isRootMenu: false, // Children will know they're nested
        rootMenuID,
      }
    : parentRootContext; // Nested menus inherit root context

  return (
    <RootMenuContext.Provider value={rootMenuContextValue}>
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
    </RootMenuContext.Provider>
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

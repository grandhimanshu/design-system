import React from 'react';
import MenuContext from './MenuContext';
import { handleKeyDown } from './utils';
import uidGenerator from '@/utils/uidGenerator';
import SubMenuContext from './SubMenuContext';

export interface SubMenuProps {
  /**
   * Element to be rendered inside `SubMenu`
   * <br/>
   * First child will be consider as `trigger`,
   * <br />
   * whereas second children content will be displayed inside `SubMenu`
   */
  children: React.ReactNode;
}

export const SubMenu = (props: SubMenuProps) => {
  const { children } = props;
  const menuID = `DesignSystem-Menu--Popover-${uidGenerator()}`;
  const triggerID = `DesignSystem-Menu--Trigger-${uidGenerator()}`;

  const [submenuTrigger, submenuContent] = React.Children.toArray(children);
  const contextProp = React.useContext(MenuContext);
  const parentSubMenuContext = React.useContext(SubMenuContext); // Get parent submenu's context
  const subListRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const isSubMenuTrigger = true;

  let subMenuElement = <></>;

  const { setOpenPopover, focusedOption, setFocusedOption, menuTriggerRef, listRef, isKeyboardNavigating, lastKeyboardActionTime, lastNavigationCall } =
    contextProp;

  const onKeyDownHandler = (event: React.KeyboardEvent) => {
    // #region agent log
    const triggerText = (event.currentTarget as HTMLElement)?.textContent?.trim();
    typeof fetch === 'function' && fetch('http://127.0.0.1:7740/ingest/a079587f-b583-4696-8c0d-1727ae7ce7c2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'fcaea9'},body:JSON.stringify({sessionId:'fcaea9',location:'SubMenu.tsx:onKeyDown',message:'SubMenu trigger key pressed',data:{key:event.key,triggerText,menuID,parentTriggerID:parentSubMenuContext.triggerID},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
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
      parentSubMenuContext.triggerID, // Pass parent's triggerID
      parentSubMenuContext.parentListRef, // Pass parent's listRef
      isKeyboardNavigating,
      lastKeyboardActionTime,
      lastNavigationCall // Phase 6: Pass context ref
    );
  };

  const subMenuContextProp = {
    triggerRef,
    menuID,
    setParentOpen: setOpenPopover,
    parentListRef: listRef,
    triggerID,
  };

  const triggerElement = React.cloneElement(submenuTrigger as React.ReactElement, {
    ...(submenuTrigger as React.ReactElement)?.props,
    onKeyDown: onKeyDownHandler,
    ref: triggerRef,
    'aria-haspopup': 'menu',
    'aria-expanded': subListRef.current ? 'true' : 'false',
    'aria-controls': menuID,
    id: triggerID,
  });

  if (React.isValidElement(submenuContent)) {
    const { on, children } = submenuContent?.props;
    subMenuElement = React.cloneElement(submenuContent as React.ReactElement, {
      ...submenuContent.props,
      on: on || 'hover',
      offset: 'small',
      children: <div ref={subListRef}>{children}</div>,
      trigger: triggerElement,
    });
  }

  return <SubMenuContext.Provider value={subMenuContextProp}>{subMenuElement}</SubMenuContext.Provider>;
};

export default SubMenu;

import * as React from 'react';
import classNames from 'classnames';
import { Icon } from '@/index';
import { ListboxItemProps } from './ListboxItem';
import { ListboxContext } from '../Listbox';
import { useDraggableListKeyboardContext } from '../reorderList/DraggableListKeyboardContext';
import styles from '@css/components/listbox.module.css';

export const ListBody = (props: ListboxItemProps & React.HTMLAttributes<HTMLDivElement>) => {
  const {
    children,
    className,
    disabled,
    selected,
    activated,
    onKeyDown: incomingKeyDown,
    tabIndex: incomingTabIndex,
    reorderRowIndex,
    ...rest
  } = props;

  const contextProp = React.useContext(ListboxContext);
  const { size, type, draggable } = contextProp;
  const reorderKb = useDraggableListKeyboardContext();

  const isDraggableKeyboardRow = Boolean(draggable && reorderRowIndex !== undefined && reorderKb);

  const resolvedTabIndex = isDraggableKeyboardRow
    ? reorderKb!.getRowTabIndex(reorderRowIndex!)
    : incomingTabIndex ?? -1;

  const resolvedOnKeyDown = isDraggableKeyboardRow
    ? (e: React.KeyboardEvent<HTMLDivElement>) => reorderKb!.onRowKeyDown(reorderRowIndex!, e)
    : incomingKeyDown;

  const itemClass = classNames(
    {
      [styles['Listbox-item']]: true,
      [styles[`Listbox-item--${size}`]]: size,
      [styles[`Listbox-item--${type}`]]: type,
      [styles['Listbox-item--disabled']]: disabled,
      [styles['Listbox-item--selected']]: selected && type === 'option',
      [styles['Listbox-item--activated']]: activated && type === 'resource',
    },
    className
  );

  const role = rest.role ?? 'option';
  const defaultAriaSelected = role === 'option' ? Boolean(selected) : undefined;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- APG listbox option row (roving tabindex)
    <div
      data-disabled={disabled}
      data-test="DesignSystem-Listbox-ItemWrapper"
      className={itemClass}
      aria-selected={rest['aria-selected'] ?? defaultAriaSelected}
      {...rest}
      aria-disabled={disabled ? true : undefined}
      tabIndex={resolvedTabIndex}
      onKeyDown={resolvedOnKeyDown}
    >
      {draggable && reorderRowIndex !== undefined && reorderKb ? (
        <button
          type="button"
          data-test="DesignSystem-Listbox-DragIcon"
          className={styles['Listbox-item--drag-icon']}
          tabIndex={reorderKb.getHandleTabIndex(reorderRowIndex)}
          aria-label="Reorder item"
          aria-grabbed={reorderKb.ariaGrabbedOnHandle(reorderRowIndex)}
          onFocus={() => reorderKb.onHandleFocus(reorderRowIndex)}
          onKeyDown={(e) => reorderKb.onHandleKeyDown(reorderRowIndex, e)}
        >
          <Icon size={16} appearance="subtle" name="drag_indicator" aria-hidden="true" />
        </button>
      ) : draggable ? (
        <Icon
          size={16}
          appearance="subtle"
          name="drag_indicator"
          className={styles['Listbox-item--drag-icon']}
          data-test="DesignSystem-Listbox-DragIcon"
        />
      ) : null}
      {children}
    </div>
  );
};

ListBody.displayName = 'ListBody';

export default ListBody;

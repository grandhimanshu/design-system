import React from 'react';
import { extractBaseProps } from '@/utils/types';
import Draggable from './Draggable';
import { arrayMove } from './utils';
import { ListboxInternalProps } from '../Listbox';
import classNames from 'classnames';
import styles from '@css/components/listbox.module.css';

export const DraggableList = (props: ListboxInternalProps) => {
  const { children, className, tagName: Tag, size, type, draggable, showDivider, ...rest } = props;
  const baseProps = extractBaseProps(props);

  const classes = classNames(styles.Listbox, className);

  const renderChildren = React.Children.toArray(children).map((child: any) => {
    const element = React.cloneElement(child, { parentProps: { ...props } });
    return element;
  });

  const [childList, setChildList] = React.useState(renderChildren);

  React.useEffect(() => {
    setChildList((prevList) => {
      const newChildrenMap = new Map();
      renderChildren.forEach((child: any) => {
        if (child.key) newChildrenMap.set(child.key, child);
      });

      const updatedList = prevList
        .map((child: any) => newChildrenMap.get(child.key) || child)
        .filter((child: any) => newChildrenMap.has(child.key));

      const prevKeys = new Set(prevList.map((c: any) => c.key));
      renderChildren.forEach((child: any) => {
        if (child.key && !prevKeys.has(child.key)) {
          updatedList.push(child);
        }
      });

      return updatedList.length > 0 ? updatedList : renderChildren;
    });
  }, [children]);

  const onChangeHandler = (props: any) => {
    const { oldIndex, newIndex } = props;
    const updatedList = arrayMove(childList, oldIndex, newIndex);

    setChildList(updatedList);
  };

  return (
    <Draggable
      values={childList}
      listType={type}
      onChange={onChangeHandler}
      renderItem={({ value, props, isDragged, isSelected }) => {
        const itemClasses = classNames(styles['Listbox-item--draggable'], {
          [styles['Listbox-item--drag-picked']]: isDragged,
          [styles['Listbox-item--sticky-picked']]: isSelected,
          [styles['Listbox-item--description-draggable']]: type === 'description',
        });
        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            {...props}
            onKeyDown={(e) => {
              if (props.onKeyDown) props.onKeyDown(e as any);
              if (type === 'description' && !e.defaultPrevented && (e.key === 'Enter' || e.key === ' ')) {
                const listBody = e.currentTarget.querySelector(
                  '[data-test="DesignSystem-Listbox-ItemWrapper"]'
                ) as HTMLElement;
                if (listBody) {
                  listBody.click();
                  e.preventDefault();
                }
              }
            }}
            className={itemClasses}
            tabIndex={-1}
          >
            {value}
          </div>
        );
      }}
      renderList={({ children, props: dragProps }) => (
        <Tag data-test="DesignSystem-Listbox" {...baseProps} className={classes} tabIndex={-1} {...rest} {...dragProps}>
          {children}
        </Tag>
      )}
    />
  );
};

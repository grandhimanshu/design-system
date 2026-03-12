import * as React from 'react';
import { Listbox } from '@/index';
import { BaseProps } from '@/utils/types';
import { TListboxSize } from '@/common.type';
import ComboboxContext from './ComboboxContext';

type TagType = 'ul' | 'ol' | 'div' | 'nav';

export interface ComboboxListProps extends BaseProps {
  /**
   * React Element to be added inside `list`
   */
  children: React.ReactNode;
  /**
   * List size
   */
  size: TListboxSize;
  /**
   * Set a custom element for Listbox
   */
  tagName: TagType;
  /**
   * Add divider below all list item
   */
  showDivider: boolean;
}

export const ComboboxList = (props: ComboboxListProps) => {
  const { multiSelect } = React.useContext(ComboboxContext);

  return (
    <Listbox
      className="py-3"
      keyboardConfig={{ role: 'listbox', selectionKeepsOpen: multiSelect }}
      {...props}
      role="listbox"
    >
      {props.children}
    </Listbox>
  );
};

ComboboxList.defaultProps = {
  type: 'option',
  showDivider: false,
  tagName: 'ul',
  size: 'compressed',
};

export default ComboboxList;

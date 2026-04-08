import * as React from 'react';

export type DraggableFocusSegment = 'row' | 'handle';

export type DraggableListType = 'option' | 'description' | 'resource';

export interface DraggableListKeyboardContextValue {
  listType: DraggableListType;
  getRowTabIndex: (rowIndex: number) => number;
  getHandleTabIndex: (rowIndex: number) => number;
  onRowFocus: (rowIndex: number) => void;
  onHandleFocus: (rowIndex: number) => void;
  onRowKeyDown: (rowIndex: number, e: React.KeyboardEvent) => void;
  onHandleKeyDown: (rowIndex: number, e: React.KeyboardEvent) => void;
  ariaGrabbedOnHandle: (rowIndex: number) => boolean | undefined;
}

export const DraggableListKeyboardContext = React.createContext<DraggableListKeyboardContextValue | null>(null);

export function useDraggableListKeyboardContext() {
  return React.useContext(DraggableListKeyboardContext);
}

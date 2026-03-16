import * as React from 'react';

export type RootMenuContextProps = {
  // Root trigger ref for Tab escape
  rootTriggerRef?: React.RefObject<HTMLButtonElement>;
  // Callback to close entire menu hierarchy
  closeRootMenu?: () => void;
  // Whether this is the root menu (not nested)
  isRootMenu: boolean;
  // Root menu ID for tracking
  rootMenuID?: string;
};

export const RootMenuContext = React.createContext<RootMenuContextProps>({
  isRootMenu: true,
});

export default RootMenuContext;

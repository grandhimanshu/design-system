import React from 'react';
import { Menu, Icon } from '@/index';
import { DebugLogPanel, addDebugLog } from './DebugLogPanel';

// Expose addDebugLog globally for Menu component
if (typeof window !== 'undefined') {
  window.addDebugLog = addDebugLog;
}

export const nesting = () => {
  return (
    <>
      <DebugLogPanel />
      <Menu trigger={<Menu.Trigger />}>
      <Menu.List>
        <Menu.Item>App Store</Menu.Item>
        <Menu.Item>Developer Portal</Menu.Item>

        <Menu.SubMenu>
          <Menu.Item className="d-flex align-items-center justify-content-between w-100">
            System Admin
            <Icon name="chevron_right" />
          </Menu.Item>
          <Menu position="right-start">
            <Menu.List>
              <Menu.Item>Settings</Menu.Item>

              <Menu.SubMenu>
                <Menu.Item className="d-flex align-items-center justify-content-between w-100">
                  User Management
                  <Icon name="chevron_right" />
                </Menu.Item>
                <Menu position="right-start">
                  <Menu.List>
                    <Menu.Item>Users</Menu.Item>
                    <Menu.Item>Groups</Menu.Item>
                    <Menu.Item>Roles</Menu.Item>
                  </Menu.List>
                </Menu>
              </Menu.SubMenu>
            </Menu.List>
          </Menu>
        </Menu.SubMenu>

        <Menu.Item>Reports</Menu.Item>

        <Menu.SubMenu>
          <Menu.Item className="d-flex align-items-center justify-content-between w-100">
            Analytics
            <Icon name="chevron_right" />
          </Menu.Item>
          <Menu position="right-start">
            <Menu.List>
              <Menu.Item>Dashboard</Menu.Item>
              <Menu.Item>Metrics</Menu.Item>
              <Menu.Item>Logs</Menu.Item>
            </Menu.List>
          </Menu>
        </Menu.SubMenu>
      </Menu.List>
    </Menu>
    </>
  );
};

const customCode = `
() => {

  return (
    <Menu trigger={<Menu.Trigger />}>
      <Menu.List>
        <Menu.Item>App Store</Menu.Item>
        <Menu.Item>Developer Portal</Menu.Item>

        <Menu.SubMenu>
          <Menu.Item className="d-flex align-items-center justify-content-between w-100">
            System Admin
            <Icon name="chevron_right" />
          </Menu.Item>
          <Menu position="right-start">
            <Menu.List>
              <Menu.Item>Settings</Menu.Item>

              <Menu.SubMenu>
                <Menu.Item className="d-flex align-items-center justify-content-between w-100">
                  User Management
                  <Icon name="chevron_right" />
                </Menu.Item>
                <Menu position="right-start">
                  <Menu.List>
                    <Menu.Item>Users</Menu.Item>
                    <Menu.Item>Groups</Menu.Item>
                    <Menu.Item>Roles</Menu.Item>
                  </Menu.List>
                </Menu>
              </Menu.SubMenu>
            </Menu.List>
          </Menu>
        </Menu.SubMenu>

        <Menu.Item>Reports</Menu.Item>

        <Menu.SubMenu>
          <Menu.Item className="d-flex align-items-center justify-content-between w-100">
            Analytics
            <Icon name="chevron_right" />
          </Menu.Item>
          <Menu position="right-start">
            <Menu.List>
              <Menu.Item>Dashboard</Menu.Item>
              <Menu.Item>Metrics</Menu.Item>
              <Menu.Item>Logs</Menu.Item>
            </Menu.List>
          </Menu>
        </Menu.SubMenu>
      </Menu.List>
    </Menu>
  );
}
`;

export default {
  title: 'Components/Menu/Nesting',
  component: Menu,
  subcomponents: {
    'Menu.Trigger': Menu.Trigger,
    'Menu.Group': Menu.Group,
    'Menu.List': Menu.List,
    'Menu.Item': Menu.Item,
    'Menu.SubMenu': Menu.SubMenu,
  },
  parameters: {
    docs: {
      docPage: {
        title: 'Menu',
        customCode,
      },
    },
  },
};

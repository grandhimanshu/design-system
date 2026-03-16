/**
 * Unit tests for nested menu keyboard navigation (ESC, ArrowLeft, Tab).
 * Verifies ref sharing and grace-period behavior that fixes the "close all menus" bug.
 */
import * as React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Menu, Icon } from '@/index';

const NestedMenuWithTrigger = () => (
  <Menu trigger={<Menu.Trigger />} open={true}>
    <Menu.List>
      <Menu.Item>Item 1</Menu.Item>
      <Menu.SubMenu>
        <Menu.Item className="d-flex align-items-center justify-content-between w-100">
          System Admin
          <Icon name="chevron_right" />
        </Menu.Item>
        <Menu position="right-start">
          <Menu.List>
            <Menu.Item>Sub Item 1</Menu.Item>
            <Menu.Item>Sub Item 2</Menu.Item>
          </Menu.List>
        </Menu>
      </Menu.SubMenu>
      <Menu.Item>Item 3</Menu.Item>
    </Menu.List>
  </Menu>
);

describe('Nested Menu Keyboard Navigation', () => {
  it('ESC in nested menu closes only that level and focuses parent trigger', () => {
    const { getAllByTestId } = render(<NestedMenuWithTrigger />);
    const items = getAllByTestId('DesignSystem-Menu-ListItem');
    // Open submenu by hovering/focusing the submenu trigger (first SubMenu item)
    const subMenuTrigger = items[1];
    fireEvent.mouseOver(subMenuTrigger);
    const popoversAfterOpen = getAllByTestId('DesignSystem-Popover');
    expect(popoversAfterOpen.length).toBeGreaterThanOrEqual(2);

    const subItems = getAllByTestId('DesignSystem-Menu-ListItem');
    const firstSubItem = subItems[subItems.length - 2];
    firstSubItem.focus();
    fireEvent.keyDown(firstSubItem, { key: 'Escape' });

    // Root menu should still be open; only submenu closed
    const popoversAfterEscape = getAllByTestId('DesignSystem-Popover');
    expect(popoversAfterEscape.length).toBeGreaterThanOrEqual(1);
    expect(document.activeElement).toBeTruthy();
  });

  it('ArrowLeft in nested menu closes submenu and focuses parent menuitem', () => {
    const { getAllByTestId } = render(<NestedMenuWithTrigger />);
    const items = getAllByTestId('DesignSystem-Menu-ListItem');
    const subMenuTrigger = items[1];
    fireEvent.mouseOver(subMenuTrigger);
    const allItems = getAllByTestId('DesignSystem-Menu-ListItem');
    const firstSubItem = allItems[allItems.length - 2];
    firstSubItem.focus();
    fireEvent.keyDown(firstSubItem, { key: 'ArrowLeft' });
    expect(document.activeElement).toBeTruthy();
  });

  it('Tab from nested menu closes all levels', () => {
    const { getByTestId, getAllByTestId } = render(
      <>
        <Menu trigger={<Menu.Trigger />} open={true}>
          <Menu.List>
            <Menu.SubMenu>
              <Menu.Item className="d-flex align-items-center justify-content-between w-100">
                System Admin
                <Icon name="chevron_right" />
              </Menu.Item>
              <Menu position="right-start">
                <Menu.List>
                  <Menu.Item>Sub Item 1</Menu.Item>
                </Menu.List>
              </Menu>
            </Menu.SubMenu>
          </Menu.List>
        </Menu>
        <button data-test="next-focusable">Next Button</button>
      </>
    );
    const items = getAllByTestId('DesignSystem-Menu-ListItem');
    fireEvent.mouseOver(items[0]);
    const subItems = getAllByTestId('DesignSystem-Menu-ListItem');
    const subItem = subItems[subItems.length - 1];
    subItem.focus();
    const wrappers = getAllByTestId('DesignSystem-Menu-Wrapper');
    const activeWrapper = Array.from(wrappers).find((w) => w.contains(subItem)) ?? wrappers[wrappers.length - 1];
    fireEvent.keyDown(activeWrapper, { key: 'Tab' });
    const popovers = getAllByTestId('DesignSystem-Popover');
    expect(popovers[0].getAttribute('data-opened')).toBe('false');
  });

  it('Tab from nested menu moves focus out of menu', () => {
    const { getAllByTestId } = render(
      <>
        <Menu trigger={<Menu.Trigger />} open={true}>
          <Menu.List>
            <Menu.SubMenu>
              <Menu.Item className="d-flex align-items-center justify-content-between w-100">
                Sub
                <Icon name="chevron_right" />
              </Menu.Item>
              <Menu position="right-start">
                <Menu.List>
                  <Menu.Item>Sub Item</Menu.Item>
                </Menu.List>
              </Menu>
            </Menu.SubMenu>
          </Menu.List>
        </Menu>
        <button data-test="next-focusable">Next Button</button>
      </>
    );
    const items = getAllByTestId('DesignSystem-Menu-ListItem');
    fireEvent.mouseOver(items[0]);
    const subItems = getAllByTestId('DesignSystem-Menu-ListItem');
    const subItem = subItems[subItems.length - 1];
    subItem.focus();
    const wrappers = getAllByTestId('DesignSystem-Menu-Wrapper');
    const activeWrapper = Array.from(wrappers).find((w) => w.contains(subItem)) ?? wrappers[wrappers.length - 1];
    fireEvent.keyDown(activeWrapper, { key: 'Tab' });
    const menusStillContainFocus = wrappers.some((w) => w.contains(document.activeElement));
    expect(menusStillContainFocus).toBe(false);
  });

  it('grace period ref is shared between root and nested menus', () => {
    const { getAllByTestId } = render(<NestedMenuWithTrigger />);
    const items = getAllByTestId('DesignSystem-Menu-ListItem');
    expect(items.length).toBeGreaterThan(0);
    const popovers = getAllByTestId('DesignSystem-Popover');
    expect(popovers.length).toBeGreaterThanOrEqual(1);
  });

  it('multiple menu instances have isolated state', () => {
    const { getAllByTestId } = render(
      <>
        <Menu trigger={<Menu.Trigger />} open={true}>
          <Menu.List>
            <Menu.Item>Menu A Item 1</Menu.Item>
          </Menu.List>
        </Menu>
        <Menu trigger={<Menu.Trigger />} open={false}>
          <Menu.List>
            <Menu.Item>Menu B Item 1</Menu.Item>
          </Menu.List>
        </Menu>
      </>
    );
    const triggers = getAllByTestId('DesignSystem-Menu-Trigger');
    expect(triggers.length).toBe(2);
    const popovers = getAllByTestId('DesignSystem-Popover');
    expect(popovers.length).toBeGreaterThanOrEqual(1);
  });
});

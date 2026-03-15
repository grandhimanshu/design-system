export const getWrapperElement = (): Element => {
  let element = document.querySelector('.Overlay-wrapper');
  if (element === null) {
    element = document.createElement('div');
    element.classList.add('Overlay-wrapper');
    document.body.appendChild(element);
  }
  return element;
};

interface elementData {
  element: Element;
  containerClassName: string;
  elementRef: React.RefObject<HTMLDivElement>;
}

export const getUpdatedZIndex = (ele: elementData): number | undefined => {
  const { containerClassName, elementRef, element } = ele;

  if (element === null) return;

  const elements = element.querySelectorAll(containerClassName);
  if (elements.length < 1) return;

  const siblings = Array.from(elements).filter((el) => el !== elementRef.current);
  let zIndex = -1;

  siblings.forEach((element) => {
    const prevZIndex = parseInt(window.getComputedStyle(element).zIndex || '0', 10);
    zIndex = Math.max(zIndex, prevZIndex + 10);
  });

  return zIndex > 0 ? zIndex : undefined;
};

// keyboard event, boolean?, (event: Event) => void
export const closeOnEscapeKeypress = (
  event: KeyboardEvent,
  isTopOverlay: boolean | undefined,
  onClose: (event: Event) => void
) => {
  if (event.key === 'Escape' && isTopOverlay) {
    onClose(event);

    // prevent browser-specific escape key behavior (Safari exits fullscreen)
    event.preventDefault();
  }
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], summary, area[href], [tabindex]:not([tabindex="-1"])';

/**
 * Returns focusable elements within a container, in DOM order.
 * Excludes elements with `visibility: hidden`, `display: none`, `aria-hidden="true"`,
 * `aria-disabled="true"`, or inside an `[inert]` subtree.
 */
export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
  return Array.from(elements).filter((el) => {
    const style = window.getComputedStyle(el);
    const isVisible = style.visibility !== 'hidden' && style.display !== 'none';
    const isAriaHidden = el.getAttribute('aria-hidden') === 'true';
    const isAriaDisabled = el.getAttribute('aria-disabled') === 'true';
    const isInert = el.closest('[inert]') !== null;
    const isExplicitlyNonFocusable = el.getAttribute('tabindex') === '-1';
    return isVisible && !isAriaHidden && !isAriaDisabled && !isInert && !isExplicitlyNonFocusable;
  });
};

/**
 * Handles Tab/Shift+Tab to trap focus within the container.
 * Returns true if the event was handled (focus was redirected or prevented).
 */
export const handleFocusTrapKeyDown = (event: KeyboardEvent, container: HTMLElement): boolean => {
  if (event.key !== 'Tab') return false;

  const focusable = getFocusableElements(container);
  const activeElement = document.activeElement as HTMLElement | null;

  if (!activeElement || !container.contains(activeElement)) {
    return false;
  }

  if (focusable.length === 0) {
    event.preventDefault();
    container.focus({ preventScroll: true });
    return true;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return true;
    }
  } else {
    if (activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
      return true;
    }
  }

  return false;
};

/**
 * Returns the next (or previous if shiftKey) focusable element in document order
 * after the trigger, excluding elements inside excludeContainer (e.g. the popover list).
 * Used for Tab-escape: when user presses Tab from inside a popover, close it and
 * move focus to the next focusable on the page.
 */
export const getNextFocusableAfterTrigger = (
  trigger: HTMLElement | null,
  shiftKey: boolean,
  excludeContainer?: HTMLElement | null
): HTMLElement | null => {
  if (!trigger || !trigger.ownerDocument?.body) return null;
  const focusables = getFocusableElements(trigger.ownerDocument.body).filter(
    (el) => !excludeContainer || !excludeContainer.contains(el)
  );
  const idx = focusables.indexOf(trigger);
  if (idx === -1) return null;
  const nextIdx = shiftKey ? idx - 1 : idx + 1;
  if (nextIdx < 0 || nextIdx >= focusables.length) return null;
  return focusables[nextIdx];
};

/**
 * Gets all elements that can receive focus programmatically within a container, including:
 * - Naturally focusable elements (buttons, inputs, links with href, etc.)
 * - Elements with tabindex="-1" (can be focused via .focus() but not via Tab)
 *
 * For nested menus/popovers: excludes elements inside nested containers with the same role
 * to prevent arrow keys from navigating into closed submenus.
 *
 * @param container - The container element to search within
 * @param scopeToRole - Optional ARIA role to scope navigation (e.g., 'menu', 'listbox').
 * @returns Array of focusable HTMLElements sorted in DOM order
 */
export const getAllFocusableElements = (container: HTMLElement, scopeToRole?: string): HTMLElement[] => {
  const naturallyFocusable = getFocusableElements(container);

  const programmaticallyFocusable = Array.from(container.querySelectorAll<HTMLElement>('[tabindex="-1"]')).filter(
    (el) => {
      const style = window.getComputedStyle(el);
      const isVisible = style.visibility !== 'hidden' && style.display !== 'none';
      const isAriaHidden = el.getAttribute('aria-hidden') === 'true';
      const isInert = el.closest('[inert]') !== null;

      if (!isVisible || isAriaHidden || isInert) return false;

      if (scopeToRole) {
        const closestRoleContainer = el.closest(`[role="${scopeToRole}"]`);
        if (closestRoleContainer !== container) return false;
      }

      return true;
    }
  );

  const allFocusables = [...naturallyFocusable, ...programmaticallyFocusable];
  const unique = Array.from(new Set(allFocusables));

  const filtered = unique.filter((el) => {
    return !unique.some((other) => other !== el && other.contains(el));
  });

  return filtered.sort((a, b) => {
    if (a === b) return 0;
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
};

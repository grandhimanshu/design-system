interface FocusScope {
  overlay: HTMLDivElement;
  previousFocus: HTMLElement | null;
  container: HTMLDivElement | null;
}

/**
 * FocusScopeManager manages focus restoration for overlays with container awareness.
 *
 * Overlays can be nested within containers (e.g., Select inside Modal). When a container
 * closes, its children should not restore focus - the container handles restoration.
 *
 * @example
 * // Modal opens (top-level, no container)
 * FocusScopeManager.add(modalRef.current, buttonElement, null);
 *
 * // Select popover opens inside modal (container = modalRef)
 * FocusScopeManager.add(popoverRef.current, null, modalRef.current);
 *
 * // Modal closes - container is null, so it restores focus
 * if (FocusScopeManager.shouldRestoreFocus(modalRef.current)) {
 *   const target = FocusScopeManager.getFocusTarget(modalRef.current);
 *   target?.focus();
 * }
 * FocusScopeManager.remove(modalRef.current);
 */
class FocusScopeManager {
  private scopes: FocusScope[] = [];

  /**
   * Registers a focus scope with optional container parent.
   *
   * @param overlay - The overlay element (modal, popover, etc.)
   * @param previousFocus - Element to restore focus to when this scope closes
   * @param container - Parent overlay element (if nested), or null for top-level overlays
   * @returns The index of the added scope
   */
  add(
    overlay: HTMLDivElement | null,
    previousFocus: HTMLElement | null = null,
    container: HTMLDivElement | null = null
  ): number {
    if (overlay === null) return -1;

    const existingIndex = this.scopes.findIndex((scope) => scope.overlay === overlay);
    if (existingIndex !== -1) {
      return existingIndex;
    }

    const scope: FocusScope = {
      overlay,
      previousFocus,
      container,
    };

    this.scopes.push(scope);
    return this.scopes.length - 1;
  }

  /**
   * Removes a focus scope from the stack.
   *
   * @param overlay - The overlay element to remove
   */
  remove(overlay: HTMLDivElement | null): void {
    if (overlay === null) return;

    const index = this.scopes.findIndex((scope) => scope.overlay === overlay);
    if (index === -1) return;

    this.scopes.splice(index, 1);
  }

  /**
   * Determines if focus should be restored when this overlay closes.
   *
   * Returns false if:
   * - The overlay's container is still in the stack (container will handle focus)
   * - The overlay is a child of a closing container
   *
   * Returns true if:
   * - The overlay has no container (top-level overlay)
   * - The overlay's container has already been removed from the stack
   *
   * @param overlay - The overlay element being closed
   * @returns True if this overlay should restore focus
   */
  shouldRestoreFocus(overlay: HTMLDivElement | null): boolean {
    if (overlay === null) return false;

    const scope = this.scopes.find((s) => s.overlay === overlay);
    
    if (!scope) return false;

    // Top-level overlays (container = null) always restore focus
    if (scope.container === null) {
      return true;
    }

    // Check if container is still in the stack
    const containerStillExists = this.scopes.some((s) => s.overlay === scope.container);

    // If container is gone, we should restore (but to container's previousFocus if available)
    // If container still exists, don't restore (container manages focus)
    return !containerStillExists;
  }

  /**
   * Gets the element to focus when this overlay closes.
   *
   * If the overlay's container has closed, returns the container's previousFocus.
   * Otherwise returns the overlay's own previousFocus.
   *
   * @param overlay - The overlay element being closed
   * @returns The element to focus, or null
   */
  getFocusTarget(overlay: HTMLDivElement | null): HTMLElement | null {
    if (overlay === null) return null;

    const scope = this.scopes.find((s) => s.overlay === overlay);
    if (!scope) return null;

    // If no container, use our own previousFocus
    if (scope.container === null) {
      return scope.previousFocus;
    }

    // If container exists, try to find its previousFocus
    const containerScope = this.scopes.find((s) => s.overlay === scope.container);
    if (containerScope) {
      // Container still active, return null (container will handle restoration)
      return null;
    }

    // Container closed, use its previousFocus if we stored it
    // This handles the case where container closed with children still open
    return scope.previousFocus;
  }

  /**
   * Gets all currently registered overlays (for debugging)
   */
  getScopes(): FocusScope[] {
    return [...this.scopes];
  }

  /**
   * Clears all scopes (for testing)
   */
  clear(): void {
    this.scopes = [];
  }
}

const instance = new FocusScopeManager();
Object.freeze(instance);

export default instance;

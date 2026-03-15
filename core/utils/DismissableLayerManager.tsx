/**
 * DismissableLayerManager manages z-index ordering and Escape key routing for overlays.
 *
 * Separate from FocusScopeManager - this handles:
 * - Z-index stacking order
 * - Determining which overlay is topmost for Escape key handling
 * - LIFO (Last In First Out) dismissal order
 *
 * Does NOT handle focus restoration (see FocusScopeManager for that).
 */
class DismissableLayerManager {
  overlays: HTMLDivElement[];

  constructor() {
    this.overlays = [];
  }

  /**
   * Adds an overlay to the dismissable layer stack.
   *
   * @param overlay - The overlay element to add
   * @returns The index of the added overlay
   */
  add(overlay: HTMLDivElement | null): number {
    if (overlay === null) return -1;

    let overlayIdx = this.overlays.indexOf(overlay);

    if (overlayIdx !== -1) {
      return overlayIdx;
    }

    overlayIdx = this.overlays.length;
    this.overlays.push(overlay);

    return overlayIdx;
  }

  /**
   * Removes an overlay from the dismissable layer stack.
   *
   * @param overlay - The overlay element to remove
   */
  remove(overlay: HTMLDivElement | null): void {
    if (overlay === null) return;

    const overlayIdx = this.overlays.indexOf(overlay);

    if (overlayIdx === -1) {
      return;
    }

    this.overlays.splice(overlayIdx, 1);
  }

  /**
   * Checks if the given overlay is the topmost dismissable layer.
   * Used to determine if an overlay should handle Escape key events.
   *
   * @param overlay - The overlay element to check
   * @returns True if this overlay is topmost
   */
  isTopOverlay(overlay: HTMLDivElement | null): boolean {
    if (overlay === null) return false;

    return !!this.overlays.length && this.overlays[this.overlays.length - 1] === overlay;
  }

  /**
   * Gets all currently registered overlays (for debugging)
   */
  getOverlays(): HTMLDivElement[] {
    return [...this.overlays];
  }

  /**
   * Clears all overlays (for testing)
   */
  clear(): void {
    this.overlays = [];
  }
}

const instance = new DismissableLayerManager();
Object.freeze(instance);

export default instance;

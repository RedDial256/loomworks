export interface UseDisclosureResult {
  isOpen: boolean;
  /** Stable across renders, like `close` and `toggle`. */
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/** `ReturnType<typeof setTimeout>`: React Native returns a number, Node an object. */
export type Timer = ReturnType<typeof setTimeout>;

/**
 * What `set` takes: a callback to run after `delay`, or an already running
 * timer (or `null`) to own from now on.
 */
export type TimeoutParam = (() => void) | Timer | null;

export type UseTimeoutResult = readonly [
  /**
   * Starts a timeout, or restarts it if one is pending: a callback needs a
   * `delay` (0 is valid). A timer is adopted instead, and `null` just clears.
   * Stable across renders, like `clear`.
   */
  set: (param: TimeoutParam, delay?: number) => void,
  /** Cancels the pending timeout, if any. */
  clear: () => void,
  /** The current timer; `null` when none is pending. */
  ref: { current: Timer | null },
];

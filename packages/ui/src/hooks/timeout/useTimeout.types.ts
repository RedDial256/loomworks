import type { RefObject } from 'react';

/** `ReturnType<typeof setTimeout>`: React Native's `setTimeout` returns a number, Node's an object. */
export type Timer = ReturnType<typeof setTimeout>;

export interface UseTimeoutResult {
  /** Starts the timeout, or restarts it if one is pending. Stable across renders, like `clear`. */
  set: () => void;
  /** Cancels the pending timeout, if any. */
  clear: () => void;
  /** The pending timer, `undefined` when none is. */
  ref: RefObject<Timer | undefined>;
}

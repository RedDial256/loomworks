import { useCallback, useEffect, useRef } from 'react';

import type { Timer, UseTimeoutResult } from './useTimeout.types';

/**
 * Owns one `setTimeout` for `callback` and clears it on unmount.
 * `initial` is an already running timer to adopt: it is cleared on `set`, `clear` and unmount.
 * The latest `callback` runs without restarting the timer.
 */
export function useTimeout(
  callback: () => void,
  delay: number,
  initial?: Timer
): UseTimeoutResult {
  const ref = useRef<Timer | undefined>(initial);
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);

  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
  });

  const clear = useCallback(() => {
    if (ref.current !== undefined) clearTimeout(ref.current);
    ref.current = undefined;
  }, []);

  const set = useCallback(() => {
    clear();
    ref.current = setTimeout(() => {
      ref.current = undefined;
      callbackRef.current();
    }, delayRef.current);
  }, [clear]);

  useEffect(() => clear, [clear]);

  return { set, clear, ref };
}

import { useCallback, useEffect, useRef } from 'react';

import type { TimeoutParam, Timer, UseTimeoutResult } from './useTimeout.types';

/**
 * Owns one `setTimeout` and clears it on unmount. `set` replaces whatever is
 * pending; an `initial` timer, or one passed to `set`, is adopted and cleared
 * like one started here.
 */
export const useTimeout = (initial?: Timer | null): UseTimeoutResult => {
  const ref = useRef<Timer | null>(initial ?? null);

  const clear = useCallback(() => {
    if (ref.current !== null) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const set = useCallback(
    (param: TimeoutParam, delay = 0) => {
      clear();
      if (typeof param === 'function') {
        ref.current = setTimeout(() => {
          ref.current = null;
          param();
        }, delay);
      } else {
        ref.current = param;
      }
    },
    [clear]
  );

  useEffect(() => clear, [clear]);

  return [set, clear, ref];
};

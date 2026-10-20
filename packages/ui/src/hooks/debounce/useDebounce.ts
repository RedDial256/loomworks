import { useEffect, useState } from 'react';

import type { DebounceDelay } from './useDebounce.types';

/** Returns `value` once it has stopped changing for `delay` ms (300 when unset). */
export function useDebounce<T>(value: T, delay: DebounceDelay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

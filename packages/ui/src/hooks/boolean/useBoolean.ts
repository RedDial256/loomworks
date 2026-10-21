import { useCallback, useMemo, useRef, useState } from 'react';

import type { UseBooleanResult } from './useBoolean.types';

/** Boolean state with stable setters; `initial` is required. */
export function useBoolean(initial: boolean): UseBooleanResult {
  const [value, set] = useState(initial);
  const initialRef = useRef(initial);
  const toggle = useCallback(() => set((current) => !current), []);
  const reset = useCallback(() => set(initialRef.current), []);
  const setTo = useMemo(() => {
    const handlers = {
      true: () => set(true),
      false: () => set(false),
    };
    return (next: boolean) => (next ? handlers.true : handlers.false);
  }, []);
  return { value, set, toggle, setTo, reset };
}

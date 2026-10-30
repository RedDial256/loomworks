import { useCallback, useRef, useState } from 'react';

import type { UseBooleanResult } from './useBoolean.types';

/** Boolean state with stable setters; `initial` is required. */
export const useBoolean = (initial: boolean): UseBooleanResult => {
  const [value, set] = useState(initial);
  const initialRef = useRef(initial);
  const toggle = useCallback(() => set((current) => !current), []);
  const reset = useCallback(() => set(initialRef.current), []);
  const setTrue = useCallback(() => set(true), []);
  const setFalse = useCallback(() => set(false), []);
  const setter = useCallback(
    (next: boolean) => (next ? setTrue : setFalse),
    [setTrue, setFalse]
  );
  return { value, set, toggle, setter, reset };
};

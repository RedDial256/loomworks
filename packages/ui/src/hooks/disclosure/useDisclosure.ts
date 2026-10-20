import { useCallback, useState } from 'react';

import type { UseDisclosureResult } from './useDisclosure.types';

/** Open / closed state for modals, menus and collapsibles; closed when unset. */
export function useDisclosure(initial = false): UseDisclosureResult {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);
  return { isOpen, open, close, toggle };
}

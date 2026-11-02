import type { DemoEntry } from './demos.types';

/** Sandbox index, filtered by the drawer search. Empty until demos are installed. */
export const demos: readonly DemoEntry[] = [];

export const findDemo = (id: string | undefined) =>
  demos.find((demo) => demo.id === id);

import type { DemoEntry } from '../demos.types';

export type DemoCardProps = {
  demo: DemoEntry;
  /** Card width, in pt, from the grid layout. */
  width: number;
};

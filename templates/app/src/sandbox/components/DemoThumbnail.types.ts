import type { DemoEntry } from '../demos.types';

export type DemoThumbnailProps = {
  demo: DemoEntry;
  /** Card width, in pt; the demo is laid out wider and scaled down to it. */
  width: number;
};

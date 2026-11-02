import type { ElevationLevel } from '@/theme';

import type { BoxProps } from '../box/Box.types';

export type CardProps = {
  /** Shadow level; in dark mode also a tonal overlay and a hairline border. `sm` when unset. */
  elevation?: ElevationLevel;
} & Omit<BoxProps, 'surface'>;

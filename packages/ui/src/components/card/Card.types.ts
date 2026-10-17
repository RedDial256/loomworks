import type { ElevationLevel } from '@/theme';

import type { BoxProps } from '../box/Box.types';

export interface CardProps extends Omit<BoxProps, 'surface'> {
  /** Shadow level; in dark mode also a tonal overlay and a hairline border. `sm` when unset. */
  elevation?: ElevationLevel;
}

import type { ActivityIndicatorProps } from 'react-native';

import type { ColorRole } from '@/theme';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export type SpinnerSize = 'S' | 'M' | 'L';

export type SpinnerColor =
  | ColorRole
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`
  | `hsl(${string})`
  | `hsla(${string})`;

export interface SpinnerProps extends Omit<
  ActivityIndicatorProps,
  'color' | 'size'
> {
  /** `S` 20, `M` 36, `L` 48 (pt); `M` when unset. A user `transform` replaces the `L` scale. */
  size?: SpinnerSize;
  /** Color role or raw color; `primary` when unset. */
  color?: SpinnerColor;
  /** Simplified accessibility props; native props still win. Defaults to the `progressbar` role, "Loading" and busy while animating. */
  a11y?: A11y;
}

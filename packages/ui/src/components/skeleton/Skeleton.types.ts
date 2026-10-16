import type { DimensionValue, ViewProps } from 'react-native';

import type { radii, TypographyVariant } from '@/theme';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export interface SkeletonProps extends ViewProps {
  /** Fills the parent when unset. */
  width?: DimensionValue;
  /** Fixed height; when unset the bar is sized like one line of `variant`. */
  height?: DimensionValue;
  /** Text preset to mimic: a font-size bar inside a line-height box. `body` when unset. */
  variant?: TypographyVariant;
  /** Corner radius token; `sm` when unset. */
  radius?: keyof typeof radii;
  /** Simplified accessibility props; hidden from screen readers unless set otherwise. */
  a11y?: A11y;
}

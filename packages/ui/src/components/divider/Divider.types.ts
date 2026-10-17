import type { ViewProps } from 'react-native';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerVariant = 'hairline' | 'thin' | 'small';

export interface DividerProps extends ViewProps {
  /** `horizontal` when unset; a vertical divider stretches to the height of its row. */
  orientation?: DividerOrientation;
  /**
   * Thickness, spacing (both sides) and inset (ends); `hairline` when unset.
   * `hairline`: hairline width, no spacing. `thin`: 1 pt, `xs`. `small`: 2 pt, `md`.
   * Adjust with `style`.
   */
  variant?: DividerVariant;
  /** Color role; `border` when unset. */
  tone?: 'border' | 'borderStrong';
  /** Simplified accessibility props; hidden from screen readers unless set otherwise. */
  a11y?: A11y;
}

import type { ViewProps } from 'react-native';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export interface DividerProps extends ViewProps {
  /** `horizontal` when unset; a vertical divider stretches to the height of its row. */
  orientation?: 'horizontal' | 'vertical';
  /** Color role; `border` when unset. */
  tone?: 'border' | 'borderStrong';
  /** Simplified accessibility props; hidden from screen readers unless set otherwise. */
  a11y?: A11y;
}

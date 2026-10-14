import type { ViewProps } from 'react-native';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export interface BoxProps extends ViewProps {
  /** Inner spacing: `S` 8, `M` 16, `L` 24. */
  padding?: 'none' | 'S' | 'M' | 'L';
  /** Background from the surface ladder; transparent when unset. */
  surface?: 'background' | 'surface' | 'raised' | 'sunken';
  /** Simplified accessibility props; native props still win. Not accessible by default. */
  a11y?: A11y;
}

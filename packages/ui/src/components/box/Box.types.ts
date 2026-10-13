import type { ViewProps } from 'react-native';

export interface BoxProps extends ViewProps {
  /** Inner spacing: `S` 8, `M` 16, `L` 24. */
  padding?: 'none' | 'S' | 'M' | 'L';
  /** Background from the surface ladder; transparent when unset. */
  surface?: 'background' | 'surface' | 'raised' | 'sunken';
}

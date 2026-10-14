import type { TextProps as NativeTextProps } from 'react-native';

import type { TypographyVariant } from '@/theme';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export interface TextProps extends NativeTextProps {
  /** Typography preset (ADR 0002). */
  variant?: TypographyVariant;
  /** Neutral color role; `text` when unset. */
  tone?: 'muted' | 'disabled';
  /** Simplified accessibility props; native props still win. Headings default to the `header` role. */
  a11y?: A11y;
}

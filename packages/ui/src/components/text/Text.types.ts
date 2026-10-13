import type { TextProps as NativeTextProps } from 'react-native';

import type { TypographyVariant } from '@/theme';

export interface TextProps extends NativeTextProps {
  /** Typography preset (ADR 0002). */
  variant?: TypographyVariant;
  /** Neutral color role; `text` when unset. */
  tone?: 'muted' | 'disabled';
}

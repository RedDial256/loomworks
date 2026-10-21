import type { ColorFamily } from '@/theme';

import type { PressableProps } from '../pressable/Pressable.types';

export type ButtonVariant =
  'solid' | 'subtle' | 'outline' | 'ghost' | 'link' | 'text';

export type ButtonSize = 'S' | 'M' | 'L';

/** Everything the `Pressable` takes, with the label as `children`. */
export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /** Label. `link` and `text` have no padding or background and are standalone, not inline. */
  children?: React.ReactNode;
  /** `solid` when unset. */
  variant?: ButtonVariant;
  /** Color family; `primary` when unset. */
  color?: ColorFamily;
  /**
   * `S` is 32 pt tall with a `hitSlop` up to the touch target (ADR 0003);
   * `M` has a `minHeight` of 48 and `L` of 56. `M` when unset.
   */
  size?: ButtonSize;
  /** Content is not ready: renders a `Skeleton` in place of the button and sets `a11y.busy`. */
  loading?: boolean;
  /** Action in progress: shows a `Spinner` over the label, keeps the width, blocks presses and sets `a11y.busy`. */
  pending?: boolean;
}

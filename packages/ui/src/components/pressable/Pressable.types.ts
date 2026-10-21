import type { ReactNode } from 'react';
import type { Insets, StyleProp, ViewStyle } from 'react-native';
import type {
  PressableProps as GesturePressableProps,
  PressableStateCallbackType,
} from 'react-native-gesture-handler';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export type PressableState = PressableStateCallbackType;

export interface PressableProps extends Omit<
  GesturePressableProps,
  'style' | 'children'
> {
  /** Style or a function of the `pressed` state; the component adds no style of its own. */
  style?:
    StyleProp<ViewStyle> | ((state: PressableState) => StyleProp<ViewStyle>);
  /** Children or a function of the `pressed` state. */
  children?: ReactNode | ((state: PressableState) => ReactNode);
  /** Blocks presses and sets `a11y.disabled`. */
  disabled?: boolean;
  /** Simplified accessibility props; native props still win. Defaults to the `button` role. */
  a11y?: A11y;
}

/** Visual size of a control, in pt: one side, or both. */
export type VisualSize = number | { width: number; height: number };

export type { Insets };

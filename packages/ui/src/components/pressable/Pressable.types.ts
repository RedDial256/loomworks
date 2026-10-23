import type { Insets } from 'react-native';

import type { PressableProps as GesturePressableProps } from 'react-native-gesture-handler';

import type { A11y } from '../../utils/a11y/easyA11y.types';

/** Gesture Handler's props, so `style` and `children` stay functions of the `pressed` state. */
export interface PressableProps extends GesturePressableProps {
  /** Blocks presses and sets `a11y.disabled`. */
  disabled?: boolean;
  /** Simplified accessibility props; native props still win. Defaults to the `button` role. */
  a11y?: A11y;
}

/** Visual size of a control, in pt: one side, or both. */
export type VisualSize = number | { width: number; height: number };

export type { Insets };

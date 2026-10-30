import type { FC } from 'react';

import { Pressable as GesturePressable } from 'react-native-gesture-handler';

import { hitSlopFor } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';

import type { Insets, PressableProps, VisualSize } from './Pressable.types';

/** `hitSlop` that grows a control of `visual` size to the minimum touch target (ADR 0002). */
export const touchHitSlop = (visual: VisualSize): Insets => {
  const { width, height } =
    typeof visual === 'number' ? { width: visual, height: visual } : visual;
  const horizontal = hitSlopFor(width);
  const vertical = hitSlopFor(height);
  return {
    top: vertical,
    bottom: vertical,
    left: horizontal,
    right: horizontal,
  };
};

/**
 * Touch enabler: wraps the Gesture Handler `Pressable` with no styling or animation.
 * `style` and `children` accept a function of the `pressed` state.
 */
export const Pressable: FC<PressableProps> = ({
  a11y,
  disabled = false,
  ...rest
}) => {
  return (
    <GesturePressable
      {...easyA11y({ role: 'button', disabled, ...a11y })}
      {...rest}
      disabled={disabled}
    />
  );
};

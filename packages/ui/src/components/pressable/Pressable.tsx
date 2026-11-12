import { type FC, useState } from 'react';

import {
  Pressable as GesturePressable,
  type PressableEvent,
  type PressableStateCallbackType,
} from 'react-native-gesture-handler';
import { withUnistyles } from 'react-native-unistyles';

import { hitSlopFor } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';

import type { Insets, PressableProps, VisualSize } from './Pressable.types';

// Gesture Handler renders its own native button, which Unistyles does not
// register: `withUnistyles` makes its styles follow a theme change.
const ThemedPressable = withUnistyles(GesturePressable);

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

/** `withUnistyles` maps style objects only, so a function of the state is resolved here. */
const resolve = <T,>(
  value: T | ((state: PressableStateCallbackType) => T),
  state: PressableStateCallbackType
): T => {
  if (typeof value === 'function') {
    return (value as (state: PressableStateCallbackType) => T)(state);
  }
  return value;
};

/**
 * Touch enabler: wraps the Gesture Handler `Pressable` with no styling or animation.
 * `style` and `children` accept a function of the `pressed` state.
 */
export const Pressable: FC<PressableProps> = ({
  a11y,
  disabled = false,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);

  const handlePressIn = (event: PressableEvent) => {
    setPressed(true);
    onPressIn?.(event);
  };

  const handlePressOut = (event: PressableEvent) => {
    setPressed(false);
    onPressOut?.(event);
  };

  // Not a fresh literal: the `hovered` key exists only in some React Native versions.
  const state = { pressed, hovered: false };

  return (
    <ThemedPressable
      {...easyA11y({ role: 'button', disabled, ...a11y })}
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={resolve(style, state)}>
      {resolve(children, state)}
    </ThemedPressable>
  );
};

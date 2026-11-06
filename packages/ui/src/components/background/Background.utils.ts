import type { ViewStyle } from 'react-native';

import { UnistylesRuntime } from 'react-native-unistyles';

import type { ColorRole, GradientName } from '@/theme';

import type { BackgroundColor, BackgroundGradient } from './Background.types';

/** One variant option per key of a theme record, styled from its value. */
export const variantsOf = <K extends string, S>(
  record: Record<K, string>,
  style: (value: string) => S
): Record<K, S> =>
  Object.fromEntries(
    Object.entries<string>(record).map(([key, value]) => [key, style(value)])
  ) as Record<K, S>;

// Every theme has the same keys (the contract), so the current one answers for all.
export const isColorRole = (color?: BackgroundColor): color is ColorRole =>
  color !== undefined && color in UnistylesRuntime.getTheme().colors;

export const isGradientName = (
  gradient?: BackgroundGradient
): gradient is GradientName =>
  typeof gradient === 'string' &&
  gradient in UnistylesRuntime.getTheme().gradients;

/** Inline style for a value that is not a theme token, or `undefined`. */
export const customPaint = (
  color?: BackgroundColor,
  gradient?: BackgroundGradient
): ViewStyle | undefined => {
  if (color !== undefined && !isColorRole(color)) {
    return { backgroundColor: color };
  }
  if (gradient !== undefined && !isGradientName(gradient)) {
    return { backgroundImage: gradient };
  }
  return undefined;
};

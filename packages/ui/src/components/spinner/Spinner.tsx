import type { FC } from 'react';
import { ActivityIndicator } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { type ColorRole, touchTarget } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';

import type { SpinnerColor, SpinnerProps, SpinnerSize } from './Spinner.types';

/** Intrinsic sizes of `ActivityIndicator` (RN `sizeSmall` / `sizeLarge`). */
const NATIVE = { small: 20, large: 36 } as const;

/**
 * iOS only has `small` and `large`; numeric sizes are Android only.
 * `L` scales `large` up to the touch target, so both platforms match.
 */
export const SPINNER_SIZES = {
  S: { native: 'small', diameter: NATIVE.small, scale: 1 },
  M: { native: 'large', diameter: NATIVE.large, scale: 1 },
  L: {
    native: 'large',
    diameter: touchTarget.min,
    scale: touchTarget.min / NATIVE.large,
  },
} as const satisfies Record<
  SpinnerSize,
  { native: 'small' | 'large'; diameter: number; scale: number }
>;

/** Themed `ActivityIndicator` that keeps spinning under reduced motion. */
export const Spinner: FC<SpinnerProps> = ({
  size = 'M',
  color = 'primary',
  animating = true,
  a11y,
  style,
  ...rest
}) => {
  const { theme } = useUnistyles();
  styles.useVariants({ size });
  return (
    <ActivityIndicator
      {...easyA11y({
        role: 'progressbar',
        label: 'Loading',
        busy: animating,
        ...a11y,
      })}
      {...rest}
      animating={animating}
      size={SPINNER_SIZES[size].native}
      color={resolveColor(theme.colors, color)}
      style={[styles.spinner, style]}
    />
  );
};

const resolveColor = (
  colors: Record<ColorRole, string>,
  color: SpinnerColor
): string => {
  return color in colors ? colors[color as ColorRole] : color;
};

const { diameter, scale } = SPINNER_SIZES.L;

const styles = StyleSheet.create({
  spinner: {
    variants: {
      size: {
        S: {},
        M: {},
        // `transform` does not change layout: reserve the scaled diameter.
        L: {
          width: diameter,
          height: diameter,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale }],
        },
      },
    },
  },
});

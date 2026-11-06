import type { FC } from 'react';
import { View, type ViewProps } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import type { A11yProps } from '../../utils/a11y/easyA11y.types';

import type { BackgroundProps } from './Background.types';
import {
  customPaint,
  isColorRole,
  isGradientName,
  variantsOf,
} from './Background.utils';

// Decorative layer: no touches, hidden from screen readers.
const FILL_PROPS: A11yProps & Pick<ViewProps, 'pointerEvents'> = {
  ...easyA11y({ hidden: true }),
  pointerEvents: 'none',
};

/**
 * A color or gradient behind its children (wrapper), or behind the parent's
 * content (`fill`). Theme tokens are CSS strings in the stylesheet, so they
 * follow theme changes (ADR 0004).
 */
export const Background: FC<BackgroundProps> = ({
  color,
  gradient,
  fill = false,
  a11y,
  style,
  ...rest
}) => {
  styles.useVariants({
    color: tokenOrUndefined(color, isColorRole),
    gradient: tokenOrUndefined(gradient, isGradientName),
    fill,
  });

  // A wrapper's native props win over `a11y`, like `Box`; a fill's own props win over everything.
  const wrapperA11y = fill
    ? undefined
    : easyA11y({ accessible: false, ...a11y });
  const fillProps = fill ? FILL_PROPS : undefined;
  const paint = customPaint(color, gradient);

  return (
    <View
      {...wrapperA11y}
      {...rest}
      {...fillProps}
      style={[styles.background, paint, style]}
    />
  );
};

const tokenOrUndefined = <V, T extends V>(
  value: V | undefined,
  isToken: (value?: V) => value is T
): T | undefined => (isToken(value) ? value : undefined);

const styles = StyleSheet.create((theme) => ({
  background: {
    variants: {
      color: variantsOf(theme.colors, (backgroundColor) => ({
        backgroundColor,
      })),
      gradient: variantsOf(theme.gradients, (backgroundImage) => ({
        backgroundImage,
      })),
      fill: {
        true: StyleSheet.absoluteFill,
        false: {},
      },
    },
  },
}));

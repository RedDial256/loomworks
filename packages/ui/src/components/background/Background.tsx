import type { FC } from 'react';
import { View, type ViewProps } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import type { A11yProps } from '../../utils/a11y/easyA11y.types';

import type { BackgroundProps } from './Background.types';
import { variantsOf } from './Background.utils';

// Decorative layer: no touches, hidden from screen readers.
const FILL_PROPS: A11yProps & Pick<ViewProps, 'pointerEvents'> = {
  ...easyA11y({ hidden: true }),
  pointerEvents: 'none',
};

/**
 * A theme color or gradient behind its children (wrapper), or behind the
 * parent's content (`fill`). Gradients are CSS strings in the theme, so they
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
  styles.useVariants({ color, gradient, fill });
  if (fill) {
    return (
      <View {...rest} {...FILL_PROPS} style={[styles.background, style]} />
    );
  }

  // Like `Box`: a container stays out of the way unless `a11y` opts in.
  const wrapperA11y = easyA11y({ accessible: false, ...a11y });

  return <View {...wrapperA11y} {...rest} style={[styles.background, style]} />;
};

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
        true: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        false: {},
      },
    },
  },
}));

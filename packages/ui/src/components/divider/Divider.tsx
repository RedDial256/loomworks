import type { FC } from 'react';
import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';

import type {
  DividerOrientation,
  DividerProps,
  DividerVariant,
} from './Divider.types';

/** Hairline separator, decorative: hidden from screen readers by default. */
export const Divider: FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'hairline',
  tone = 'border',
  a11y,
  style,
  ...rest
}) => {
  styles.useVariants({ orientation, variant, tone });
  return (
    <View
      {...easyA11y({ hidden: true, ...a11y })}
      {...rest}
      style={[styles.divider, style]}
    />
  );
};

const ORIENTATIONS: DividerOrientation[] = ['horizontal', 'vertical'];

const styles = StyleSheet.create((theme) => {
  // Thickness, space on both sides of the line, and inset at its ends.
  const presets: Record<
    DividerVariant,
    { thickness: number; spacing: number; inset: number }
  > = {
    hairline: { thickness: StyleSheet.hairlineWidth, spacing: 0, inset: 0 },
    thin: { thickness: 1, spacing: theme.spacing.xs, inset: theme.spacing.xs },
    small: { thickness: 2, spacing: theme.spacing.md, inset: theme.spacing.md },
  };
  const variants = Object.keys(presets) as DividerVariant[];

  return {
    divider: {
      alignSelf: 'stretch',
      variants: {
        orientation: { horizontal: {}, vertical: {} },
        variant: { hairline: {}, thin: {}, small: {} },
        tone: {
          border: { backgroundColor: theme.colors.border },
          borderStrong: { backgroundColor: theme.colors.borderStrong },
        },
      },
      // The orientation picks the axis of each preset value.
      compoundVariants: ORIENTATIONS.flatMap((orientation) =>
        variants.map((variant) => {
          const { thickness, spacing, inset } = presets[variant];
          return {
            orientation,
            variant,
            styles:
              orientation === 'horizontal'
                ? {
                    height: thickness,
                    marginVertical: spacing,
                    marginHorizontal: inset,
                  }
                : {
                    width: thickness,
                    marginHorizontal: spacing,
                    marginVertical: inset,
                  },
          };
        })
      ),
    },
  };
});

import type { FC } from 'react';
import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Box } from '../box/Box';

import type { CardProps } from './Card.types';

/** 1 px hairline (ADR 0002); transparent in light, so the layout is the same in both themes. */
const HAIRLINE = 1;

/**
 * Raised surface built on `Box`. In dark mode the elevation adds a tonal
 * overlay (a child view, since a view has one background) and a hairline.
 */
export const Card: FC<CardProps> = ({
  elevation = 'sm',
  children,
  style,
  ...rest
}) => {
  styles.useVariants({ elevation });
  return (
    <Box surface="raised" {...rest} style={[styles.card, style]}>
      {elevation !== 'none' && (
        <View pointerEvents="none" style={styles.tint} />
      )}
      {children}
    </Box>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    borderRadius: theme.radii.lg,
    variants: {
      elevation: {
        none: { ...theme.elevation.shadow.none, borderWidth: 0 },
        sm: {
          ...theme.elevation.shadow.sm,
          borderWidth: HAIRLINE,
          borderColor: theme.elevation.hairline,
        },
        md: {
          ...theme.elevation.shadow.md,
          borderWidth: HAIRLINE,
          borderColor: theme.elevation.hairline,
        },
        lg: {
          ...theme.elevation.shadow.lg,
          borderWidth: HAIRLINE,
          borderColor: theme.elevation.hairline,
        },
      },
    },
  },
  // Absolute children sit inside the border, so the radius shrinks by its width.
  tint: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radii.lg - HAIRLINE,
    variants: {
      elevation: {
        none: {},
        sm: { backgroundColor: theme.elevation.tint.sm },
        md: { backgroundColor: theme.elevation.tint.md },
        lg: { backgroundColor: theme.elevation.tint.lg },
      },
    },
  },
}));

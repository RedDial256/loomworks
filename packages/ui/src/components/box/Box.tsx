import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { BoxProps } from './Box.types';

/** Layout primitive: a `View` with theme spacing and surfaces. */
export function Box({ padding, surface, style, ...rest }: BoxProps) {
  styles.useVariants({ padding, surface });
  return <View {...rest} style={[styles.box, style]} />;
}

const styles = StyleSheet.create((theme) => ({
  box: {
    variants: {
      padding: {
        none: { padding: 0 },
        S: { padding: theme.spacing.xs },
        M: { padding: theme.spacing.md },
        L: { padding: theme.spacing.xl },
      },
      surface: {
        background: { backgroundColor: theme.colors.background },
        surface: { backgroundColor: theme.colors.surface },
        raised: { backgroundColor: theme.colors.surfaceRaised },
        sunken: { backgroundColor: theme.colors.surfaceSunken },
      },
    },
  },
}));

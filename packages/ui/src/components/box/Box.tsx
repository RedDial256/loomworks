import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import type { A11y } from '../../utils/a11y/easyA11y.types';
import type { BoxProps } from './Box.types';

// Layout containers stay out of the way; opt in to group children.
const A11Y_DEFAULTS: A11y = { accessible: false };

/** Layout primitive: a `View` with theme spacing and surfaces. */
export function Box({ padding, surface, a11y, style, ...rest }: BoxProps) {
  styles.useVariants({ padding, surface });
  return (
    <View
      {...easyA11y({ ...A11Y_DEFAULTS, ...a11y })}
      {...rest}
      style={[styles.box, style]}
    />
  );
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

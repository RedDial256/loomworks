import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface BoxProps extends ViewProps {
  /** Inner spacing: `S` 8, `M` 16, `L` 24. */
  padding?: 'none' | 'S' | 'M' | 'L';
  /** Background from the surface ladder; transparent when unset. */
  surface?: 'background' | 'surface' | 'raised' | 'sunken';
}

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

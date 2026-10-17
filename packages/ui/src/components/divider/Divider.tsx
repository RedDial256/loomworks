import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import type { DividerProps } from './Divider.types';

/** Hairline separator, decorative: hidden from screen readers by default. */
export function Divider({
  orientation = 'horizontal',
  tone = 'border',
  a11y,
  style,
  ...rest
}: DividerProps) {
  styles.useVariants({ orientation, tone });
  return (
    <View
      {...easyA11y({ hidden: true, ...a11y })}
      {...rest}
      style={[styles.divider, style]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  divider: {
    alignSelf: 'stretch',
    variants: {
      orientation: {
        horizontal: { height: StyleSheet.hairlineWidth },
        vertical: { width: StyleSheet.hairlineWidth },
      },
      tone: {
        border: { backgroundColor: theme.colors.border },
        borderStrong: { backgroundColor: theme.colors.borderStrong },
      },
    },
  },
}));

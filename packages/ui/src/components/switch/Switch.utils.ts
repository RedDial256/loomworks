import { useMemo } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { touchTarget } from '@/theme';

/** Intrinsic size of the native switch, close to both platforms. */
export const TRACK = { width: 51, height: 31 } as const;

/** Track and thumb colors of the native switch for the current theme and state. */
export const useSwitchColors = (disabled: boolean) => {
  const { theme } = useUnistyles();
  const { colors } = theme;
  return useMemo(() => {
    if (disabled) {
      return {
        off: colors.surfaceSunken,
        on: colors.primarySubtle,
        thumb: colors.textDisabled,
      };
    }
    return {
      off: colors.borderStrong,
      on: colors.primary,
      thumb: colors.onPrimary,
    };
  }, [colors, disabled]);
};

/** Id of the native switch inside the row, derived from the component's own `a11y.id`. */
export const nativeId = (id?: string) => {
  if (id === undefined) return undefined;
  return `${id}-native`;
};

export const styles = StyleSheet.create({
  container: {
    minHeight: touchTarget.min,
    minWidth: touchTarget.min,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { flexShrink: 1 },
});

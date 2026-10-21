import { Pressable, Switch as NativeSwitch, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { touchTarget } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Skeleton } from '../skeleton/Skeleton';
import { Text } from '../text/Text';
import type { SwitchProps } from './Switch.types';

/** Intrinsic size of the native switch, close to both platforms. */
const TRACK = { width: 51, height: 31 } as const;

/**
 * Themed native `Switch`, controlled only. With a `label` the whole row is
 * pressable and the row, not the switch, is the accessible element.
 */
export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
  loading = false,
  a11y,
  style,
  testID,
}: SwitchProps) {
  const { theme } = useUnistyles();
  const { colors } = theme;

  if (loading) {
    return (
      <View
        testID={testID}
        style={[styles.container, label ? styles.row : undefined, style]}>
        {label ? <Text loading style={styles.label} /> : null}
        <Skeleton
          width={TRACK.width}
          height={TRACK.height}
          radius="full"
          a11y={{
            role: 'switch',
            label: label ?? 'Loading',
            hidden: false,
            ...a11y,
            busy: true,
          }}
        />
      </View>
    );
  }

  const a11yProps = easyA11y({
    role: 'switch',
    label,
    checked: value,
    disabled,
    ...a11y,
  });
  const control = (
    <NativeSwitch
      testID={testID && `${testID}-native`}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: disabled ? colors.surfaceSunken : colors.borderStrong,
        true: disabled ? colors.primarySubtle : colors.primary,
      }}
      thumbColor={disabled ? colors.textDisabled : colors.onPrimary}
      ios_backgroundColor={
        disabled ? colors.surfaceSunken : colors.borderStrong
      }
      {...(label ? easyA11y({ hidden: true }) : a11yProps)}
    />
  );

  if (!label) {
    return (
      <View testID={testID} style={[styles.container, style]}>
        {control}
      </View>
    );
  }

  return (
    <Pressable
      {...a11yProps}
      testID={testID}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[styles.container, styles.row, style]}>
      <Text tone={disabled ? 'disabled' : undefined} style={styles.label}>
        {label}
      </Text>
      {control}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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

import { useCallback } from 'react';
import { Pressable, Switch as NativeSwitch, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { type ThemeColors, touchTarget } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Skeleton } from '../skeleton/Skeleton';
import { Text } from '../text/Text';
import type { SwitchProps } from './Switch.types';

/** Intrinsic size of the native switch, close to both platforms. */
const TRACK = { width: 51, height: 31 } as const;

function switchColors(colors: ThemeColors, disabled: boolean) {
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
}

/** `testID` of the native switch, derived so tests can reach it when the row owns the `testID`. */
function nativeTestID(testID?: string) {
  if (testID === undefined) return undefined;
  return `${testID}-native`;
}

/**
 * Themed native `Switch`, controlled only. With a `label` the whole row is
 * pressable and the row, not the switch, is the accessible element.
 */
export function Switch(props: SwitchProps) {
  if (props.loading) return <SwitchLoading {...props} />;
  if (props.label) return <SwitchRow {...props} />;
  return <SwitchBare {...props} />;
}

function SwitchLoading({ label, a11y, style, testID }: SwitchProps) {
  const skeleton = (
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
  );
  if (!label) {
    return (
      <View testID={testID} style={[styles.container, style]}>
        {skeleton}
      </View>
    );
  }
  return (
    <View testID={testID} style={[styles.container, styles.row, style]}>
      <Text loading style={styles.label} />
      {skeleton}
    </View>
  );
}

function SwitchBare({
  value,
  onValueChange,
  disabled = false,
  a11y,
  style,
  testID,
}: SwitchProps) {
  const a11yProps = easyA11y({
    role: 'switch',
    checked: value,
    disabled,
    ...a11y,
  });
  return (
    <View testID={testID} style={[styles.container, style]}>
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        testID={nativeTestID(testID)}
        a11yProps={a11yProps}
      />
    </View>
  );
}

function SwitchRow({
  value,
  onValueChange,
  label,
  disabled = false,
  a11y,
  style,
  testID,
}: SwitchProps) {
  const a11yProps = easyA11y({
    role: 'switch',
    label,
    checked: value,
    disabled,
    ...a11y,
  });
  const hidden = easyA11y({ hidden: true });
  const toggle = useCallback(
    () => onValueChange(!value),
    [onValueChange, value]
  );
  const tone = disabled ? 'disabled' : undefined;
  return (
    <Pressable
      {...a11yProps}
      testID={testID}
      disabled={disabled}
      onPress={toggle}
      style={[styles.container, styles.row, style]}>
      <Text tone={tone} style={styles.label}>
        {label}
      </Text>
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        testID={nativeTestID(testID)}
        a11yProps={hidden}
      />
    </Pressable>
  );
}

type ThemedSwitchProps = Pick<
  SwitchProps,
  'value' | 'onValueChange' | 'testID'
> & {
  disabled: boolean;
  a11yProps: ReturnType<typeof easyA11y>;
};

function ThemedSwitch({
  value,
  onValueChange,
  disabled,
  testID,
  a11yProps,
}: ThemedSwitchProps) {
  const { theme } = useUnistyles();
  const { off, on, thumb } = switchColors(theme.colors, disabled);
  return (
    <NativeSwitch
      testID={testID}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: off, true: on }}
      thumbColor={thumb}
      ios_backgroundColor={off}
      {...a11yProps}
    />
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

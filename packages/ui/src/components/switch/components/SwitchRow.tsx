import type { FC } from 'react';
import { useCallback } from 'react';
import { Pressable } from 'react-native';

import { easyA11y } from '../../../utils/a11y/easyA11y';
import { Text } from '../../text/Text';
import type { SwitchProps } from '../Switch.types';
import { nativeId, styles } from '../Switch.utils';

import { ThemedSwitch } from './ThemedSwitch';

export const SwitchRow: FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  a11y,
  style,
}) => {
  const toggle = useCallback(
    () => onValueChange(!value),
    [onValueChange, value]
  );
  const a11yProps = easyA11y({
    role: 'switch',
    label,
    checked: value,
    disabled,
    ...a11y,
  });
  const nativeA11yProps = easyA11y({ hidden: true, id: nativeId(a11y?.id) });
  const tone = disabled ? 'disabled' : undefined;
  return (
    <Pressable
      {...a11yProps}
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
        a11yProps={nativeA11yProps}
      />
    </Pressable>
  );
};

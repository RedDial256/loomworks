import type { FC } from 'react';
import { Switch as NativeSwitch } from 'react-native';

import type { ThemedSwitchProps } from '../Switch.types';
import { useSwitchColors } from '../Switch.utils';

export const ThemedSwitch: FC<ThemedSwitchProps> = ({
  value,
  onValueChange,
  disabled,
  a11yProps,
}) => {
  const { off, on, thumb } = useSwitchColors(disabled);
  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: off, true: on }}
      thumbColor={thumb}
      ios_backgroundColor={off}
      {...a11yProps}
    />
  );
};

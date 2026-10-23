import type { FC } from 'react';
import { Switch as NativeSwitch } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import type { ThemedSwitchProps } from '../Switch.types';
import { switchColors } from '../Switch.utils';

export const ThemedSwitch: FC<ThemedSwitchProps> = ({
  value,
  onValueChange,
  disabled,
  a11yProps,
}) => {
  const { theme } = useUnistyles();
  const { off, on, thumb } = switchColors(theme.colors, disabled);
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

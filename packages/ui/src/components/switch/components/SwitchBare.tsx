import type { FC } from 'react';
import { View } from 'react-native';

import { easyA11y } from '../../../utils/a11y/easyA11y';
import type { SwitchProps } from '../Switch.types';
import { styles } from '../Switch.utils';
import { ThemedSwitch } from './ThemedSwitch';

export const SwitchBare: FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  a11y,
  style,
}) => {
  const a11yProps = easyA11y({
    role: 'switch',
    checked: value,
    disabled,
    ...a11y,
  });
  return (
    <View style={[styles.container, style]}>
      <ThemedSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        a11yProps={a11yProps}
      />
    </View>
  );
};

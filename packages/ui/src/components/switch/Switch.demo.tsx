import { type FC, useState } from 'react';
import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Switch } from './Switch';
import type { SwitchProps } from './Switch.types';

// Demo-only props; the demo is a single file, so they stay here.
type SwitchExampleProps = {
  initial: boolean;
} & Omit<SwitchProps, 'value' | 'onValueChange'>;

/** The switch is controlled only: this holds its value. */
const SwitchExample: FC<SwitchExampleProps> = ({ initial, ...rest }) => {
  const [value, setValue] = useState(initial);
  return <Switch {...rest} value={value} onValueChange={setValue} />;
};

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xl },
}));

const wifiA11y = { label: 'Wi-Fi' };
const bluetoothA11y = { label: 'Bluetooth' };

export const demo = {
  title: 'Switch',
  sections: [
    {
      title: 'With a label',
      description: 'The whole row is pressable and is the accessible element.',
      content: (
        <View style={styles.stack}>
          <SwitchExample initial label="Notifications" />
          <SwitchExample initial={false} label="Dark mode" />
        </View>
      ),
    },
    {
      title: 'Bare',
      description: 'No label: pass an accessible name in a11y.',
      content: (
        <View style={styles.row}>
          <SwitchExample initial a11y={wifiA11y} />
          <SwitchExample initial={false} a11y={bluetoothA11y} />
        </View>
      ),
    },
    {
      title: 'Disabled',
      description: 'Blocks changes and dims the switch and its label.',
      content: (
        <View style={styles.stack}>
          <SwitchExample initial disabled label="On, disabled" />
          <SwitchExample initial={false} disabled label="Off, disabled" />
        </View>
      ),
    },
    {
      title: 'Loading',
      description: 'A skeleton in place of the switch, announced as busy.',
      content: (
        <View style={styles.stack}>
          <SwitchExample initial loading label="Notifications" />
          <SwitchExample initial={false} loading />
        </View>
      ),
    },
  ],
};

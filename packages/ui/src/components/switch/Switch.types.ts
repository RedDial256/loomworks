import type { StyleProp, ViewStyle } from 'react-native';

import type { A11y, A11yProps } from '../../utils/a11y/easyA11y.types';

export interface SwitchProps {
  /** Current value; the switch is controlled only. */
  value: boolean;
  /** Called with the next value, from the switch or from the label row. */
  onValueChange: (value: boolean) => void;
  /** Visible label. Makes the whole row pressable and is the accessible name. */
  label?: string;
  /** Blocks changes and dims the switch. */
  disabled?: boolean;
  /** Renders a `Skeleton` instead of the switch and sets `a11y.busy`. */
  loading?: boolean;
  /** Simplified accessibility props; native props still win. Defaults to the `switch` role, `checked` and `disabled`. */
  a11y?: A11y;
  /** Style of the outer container; applied last. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Props of the internal native switch wrapper. */
export interface ThemedSwitchProps extends Pick<
  SwitchProps,
  'value' | 'onValueChange' | 'testID'
> {
  disabled: boolean;
  a11yProps: A11yProps;
}

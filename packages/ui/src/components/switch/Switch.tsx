import type { FC } from 'react';

import { SwitchBare } from './components/SwitchBare';
import { SwitchLoading } from './components/SwitchLoading';
import { SwitchRow } from './components/SwitchRow';
import type { SwitchProps } from './Switch.types';

/**
 * Themed native `Switch`, controlled only. With a `label` the whole row is
 * pressable and the row, not the switch, is the accessible element.
 */
export const Switch: FC<SwitchProps> = (props) => {
  if (props.loading) return <SwitchLoading {...props} />;
  if (props.label) return <SwitchRow {...props} />;
  return <SwitchBare {...props} />;
};

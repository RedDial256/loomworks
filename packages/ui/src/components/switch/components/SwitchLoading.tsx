import type { FC } from 'react';
import { View } from 'react-native';

import { Skeleton } from '../../skeleton/Skeleton';
import { Text } from '../../text/Text';
import type { SwitchProps } from '../Switch.types';
import { styles, TRACK } from '../Switch.utils';

export const SwitchLoading: FC<SwitchProps> = ({ label, a11y, style }) => {
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
    return <View style={[styles.container, style]}>{skeleton}</View>;
  }
  return (
    <View style={[styles.container, styles.row, style]}>
      <Text loading style={styles.label} />
      {skeleton}
    </View>
  );
};

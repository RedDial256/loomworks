import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Skeleton } from './Skeleton';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  lines: { flex: 1 },
}));

export const demo = {
  title: 'Skeleton',
  sections: [
    {
      title: 'Text presets',
      description:
        'A font-size bar in a line-height box, so it takes the place of one line.',
      content: (
        <View style={styles.stack}>
          <Skeleton variant="h2" width="60%" />
          <Skeleton variant="title" width="80%" />
          <Skeleton />
          <Skeleton variant="caption" width="40%" />
        </View>
      ),
    },
    {
      title: 'Shapes',
      description:
        'Fixed size and radius: an avatar next to two lines, and a media block.',
      content: (
        <View style={styles.stack}>
          <View style={styles.row}>
            <Skeleton width={48} height={48} radius="full" />
            <View style={styles.lines}>
              <Skeleton variant="label" width="50%" />
              <Skeleton variant="caption" width="80%" />
            </View>
          </View>
          <Skeleton height={120} radius="lg" />
        </View>
      ),
    },
    {
      title: 'Reduced motion',
      description:
        'The pulse is decorative: with Reduce Motion on in the system settings the block stays at a fixed opacity.',
      content: <Skeleton height={48} radius="md" />,
    },
  ],
};

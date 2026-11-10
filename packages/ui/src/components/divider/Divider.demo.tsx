import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Divider } from './Divider';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.lg },
  row: { flexDirection: 'row', height: 48, gap: theme.spacing.lg },
  block: {
    flex: 1,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceSunken,
  },
}));

export const demo = {
  title: 'Divider',
  sections: [
    {
      title: 'Variants',
      description:
        'hairline, thin (1 pt) and small (2 pt), each with its own spacing.',
      content: (
        <View style={styles.stack}>
          <Divider />
          <Divider variant="thin" />
          <Divider variant="small" />
        </View>
      ),
    },
    {
      title: 'Tones',
      description: 'border and borderStrong.',
      content: (
        <View style={styles.stack}>
          <Divider variant="thin" />
          <Divider variant="thin" tone="borderStrong" />
        </View>
      ),
    },
    {
      title: 'Vertical',
      description: 'Stretches to the height of its row.',
      content: (
        <View style={styles.row}>
          <View style={styles.block} />
          <Divider orientation="vertical" variant="thin" />
          <View style={styles.block} />
          <Divider orientation="vertical" variant="small" tone="borderStrong" />
          <View style={styles.block} />
        </View>
      ),
    },
  ],
};

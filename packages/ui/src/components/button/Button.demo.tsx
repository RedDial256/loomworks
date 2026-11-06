import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Button } from './Button';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
}));

export const demo = {
  title: 'Button',
  keywords: ['action', 'press', 'cta', 'link', 'pending', 'loading'],
  sections: [
    {
      title: 'Variants',
      description:
        'solid, subtle, outline, ghost, link and text. Pressing scales the button, or fades link and text.',
      content: (
        <View style={styles.row}>
          <Button>Solid</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="text">Text</Button>
        </View>
      ),
    },
    {
      title: 'Colors',
      description: 'The color families, solid and subtle.',
      content: (
        <View style={styles.row}>
          <Button>Primary</Button>
          <Button color="success">Success</Button>
          <Button color="warning">Warning</Button>
          <Button color="danger">Danger</Button>
          <Button color="info">Info</Button>
          <Button variant="subtle">Primary</Button>
          <Button variant="subtle" color="success">
            Success
          </Button>
          <Button variant="subtle" color="warning">
            Warning
          </Button>
          <Button variant="subtle" color="danger">
            Danger
          </Button>
          <Button variant="subtle" color="info">
            Info
          </Button>
        </View>
      ),
    },
    {
      title: 'Sizes',
      description: 'S (32 pt, with a hitSlop up to the touch target), M and L.',
      content: (
        <View style={styles.row}>
          <Button size="S">Small</Button>
          <Button>Medium</Button>
          <Button size="L">Large</Button>
        </View>
      ),
    },
    {
      title: 'States',
      description:
        'disabled; pending shows a spinner over the label and blocks presses; loading renders a skeleton in its place.',
      content: (
        <View style={styles.row}>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
          <Button pending>Saving</Button>
          <Button variant="subtle" pending>
            Saving
          </Button>
          <Button loading>Loading</Button>
        </View>
      ),
    },
    {
      title: 'Reduced motion',
      description:
        'With Reduce Motion on in the system settings, the press feedback fades instead of scaling.',
      content: (
        <View style={styles.row}>
          <Button>Press me</Button>
          <Button variant="outline">Press me</Button>
        </View>
      ),
    },
  ],
};

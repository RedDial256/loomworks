import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Text } from './Text';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.xs },
}));

export const demo = {
  title: 'Text',
  sections: [
    {
      title: 'Variants',
      description: 'The typography presets. Headings get the header role.',
      content: (
        <View style={styles.stack}>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="title">Title</Text>
          <Text variant="body">Body</Text>
          <Text variant="bodySmall">Body small</Text>
          <Text variant="label">Label</Text>
          <Text variant="caption">Caption</Text>
        </View>
      ),
    },
    {
      title: 'Tones',
      description: 'Text, muted and disabled.',
      content: (
        <View style={styles.stack}>
          <Text>Default text</Text>
          <Text tone="muted">Muted text</Text>
          <Text tone="disabled">Disabled text</Text>
        </View>
      ),
    },
    {
      title: 'Loading',
      description:
        'A skeleton line of the same preset, announced as busy. Under reduced motion it stops pulsing.',
      content: (
        <View style={styles.stack}>
          <Text variant="title" loading>
            Title
          </Text>
          <Text loading>Body</Text>
          <Text variant="caption" loading>
            Caption
          </Text>
        </View>
      ),
    },
  ],
};

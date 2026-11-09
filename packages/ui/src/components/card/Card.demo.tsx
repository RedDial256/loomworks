import { Text, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Card } from './Card';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg },
  card: { width: 120 },
  label: { ...theme.typography.label, color: theme.colors.text },
  body: { ...theme.typography.bodySmall, color: theme.colors.textMuted },
}));

export const demo = {
  title: 'Card',
  sections: [
    {
      title: 'Elevation',
      description:
        'none, sm, md and lg. In dark mode a tonal tint and a hairline border replace most of the shadow.',
      content: (
        <View style={styles.grid}>
          <Card elevation="none" padding="M" style={styles.card}>
            <Text style={styles.label}>none</Text>
          </Card>
          <Card padding="M" style={styles.card}>
            <Text style={styles.label}>sm</Text>
          </Card>
          <Card elevation="md" padding="M" style={styles.card}>
            <Text style={styles.label}>md</Text>
          </Card>
          <Card elevation="lg" padding="M" style={styles.card}>
            <Text style={styles.label}>lg</Text>
          </Card>
        </View>
      ),
    },
    {
      title: 'Padding',
      description: 'The Box padding: S, M and L.',
      content: (
        <View style={styles.grid}>
          <Card padding="S">
            <Text style={styles.body}>S</Text>
          </Card>
          <Card padding="M">
            <Text style={styles.body}>M</Text>
          </Card>
          <Card padding="L">
            <Text style={styles.body}>L</Text>
          </Card>
        </View>
      ),
    },
  ],
};

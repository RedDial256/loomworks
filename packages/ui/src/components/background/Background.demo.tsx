import { View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { Background } from './Background';

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  swatch: { width: 48, height: 48, borderRadius: theme.radii.md },
  wrapper: {
    padding: theme.spacing.md,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
  },
  card: {
    height: 96,
    padding: theme.spacing.md,
    justifyContent: 'flex-end',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceRaised,
  },
  bar: {
    height: 12,
    width: '60%',
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.onPrimary,
  },
}));

export const demo = {
  title: 'Background',
  keywords: ['gradient', 'color', 'fill', 'backgroundImage', 'surface'],
  sections: [
    {
      title: 'Colors',
      description: 'Any theme color role.',
      content: (
        <View style={styles.row}>
          <Background color="primary" style={styles.swatch} />
          <Background color="successSubtle" style={styles.swatch} />
          <Background color="warning" style={styles.swatch} />
          <Background color="surfaceSunken" style={styles.swatch} />
        </View>
      ),
    },
    {
      title: 'Gradients',
      description:
        'The theme gradients: one per color family, surface and scrim.',
      content: (
        <View style={styles.row}>
          <Background gradient="primary" style={styles.swatch} />
          <Background gradient="success" style={styles.swatch} />
          <Background gradient="warning" style={styles.swatch} />
          <Background gradient="danger" style={styles.swatch} />
          <Background gradient="info" style={styles.swatch} />
          <Background gradient="surface" style={styles.swatch} />
          <Background gradient="scrim" style={styles.swatch} />
        </View>
      ),
    },
    {
      title: 'Wrapper',
      description:
        'Parent of its children, with the radius on itself; overflow hidden clips the children.',
      content: (
        <Background gradient="primary" style={styles.wrapper}>
          <View style={styles.bar} />
        </Background>
      ),
    },
    {
      title: 'Fill',
      description:
        'First child of a clipped parent: takes its radius, sits behind the content.',
      content: (
        <View style={styles.card}>
          <Background fill gradient="primary" />
          <View style={styles.bar} />
        </View>
      ),
    },
  ],
};

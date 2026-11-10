import { Text, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import type { ElevationLevel } from './elevation';
import type { GradientName } from './gradients';

const LEVELS: readonly ElevationLevel[] = ['none', 'sm', 'md', 'lg'];

const GRADIENTS: readonly GradientName[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'surface',
  'scrim',
];

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg },
  item: { alignItems: 'center', gap: theme.spacing['2xs'] },
  // Same as Card: shadow, and in dark mode a tonal tint and a hairline.
  raised: (level: ElevationLevel) => ({
    ...theme.elevation.shadow[level],
    width: 64,
    height: 64,
    borderRadius: theme.radii.lg,
    borderWidth: level === 'none' ? 0 : 1,
    borderColor: theme.elevation.hairline,
    backgroundColor: theme.colors.surfaceRaised,
  }),
  tint: (level: ElevationLevel) => ({
    flex: 1,
    borderRadius: theme.radii.lg - 1,
    backgroundColor: theme.elevation.tint[level],
  }),
  gradient: (name: GradientName) => ({
    width: 64,
    height: 64,
    borderRadius: theme.radii.lg,
    backgroundImage: theme.gradients[name],
  }),
  label: { ...theme.typography.caption, color: theme.colors.textMuted },
}));

export const demo = {
  title: 'Elevation and gradients',
  sections: [
    {
      title: 'Elevation',
      description:
        'none, sm, md and lg. Dark mode adds a tonal tint and a hairline.',
      content: (
        <View style={styles.grid}>
          {LEVELS.map((level) => (
            <View key={level} style={styles.item}>
              <View style={styles.raised(level)}>
                <View style={styles.tint(level)} />
              </View>
              <Text style={styles.label}>{level}</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: 'Gradients',
      description: 'One per color family, plus surface and scrim.',
      content: (
        <View style={styles.grid}>
          {GRADIENTS.map((name) => (
            <View key={name} style={styles.item}>
              <View style={styles.gradient(name)} />
              <Text style={styles.label}>{name}</Text>
            </View>
          ))}
        </View>
      ),
    },
  ],
};

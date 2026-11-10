import { Text, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { radii, spacing } from './spacing';

type SpaceStep = keyof typeof spacing;
type RadiusStep = keyof typeof radii;

const SPACES = Object.keys(spacing) as SpaceStep[];
const RADII = Object.keys(radii) as RadiusStep[];

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg },
  label: {
    ...theme.typography.caption,
    width: 72,
    color: theme.colors.textMuted,
  },
  bar: (step: SpaceStep) => ({
    width: theme.spacing[step],
    height: 16,
    backgroundColor: theme.colors.primary,
  }),
  item: { alignItems: 'center', gap: theme.spacing['2xs'] },
  corner: (step: RadiusStep) => ({
    width: 56,
    height: 56,
    borderRadius: theme.radii[step],
    backgroundColor: theme.colors.primarySubtle,
    borderWidth: 1,
    borderColor: theme.colors.primaryBorder,
  }),
}));

export const demo = {
  title: 'Spacing and radii',
  sections: [
    {
      title: 'Spacing',
      description: 'Padding and gap steps, in pt.',
      content: (
        <View style={styles.stack}>
          {SPACES.map((step) => (
            <View key={step} style={styles.row}>
              <Text style={styles.label}>{`${step} · ${spacing[step]}`}</Text>
              <View style={styles.bar(step)} />
            </View>
          ))}
        </View>
      ),
    },
    {
      title: 'Radii',
      description: 'Corner radius steps, in pt.',
      content: (
        <View style={styles.grid}>
          {RADII.map((step) => (
            <View key={step} style={styles.item}>
              <View style={styles.corner(step)} />
              <Text style={styles.label}>{`${step} · ${radii[step]}`}</Text>
            </View>
          ))}
        </View>
      ),
    },
  ],
};

import { Text, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import type { ColorFamily, ColorRole, NeutralRole } from './contract';

const NEUTRALS: readonly NeutralRole[] = [
  'background',
  'surface',
  'surfaceRaised',
  'surfaceSunken',
  'text',
  'textMuted',
  'textDisabled',
  'border',
  'borderStrong',
  'focusRing',
  'overlay',
  'shadow',
];

const FAMILIES: readonly ColorFamily[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];

const capitalize = (text: string) => text[0]?.toUpperCase() + text.slice(1);

const rolesOf = (family: ColorFamily): ColorRole[] => {
  const name = capitalize(family);
  return [
    family,
    `on${name}`,
    `${family}Subtle`,
    `on${name}Subtle`,
    `${family}Border`,
  ] as ColorRole[];
};

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  stack: { gap: theme.spacing.lg },
  item: { width: 100, gap: theme.spacing['2xs'] },
  swatch: (role: ColorRole) => ({
    height: 48,
    borderRadius: theme.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors[role],
  }),
  name: { ...theme.typography.caption, color: theme.colors.textMuted },
  family: { ...theme.typography.label, color: theme.colors.text },
}));

const swatches = (roles: readonly ColorRole[]) => (
  <View style={styles.grid}>
    {roles.map((role) => (
      <View key={role} style={styles.item}>
        <View style={styles.swatch(role)} />
        <Text style={styles.name}>{role}</Text>
      </View>
    ))}
  </View>
);

export const demo = {
  title: 'Colors',
  sections: [
    {
      title: 'Neutrals',
      description: 'Surfaces, text, borders and overlays.',
      content: swatches(NEUTRALS),
    },
    {
      title: 'Families',
      description:
        'Solid, its content, subtle fill, its content and border, per family.',
      content: (
        <View style={styles.stack}>
          {FAMILIES.map((family) => (
            <View key={family} style={styles.stack}>
              <Text style={styles.family}>{family}</Text>
              {swatches(rolesOf(family))}
            </View>
          ))}
        </View>
      ),
    },
  ],
};

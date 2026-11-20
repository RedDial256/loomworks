import { Text, View } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { typography, type TypographyVariant } from './typography';

const VARIANTS = Object.keys(typography) as TypographyVariant[];

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  stack: { gap: theme.spacing.md },
  sample: (variant: TypographyVariant) => ({
    ...theme.typography[variant],
    color: theme.colors.text,
  }),
  spec: { ...theme.typography.caption, color: theme.colors.textMuted },
}));

const specOf = (variant: TypographyVariant) => {
  const { fontSize, lineHeight, fontWeight } = typography[variant];
  return `${variant} · ${fontSize}/${lineHeight} · ${fontWeight}`;
};

export const demo = {
  title: 'Typography',
  sections: [
    {
      title: 'Variants',
      description: 'Size, line height and weight of each preset.',
      content: (
        <View style={styles.stack}>
          {VARIANTS.map((variant) => (
            <View key={variant}>
              <Text style={styles.sample(variant)}>The quick brown fox</Text>
              <Text style={styles.spec}>{specOf(variant)}</Text>
            </View>
          ))}
        </View>
      ),
    },
  ],
};

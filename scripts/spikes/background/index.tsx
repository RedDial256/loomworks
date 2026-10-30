// T31 spike screen: `backgroundImage` with Unistyles. Each tile states what to look for.
import { type FC, type ReactNode, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '@/components/text/Text';
import { useThemeMode } from '@/theme';

const BackgroundSpike: FC = () => {
  const [accent, setAccent] = useState<'primary' | 'success'>('primary');
  const { mode, setMode } = useThemeMode();
  const { theme } = useUnistyles();
  styles.useVariants({ accent });

  const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
  const toggleAccent = () =>
    setAccent(accent === 'primary' ? 'success' : 'primary');

  const tiles: { id: string; expect: string; node: ReactNode }[] = [
    {
      id: 'A linear string',
      expect:
        'String in StyleSheet.create. Background → primary; colors change with the theme.',
      node: <View style={styles.linearString} />,
    },
    {
      id: 'B radial string',
      expect: 'Primary center fading to background; follows the theme.',
      node: <View style={styles.radialString} />,
    },
    {
      id: 'C object syntax in StyleSheet',
      expect:
        'Object syntax in StyleSheet.create. Source reading predicts no gradient (Unistyles reads the array as breakpoints).',
      node: <View style={styles.objectSyntax} />,
    },
    {
      id: 'D object syntax inline',
      expect:
        'Object syntax inline, colors from useUnistyles. Follows the theme through a re-render.',
      node: (
        <View
          style={[
            styles.box,
            {
              backgroundImage: [
                {
                  type: 'linear-gradient',
                  direction: 'to right',
                  colorStops: [
                    { color: theme.colors.primary },
                    { color: theme.colors.success },
                  ],
                },
              ],
            },
          ]}
        />
      ),
    },
    {
      id: 'E gradient from a variant',
      expect:
        'Variant switches primary/success gradient (variant path on update).',
      node: <View style={styles.variant} />,
    },
    {
      id: 'F two layers, rgba stop',
      expect:
        'Translucent overlay (rgba theme role) over primary; follows the theme.',
      node: <View style={styles.layers} />,
    },
    {
      id: 'G own radius',
      expect: 'Radius on the view itself, no overflow: rounded corners.',
      node: <View style={[styles.linearString, styles.rounded]} />,
    },
    {
      id: 'H non-uniform radius',
      expect: 'Only the top-left corner rounded.',
      node: <View style={[styles.linearString, styles.topLeftRounded]} />,
    },
    {
      id: 'I wrapper, children spill',
      expect:
        'Wrapper with radius and a child wider than it, no overflow: child spills out, gradient stays rounded.',
      node: (
        <View style={[styles.linearString, styles.rounded]}>
          <View style={styles.spill} />
        </View>
      ),
    },
    {
      id: 'J wrapper, overflow hidden',
      expect: 'Same with overflow hidden: child clipped to the rounded shape.',
      node: (
        <View style={[styles.linearString, styles.rounded, styles.clip]}>
          <View style={styles.spill} />
        </View>
      ),
    },
    {
      id: 'K fill, parent not clipped',
      expect:
        'Fill child (absoluteFill) in a rounded parent without overflow: square corners expected.',
      node: (
        <View style={[styles.box, styles.rounded]}>
          <View style={styles.fill} />
          <Text>Content</Text>
        </View>
      ),
    },
    {
      id: 'L fill, parent clipped',
      expect: 'Same with parent overflow hidden: rounded corners.',
      node: (
        <View style={[styles.box, styles.rounded, styles.clip]}>
          <View style={styles.fill} />
          <Text>Content</Text>
        </View>
      ),
    },
    {
      id: 'M size/position/repeat arrays',
      expect:
        'Arrays: two layers, 24×24 dots repeated on x only, top-left; under it a full-size gradient.',
      node: <View style={styles.layerArrays} />,
    },
    {
      id: 'N size/position/repeat strings',
      expect: 'Same as M, written as CSS strings.',
      node: <View style={styles.layerStrings} />,
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={toggleTheme}
          style={styles.toggle}>
          <Text variant="label">{`Theme: ${mode}`}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={toggleAccent}
          style={styles.toggle}>
          <Text variant="label">{`Variant: ${accent}`}</Text>
        </Pressable>
      </View>
      {tiles.map(({ id, expect, node }) => (
        <View key={id} style={styles.tile}>
          <Text variant="label">{id}</Text>
          <Text tone="muted" variant="caption">
            {expect}
          </Text>
          {node}
        </View>
      ))}
    </ScrollView>
  );
};

export default BackgroundSpike;

const styles = StyleSheet.create((theme, rt) => ({
  screen: {
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    paddingTop: rt.insets.top + theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  toggle: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tile: { gap: theme.spacing.xs },
  box: { height: 72, justifyContent: 'center', padding: theme.spacing.sm },
  linearString: {
    height: 72,
    backgroundImage: `linear-gradient(to right, ${theme.colors.background}, ${theme.colors.primary})`,
  },
  radialString: {
    height: 72,
    backgroundImage: `radial-gradient(circle at center, ${theme.colors.primary}, ${theme.colors.background})`,
  },
  objectSyntax: {
    height: 72,
    backgroundImage: [
      {
        type: 'linear-gradient',
        direction: 'to right',
        colorStops: [
          { color: theme.colors.primary },
          { color: theme.colors.success },
        ],
      },
    ],
  },
  variant: {
    height: 72,
    variants: {
      accent: {
        primary: {
          backgroundImage: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.primarySubtle})`,
        },
        success: {
          backgroundImage: `linear-gradient(to right, ${theme.colors.success}, ${theme.colors.successSubtle})`,
        },
      },
    },
  },
  layers: {
    height: 72,
    backgroundImage: `linear-gradient(${theme.colors.overlay}, transparent), linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.success})`,
  },
  rounded: { borderRadius: theme.radii.xl },
  topLeftRounded: { borderTopLeftRadius: 32 },
  clip: { overflow: 'hidden' },
  spill: {
    height: 24,
    width: '120%',
    marginTop: 48,
    backgroundColor: theme.colors.warning,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.success})`,
  },
  layerArrays: {
    height: 96,
    backgroundImage: `radial-gradient(circle, ${theme.colors.warning} 40%, transparent 41%), linear-gradient(${theme.colors.surfaceSunken}, ${theme.colors.primary})`,
    backgroundSize: [
      { x: 24, y: 24 },
      { x: '100%', y: '100%' },
    ],
    backgroundPosition: [
      { top: 0, left: 0 },
      { top: 0, left: 0 },
    ],
    backgroundRepeat: [
      { x: 'repeat', y: 'no-repeat' },
      { x: 'no-repeat', y: 'no-repeat' },
    ],
  },
  layerStrings: {
    height: 96,
    backgroundImage: `radial-gradient(circle, ${theme.colors.warning} 40%, transparent 41%), linear-gradient(${theme.colors.surfaceSunken}, ${theme.colors.primary})`,
    backgroundSize: '24px 24px, 100% 100%',
    backgroundPosition: 'top left, top left',
    backgroundRepeat: 'repeat-x, no-repeat',
  },
}));

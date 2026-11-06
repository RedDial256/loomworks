import { Text, View } from 'react-native';

import type { PressableStateCallbackType } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import { Pressable, touchHitSlop } from './Pressable';

/** Visual side of the small target; `touchHitSlop` grows it to the touch target. */
const DOT = 24;

// Above the demo: its sections are built when the module loads.
const styles = StyleSheet.create((theme) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xl },
  target: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  pressed: { backgroundColor: theme.colors.surfaceSunken },
  disabled: { opacity: 0.5 },
  label: { ...theme.typography.label, color: theme.colors.text },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.primary,
  },
  dotPressed: { backgroundColor: theme.colors.primaryBorder },
}));

const targetStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.target,
  pressed && styles.pressed,
];

const targetLabel = ({ pressed }: PressableStateCallbackType) => (
  <Text style={styles.label}>{pressed ? 'Pressed' : 'Press and hold'}</Text>
);

const dotStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.dot,
  pressed && styles.dotPressed,
];

const dotSlop = touchHitSlop(DOT);
const disabledStyle = [styles.target, styles.disabled];
const dotA11y = { label: 'Small target' };

export const demo = {
  title: 'Pressable',
  keywords: ['touch', 'press', 'tap', 'hitslop', 'gesture'],
  sections: [
    {
      title: 'Pressed state',
      description:
        'style and children take a function of the pressed state. No styling of its own.',
      content: (
        <View style={styles.row}>
          <Pressable style={targetStyle}>{targetLabel}</Pressable>
        </View>
      ),
    },
    {
      title: 'Disabled',
      description: 'Blocks presses and is announced as disabled.',
      content: (
        <View style={styles.row}>
          <Pressable disabled style={disabledStyle}>
            <Text style={styles.label}>Disabled</Text>
          </Pressable>
        </View>
      ),
    },
    {
      title: 'Touch target',
      description: `A ${DOT} pt dot with touchHitSlop(${DOT}): presses register up to 48 pt around its center.`,
      content: (
        <View style={styles.row}>
          <Pressable a11y={dotA11y} hitSlop={dotSlop} style={dotStyle} />
        </View>
      ),
    },
  ],
};

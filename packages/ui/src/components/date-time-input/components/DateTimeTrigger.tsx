import type { FC } from 'react';
import { Pressable, type PressableStateCallbackType } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { easyA11y } from '../../../utils/a11y/easyA11y';
import { Text } from '../../text/Text';
import type { DateTimeTriggerProps } from '../DateTimeInput.types';
import { iconColor, readValue, textTone } from '../DateTimeInput.utils';

import { CalendarIcon } from './CalendarIcon';
import { ClockIcon } from './ClockIcon';

const ICONS = { date: CalendarIcon, time: ClockIcon };

/** A button of the field: the part's value (or the placeholder) and its icon. */
export const DateTimeTrigger: FC<DateTimeTriggerProps> = ({
  part,
  text,
  placeholder,
  label,
  hint,
  expanded,
  disabled,
  invalid,
  onPress,
  a11y,
  style,
}) => {
  const { theme } = useUnistyles();
  styles.useVariants({ focused: expanded === true, invalid, disabled });

  const press = () => onPress(part);

  const fieldStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.field,
    pressed && styles.pressed,
    style,
  ];

  const Icon = ICONS[part];
  const content = text ?? placeholder;

  return (
    <Pressable
      {...easyA11y({
        role: 'button',
        label,
        hint,
        value: readValue(text),
        disabled,
        expanded,
        ...a11y,
      })}
      disabled={disabled}
      onPress={press}
      style={fieldStyle}>
      <Text
        tone={textTone(text, disabled)}
        numberOfLines={1}
        a11y={{ hidden: true }}
        style={styles.text}>
        {content}
      </Text>
      <Icon color={iconColor(theme.colors, disabled)} />
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    minHeight: theme.touchTarget.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    variants: {
      focused: {
        true: { borderColor: theme.colors.focusRing },
        false: {},
      },
      invalid: {
        true: { borderColor: theme.colors.danger },
        false: {},
      },
      disabled: {
        true: { backgroundColor: theme.colors.surfaceSunken },
        false: {},
      },
    },
  },
  pressed: { backgroundColor: theme.colors.surfaceSunken },
  // Tabular digits keep the width steady while the value changes.
  text: { flex: 1, fontVariant: ['tabular-nums'] },
}));

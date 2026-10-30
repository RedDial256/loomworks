import type { FC } from 'react';
import { useImperativeHandle, useState } from 'react';
import { Platform, View } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Field } from '../field/Field';
import { fieldName, useField } from '../field/Field.utils';

import { DateTimeTrigger } from './components/DateTimeTrigger';
import { InlinePicker } from './components/InlinePicker';
import type { DateTimeInputProps, DateTimePart } from './DateTimeInput.types';
import {
  DEFAULT_PART_LABELS,
  DEFAULT_RANGE_MESSAGE,
  dismissAndroidPicker,
  formatPart,
  mergePart,
  modeParts,
  openAndroidPicker,
  partA11yId,
  partName,
  partsDirection,
  pickerSeed,
  withRange,
} from './DateTimeInput.utils';

/**
 * Field that picks a `Date` with the native picker: inline below the field on
 * iOS (the calendar for a day, wheels for a time), the system dialogs on
 * Android. Each part is a button whose value is the formatted part; `datetime`
 * shows a date and a time button side by side. Validates when the picker
 * closes, then on every change while an error shows.
 */
export const DateTimeInput: FC<DateTimeInputProps> = ({
  mode = 'date',
  label,
  hint,
  error,
  required,
  requiredMessage,
  schema,
  validate,
  loading,
  a11y,
  value: controlled,
  defaultValue,
  onChangeDate,
  minimum,
  maximum,
  rangeMessage = DEFAULT_RANGE_MESSAGE,
  minuteInterval,
  locale,
  format,
  placeholder,
  disabled = false,
  partLabels = DEFAULT_PART_LABELS,
  style,
  ref,
}) => {
  const [open, setOpen] = useState<DateTimePart | null>(null);

  const range = { mode, minimum, maximum };
  const checkLimits = withRange(range, rangeMessage, validate);

  const field = useField<Date | null>({
    value: controlled,
    defaultValue,
    empty: null,
    error,
    onChange: onChangeDate,
    required,
    requiredMessage,
    schema,
    validate: checkLimits,
  });

  const { rt } = useUnistyles();
  styles.useVariants({ direction: partsDirection(rt.fontScale) });

  const seed = () => pickerSeed(field.handle.get(), range);

  const changePart = (part: DateTimePart, picked: Date) =>
    field.change(mergePart(seed(), picked, part));

  const close = () => {
    setOpen(null);
    field.validateNow();
  };

  const openAndroid = (part: DateTimePart) =>
    openAndroidPicker({
      part,
      value: seed(),
      minimum,
      maximum,
      minuteInterval,
      onPick: (picked) => {
        changePart(part, picked);
        field.validateNow();
      },
      onDismiss: field.validateNow,
    });

  const toggle = (part: DateTimePart) => {
    if (disabled) return;
    if (Platform.OS === 'android') openAndroid(part);
    else if (open === part) close();
    else setOpen(part);
  };

  const changeInline = (picked: Date) => {
    if (open !== null) changePart(open, picked);
  };

  const closePicker = () => {
    if (Platform.OS === 'android') dismissAndroidPicker();
    else if (open !== null) close();
  };

  const partPlaceholder = (index: number) => {
    if (index === 0) return placeholder;
    return undefined;
  };

  const expandedPart = (part: DateTimePart) => {
    if (Platform.OS !== 'ios') return undefined;
    return open === part;
  };

  const partText = (part: DateTimePart) => {
    if (!field.value) return undefined;
    if (format) return format(field.value, part);
    return formatPart(field.value, part, locale);
  };

  useImperativeHandle(ref, () => ({
    ...field.handle,
    focus: () => toggle(modeParts(mode)[0]!),
    blur: closePicker,
  }));

  const name = fieldName(label, required);
  const invalid = field.error !== undefined;
  const a11yHint = invalid ? field.error : hint;
  const inline = Platform.OS === 'ios';

  const triggers = modeParts(mode).map((part, index) => (
    <View key={part} style={styles[part]}>
      <DateTimeTrigger
        part={part}
        text={partText(part)}
        placeholder={partPlaceholder(index)}
        label={partName(name, part, mode, partLabels)}
        hint={a11yHint}
        expanded={expandedPart(part)}
        disabled={disabled}
        invalid={invalid}
        onPress={toggle}
        a11y={{ ...a11y, id: partA11yId(a11y?.id, index) }}
        style={style}
      />
    </View>
  ));

  return (
    <Field
      label={label}
      required={required}
      hint={hint}
      error={field.error}
      loading={loading}>
      <View style={styles.parts}>{triggers}</View>
      {inline && (
        <InlinePicker
          part={open}
          value={seed()}
          minimum={minimum}
          maximum={maximum}
          minuteInterval={minuteInterval}
          locale={locale}
          onChange={changeInline}
        />
      )}
    </Field>
  );
};

const styles = StyleSheet.create((theme) => ({
  parts: {
    gap: theme.spacing.xs,
    variants: {
      direction: {
        row: { flexDirection: 'row' },
        column: { flexDirection: 'column' },
      },
    },
  },
  date: { flex: 3 },
  time: { flex: 2 },
}));

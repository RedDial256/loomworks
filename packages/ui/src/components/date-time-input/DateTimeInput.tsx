import type { FC } from 'react';
import { useImperativeHandle, useState } from 'react';
import { Platform, Pressable } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Field } from '../field/Field';
import { fieldName, useField } from '../field/Field.utils';
import { Text } from '../text/Text';

import { DateTimeSheet } from './components/DateTimeSheet';
import type { DateTimeInputProps } from './DateTimeInput.types';
import {
  DEFAULT_RANGE_MESSAGE,
  dismissAndroidPicker,
  formatDateTime,
  openAndroidPicker,
  pickerSeed,
  withRange,
} from './DateTimeInput.utils';

/**
 * Field that picks a `Date` with the native picker: a sheet with the inline
 * calendar or wheels on iOS, the system dialogs on Android. The field is a
 * button whose value is the formatted date. Validates when the picker closes,
 * then on every change while an error shows.
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
  locale,
  format,
  placeholder,
  disabled = false,
  doneLabel = 'Done',
  style,
  ref,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => new Date());

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

  const invalid = field.error !== undefined;
  styles.useVariants({ focused: open, invalid, disabled });

  const pick = (next: Date) => {
    field.change(next);
    field.validateNow();
  };

  const openPicker = () => {
    if (disabled) return;
    const seed = pickerSeed(field.handle.get(), range);
    if (Platform.OS === 'android') {
      openAndroidPicker({
        ...range,
        value: seed,
        onPick: pick,
        onDismiss: field.validateNow,
      });
      return;
    }
    setDraft(seed);
    setOpen(true);
  };

  const cancel = () => {
    setOpen(false);
    field.validateNow();
  };

  const confirm = () => {
    setOpen(false);
    pick(draft);
  };

  const closePicker = () => {
    if (Platform.OS === 'android') dismissAndroidPicker();
    else if (open) cancel();
  };

  const shownValue = () => {
    if (!field.value) return undefined;
    if (format) return format(field.value, mode);
    return formatDateTime(field.value, mode, locale);
  };

  useImperativeHandle(ref, () => ({
    ...field.handle,
    focus: openPicker,
    blur: closePicker,
  }));

  const text = shownValue();
  const a11yHint = invalid ? field.error : hint;
  const a11yValue = readValue(text);
  const content = text ?? placeholder;
  const tone = textTone(text, disabled);

  return (
    <Field
      label={label}
      required={required}
      hint={hint}
      error={field.error}
      loading={loading}>
      <Pressable
        {...easyA11y({
          role: 'button',
          label: fieldName(label, required),
          hint: a11yHint,
          value: a11yValue,
          disabled,
          ...a11y,
        })}
        disabled={disabled}
        onPress={openPicker}
        style={[styles.field, style]}>
        <Text tone={tone} a11y={{ hidden: true }}>
          {content}
        </Text>
      </Pressable>
      <DateTimeSheet
        {...range}
        open={open}
        value={draft}
        locale={locale}
        doneLabel={doneLabel}
        onChange={setDraft}
        onDone={confirm}
        onCancel={cancel}
      />
    </Field>
  );
};

/** Read after the name; nothing while empty. */
const readValue = (text: string | undefined) => {
  if (text === undefined) return undefined;
  return { text };
};

/** Muted for the placeholder, disabled when blocked. */
const textTone = (text: string | undefined, disabled: boolean) => {
  if (disabled) return 'disabled';
  if (text === undefined) return 'muted';
  return undefined;
};

const styles = StyleSheet.create((theme) => ({
  field: {
    minHeight: theme.touchTarget.min,
    justifyContent: 'center',
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
}));

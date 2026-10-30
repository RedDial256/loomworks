import type { FC } from 'react';
import { useImperativeHandle, useRef, useState } from 'react';
import type { TextInputInstance, TextInputProps } from 'react-native';
import { TextInput } from 'react-native';

import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Field } from '../field/Field';
import { fieldName, useField } from '../field/Field.utils';

import type { TextFieldProps } from './TextField.types';
import { TYPE_PROPS } from './TextField.utils';

/**
 * Styled `TextInput` with label, hint and error, controlled or uncontrolled,
 * and an imperative ref. Validates `required`, `schema` and `validate` on blur, then on every change while an error shows.
 */
export const TextField: FC<TextFieldProps> = ({
  type = 'text',
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
  onChangeText,
  onFocus,
  onBlur,
  editable,
  style,
  ref,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<TextInputInstance>(null);

  const field = useField({
    value: controlled,
    defaultValue,
    empty: '',
    error,
    onChange: onChangeText,
    required,
    requiredMessage,
    schema,
    validate,
  });

  const { theme } = useUnistyles();
  const invalid = field.error !== undefined;
  styles.useVariants({ focused, invalid });

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setFocused(false);
    field.validateNow();
    onBlur?.(event);
  };

  useImperativeHandle(ref, () => ({
    ...field.handle,
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
  }));

  const a11yHint = invalid ? field.error : hint;

  return (
    <Field
      label={label}
      required={required}
      hint={hint}
      error={field.error}
      loading={loading}>
      <TextInput
        ref={inputRef}
        {...TYPE_PROPS[type]}
        placeholderTextColor={theme.colors.textMuted}
        {...easyA11y({
          label: fieldName(label, required),
          hint: a11yHint,
          disabled: editable === false,
          ...a11y,
        })}
        {...rest}
        value={field.value}
        editable={editable}
        onChangeText={field.change}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.field, style]}
      />
    </Field>
  );
};

const styles = StyleSheet.create((theme) => ({
  field: {
    minHeight: theme.touchTarget.min,
    paddingHorizontal: theme.spacing.sm,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    ...theme.typography.body,
    variants: {
      focused: {
        true: { borderColor: theme.colors.focusRing },
        false: {},
      },
      invalid: {
        true: { borderColor: theme.colors.danger },
        false: {},
      },
    },
  },
}));

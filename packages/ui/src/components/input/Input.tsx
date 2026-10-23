import type { FC } from 'react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Skeleton } from '../skeleton/Skeleton';
import { InputLabel } from './components/InputLabel';
import { InputMessage } from './components/InputMessage';
import type { InputProps } from './Input.types';
import { DEFAULT_REQUIRED_MESSAGE, TYPE_PROPS } from './Input.utils';

/**
 * Styled `TextInput` with label, hint and error, controlled or uncontrolled,
 * and an imperative ref. Validation beyond `required` arrives with T22.
 */
export const Input: FC<InputProps> = ({
  type = 'text',
  label,
  hint,
  error,
  required,
  requiredMessage = DEFAULT_REQUIRED_MESSAGE,
  loading,
  a11y,
  value: controlled,
  defaultValue = '',
  onChangeText,
  onFocus,
  onBlur,
  editable,
  style,
  ref,
  ...rest
}) => {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const [ownError, setOwnError] = useState<string>();

  const inputRef = useRef<TextInput>(null);
  const value = controlled ?? uncontrolled;
  // Read by the ref methods, so `get` and `validate` see a `set` before the next render.
  const valueRef = useRef(value);

  const { theme } = useUnistyles();
  const shown = error ?? ownError;
  const invalid = shown !== undefined;
  styles.useVariants({ focused, invalid });

  const check = (next: string) => {
    if (required && next === '') return requiredMessage;
    return undefined;
  };

  const change = (next: string) => {
    valueRef.current = next;
    if (controlled === undefined) setUncontrolled(next);
    // A stale "Required" would outlive the fix, so re-check while it shows.
    if (ownError !== undefined) setOwnError(check(next));
    onChangeText?.(next);
  };

  useImperativeHandle(ref, () => ({
    get: () => valueRef.current,
    set: change,
    reset: () => {
      change(defaultValue);
      setOwnError(undefined);
    },
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => change(''),
    validate: () => {
      const message = check(valueRef.current);
      setOwnError(message);
      return message === undefined;
    },
  }));

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const name = label && required ? `${label}, required` : label;

  if (loading) {
    return (
      <View style={styles.container}>
        <InputLabel label={label} required={required} />
        <Skeleton
          height={theme.touchTarget.min}
          radius="md"
          a11y={{
            label: name ? `Loading ${name}` : 'Loading',
            hidden: false,
            busy: true,
          }}
        />
      </View>
    );
  }

  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.container}>
      <InputLabel label={label} required={required} />
      <TextInput
        ref={inputRef}
        {...TYPE_PROPS[type]}
        placeholderTextColor={theme.colors.textMuted}
        {...easyA11y({
          label: name,
          hint: shown ?? hint,
          disabled: editable === false,
          ...a11y,
        })}
        {...rest}
        value={value}
        editable={editable}
        onChangeText={change}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[styles.field, style]}
      />
      <InputMessage error={shown} hint={hint} />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: { gap: theme.spacing['2xs'] },
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

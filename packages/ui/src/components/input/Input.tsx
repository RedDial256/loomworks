import type { FC } from 'react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Skeleton } from '../skeleton/Skeleton';
import { Text } from '../text/Text';
import type {
  InputLabelProps,
  InputMessageProps,
  InputProps,
  InputType,
  InputTypeProps,
} from './Input.types';

/** Props each `type` sets together; any of them can be overridden by the user. */
export const TYPE_PROPS: Record<InputType, InputTypeProps> = {
  text: { autoCapitalize: 'sentences' },
  email: {
    keyboardType: 'email-address',
    inputMode: 'email',
    autoComplete: 'email',
    textContentType: 'emailAddress',
    autoCapitalize: 'none',
    autoCorrect: false,
  },
  password: {
    autoComplete: 'current-password',
    textContentType: 'password',
    secureTextEntry: true,
    autoCapitalize: 'none',
    autoCorrect: false,
  },
  number: {
    keyboardType: 'number-pad',
    inputMode: 'numeric',
    autoCapitalize: 'none',
  },
  decimal: {
    keyboardType: 'decimal-pad',
    inputMode: 'decimal',
    autoCapitalize: 'none',
  },
  phone: {
    keyboardType: 'phone-pad',
    inputMode: 'tel',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    autoCapitalize: 'none',
  },
  url: {
    keyboardType: 'url',
    inputMode: 'url',
    autoComplete: 'url',
    textContentType: 'URL',
    autoCapitalize: 'none',
    autoCorrect: false,
  },
  search: {
    inputMode: 'search',
    returnKeyType: 'search',
    autoCapitalize: 'none',
    autoCorrect: false,
  },
};

const DEFAULT_REQUIRED_MESSAGE = 'Required';

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
        <Label label={label} required={required} />
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
      <Label label={label} required={required} />
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
      <Message error={shown} hint={hint} />
    </View>
  );
};

const Label: FC<InputLabelProps> = ({ label, required }) => {
  if (!label) return null;
  return (
    <Text variant="label" a11y={{ hidden: true }}>
      {label}
      {required && (
        <Text variant="label" a11y={{ hidden: true }} style={styles.asterisk}>
          {' *'}
        </Text>
      )}
    </Text>
  );
};

/** The error replaces the hint; the hint is read through the field's accessibility hint. */
const Message: FC<InputMessageProps> = ({ error, hint }) => {
  if (error !== undefined) {
    return (
      <Text
        variant="caption"
        style={styles.error}
        a11y={{ role: 'alert', live: 'assertive' }}>
        {error}
      </Text>
    );
  }
  if (!hint) return null;
  return (
    <Text variant="caption" tone="muted" a11y={{ hidden: true }}>
      {hint}
    </Text>
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
  asterisk: { color: theme.colors.danger },
  error: { color: theme.colors.danger },
}));

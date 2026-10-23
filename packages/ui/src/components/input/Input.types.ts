import type { Ref } from 'react';
import type { TextInputProps } from 'react-native';

import type { A11y } from '../../utils/a11y/easyA11y.types';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'decimal'
  | 'phone'
  | 'url'
  | 'search';

/** The part of a Standard Schema (https://standardschema.dev) that `Input` reads; zod 3.24+, valibot and arktype satisfy it. */
export interface InputSchema {
  readonly '~standard': {
    readonly validate: (value: unknown) => unknown;
  };
}

/** Imperative handle of an `Input`. */
export interface InputRef {
  /** Current value. */
  get: () => string;
  /** Replaces the value; also calls `onChangeText`. */
  set: (value: string) => void;
  /** Back to `defaultValue` (empty when unset) and clears the error. */
  reset: () => void;
  focus: () => void;
  blur: () => void;
  /** Empties the value. */
  clear: () => void;
  /** Runs `required`, `schema` and `validate`, shows the first error and returns whether the value is valid. */
  validate: () => boolean;
}

export interface InputProps extends Omit<TextInputProps, 'ref'> {
  /** Sets keyboard, autocomplete, content type, secure entry and capitalization together; `text` when unset. */
  type?: InputType;
  /** Accessible name, shown above the field. */
  label?: string;
  /** Always visible below the field and read by screen readers; replaced by `error`. */
  hint?: string;
  /** Error message: replaces the hint, turns the border `danger` and is announced. */
  error?: string;
  /** Marks the label, adds "required" to the accessible name and fails `validate` on an empty value. */
  required?: boolean;
  /** Message of the `required` failure; "Required" when unset. */
  requiredMessage?: string;
  /** Any Standard Schema (zod, valibot, arktype); the first issue's message becomes the error. Synchronous only; the value is always a string. */
  schema?: InputSchema;
  /** Runs after the schema passes, for logic it cannot express; returns the error message, or nothing when valid. */
  validate?: (value: string) => string | undefined;
  /** Renders a `Skeleton` at the field height, not editable, announced as busy. */
  loading?: boolean;
  /** Simplified accessibility props for the field; native props still win. */
  a11y?: A11y;
  ref?: Ref<InputRef>;
}

/** What the validation reads from the props. */
export type InputValidationOptions = Pick<
  InputProps,
  'required' | 'requiredMessage' | 'schema' | 'validate'
>;

/** Props each `type` sets together. */
export type InputTypeProps = Pick<
  InputProps,
  | 'keyboardType'
  | 'inputMode'
  | 'autoComplete'
  | 'textContentType'
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'returnKeyType'
>;

export type InputLabelProps = Pick<InputProps, 'label' | 'required'>;

export type InputMessageProps = Pick<InputProps, 'error' | 'hint'>;

import type { ReactNode } from 'react';

import type { A11y } from '../../utils/a11y/easyA11y.types';

/** The part of a Standard Schema (https://standardschema.dev) that a field reads; zod 3.24+, valibot and arktype satisfy it. */
export interface FieldSchema {
  readonly '~standard': {
    readonly validate: (value: unknown) => unknown;
  };
}

/** Imperative handle of a field holding a `T`. */
export interface FieldRef<T> {
  /** Current value. */
  get: () => T;
  /** Replaces the value; also calls the change callback. */
  set: (value: T) => void;
  /** Back to `defaultValue` (empty when unset) and clears the error. */
  reset: () => void;
  focus: () => void;
  blur: () => void;
  /** Empties the value. */
  clear: () => void;
  /** Runs `required`, `schema` and `validate`, shows the first error and returns whether the value is valid. */
  validate: () => boolean;
}

/** Props every field shares, whatever its value type. */
export interface FieldBaseProps<T> {
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
  /** Any Standard Schema (zod, valibot, arktype); the first issue's message becomes the error. Synchronous only; it receives the field's value. */
  schema?: FieldSchema;
  /** Runs after the schema passes, for logic it cannot express; returns the error message, or nothing when valid. */
  validate?: (value: NonNullable<T>) => string | undefined;
  /** Renders a `Skeleton` at the field height, not editable, announced as busy. */
  loading?: boolean;
  /** Simplified accessibility props for the field; native props still win. */
  a11y?: A11y;
}

/** What the validation reads from the props. */
export type FieldValidationOptions<T> = Pick<
  FieldBaseProps<T>,
  'required' | 'requiredMessage' | 'schema' | 'validate'
>;

export interface UseFieldOptions<T> extends FieldValidationOptions<T> {
  /** Controlled value; `undefined` leaves the field uncontrolled. */
  value: T | undefined;
  /** Initial value when uncontrolled, and the target of `reset`; `empty` when unset. */
  defaultValue: T | undefined;
  /** The value `clear` sets and validation treats as missing. */
  empty: T;
  /** Shown instead of the field's own error. */
  error: string | undefined;
  onChange: ((value: T) => void) | undefined;
}

/** The frame around a field: label, the control (or a skeleton) and the message. */
export interface FieldProps extends Pick<
  FieldBaseProps<unknown>,
  'label' | 'required' | 'hint' | 'loading'
> {
  /** The error shown below the field. */
  error: string | undefined;
  children: ReactNode;
}

export type FieldLabelProps = Pick<
  FieldBaseProps<unknown>,
  'label' | 'required'
>;

export type FieldMessageProps = Pick<FieldBaseProps<unknown>, 'error' | 'hint'>;

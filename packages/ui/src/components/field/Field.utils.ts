import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from '../../hooks/debounce/useDebounce';

import type {
  FieldRef,
  FieldValidationOptions,
  UseFieldOptions,
} from './Field.types';

export const DEFAULT_REQUIRED_MESSAGE = 'Required';

export const ASYNC_SCHEMA_MESSAGE =
  'Field: the schema returned a Promise. Only synchronous schemas are supported.';

/** `''`, `null` and `undefined` count as no value. */
export const isEmpty = <T>(
  value: T
): value is Extract<T, '' | null | undefined> =>
  value === '' || value === null || value === undefined;

/** Accessible name: the label, plus ", required" when required. */
export const fieldName = (label: string | undefined, required?: boolean) => {
  if (label && required) return `${label}, required`;
  return label;
};

const isPromise = (result: unknown): result is PromiseLike<unknown> => {
  if (typeof result !== 'object' || result === null) return false;
  return typeof (result as { then?: unknown }).then === 'function';
};

/** Message of the first issue of a Standard Schema result, or undefined when it passed. */
const schemaMessage = (result: unknown) => {
  if (isPromise(result)) {
    if (__DEV__) throw new Error(ASYNC_SCHEMA_MESSAGE);
    return undefined;
  }
  const { issues } = result as { issues?: readonly { message: string }[] };
  return issues?.[0]?.message;
};

/** Runs `required`, then `schema`, then `validate`, and returns the first error. An empty optional value is valid. */
export const checkValue = <T>(
  next: T,
  { required, requiredMessage, schema, validate }: FieldValidationOptions<T>
) => {
  if (isEmpty(next)) {
    if (required) return requiredMessage ?? DEFAULT_REQUIRED_MESSAGE;
    return undefined;
  }
  if (schema) {
    const message = schemaMessage(schema['~standard'].validate(next));
    if (message !== undefined) return message;
  }
  if (validate) return validate(next as NonNullable<T>);
  return undefined;
};

/**
 * The field's own error. `run` validates now (blur, ref); while an error shows,
 * every change revalidates after a debounce, and once valid it is blur only.
 */
export const useFieldValidation = <T>(
  value: T,
  options: FieldValidationOptions<T>
) => {
  const [message, setMessage] = useState<string>();

  const optionsRef = useRef(options);
  const debounced = useDebounce(value);

  const run = useCallback((next: T) => {
    const result = checkValue(next, optionsRef.current);
    setMessage(result);
    return result === undefined;
  }, []);

  const clear = useCallback(() => setMessage(undefined), []);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    setMessage((current) => {
      if (current === undefined) return current;
      return checkValue(debounced, optionsRef.current);
    });
  }, [debounced]);

  return { message, run, clear };
};

/**
 * Value state and validation of a field, controlled or uncontrolled.
 * `handle` is the ref without `focus` and `blur`, which only the control knows.
 */
export const useField = <T>({
  value: controlled,
  defaultValue,
  empty,
  error,
  onChange,
  ...validation
}: UseFieldOptions<T>) => {
  const initial = defaultValue === undefined ? empty : defaultValue;
  const [uncontrolled, setUncontrolled] = useState(initial);

  const value = controlled === undefined ? uncontrolled : controlled;
  // Read by the ref methods, so `get` and `validate` see a `set` before the next render.
  const valueRef = useRef(value);

  const { message, run, clear } = useFieldValidation(value, validation);

  const change = (next: T) => {
    valueRef.current = next;
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  };

  const validateNow = () => run(valueRef.current);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const shown = error === undefined ? message : error;
  const handle: Omit<FieldRef<T>, 'focus' | 'blur'> = {
    get: () => valueRef.current,
    set: change,
    reset: () => {
      change(initial);
      clear();
    },
    clear: () => change(empty),
    validate: validateNow,
  };

  return { value, change, validateNow, error: shown, handle };
};

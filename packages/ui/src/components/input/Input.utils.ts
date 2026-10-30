import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from '../../hooks/debounce/useDebounce';

import type {
  InputType,
  InputTypeProps,
  InputValidationOptions,
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

export const DEFAULT_REQUIRED_MESSAGE = 'Required';

export const ASYNC_SCHEMA_MESSAGE =
  'Input: the schema returned a Promise. Only synchronous schemas are supported.';

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
export const checkValue = (
  next: string,
  { required, requiredMessage, schema, validate }: InputValidationOptions
) => {
  if (next === '') {
    if (required) return requiredMessage ?? DEFAULT_REQUIRED_MESSAGE;
    return undefined;
  }
  if (schema) {
    const message = schemaMessage(schema['~standard'].validate(next));
    if (message !== undefined) return message;
  }
  if (validate) return validate(next);
  return undefined;
};

/**
 * The input's own error. `run` validates now (blur, ref); while an error shows,
 * every change revalidates after a debounce, and once valid it is blur only.
 */
export const useInputValidation = (
  value: string,
  options: InputValidationOptions
) => {
  const [message, setMessage] = useState<string>();

  const optionsRef = useRef(options);
  const debounced = useDebounce(value);

  const run = useCallback((next: string) => {
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

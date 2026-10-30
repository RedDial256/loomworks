import type { Ref } from 'react';
import type { TextInputProps } from 'react-native';

import type { FieldBaseProps, FieldRef } from '../field/Field.types';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'decimal'
  | 'phone'
  | 'url'
  | 'search';

/** Imperative handle of an `Input`. */
export type InputRef = FieldRef<string>;

export interface InputProps
  extends FieldBaseProps<string>, Omit<TextInputProps, 'ref'> {
  /** Sets keyboard, autocomplete, content type, secure entry and capitalization together; `text` when unset. */
  type?: InputType;
  ref?: Ref<InputRef>;
}

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

import type { Ref } from 'react';
import type { TextInputProps } from 'react-native';

import type { FieldBaseProps, FieldRef } from '../field/Field.types';

export type TextFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'decimal'
  | 'phone'
  | 'url'
  | 'search';

/** Imperative handle of a `TextField`. */
export type TextFieldRef = FieldRef<string>;

export interface TextFieldProps
  extends FieldBaseProps<string>, Omit<TextInputProps, 'ref'> {
  /** Sets keyboard, autocomplete, content type, secure entry and capitalization together; `text` when unset. */
  type?: TextFieldType;
  ref?: Ref<TextFieldRef>;
}

/** Props each `type` sets together. */
export type TextFieldTypeProps = Pick<
  TextFieldProps,
  | 'keyboardType'
  | 'inputMode'
  | 'autoComplete'
  | 'textContentType'
  | 'secureTextEntry'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'returnKeyType'
>;

import type { TextFieldType, TextFieldTypeProps } from './TextField.types';

/** Props each `type` sets together; any of them can be overridden by the user. */
export const TYPE_PROPS: Record<TextFieldType, TextFieldTypeProps> = {
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

import type { FC } from 'react';

import { DateTimeInput } from '../date-time-input/DateTimeInput';
import { TextField } from '../text-field/TextField';

import type { InputProps } from './Input.types';
import { isDateInput } from './Input.utils';

/**
 * One entry point for the fields, routed by `type`: `date`, `time` and
 * `datetime` render a `DateTimeInput`, every other type a `TextField`.
 */
export const Input: FC<InputProps> = (props) => {
  if (isDateInput(props)) {
    const { type, ...rest } = props;
    return <DateTimeInput mode={type} {...rest} />;
  }
  return <TextField {...props} />;
};

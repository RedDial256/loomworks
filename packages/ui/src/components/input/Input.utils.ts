import type { DateInputProps, InputProps } from './Input.types';

const DATE_TIME_TYPES: readonly InputProps['type'][] = [
  'date',
  'time',
  'datetime',
];

/** Whether the props route to `DateTimeInput`. */
export const isDateInput = (props: InputProps): props is DateInputProps =>
  DATE_TIME_TYPES.includes(props.type);

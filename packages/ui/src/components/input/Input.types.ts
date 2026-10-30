import type {
  DateTimeInputProps,
  DateTimeInputRef,
  DateTimeMode,
} from '../date-time-input/DateTimeInput.types';
import type {
  TextFieldProps,
  TextFieldRef,
  TextFieldType,
} from '../text-field/TextField.types';

/** Text types go to `TextField`; `date`, `time` and `datetime` go to `DateTimeInput`. */
export type InputType = TextFieldType | DateTimeMode;

/** `DateTimeInput` props, with `type` in place of `mode`. */
export interface DateInputProps extends Omit<DateTimeInputProps, 'mode'> {
  type: DateTimeMode;
}

/** Discriminated on `type`: each type takes the props, value and ref of the field it renders. */
export type InputProps = TextFieldProps | DateInputProps;

/** Imperative handle of an `Input` of type `T` (`text` when unset): a `Date | null` value for the date types, a string otherwise. */
export type InputRef<T extends InputType = 'text'> = T extends DateTimeMode
  ? DateTimeInputRef
  : TextFieldRef;

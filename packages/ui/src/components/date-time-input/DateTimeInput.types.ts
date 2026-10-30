import type { Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { A11y } from '../../utils/a11y/easyA11y.types';
import type { FieldBaseProps, FieldRef } from '../field/Field.types';

/** What the picker chooses: a day, a time of day, or both. */
export type DateTimeMode = 'date' | 'time' | 'datetime';

/** The part one button edits; `datetime` has one of each. */
export type DateTimePart = 'date' | 'time';

/** Minute steps the native pickers accept. */
export type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

/** Imperative handle of a `DateTimeInput`; `null` is no value. `focus` opens the picker and `blur` closes it. */
export type DateTimeInputRef = FieldRef<Date | null>;

export interface DateTimeInputProps extends FieldBaseProps<Date | null> {
  /** `date` when unset. */
  mode?: DateTimeMode;
  /** Controlled value; `null` is an empty controlled field, `undefined` leaves it uncontrolled. */
  value?: Date | null;
  /** Initial value when uncontrolled, and the target of `reset`; empty when unset. */
  defaultValue?: Date | null;
  /** Called with the picked value, or `null` when cleared. */
  onChangeDate?: (value: Date | null) => void;
  /** Earliest value: limits the picker and fails validation below it (by day for `date`, by minute of the day for `time`). */
  minimum?: Date;
  /** Latest value: limits the picker and fails validation above it. */
  maximum?: Date;
  /** Message of the `minimum` / `maximum` failure; "Out of range" when unset. */
  rangeMessage?: string;
  /** Step of the minutes in the time picker; 1 when unset. */
  minuteInterval?: MinuteInterval;
  /** BCP 47 locale of the shown value and of the iOS picker; the device locale when unset. */
  locale?: string;
  /** Replaces the locale formatting of the shown value, per part. */
  format?: (value: Date, part: DateTimePart) => string;
  placeholder?: string;
  /** Blocks opening the picker and dims the field. */
  disabled?: boolean;
  /** Added to the accessible name of each `datetime` button; "date" and "time" when unset. */
  partLabels?: Record<DateTimePart, string>;
  /** Style of each button; applied last. */
  style?: StyleProp<ViewStyle>;
  ref?: Ref<DateTimeInputRef>;
}

/** Limits and mode read by the range check and the pickers. */
export type DateTimeRange = Pick<DateTimeInputProps, 'minimum' | 'maximum'> & {
  mode: DateTimeMode;
};

export interface AndroidPickerOptions extends Pick<
  DateTimeInputProps,
  'minimum' | 'maximum' | 'minuteInterval'
> {
  part: DateTimePart;
  value: Date;
  onPick: (value: Date) => void;
  onDismiss: () => void;
}

/** One button of the field: the formatted part, or the placeholder, and its icon. */
export interface DateTimeTriggerProps {
  part: DateTimePart;
  text: string | undefined;
  placeholder: string | undefined;
  /** Accessible name. */
  label: string | undefined;
  hint: string | undefined;
  expanded: boolean | undefined;
  disabled: boolean;
  invalid: boolean;
  onPress: (part: DateTimePart) => void;
  a11y: A11y | undefined;
  style: StyleProp<ViewStyle>;
}

/** iOS: the native picker below the field, opened and closed with a height animation. */
export interface InlinePickerProps extends Pick<
  DateTimeInputProps,
  'minimum' | 'maximum' | 'minuteInterval' | 'locale'
> {
  /** The open part, or `null` when closed. */
  part: DateTimePart | null;
  value: Date;
  onChange: (value: Date) => void;
}

export interface IconProps {
  color: string;
  /** Side in pt; 20 when unset. */
  size?: number;
}

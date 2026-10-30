import type { Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { FieldBaseProps, FieldRef } from '../field/Field.types';

/** What the picker chooses: a day, a time of day, or both. */
export type DateTimeMode = 'date' | 'time' | 'datetime';

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
  /** BCP 47 locale of the shown value and of the iOS picker; the device locale when unset. */
  locale?: string;
  /** Replaces the locale formatting of the shown value. */
  format?: (value: Date, mode: DateTimeMode) => string;
  placeholder?: string;
  /** Blocks opening the picker and dims the field. */
  disabled?: boolean;
  /** Label of the button that confirms the iOS picker; "Done" when unset. */
  doneLabel?: string;
  /** Style of the field box; applied last. */
  style?: StyleProp<ViewStyle>;
  ref?: Ref<DateTimeInputRef>;
}

/** Limits and mode read by the range check and the pickers. */
export type DateTimeRange = Pick<DateTimeInputProps, 'minimum' | 'maximum'> & {
  mode: DateTimeMode;
};

export interface AndroidPickerOptions extends DateTimeRange {
  value: Date;
  onPick: (value: Date) => void;
  onDismiss: () => void;
}

/** iOS sheet: the picker in a modal, confirmed with a button. */
export interface DateTimeSheetProps extends DateTimeRange {
  open: boolean;
  value: Date;
  locale: string | undefined;
  doneLabel: string;
  onChange: (value: Date) => void;
  onDone: () => void;
  onCancel: () => void;
}

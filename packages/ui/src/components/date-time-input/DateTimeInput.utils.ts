import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import type {
  AndroidPickerOptions,
  DateTimeMode,
  DateTimeRange,
} from './DateTimeInput.types';

export const DEFAULT_RANGE_MESSAGE = 'Out of range';

const FORMAT_OPTIONS: Record<DateTimeMode, Intl.DateTimeFormatOptions> = {
  date: { dateStyle: 'medium' },
  time: { timeStyle: 'short' },
  datetime: { dateStyle: 'medium', timeStyle: 'short' },
};

/** The value as the locale writes it: medium date, short time. */
export const formatDateTime = (
  value: Date,
  mode: DateTimeMode,
  locale?: string
) => new Intl.DateTimeFormat(locale, FORMAT_OPTIONS[mode]).format(value);

/** What the limits compare: the day for `date`, the minute of the day for `time`, the instant for `datetime`. */
const rangeKey = (value: Date, mode: DateTimeMode) => {
  if (mode === 'date') {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate()
    ).getTime();
  }
  if (mode === 'time') return value.getHours() * 60 + value.getMinutes();
  return value.getTime();
};

/** Whether `value` falls outside `minimum` / `maximum`. */
export const isOutOfRange = (
  value: Date,
  { minimum, maximum, mode }: DateTimeRange
) => {
  const key = rangeKey(value, mode);
  if (minimum && key < rangeKey(minimum, mode)) return true;
  if (maximum && key > rangeKey(maximum, mode)) return true;
  return false;
};

/** `validate` preceded by the range check. */
export const withRange =
  (
    range: DateTimeRange,
    message: string,
    validate: ((value: Date) => string | undefined) | undefined
  ) =>
  (value: Date) => {
    if (isOutOfRange(value, range)) return message;
    return validate?.(value);
  };

/** Where the picker opens: the value, or now kept inside the limits. */
export const pickerSeed = (
  value: Date | null,
  { minimum, maximum }: DateTimeRange
) => {
  if (value) return value;
  const now = Date.now();
  if (minimum && now < minimum.getTime()) return minimum;
  if (maximum && now > maximum.getTime()) return maximum;
  return new Date(now);
};

/** iOS picker style: a calendar for days, wheels for a time. */
export const iosDisplay = (mode: DateTimeMode) => {
  if (mode === 'time') return 'spinner';
  return 'inline';
};

/**
 * Android has no combined picker: `datetime` opens the date dialog, then the
 * time dialog on the picked day. Dismissing either one keeps the old value.
 */
export const openAndroidPicker = ({
  mode,
  value,
  minimum,
  maximum,
  onPick,
  onDismiss,
}: AndroidPickerOptions) => {
  const openTime = (day: Date) =>
    DateTimePickerAndroid.open({
      mode: 'time',
      value: day,
      onValueChange: (_event, time) => onPick(time),
      onDismiss,
    });

  if (mode === 'time') {
    openTime(value);
    return;
  }
  DateTimePickerAndroid.open({
    mode: 'date',
    value,
    minimumDate: minimum,
    maximumDate: maximum,
    onValueChange: (_event, day) => {
      if (mode === 'datetime') openTime(day);
      else onPick(day);
    },
    onDismiss,
  });
};

/** Closes the open Android dialog, if any. */
export const dismissAndroidPicker = () => {
  DateTimePickerAndroid.dismiss('date');
  DateTimePickerAndroid.dismiss('time');
};

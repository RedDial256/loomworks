import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import type { ThemeColors } from '@/theme';

import type {
  AndroidPickerOptions,
  DateTimeMode,
  DateTimePart,
  DateTimeRange,
} from './DateTimeInput.types';

export const DEFAULT_RANGE_MESSAGE = 'Out of range';

export const DEFAULT_PART_LABELS: Record<DateTimePart, string> = {
  date: 'date',
  time: 'time',
};

const FORMAT_OPTIONS: Record<DateTimePart, Intl.DateTimeFormatOptions> = {
  date: { dateStyle: 'medium' },
  time: { timeStyle: 'short' },
};

/** The parts a mode shows, one button each. */
export const modeParts = (mode: DateTimeMode): DateTimePart[] => {
  if (mode === 'datetime') return ['date', 'time'];
  return [mode];
};

/** One part of the value as the locale writes it: a medium date or a short time. */
export const formatPart = (value: Date, part: DateTimePart, locale?: string) =>
  new Intl.DateTimeFormat(locale, FORMAT_OPTIONS[part]).format(value);

/** `base` with the day (`date`) or the hour and minute (`time`) of `picked`. */
export const mergePart = (base: Date, picked: Date, part: DateTimePart) => {
  const next = new Date(base);
  if (part === 'date') {
    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  } else {
    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  }
  return next;
};

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
  { minimum, maximum }: Pick<DateTimeRange, 'minimum' | 'maximum'>
) => {
  if (value) return value;
  const now = Date.now();
  if (minimum && now < minimum.getTime()) return minimum;
  if (maximum && now > maximum.getTime()) return maximum;
  return new Date(now);
};

/** iOS inline style: the calendar for a day, wheels for a time (HIG). */
export const iosDisplay = (part: DateTimePart) => {
  if (part === 'time') return 'spinner';
  return 'inline';
};

/** Android has no inline picker: each part opens its system dialog. */
export const openAndroidPicker = ({
  part,
  value,
  minimum,
  maximum,
  minuteInterval,
  onPick,
  onDismiss,
}: AndroidPickerOptions) =>
  DateTimePickerAndroid.open({
    mode: part,
    value,
    minimumDate: minimum,
    maximumDate: maximum,
    minuteInterval,
    onValueChange: (_event, picked) => onPick(picked),
    onDismiss,
  });

export const dismissAndroidPicker = () => {
  DateTimePickerAndroid.dismiss('date');
  DateTimePickerAndroid.dismiss('time');
};

/** `a11y.id` stays on the first button; the time button of `datetime` gets `<id>-time`. */
export const partA11yId = (id: string | undefined, index: number) => {
  if (id === undefined || index === 0) return id;
  return `${id}-time`;
};

/** Read after the name; nothing while empty. */
export const readValue = (text: string | undefined) => {
  if (text === undefined) return undefined;
  return { text };
};

/** Muted for the placeholder, disabled when blocked. */
export const textTone = (text: string | undefined, disabled: boolean) => {
  if (disabled) return 'disabled';
  if (text === undefined) return 'muted';
  return undefined;
};

export const iconColor = (
  colors: Pick<ThemeColors, 'textMuted' | 'textDisabled'>,
  disabled: boolean
) => {
  if (disabled) return colors.textDisabled;
  return colors.textMuted;
};

/** The iOS picker follows the app theme, which `useThemeMode` can set apart from the system. */
export const themeVariant = (themeName: string | undefined) => {
  if (themeName === 'dark') return 'dark';
  return 'light';
};

/** Accessible name of a button: the field's name, plus the part for `datetime`. */
export const partName = (
  name: string | undefined,
  part: DateTimePart,
  mode: DateTimeMode,
  labels: Record<DateTimePart, string>
) => {
  if (mode !== 'datetime') return name;
  if (name === undefined) return labels[part];
  return `${name}, ${labels[part]}`;
};

/** Side by side, or stacked when the text is very large. */
export const partsDirection = (fontScale: number | undefined) => {
  if (fontScale !== undefined && fontScale > 1.35) return 'column';
  return 'row';
};

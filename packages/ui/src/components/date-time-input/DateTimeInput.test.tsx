import { createRef } from 'react';
import { Platform } from 'react-native';

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { z } from 'zod';

import { light } from '@/theme';

import { DateTimeInput } from './DateTimeInput';
import type { DateTimeInputRef } from './DateTimeInput.types';
import {
  formatPart,
  isOutOfRange,
  mergePart,
  partName,
  partsDirection,
  pickerSeed,
  themeVariant,
} from './DateTimeInput.utils';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual('react-native');
  const Picker = (props: object) => <View {...props} />;
  return {
    __esModule: true,
    default: Picker,
    DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
  };
});

const PICKER = 'dateTimeInlinePicker';
const open = jest.mocked(DateTimePickerAndroid.open);
const hidden = { includeHiddenElements: true };
const event = { nativeEvent: { timestamp: 0, utcOffset: 0 } };
const day = new Date(2026, 0, 15, 10, 30);
const later = new Date(2026, 5, 1, 18, 0);

const press = async (name: string) =>
  fireEvent.press(screen.getByRole('button', { name }));

const settle = async () => act(async () => jest.runAllTimers());

describe('DateTimeInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    open.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('value', () => {
    it('shows the placeholder while empty, muted', async () => {
      await render(<DateTimeInput label="Day" placeholder="Pick a day" />);
      expect(screen.getByText('Pick a day', hidden)).toHaveStyle({
        color: light.colors.textMuted,
      });
    });

    it.each([
      ['date', ['Jan 15, 2026']],
      ['time', ['10:30 AM']],
      ['datetime', ['Jan 15, 2026', '10:30 AM']],
    ] as const)('formats %s with the locale', async (mode, texts) => {
      await render(
        <DateTimeInput
          label="When"
          mode={mode}
          defaultValue={day}
          locale="en-US"
        />
      );
      for (const text of texts) {
        expect(screen.getByText(text, hidden)).toBeOnTheScreen();
      }
    });

    it('uses format per part when given', async () => {
      const format = jest.fn(() => 'custom');
      await render(
        <DateTimeInput
          label="When"
          mode="datetime"
          defaultValue={day}
          format={format}
        />
      );
      expect(screen.getAllByText('custom', hidden)).toHaveLength(2);
      expect(format).toHaveBeenCalledWith(day, 'date');
      expect(format).toHaveBeenCalledWith(day, 'time');
    });

    it('controlled: shows the value prop only', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="Day"
          value={day}
          locale="en-US"
          onChangeDate={onChangeDate}
        />
      );
      await press('Day');
      await fireEvent(screen.getByTestId(PICKER), 'valueChange', event, later);
      expect(onChangeDate).toHaveBeenCalledWith(mergePart(day, later, 'date'));
      expect(screen.getByText('Jan 15, 2026', hidden)).toBeOnTheScreen();
      await screen.rerender(
        <DateTimeInput
          label="Day"
          value={null}
          locale="en-US"
          onChangeDate={onChangeDate}
        />
      );
      expect(screen.queryByText('Jan 15, 2026', hidden)).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('is a button named by the label, with the value read', async () => {
      await render(
        <DateTimeInput
          label="Day"
          required
          defaultValue={day}
          locale="en-US"
          hint="Your birthday"
        />
      );
      const button = screen.getByRole('button', { name: 'Day, required' });
      expect(button).toHaveAccessibilityValue({ text: 'Jan 15, 2026' });
      expect(button).toHaveProp('accessibilityHint', 'Your birthday');
    });

    it('datetime: a date and a time button, each with its part', async () => {
      await render(
        <DateTimeInput
          label="Starts"
          mode="datetime"
          defaultValue={day}
          locale="en-US"
          a11y={{ id: 'starts' }}
        />
      );
      const date = screen.getByRole('button', { name: 'Starts, date' });
      const time = screen.getByRole('button', { name: 'Starts, time' });
      expect(date).toHaveAccessibilityValue({ text: 'Jan 15, 2026' });
      expect(time).toHaveAccessibilityValue({ text: '10:30 AM' });
      expect(date).toHaveProp('testID', 'starts');
      expect(time).toHaveProp('testID', 'starts-time');
    });

    it('partLabels names the datetime buttons', async () => {
      await render(
        <DateTimeInput
          label="Início"
          mode="datetime"
          partLabels={{ date: 'data', time: 'hora' }}
        />
      );
      expect(
        screen.getByRole('button', { name: 'Início, data' })
      ).toBeOnTheScreen();
      expect(
        screen.getByRole('button', { name: 'Início, hora' })
      ).toBeOnTheScreen();
    });

    it('reads no value while empty, and the error as the hint', async () => {
      await render(<DateTimeInput label="Day" error="Bad day" />);
      const button = screen.getByRole('button', { name: 'Day' });
      expect(button.props.accessibilityValue?.text).toBeUndefined();
      expect(button).toHaveProp('accessibilityHint', 'Bad day');
      expect(screen.getByRole('alert')).toHaveTextContent('Bad day');
    });

    it('announces expanded while the inline picker is open', async () => {
      await render(<DateTimeInput label="Day" />);
      expect(screen.getByRole('button', { name: 'Day' })).toHaveProp(
        'accessibilityState',
        expect.objectContaining({ expanded: false })
      );
      await press('Day');
      expect(screen.getByRole('button', { name: 'Day' })).toBeExpanded();
    });

    it('disabled: announced, and pressing does not open the picker', async () => {
      await render(<DateTimeInput label="Day" disabled />);
      const button = screen.getByRole('button', { name: 'Day' });
      expect(button).toBeDisabled();
      await fireEvent.press(button);
      expect(screen.queryByTestId(PICKER)).toBeNull();
    });
  });

  describe('iOS inline picker', () => {
    it('opens below the field at the value and changes it live', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="Day"
          defaultValue={day}
          locale="en-US"
          minuteInterval={15}
          onChangeDate={onChangeDate}
        />
      );
      expect(screen.queryByTestId(PICKER)).toBeNull();
      await press('Day');
      const picker = screen.getByTestId(PICKER);
      expect(picker).toHaveProp('value', day);
      expect(picker).toHaveProp('mode', 'date');
      expect(picker).toHaveProp('display', 'inline');
      expect(picker).toHaveProp('minuteInterval', 15);
      expect(picker).toHaveProp('themeVariant', 'light');
      await fireEvent(picker, 'valueChange', event, later);
      const next = mergePart(day, later, 'date');
      expect(onChangeDate).toHaveBeenCalledWith(next);
      expect(screen.getByText('Jun 1, 2026', hidden)).toBeOnTheScreen();
      expect(screen.getByTestId(PICKER)).toBeOnTheScreen();
    });

    it('closes on a second press, after the animation, and validates', async () => {
      await render(<DateTimeInput label="Day" required />);
      await press('Day, required');
      expect(screen.queryByRole('alert')).toBeNull();
      await press('Day, required');
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
      await settle();
      expect(screen.queryByTestId(PICKER)).toBeNull();
    });

    it('datetime: each button opens its part and keeps the other', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="Starts"
          mode="datetime"
          defaultValue={day}
          onChangeDate={onChangeDate}
        />
      );
      await press('Starts, time');
      expect(screen.getByTestId(PICKER)).toHaveProp('mode', 'time');
      expect(screen.getByTestId(PICKER)).toHaveProp('display', 'spinner');
      await fireEvent(screen.getByTestId(PICKER), 'valueChange', event, later);
      expect(onChangeDate).toHaveBeenLastCalledWith(
        new Date(2026, 0, 15, 18, 0)
      );
      await press('Starts, date');
      expect(screen.getByTestId(PICKER)).toHaveProp('mode', 'date');
      expect(
        screen.getByRole('button', { name: 'Starts, time' }).props
          .accessibilityState.expanded
      ).toBe(false);
    });

    it('passes the limits and the locale to the picker', async () => {
      await render(
        <DateTimeInput
          label="Day"
          minimum={day}
          maximum={later}
          locale="pt-PT"
        />
      );
      await press('Day');
      const picker = screen.getByTestId(PICKER);
      expect(picker).toHaveProp('minimumDate', day);
      expect(picker).toHaveProp('maximumDate', later);
      expect(picker).toHaveProp('locale', 'pt-PT');
    });

    it('focus opens the picker and blur closes it', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(<DateTimeInput ref={ref} label="Day" />);
      await act(async () => ref.current!.focus());
      expect(screen.getByTestId(PICKER)).toBeOnTheScreen();
      await act(async () => ref.current!.blur());
      await settle();
      expect(screen.queryByTestId(PICKER)).toBeNull();
    });
  });

  describe('Android dialogs', () => {
    beforeEach(() => {
      jest.replaceProperty(Platform, 'OS', 'android');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('opens the date dialog and keeps the picked day', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="Day"
          defaultValue={day}
          minimum={day}
          onChangeDate={onChangeDate}
        />
      );
      await press('Day');
      expect(screen.queryByTestId(PICKER)).toBeNull();
      expect(open).toHaveBeenCalledTimes(1);
      const options = open.mock.calls[0]![0];
      expect(options).toMatchObject({
        mode: 'date',
        value: day,
        minimumDate: day,
      });
      await act(async () => options.onValueChange!(event, later));
      expect(onChangeDate).toHaveBeenCalledWith(mergePart(day, later, 'date'));
    });

    it('datetime: the time button opens only the time dialog', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="When"
          mode="datetime"
          defaultValue={day}
          minuteInterval={5}
          onChangeDate={onChangeDate}
        />
      );
      await press('When, time');
      expect(open).toHaveBeenCalledTimes(1);
      expect(open.mock.calls[0]![0]).toMatchObject({
        mode: 'time',
        minuteInterval: 5,
      });
      await act(async () =>
        open.mock.calls[0]![0].onValueChange!(event, later)
      );
      expect(onChangeDate).toHaveBeenCalledWith(new Date(2026, 0, 15, 18, 0));
    });

    it('dismissing validates', async () => {
      await render(<DateTimeInput label="Day" required />);
      await press('Day, required');
      await act(async () => open.mock.calls[0]![0].onDismiss!());
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });

    it('blur dismisses the dialog', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(<DateTimeInput ref={ref} label="Day" />);
      ref.current!.blur();
      expect(DateTimePickerAndroid.dismiss).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    const validateOnRef = async (
      ref: React.RefObject<DateTimeInputRef | null>
    ) => {
      let valid = true;
      await act(async () => {
        valid = ref.current!.validate();
      });
      return valid;
    };

    it('fails outside the limits with rangeMessage', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(
        <DateTimeInput
          ref={ref}
          label="Day"
          minimum={day}
          maximum={later}
          rangeMessage="Pick in range"
        />
      );
      await act(async () => ref.current!.set(new Date(2025, 0, 1)));
      expect(await validateOnRef(ref)).toBe(false);
      expect(screen.getByRole('alert')).toHaveTextContent('Pick in range');
      await act(async () => ref.current!.set(new Date(2026, 2, 1)));
      expect(await validateOnRef(ref)).toBe(true);
    });

    it('defaults to "Out of range"', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(
        <DateTimeInput ref={ref} maximum={day} defaultValue={later} />
      );
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Out of range');
    });

    it('runs a Date schema, then validate', async () => {
      const ref = createRef<DateTimeInputRef>();
      const schema = z.date().max(later, 'Too late');
      const validate = jest.fn((value: Date) =>
        value.getDay() === 0 ? 'No Sundays' : undefined
      );
      await render(
        <DateTimeInput ref={ref} schema={schema} validate={validate} />
      );
      await act(async () => ref.current!.set(new Date(2027, 0, 1)));
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Too late');
      await act(async () => ref.current!.set(new Date(2026, 1, 1)));
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('No Sundays');
      expect(validate).toHaveBeenCalledWith(new Date(2026, 1, 1));
    });

    it('get, clear and reset through the ref', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(<DateTimeInput ref={ref} defaultValue={day} required />);
      expect(ref.current!.get()).toBe(day);
      await act(async () => ref.current!.clear());
      expect(ref.current!.get()).toBeNull();
      expect(await validateOnRef(ref)).toBe(false);
      await act(async () => ref.current!.reset());
      expect(ref.current!.get()).toBe(day);
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('styles', () => {
    it('uses the focus ring while open and the danger border on error', async () => {
      await render(<DateTimeInput label="Day" />);
      expect(screen.getByRole('button', { name: 'Day' })).toHaveStyle({
        borderColor: light.colors.border,
        minHeight: 48,
      });
      await press('Day');
      expect(screen.getByRole('button', { name: 'Day' })).toHaveStyle({
        borderColor: light.colors.focusRing,
      });
      await screen.rerender(<DateTimeInput label="Day" error="Bad" />);
      expect(screen.getByRole('button', { name: 'Day' })).toHaveStyle({
        borderColor: light.colors.danger,
      });
    });

    it('renders a busy skeleton while loading', async () => {
      await render(<DateTimeInput label="Day" loading />);
      expect(screen.getByLabelText('Loading Day')).toBeBusy();
      expect(screen.queryByRole('button')).toBeNull();
    });
  });
});

describe('DateTimeInput utils', () => {
  it('merges the day or the time of the pick into the value', () => {
    expect(mergePart(day, later, 'date')).toEqual(new Date(2026, 5, 1, 10, 30));
    expect(mergePart(day, later, 'time')).toEqual(new Date(2026, 0, 15, 18, 0));
  });

  it('compares days for date, minutes of the day for time, instants for datetime', () => {
    const morning = new Date(2026, 0, 15, 8, 0);
    expect(isOutOfRange(morning, { mode: 'date', minimum: day })).toBe(false);
    expect(isOutOfRange(morning, { mode: 'datetime', minimum: day })).toBe(
      true
    );
    const nextDayEarly = new Date(2026, 0, 16, 8, 0);
    expect(isOutOfRange(nextDayEarly, { mode: 'time', minimum: day })).toBe(
      true
    );
    expect(isOutOfRange(nextDayEarly, { mode: 'datetime', minimum: day })).toBe(
      false
    );
  });

  it('seeds the picker with the value, or now inside the limits', () => {
    jest.useFakeTimers({ now: new Date(2026, 3, 1) });
    expect(pickerSeed(day, {})).toBe(day);
    expect(pickerSeed(null, { minimum: later })).toBe(later);
    expect(pickerSeed(null, { maximum: day })).toBe(day);
    expect(pickerSeed(null, {})).toEqual(new Date(2026, 3, 1));
    jest.useRealTimers();
  });

  it('names the parts only for datetime', () => {
    const labels = { date: 'date', time: 'time' };
    expect(partName('Day', 'date', 'date', labels)).toBe('Day');
    expect(partName('When', 'time', 'datetime', labels)).toBe('When, time');
    expect(partName(undefined, 'time', 'datetime', labels)).toBe('time');
  });

  it('stacks the buttons with very large text', () => {
    expect(partsDirection(1)).toBe('row');
    expect(partsDirection(2)).toBe('column');
  });

  it('follows the app theme on the iOS picker', () => {
    expect(themeVariant('dark')).toBe('dark');
    expect(themeVariant('light')).toBe('light');
  });

  it('formats with Intl', () => {
    expect(formatPart(day, 'date', 'pt-PT')).toBe(
      new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' }).format(day)
    );
  });
});

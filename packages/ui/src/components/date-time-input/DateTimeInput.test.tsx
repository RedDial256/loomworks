import { createRef } from 'react';
import { Platform } from 'react-native';

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { z } from 'zod';

import { light } from '@/theme';

import { DateTimeInput } from './DateTimeInput';
import type { DateTimeInputRef } from './DateTimeInput.types';
import {
  formatDateTime,
  isOutOfRange,
  pickerSeed,
} from './DateTimeInput.utils';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual('react-native');
  const Picker = (props: object) => <View testID="picker" {...props} />;
  return {
    __esModule: true,
    default: Picker,
    DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
  };
});

const open = jest.mocked(DateTimePickerAndroid.open);
const hidden = { includeHiddenElements: true };
const day = new Date(2026, 0, 15, 10, 30);
const later = new Date(2026, 5, 1, 18, 0);

const pickInSheet = async (date: Date) => {
  await fireEvent(screen.getByTestId('picker'), 'valueChange', {}, date);
  await fireEvent.press(screen.getByRole('button', { name: 'Done' }));
};

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
      ['date', 'Jan 15, 2026'],
      ['time', '10:30 AM'],
      ['datetime', 'Jan 15, 2026, 10:30 AM'],
    ] as const)('formats %s with the locale', async (mode, text) => {
      await render(
        <DateTimeInput
          label="When"
          mode={mode}
          defaultValue={day}
          locale="en-US"
        />
      );
      expect(screen.getByText(text, hidden)).toBeOnTheScreen();
    });

    it('uses format when given', async () => {
      const format = jest.fn(() => 'custom');
      await render(
        <DateTimeInput label="Day" defaultValue={day} format={format} />
      );
      expect(screen.getByText('custom', hidden)).toBeOnTheScreen();
      expect(format).toHaveBeenCalledWith(day, 'date');
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
      await fireEvent.press(screen.getByRole('button', { name: 'Day' }));
      await pickInSheet(later);
      expect(onChangeDate).toHaveBeenCalledWith(later);
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

    it('reads no value while empty, and the error as the hint', async () => {
      await render(<DateTimeInput label="Day" error="Bad day" />);
      const button = screen.getByRole('button', { name: 'Day' });
      expect(button.props.accessibilityValue?.text).toBeUndefined();
      expect(button).toHaveProp('accessibilityHint', 'Bad day');
      expect(screen.getByRole('alert')).toHaveTextContent('Bad day');
    });

    it('disabled: announced, and pressing does not open the picker', async () => {
      await render(<DateTimeInput label="Day" disabled />);
      const button = screen.getByRole('button', { name: 'Day' });
      expect(button).toBeDisabled();
      await fireEvent.press(button);
      expect(screen.queryByTestId('picker')).toBeNull();
    });
  });

  describe('iOS sheet', () => {
    it('opens on press at the value, commits on Done and validates', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="Day"
          defaultValue={day}
          locale="en-US"
          onChangeDate={onChangeDate}
        />
      );
      await fireEvent.press(screen.getByRole('button', { name: 'Day' }));
      const picker = screen.getByTestId('picker');
      expect(picker).toHaveProp('value', day);
      expect(picker).toHaveProp('display', 'inline');
      await pickInSheet(later);
      expect(onChangeDate).toHaveBeenCalledWith(later);
      expect(screen.queryByTestId('picker')).toBeNull();
      expect(screen.getByText('Jun 1, 2026', hidden)).toBeOnTheScreen();
    });

    it('uses wheels for a time', async () => {
      await render(<DateTimeInput label="At" mode="time" />);
      await fireEvent.press(screen.getByRole('button', { name: 'At' }));
      expect(screen.getByTestId('picker')).toHaveProp('display', 'spinner');
    });

    it('cancel keeps the value and validates', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput label="Day" required onChangeDate={onChangeDate} />
      );
      await fireEvent.press(
        screen.getByRole('button', { name: 'Day, required' })
      );
      await fireEvent(screen.getByTestId('picker'), 'valueChange', {}, later);
      await fireEvent(
        screen.root!.queryAll((node) => node.props.onRequestClose)[0]!,
        'requestClose'
      );
      expect(onChangeDate).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
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
      await fireEvent.press(screen.getByRole('button', { name: 'Day' }));
      const picker = screen.getByTestId('picker');
      expect(picker).toHaveProp('minimumDate', day);
      expect(picker).toHaveProp('maximumDate', later);
      expect(picker).toHaveProp('locale', 'pt-PT');
    });

    it('focus opens the sheet and blur closes it', async () => {
      const ref = createRef<DateTimeInputRef>();
      await render(<DateTimeInput ref={ref} label="Day" />);
      await act(async () => ref.current!.focus());
      expect(screen.getByTestId('picker')).toBeOnTheScreen();
      await act(async () => ref.current!.blur());
      expect(screen.queryByTestId('picker')).toBeNull();
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
      await fireEvent.press(screen.getByRole('button', { name: 'Day' }));
      expect(open).toHaveBeenCalledTimes(1);
      const options = open.mock.calls[0]![0];
      expect(options).toMatchObject({
        mode: 'date',
        value: day,
        minimumDate: day,
      });
      await act(async () =>
        options.onValueChange!(
          { nativeEvent: { timestamp: 0, utcOffset: 0 } },
          later
        )
      );
      expect(onChangeDate).toHaveBeenCalledWith(later);
    });

    it('datetime: the date dialog, then the time dialog on that day', async () => {
      const onChangeDate = jest.fn();
      await render(
        <DateTimeInput
          label="When"
          mode="datetime"
          onChangeDate={onChangeDate}
        />
      );
      await fireEvent.press(screen.getByRole('button', { name: 'When' }));
      const event = { nativeEvent: { timestamp: 0, utcOffset: 0 } };
      await act(async () => open.mock.calls[0]![0].onValueChange!(event, day));
      expect(onChangeDate).not.toHaveBeenCalled();
      expect(open.mock.calls[1]![0]).toMatchObject({
        mode: 'time',
        value: day,
      });
      await act(async () =>
        open.mock.calls[1]![0].onValueChange!(event, later)
      );
      expect(onChangeDate).toHaveBeenCalledWith(later);
    });

    it('dismissing validates', async () => {
      await render(<DateTimeInput label="Day" required />);
      await fireEvent.press(
        screen.getByRole('button', { name: 'Day, required' })
      );
      await act(async () => open.mock.calls[0]![0].onDismiss!());
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
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
      const button = screen.getByRole('button', { name: 'Day' });
      expect(button).toHaveStyle({
        borderColor: light.colors.border,
        minHeight: 48,
      });
      await fireEvent.press(button);
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
    expect(pickerSeed(day, { mode: 'date' })).toBe(day);
    expect(pickerSeed(null, { mode: 'date', minimum: later })).toBe(later);
    expect(pickerSeed(null, { mode: 'date', maximum: day })).toBe(day);
    expect(pickerSeed(null, { mode: 'date' })).toEqual(new Date(2026, 3, 1));
    jest.useRealTimers();
  });

  it('formats with Intl', () => {
    expect(formatDateTime(day, 'date', 'pt-PT')).toBe(
      new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' }).format(day)
    );
  });
});

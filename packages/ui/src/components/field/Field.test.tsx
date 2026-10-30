import { Text } from 'react-native';

import { act, render, renderHook, screen } from '@testing-library/react-native';
import { z } from 'zod';

import { Field } from './Field';
import {
  checkValue,
  DEFAULT_REQUIRED_MESSAGE,
  fieldName,
  isEmpty,
  useField,
} from './Field.utils';

const hidden = { includeHiddenElements: true };

describe('isEmpty', () => {
  it.each([
    ['', true],
    [null, true],
    [undefined, true],
    ['a', false],
    [0, false],
    [new Date(0), false],
  ])('%p -> %p', (value, expected) => {
    expect(isEmpty(value)).toBe(expected);
  });
});

describe('fieldName', () => {
  it('adds "required" only with a label', () => {
    expect(fieldName('Name', true)).toBe('Name, required');
    expect(fieldName('Name')).toBe('Name');
    expect(fieldName(undefined, true)).toBeUndefined();
  });
});

describe('checkValue', () => {
  const day = new Date(2026, 0, 15);

  it('fails an empty required value, for strings and dates', () => {
    expect(checkValue('', { required: true })).toBe(DEFAULT_REQUIRED_MESSAGE);
    expect(checkValue<Date | null>(null, { required: true })).toBe(
      DEFAULT_REQUIRED_MESSAGE
    );
    expect(
      checkValue<Date | null>(null, { required: true, requiredMessage: 'X' })
    ).toBe('X');
  });

  it('passes a Date to the schema and to validate', () => {
    const schema = z.date().min(new Date(2026, 1, 1), 'Too early');
    expect(checkValue(day, { schema })).toBe('Too early');
    const validate = jest.fn((value: Date) =>
      value.getDay() === 4 ? 'No Thursdays' : undefined
    );
    expect(checkValue(day, { validate })).toBe('No Thursdays');
    expect(validate).toHaveBeenCalledWith(day);
  });

  it('skips schema and validate for an empty optional value', () => {
    const validate = jest.fn();
    expect(checkValue<Date | null>(null, { validate })).toBeUndefined();
    expect(validate).not.toHaveBeenCalled();
  });
});

describe('useField', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const options = {
    value: undefined,
    defaultValue: undefined,
    empty: null,
    error: undefined,
    onChange: undefined,
  };

  it('starts at empty, sets, resets and clears a Date', async () => {
    const day = new Date(2026, 0, 15);
    const onChange = jest.fn();
    const { result } = await renderHook(() =>
      useField<Date | null>({ ...options, defaultValue: day, onChange })
    );
    expect(result.current.value).toBe(day);
    const later = new Date(2026, 5, 1);
    await act(async () => result.current.handle.set(later));
    expect(result.current.handle.get()).toBe(later);
    expect(onChange).toHaveBeenLastCalledWith(later);
    await act(async () => result.current.handle.clear());
    expect(result.current.value).toBeNull();
    await act(async () => result.current.handle.reset());
    expect(result.current.value).toBe(day);
  });

  it('follows a controlled value, null included', async () => {
    const onChange = jest.fn();
    const day = new Date(2026, 0, 15);
    const { result, rerender } = await renderHook(
      ({ value }: { value: Date | null }) =>
        useField<Date | null>({ ...options, value, onChange }),
      { initialProps: { value: day } }
    );
    await act(async () => result.current.change(new Date(2027, 0, 1)));
    expect(onChange).toHaveBeenCalled();
    expect(result.current.value).toBe(day);
    await rerender({ value: null });
    expect(result.current.value).toBeNull();
  });

  it('validates now, then revalidates after the debounce while invalid', async () => {
    const { result } = await renderHook(() =>
      useField<Date | null>({ ...options, required: true })
    );
    let valid = true;
    await act(async () => {
      valid = result.current.handle.validate();
    });
    expect(valid).toBe(false);
    expect(result.current.error).toBe(DEFAULT_REQUIRED_MESSAGE);
    await act(async () => result.current.change(new Date()));
    expect(result.current.error).toBe(DEFAULT_REQUIRED_MESSAGE);
    await act(async () => jest.advanceTimersByTime(300));
    expect(result.current.error).toBeUndefined();
  });

  it('lets the error option win', async () => {
    const { result } = await renderHook(() =>
      useField({ ...options, empty: '', error: 'Server', required: true })
    );
    await act(async () => result.current.handle.validate());
    expect(result.current.error).toBe('Server');
  });
});

describe('Field', () => {
  it('renders label, control and message', async () => {
    await render(
      <Field label="Name" required hint="Hint" error={undefined}>
        <Text>control</Text>
      </Field>
    );
    expect(screen.getByText('control')).toBeOnTheScreen();
    expect(screen.getByText('Hint', hidden)).toBeOnTheScreen();
    expect(screen.getByText(/Name/, hidden)).toBeOnTheScreen();
  });

  it('replaces the control with a busy skeleton while loading', async () => {
    await render(
      <Field label="Name" required loading error={undefined}>
        <Text>control</Text>
      </Field>
    );
    expect(screen.queryByText('control')).toBeNull();
    expect(screen.getByLabelText('Loading Name, required')).toBeBusy();
  });
});

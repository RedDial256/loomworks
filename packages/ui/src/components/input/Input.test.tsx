import { createRef } from 'react';

import { fireEvent, render, screen } from '@testing-library/react-native';

import type { TextFieldRef } from '../text-field/TextField.types';

import { Input } from './Input';
import type { InputRef } from './Input.types';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual('react-native');
  const Picker = (props: object) => <View {...props} />;
  return {
    __esModule: true,
    default: Picker,
    DateTimePickerAndroid: { open: jest.fn(), dismiss: jest.fn() },
  };
});

const hidden = { includeHiddenElements: true };
const day = new Date(2026, 0, 15, 10, 30);

describe('Input', () => {
  it('renders a text field by default', async () => {
    const ref = createRef<InputRef>();
    await render(<Input ref={ref} label="Name" defaultValue="Ana" />);
    expect(screen.getByLabelText('Name')).toHaveDisplayValue('Ana');
    expect(ref.current!.get()).toBe('Ana');
  });

  it('passes the text type on', async () => {
    await render(<Input type="email" label="Email" />);
    expect(screen.getByLabelText('Email')).toHaveProp(
      'keyboardType',
      'email-address'
    );
  });

  it.each([
    ['date', 'When', 'date'],
    ['time', 'When', 'time'],
    ['datetime', 'When, date', 'date'],
  ] as const)('routes %s to DateTimeInput', async (type, name, mode) => {
    await render(<Input type={type} label="When" />);
    await fireEvent.press(screen.getByRole('button', { name }));
    expect(screen.getByTestId('dateTimeInlinePicker')).toHaveProp('mode', mode);
  });

  it('types the value and the ref of a date input', async () => {
    const ref = createRef<InputRef<'date'>>();
    await render(
      <Input
        ref={ref}
        type="date"
        label="Day"
        defaultValue={day}
        locale="en-US"
      />
    );
    expect(screen.getByText('Jan 15, 2026', hidden)).toBeOnTheScreen();
    const value: Date | null = ref.current!.get();
    expect(value).toBe(day);
  });
});

/** Compile-time checks: every `@ts-expect-error` must fail `tsc`. */
export const typeChecks = () => (
  <>
    {/* @ts-expect-error a date input takes a Date */}
    <Input type="date" value="2026-01-15" />
    {/* @ts-expect-error a text input takes a string */}
    <Input type="email" value={day} />
    {/* @ts-expect-error a text input takes a string by default */}
    <Input defaultValue={day} />
    {/* @ts-expect-error onChangeText belongs to the text types */}
    <Input type="time" onChangeText={() => {}} />
    {/* @ts-expect-error minimum belongs to the date types */}
    <Input type="text" minimum={day} />
    {/* @ts-expect-error a date input takes a date ref */}
    <Input type="date" ref={createRef<TextFieldRef>()} />
    {/* @ts-expect-error a text input takes a text ref */}
    <Input ref={createRef<InputRef<'datetime'>>()} />
    {/* @ts-expect-error mode is set by type */}
    <Input type="date" mode="time" />
  </>
);

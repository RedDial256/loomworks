import { createRef } from 'react';
import { TextInput } from 'react-native';

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as v from 'valibot';
import { z } from 'zod';

import { light } from '@/theme';

import { ASYNC_SCHEMA_MESSAGE } from '../field/Field.utils';

import { Input } from './Input';
import type { InputRef, InputType } from './Input.types';
import { TYPE_PROPS } from './Input.utils';

const hidden = { includeHiddenElements: true };

describe('Input', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('type', () => {
    it.each(Object.keys(TYPE_PROPS) as InputType[])(
      'sets the %s props together',
      async (type) => {
        await render(<Input type={type} label="Field" />);
        const input = screen.getByLabelText('Field');
        for (const [prop, value] of Object.entries(TYPE_PROPS[type])) {
          expect(input).toHaveProp(prop, value);
        }
      }
    );

    it('maps the keyboards', async () => {
      const keyboards: [InputType, string | undefined][] = [
        ['text', undefined],
        ['email', 'email-address'],
        ['password', undefined],
        ['number', 'number-pad'],
        ['decimal', 'decimal-pad'],
        ['phone', 'phone-pad'],
        ['url', 'url'],
        ['search', undefined],
      ];
      for (const [type, keyboardType] of keyboards) {
        await render(<Input type={type} a11y={{ id: type }} />);
        expect(screen.getByTestId(type).props.keyboardType).toBe(keyboardType);
      }
    });

    it('is a plain text field by default, and only password is secure', async () => {
      await render(<Input a11y={{ id: 'a' }} />);
      expect(screen.getByTestId('a')).toHaveProp('autoCapitalize', 'sentences');
      expect(screen.getByTestId('a').props.secureTextEntry).toBeUndefined();
      await render(<Input type="password" a11y={{ id: 'b' }} />);
      expect(screen.getByTestId('b')).toHaveProp('secureTextEntry', true);
    });

    it('lets native props override the type', async () => {
      await render(<Input type="email" autoCapitalize="words" testID="x" />);
      expect(screen.getByTestId('x')).toHaveProp('autoCapitalize', 'words');
    });
  });

  describe('label, hint and error', () => {
    it('names the field with the label and passes the placeholder', async () => {
      await render(<Input label="Email" placeholder="you@example.com" />);
      expect(screen.getByLabelText('Email')).toHaveProp(
        'placeholder',
        'you@example.com'
      );
      expect(screen.getByText(/Email/, hidden)).toBeOnTheScreen();
    });

    it('shows the hint and reads it with the field', async () => {
      await render(<Input label="Name" hint="As on your ID" />);
      expect(screen.getByText('As on your ID', hidden)).toBeOnTheScreen();
      expect(screen.getByLabelText('Name')).toHaveProp(
        'accessibilityHint',
        'As on your ID'
      );
    });

    it('replaces the hint with an announced error', async () => {
      await render(
        <Input label="Name" hint="As on your ID" error="Too short" />
      );
      expect(screen.queryByText('As on your ID', hidden)).toBeNull();
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Too short');
      expect(alert).toHaveProp('accessibilityLiveRegion', 'assertive');
      expect(screen.getByLabelText('Name')).toHaveProp(
        'accessibilityHint',
        'Too short'
      );
    });

    it('lets a11y and native props override the defaults', async () => {
      await render(
        <Input
          label="Name"
          a11y={{ label: 'A11y' }}
          accessibilityHint="Native"
        />
      );
      const input = screen.getByLabelText('A11y');
      expect(input).toHaveProp('accessibilityHint', 'Native');
    });
  });

  describe('required', () => {
    it('marks the label and the accessible name, hiding the asterisk', async () => {
      await render(<Input label="Name" required />);
      expect(screen.getByLabelText('Name, required')).toBeOnTheScreen();
      expect(
        screen.getByText('*', { ...hidden, exact: false })
      ).toBeOnTheScreen();
      expect(screen.queryByText('*', { exact: false })).toBeNull();
    });

    it('carries no marker when optional', async () => {
      await render(<Input label="Name" />);
      expect(screen.getByLabelText('Name')).toBeOnTheScreen();
      expect(screen.queryByText('*', { ...hidden, exact: false })).toBeNull();
    });

    it('fails an empty value with "Required"', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" required />);
      let valid = true;
      await act(async () => {
        valid = ref.current!.validate();
      });
      expect(valid).toBe(false);
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
    });

    it('uses requiredMessage', async () => {
      const ref = createRef<InputRef>();
      await render(
        <Input ref={ref} label="Name" required requiredMessage="Obrigatório" />
      );
      await act(async () => {
        ref.current!.validate();
      });
      expect(screen.getByRole('alert')).toHaveTextContent('Obrigatório');
    });

    it('passes once filled, and clears the shown error while typing', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" required />);
      await act(async () => {
        ref.current!.validate();
      });
      await fireEvent.changeText(
        screen.getByLabelText('Name, required'),
        'Ana'
      );
      await act(async () => jest.advanceTimersByTime(300));
      expect(screen.queryByRole('alert')).toBeNull();
      let valid = false;
      await act(async () => {
        valid = ref.current!.validate();
      });
      expect(valid).toBe(true);
    });

    it('is valid when optional and empty', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" />);
      expect(ref.current!.validate()).toBe(true);
    });
  });

  describe('modes', () => {
    it('uncontrolled: starts at defaultValue and follows typing', async () => {
      const onChangeText = jest.fn();
      await render(
        <Input label="Name" defaultValue="Ana" onChangeText={onChangeText} />
      );
      const input = screen.getByLabelText('Name');
      expect(input).toHaveDisplayValue('Ana');
      await fireEvent.changeText(input, 'Ana B');
      expect(input).toHaveDisplayValue('Ana B');
      expect(onChangeText).toHaveBeenCalledWith('Ana B');
    });

    it('controlled: shows the value prop only', async () => {
      const onChangeText = jest.fn();
      await render(
        <Input label="Name" value="Ana" onChangeText={onChangeText} />
      );
      const input = screen.getByLabelText('Name');
      await fireEvent.changeText(input, 'Bia');
      expect(onChangeText).toHaveBeenCalledWith('Bia');
      expect(input).toHaveDisplayValue('Ana');
      await screen.rerender(
        <Input label="Name" value="Bia" onChangeText={onChangeText} />
      );
      expect(input).toHaveDisplayValue('Bia');
    });
  });

  describe('ref', () => {
    it('get, set and clear', async () => {
      const ref = createRef<InputRef>();
      const onChangeText = jest.fn();
      await render(
        <Input
          ref={ref}
          label="Name"
          defaultValue="Ana"
          onChangeText={onChangeText}
        />
      );
      expect(ref.current!.get()).toBe('Ana');
      await act(async () => ref.current!.set('Bia'));
      expect(ref.current!.get()).toBe('Bia');
      expect(screen.getByLabelText('Name')).toHaveDisplayValue('Bia');
      expect(onChangeText).toHaveBeenLastCalledWith('Bia');
      await act(async () => ref.current!.clear());
      expect(ref.current!.get()).toBe('');
      expect(screen.getByLabelText('Name')).toHaveDisplayValue('');
    });

    it('reset goes back to defaultValue and clears the error', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" required defaultValue="" />);
      await act(async () => ref.current!.validate());
      expect(screen.getByRole('alert')).toBeOnTheScreen();
      await act(async () => ref.current!.set('Bia'));
      await act(async () => ref.current!.reset());
      expect(ref.current!.get()).toBe('');
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('reset restores a non-empty defaultValue', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" defaultValue="Ana" />);
      await act(async () => ref.current!.set('Bia'));
      await act(async () => ref.current!.reset());
      expect(screen.getByLabelText('Name')).toHaveDisplayValue('Ana');
    });

    it('focus and blur reach the native input', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} label="Name" />);
      const focus = jest.spyOn(TextInput.prototype, 'focus');
      const blur = jest.spyOn(TextInput.prototype, 'blur');
      ref.current!.focus();
      ref.current!.blur();
      expect(focus).toHaveBeenCalledTimes(1);
      expect(blur).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading', () => {
    it('renders a busy skeleton at the field height, keeping the label', async () => {
      await render(<Input label="Name" required loading />);
      expect(screen.getByText(/Name/, hidden)).toBeOnTheScreen();
      expect(screen.queryByDisplayValue('')).toBeNull();
      const skeleton = screen.getByLabelText('Loading Name, required');
      expect(skeleton).toBeBusy();
      expect(skeleton).toHaveStyle({ height: 48 });
    });

    it('keeps the ref usable', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} defaultValue="Ana" loading />);
      expect(ref.current!.get()).toBe('Ana');
      expect(() => ref.current!.focus()).not.toThrow();
    });
  });

  describe('styles', () => {
    it('has a 48 minimum height and the user style last', async () => {
      await render(<Input label="Name" style={{ minHeight: 60 }} />);
      expect(screen.getByLabelText('Name')).toHaveStyle({ minHeight: 60 });
      await screen.rerender(<Input label="Name" />);
      expect(screen.getByLabelText('Name')).toHaveStyle({ minHeight: 48 });
    });

    it('uses the focus ring on focus and goes back on blur', async () => {
      const onFocus = jest.fn();
      await render(<Input label="Name" onFocus={onFocus} />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveStyle({ borderColor: light.colors.border });
      await fireEvent(input, 'focus');
      expect(onFocus).toHaveBeenCalled();
      expect(input).toHaveStyle({ borderColor: light.colors.focusRing });
      await fireEvent(input, 'blur');
      expect(input).toHaveStyle({ borderColor: light.colors.border });
    });

    it('uses the danger border on error, even when focused', async () => {
      await render(<Input label="Name" error="Bad" />);
      const input = screen.getByLabelText('Name');
      expect(input).toHaveStyle({ borderColor: light.colors.danger });
      await fireEvent(input, 'focus');
      expect(input).toHaveStyle({ borderColor: light.colors.danger });
    });
  });
  describe('validation', () => {
    const phone = z.string().regex(/^9\d{8}$/, 'Invalid number');

    const validateOnRef = async (ref: React.RefObject<InputRef | null>) => {
      let valid = true;
      await act(async () => {
        valid = ref.current!.validate();
      });
      return valid;
    };

    it('shows the first issue of a zod schema', async () => {
      const ref = createRef<InputRef>();
      await render(
        <Input ref={ref} label="Phone" type="phone" schema={phone} />
      );
      await act(async () => ref.current!.set('123'));
      expect(await validateOnRef(ref)).toBe(false);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
      await act(async () => ref.current!.set('912345678'));
      expect(await validateOnRef(ref)).toBe(true);
    });

    it('accepts a valibot schema', async () => {
      const ref = createRef<InputRef>();
      const schema = v.pipe(v.string(), v.minLength(3, 'Too short'));
      await render(<Input ref={ref} label="Name" schema={schema} />);
      await act(async () => ref.current!.set('ab'));
      expect(await validateOnRef(ref)).toBe(false);
      expect(screen.getByRole('alert')).toHaveTextContent('Too short');
      await act(async () => ref.current!.set('abc'));
      expect(await validateOnRef(ref)).toBe(true);
    });

    it('runs validate after the schema passes', async () => {
      const ref = createRef<InputRef>();
      const validate = jest.fn((value: string) =>
        value === '900000000' ? 'Reserved' : undefined
      );
      await render(
        <Input ref={ref} label="Phone" schema={phone} validate={validate} />
      );
      await act(async () => ref.current!.set('123'));
      await validateOnRef(ref);
      expect(validate).not.toHaveBeenCalled();
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid number');
      await act(async () => ref.current!.set('900000000'));
      expect(await validateOnRef(ref)).toBe(false);
      expect(screen.getByRole('alert')).toHaveTextContent('Reserved');
    });

    it('checks required first, then schema, then validate', async () => {
      const ref = createRef<InputRef>();
      const schema = z.string().min(3, 'Schema');
      const validate = jest.fn(() => 'Validate');
      await render(
        <Input ref={ref} required schema={schema} validate={validate} />
      );
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Required');
      expect(validate).not.toHaveBeenCalled();
      await act(async () => ref.current!.set('a'));
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Schema');
      await act(async () => ref.current!.set('abc'));
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Validate');
    });

    it('skips schema and validate for an empty optional value', async () => {
      const ref = createRef<InputRef>();
      const validate = jest.fn();
      await render(<Input ref={ref} schema={phone} validate={validate} />);
      expect(await validateOnRef(ref)).toBe(true);
      expect(validate).not.toHaveBeenCalled();
    });

    it('throws a clear error for an async schema in development', async () => {
      const ref = createRef<InputRef>();
      const schema = {
        '~standard': { validate: () => Promise.resolve({ value: 'a' }) },
      };
      await render(<Input ref={ref} schema={schema} defaultValue="a" />);
      expect(() => ref.current!.validate()).toThrow(ASYNC_SCHEMA_MESSAGE);
    });

    it('validates on blur, revalidates on a debounced change, then goes back to blur only', async () => {
      const schema = z.string().min(3, 'Too short');
      await render(<Input label="Name" schema={schema} />);
      const input = screen.getByLabelText('Name');

      await fireEvent.changeText(input, 'ab');
      await act(async () => jest.advanceTimersByTime(1000));
      expect(screen.queryByRole('alert')).toBeNull();

      await fireEvent(input, 'blur');
      expect(screen.getByRole('alert')).toHaveTextContent('Too short');

      await fireEvent.changeText(input, 'abc');
      await act(async () => jest.advanceTimersByTime(299));
      expect(screen.getByRole('alert')).toBeOnTheScreen();
      await act(async () => jest.advanceTimersByTime(1));
      expect(screen.queryByRole('alert')).toBeNull();

      await fireEvent.changeText(input, 'a');
      await act(async () => jest.advanceTimersByTime(1000));
      expect(screen.queryByRole('alert')).toBeNull();

      await fireEvent(input, 'blur');
      expect(screen.getByRole('alert')).toHaveTextContent('Too short');
    });

    it('lets the error prop win over the own error', async () => {
      const ref = createRef<InputRef>();
      await render(<Input ref={ref} required error="Server says no" />);
      await validateOnRef(ref);
      expect(screen.getByRole('alert')).toHaveTextContent('Server says no');
    });
  });
});

import { Text } from 'react-native';

import { fireEvent, render, screen } from '@testing-library/react-native';

const touch = { x: 5, y: 5, absoluteX: 5, absoluteY: 5 };
const layout = {
  nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 40 } },
};

import { Pressable, touchHitSlop } from './Pressable';

describe('Pressable', () => {
  it('calls the press handlers', async () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    await render(
      <Pressable
        testID="p"
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        <Text>Go</Text>
      </Pressable>
    );
    await fireEvent(screen.getByTestId('p'), 'layout', layout);
    await fireEvent(screen.getByTestId('p'), 'pressIn', touch);
    await fireEvent(screen.getByTestId('p'), 'pressOut', touch);
    await fireEvent.press(screen.getByTestId('p'), touch);
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables the native button and marks it in a11y', async () => {
    await render(
      <Pressable disabled>
        <Text>Go</Text>
      </Pressable>
    );
    // The native button drops touches when `enabled` is false.
    expect(screen.getByRole('button')).toHaveProp('enabled', false);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is an enabled button by default', async () => {
    await render(
      <Pressable>
        <Text>Go</Text>
      </Pressable>
    );
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('passes the pressed state to style and children', async () => {
    await render(
      <Pressable
        testID="p"
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
        {({ pressed }) => <Text>{pressed ? 'down' : 'up'}</Text>}
      </Pressable>
    );
    expect(screen.getByText('up')).toBeOnTheScreen();
    expect(screen.getByTestId('p')).toHaveStyle({ opacity: 1 });
    await fireEvent(screen.getByTestId('p'), 'layout', layout);
    await fireEvent(screen.getByTestId('p'), 'pressIn', touch);
    expect(screen.getByText('down')).toBeOnTheScreen();
    expect(screen.getByTestId('p')).toHaveStyle({ opacity: 0.5 });
  });

  it('merges the user a11y over the defaults', async () => {
    await render(
      <Pressable a11y={{ role: 'link', label: 'Docs', hint: 'Opens docs' }}>
        <Text>Go</Text>
      </Pressable>
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveProp('accessibilityHint', 'Opens docs');
  });

  it('lets native props override a11y', async () => {
    await render(
      <Pressable a11y={{ label: 'A11y' }} accessibilityLabel="Native">
        <Text>Go</Text>
      </Pressable>
    );
    expect(screen.getByRole('button', { name: 'Native' })).toBeOnTheScreen();
  });

  it('accepts hitSlop', async () => {
    await render(
      <Pressable testID="p" hitSlop={touchHitSlop(32)}>
        <Text>Go</Text>
      </Pressable>
    );
    expect(screen.getByTestId('p')).toBeOnTheScreen();
  });
});

describe('touchHitSlop', () => {
  it.each([
    [32, 8],
    [47, 1],
    [48, 0],
    [60, 0],
    [20, 14],
  ])('grows a %s pt control by %s per side', (size, slop) => {
    expect(touchHitSlop(size)).toEqual({
      top: slop,
      bottom: slop,
      left: slop,
      right: slop,
    });
  });

  it('computes each axis from its own size', () => {
    expect(touchHitSlop({ width: 100, height: 32 })).toEqual({
      top: 8,
      bottom: 8,
      left: 0,
      right: 0,
    });
  });
});

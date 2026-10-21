import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { withSpring, withTiming } from 'react-native-reanimated';

import { light, motion, touchTarget, typography } from '@/theme';

import { Button, buttonColors, PRESSED_OPACITY, PRESSED_SCALE } from './Button';
import type { ButtonVariant } from './Button.types';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return {
    __esModule: true,
    ...actual,
    withSpring: jest.fn(actual.withSpring),
    withTiming: jest.fn(actual.withTiming),
  };
});

// The hook's listener starts on the first render; keep its change handler to toggle the setting.
let setReducedMotion: (enabled: boolean) => void = () => {};
jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
jest
  .spyOn(AccessibilityInfo, 'addEventListener')
  .mockImplementation((event, handler) => {
    if ((event as string) === 'reduceMotionChanged') {
      setReducedMotion = handler as unknown as typeof setReducedMotion;
    }
    return { remove: jest.fn() } as unknown as ReturnType<
      typeof AccessibilityInfo.addEventListener
    >;
  });

const touch = { x: 5, y: 5, absoluteX: 5, absoluteY: 5 };
const layout = {
  nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 40 } },
};

const custom = '#ff0000';
const { colors } = light;
const families = ['primary', 'success', 'warning', 'danger', 'info'] as const;
const variants: ButtonVariant[] = [
  'solid',
  'subtle',
  'outline',
  'ghost',
  'link',
  'text',
];

const getButton = () => screen.getByTestId('button');

async function press() {
  await fireEvent(getButton(), 'layout', layout);
  await fireEvent(getButton(), 'pressIn', touch);
  await fireEvent(getButton(), 'pressOut', touch);
  await fireEvent.press(getButton(), touch);
}

beforeEach(() => jest.clearAllMocks());

describe('Button', () => {
  it('is a medium solid primary button by default', async () => {
    await render(<Button a11y={{ id: 'button' }}>Go</Button>);
    expect(getButton()).toHaveStyle({
      backgroundColor: colors.primary,
      minHeight: 48,
    });
    expect(screen.getByText('Go')).toHaveStyle({ color: colors.onPrimary });
    expect(screen.getByRole('button')).toBeEnabled();
  });

  describe.each(families)('%s', (family) => {
    it.each(variants)('colors the %s variant', async (variant) => {
      await render(
        <Button a11y={{ id: 'button' }} variant={variant} color={family}>
          Go
        </Button>
      );
      const expected = buttonColors(colors, variant, family, false);
      expect(getButton()).toHaveStyle({
        backgroundColor: expected.background,
        borderColor: expected.border,
      });
      expect(screen.getByText('Go')).toHaveStyle({ color: expected.content });
    });
  });

  it('maps each variant to theme roles', () => {
    expect(buttonColors(colors, 'solid', 'danger', false)).toEqual({
      background: colors.danger,
      content: colors.onDanger,
      border: 'transparent',
    });
    expect(buttonColors(colors, 'subtle', 'info', false)).toMatchObject({
      background: colors.infoSubtle,
      content: colors.onInfoSubtle,
    });
    expect(buttonColors(colors, 'outline', 'success', false)).toMatchObject({
      background: 'transparent',
      border: colors.successBorder,
    });
    expect(buttonColors(colors, 'text', 'warning', false).content).toBe(
      colors.text
    );
  });

  it('underlines link only, with no padding or background', async () => {
    await render(
      <Button a11y={{ id: 'button' }} variant="link">
        Go
      </Button>
    );
    expect(screen.getByText('Go')).toHaveStyle({
      textDecorationLine: 'underline',
    });
    expect(getButton()).toHaveStyle({ backgroundColor: 'transparent' });
    expect(getButton()).not.toHaveStyle({ paddingHorizontal: 16 });
    expect(getButton()).not.toHaveStyle({ minHeight: 48 });
  });

  it('leaves text without an underline', async () => {
    await render(<Button variant="text">Go</Button>);
    expect(screen.getByText('Go')).not.toHaveStyle({
      textDecorationLine: 'underline',
    });
    expect(screen.getByText('Go')).toHaveStyle({ color: colors.text });
  });

  describe('sizes', () => {
    it('S is 32 tall with a hitSlop up to the touch target', async () => {
      await render(
        <Button a11y={{ id: 'button' }} size="S">
          Go
        </Button>
      );
      expect(getButton()).toHaveStyle({ height: 32 });
      expect(getButton()).toHaveProp('hitSlop', {
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
      });
    });

    it.each([
      ['M', 48],
      ['L', 56],
    ] as const)('%s has a real minHeight of %i', async (size, minHeight) => {
      await render(
        <Button a11y={{ id: 'button' }} size={size}>
          Go
        </Button>
      );
      expect(getButton()).toHaveStyle({ minHeight });
      expect(getButton()).toHaveProp('hitSlop', {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      });
    });

    it('grows the hitSlop of link and text only vertically', async () => {
      await render(
        <Button a11y={{ id: 'button' }} variant="link">
          Go
        </Button>
      );
      const vertical = Math.ceil(
        (touchTarget.min - typography.label.lineHeight) / 2
      );
      expect(getButton()).toHaveProp('hitSlop', {
        top: vertical,
        bottom: vertical,
        left: 0,
        right: 0,
      });
    });

    it('lets the user hitSlop win', async () => {
      await render(
        <Button a11y={{ id: 'button' }} size="S" hitSlop={4}>
          Go
        </Button>
      );
      expect(getButton()).toHaveProp('hitSlop', {
        top: 4,
        bottom: 4,
        left: 4,
        right: 4,
      });
    });
  });

  it('calls the press handlers', async () => {
    const onPress = jest.fn();
    const onPressIn = jest.fn();
    const onPressOut = jest.fn();
    await render(
      <Button
        a11y={{ id: 'button' }}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>
        Go
      </Button>
    );
    await press();
    expect(onPressIn).toHaveBeenCalledTimes(1);
    expect(onPressOut).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  describe('press feedback', () => {
    it('springs the scale in and out', async () => {
      await render(<Button a11y={{ id: 'button' }}>Go</Button>);
      expect(getButton()).toHaveStyle({ transform: [{ scale: 1 }] });
      await fireEvent(getButton(), 'layout', layout);
      await fireEvent(getButton(), 'pressIn', touch);
      expect(withSpring).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({ ...motion.spring.snappy })
      );
      await fireEvent(getButton(), 'pressOut', touch);
      expect(withSpring).toHaveBeenLastCalledWith(0, expect.anything());
      expect(PRESSED_SCALE).toBeLessThan(1);
    });

    it('fades link and text instead of scaling', async () => {
      await render(
        <Button a11y={{ id: 'button' }} variant="link">
          Go
        </Button>
      );
      expect(getButton()).toHaveStyle({ opacity: 1 });
      expect(getButton()).not.toHaveStyle({ transform: expect.anything() });
      expect(PRESSED_OPACITY).toBeLessThan(1);
    });

    it('passes the pressed state to a function style', async () => {
      await render(
        <Button
          a11y={{ id: 'button' }}
          style={({ pressed }) => ({ borderRadius: pressed ? 1 : 2 })}>
          Go
        </Button>
      );
      expect(getButton()).toHaveStyle({ borderRadius: 2 });
      await fireEvent(getButton(), 'layout', layout);
      await fireEvent(getButton(), 'pressIn', touch);
      expect(getButton()).toHaveStyle({ borderRadius: 1 });
    });
  });

  describe('disabled', () => {
    it('blocks presses and uses the disabled colors', async () => {
      const onPress = jest.fn();
      await render(
        <Button a11y={{ id: 'button' }} disabled onPress={onPress}>
          Go
        </Button>
      );
      expect(screen.getByRole('button')).toBeDisabled();
      expect(getButton()).toHaveStyle({
        backgroundColor: colors.surfaceSunken,
      });
      expect(screen.getByText('Go')).toHaveStyle({
        color: colors.textDisabled,
      });
      // The native button drops touches when `enabled` is false.
      expect(getButton()).toHaveProp('enabled', false);
    });
  });

  describe('loading', () => {
    it('renders a busy skeleton instead of the button', async () => {
      await render(<Button loading>Go</Button>);
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.queryByText('Go')).toBeNull();
      const skeleton = screen.getByLabelText('Loading');
      expect(skeleton).toHaveProp('accessibilityState', { busy: true });
      expect(skeleton).toHaveStyle({ height: 48 });
    });

    it.each([
      ['S', 32],
      ['L', 56],
    ] as const)('sizes the skeleton for %s', async (size, height) => {
      await render(
        <Button loading size={size}>
          Go
        </Button>
      );
      expect(screen.getByLabelText('Loading')).toHaveStyle({ height });
    });
  });

  describe('pending', () => {
    it('shows a spinner, keeps the label for the width and sets busy', async () => {
      await render(
        <Button a11y={{ id: 'button' }} pending>
          Go
        </Button>
      );
      expect(screen.getByRole('button')).toHaveProp('accessibilityState', {
        disabled: true,
        busy: true,
      });
      expect(
        screen.getByLabelText('Loading', { includeHiddenElements: true })
      ).toBeTruthy();
      expect(
        screen.getByText('Go', { includeHiddenElements: true })
      ).toHaveStyle({ opacity: 0 });
    });

    it('blocks presses', async () => {
      await render(
        <Button a11y={{ id: 'button' }} pending>
          Go
        </Button>
      );
      expect(getButton()).toHaveProp('enabled', false);
    });

    it('keeps the regular colors', async () => {
      await render(
        <Button a11y={{ id: 'button' }} pending>
          Go
        </Button>
      );
      expect(getButton()).toHaveStyle({ backgroundColor: colors.primary });
    });
  });

  it('applies the user style last and a11y over the defaults', async () => {
    await render(
      <Button
        a11y={{ id: 'button', role: 'link', label: 'Open' }}
        style={{ backgroundColor: custom }}>
        Go
      </Button>
    );
    expect(getButton()).toHaveStyle({ backgroundColor: custom });
    expect(screen.getByRole('link', { name: 'Open' })).toBeTruthy();
  });

  // Last: the reduced-motion setting is app-wide once turned on.
  it('fades instead of scaling under reduced motion', async () => {
    await act(async () => setReducedMotion(true));
    await render(<Button a11y={{ id: 'button' }}>Go</Button>);
    expect(getButton()).toHaveStyle({ opacity: 1 });
    expect(getButton()).not.toHaveStyle({ transform: expect.anything() });
    await fireEvent(getButton(), 'layout', layout);
    await fireEvent(getButton(), 'pressIn', touch);
    expect(withSpring).not.toHaveBeenCalled();
    expect(withTiming).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ duration: motion.reducedMotionFade })
    );
  });
});

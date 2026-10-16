import { act, render, renderHook, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { withRepeat, withTiming } from 'react-native-reanimated';

import { light, radii, typography } from '@/theme';

import { useReducedMotion } from '../../hooks/reduced-motion/useReducedMotion';
import { PULSE_DURATION, Skeleton, STATIC_OPACITY } from './Skeleton';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return {
    __esModule: true,
    ...actual,
    withRepeat: jest.fn(actual.withRepeat),
    withTiming: jest.fn(actual.withTiming),
  };
});

const custom = '#ff0000';

// Hidden from screen readers by default, so queries must include hidden elements.
const getSkeleton = () =>
  screen.getByTestId('skeleton', { includeHiddenElements: true });

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

beforeEach(() => jest.clearAllMocks());

describe('Skeleton', () => {
  it('is sized like a body line by default', async () => {
    await render(<Skeleton testID="skeleton" />);
    const { fontSize, lineHeight } = typography.body;
    expect(getSkeleton()).toHaveStyle({
      width: '100%',
      height: fontSize,
      marginVertical: (lineHeight - fontSize) / 2,
      borderRadius: radii.sm,
      backgroundColor: light.colors.border,
    });
  });

  it('mimics a text preset', async () => {
    await render(<Skeleton testID="skeleton" variant="h1" />);
    expect(getSkeleton()).toHaveStyle({
      height: typography.h1.fontSize,
      marginVertical: (typography.h1.lineHeight - typography.h1.fontSize) / 2,
    });
  });

  it('takes explicit size and radius', async () => {
    await render(
      <Skeleton testID="skeleton" width={40} height={40} radius="full" />
    );
    expect(getSkeleton()).toHaveStyle({
      width: 40,
      height: 40,
      borderRadius: radii.full,
    });
    expect(getSkeleton()).not.toHaveStyle({
      marginVertical: 4,
    });
  });

  it('applies the user style last', async () => {
    await render(
      <Skeleton testID="skeleton" style={{ backgroundColor: custom }} />
    );
    expect(getSkeleton()).toHaveStyle({
      backgroundColor: custom,
    });
  });

  it('is hidden from screen readers unless told otherwise', async () => {
    await render(<Skeleton testID="skeleton" />);
    expect(getSkeleton()).toHaveProp(
      'importantForAccessibility',
      'no-hide-descendants'
    );

    await render(
      <Skeleton testID="shown" a11y={{ hidden: false, label: 'Loading' }} />
    );
    expect(screen.getByLabelText('Loading')).toHaveProp(
      'importantForAccessibility',
      'yes'
    );
  });

  it('pulses without reduced motion', async () => {
    await render(<Skeleton />);
    expect(withTiming).toHaveBeenLastCalledWith(
      0.5,
      expect.objectContaining({
        duration: PULSE_DURATION,
        reduceMotion: 'never',
      })
    );
    expect(withRepeat).toHaveBeenLastCalledWith(
      expect.anything(),
      -1,
      true,
      undefined,
      'never'
    );
  });

  // Last: the reduced-motion setting is app-wide once turned on.
  it('stays a static block under reduced motion', async () => {
    const { result } = await renderHook(() => useReducedMotion());
    await act(async () => setReducedMotion(true));
    expect(result.current).toBe(true);
    jest.clearAllMocks();

    await render(<Skeleton testID="skeleton" />);
    expect(withRepeat).not.toHaveBeenCalled();
    expect(withTiming).not.toHaveBeenCalled();
    expect(getSkeleton()).toHaveStyle({ opacity: STATIC_OPACITY });
  });
});

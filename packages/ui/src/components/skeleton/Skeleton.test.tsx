import { render, renderHook, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { withRepeat, withTiming } from 'react-native-reanimated';

import { light, radii, typography } from '@/theme';

import { useReducedMotion } from '../../hooks/reduced-motion/useReducedMotion';
import { PULSE_DURATION, Skeleton } from './Skeleton';

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

// The whole file runs with reduced motion on (the hook's listener starts on the first render).
jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

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

  it('keeps pulsing under reduced motion', async () => {
    await render(<Skeleton />);
    const { result } = await renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);

    const config = { duration: PULSE_DURATION, reduceMotion: 'never' };
    expect(withTiming).toHaveBeenLastCalledWith(
      0.5,
      expect.objectContaining(config)
    );
    expect(withRepeat).toHaveBeenLastCalledWith(
      expect.anything(),
      -1,
      true,
      undefined,
      'never'
    );
  });
});

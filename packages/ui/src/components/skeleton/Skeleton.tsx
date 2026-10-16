import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { radii, typography } from '@/theme';

import {
  easings,
  useMotion,
} from '../../hooks/reduced-motion/useReducedMotion';
import { easyA11y } from '../../utils/a11y/easyA11y';
import type { SkeletonProps } from './Skeleton.types';

/** Half a pulse cycle, in ms. */
export const PULSE_DURATION = 1000;
const PULSE_OPACITY = 0.5;
/** Fixed opacity under reduced motion, about the middle of the pulse. */
export const STATIC_OPACITY = 0.75;

/**
 * Loading placeholder with an opacity pulse. The pulse is decorative (`none`):
 * under reduced motion the block stays static.
 */
export function Skeleton({
  width = '100%',
  height,
  variant = 'body',
  radius = 'sm',
  a11y,
  style,
  ...rest
}: SkeletonProps) {
  const { mode, duration, reduceMotion } = useMotion('none', PULSE_DURATION);
  const opacity = useSharedValue(mode === 'static' ? STATIC_OPACITY : 1);

  useEffect(() => {
    if (mode === 'static') {
      opacity.set(STATIC_OPACITY);
      return;
    }
    // Restart from full opacity, also after leaving reduced motion mid-session.
    opacity.set(1);
    opacity.set(
      withRepeat(
        withTiming(PULSE_OPACITY, {
          duration,
          easing: easings.gentle,
          reduceMotion,
        }),
        -1,
        true,
        undefined,
        reduceMotion
      )
    );
    return () => cancelAnimation(opacity);
  }, [opacity, mode, duration, reduceMotion]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const { fontSize, lineHeight } = typography[variant];
  const size =
    height === undefined
      ? { height: fontSize, marginVertical: (lineHeight - fontSize) / 2 }
      : { height };

  return (
    <Animated.View
      {...easyA11y({ hidden: true, ...a11y })}
      {...rest}
      style={[
        styles.skeleton,
        { width, borderRadius: radii[radius] },
        size,
        pulse,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  skeleton: { backgroundColor: theme.colors.border },
}));

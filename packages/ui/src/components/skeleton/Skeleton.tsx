import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { motion, radii, typography } from '@/theme';

import {
  resolveMotion,
  useReducedMotion,
} from '../../hooks/reduced-motion/useReducedMotion';
import { easyA11y } from '../../utils/a11y/easyA11y';
import type { SkeletonProps } from './Skeleton.types';

/** Half a pulse cycle, in ms. */
export const PULSE_DURATION = 1000;
const PULSE_OPACITY = 0.5;

/**
 * Loading placeholder with an opacity pulse. The pulse is essential motion
 * (`keep`), so it still runs under reduced motion.
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
  const { duration, reduceMotion } = resolveMotion(
    'keep',
    useReducedMotion(),
    PULSE_DURATION
  );
  const opacity = useSharedValue(1);

  useEffect(() => {
    const easing = Easing.bezier(...motion.easing.gentle.bezier);
    opacity.set(
      withRepeat(
        withTiming(PULSE_OPACITY, { duration, easing, reduceMotion }),
        -1,
        true,
        undefined,
        reduceMotion
      )
    );
    return () => cancelAnimation(opacity);
  }, [opacity, duration, reduceMotion]);

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

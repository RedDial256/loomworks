import { type FC, useEffect, useState } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';

import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { motion } from '@/theme';

import {
  easings,
  useMotion,
} from '../../../hooks/reduced-motion/useReducedMotion';
import type { DateTimePart, InlinePickerProps } from '../DateTimeInput.types';
import { iosDisplay, themeVariant } from '../DateTimeInput.utils';

/**
 * iOS: the native picker in the layout, below the field (HIG: keep the picker
 * in context). Opens by growing to the picker's height and closes the same
 * way; under reduced motion it only fades.
 */
export const InlinePicker: FC<InlinePickerProps> = ({
  part,
  value,
  minimum,
  maximum,
  minuteInterval,
  locale,
  onChange,
}) => {
  // The part on screen: kept while the close animation runs.
  const [shown, setShown] = useState<DateTimePart | null>(part);

  const { mode, duration, reduceMotion } = useMotion(
    'fade',
    motion.duration.normal
  );
  const { theme, rt } = useUnistyles();
  const progress = useSharedValue(0);
  const height = useSharedValue(0);

  const animated = useAnimatedStyle(() => {
    const grow = mode === 'full' ? progress.get() : Math.ceil(progress.get());
    return { height: grow * height.get(), opacity: progress.get() };
  });

  if (part !== null && part !== shown) setShown(part);

  const measure = (event: LayoutChangeEvent) =>
    height.set(event.nativeEvent.layout.height);

  const handleChange = (_event: DateTimePickerChangeEvent, next: Date) =>
    onChange(next);

  useEffect(() => {
    if (part !== null) {
      progress.set(
        withTiming(1, { duration, easing: easings.standard, reduceMotion })
      );
      return;
    }
    progress.set(
      withTiming(
        0,
        { duration: duration / 2, easing: easings.standard, reduceMotion },
        (finished) => {
          if (finished) scheduleOnRN(setShown, null);
        }
      )
    );
  }, [part, progress, duration, reduceMotion]);

  if (shown === null) return null;

  return (
    <Animated.View style={[styles.clip, animated]}>
      <View onLayout={measure} style={styles.content}>
        <DateTimePicker
          testID="dateTimeInlinePicker"
          value={value}
          mode={shown}
          display={iosDisplay(shown)}
          minimumDate={minimum}
          maximumDate={maximum}
          minuteInterval={minuteInterval}
          locale={locale}
          accentColor={theme.colors.primary}
          textColor={theme.colors.text}
          themeVariant={themeVariant(rt.themeName)}
          onValueChange={handleChange}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  // Measured at its own height, whatever the clip shows.
  content: { position: 'absolute', top: 0, left: 0, right: 0 },
});

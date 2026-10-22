import { useState } from 'react';
import type {
  PressableEvent,
  PressableStateCallbackType,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  type ColorFamily,
  type ColorRole,
  motion,
  spacing,
  touchTarget,
  typography,
} from '@/theme';

import { useMotion } from '../../hooks/reduced-motion/useReducedMotion';
import { capitalize } from '../../utils/capitalize/capitalize';
import { Pressable, touchHitSlop } from '../pressable/Pressable';
import type { Insets } from '../pressable/Pressable.types';
import { Skeleton } from '../skeleton/Skeleton';
import { Spinner } from '../spinner/Spinner';
import type { SpinnerColor } from '../spinner/Spinner.types';
import { Text } from '../text/Text';
import type { ButtonProps, ButtonSize, ButtonVariant } from './Button.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Visual height of `S`; the `hitSlop` makes up the rest of the touch target. */
export const SMALL_HEIGHT = 32;
export const BUTTON_HEIGHTS = { S: SMALL_HEIGHT, M: 48, L: 56 } as const;

/** Scale while pressed; `link` and `text` fade instead. */
export const PRESSED_SCALE = 0.97;
export const PRESSED_OPACITY = 0.6;

const BARE: readonly ButtonVariant[] = ['link', 'text'];

const LABELS = {
  S: 'label',
  M: 'label',
  L: 'body',
} as const satisfies Record<ButtonSize, keyof typeof typography>;

interface ButtonColors {
  background: string;
  content: string;
  border: string;
}

/** Colors of a variant × family, in the theme's roles. */
export function buttonColors(
  colors: Record<ColorRole, string>,
  variant: ButtonVariant,
  family: ColorFamily,
  disabled: boolean
): ButtonColors {
  const on = capitalize(family);
  const solid = colors[family];
  const onSolid = colors[`on${on}` as ColorRole];
  const subtle = colors[`${family}Subtle` as ColorRole];
  const onSubtle = colors[`on${on}Subtle` as ColorRole];
  const outline = colors[`${family}Border` as ColorRole];
  if (disabled) {
    return {
      background:
        variant === 'solid' || variant === 'subtle'
          ? colors.surfaceSunken
          : 'transparent',
      content: colors.textDisabled,
      border: variant === 'outline' ? colors.border : 'transparent',
    };
  }
  switch (variant) {
    case 'solid':
      return {
        background: solid,
        content: onSolid,
        border: 'transparent',
      };
    case 'subtle':
      return {
        background: subtle,
        content: onSubtle,
        border: 'transparent',
      };
    case 'outline':
      return {
        background: 'transparent',
        content: onSubtle,
        border: outline,
      };
    case 'ghost':
    case 'link':
      return {
        background: 'transparent',
        content: onSubtle,
        border: 'transparent',
      };
    case 'text':
      return {
        background: 'transparent',
        content: colors.text,
        border: 'transparent',
      };
  }
}

/** `hitSlop` that brings a button up to the touch target; `undefined` when it already reaches it. */
function buttonHitSlop(bare: boolean, size: ButtonSize): Insets | undefined {
  if (bare) {
    return touchHitSlop({
      width: touchTarget.min,
      height: typography[LABELS[size]].lineHeight,
    });
  }
  if (size === 'S') return touchHitSlop(SMALL_HEIGHT);
  return undefined;
}

/** The animated component cannot take a function style, so it is resolved here. */
function resolveStyle(
  style: ButtonProps['style'],
  state: PressableStateCallbackType
) {
  if (typeof style === 'function') return style(state);
  return style;
}

/** Skeleton height standing in for the button. */
function loadingHeight(bare: boolean, size: ButtonSize): number {
  if (bare) return typography[LABELS[size]].lineHeight;
  return BUTTON_HEIGHTS[size];
}

/**
 * Button over the kit `Pressable`. It decides the press feedback: a spring
 * scale (opacity for `link` and `text`), a fade under reduced motion.
 */
export function Button({
  children,
  variant = 'solid',
  color = 'primary',
  size = 'M',
  loading = false,
  pending = false,
  disabled = false,
  a11y,
  style,
  hitSlop,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const { theme } = useUnistyles();
  const { mode, duration, reduceMotion } = useMotion(
    'fade',
    motion.duration.fast
  );
  const feedback = useSharedValue(0);
  const [pressed, setPressed] = useState(false);
  const bare = BARE.includes(variant);
  const fades = bare || mode === 'fade';
  styles.useVariants({ size: bare ? 'bare' : size });

  const pressedStyle = useAnimatedStyle(() => {
    const progress = feedback.get();
    if (fades) return { opacity: 1 - progress * (1 - PRESSED_OPACITY) };
    return { transform: [{ scale: 1 - progress * (1 - PRESSED_SCALE) }] };
  }, [fades]);

  if (loading) {
    return (
      <Skeleton
        height={loadingHeight(bare, size)}
        radius="md"
        a11y={{ label: 'Loading', hidden: false, ...a11y, busy: true }}
      />
    );
  }

  const { background, content, border } = buttonColors(
    theme.colors,
    variant,
    color,
    disabled
  );

  function animate(target: 0 | 1) {
    if (mode === 'static') {
      feedback.set(target);
    } else if (fades) {
      feedback.set(withTiming(target, { duration, reduceMotion }));
    } else {
      feedback.set(
        withSpring(target, { ...motion.spring.snappy, reduceMotion })
      );
    }
  }

  function handlePressIn(event: PressableEvent) {
    setPressed(true);
    animate(1);
    onPressIn?.(event);
  }

  function handlePressOut(event: PressableEvent) {
    setPressed(false);
    animate(0);
    onPressOut?.(event);
  }

  // Not a fresh literal: the `hovered` key exists only in some React Native versions.
  const state = { pressed, hovered: false };
  const buttonStyle = [
    styles.button,
    { backgroundColor: background, borderColor: border },
    pressedStyle,
    resolveStyle(style, state),
  ];
  const labelStyle = [
    styles.label,
    { color: content },
    variant === 'link' && styles.underline,
    pending && styles.hidden,
  ];

  return (
    <AnimatedPressable
      {...rest}
      a11y={{ role: 'button', busy: pending || undefined, ...a11y }}
      disabled={disabled || pending}
      hitSlop={hitSlop ?? buttonHitSlop(bare, size)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={buttonStyle}>
      <Text
        variant={LABELS[size]}
        style={labelStyle}
        a11y={{ hidden: pending }}>
        {children}
      </Text>
      {pending && (
        <Spinner
          size="S"
          color={content as SpinnerColor}
          style={styles.spinner}
          a11y={{ hidden: true }}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.radii.md,
    variants: {
      size: {
        S: { height: SMALL_HEIGHT, paddingHorizontal: spacing.sm },
        M: { minHeight: BUTTON_HEIGHTS.M, paddingHorizontal: spacing.md },
        L: { minHeight: BUTTON_HEIGHTS.L, paddingHorizontal: spacing.xl },
        bare: { borderWidth: 0, alignSelf: 'flex-start' },
      },
    },
  },
  label: { textAlign: 'center' },
  underline: { textDecorationLine: 'underline' },
  hidden: { opacity: 0 },
  spinner: { position: 'absolute' },
}));

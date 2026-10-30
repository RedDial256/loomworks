import type { FC } from 'react';
import { Text as NativeText } from 'react-native';

import { StyleSheet } from 'react-native-unistyles';

import type { TypographyVariant } from '@/theme';

import { easyA11y } from '../../utils/a11y/easyA11y';
import { Skeleton } from '../skeleton/Skeleton';

import type { TextProps } from './Text.types';

const HEADING_MAX_SCALE = 1.5;
const HEADINGS: TypographyVariant[] = ['h1', 'h2', 'h3', 'title'];

/**
 * Themed text. Headings get the `header` role and cap font scaling at 1.5x;
 * both can be overridden through props.
 */
export const Text: FC<TextProps> = ({
  variant = 'body',
  tone,
  a11y,
  loading,
  style,
  ...rest
}) => {
  styles.useVariants({ variant, tone });
  const heading = HEADINGS.includes(variant);
  const role = heading ? 'header' : undefined;
  if (loading) {
    return (
      <Skeleton
        variant={variant}
        testID={rest.testID}
        a11y={{ role, label: 'Loading', hidden: false, ...a11y, busy: true }}
      />
    );
  }
  const maxFontSizeMultiplier = heading ? HEADING_MAX_SCALE : undefined;
  return (
    <NativeText
      {...easyA11y({ role, ...a11y })}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
      style={[styles.text, style]}
    />
  );
};

const styles = StyleSheet.create((theme) => ({
  text: {
    variants: {
      variant: {
        h1: theme.typography.h1,
        h2: theme.typography.h2,
        h3: theme.typography.h3,
        title: theme.typography.title,
        body: theme.typography.body,
        bodySmall: theme.typography.bodySmall,
        label: theme.typography.label,
        caption: theme.typography.caption,
      },
      tone: {
        default: { color: theme.colors.text },
        muted: { color: theme.colors.textMuted },
        disabled: { color: theme.colors.textDisabled },
      },
    },
  },
}));

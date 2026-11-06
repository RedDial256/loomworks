import type { ViewProps, ViewStyle } from 'react-native';

import type { ColorRole, GradientName } from '@/theme';

import type { A11y } from '../../utils/a11y/easyA11y.types';

/** A theme color role, or any React Native color. */
// `string & {}` keeps the role names in autocomplete.
export type BackgroundColor = ColorRole | (string & {});

/** A theme gradient name, or any React Native `backgroundImage` (CSS string or gradient objects). */
export type BackgroundGradient =
  GradientName | NonNullable<ViewStyle['backgroundImage']>;

/**
 * A color or a gradient, never both. Theme tokens follow theme changes from
 * the stylesheet; other values are an inline style and follow the theme only
 * through a re-render (ADR 0004).
 */
export type BackgroundPaint =
  | {
      color: BackgroundColor;
      gradient?: never;
    }
  | {
      /** Drawn with `backgroundImage`. */
      gradient: BackgroundGradient;
      color?: never;
    };

export type BackgroundLayout =
  | {
      /**
       * Wrapper (default): the parent of its children. Put the radius on the
       * `Background`; add `overflow: 'hidden'` to clip the children too.
       */
      fill?: false;
      /** Simplified accessibility props; native props still win. Not accessible by default. */
      a11y?: A11y;
    }
  | {
      /**
       * Fills its parent (`absoluteFill`) behind the content: first child, no
       * touches, hidden from screen readers. The parent clips it with
       * `overflow: 'hidden'` to apply its radius.
       */
      fill: true;
      children?: never;
      a11y?: never;
    };

export type BackgroundProps = BackgroundPaint & BackgroundLayout & ViewProps;

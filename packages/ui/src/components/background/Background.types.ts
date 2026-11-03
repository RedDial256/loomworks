import type { ViewProps } from 'react-native';

import type { ColorRole, GradientName } from '@/theme';

import type { A11y } from '../../utils/a11y/easyA11y.types';

/** A theme color or a theme gradient, never both. */
export type BackgroundPaint =
  | {
      /** Theme color role. */
      color: ColorRole;
      gradient?: never;
    }
  | {
      /** Theme gradient, drawn with `backgroundImage`. */
      gradient: GradientName;
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

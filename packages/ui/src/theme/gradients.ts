import type { ColorFamily } from './contract';

/** One per color family (its `onX` content stays readable over every stop), plus `surface` and `scrim`. */
export type GradientName = ColorFamily | 'surface' | 'scrim';

/**
 * Two-stop linear gradient as a CSS string, the only form Unistyles updates on
 * theme changes (ADR 0004).
 */
export const linearGradient = (direction: string, from: string, to: string) =>
  `linear-gradient(${direction}, ${from}, ${to})`;

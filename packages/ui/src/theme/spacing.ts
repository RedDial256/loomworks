export const spacing = {
  '3xs': 2,
  '2xs': 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,
} as const;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/** Minimum touch target on both platforms (Apple 44, Material 48, WCAG 2.5.8). */
export const touchTarget = { min: 48 } as const;

/** Per-side `hitSlop` that grows a control of `visualSize` to the minimum touch target. */
export const hitSlopFor = (visualSize: number) =>
  Math.max(0, Math.ceil((touchTarget.min - visualSize) / 2));

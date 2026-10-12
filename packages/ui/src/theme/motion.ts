export const motion = {
  /** Durations in ms. */
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 400,
    slowest: 500,
  },
  /** Cubic-bezier control points with their default duration. */
  easing: {
    standard: { bezier: [0.4, 0, 0.2, 1], duration: 200 },
    gentle: { bezier: [0.42, 0, 0.58, 1], duration: 300 },
  },
  spring: {
    gentle: { stiffness: 158, damping: 25, mass: 1 },
    snappy: { stiffness: 380, damping: 31, mass: 1 },
    bouncy: { stiffness: 158, damping: 18, mass: 1 },
  },
  /** Crossfade used by animations that declare `fade` under reduced motion. */
  reducedMotionFade: 150,
} as const;

/** How an animation behaves when the system asks for reduced motion. */
export type ReducedMotionBehavior = 'none' | 'fade' | 'keep';

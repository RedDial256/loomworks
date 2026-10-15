import type { ReduceMotion } from 'react-native-reanimated';

/** How an animation runs: as designed, as an opacity crossfade, or jumping to its end state. */
export type MotionMode = 'full' | 'fade' | 'static';

/** Output of `resolveMotion` (ADR 0002). */
export interface ResolvedMotion {
  /** With `fade`, animate opacity instead of the designed transform. */
  mode: MotionMode;
  /** In ms; `0` for `static`. */
  duration: number;
  /** Always `ReduceMotion.Never`: pass it to Reanimated so it does not reduce again. */
  reduceMotion: ReduceMotion;
}

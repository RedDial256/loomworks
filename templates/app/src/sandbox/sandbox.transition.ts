/**
 * Card to demo transition, a T34 spike switch (ADR 0005).
 * - `zoom`: Expo Router's Apple zoom; iOS 18+ only, a plain push elsewhere.
 * - `shared`: Reanimated shared element transition; needs
 *   `reanimated.staticFeatureFlags.ENABLE_SHARED_ELEMENT_TRANSITIONS` in
 *   package.json and a native rebuild, a plain push without it.
 * - `none`: a plain push.
 */
export type CardTransition = 'none' | 'shared' | 'zoom';

export const CARD_TRANSITION = 'zoom' as CardTransition;

/** Tag shared by a card thumbnail and its demo's first section. */
export const sharedTagFor = (id: string) =>
  CARD_TRANSITION === 'shared' ? `demo-${id}` : undefined;

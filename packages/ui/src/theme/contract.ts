import type { ElevationLevel, ShadowStyle } from './elevation';
import type { motion } from './motion';
import type { radii, spacing, touchTarget } from './spacing';
import type { TypographyPreset, TypographyVariant } from './typography';

export type ColorFamily = 'primary' | 'success' | 'warning' | 'danger' | 'info';

/** Five roles per family: solid, its content, subtle fill, its content, border. */
type FamilyRole<F extends ColorFamily> =
  | F
  | `on${Capitalize<F>}`
  | `${F}Subtle`
  | `on${Capitalize<F>}Subtle`
  | `${F}Border`;

export type NeutralRole =
  | 'background'
  | 'surface'
  | 'surfaceRaised'
  | 'surfaceSunken'
  | 'text'
  | 'textMuted'
  | 'textDisabled'
  | 'border'
  | 'borderStrong'
  | 'focusRing'
  | 'overlay'
  | 'shadow';

export type ColorRole = NeutralRole | FamilyRole<ColorFamily>;

/** Every role is required, so a theme missing one fails to typecheck. */
export type ThemeColors = Record<ColorRole, string>;

export interface Theme {
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: Record<TypographyVariant, TypographyPreset>;
  motion: typeof motion;
  elevation: {
    shadow: Record<ElevationLevel, ShadowStyle>;
    /** Tonal overlay painted on raised surfaces (dark mode only). */
    tint: Record<ElevationLevel, string>;
    /** 1 px border for floating layers (dark mode only). */
    hairline: string;
  };
  touchTarget: typeof touchTarget;
}

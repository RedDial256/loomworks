export interface TypographyPreset {
  fontSize: number;
  /** Absolute line height in points (React Native has no multiplier). */
  lineHeight: number;
  fontWeight: '400' | '500' | '600';
  /** Set to use a custom font; the system font is used when undefined. */
  fontFamily?: string;
}

export type TypographyVariant =
  'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodySmall' | 'label' | 'caption';

export const typography: Record<TypographyVariant, TypographyPreset> = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '600' },
  h2: { fontSize: 28, lineHeight: 36, fontWeight: '600' },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
};

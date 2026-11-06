import type { ColorFamily, ThemeColors } from './contract';
import { dark } from './dark';
import type { GradientName } from './gradients';
import { light } from './light';

// WCAG 2.x relative luminance and contrast ratio for opaque `#rrggbb` colors.
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};

const families: ColorFamily[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];
const cap = (s: string) => `${s[0]?.toUpperCase()}${s.slice(1)}`;

// [content, background, minimum ratio]
const pairs = (): [keyof ThemeColors, keyof ThemeColors, number][] => {
  const out: [keyof ThemeColors, keyof ThemeColors, number][] = [];
  for (const f of families) {
    out.push([`on${cap(f)}` as keyof ThemeColors, f, 4.5]);
    out.push([`on${cap(f)}Subtle` as keyof ThemeColors, `${f}Subtle`, 4.5]);
  }
  for (const bg of [
    'background',
    'surface',
    'surfaceRaised',
    'surfaceSunken',
  ] as const) {
    out.push(
      ['text', bg, 4.5],
      ['textMuted', bg, 4.5],
      ['borderStrong', bg, 3]
    );
  }
  out.push(['focusRing', 'background', 3]);
  return out;
};

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme', (_name, theme) => {
  it.each(pairs())('%s on %s meets %s:1', (fg, bg, min) => {
    expect(contrast(theme.colors[fg], theme.colors[bg])).toBeGreaterThanOrEqual(
      min
    );
  });
});

// Every opaque stop of a gradient must keep its content readable.
const stops = (gradient: string): string[] =>
  gradient.match(/#[0-9a-f]{6}/gi) ?? [];

const gradientPairs = (): [keyof ThemeColors, GradientName, number][] => [
  ...families.map((f): [keyof ThemeColors, GradientName, number] => [
    `on${cap(f)}` as keyof ThemeColors,
    f,
    4.5,
  ]),
  ['text', 'surface', 4.5],
  ['textMuted', 'surface', 4.5],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s gradients', (_name, theme) => {
  it.each(gradientPairs())('%s over %s meets %s:1', (fg, name, min) => {
    const colors = stops(theme.gradients[name]);
    expect(colors).toHaveLength(2);
    for (const stop of colors) {
      expect(contrast(theme.colors[fg], stop)).toBeGreaterThanOrEqual(min);
    }
  });

  it('fades the scrim from transparent to the overlay', () => {
    expect(theme.gradients.scrim).toBe(
      `linear-gradient(to bottom, transparent, ${theme.colors.overlay})`
    );
  });
});

describe('Theme contract', () => {
  it('rejects a theme missing a role', () => {
    const { primary: _omit, ...rest } = light.colors;
    // @ts-expect-error `primary` is required
    const colors: ThemeColors = rest;
    expect(colors).not.toHaveProperty('primary');
  });
});

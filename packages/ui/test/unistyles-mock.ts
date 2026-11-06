// Minimal Unistyles for tests: styles resolve against the light theme and apply
// the variants passed to `useVariants` (the official mock strips variants).
import { type ComponentType, createElement } from 'react';

import { light } from '../src/theme/light';

type Style = Record<string, unknown>;
type Selection = Record<string, string | boolean | undefined>;
type Definition = Style | ((...args: unknown[]) => Style);

const resolve = (definition: Style, selected: Selection): Style => {
  const { variants, compoundVariants, ...base } = definition as {
    variants?: Record<string, Record<string, Style>>;
    compoundVariants?: (Selection & { styles: Style })[];
  };
  const out: Style = { ...base };
  for (const [group, options] of Object.entries(variants ?? {})) {
    const value = selected[group];
    Object.assign(
      out,
      options[value === undefined ? 'default' : String(value)]
    );
  }
  for (const { styles, ...when } of compoundVariants ?? []) {
    const matches = Object.entries(when).every(
      ([key, value]) => String(selected[key]) === String(value)
    );
    if (matches) Object.assign(out, styles);
  }
  return out;
};

export const StyleSheet = {
  create(
    factory:
      | Record<string, Definition>
      | ((
          theme: typeof light,
          rt: typeof UnistylesRuntime
        ) => Record<string, Definition>)
  ) {
    const definitions =
      typeof factory === 'function'
        ? factory(light, UnistylesRuntime)
        : factory;
    let selected: Selection = {};
    const styles: Record<string, unknown> = {
      useVariants: (variants: Selection = {}) => {
        selected = variants;
      },
    };
    for (const [name, definition] of Object.entries(definitions)) {
      Object.defineProperty(styles, name, {
        enumerable: true,
        get: () =>
          typeof definition === 'function'
            ? (...args: unknown[]) => resolve(definition(...args), selected)
            : resolve(definition, selected),
      });
    }
    return styles;
  },
  configure: () => {},
  hairlineWidth: 1,
  absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
};

export const UnistylesRuntime = {
  themeName: 'light',
  setTheme: () => {},
  setAdaptiveThemes: () => {},
  updateTheme: () => {},
  fontScale: 1,
  getTheme: () => light,
};

export const useUnistyles = () => ({ theme: light, rt: UnistylesRuntime });

type Mapping = (
  theme: typeof light,
  rt: typeof UnistylesRuntime
) => Record<string, unknown>;

// Same precedence as the real one: mappings, then `uniProps`, then the props.
export const withUnistyles =
  (Component: ComponentType<Record<string, unknown>>, mappings?: Mapping) =>
  ({ uniProps, ...props }: { uniProps?: Mapping } & Record<string, unknown>) =>
    createElement(Component, {
      ...mappings?.(light, UnistylesRuntime),
      ...uniProps?.(light, UnistylesRuntime),
      ...props,
    });

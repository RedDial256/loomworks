# ADR 0002: Design tokens and theme contract

Status: accepted (design session, values to be tuned with real components)

## Context

Loom components must look uniform, support light and dark themes, and be easy for users to customize after the CLI copies them into their project. The theme is consumed through Unistyles 3 and must share one typed `Theme` contract across themes.

Evidence: [color benchmark](../research/theme-color-benchmark.md), [typography benchmark](../research/typography-scale-benchmark.md), [motion, touch target and elevation benchmark](../research/motion-and-touch-target-benchmark.md). Compatibility constraints are in [ADR 0001](0001-expo-56-57-compatibility.md). Numbers marked "proposed" in the benchmarks are derivations, not published tokens.

## Decision

### Architecture

- Two layers: **primitives** (palette scales, raw values) and **semantic roles** (what components use). Components only consume semantic roles.
- `light` and `dark` themes implement one typed `Theme`. Every filled role has a content pair named `onX`. The type enforces both.
- Files copied by `loom init`: `palette`, `spacing`, `typography`, `motion`, `elevation`, `light`, `dark`, plus the Unistyles setup. Alias `@/theme` is the only alias components rely on.

### Color

- Palette: own `palette.ts`, 11-step scales (`50`…`950`), values taken from the Tailwind palette (MIT). Hues: `indigo`, `green`, `amber`, `red`, `sky`, `slate`.
- Families and hues: `primary` (indigo), `success` (green), `warning` (amber), `danger` (red), `info` (sky). No `secondary` in v1.
- Per family, five roles: `x`, `onX`, `xSubtle`, `onXSubtle`, `xBorder`. `onWarning` and `onInfo` are dark in both themes (amber and sky need dark content on the solid step); the other `onX` are light.
- Neutrals: `background`, `surface`, `surfaceRaised`, `surfaceSunken`, `text`, `textMuted`, `textDisabled`, `border`, `borderStrong`, `focusRing`, `overlay`, `shadow`.
- About 37 roles in total. Dark mode has its own surface ladder. Alpha roles (`overlay`, disabled) are precomputed strings.
- Final per-role values (decided in T05, `packages/ui/src/theme/light.ts` and `dark.ts`). Rule: solid on step 600 (700 for green, the first step where white text passes AA; 500/400 for amber and sky, which carry dark text), subtle fill on 50 (light) / 950 (dark), subtle content on 800 / 200, border on 300 / 800. A unit test checks WCAG contrast: every `onX` / `onXSubtle` pair and `text`/`textMuted` on every surface at 4.5:1, `borderStrong` and `focusRing` at 3:1.

| Role | Light | Dark |
|---|---|---|
| `primary` / `onPrimary` | indigo 600 / white | indigo 600 / white |
| `success` / `onSuccess` | green 700 / white | green 700 / white |
| `warning` / `onWarning` | amber 500 / amber 950 | amber 400 / amber 950 |
| `danger` / `onDanger` | red 600 / white | red 600 / white |
| `info` / `onInfo` | sky 500 / sky 950 | sky 400 / sky 950 |
| `xSubtle` / `onXSubtle` / `xBorder` | 50 / 800 / 300 | 950 / 200 / 800 |
| `background` / `surface` / `surfaceRaised` / `surfaceSunken` | slate 50 / white / white / slate 100 | slate 950 / 900 / 800 / black |
| `text` / `textMuted` / `textDisabled` | slate 900 / 600 / 400 | slate 50 / 400 / 600 |
| `border` / `borderStrong` | slate 200 / 500 | slate 800 / 500 |
| `focusRing` | indigo 500 | indigo 400 |
| `overlay` / `shadow` | slate 950 at 50% / slate 950 | black at 60% / black |

- The dark solid steps stay at the light ones because `onX` is light in both themes and lighter steps (indigo 500, green 600) fall below 4.5:1 with white. Tune visually once Phase 1 components exist.

### Spacing, radii and sizes

| Spacing | `3xs` 2 · `2xs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 20 · `xl` 24 · `2xl` 28 · `3xl` 32 · `4xl` 36 · `5xl` 40 |
|---|---|
| **Radii** | `none` 0 · `sm` 4 · `md` 8 · `lg` 12 · `xl` 16 · `full` 9999 |
| **Component size variants** | `'S' \| 'M' \| 'L'`, plus `'XS'` / `'XL'` only when a component needs them (uppercase literals) |

### Typography

Named presets, optional (`Text` `variant` defaults to `body`; `style` always overrides). Absolute line heights in points, as React Native has no multiplier. System font by default, `fontFamily` token reserved for user fonts.

| Preset | Size / line height | Weight |
|---|---|---|
| `h1` | 32 / 40 | 600 |
| `h2` | 28 / 36 | 600 |
| `h3` | 24 / 32 | 600 |
| `title` | 20 / 28 | 600 |
| `body` | 16 / 24 | 400 |
| `bodySmall` | 14 / 20 | 400 |
| `label` | 14 / 20 | 500 |
| `caption` | 12 / 16 | 400 |

No `display` preset in v1. No loose scales in v1. Keep `allowFontScaling` on and cap with `maxFontSizeMultiplier` on headings and fixed-height controls.

### Motion

- Durations (ms): `instant` 0 · `fast` 100 · `normal` 200 · `slow` 300 · `slower` 400 · `slowest` 500.
- Ease-in-out: `standard` cubic-bezier(0.4, 0, 0.2, 1) at 200 ms; `gentle` cubic-bezier(0.42, 0, 0.58, 1) at 300 ms.
- Springs (stiffness / damping / mass): `gentle` 158 / 25 / 1, `snappy` 380 / 31 / 1, `bouncy` 158 / 18 / 1. Ease and spring presets live in separate namespaces, so the shared name `gentle` does not clash.
- Reduced motion: each animation declares one of `none` (default; jump to the end state), `fade` (150 ms crossfade) or `keep` (essential motion without spatial movement, only `Spinner`: the motion is the information). `Skeleton` declares `none`: its shape and busy state already say it is loading, so under reduced motion it is a static block at 0.75 opacity (about the middle of its pulse) instead of a decorative loop, as Apple asks for automatic and repetitive animations. `fade` swaps the animated property (transform becomes opacity), not only the duration.
- The kit's `useReducedMotion` starts from Reanimated's value (read synchronously at launch, so the first render is right) and follows `AccessibilityInfo` and its change event, because Reanimated's hook is not reactive. A change event wins over a pending initial query.
- Components call `useMotion(behavior, duration)`, which reads the live setting; `resolveMotion(behavior, duration, reduced)` is the pure version for code outside React and tests. Both return the mode (`full`, `fade` or `static`), the duration and `reduceMotion: ReduceMotion.Never`. Kit animations always pass that `reduceMotion`: the kit has already decided, and Reanimated's default (`System`) would otherwise skip the crossfade and never start an infinite `withRepeat`. Components never use `ReducedMotionConfig`, which is global despite looking scoped.
- The theme keeps easings as cubic-bezier control points so it stays free of Reanimated (installed per item, not by `init`); the motion hook module builds them once as Reanimated `easings`.

### Elevation

Pairs iOS `shadow*` with Android `elevation`; `boxShadow` is an opt-in adapter (New Architecture only, RN 0.76+).

| Level | `elevation` | `shadowOffset.height` | `shadowRadius` | `shadowOpacity` |
|---|---|---|---|---|
| `none` | 0 | 0 | 0 | 0 |
| `sm` | 3 | 2 | 2.5 | 0.20 |
| `md` | 6 | 3 | 5 | 0.20 |
| `lg` | 12 | 7 | 10 | 0.22 |

Dark mode: tonal overlay of about 8%, 11% and 13.5% for `sm`, `md` and `lg`, halved shadow opacity, and a 1 px light hairline on floating layers. In the `Theme` these are `elevation.shadow` (spreadable style), `elevation.tint` and `elevation.hairline` (`transparent` in light).

### Touch target

- One token, `touchTarget.min = 48`, on both platforms (satisfies Apple 44, Material 48 and WCAG 2.5.8).
- Buttons, inputs and list rows use a real `minHeight` of 48, because `hitSlop` does not change the accessibility frame.
- Small controls keep their visual size and get `hitSlop = max(0, ceil((48 - visual) / 2))` per side, derived from the size variant and capped at half the gap to the nearest neighbor.

## Out of scope for v1

`opacity` and `borderWidth` tokens (components use local values), `zIndex`, icon sizes, breakpoints (Unistyles provides them), a `secondary` family, `display` typography, `boxShadow` as the default shadow path.

## Consequences

- Changing the brand is a palette edit; adding a family is one palette line plus five roles in the contract.
- Components stay small and readable, which suits the copy-into-your-project model.
- Token numbers are starting points and need a visual pass once Phase 1 components exist.

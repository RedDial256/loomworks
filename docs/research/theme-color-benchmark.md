# Theme color architecture benchmark

Date: 2026-10-09. Sources are primary only (official docs, first-party GitHub). Anything not confirmed from a primary page is tagged **[UNVERIFIED]**. Several first-party pages (m3.material.io, developer.apple.com) render client-side and returned no body text to the fetcher, so those libraries are only partially verified (see each section).

## 1. Comparison table

| Library | Layers | Role naming / pairing | Size | Theme switching / extension | TS / RN story |
|---|---|---|---|---|---|
| shadcn/ui | 2: semantic CSS vars; Tailwind `--color-*` mapping via `@theme inline`. No primitive ramp in the theme | `X` + `X-foreground` (surface + content), `background` suffix dropped | ~19 core roles + 5 chart + 8 sidebar | `:root` vs `.dark` overrides; custom role = var in both + `@theme inline` map | CSS-first, no typed theme object; web only (RN ports exist, not first-party) |
| Radix Colors | 1 primitive layer (scales). Semantics by step number | Step *number* = purpose (1 app bg ... 12 high-contrast text) | 12 steps per hue, light + dark scale sets | `blue` / `blueDark` scale files, `.dark` class; mutable alias recommended for app bg | JS exports per scale; web CSS vars; no RN theme runtime |
| Material 3 | 3: key colors -> tonal palettes (tone 0-100) -> roles | `role` / `onRole` / `roleContainer` / `onRoleContainer`; surface container ladder | ~40-50 roles in current MCU; Paper exposes ~30 | Roles map to different tones in light vs dark scheme; generate schemes from a source color | MCU is TS; Paper ships `MD3Theme` (RN) |
| RN Paper MD3 | Flat `colors` roles + `elevation` levels | MD3 names (`onPrimary`, ...) | ~30 keys + 6 elevation levels | Spread `MD3LightTheme` / `MD3DarkTheme`, own switching with `useColorScheme` | `useTheme<AppTheme>()` generic; RN native |
| Chakra v3 | 3: tokens (50-950 scales) -> semantic tokens -> recipes (component) | `bg`, `bg.subtle`, `fg`, `fg.muted`, `border`; per-palette `solid/contrast/fg/muted/subtle/emphasized/focusRing` | 11-step scales; ~7 roles per colorPalette | `{ base, _dark }` or `{ _light, _dark }` conditions; `createSystem` | `typegen` CLI for token types; web only |
| Tamagui | Tokens -> themes (nested by name) -> component themes | `background`, `color`, `borderColor` + `Hover/Press/Focus` variants; `color1..12` | Palette-driven; scale keys 1-12 | `light_blue_accent` naming, `<Theme name>`, `createThemes`, `updateTheme` | Typed against a base theme; RN supported (page itself is web-oriented) |
| Gluestack UI v3 / NativeWind | v3: numbered scales as CSS vars; v4 docs: shadcn-like semantic | v3: `primary-0..950`, `typography-*`, `background-*`; v4: `X` / `X-foreground` | 12-13 steps x ~10 groups (v3) | `vars()` per mode in `config.ts`, `mode` prop on provider | Tailwind classes; RN via NativeWind; no typed theme object |
| Mantine | Palette (10 shades) -> primaryColor/primaryShade -> CSS vars | Color key + index (`blue.6`); `virtualColor` for per-scheme | 10 shades | `data-mantine-color-scheme`, `virtualColor`, `primaryShade {light,dark}` | `MantineThemeColorsOverride` augmentation; web only |
| Apple UIColor | Semantic dynamic colors (+ asset catalog variants) | `label` / `secondaryLabel` / `tertiaryLabel`; `systemBackground` / `secondary...` / `tertiary...` | **[UNVERIFIED count]** | Trait collection resolves light/dark/contrast automatically | Native only; RN needs `PlatformColor` (**[UNVERIFIED here]**) |
| Unistyles 3 | Whatever you put in theme objects; library is layer-agnostic | Free-form (any JS object) | Unbounded | `StyleSheet.configure`, `adaptiveThemes`, `UnistylesRuntime.setTheme/updateTheme` | Module augmentation `UnistylesThemes`; native-first RN |

## 2. Per-library notes

### shadcn/ui
Source: https://ui.shadcn.com/docs/theming
- Default `:root` variables: `--background/--foreground`, `--card(-foreground)`, `--popover(-foreground)`, `--primary(-foreground)`, `--secondary(-foreground)`, `--muted(-foreground)`, `--accent(-foreground)`, `--destructive` (no `-foreground` in the scaffold), `--border`, `--input`, `--ring`, `--chart-1..5`, and `--sidebar*` (8 vars), plus `--radius`.
- Convention: "base token sets surface color, `-foreground` sets text/icon color on it"; the `background` suffix is omitted.
- Dark mode: same tokens overridden under `.dark`. Custom role: define under `:root` and `.dark`, then map with `--color-*` in `@theme inline` (e.g. `--warning` gives `bg-warning`, `text-warning-foreground`).
- Base colors offered: Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe. No separate custom-theme system documented; presets via shadcn/create.
- TS/RN: not covered by the page. Verified fully for the web side.

### Radix Colors
Sources: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale , https://www.radix-ui.com/colors/docs/overview/usage
- 12 steps: 1 app bg, 2 subtle bg, 3 UI element bg, 4 hovered, 5 active/selected, 6 subtle borders, 7 borders/focus rings, 8 hovered border, 9 solid bg, 10 hovered solid, 11 low-contrast text, 12 high-contrast text.
- Steps 11/12 guarantee APCA Lc 60 / Lc 90 on a step 2 background of the same scale. Step 9 is the purest; most pair with white text, but Sky, Mint, Lime, Yellow, Amber need dark text.
- Dark: separate `blueDark` scales applied to `.dark` / `.dark-theme`; light on `:root`, `.light`, `.light-theme`. Docs suggest a mutable alias for app background mapped per mode.
- Not confirmed from fetched pages: alpha scale naming (`blueA`), P3 variants **[UNVERIFIED]**.

### Material Design 3 and React Native Paper
Sources: https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/material_dynamic_colors.ts , .../typescript/scheme/scheme.ts , .../typescript/palettes/tonal_palette.ts , https://oss.callstack.com/react-native-paper/docs/guides/theming
- m3.material.io pages returned no body text; official role/guideline prose is **[UNVERIFIED]**. Facts below come from the reference implementation.
- `TonalPalette`: fixed hue and chroma, varying HCT tone 0-100.
- Roles in `MaterialDynamicColors`: surfaces (`background`, `surface`, `surfaceDim`, `surfaceBright`, `surfaceContainerLowest/Low/(none)/High/Highest`, `surfaceVariant`, `outline`, `outlineVariant`, `inverseSurface`, `shadow`, `scrim`, `surfaceTint`), and for each of primary/secondary/tertiary/error: `role`, `onRole`, `roleContainer`, `onRoleContainer`, with `*Fixed`, `*FixedDim`, `on*Fixed(Variant)` and (newer) `*Dim` variants.
- Light vs dark = same role at different tones. In the (deprecated) `Scheme` class: primary 40/80, onPrimary 100/20, primaryContainer 90/30, onPrimaryContainer 10/90, background/surface 99/10, onSurface 10/90, outline 50/60. `Scheme` is marked deprecated in favor of `DynamicScheme`.
- Paper (docs): keys `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`, same for secondary, tertiary, error; `background`, `onBackground`, `surface`, `onSurface`, `surfaceVariant`, `onSurfaceVariant`, `outline`, `surfaceDisabled`, `onSurfaceDisabled`, `shadow`, `inverseSurface`, `inverseOnSurface`, `inversePrimary`, `backdrop`, `elevation.level0..level5`.
- Paper switching: pass `MD3LightTheme` or `MD3DarkTheme` (spread + override `colors`) to `PaperProvider`; auto-follows device only when no custom theme is passed. Typing: `type AppTheme = typeof theme; useTheme<AppTheme>()`. Dynamic colors via `@pchmn/expo-material3-theme` on Android 12+.

### Chakra UI v3
Sources: https://www.chakra-ui.com/docs/theming/semantic-tokens , https://www.chakra-ui.com/docs/theming/colors , https://www.chakra-ui.com/docs/theming/customization/colors
- Tokens (`theme.tokens.colors`, scales 50-950) -> semantic tokens (`theme.semanticTokens.colors`) referencing `{colors.red.500}`. Component layer = recipes referencing semantic names.
- Conditions: `{ base: "{colors.red}", _dark: "{colors.darkred}" }` (semantic-tokens page) and `{ _light, _dark }` (customization page).
- Default semantics: `bg`, `bg.subtle/muted/emphasized/inverted/panel` (+ error/warning/success/info), `border` family, `fg`, `fg.muted/subtle/inverted`, per-palette `contrast, fg, subtle, muted, emphasized, solid, focusRing, border`. Custom colors need those roles to work with `colorPalette`.
- Naming: nested objects with a `DEFAULT` key. TS: `npx @chakra-ui/cli typegen ./src/theme.ts`. Web only.

### Tamagui
Sources: https://tamagui.dev/docs/intro/themes , https://tamagui.dev/docs/guides/theme-builder , https://tamagui.dev/docs/intro/colors
- A theme is a flat object (`background`, `color`, `borderColor`, `shadowColor`, `placeholderColor`, plus Hover/Press/Focus variants). Tokens are fallbacks.
- Nesting by name: `dark_green_subtle`; missing keys resolve to parent then tokens. Component themes: `dark_Circle` (capitalized).
- `createThemes` (`@tamagui/theme-builder`): `base.palette {light, dark}` (arrays; single array is reversed for dark), `accent`, `childrenThemes`, `grandChildrenThemes`, `componentThemes`. Default templates: `base, surface1-3, alt1, alt2, inverse`; templates are palette indices (negative from end). Output keys include `color1..12`, `background0..08`, `accent1..12`.
- Switching: `<Theme name="dark">`, `theme` prop, `defaultTheme`; runtime `addTheme/updateTheme/replaceTheme` (client only). TS: define one base theme and type others against it. RN specifics **[UNVERIFIED]** on these pages (examples are web-oriented).
- Docs-site palette shown on colors page: gray, blue, green, yellow, red, 12 steps (0-11) in light and dark.

### Gluestack UI v3 / NativeWind
Sources: https://gluestack.io/ui/docs/home/theme-configuration/customizing-theme , https://gluestack.io/ui/docs/home/theme-configuration/dark-mode , https://v3.gluestack.io/ui/docs/home/theme-configuration/default-tokens , https://www.nativewind.dev/docs/core-concepts/dark-mode
- Docs are versioned and mixed; the unversioned URLs now describe a newer shadcn-like system (`--background`, `--primary`, `--primary-foreground`, ..., bare RGB triplets in `vars()`, `@theme inline` mapping), while the v3 docs list numbered tokens.
- v3 default tokens: `primary`, `secondary` (0, 50-950), `tertiary` (50-950), `error/success/warning/info` (0, 50-950), `typography` (0, 50-950, white, gray, black), `outline` (0, 50-950), `background` (0, 50-950, error, warning, muted, success, info, light, dark), `indicator` (primary, info, error).
- Mechanism (both): `config.ts` exports `{ light: vars({...}), dark: vars({...}) }` using NativeWind `vars()`; `GluestackUIProvider mode="system|light|dark"`.
- NativeWind: follows device via RN `Appearance`; `colorScheme.set()` for manual override; on Expo needs `userInterfaceStyle: automatic`. CSS-variable theming docs page not retrieved (`vars()` detail only from gluestack pages).
- TS: no typed theme object; tokens are strings in Tailwind classes.

### Mantine
Sources: https://mantine.dev/theming/colors/ , https://mantine.dev/theming/color-schemes/
- Each color is a 10-shade tuple (0-9, higher = darker); `primaryColor` + `primaryShade` (number or `{ light, dark }`); `virtualColor()` maps one name to different colors per scheme; HEX/RGB/HSL/OKLCH accepted; `generateColors` builds 10 shades.
- Scheme: `data-mantine-color-scheme` on `<html>`, `defaultColorScheme` light|dark|auto, `forceColorScheme`, custom `colorSchemeManager`, hooks `useMantineColorScheme` / `useComputedColorScheme`.
- TS: extend `MantineThemeColorsOverride`. Web only. The `--mantine-color-body/text` variables were not confirmed from fetched pages **[UNVERIFIED]**.

### Apple HIG / UIColor (partial)
Sources: https://developer.apple.com/documentation/uikit/uicolor/secondarylabel (via search snippet), https://developer.apple.com/videos/play/wwdc2019/214/ , https://developer.apple.com/forums/thread/649770
- The HIG and "UI element colors" pages returned only titles. Confirmed through search snippets of first-party pages: `secondaryLabel` ("text labels that contain secondary content"), `separator` (thin borders/dividers, lets content show through), `secondarySystemBackground` (content layered on `systemBackground`); colors "can have a different value in Light Mode and in Dark Mode" and UIKit resolves and updates them automatically (WWDC19 214); UILabel/UITextField/UITextView default to `label`.
- **[UNVERIFIED from primary text]**: the full semantic list (label x4, systemBackground x3, grouped variants, fill x4, separator/opaqueSeparator, link, placeholderText), Increase Contrast variants, asset-catalog Any/Dark/High Contrast guidance. Treated as widely known, not cited.
- Pattern: roles are named by purpose and hierarchy depth (primary/secondary/tertiary/quaternary), not by hue; elevation/grouping is expressed as a background ladder.

### Unistyles 3
Sources: https://www.unistyl.es/v3/guides/theming , https://www.unistyl.es/v3/start/configuration , https://www.unistyl.es/v3/references/unistyles-runtime
- Any JS object is a theme; no limit. `StyleSheet.configure({ themes, breakpoints, settings })` must run before any component using Unistyles is imported.
- Settings (only four keys allowed): `adaptiveThemes`, `initialTheme` (name or sync fn), `CSSVars` (web, default true), `nativeBreakpointsMode`. `adaptiveThemes` requires themes named `light` and `dark` and cannot be combined with `initialTheme`.
- TS: "all themes should share the same type"; augment `UnistylesThemes` (and `UnistylesBreakpoints`) via `declare module 'react-native-unistyles'`.
- Access: `StyleSheet.create(theme => ({...}))`; `useUnistyles` is "not recommended" (re-renders on theme change).
- Runtime: `UnistylesRuntime.themeName`, `colorScheme` (`dark|light|unspecified`), `setTheme` (throws when adaptive is on; call `setAdaptiveThemes(false)` first), `hasAdaptiveThemes`, `updateTheme(name, updater)` (applies immediately if active), `getTheme`, `setRootViewBackgroundColor`.

## 3. Takeaways for a Unistyles 3 UI kit (primitives -> semantic roles)

**Shape.** Primitives are 11-12 step ramps per hue (Radix 12 / Chakra 50-950 / Mantine 10) plus neutral, exported as plain consts, never imported by components. One `Theme` type: `colors` (semantic only), plus non-color scales (spacing, radius, typography) shared across modes. Define `lightTheme` as the source and type `darkTheme: Theme`; register both as `light`/`dark` and augment `UnistylesThemes` so a missing role fails the build (Unistyles: all themes share one type).

**Naming and pairing.** Follow shadcn/M3: surface role `X` plus content role `onX` (or `X-foreground`; pick one, M3 `onX` reads better in camelCase TS). Group by intent, not hue: `background/onBackground`, `surface` ladder (`surface`, `surfaceMuted`, `surfaceRaised`), `primary/onPrimary`, `primaryContainer/onPrimaryContainer`, same for `secondary`, `danger`, `success`, `warning`, `info`; `border`, `borderStrong`, `focusRing`, `overlay/scrim`, `disabled/onDisabled`, and a text hierarchy (`text`, `textMuted`, `textSubtle`, as in Chakra `fg*` / Apple label levels). Pair every filled role with its content role so contrast is checkable per pair.

**Scaling steps.** Keep roles few (about 30-40; Paper ~30, shadcn ~19 core). Add new status hues as a fixed 4-5 role set (solid, onSolid, subtle, onSubtle, border), echoing Chakra's colorPalette and M3 containers, instead of adding single roles ad hoc. Map roles to ramp steps by rule (Radix: 1-2 bg, 3-5 interactive bg, 6-8 borders, 9-10 solid, 11-12 text) so dark mode is a per-role step remap, not a hand-picked set. Derive tones for dark per M3 (e.g. primary 40 -> 80, onPrimary 100 -> 20).

**Switching.** Register `light` and `dark` with `adaptiveThemes: true` for system-follow; for a user override, disable adaptive and call `setTheme`. Persist via `initialTheme` (sync read) since it cannot be combined with adaptive. Custom/brand themes: build with a `createTheme(primitives)` factory returning `Theme`, register under extra names, and use `updateTheme` for runtime tweaks.

**Pitfalls.**
- Components referencing primitives or hex values break theming; enforce with lint.
- Dark theme is not light with inverted numbers: surfaces need an elevation ladder (Paper uses `elevation.level0-5`; M3 `surfaceContainer*`).
- Alpha/opacity: Radix has alpha scales; shadcn-style RGB triplets enable `/50` in Tailwind but Unistyles uses plain strings, so precompute alpha roles (`overlay`, `disabled`) rather than concatenating at runtime.
- shadcn's `destructive` lacks a `-foreground` in the scaffold; always ship the content pair.
- `useUnistyles` re-renders on theme change; read the theme in `StyleSheet.create` callbacks. `configure` must run before importing components.
- `adaptiveThemes` requires exact names `light` and `dark` and conflicts with `initialTheme`.
- Paper only auto-follows the OS when no custom theme is passed; document who owns mode switching.
- Gluestack/NativeWind docs mix versions; do not copy token names without checking the version.
- Not applicable to native without a bridge: Apple dynamic colors need `PlatformColor`/`DynamicColorIOS` if native-system colors are wanted **[UNVERIFIED here, not researched]**.

## 4. Verification status
- Fully verified from primary text: shadcn/ui, Radix Colors (scale), Chakra v3, Mantine, Unistyles 3, Paper theming docs.
- Partial: Material 3 (reference implementation verified, m3.material.io prose not), Tamagui (RN specifics, types missing), Gluestack/NativeWind (version-mixed docs; NativeWind `vars()` page not retrieved), Radix (alpha/P3 not confirmed).
- Apple HIG: only snippets of first-party pages; most role lists unverified.

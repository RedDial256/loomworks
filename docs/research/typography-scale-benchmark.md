# Typography scale benchmark

Date: 2026-10-09. Scope: text styles, sizes, line heights and weights in the main design systems and UI kits, how React Native handles `lineHeight` and font scaling, and an evaluation of the proposed starter scale for the Loomworks RN UI kit.

Sources are primary only: official guidelines/docs and source code on GitHub. Values in `rem` were converted at 16px. "Verified" means the number was read from the cited URL during this research. Anything else is marked **UNVERIFIED**.

Method caveats:
- Apple HIG and m3.material.io are JS-rendered. Apple's numbers come from Apple's own JSON backing the page (`developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json`), read through a summarizing fetch tool. M3 numbers come from Google's `material-web` token files, not the m3.material.io page, which could not be rendered.
- Unit convention: iOS pt, Android sp and RN `fontSize`/`lineHeight` are all unitless density-independent numbers in RN, so they compare 1:1.

## Comparison table (size / line height, px or pt)

| Role | Proposed | Apple iOS (Large) | Material 3 | Tailwind | Chakra v3 text styles | Mantine | HeroUI Native | Tamagui v5 (native) |
|---|---|---|---|---|---|---|---|---|
| Display | none | none (Large Title 34/41 is the top) | Display L 57/64, M 45/52, S 36/44 | `text-5xl` 48/48 ... `text-9xl` 128/128 | `5xl` 48/60 ... `7xl` 72/92 | none | none | sizes 10-16: 40 ... 100 |
| h1 | 32/40 w700 | Large Title 34/41 Regular | Headline L 32/40 w400 | `4xl` 36/40 | `4xl` 36/44 | 34 / x1.3 w700 | 36/40 w600 (`text-4xl`) | size 9 = 32 / 37 |
| h2 | 28/36 w700 | Title 1 28/34 Regular | Headline M 28/36 w400 | `3xl` 30/36 | `3xl` 30/38 | 26 / x1.35 | 30/36 w600 | size 8 = 28 / 33 |
| h3 | 24/32 w600 | Title 2 22/28 Regular | Headline S 24/32 w400 | `2xl` 24/32 | `2xl` 24/32 | 22 / x1.4 | 24/32 w600 | size 7 = 24 / 29 |
| title | 20/28 w600 | Title 3 20/25 Regular | Title L 22/28 w400 | `xl` 20/28 | `xl` 20/30 | h4 18 / x1.45 | h4 20/28 w600 | size 5 = 20 / 25 |
| body | 16/24 w400 | Body 17/22 Regular (Headline 17/22 Semibold) | Body L 16/24 w400 | `base` 16/24 | `md` 16/24 | `md` 16 / x1.55 (24.8) | 16/28 | size 4 = 17 / 22 |
| bodySmall | 14/20 w400 | Subhead 15/20, Callout 16/21 | Body M 14/20 w400 | `sm` 14/20 | `sm` 14/20 | `sm` 14 / x1.45 (20.3) | 14/24 | size 3 = 15 / 20 |
| label | 14/20 w500 | n/a (use Subhead/Footnote + emphasis) | Label L 14/20 w500 | `sm` + `font-medium` | `label` style: `sm` 14/20 medium | `sm` + fw 600 | button label `text-sm`/`base` w500 | n/a |
| caption | 12/16 w400 | Caption 1 12/16 (Footnote 13/18, Caption 2 11/13) | Body S 12/16 w400; Label M 12/16 w500; Label S 11/16 w500 | `xs` 12/16 | `xs` 12/16 | `xs` 12 / x1.4 (16.8) | 12/20 | size 2 = 12 / 17 |
| Line height form | absolute | absolute pt | absolute sp | unitless ratio paired to a size (calc), `leading-*` also unitless | text styles absolute rem; `lineHeights` tokens unitless | unitless strings | resolved to absolute by Uniwind | absolute (function of size) |

Notes on the table: Mantine and Tamagui rows are mapped by position, not by official role name. HeroUI h5/h6 (18/28, 16/24) and Tamagui other steps are in the sections below.

## Per-source sections

### Apple Human Interface Guidelines (iOS)

Source: https://developer.apple.com/design/human-interface-guidelines/typography (data: https://developer.apple.com/tutorials/data/design/human-interface-guidelines/typography.json). Verified.

Dynamic Type, iOS/iPadOS, Large (default), size / leading in points, regular weight unless noted, emphasized weight in brackets:

| Style | Size | Leading | Weight (emphasized) |
|---|---|---|---|
| Large Title | 34 | 41 | Regular (Bold) |
| Title 1 | 28 | 34 | Regular (Bold) |
| Title 2 | 22 | 28 | Regular (Bold) |
| Title 3 | 20 | 25 | Regular (Semibold) |
| Headline | 17 | 22 | Semibold |
| Body | 17 | 22 | Regular (Semibold) |
| Callout | 16 | 21 | Regular (Semibold) |
| Subhead | 15 | 20 | Regular (Semibold) |
| Footnote | 13 | 18 | Regular (Semibold) |
| Caption 1 | 12 | 16 | Regular (Semibold) |
| Caption 2 | 11 | 13 | Regular (Semibold) |

- Leading is absolute points. Leading is about size + 5 (Body 17/22, Title 1 28/34); Large Title and Footnote deviate slightly. The ratio is roughly 1.19 to 1.35, tighter for large and looser for small.
- Recommended default / minimum sizes: iOS and iPadOS 17 pt / 11 pt (same page).
- Scaling: Body goes from 14/19 (xSmall) to 17/22 (Large) to 23/29 (xxxLarge), then AX1 28/34, AX2 33/40, AX3 40/48, AX4 47/56, AX5 53/62. Caption 1 goes 11/13 to 12/16 (Large) to 43/51 (AX5). Large Title goes 31/38 to 34/41 to 60/70. So leading scales with size, and larger sizes scale by smaller ratios.
- Guidance quotes: "Make sure your app's layout adapts to all font sizes" and to test with Larger Accessibility Text Sizes enabled. Tight/loose leading are available through symbolic traits; "If you need to display three or more lines of text, avoid tight leading".
- There is no "display" style above Large Title in iOS.

### Material Design 3

Source: Google's token files, https://github.com/material-components/material-web/blob/main/tokens/versions/latest/sass/_md-sys-typescale.scss and `_md-ref-typeface.scss` (weights regular 400, medium 500, bold 700). The m3.material.io page (https://m3.material.io/styles/typography/type-scale-tokens) could not be rendered by the fetch tool. Verified in the repo.

| Role | Size | Line height | Weight | Tracking |
|---|---|---|---|---|
| Display Large | 57 | 64 | 400 | -0.25 |
| Display Medium | 45 | 52 | 400 | 0 |
| Display Small | 36 | 44 | 400 | 0 |
| Headline Large | 32 | 40 | 400 | 0 |
| Headline Medium | 28 | 36 | 400 | 0 |
| Headline Small | 24 | 32 | 400 | 0 |
| Title Large | 22 | 28 | 400 | 0 |
| Title Medium | 16 | 24 | 500 | 0.15 |
| Title Small | 14 | 20 | 500 | 0.1 |
| Label Large | 14 | 20 | 500 | 0.1 |
| Label Medium | 12 | 16 | 500 | 0.5 |
| Label Small | 11 | 16 | 500 | 0.5 |
| Body Large | 16 | 24 | 400 | 0.5 |
| Body Medium | 14 | 20 | 400 | 0.25 |
| Body Small | 12 | 16 | 400 | 0.4 |

(Tracking in material-web is in rem, for example 0.03125rem = 0.5; converted here.) The repo also has an `emphasized` variant file (`_md-sys-typescale-emphasized.scss`), and Paper's tokens show emphasized variants using weight 500. Line height is absolute. Material says nothing in these tokens about multipliers.

### React Native Paper (MD3 typescale)

Source: https://github.com/callstack/react-native-paper/blob/main/src/theme/tokens/sys/typography.ts and `ref/typeface.ts` (weights '400', '500', '700'). Verified.

Same size and line height as the M3 table above (all absolute numbers, `lineHeight: 64, fontSize: 57`, etc.). Paper's letterSpacing values (0.15, 0.1, 0.5, 0.25, 0.4, Display Large -0.25) are plain numbers and equal the M3 tracking. Headlines/Display/Title Large use `brandRegular` (400); Title M/S and Labels use `plainMedium` (500). Paper additionally defines `*Emphasized` variants (weight 500). The font family is configurable through `configureFonts` (https://github.com/callstack/react-native-paper/blob/main/src/theme/fonts.tsx).

### Tailwind CSS (v4 default theme)

Source: https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css and https://tailwindcss.com/docs/font-size. Verified.

| Class | Size | Line height (as defined) | Resolved |
|---|---|---|---|
| `text-xs` | 0.75rem (12) | calc(1 / 0.75) | 16 |
| `text-sm` | 0.875rem (14) | calc(1.25 / 0.875) | 20 |
| `text-base` | 1rem (16) | calc(1.5 / 1) | 24 |
| `text-lg` | 1.125rem (18) | calc(1.75 / 1.125) | 28 |
| `text-xl` | 1.25rem (20) | calc(1.75 / 1.25) | 28 |
| `text-2xl` | 1.5rem (24) | calc(2 / 1.5) | 32 |
| `text-3xl` | 1.875rem (30) | calc(2.25 / 1.875) | 36 |
| `text-4xl` | 2.25rem (36) | calc(2.5 / 2.25) | 40 |
| `text-5xl` to `text-9xl` | 48, 60, 72, 96, 128 | 1 | = size |

Line height is stored as a unitless ratio computed from a rem value (so the result lands on a 4px grid), with `--leading-tight 1.25`, `snug 1.375`, `normal 1.5`, `relaxed 1.625`, `loose 2`. Weights are the usual 100-900 utilities (UNVERIFIED in this research; not fetched).

### shadcn/ui typography

Source: example files in https://github.com/shadcn-ui/ui/tree/main/apps/v4/examples/radix (typography-h1.tsx etc.). Verified for the listed classes; the docs page text itself did not render.

| Element | Classes |
|---|---|
| h1 | `text-4xl font-extrabold tracking-tight text-balance` (36/40, w800) |
| h2 | `text-3xl font-semibold tracking-tight border-b pb-2` (30/36, w600) |
| h3 | `text-2xl font-semibold tracking-tight` (24/32) |
| h4 | `text-xl font-semibold tracking-tight` (20/28) |
| p | `leading-7` (28px line height, base 16 text) |
| lead | `text-xl text-muted-foreground` |
| large | `text-lg font-semibold` |
| small | `text-sm leading-none font-medium` |
| muted | `text-sm text-muted-foreground` |

shadcn defers entirely to the Tailwind scale. Note `p` uses an absolute-ish `leading-7` (1.75rem), not the `text-base` pairing.

### Chakra UI v3

Source: https://github.com/chakra-ui/chakra-ui/tree/main/packages/react/src/theme (`tokens/font-sizes.ts`, `tokens/line-heights.ts`, `tokens/font-weights.ts`, `text-styles.ts`). Verified.

- Font size tokens: 2xs 0.625rem (10), xs 12, sm 14, md 16, lg 18, xl 20, 2xl 24, 3xl 30, 4xl 36, 5xl 48, 6xl 60, 7xl 72, 8xl 96, 9xl 128.
- Line height tokens (unitless multipliers): shorter 1.25, short 1.375, moderate 1.5, tall 1.625, taller 2.
- Font weights: thin 100, extralight 200, light 300, normal 400, medium 500, semibold 600, bold 700, extrabold 800, black 900.
- Named text styles pair size with an absolute rem line height: 2xs 10/12, xs 12/16, sm 14/20, md 16/24, lg 18/28, xl 20/30, 2xl 24/32, 3xl 30/38, 4xl 36/44 (tracking -0.025em), 5xl 48/60, 6xl 60/72, 7xl 72/92 (all with -0.025em from 4xl up), plus `label` (sm, 20, medium).

### Mantine

Source: https://github.com/mantinedev/mantine/blob/master/packages/%40mantine/core/src/core/MantineProvider/default-theme.ts. Verified.

- `fontSizes`: xs 12, sm 14, md 16, lg 18, xl 20.
- `lineHeights` (unitless strings): xs 1.4, sm 1.45, md 1.55, lg 1.6, xl 1.65.
- `headings`: weight 700; h1 34 / 1.3, h2 26 / 1.35, h3 22 / 1.4, h4 18 / 1.45, h5 16 / 1.5, h6 14 / 1.5.
- `fontWeights`: regular 400, medium 600, bold 700 (note: "medium" is 600).
- Line height is a multiplier. The text size and line height are separate token sets.

### Tamagui

Source: https://github.com/tamagui/tamagui/blob/main/code/core/config/src/v5-fonts.ts. Verified (code only; no official prose doc fetched).

- Native sizes (keyed 1-16): 1:11, 2:12, 3:15, 4:17 (also `true`), 5:20, 6:22, 7:24, 8:28, 9:32, 10:40, 11:46, 12:52, 13:60, 14:70, 15:85, 16:100. Comment in source: "aligned with iOS HIG (SF Pro)", 4 = body 17, 3 = subheadline 15, 2 = caption 12.
- Native line height: `Math.round(size + 5)` (absolute; source comment says "per iOS HIG (size + 5)"). Web sizes are 12-100 with line height 150% tapering to about 142%.
- Tamagui is the clearest example of a function-generated absolute line height from a numeric size ladder.

### Gluestack UI

Source: https://github.com/gluestack/gluestack-ui/blob/main/packages/gluestack-ui/templates/tailwind.config.js. Partially verified: the template config only adds `fontSize: { '2xs': '10px' }` and otherwise inherits the Tailwind default scale. I did not find any gluestack-specific typography presets. Anything beyond that is **UNVERIFIED**.

### Uniwind

Sources: https://docs.uniwind.dev/ (Tailwind v4 bindings for RN), https://github.com/uni-stack/uniwind/blob/main/packages/uniwind/src/core/native/store.ts, https://github.com/uni-stack/uniwind/blob/main/skills/uniwind/references/setup.md. Verified.

- Uniwind defines no typography scale of its own. It uses the Tailwind v4 theme: `text-base` resolves to fontSize 16 and lineHeight 24 (test `getWebStyles.test.ts`: "text-base -> fontSize 16px / lineHeight 24px"; `leading-3` = 12 in `typography.test.tsx`).
- `rem` base is configurable via the Metro option `polyfills: { rem: 16 }` (default 16).
- Native conversion: in `store.ts`, `if (result.lineHeight !== undefined && result.lineHeight < 6) result.lineHeight *= result.fontSize`. So unitless multipliers from Tailwind (for example 1.333) are converted to an absolute lineHeight in points for RN. Heuristic: values below 6 are treated as multipliers.
- Custom scales go in CSS via `@theme` (`--text-*`, `--text-*--line-height`); see https://docs.uniwind.dev/theming/custom-utilities.md.

### HeroUI Native (React Native)

HeroUI Native exists: https://github.com/heroui-inc/heroui-native (built on Uniwind). Verified from `src/styles/components/text.css`, `src/styles/components/button.css`, `label.css`, and `src/components/text/text.constants.ts`.

It defines no font-size tokens of its own (`src/styles/theme.css` has color/radius/shadow tokens only); it references the Tailwind tokens `--text-*` and `--text-*--line-height`. Named `Text` types:

| type | font size | line height | weight | tracking | iOS `dynamicTypeRamp` |
|---|---|---|---|---|---|
| h1 | `--text-4xl` (36) | 40 | semibold 600 | `--tracking-tight` | largeTitle |
| h2 | `--text-3xl` (30) | 36 | 600 | tight | title1 |
| h3 | `--text-2xl` (24) | 32 | 600 | tight | title2 |
| h4 | `--text-xl` (20) | 28 | 600 | tight | title3 |
| h5 | `--text-lg` (18) | 28 | 600 | tight | headline |
| h6 | `--text-base` (16) | 24 | 600 | tight | subheadline |
| body | `--text-base` (16) | `spacing * 7` = 28 | normal 400 | none | body |
| body-sm | `--text-sm` (14) | `spacing * 6` = 24 | 400 | none | body |
| body-xs | `--text-xs` (12) | `spacing * 5` = 20 | 400 | none | footnote |
| code | `--text-sm` (14) | 20 | 400 | none | body |

Pixel values assume the default Tailwind spacing unit (0.25rem = 4px at base 16); that spacing default was not re-fetched, so the 28/24/20 resolution is **UNVERIFIED** at the token level. Line heights are therefore absolute (spacing-derived) for body types and Tailwind-derived ratios resolved to absolute for headings. Button labels use `text-sm`/`text-base`/`text-lg` with `font-medium` (500) by size sm/md/lg. HeroUI React (web) docs were not consulted.

Interesting design points: HeroUI maps each text type to an iOS Dynamic Type ramp, and gives body copy a looser line height (1.75/1.71/1.67) than the Tailwind pairing.

## React Native: line height and font scaling

- Docs: https://reactnative.dev/docs/text-style-props (source: https://github.com/facebook/react-native-website/blob/main/docs/text-style-props.md). `lineHeight` is typed `number` and "specifies the distance between the baselines of consecutive lines". The docs do not state a unit or that it is a multiplier. In practice it is an absolute value in density-independent points (see source below). There is no unitless multiplier in RN core. CSS-like multipliers must be computed in JS (as Uniwind does).
- `allowFontScaling` default `true`; `maxFontSizeMultiplier`: undefined/null inherits from parent or global default (0), `0` means no max, `>= 1` sets the cap. Source: https://github.com/facebook/react-native-website/blob/main/docs/text.md. The docs do not mention `lineHeight` in these sections.
- iOS source (verified): https://github.com/facebook/react-native/blob/main/packages/react-native/ReactCommon/react/renderer/textlayoutmanager/platform/ios/react/renderer/textlayoutmanager/RCTAttributedTextUtils.mm: `lineHeight = textAttributes.lineHeight * RCTEffectiveFontSizeMultiplierFromTextAttributes(textAttributes)`. The multiplier is the effective font scale (from UIFontMetrics), capped by `maxFontSizeMultiplier` when `>= 1`. So lineHeight scales with fontSize and respects the cap.
- Android source (verified): https://github.com/facebook/react-native/blob/main/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/text/TextAttributeProps.kt: `lineHeight = if (allowFontScaling) toPixelFromSP(value) else toPixelFromDIP(value)`; font size uses `toPixelFromSP(fontSize, maxFontSizeMultiplier)`. In the code read, the lineHeight path does not pass `maxFontSizeMultiplier`, so the cap may not apply to line height on Android in that code path. Behavior at runtime was not tested, so treat this as **UNVERIFIED in practice**.
- With `allowFontScaling={false}`, both fontSize and lineHeight stay fixed (both use DIP).
- Implication: absolute `lineHeight` is safe in RN because it scales with the font on both platforms; a fixed `lineHeight` does not stay fixed under scaling. Pairing absolute line heights is therefore consistent with what iOS and Android recommend.
- iOS only: `dynamicTypeRamp` prop (default `'body'`) on `Text` picks which Dynamic Type curve scales this text (https://github.com/facebook/react-native-website/blob/main/docs/text.md). Useful so large titles scale less than body, as in Apple's tables.

## Accessibility scaling guidance

- Apple (verified): use text styles with system fonts for Dynamic Type including "larger accessibility type sizes"; "Make sure your app's layout adapts to all font sizes"; test with Larger Accessibility Text Sizes. URL: https://developer.apple.com/design/human-interface-guidelines/typography. Scaling tables (see Apple section) show leading increasing with size.
- Android (verified): Android 14 supports font scaling up to 200% with a nonlinear curve so large text scales less than small text; always specify text size in sp; define `android:lineHeight` in sp, otherwise the text "looks cramped"; do not use sp for padding or spacing. URL: https://developer.android.com/about/versions/14/features.
- Material 3 text-resizing guidance (https://m3.material.io/foundations/writing/text-resizing) exists but could not be rendered by the fetch tool, so statements such as "support at least 200%" are **UNVERIFIED** from the M3 page itself (the Android page above verifies the 200% platform behavior).

## Evaluation of the proposed starter scale

Proposed: h1 32/40/700, h2 28/36/700, h3 24/32/600, title 20/28/600, body 16/24/400, bodySmall 14/20/400, label 14/20/500, caption 12/16/400.

| Entry | Size / line height | Primary source match | Weight | Comment |
|---|---|---|---|---|
| h1 32/40 | Exact: M3 Headline Large 32/40 | M3 and Paper use 400 | 700 | Close to Apple Large Title 34/41 (Bold emphasized) and Mantine h1 34. Weight 700 is a style choice. Tailwind has no 32/40. |
| h2 28/36 | Exact: M3 Headline Medium 28/36 | M3 400 | 700 | Apple Title 1 is 28/34 (differs by 2 in line height). Tamagui size 8 = 28/33. |
| h3 24/32 | Exact: M3 Headline Small 24/32, Tailwind `2xl` 24/32, Chakra `2xl` 24/32, HeroUI h3 | M3 400, HeroUI 600 | 600 | Best-supported entry. Apple Title 2 is 22/28. |
| title 20/28 | Tailwind `xl` 20/28 exact; Apple Title 3 20/25; M3 Title Large is 22/28 | M3 400, Apple Title 3 400 regular (semibold emphasized) | 600 | Mixed. Size matches Apple/Tailwind, line height matches M3 and Tailwind. Not an M3 match (22). Chakra uses 20/30. |
| body 16/24 | Exact: M3 Body Large, Tailwind `base`, Chakra `md` | 400 | 400 | Differs from Apple Body 17/22 (Apple default is 17 pt, minimum 11 pt). HeroUI body uses 16/28. |
| bodySmall 14/20 | Exact: M3 Body Medium, Tailwind `sm`, Chakra `sm` | 400 | 400 | Apple has no 14; closest Subhead 15/20. |
| label 14/20 w500 | Exact: M3 Label Large 14/20/500; Chakra `label` style sm/20/medium | match | 500 | Fully matches. M3 adds tracking 0.1 (optional). |
| caption 12/16 w400 | Exact: Apple Caption 1 12/16, M3 Body Small 12/16, Tailwind `xs`, Chakra `xs` | match | 400 | Strongest match (3 systems plus Apple). M3 Label Small/Apple Caption 2 are 11. |

Findings:
- Every size/line-height pair in the proposal exists in at least one primary source; 7 of 8 match M3 and Tailwind/Chakra exactly. Only `title` (20/28) is a hybrid and does not correspond to an M3 token (M3 is 22/28).
- Weights are the weakest link. M3 uses 400 for headlines/title large and 500 for labels. Apple uses Regular for all non-Headline styles and Bold/Semibold only as emphasized. 700 on h1/h2 is common in web kits (Mantine headings 700, HeroUI 600, shadcn 600-800) but not a mobile-platform default. Pick it as a deliberate brand decision.
- Nothing wrong in the line height ratios (1.25, 1.29, 1.33, 1.4, 1.43, 1.5). They are in the same band as Apple (1.19-1.35 for larger styles; Body 1.29) and M3.
- Gaps against mobile practice: no 17 pt body option (Apple default); no 11 pt floor (Apple minimum is 11 pt, M3 Label Small 11); no tracking values; no emphasized weights for body (Apple/M3 both define them).

Suggested adjustments:
1. Keep all sizes and line heights; they are defensible. Optionally rename to M3 roles in docs (headline L/M/S, body L/M, label L, body S) so the provenance is traceable.
2. Decide the title style: use 22/28 to match M3 Title Large, or keep 20/28 and note that it follows Tailwind `xl` and Apple Title 3 in size.
3. Heading weights: consider 600 for h1/h2 (HeroUI, shadcn h2-h4, Chakra/Apple Semibold emphasized) unless brand needs 700. Mind that "bold" fonts need explicit font-family variants on RN.
4. Add `display` only if the product needs it (see below); otherwise skip.
5. Add a small `overline`/`captionSmall` 11/16 (M3 Label Small) only if needed; do not go below Apple's 11 pt.
6. Store line height as absolute numbers and tell users to pass them through `Text` with `allowFontScaling` on. Set `maxFontSizeMultiplier` (for example 1.3-1.5 on headings and fixed-height controls such as tab labels and buttons) rather than disabling scaling. On Android, the lineHeight cap behavior may not follow `maxFontSizeMultiplier` (see the RN section), so test at max font scale on a device.

## Common practice answers

- Is `display` common in mobile design systems? Mixed. M3 defines three Display sizes (57/45/36) and Paper inherits them; Chakra and Tailwind have large sizes (up to 128); HeroUI Native's largest named type is h1 (36/40), so it has no display style. Apple's iOS styles stop at Large Title 34/41, with no display style. Tamagui has sizes up to 100 without a name. For a utility-focused app kit, display is optional; a `display` style is mainly for marketing, hero and onboarding screens. This is an observation across the sources above, not a quote from a guideline.
- Absolute or multiplier line height? In mobile design systems and RN, absolute: Apple (pt leading), M3 and Paper (sp/number), Tamagui (size + 5), RN `lineHeight` itself (no unitless form). Web systems lean toward multipliers: Mantine (`1.3`, `1.4`...), Chakra `lineHeights` tokens (1.25-2), Tailwind (`calc(x / y)` ratios, resolved to rem). Several web systems use both forms: Chakra text styles use absolute rem, Tailwind line heights are ratios computed from fixed rem values. When web multipliers are used in RN, they are resolved to absolute numbers (Uniwind: values below 6 are multiplied by fontSize). Recommendation: store absolute values for the RN kit.

## Recommendation

Adopt the proposed scale largely as is: the sizes and line heights line up with M3 and Tailwind/Chakra tokens, and absolute line height matches Apple, Material, Tamagui and RN's `lineHeight` model. Make three small changes: decide between title 20/28 and M3's 22/28, justify or lower the h1/h2 weight (700 vs the 400-600 used by the primary sources), and add the missing 11 pt floor only if needed. Keep `display` optional, and document `allowFontScaling` plus a `maxFontSizeMultiplier` policy (iOS caps both size and line height, Android's lineHeight cap needs device testing). Optionally expose an iOS `dynamicTypeRamp` mapping as HeroUI Native does.

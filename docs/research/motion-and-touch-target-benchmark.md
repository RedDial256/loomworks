# Motion, touch target and elevation benchmark for a React Native UI kit

Scope: Expo SDK 56/57, Reanimated, Gesture Handler 3, Unistyles 3. Researched on 2026-10-09 against primary sources only (official docs, design guidelines, source code on GitHub). Every claim has a URL. Anything not confirmed from a primary source is tagged **[UNVERIFIED]**; things I derived myself (arithmetic, rounding, proposals) are tagged **[DERIVED]**.

Source caveats:
- Several official pages are JS-rendered and could not be fetched as text (m3.material.io pages, developer.android.com a11y pages). For Material I used the generated token files in `material-web` and AndroidX Compose source instead, which are primary and machine-generated from the same design system.
- Apple pages were read through Apple's own documentation JSON (`developer.apple.com/tutorials/data/...`), the same content that backs the HTML pages.
- "Latest" library versions seen: Reanimated 4.7.1, Gesture Handler 3.3.0 (GitHub releases API), Paper 5.15.3 (release) with a newer `main`, HeroUI Native 1.0.10 (package.json on main).

---

## Part A: Motion tokens

### A1. How the main systems define motion tokens

#### Material 3 (tokens)
Source: generated token file https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-motion.scss (also mirrored in Paper `main`: https://raw.githubusercontent.com/callstack/react-native-paper/main/src/theme/tokens/sys/motion.ts).

Durations (ms): short1 50, short2 100, short3 150, short4 200, medium1 250, medium2 300, medium3 350, medium4 400, long1 450, long2 500, long3 550, long4 600, extra-long1 700, extra-long2 800, extra-long3 900, extra-long4 1000.

Easings (cubic-bezier):

| Token | Value |
|---|---|
| emphasized | (0.2, 0, 0, 1) |
| emphasized-accelerate | (0.3, 0, 0.8, 0.15) |
| emphasized-decelerate | (0.05, 0.7, 0.1, 1) |
| standard | (0.2, 0, 0, 1) |
| standard-accelerate | (0.3, 0, 1, 1) |
| standard-decelerate | (0, 0, 0, 1) |
| legacy | (0.4, 0, 0.2, 1) |
| legacy-accelerate | (0.4, 0, 1, 1) |
| legacy-decelerate | (0, 0, 0.2, 1) |
| linear | (0, 0, 1, 1) |

Note: in this file `emphasized` and `standard` share the same bezier. The M3 "emphasized" curve is a path in the spec; the bezier is the web approximation. The spring tokens are not in the web file (see springs below). The m3.material.io spec page itself could not be fetched, so the spec's usage guidance (which duration for which component size) is **[UNVERIFIED]** here.

#### Apple HIG + SwiftUI
- HIG Motion (no numeric tokens, principles only): https://developer.apple.com/design/human-interface-guidelines/motion . Key lines (read from https://developer.apple.com/tutorials/data/design/human-interface-guidelines/motion.json): "Make motion optional"; "Aim for brevity and precision in feedback animations"; "generally avoid adding motion to UI interactions that occur frequently"; "Let people cancel motion... don't make people wait for an animation to complete".
- SwiftUI presets (https://developer.apple.com/documentation/swiftui/animation):
  - `.smooth`: "spring animation with a predefined duration and no bounce". Tunable form `smooth(duration: 0.5, extraBounce: 0.0)`, "base bounce of 0" (https://developer.apple.com/tutorials/data/documentation/swiftui/animation/smooth(duration:extrabounce:).json).
  - `.snappy`: "small amount of bounce"; `snappy(duration: 0.5, extraBounce: 0.0)`, "base bounce of 0.15" (.../animation/snappy(duration:extrabounce:).json).
  - `.bouncy`: "higher amount of bounce"; `bouncy(duration: 0.5, extraBounce: 0.0)`, "base bounce of 0.3" (.../animation/bouncy(duration:extrabounce:).json).
  - The parameterless presets do not state their duration in Apple docs; 0.5 s is the default of the tunable overloads **[DERIVED]**.
  - `.default` is a spring with response 0.55, dampingFraction 1.0, blendDuration 0 (iOS 17+) (.../animation/default.json).
  - `.easeInOut` / `.easeIn`: default duration 0.35 s (.../animation/easeinout.json, .../animation/easein.json). Apple does not publish the bezier in these docs **[UNVERIFIED]**.
  - `Spring(duration:bounce:)` semantics: bounce 0 = critically damped, 1.0 = undamped, negative = overdamped. Apple's own example: `Spring(duration: 0.5, bounce: 0.3)` gives mass 1.0, stiffness 157.9, damping 17.6 (https://developer.apple.com/tutorials/data/documentation/swiftui/spring.json).

#### Tailwind (v4 theme source)
https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css : `--ease-in: cubic-bezier(0.4,0,1,1)`, `--ease-out: cubic-bezier(0,0,0.2,1)`, `--ease-in-out: cubic-bezier(0.4,0,0.2,1)`, `--default-transition-duration: 150ms`, default timing = ease-in-out. Duration utilities are free numbers: `duration-<number>` = N ms (https://tailwindcss.com/docs/transition-duration). Reduced motion is encoded as a variant, not a token: `duration-300 motion-reduce:duration-0` (same page). Note Tailwind ease-in-out equals M3 "legacy".

#### Chakra v3
https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/theme/tokens/durations.ts : fastest 50ms, faster 100, fast 150, moderate 200, slow 300, slower 400, slowest 500.
https://raw.githubusercontent.com/chakra-ui/chakra-ui/main/packages/react/src/theme/tokens/easings.ts : ease-in (0.42,0,1,1), ease-out (0,0,0.58,1), ease-in-out (0.42,0,0.58,1), ease-in-smooth (0.32,0.72,0,1).

#### Mantine
`Transition` default `duration = 250`, `exitDuration = duration`, `timingFunction` defaults to the theme value (https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/components/Transition/Transition.tsx). Theme has `respectReducedMotion: false` by default (https://raw.githubusercontent.com/mantinedev/mantine/master/packages/@mantine/core/src/core/MantineProvider/default-theme.ts). Mantine's default timing function string was not confirmed **[UNVERIFIED]**.

#### Radix
Radix Primitives/Themes: I did not find a published motion-token set in the time available. **[UNVERIFIED / not investigated]**. Radix Primitives exposes animation hooks via CSS variables and `data-state` attributes only (not checked in source).

#### Tamagui
Presets live in https://raw.githubusercontent.com/tamagui/tamagui/main/code/core/config/src/animationsReanimated.ts (Reanimated driver) and `animations.ts` (RN Animated driver).

Reanimated driver: timing presets `0ms, 30ms, 50ms, 75ms, 100ms, 200ms, 250ms, 300ms, 400ms, 500ms`; springs (damping/mass/stiffness):

| Name | damping | mass | stiffness |
|---|---|---|---|
| superBouncy | 5 | 0.7 | 180 |
| bouncy | 9 | 0.9 | 120 |
| kindaBouncy | 16 | 1 | 25 |
| superLazy | 25 | 2 | 25 |
| medium | 16 | 0.8 | 90 |
| lazy | 18 | 0.2 | 10 |
| slowest | 15 | (default) | 10 |
| slow | 45 | (default) | 60 |
| quick | 25 | 1 | 550 |
| quickLessBouncy | 40 | 2 | 400 |

(first 90 lines read; the file may define more presets after `quickLessBouncy`.) RN-Animated driver (`animations.ts`): bouncy 9/0.9/150, lazy 18/-/50, medium 15/1/120, slow 15/-/40, quick 20/1.2/250, tooltip 10/0.9/100.

#### HeroUI Native / Uniwind
HeroUI Native 1.0.10 uses Reanimated 4.5.1 and Uniwind 1.12.0 (https://raw.githubusercontent.com/heroui-inc/heroui-native/main/package.json). No global motion-token file found: durations are per component in `*.animation.ts` files, e.g. checkbox uses `{ duration: 150 }`, `100`, `50` (https://raw.githubusercontent.com/heroui-inc/heroui-native/main/src/components/checkbox/checkbox.animation.ts); Button press scale defaults to 0.985 with a 300 ms timing and `Easing.out(Easing.ease)` shown in the doc comment of https://raw.githubusercontent.com/heroui-inc/heroui-native/main/src/components/button/button.styles.ts . It has an `animation` prop to override or disable (`animation={false}`). Uniwind itself: not investigated **[UNVERIFIED]**.

#### Comparison table (durations in ms)

| System | Fast | Base | Slow | Easing default | Reduced-motion encoding |
|---|---|---|---|---|---|
| Material 3 | 50-150 (short1-3) | 200-300 (short4, medium2) | 400-1000 | standard (0.2,0,0,1) / legacy (0.4,0,0.2,1) | not in tokens (platform-level) |
| Chakra v3 | 50-150 | 200 (moderate) | 300-500 | ease-in-out (0.42,0,0.58,1) | not in tokens |
| Tailwind | free number | 150 default | free number | (0.4,0,0.2,1) | `motion-reduce:` variant |
| Mantine | n/a | 250 | n/a | theme `timingFunction` | `respectReducedMotion` flag, default false |
| Tamagui | 30-100 | 200-300 | 400-500 + springs | spring presets | not in presets |
| HeroUI Native | 50-100 | 150 | 300 | `Easing.out(Easing.ease)` | per-component `animation` prop |
| SwiftUI | n/a | 0.35 s (easeInOut) | n/a | spring-first, 0.5 s | OS setting |

### A2. Spring presets

#### Reanimated (current source, v4.7.1)
https://raw.githubusercontent.com/software-mansion/react-native-reanimated/main/packages/react-native-reanimated/src/animation/spring/springConfigs.ts

- **Default `withSpring` is now `GentleSpringConfig`**, not the old 10/1/100: `spring.ts` merges `GentleSpringConfig` and `GentleSpringConfigWithDuration` as the defaults. Docs agree: default `stiffness 900, damping 120, mass 4`; duration-based `duration 550, dampingRatio 1`; `energyThreshold 6e-9`; `reduceMotion: System`. If both styles are passed, `duration`+`dampingRatio` win; "actual duration is 1.5 times" the perceptual `duration` (https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/).
- Presets exported in source:

| Preset | physics | duration-based |
|---|---|---|
| Reanimated3Default (legacy) | damping 10, mass 1, stiffness 100 | 1333 ms, ratio 0.5 |
| Wiggly | damping 90, mass 4, stiffness 900 | 550 ms, ratio 0.75 |
| Gentle (current default) | damping 120, mass 4, stiffness 900 | 550 ms, ratio 1 |
| Snappy | damping 110, mass 4, stiffness 900, overshootClamping | 550 ms, ratio 0.92, overshootClamping |

- `withTiming` default: `duration 300`, `easing Easing.inOut(Easing.quad)`, `reduceMotion System` (https://raw.githubusercontent.com/software-mansion/react-native-reanimated/main/docs/docs-reanimated/docs/animations/withTiming.mdx).
- Damping ratio check **[DERIVED]**: zeta = damping / (2 sqrt(stiffness*mass)). Gentle = 1.0, Snappy = 0.917, Wiggly = 0.75.

#### Material 3 springs (Compose, standard vs expressive)
Source: https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt and `ExpressiveMotionTokens.kt` (same folder); same numbers in Paper main `motion.ts`.

| Scheme | Role | Damping ratio | Stiffness |
|---|---|---|---|
| Standard | spatial default / fast / slow | 0.9 / 0.9 / 0.9 | 700 / 1400 / 300 |
| Standard | effects default / fast / slow | 1.0 | 1600 / 3800 / 800 |
| Expressive | spatial default / fast / slow | 0.8 / 0.6 / 0.8 | 380 / 800 / 200 |
| Expressive | effects default / fast / slow | 1.0 | 1600 / 3800 / 800 |

Spatial = position/size/shape (can overshoot); effects = color/opacity (never overshoot). Compose `spring()` uses unit mass, so conversion to Reanimated `damping = 2 * ratio * sqrt(stiffness)` with `mass: 1` **[DERIVED]**: expressive default spatial = stiffness 380, damping 31.2; expressive fast spatial = 800 / 33.9; expressive slow spatial = 200 / 22.6; standard default spatial = 700 / 47.6; effects default = 1600 / 80.

#### Apple
Converted with mass 1 using Apple's own anchor (duration 0.5, bounce 0.3 => stiffness 157.9, damping 17.6). Stiffness = (2 pi / duration)^2; damping = 4 pi (1 - bounce) / duration **[DERIVED]** (the formula is inferred from the single Apple data point and the documented semantics; only the 0.3 case is printed by Apple):

| Preset | duration | bounce | stiffness | damping | zeta |
|---|---|---|---|---|---|
| smooth | 0.5 s | 0 | 157.9 | 25.1 | 1.00 |
| snappy | 0.5 s | 0.15 | 157.9 | 21.4 | 0.85 |
| bouncy | 0.5 s | 0.3 | 157.9 | 17.6 | 0.70 |

#### Proposed spring presets for the kit (Reanimated physics config, mass 1) **[DERIVED proposals]**

| Token | stiffness | damping | mass | zeta | Overshoot | Use case |
|---|---|---|---|---|---|---|
| `spring.gentle` | 158 | 25 | 1 | ~1.0 | none | Bottom sheets, layout changes, large surfaces, anything where overshoot looks wrong. Apple `.smooth` equivalent |
| `spring.snappy` | 380 | 31 | 1 | ~0.8 | ~1.5% | Switch thumb, checkbox, segmented indicator, chip select, press release. M3 expressive default spatial |
| `spring.bouncy` | 158 | 18 | 1 | ~0.7 | ~4.6% | Playful confirmation, toast entrance, FAB reveal. Apple `.bouncy`. Use sparingly |
| `spring.effects` (optional) | 1600 | 80 | 1 | 1.0 | none | Opacity/color/scale of press feedback. M3 effects default |

Rounded from the values above. Always set `overshootClamping` for properties where overshoot is invalid (opacity, width of a progress bar).

#### Proposed ease-in-out presets **[DERIVED proposals]**

| Token | Bezier | Duration | Use case |
|---|---|---|---|
| `ease.standard` | (0.4, 0, 0.2, 1) (Tailwind ease-in-out = M3 legacy) | 200 ms | Color/opacity/size changes of controls, tab indicator, accordion, tooltip |
| `ease.soft` | (0.42, 0, 0.58, 1) (CSS `ease-in-out`, Chakra) | 300 ms | Symmetric, content crossfade, carousel/page slide where start and end should feel equal |
| `ease.emphasizedDecelerate` | (0.05, 0.7, 0.1, 1) (M3) | 400 ms | Entering elements (modal, popover enter) |
| `ease.emphasizedAccelerate` | (0.3, 0, 0.8, 0.15) (M3) | 200 ms | Exiting elements (leave faster than enter) |

Reanimated mapping: `Easing.bezier(x1,y1,x2,y2)` (API existence is standard; not re-fetched in this session). Reanimated's own default `Easing.inOut(Easing.quad)` is close to but not identical to `ease.soft`.

#### Proposed duration scale **[DERIVED]**
`instant 0`, `fast 100`, `base 200`, `moderate 300`, `slow 400`, `slower 500`. All values coincide with M3 short2/short4/medium2/medium4/long2 and Chakra fast..slowest, so the kit stays interoperable with both.

### A3. Reduced motion

#### Platform and standards guidance
- **Apple HIG Accessibility** (https://developer.apple.com/design/human-interface-guidelines/accessibility): when Reduce Motion is on, "ensure your app... responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion". Listed practices: tighten animation springs to reduce bounce; track animations directly with gestures; avoid animating depth changes in z-axis layers; **replace transitions in x-, y- and z-axes with fades**; avoid animating into and out of blurs. So Apple's answer is "swap to crossfade and tighten springs", not "remove everything". HIG Motion adds "Make motion optional" and do not use motion as the only way to communicate.
- **WCAG 2.2 SC 2.3.3 Animation from Interactions** (Level **AAA**): "Motion animation triggered by interaction can be disabled, unless essential". Understanding doc points to `prefers-reduced-motion` (techniques C39, SCR40) and notes scroll-driven movement is considered essential but extra scroll animation should be disableable (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Auto-starting animation is a separate criterion (2.2.2).
- **Material**: the m3.material.io accessibility/motion pages could not be fetched. Specific M3 reduced-motion guidance is **[UNVERIFIED]**. Android signal: React Native treats the Android "Transition Animation Scale = Animation off" developer option as reduce motion enabled (RN docs below).

#### React Native
https://reactnative.dev/docs/accessibilityinfo
- `AccessibilityInfo.isReduceMotionEnabled(): Promise<boolean>`.
- Event `reduceMotionChanged` via `AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => ...)`; returns a subscription (`.remove()`).
- iOS only: `AccessibilityInfo.prefersCrossFadeTransitions(): Promise<boolean>` (reports the "Reduce Motion + Prefer Cross-Fade Transitions" combination).

#### Reanimated
- `ReduceMotion` enum `System | Always | Never`; every `withTiming`/`withSpring`/`withDecay` and layout animation defaults to `System`; with the setting on, `withTiming`/`withSpring` return the target value immediately, entering/keyframe/layout animations jump to the end state, exiting animations and shared transitions are omitted (https://docs.swmansion.com/react-native-reanimated/docs/guides/accessibility/).
- `useReducedMotion()` returns a boolean read synchronously; **"reduced motion setting was enabled when the app started"** and "Changing the reduced motion system setting doesn't cause your components to rerender" (https://raw.githubusercontent.com/software-mansion/react-native-reanimated/main/docs/docs-reanimated/docs/device/useReducedMotion.mdx).
- `<ReducedMotionConfig mode={ReduceMotion.Never} />` overrides globally, default behavior "disables all animation when the reduced motion is enabled" (https://raw.githubusercontent.com/software-mansion/react-native-reanimated/main/docs/docs-reanimated/docs/device/ReducedMotionConfig.mdx).

Consequence **[DERIVED]**: Reanimated's default (System) is a blunt "disable", including opacity fades. To implement Apple's "swap to fade", the kit must (1) read the setting itself with `AccessibilityInfo` + `reduceMotionChanged` (because `useReducedMotion` is not reactive), and (2) run its replacement crossfade with `reduceMotion: ReduceMotion.Never` explicitly, otherwise the fade is also skipped.

#### Recommended behavior
| Motion type | Reduced behavior |
|---|---|
| Looping / automatic / decorative (shimmer, pulse, parallax, confetti) | Remove (static) |
| Translate / scale / z-depth transitions (sheet slide, page push, modal zoom) | Swap to opacity crossfade, `fast`-`base` duration (100-200 ms) |
| Springs with overshoot (bouncy, snappy) | Swap to `spring.gentle`-like critically damped (zeta >= 1) or timing, no bounce |
| Gesture-tracked motion (drag, swipe) | Keep (direct manipulation, per Apple) |
| State change feedback (color, opacity, checkmark) | Keep, short (<= 100-150 ms), no movement |
| Essential motion (progress, loading spinner) | Keep, but no large-area or parallax movement |

#### Token encoding
Encode reduction as a **second value per token** resolved by one runtime flag, not as `duration 0` everywhere:

```ts
motion = {
  duration: { fast: 100, base: 200, moderate: 300, slow: 400 },
  spring:   { gentle: {stiffness:158, damping:25, mass:1}, snappy: {...}, bouncy: {...} },
  reduced:  {
    duration: { default: 150 },            // crossfade duration
    spring:   'gentle',                     // all springs collapse to this
    transform: 'none',                      // translate/scale replaced by opacity
    loop: 'none'                            // looping animations removed
  }
}
```
A single `useMotion()` hook returns `{ reduced, duration(token), spring(token), transition(kind) }`; components ask for an intent (`enter`, `exit`, `press`, `loop`) and get either the full motion or the fallback. A plain `reduced duration = 0` is acceptable only for the Reanimated default path (identical to what `ReduceMotion.System` already does) and for purely decorative loops.

---

## Part B: Touch target and hitSlop

### B1. Minimum sizes

| Source | Value | URL |
|---|---|---|
| Apple HIG (Accessibility, "Offer sufficiently sized controls") | iOS/iPadOS: **default 44x44 pt, minimum 28x28 pt**; macOS 28/20; tvOS 66/56; visionOS 60/28; watchOS 44/28. Also: spacing is as important as size, about 12 pt padding around bezeled elements | https://developer.apple.com/design/human-interface-guidelines/accessibility |
| Material (Compose) | `minimumInteractiveComponentSize()` "Reserves at least 48.dp in size to disambiguate touch interactions" (Material recommended 48x48 dp) | https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/InteractiveComponentSize.kt |
| WCAG 2.2 SC 2.5.8 Target Size (Minimum), **AA** | 24x24 CSS px, exceptions: spacing (24 px circle not intersecting other targets), equivalent, inline, user agent, essential | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html |
| WCAG 2.2 SC 2.5.5 Target Size (Enhanced), **AAA** | 44x44 CSS px; exceptions equivalent, inline, user agent, essential | https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html |
| React Native `View.hitSlop` doc | "Typical interface guidelines recommend touch targets that are at least 30 - 40 points" (outdated vs the above); example extends a 20 pt view to 40 | https://reactnative.dev/docs/view |

Notes: the Apple 28 pt "minimum" row is new relative to the old "44 pt only" rule; 44 remains the default/recommended. The Android Developers a11y pages and m3.material.io target-size pages could not be fetched; the "8 dp between targets" Material guidance is **[UNVERIFIED]**. WCAG measures CSS px; applying it to RN dp/pt is a reasonable analogy, not a normative statement **[DERIVED]**.

### B2. How `hitSlop` works in React Native

- API: `hitSlop` is a `Rect` or number on `Pressable` and `View`: "additional distance outside of element in which a press can be detected" (https://reactnative.dev/docs/pressable). Pressable also has `pressRetentionOffset` (default `{top:20,left:20,right:20,bottom:30}`), the larger area in which an already-started press stays active before `onPressOut`.
- Docs limit: "The touch area never extends past the parent view bounds and the Z-index of sibling views always takes precedence if a touch hits two overlapping views." (both https://reactnative.dev/docs/pressable and https://reactnative.dev/docs/view).
- **Layout**: no effect. In source, hitSlop is used only for hit testing:
  - Android: `TouchTargetHelper.isTouchPointInView` accepts `x >= -left && x < width + right && y >= -top && y < height + bottom` for views implementing `ReactHitSlopView` (https://raw.githubusercontent.com/facebook/react-native/main/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/uimanager/TouchTargetHelper.kt ; `ReactViewGroup.hitSlopRect` in https://raw.githubusercontent.com/facebook/react-native/main/packages/react-native/ReactAndroid/src/main/java/com/facebook/react/views/view/ReactViewGroup.kt).
  - iOS (Fabric): `hitSlop` becomes `hitTestEdgeInsets` (negative insets) and `pointInside:` returns whether the point is inside the inflated rect (https://raw.githubusercontent.com/facebook/react-native/main/packages/react-native/React/Fabric/Mounting/ComponentViews/View/RCTViewComponentView.mm).
- **Accessibility frame**: a grep of `RCTViewComponentView.mm` for `accessibilityFrame`/`accessibilityActivationPoint` found no override, and the Android code above shows no accessibility-bounds change, so the screen reader focus rectangle stays the **visual view frame** (VoiceOver focus ring, TalkBack focus box, and presumably Switch Access / Accessibility Scanner target-size checks) **[DERIVED from absence in source; not tested on device]**. Practical effect: a screen reader user activates by double tap anywhere, so hitSlop does not hurt them, but it does not help (or satisfy) tools that measure the view bounds. Whether Android Accessibility Scanner counts hitSlop is **[UNVERIFIED]**.
- **Limits**:
  - Siblings with higher z-order win overlapping touches (docs). Dense toolbars therefore need slop <= half the gap to the neighbor.
  - Parent bounds clip the extra area per docs. In iOS source `betterHitTest` a clipping parent (`clipsToBounds`) rejects touches outside its own bounds, while a non-clipping parent still tests children (code comment: "does not stop algorithm if some touch is outside the view which does not have clipToBounds enabled"), so on iOS the doc statement is a conservative simplification **[PARTLY VERIFIED; Android parent behavior not confirmed]**. Safe rule for the kit: do not rely on slop beyond the parent's box or the screen edge.
- **Gesture Handler `Pressable`** (v3 docs, `hitSlop [A][I]`): "Additional distance outside of the view in which a press is detected and onPressIn is triggered"; `pressRetentionOffset` adds to it (https://raw.githubusercontent.com/software-mansion/react-native-gesture-handler/main/docs/docs-gesture-handler/docs/components/pressable.mdx).
  - Source: both the classic and the v3 implementation compute `appliedHitSlop = hitSlop + pressRetentionOffset` and hand it to the native gesture / native button, but **gate pressIn to `hitSlop` only** (`isTouchWithinInset(..., normalizedHitSlop, ...)` in https://raw.githubusercontent.com/software-mansion/react-native-gesture-handler/main/packages/react-native-gesture-handler/src/components/Pressable/Pressable.tsx and `v3/components/PressableWithTouchable.tsx`, `StatefulPressable.tsx` in the same package).
  - Known quirk in source: `// Gesture.Native().onStart() is broken with Android + hitSlop` (classic Pressable workaround). v3 `Pressable` dispatches to `PressableWithTouchable` (native button) unless relation props (`simultaneousWith`, `requireToFail`, `block`) are used, then `StatefulPressable` (state machine). RNGH hit testing for a gesture handler follows the same "never past the parent bounds" idea in practice, but I did not verify that in RNGH native code **[UNVERIFIED]**.

### B3. Patterns for guaranteeing the minimum

| Library | What it does | Evidence |
|---|---|---|
| React Native Paper (`IconButton`) | Visual = icon 24 + 2x8 padding = **40**; passes `hitSlop` 10 per side (6 when ripple unsupported) to `TouchableRipple`. So it uses **hitSlop from visual size** (effective 60 on supported platforms; this over-shoots 48) | https://raw.githubusercontent.com/callstack/react-native-paper/main/src/components/IconButton/IconButton.tsx |
| Material Compose | `minimumInteractiveComponentSize()` = **layout reservation** of 48 dp (the component keeps its visual size and is centered inside the 48 box) | InteractiveComponentSize.kt URL above |
| HeroUI Native | **Layout heights**: Button `sm` height 10, `md` 12, `lg` 14 (in `--spacing` units); with a 4 px spacing unit that is 40/48/56 (spacing value not confirmed here **[UNVERIFIED]**). Icon-only = square (`aspect-ratio: 1`). No hitSlop found in button | https://raw.githubusercontent.com/heroui-inc/heroui-native/main/src/styles/components/button.css |
| Gluestack (starter kit, uniwind) | Button variants `min-h-8` (sm), default, `min-h-10` (lg), icon `min-h-9 min-w-9` = 32/36/40; no hitSlop found; below 44 | https://raw.githubusercontent.com/gluestack/gluestack-ui/main/apps/starter-kit-expo-uniwind/components/ui/button/index.tsx |
| Tamagui | `Button.tsx` has no `hitSlop`/min-size logic (grep empty). Sizes come from the size token scale | https://raw.githubusercontent.com/tamagui/tamagui/main/code/ui/button/src/Button.tsx |
| Expo | Not investigated **[UNVERIFIED]** |  |

Trade-offs:
- `minWidth/minHeight` (+padding): real layout and real accessibility bounds (satisfies scanners, Switch Access focus rectangle, WCAG-style measurement). Cost: affects layout (rows get taller, alignment of small icons next to text needs care), cannot overlap neighbors.
- `hitSlop`: zero layout cost, visually compact, good for dense rows, icon buttons, checkboxes. Cost: invisible, not in the accessibility frame, clipped by parent bounds, loses to higher-z siblings, can overlap neighbors.

### B4. Recommendation for a kit with fixed S/M/L variants

**Token**: `size.touchTarget.min = 48` (single value) and a helper:

```ts
// per axis, in dp/pt
const slop = (visual: number, min = 48) => Math.max(0, Math.ceil((min - visual) / 2))
hitSlop = { top: slop(h), bottom: slop(h), left: slop(w), right: slop(w) }
```
Because S/M/L visuals are fixed, compute the slop once per variant at token level (no `onLayout`):

| Variant (example visual) | slop per side |
|---|---|
| S 32 | 8 |
| M 40 | 4 |
| L 48+ | 0 |
| Checkbox/Switch glyph 24 | 12 |

(Example sizes are illustrative **[DERIVED]**.)

Pattern: **variant tokens define a layout height >= 40-48 where the layout can afford it (buttons, list rows, inputs: use real `minHeight`), and use computed `hitSlop` only for small glyph-like controls (icon button, checkbox, radio, switch, chip close, link-like text) where growing the layout would break the design.** For anything the screen reader focuses, prefer the layout minimum. Cap slop at half the gap to the nearest interactive neighbor (e.g. `Math.min(slop, gap/2)`), and never rely on slop across a clipping parent.

**Per-platform 44 vs 48, or one 48?** Recommendation: **one value, 48, for hitSlop-derived targets**; do not branch per platform.
- For single 48: it satisfies Apple's 44 default, Material's 48, WCAG AA 24 and AAA 44 at once (sources in B1). Since hitSlop is invisible, the only cost is 2 pt extra per side on iOS, i.e. a slightly higher chance of overlapping neighbors; that is bounded by the neighbor-gap cap above. One token also keeps snapshot tests and cross-platform design specs identical (Unistyles variants stay platform-agnostic).
- For per-platform (`Platform.select({ ios: 44, android: 48 })`): matches each platform's guidance exactly and reduces slop overlap in dense iOS layouts (HIG itself says spacing matters as much as size). Trade-off: platform-divergent values for no user-visible visual difference, and Paper's real implementation already over-shoots both (60).
- Policy line: **layout minimum follows the platform (44 iOS, 48 Android) when it is real layout, e.g. buttons designed at 44 on iOS stay 44; the invisible hitSlop target uses the single 48**. If a team wants one rule only, use 48. Apple's new 28 pt "minimum" is a floor for tight macOS-like density, not a target for touch UIs; do not use it for iOS touch controls.

---

## Part C: Elevation and shadows

### C1. React Native core support
- `boxShadow` (https://reactnative.dev/docs/view-style-props): "only available on the New Architecture. Outset shadows are only supported on **Android 9+**. Inset shadows are only supported on **Android 10+**". Accepts a web-syntax string or an array of `BoxShadowValue`; multiple layers allowed; "spec-compliant implementation of the web style prop".
- Version: the RN docs page does not state a version. The RN changelog shows "Add official `boxShadow` CSSProperty" under **v0.76.0** (https://raw.githubusercontent.com/facebook/react-native/main/CHANGELOG-0.7x.md, line 1186 within the v0.76.0 section), and Android outset support ("Support OutsetBoxShadowDrawable on Android 9+") lands in the same section. Earlier it was `experimental_boxShadow`.
- `shadow*` props (https://reactnative.dev/docs/shadow-props): "only `shadowColor` works on both Android and iOS, all other `shadow` props only work on iOS"; `shadowColor` on Android needs API 28+ and colors the `elevation` shadow. `shadowOffset/Opacity/Radius`: iOS only. The page also says: "Both boxShadow and dropShadow are generally more capable than the shadow props. The shadow props, however, map to native platform-level APIs, so if you only need a straightforward shadow these props are recommended." `dropShadow` is Android-only.
- `elevation` (https://reactnative.dev/docs/view-style-props): Android only, "adds a drop shadow to the item and affects z-order for overlapping views", Android 5.0+.
- Relationship: iOS `shadow*` (a CALayer shadow) + Android `elevation` (platform z + light-source shadow, also affects z-order) are two separate mechanisms. `boxShadow` is a third, drawn by RN itself on both platforms (`RCTBoxShadow.mm` on iOS; drawables on Android), does not affect z-order or the Android system shadow, and its blur is not 1:1 with `shadowRadius` (Paper notes iOS `shadowRadius` should be half the CSS blur, citing RCTBoxShadow.mm).

### C2. How systems define / pair elevation

| System | Definition | Source |
|---|---|---|
| Material 3 | Levels **0-5 = 0, 1, 3, 6, 8, 12 dp** | https://raw.githubusercontent.com/material-components/material-web/main/tokens/versions/v0_192/_md-sys-elevation.scss |
| Paper `Surface` (v5.15.3 release, `src/styles/shadow.tsx`) | MD3 `elevation` prop 0-5. iOS: `shadowColor` primary0, `shadowOpacity` 0.3 (0 if level 0), `shadowOffset.height` `[0,1,2,4,6,8]`, `shadowRadius` `[0,3,6,8,10,12]`. Android: native `elevation` | https://raw.githubusercontent.com/callstack/react-native-paper/v5.15.3/src/styles/shadow.tsx |
| Paper `main` (`src/theme/tokens/sys/elevation.ts`, unreleased at check time) | `defaultElevation` level0-5 = 0..5, `androidElevationLevels = [0,1,3,6,8,12]`. `shadow(elevation, color)` returns **two layers** (spot alpha 0.19 and ambient alpha 0.039) computed from Android light-source geometry; iOS `shadowRadius` = blur / 2; web returns a `boxShadow` string. `Surface` applies layers on nested views and uses `elevation` on Android; doc: `overflow: 'hidden'` "is not supported with elevation as it can clip the shadow" | https://raw.githubusercontent.com/callstack/react-native-paper/main/src/theme/tokens/sys/elevation.ts , `.../src/components/Surface.tsx` |
| Tamagui | Only shadow **colors** are defined in the themes (light 0.085 / 0.04 alpha black, dark 0.3 / 0.2), size/offset come from component props (`shadowRadius` etc.) | https://raw.githubusercontent.com/tamagui/tamagui/main/code/core/themes/src/shadows.tsx |
| HeroUI Native | Uses CSS-style `boxShadow` tokens: `--surface-shadow: 0 2px 4px 0 rgba(0,0,0,.04), 0 1px 2px 0 rgba(0,0,0,.06), 0 0 1px 0 rgba(0,0,0,.06)`; `--overlay-shadow: 0 2px 8px 0 rgba(0,0,0,.02), 0 -6px 12px 0 rgba(0,0,0,.01), 0 14px 28px 0 rgba(0,0,0,.03)`; `--field-shadow` = surface. **Dark mode**: surface shadow none, overlay becomes a 1px inset light ring `rgba(255,255,255,.2)` | https://raw.githubusercontent.com/heroui-inc/heroui-native/main/src/styles/variables.css |
| Gluestack | Class tokens `shadow-hard-*` (e.g. FAB uses `shadow-hard-2`); where they are defined was not located **[UNVERIFIED]** | https://raw.githubusercontent.com/gluestack/gluestack-ui/main/apps/starter-kit-expo-uniwind/components/ui/fab/index.tsx |
| Apple HIG | No numeric shadow tokens; shadows are expressed through system materials/depth. Not investigated beyond this; **[UNVERIFIED]** | n/a |

Paper `main` computed values **[DERIVED]** (my evaluation of its formulas, not printed in the source). Spot layer, offset-y / iOS shadowRadius, opacity 0.19; ambient layer radius = dp/128*64/2, opacity 0.039:

| Android dp | spot offsetY | spot iOS radius | ambient iOS radius |
|---|---|---|---|
| 1 | 0.55 | 0.79 | 0.25 |
| 3 | 1.66 | 2.35 | 0.75 |
| 6 | 3.33 | 4.75 | 1.5 |
| 8 | 4.46 | 6.36 | 2.0 |
| 12 | 6.75 | 9.61 | 3.0 |

### C3. Recommendation: four levels **[DERIVED proposals]**

RN iOS can only apply one shadow layer per view, so collapse the spot layer (the dominant one) with opacity raised slightly to account for the missing ambient layer (0.19 + 0.039 is about 0.23, so use 0.2-0.22). Android uses the M3 dp values so the platform renders the system shadow.

| Token | Android `elevation` | iOS `shadowOffset.height` | iOS `shadowRadius` | iOS `shadowOpacity` | `shadowColor` |
|---|---|---|---|---|---|
| `elevation.none` | 0 | 0 | 0 | 0 | black |
| `elevation.sm` | 3 (M3 level 2) | 2 | 2.5 | 0.20 | black |
| `elevation.md` | 6 (M3 level 3) | 3 | 5 | 0.20 | black |
| `elevation.lg` | 12 (M3 level 5) | 7 | 10 | 0.22 | black |

(All with `shadowOffset.width = 0`; rounding from the Paper-main table above. M3 levels 1 and 4 intentionally skipped; 1 dp is almost invisible. Set `shadowColor` on both platforms so Android 9+ tints correctly.) A `elevation.xl` is not proposed; modals use `lg` plus a scrim.

**Should `boxShadow` replace the pairing?** Recommendation: **not by default; keep `shadow*` + `elevation` as the base implementation, and offer `boxShadow` as an opt-in adapter.**
- RN docs themselves recommend the native `shadow` props for simple shadows (shadow-props page).
- `boxShadow` is New-Architecture-only and has Android API limits (outset 9+, inset 10+); whether Expo SDK 56/57 run exclusively on New Architecture was not verified here **[UNVERIFIED]**; if they do, the New-Arch constraint is moot but the Android 9/10 limits and the semantic differences remain.
- `elevation` also gives free z-order and platform-correct look on Android; `boxShadow` does not. Tradeoff: `boxShadow` gives identical multi-layer, spread, inset, and color-consistent shadows on both platforms (what HeroUI Native does), which is the better fit for a branded, flat design language.
- Implementation: one token object `{ ios: {...}, android: {...}, box: '0 3px 5px rgba(0,0,0,.2)' }`; the kit picks `box` only when a feature flag is on.

### C4. Dark mode
- Shadows are nearly invisible on dark surfaces. Material's answer is **tonal elevation**: the surface is tinted lighter with elevation. Compose: `Surface(tonalElevation=...)` doc "a higher elevation will result in a darker color in light theme and lighter color in dark theme", and `surfaceColorAtElevation(e) = surfaceTint.copy(alpha = (4.5 * ln(e + 1) + 2) / 100).compositeOver(surface)` (https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ColorScheme.kt ; `Surface.kt` same folder). Overlay alpha at M3 levels **[DERIVED]**: 1 dp 5.1%, 3 dp 8.2%, 6 dp 10.8%, 8 dp 11.9%, 12 dp 13.5%.
- Compose also says: "To prevent shadow creep, only apply shadow elevation when absolutely necessary" (Surface.kt).
- Other systems: Tamagui raises shadow color alpha in dark themes (0.3/0.2 vs 0.085/0.04); HeroUI Native drops shadows in dark and uses a 1px light inset ring for overlays.
- Kit recommendation **[DERIVED]**: each elevation token also carries `surfaceOverlayAlpha` (sm 0.08, md 0.11, lg 0.135 from the formula) and `ringOpacity`. In dark mode: apply the tonal overlay to the surface color (blend `colors.surfaceTint` over `colors.surface`), keep a reduced shadow (opacity x0.5 to avoid muddy edges), and add a 1 px hairline border (low-alpha white) for floating layers (popover, sheet) where separation matters. In light mode: shadow only, no overlay. Resolve this in the Unistyles theme so `elevation.md` returns the right style object per color scheme.

---

## Summary of proposed tokens

```ts
motion.duration  = { instant: 0, fast: 100, base: 200, moderate: 300, slow: 400, slower: 500 }
motion.easing    = {
  standard:  [0.4, 0, 0.2, 1],       // ease-in-out, 200ms
  soft:      [0.42, 0, 0.58, 1],     // symmetric, 300ms
  enter:     [0.05, 0.7, 0.1, 1],    // emphasized decelerate, 400ms
  exit:      [0.3, 0, 0.8, 0.15],    // emphasized accelerate, 200ms
}
motion.spring    = {
  gentle: { stiffness: 158,  damping: 25, mass: 1 },
  snappy: { stiffness: 380,  damping: 31, mass: 1 },
  bouncy: { stiffness: 158,  damping: 18, mass: 1 },
  effects:{ stiffness: 1600, damping: 80, mass: 1 },
}
motion.reduced   = { transition: 'crossfade', duration: 150, spring: 'gentle', loop: 'none' }
size.touchTarget.min = 48           // hitSlop = max(0, ceil((48 - visual) / 2)) per side, capped by neighbor gap / 2
elevation        = none | sm(3dp) | md(6dp) | lg(12dp)   // iOS shadow* collapsed from M3/Paper, boxShadow opt-in
```

## Not verified from a primary source (consolidated)
- Material 3 spec-page guidance (duration-by-size, reduced motion, 48 dp and 8 dp spacing text): pages not fetchable; only generated tokens and Compose source were verified.
- Radix motion tokens; Uniwind motion tokens; Expo touch-target conventions; Gluestack `shadow-hard-*` definition; Mantine default easing.
- Apple `.smooth/.snappy/.bouncy` predefined durations (only tunable-overload defaults and base bounce documented); easeInOut bezier.
- On-device behavior of hitSlop vs VoiceOver/TalkBack/Accessibility Scanner (derived from source, not tested); Android parent-bounds clipping beyond the RN doc statement; RNGH native hit-testing details.
- Whether Expo SDK 56/57 enforce New Architecture (affects `boxShadow` availability).
- Tamagui `animationsReanimated.ts` list may continue past the 90 lines read.
- All DERIVED numbers (spring conversions, proposed presets, slop values, iOS shadow set, tonal alphas) are my arithmetic or proposals, not published tokens.

# ADR 0001: Expo SDK 56 / 57 compatibility

- Status: Superseded by [ADR 0004](0004-expo-58-support.md) (support policy)
- Date: 2026-10-09
- Issue: #2 (T02 spike)

## Context

`loom` installs Unistyles 3, Gesture Handler 3 (`Pressable`) and AsyncStorage into the user's Expo project. The roadmap says: `loom` supports Expo 56 and 57; the template targets 57 only. This spike checks both SDKs with the latest stack.

Method: two throwaway apps (Expo Router, `blank-typescript` template, npm), one per SDK, with a screen using Unistyles `StyleSheet.create` (themes, `useVariants`, dynamic function style) and a Gesture Handler 3 `Pressable` that persists a counter with AsyncStorage. Host: macOS, Node 22, Xcode 26.3, iPhone 17 Pro simulator (iOS 26.3). Android was not built.

## Results

**Run and observed:**

| Check | SDK 57 (`expo` 57.0.27, RN 0.86.3) | SDK 56 (`expo` 56.0.23, RN 0.85.3) |
|---|---|---|
| `npx tsc --noEmit` | pass | pass |
| `npx expo-doctor` | 1 fail: GH 3 and AsyncStorage 3 are major-version mismatches vs Expo's pinned set | 2 fails: same mismatch, plus the Hermes V1 memory regression (see Known issues) |
| `npx expo prebuild --clean` (iOS and Android) | pass, `pod install` OK (Unistyles 3.5.2, NitroModules 0.37.1, RNGestureHandler 3.3.0, AsyncStorage 3.1.1) | pass, same pods |
| `expo export --platform ios` (Metro and Babel, with the Unistyles plugin) | pass | pass |
| Native compile of Unistyles, Nitro, GH 3, AsyncStorage 3 pods (Xcode 26.3, Release, simulator) | pass | pass |
| Full iOS build | **fail**, in Expo's own `ExpoModulesJSI` (not our libraries) | pass |
| Launch in simulator | **not possible** (no binary) | **launched**; screen rendered with Unistyles layout and theme values applied |
| Tap on `Pressable` and AsyncStorage write | not tested (no tap tooling) | not tested |

Notes on the SDK 57 failure: `expo-modules-jsi@57.1.1` fails on Swift 6.2 (Xcode 26.3 here): `SWIFT_RETURNS_RETAINED` on `RuntimeScheduler` (`RuntimeScheduler.h`), then seven `sending ... risks causing data races` errors in `JavaScriptRuntime.swift`. I removed the first locally and confirmed the second appears. This is an upstream Expo bug (expo/expo#50067, #49426, #50470) that hits a blank SDK 57 app, so it is unrelated to the stack. A newer Xcode or an upstream fix is needed before the 57 binary can be launched; I did not have one.

**Inferred from docs and package metadata (not run):**

- Unistyles 3.5.2 needs RN >= 0.81, React >= 19, the New Architecture (no opt-out), Xcode 16.4+, and `react-native-nitro-modules` >= 0.37.1 for Unistyles >= 3.4. Reanimated and `react-native-edge-to-edge` are optional peers.
- Gesture Handler 3 requires RN >= 0.82 (package README). Peer ranges are `*`.
- AsyncStorage 3.1.1 requires RN >= 0.76, Android minSdk 24, iOS 13+, and the `@react-native-async-storage/expo-with-async-storage` config plugin (needs `expo` >= 53) to add the Android local Maven repo. The `prebuild` output confirmed the plugin writes the `local_repo` line to `android/build.gradle`; the Android build itself was not run.
- Both SDKs sit above every RN floor, so no combination is excluded by declared ranges.

## Compatibility table

| Library | SDK 57 | SDK 56 | Notes |
|---|---|---|---|
| `react-native-unistyles` 3.5.2 | works (compiles, bundles) | works (launched) | needs dev build, no Expo Go |
| `react-native-nitro-modules` 0.37.1 | works | works | pin exact, Unistyles 3.5.x needs >= 0.37.1 |
| `react-native-gesture-handler` 3.3.0 | works (compiles, bundles) | works (launched) | Expo pins 2.32 / 2.31; GH 3 is outside Expo's validated set |
| `@react-native-async-storage/async-storage` 3.1.1 | works (compiles, bundles) | works (launched) | Expo pins 2.2.0; v3 is outside the validated set |
| `expo-router` | 57.0.25 works | 56.2.21 works | |
| `react-native-reanimated` / `worklets` | 4.5.1 / 0.10.1 (Expo pinned) | 4.3.1 / 0.8.3 (Expo pinned) | not required by Unistyles; latest Reanimated 4.7.1 needs RN 0.86-0.88, so on 56 use the Expo-pinned one |
| `react-native-edge-to-edge` 1.8.2 | optional | optional | Expo 54+ enables edge-to-edge already |

## Minimum versions for the manifest

| Package | Minimum |
|---|---|
| `expo` | `>=56.0.23 <58` (tested 56.0.23 and 57.0.27) |
| `react-native` | `>=0.85.3` (SDK 56), `0.86.3` (SDK 57); use the version Expo pins |
| `react` | `19.2.3` (Expo pinned) |
| `react-native-unistyles` | `^3.5.2` |
| `react-native-nitro-modules` | `^0.37.1` |
| `react-native-gesture-handler` | `^3.3.0` |
| `@react-native-async-storage/async-storage` | `^3.1.1` |
| `@react-native-async-storage/expo-with-async-storage` | `^1.0.0` |
| `babel-preset-expo` | SDK-matched (`~56.0.0` / `~57.0.0`) |

## Required config

- `babel.config.js`: `presets: ['babel-preset-expo']`, `plugins: [['react-native-unistyles/plugin', { root: 'src' }]]`. `root` must contain every file that calls `StyleSheet.create`. `babel-preset-expo` must be a direct dependency; without it the SDK 56 release bundle failed with `Cannot find module 'babel-preset-expo'`.
- Entry file (Expo Router): `package.json` `"main": "index.ts"`, with `import 'expo-router/entry'; import './unistyles';`. `unistyles.ts` calls `StyleSheet.configure` (themes, breakpoints with an `xs: 0`, settings) and augments `UnistylesThemes` / `UnistylesBreakpoints`.
- `app.json` plugins: `expo-router`, `@react-native-async-storage/expo-with-async-storage` (`react-native-edge-to-edge` is optional).
- Root layout wrapped in `GestureHandlerRootView`.
- Development build only (`expo prebuild` plus `expo run:ios`/`run:android` or EAS). Expo Go does not work.
- Install with `npx expo install` first, then add the GH 3 and AsyncStorage 3 overrides. Add `react-dom` pinned to the React version if npm raises ERESOLVE (npm pulled `react-dom@19.3.0` against `react@19.2.3` for me).
- `loom init` should add `expo.install.exclude` for `react-native-gesture-handler` and `@react-native-async-storage/async-storage` in `package.json`, so `expo install --check` and `expo-doctor` stop flagging them.

## Known issues

1. SDK 57 iOS builds fail on Xcode 26.x / Swift 6.2 because of `expo-modules-jsi` (upstream, affects any app). Document the requirement for a toolchain that builds a blank SDK 57 app. Re-test when Expo ships a fix.
2. `expo-doctor` reports GH 3 and AsyncStorage 3 as major mismatches against Expo's pinned versions (2.32 / 2.2). They are not in Expo's validated set, so Expo gives no guarantee for them.
3. SDK 56 with Hermes V1 `250829098.0.10` has a known memory regression (reported by `expo-doctor`); fixed only from SDK 57 (`expo@57.0.9`, RN 0.86.2). Affects apps importing Reanimated/Worklets.
4. After `npx expo install`, npm can leave a duplicate `expo-font` (SDK 56 got `57.0.4` via `expo-symbols`). Fix with `npx expo install expo-font`.
5. `expo prebuild` installed CocoaPods through Homebrew on this machine; keep this in mind for CI images.
6. Not verified: Android build, a real `Pressable` tap, AsyncStorage read/write at runtime, 57 runtime.

## Decision (recommended)

**Keep Expo 56 support as-is; add no conditional code.** 56 and 57 use the same install steps, config and APIs, and the only differences are the Expo-pinned versions that `expo install` resolves. The roadmap line "template on Expo 57 only" stays, but the 57 template must not be marked verified on iOS until the `expo-modules-jsi` issue is resolved. Keep the manifest ranges above, and verify 57 on a launched build, plus Android on both SDKs, before the first non-alpha release.

Revisit the decision if SDK 58 changes the New Architecture or Babel/Metro setup, or if GH 3 / AsyncStorage 3 enter Expo's validated set (then the `install.exclude` step can be dropped).

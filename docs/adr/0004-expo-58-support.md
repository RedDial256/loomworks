# ADR 0004: Expo SDK 58 only

- Status: Accepted
- Date: 2026-10-30
- Issue: #53 (T24)
- Supersedes: the support policy of [ADR 0001](0001-expo-56-57-compatibility.md)

## Context

`Background` (T31/T32) needs the stable `backgroundImage` style prop, which ships in React Native 0.87+. Expo SDK 58 is the first SDK on RN 0.88. Keeping SDK 56 and 57 would mean conditional component code and a second integration run for no product gain before the first alpha.

## Decision

`loom` and the template support Expo SDK 58 only. The manifest `minimums` and the CLI reject older SDKs (`expo >=58.0.21 <59`).

| Package | Version | Source |
|---|---|---|
| `expo` | 58.0.21 | |
| `react-native` | 0.88.1 | Expo pin |
| `react` | 19.3.0 | Expo pin |
| `babel-preset-expo` | `~58.0.0` | SDK-matched |
| `react-native-unistyles` | `^3.7.0` | |
| `react-native-nitro-modules` | `^0.37.1` | unchanged |
| `react-native-reanimated` / `react-native-worklets` | 4.7.1 / 0.13.0 | Expo pins |
| `react-native-gesture-handler` | `~3.3.0` | Expo pin (now GH 3) |
| `@react-native-async-storage/async-storage` | `^3.1.1` | outside Expo's set (Expo pins 2.2.0) |
| `@react-native-async-storage/expo-with-async-storage` | `^1.0.0` | unchanged |

Phase 5 note: if SDK 59 exists by then, keep 58 and add 59.

## Consequences

- Expo 58 validates Gesture Handler 3, so `loom init` no longer adds it to `expo.install.exclude`. AsyncStorage stays excluded.
- React Native 0.88 ships its strict TypeScript API by default: props types are read-only, the `TextInput` ref type is `TextInputInstance`, and `AccessibilityActionName` is no longer exported. `easyA11y` builds its props in one object and declares the action names itself.
- Unistyles 3.7.0: `useVariants` memory leak and React Compiler fixes, faster renders, RN 0.88 style props, iOS gradients follow theme changes. Breaking: `UnistylesRuntime.themeName` always returns the app theme. Loom does not read it; the test mock keeps returning `'light'`.
- Reanimated 4.7 runs a UI-runtime worklet when it loads, so Jest also needs Reanimated's web-only modules (the rule from `react-native-reanimated/jest/resolver`). `packages/ui/test/resolver.cjs` carries it.
- The SDK 58 `default` template fails `tsc` in its own `src/components/app-tabs.web.tsx` (expo-router's `TabTrigger` slot props against RN 0.88's strict `Pressable` ref). `scripts/integration.sh` leaves that file out of the typecheck; everything loom writes is still checked.
- Not verified here: launching on the iOS simulator and on Android (needs a macOS host; see the acceptance criteria of #53).

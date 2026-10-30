# ADR 0001: Expo SDK compatibility

- Status: Accepted
- Date: 2026-10-09, updated 2026-10-30 for SDK 58 (#53)
- Issues: #2 (T02 spike), #53 (T24)

## Decision

`loom` and the template support **Expo SDK 58 only**. SDK 58 (React Native 0.88) is the first with the stable `backgroundImage` style prop that `Background` (T31/T32) needs, and a single SDK avoids conditional component code. The CLI rejects other SDKs. Package minimums live in `packages/ui/manifest.json` (`minimums`); `packages/ui/package.json` holds the versions tested.

## Required config

What `loom init` sets up, and why:

- `babel.config.js`: `presets: ['babel-preset-expo']`, `plugins: [['react-native-unistyles/plugin', { root: 'src' }]]`. `root` must contain every file that calls `StyleSheet.create`. `babel-preset-expo` must be a direct dependency, or release bundles fail with `Cannot find module 'babel-preset-expo'`.
- Entry file: `package.json` `"main": "index.ts"`, with `import 'expo-router/entry'; import './unistyles';`.
- `app.json` plugins: `expo-router`, `@react-native-async-storage/expo-with-async-storage` (adds the Android local Maven repo AsyncStorage 3 needs).
- `expo.install.exclude`: `@react-native-async-storage/async-storage`. Expo pins AsyncStorage 2.2.0 and loom needs 3.x, so without it `expo install --check` and `expo-doctor` flag it. Gesture Handler 3 is in Expo 58's validated set and needs no exclude.
- Root layout wrapped in `GestureHandlerRootView` (left to the user).
- Development build only: Unistyles 3 needs the New Architecture and native code, so Expo Go does not work.

## Known issues (SDK 58)

1. React Native 0.88 ships its strict TypeScript API by default: props are read-only, the `TextInput` ref type is `TextInputInstance`, and `AccessibilityActionName` is not exported.
2. The SDK 58 `default` template fails `tsc` in its own `src/components/app-tabs.web.tsx` (expo-router's `TabTrigger` slot props against the strict `Pressable` ref). `scripts/integration.sh` leaves that file out of the typecheck.
3. Reanimated 4.7 runs a UI-runtime worklet when it loads, so Jest also needs Reanimated's web-only resolver rule (`packages/ui/test/resolver.cjs`).
4. Not verified yet: a launched build on the iOS simulator and on Android.

## History

The T02 spike (2026-10-09) tested SDK 56 and 57 with Unistyles 3.5.2, Gesture Handler 3.3.0 and AsyncStorage 3.1.1. Both passed `tsc`, `prebuild` and `expo export`; SDK 56 launched on iOS, and SDK 57's iOS build failed in Expo's own `expo-modules-jsi` on Xcode 26.3 (#9). Both were supported until T24 moved to SDK 58 only.

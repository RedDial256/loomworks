# ADR 0005: Deploy and preview of the example app

- Status: Proposed. Web export checked locally; the EAS runs are pending the first PR with the workflow.
- Date: 2026-11-09
- Issue: #77 (T38 spike)

The example app is `templates/app` (the weaver template with the sandbox). The goal is that anyone can see what Loomworks produces without building it.

## Findings

Stack: Expo SDK 58, React Native 0.88.1, Unistyles 3.7.0, eas-cli 27.5.

### Web (Expo web)

Checked with `expo export --platform web` and the export served and driven in Chromium (Playwright) through the home screen and every sandbox demo, light and dark.

- It bundles once `react-dom`, `react-native-web` and `@expo/metro-runtime` are added at the SDK 58 pins. No runtime errors or warnings.
- Unistyles, Reanimated, Gesture Handler, the drawer, `Background` gradients, `Skeleton`, `Spinner`, `Switch`, `Input`, `Card`, `Text` and theme switching render as on native.
- Unistyles styles do not reach third-party views on web unless they go through `withUnistyles`: on web Unistyles turns `StyleSheet.create` into CSS classes that only the React Native views it wraps apply. In the template, `GestureHandlerRootView` collapsed to zero height (a blank app) and the `expo-image` mark had no size; both now use `withUnistyles`.
- Still broken on web, left to follow-up tickets: `Button` and the sandbox drawer items lose their styles (Gesture Handler `Pressable` is a third-party view, and its `style` can be a function of the pressed state, which `withUnistyles` does not map); `DateTimeInput` opens nothing, as `@react-native-community/datetimepicker` has no web implementation.

### Snack

Not viable for the template. Snack runs on Expo Go on devices, and Unistyles 3 has custom native code, so it "does not support Expo Go" ([Unistyles setup](https://reactnativeunistyles.vercel.app/start/setup/)). Snack's web runner would need the template and `packages/ui` copied in as flat files; not tried, since the EAS Hosting preview below covers web.

### Native

No Apple or Google accounts yet, so nothing goes to TestFlight or Play internal testing. Builds that need no store credentials:

- Android: an APK, `distribution: internal`, `withoutCredentials: true`. The React Native template signs release builds with its debug keystore, so the APK should install on any device (to confirm with the first build). Not for the stores.
- iOS: a simulator build (`ios.simulator: true`). Runs on a Mac with Xcode only; a device build needs an Apple Developer account.

EAS Update channels per PR were weighed against a build per PR. Updates are cheaper (one build, then a JS update per PR) but need `expo-updates` in the template, which every weaver app would inherit, and a device build to load them, which iOS cannot have without an Apple account. Not now.

### Costs (Free plan, [expo.dev/pricing](https://expo.dev/pricing))

- Builds: 15 Android and 15 iOS, low-priority queue (90+ minute waits at peak), 45 minute timeout. Whether the 15 reset monthly is not stated on the page; not verified.
- Hosting: 100,000 requests per month, 1 GB storage. Preview deployments without an alias or production promotion are deleted after 30 days.
- GitHub Actions minutes: only the export and the EAS CLI calls; builds run on EAS.

## Decision

- `.github/workflows/preview.yml` deploys with an `EXPO_TOKEN` repository secret and the Expo account `reddial`:
  - Web, on every PR from this repository: `expo export` and `eas deploy --alias pr-<number>`, with the URL in a sticky PR comment. On `main`: `eas deploy --prod`.
  - Native, on `main`, on a manual run, or when a PR gets the `native-preview` label: `eas build --platform all --profile preview --no-wait`, with links to the builds in a sticky PR comment. Not on every PR, to stay within the 15 builds.
- `templates/app/eas.json` holds the `preview` profile. Weaver drops it, as it does the monorepo Babel and Metro configs.
- `app.json` carries no `owner`, `projectId` or app ids, since weaver copies it into every new app: the workflow runs `eas init --account reddial --force --non-interactive`, which creates or links the project, and sets `android.package` and `ios.bundleIdentifier` (`dev.reddial.loomworks`), all in the CI checkout only.
- Fork PRs get no deploy, as GitHub gives them no secrets.

Store submission (TestFlight, Play internal testing) needs a `production` profile, store credentials in EAS and `eas submit`; it waits for the store accounts.

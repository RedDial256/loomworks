# ADR 0005: Sandbox cards with live thumbnails

- Status: Proposed (2026-11-09). The code findings below are verified; the device columns are pending a run on iOS and Android.
- Issues: #70 (T34 spike); relates to #69 (T33), #73 (T36)

## Findings

Stack: Expo SDK 58, React Native 0.88.1, Expo Router 58.0.28, Reanimated 4.7.1, React Native Screens 4.30, LegendList 3.7.1.

Evidence used: the sources of those versions in `node_modules`, the [React Navigation shared element guide](https://reactnavigation.org/docs/shared-element-transitions/), and the prototype in `templates/app` passing `tsc`, ESLint and `expo export` for iOS and Android. Device columns are filled from a run of the prototype on a simulator or device.

### Thumbnail sources

| Source | Stays in sync | Both themes | User's theme edits | Cost | iOS | Android |
|---|---|---|---|---|---|---|
| Live render, scaled down (`transform: scale`, `pointerEvents: 'none'`, hidden from accessibility) | Always: it is the demo's first section | Free: Unistyles restyles it on a theme change | Shown, since it renders the copied source | Every visible card mounts a section; Spinner and Skeleton keep animating | Pending | Pending |
| Screenshot generated ahead of time (T33 tooling, shown with `expo-image`) | Only when regenerated after each component or demo change | Two images per demo | **Not shown**: images show the default theme, while `loom` copies the theme into the project to be edited | Image decode only | Not prototyped | Not prototyped |

Why:

- `loom` copies source the user is meant to change (ADR 0003). A shipped screenshot is stale as soon as the user edits a token or a component, and `loom add` would have to copy two images per item. A live render cannot drift.
- The live thumbnail lays the section out at 360 pt and scales it to the card width with `transformOrigin: 'left top'`, so it keeps a phone layout. The frame clips with `overflow: 'hidden'`.
- `Input` and `Switch` need no special case: `pointerEvents: 'none'` on the frame blocks focus and toggles, and each thumbnail keeps its own state. The frame sets `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`, so a screen reader stops only on the card link.
- LegendList does not recycle items unless `recycleItems` is set, so a thumbnail's state never moves to another demo.

### Card to demo transition

| Option | Requirement | When unavailable | iOS | Android |
|---|---|---|---|---|
| Expo Router `Link.AppleZoom` | Native stack, iOS 18+ | `isZoomTransitionEnabled()` is `EXPO_OS === 'ios'`; elsewhere it renders its child through `Slot` and the push is plain | Pending | Plain push by design |
| Reanimated `sharedTransitionTag` | Native stack; static flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` in the app's `package.json` (`reanimated.staticFeatureFlags`), read at native build time by `reanimated_utils.rb` and `build.gradle.kts` | Flag off (the default in `staticFlags.json`): `_configureSharedTransition` returns early and the push is plain, with no warning | Pending | Pending |

Why:

- React Navigation documents shared element transitions as experimental and not recommended for production, native stack only, with these limits on the New Architecture: no custom animation functions, some properties (`backgroundColor`) not animated in progress-based transitions such as the iOS back gesture, eager transform recalculation, and wrong vertical offsets on iOS from the header height.
- The flag is a native build setting, so turning it on means a rebuild, and every weaver app would inherit an experimental flag. It also cannot be combined with `USE_LEGACY_LAYOUT_ANIMATIONS_PROXY`.
- Neither option runs in a drawer or bottom tabs navigator, which is one reason for the native stack below.
- Expo announced cross-platform shared element transitions for Expo Router; nothing for this ships in 58.0.28 (not verified beyond the announcement).

## Decision (proposed)

- The cards are the sandbox screen. The sandbox tab holds a native `Stack` (index: search field and grid; `[id]`: demo) in place of the drawer. A drawer is about 300 pt wide, too narrow for a grid, and the transitions need a native stack.
- Thumbnails are live renders of each demo's first section. Pre-generated screenshots are not used for the sandbox; T33 keeps them for PR review.
- `Link.AppleZoom` on iOS 18+, a plain push elsewhere. No Reanimated flag in the template.
- `loom add` needs no change: the grid reads `demos.ts`, which it already rewrites when `sandbox` is set, and a live thumbnail has nothing to generate. The template now imports `Card`, so weaver installs it with the template items.
- The grid uses as many columns as fit a 150 pt card, with a 16 pt gap and padding.

## What does not work

- Reanimated shared transitions without the static flag: silently a plain push.
- Shared or zoom transitions from a drawer or tab navigator.
- Screenshots that match a project whose theme or components were edited.

## Prototype

`templates/app/src/sandbox`: `SandboxGrid.tsx`, `components/DemoCard.tsx`, `components/DemoThumbnail.tsx`. `CARD_TRANSITION` in `sandbox.transition.ts` switches between `zoom`, `shared` and `none` for the device run; once this ADR is accepted, the implementation keeps only `zoom` and drops the switch.

To test `shared`, set `CARD_TRANSITION` to `'shared'`, add `"reanimated": { "staticFeatureFlags": { "ENABLE_SHARED_ELEMENT_TRANSITIONS": true } }` to `templates/app/package.json`, and rebuild with `expo run:ios` and `expo run:android`.

# ADR 0006: Sandbox cards with live thumbnails

- Status: Accepted (2026-11-10), from an iOS run of the prototype; the Android columns are still pending.
- Issues: #70 (T34 spike); relates to #69 (T33), #73 (T36)

## Findings

Stack: Expo SDK 58, React Native 0.88.1, Expo Router 58.0.28, Reanimated 4.7.1, React Native Screens 4.30, LegendList 3.7.1.

Evidence used: the sources of those versions in `node_modules`, the [React Navigation shared element guide](https://reactnavigation.org/docs/shared-element-transitions/), and the prototype in `templates/app` passing `tsc`, ESLint and `expo export` for iOS and Android. The iOS columns come from a run on iOS 26 (2026-11-10).

### Thumbnail sources

| Source | Stays in sync | Both themes | User's theme edits | Cost | iOS | Android |
|---|---|---|---|---|---|---|
| Live render, scaled down (`transform: scale`, `pointerEvents: 'none'`, hidden from accessibility) | Always: it is the demo's first section | Free: Unistyles restyles it on a theme change | Shown, since it renders the copied source | Every visible card mounts a section; Spinner and Skeleton keep animating | Works, both themes and after a theme change. Two fixes came out of the run: a theme change only reaches third-party views through a re-render (the `LegendList` background), and the card needs its title as `a11y.label`, or VoiceOver reads the text inside the thumbnail. Kit `Pressable` styles in a thumbnail keep the first theme, a kit issue with its own ticket | Pending |
| Screenshot generated ahead of time (T33 tooling, shown with `expo-image`) | Only when regenerated after each component or demo change | Two images per demo | **Not shown**: images show the default theme, while `loom` copies the theme into the project to be edited | Image decode only | Not prototyped | Not prototyped |

Why:

- `loom` copies source the user is meant to change (ADR 0003). A shipped screenshot is stale as soon as the user edits a token or a component, and `loom add` would have to copy two images per item. A live render cannot drift.
- The live thumbnail lays the section out at 360 pt, measures its height, and scales it down until it fits the frame both ways, centered, so nothing is cropped. The scale uses `translate` and `scale` only: with `transformOrigin: 'left top'` in `StyleSheet.create` the content landed off center in the light theme of the first device run (cause not confirmed).
- The card uses the screen background with a hairline border, not the raised `Card` surface, so each thumbnail looks as it does on its demo screen.
- `Input` and `Switch` need no special case: `pointerEvents: 'none'` on the frame blocks focus and toggles, and each thumbnail keeps its own state. The frame sets `accessibilityElementsHidden` and `importantForAccessibility="no-hide-descendants"`, so a screen reader stops only on the card link.
- LegendList does not recycle items unless `recycleItems` is set, so a thumbnail's state never moves to another demo.

### Card to demo transition

| Option | Requirement | When unavailable | iOS | Android |
|---|---|---|---|---|
| Expo Router `Link.AppleZoom` | Native stack, iOS 18+ | `isZoomTransitionEnabled()` is `EXPO_OS === 'ios'`; elsewhere it renders its child through `Slot` and the push is plain | Works: the card zooms into the demo and back | Plain push by design |
| Reanimated `sharedTransitionTag` | Native stack; static flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` in the app's `package.json` (`reanimated.staticFeatureFlags`), read at native build time by `reanimated_utils.rb` and `build.gradle.kts` | Flag off (the default in `staticFlags.json`): `_configureSharedTransition` returns early and the push is plain, with no warning | Plain push even with the flag set and the tags on both screens; not pursued | Not tried |

Why:

- React Navigation documents shared element transitions as experimental and not recommended for production, native stack only, with these limits on the New Architecture: no custom animation functions, some properties (`backgroundColor`) not animated in progress-based transitions such as the iOS back gesture, eager transform recalculation, and wrong vertical offsets on iOS from the header height.
- The flag is a native build setting, so turning it on means a rebuild, and every weaver app would inherit an experimental flag. It also cannot be combined with `USE_LEGACY_LAYOUT_ANIMATIONS_PROXY`.
- Neither option runs in a drawer or bottom tabs navigator, which is one reason for the native stack below.
- Expo announced cross-platform shared element transitions for Expo Router; nothing for this ships in 58.0.28 (not verified beyond the announcement).

## Decision

- The cards are the sandbox screen. The sandbox tab holds a native `Stack` (index: search field and grid; `[id]`: demo) in place of the drawer. A drawer is about 300 pt wide, too narrow for a grid, and the transitions need a native stack.
- Thumbnails are live renders of each demo's first section. Pre-generated screenshots are not used for the sandbox; T33 keeps them for PR review.
- `Link.AppleZoom` on iOS 18+, a plain push elsewhere. No Reanimated flag in the template: on iOS it gave a plain push, and it would put an experimental native flag in every weaver app.
- Search moves to the native header search bar (`headerSearchBarOptions`), and the list sets `contentInsetAdjustmentBehavior="automatic"`: the iOS 26 header is translucent, and a search field in the screen body sat under it in the first device run. Search matches part of the title only; demos have no keywords, so "b" finds Background, Box, Button and Pressable and nothing else.
- The grid has two sections, Theme then Components, each under a header that spans the row (LegendList `overrideItemLayout`). The theme item carries token demos (colors, typography, spacing and radii, elevation and gradients) in the theme folder. They use only React Native and the theme, so the theme keeps no item dependencies, and `init` copies them when `sandbox` is set.
- The manifest's `demo` becomes `demos`, a list. An item with one demo keeps its name as the route id; an item with several gets `<item>-<file name>` (`theme-colors`). The generated index records each entry's `group`, `theme` for the theme item and `components` for the rest.
- `loom add` and `init` keep the cards up to date: the grid reads `demos.ts`, which both rewrite when `sandbox` is set, and a live thumbnail has nothing to generate.
- The grid uses as many columns as fit a 150 pt card, with a 16 pt gap and padding. The app rotates (`orientation: default`), and the grid and the demo screens add the side safe areas to their padding in landscape: LegendList and a vertical `ScrollView` do not inset their content by them.

## What does not work

- Reanimated shared transitions: silently a plain push without the static flag, and still a plain push with it in the iOS run.
- Shared or zoom transitions from a drawer or tab navigator.
- Screenshots that match a project whose theme or components were edited.

## Implementation

`templates/app/src/sandbox`: `SandboxGrid.tsx`, `components/DemoCard.tsx`, `components/DemoThumbnail.tsx`, `components/GridHeader.tsx`. The spike's `CARD_TRANSITION` switch is gone; only the zoom remains.

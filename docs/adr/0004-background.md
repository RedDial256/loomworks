# ADR 0004: `Background` with `backgroundImage`

- Status: Proposed. Accepted once the Device column below is filled from the test app on the iOS simulator and an Android device or emulator.
- Date: 2026-10-30
- Issues: #60 (T31 spike), #61 (T32)

## Findings

Stack: Expo SDK 58, React Native 0.88.1, Unistyles 3.7.0. Letters are the tiles of the test app, which states what each one should show.

Evidence used: React Native and Unistyles sources at those versions, React Native's JS style processing run in Jest against both themes, and the test app passing `tsc` and `expo export` for iOS and Android. The two platforms share the style parsing (JS and C++); only the drawing differs, and both draw the cases below the same way in source.

| Case | Tiles | Result (iOS and Android) | Device |
|---|---|---|---|
| CSS string syntax in `StyleSheet.create` (linear, radial, several layers, `rgba` stops), theme colors | A, B, F | Works and follows theme changes | Pending |
| String gradient inside a variant | E | Works | Pending |
| Object syntax (`[{ type: 'linear-gradient', colorStops }]`) in `StyleSheet.create` | C | **Does not work**, silently: `tsc` accepts it, no gradient is drawn | Pending |
| Object syntax in an inline `style` | D | Works, but follows the theme only through a React re-render | Pending |
| `borderRadius` on the view itself, uniform or per corner | G, H | Gradient is clipped to the view's own shape, without `overflow: 'hidden'` | Pending |
| Wrapper with children | I, J | Children are clipped only with `overflow: 'hidden'`, as for any view | Pending |
| Child that fills its parent (`absoluteFill`) | K, L | Does not take the parent's radius; the parent needs `overflow: 'hidden'` | Pending |
| `backgroundSize`, `backgroundPosition`, `backgroundRepeat` as arrays or CSS strings | M, N | Work; each list is indexed per layer, wrapping around | Pending |

Why:

- First render: React processes `backgroundImage` and the layer props in JS (`processBackgroundImage` and siblings), strings and arrays alike.
- Theme or variant change: Unistyles updates the shadow tree from C++, bypassing that JS. React Native's native props only read the processed form unless `enableNativeCSSParsing` is on, which is off by default and not turned on by Expo 58. Unistyles 3.7 handles this for strings: it converts a `backgroundImage` string with React Native's C++ CSS parser into the processed form, converts layer-prop strings, and passes layer-prop arrays through unchanged (`cxx/parser/Parser.cpp`, `cxx/converters/`).
- The object syntax never gets there: Unistyles keeps arrays only for `transform`, `boxShadow`, `filter`, `fontVariant` and the layer props, and reads any other array as a breakpoint map, which resolves to `undefined`.
- Clipping: iOS shapes each gradient layer to the view's border path (`shapeLayerToMatchView`, `masksToBounds`); Android clips `BackgroundImageDrawable` to the rounded border path. Neither looks at the parent, and `borderRadius: 'inherit'` does not exist.

`expo-linear-gradient` is not needed: nothing here needs a fallback.

## Decision (proposed API for T32)

One component with a `fill` variant, not two components: both forms take the same background props and differ only in layout and accessibility.

```tsx
// Wrapper: parent of its children; the radius goes on the Background itself.
<Background gradient="primary" style={{ borderRadius: theme.radii.xl }}>
  {children}
</Background>

// Fill: first child of a parent that clips it.
<Card style={{ overflow: 'hidden' }}>
  <Background fill gradient="primary" />
  {content}
</Card>
```

- `color` (a theme color role) or `gradient` (a theme gradient name), mutually exclusive in the types.
- `fill`: `absoluteFill`, `pointerEvents="none"`, hidden from accessibility, no `children` in the types.
- Gradients are theme tokens written as CSS strings from the theme colors, so they follow theme changes through `StyleSheet.create`. T32 names them and adds them to the theme contract and ADR 0002.
- Rule for the implementation: CSS string syntax only in `StyleSheet.create`; layer props as strings or arrays.

## Test app

`scripts/spikes/background.sh` builds it (fresh SDK 58 app, `loom init`, `loom add box text`, the spike screen as the only route). Run it with `npx expo run:ios` and `npx expo run:android`, toggle the theme and the variant, and record each tile in the Device column.

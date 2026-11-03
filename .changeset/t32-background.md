---
'@red_dial/loom': minor
'@red_dial/create-weaver': minor
---

Add the `Background` component and theme gradients:

- `theme`: `gradients` in the theme contract (`primary`, `success`, `warning`, `danger`, `info`, `surface`, `scrim`), CSS `backgroundImage` strings built with `linearGradient`, so they follow theme changes.
- `background`: a `color` (theme role or any color) or a `gradient` (theme gradient or any `backgroundImage`, CSS string or objects), either as a wrapper around its children or as a `fill` layer behind the parent's content (no touches, hidden from screen readers), with a sandbox demo.
- Weaver adds `background`, so new apps show its demo in the sandbox.

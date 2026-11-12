---
'@red_dial/loom': patch
---

`Pressable` and `Button` follow a live theme change on native and keep their styles on web: the Gesture Handler `Pressable` now renders through `withUnistyles`.

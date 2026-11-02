---
'@red_dial/loom': minor
'@red_dial/create-weaver': minor
---

With `sandbox` set in `loom.json`, `loom init` and `loom add` rewrite the sandbox index (`<sandbox>/demos.ts`) from the installed items whose demo is in the project; `init` takes a `sandbox` option for a new `loom.json`. Weaver sets it to `src/sandbox`, so new apps get the template's demos. Adds the `Box` demo.

---
'@red_dial/create-weaver': minor
'@red_dial/loom': patch
---

`npm create @red_dial/weaver <dir> -- --yes` creates an Expo Router project from the template: the kit theme and the components the template uses (through the loom API), ESLint and Prettier with `@red_dial/rn-tooling-config`, dependencies installed with the package manager that launched it, and an initial git commit. `--no-install`, `--no-git` and `--no-tooling` skip those steps. The loom API now exports `detectPackageManager`, `execCommand` and `runCommand`.

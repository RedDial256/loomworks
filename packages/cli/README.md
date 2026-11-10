# @red_dial/loom

Copies [Loomworks](https://github.com/RedDial256/loomworks#readme) components into an Expo SDK 58 project as source you own: themed with Unistyles 3, open-ended props, light and dark themes. The component list and the theme guide are in the [main README](https://github.com/RedDial256/loomworks#components-and-hooks).

```sh
npx @red_dial/loom init
npx @red_dial/loom add button input
```

Unistyles needs a development build (no Expo Go). `--help` lists the flags.

## `loom init`

Run it once, at the root of an Expo project. It:

- checks that the project uses Expo SDK 58;
- copies the theme (light and dark themes, tokens, `useThemeMode`) into `src/theme`;
- points the `@/theme` alias in `tsconfig.json` at it;
- imports the Unistyles setup from the app entry (`index.ts` for Expo Router);
- creates `babel.config.js` with the Unistyles plugin, adds the AsyncStorage config plugin to `app.json` and the `expo.install.exclude` entry to `package.json`;
- installs Unistyles, Gesture Handler and AsyncStorage, and writes `loom.json`.

`init` only edits what it can change safely. An existing Babel config, an `app.config.js` or `.ts`, and the `GestureHandlerRootView` around your root layout are printed as steps for you to do. Running it again is safe: it skips what is already set up, and theme files you changed go through the [conflict flow](#when-a-file-already-exists).

## `loom add <items...>`

Copies the named components, hooks or utils and the items they depend on, installs their npm packages, and records them in `loom.json` with the loom version. Packages pinned by the Expo SDK, such as Reanimated, go through `expo install`. An unknown name fails with the list of available items.

Components, hooks and utils land under `src` with the kit's layout (`src/components/button/Button.tsx`, `src/hooks/boolean/useBoolean.ts`), so their relative imports keep working. The only alias they rely on is `@/theme`.

Each component's demo (`Button.demo.tsx`) is copied too when `loom.json` has a `sandbox` folder, as weaver's template does; `add` then rewrites the demo index in that folder, `demos.ts`. Without `sandbox`, no demos are copied. Tests are never copied.

## `loom.json`

```json
{
  "paths": { "ui": "src", "theme": "src/theme" },
  "sandbox": "src/sandbox",
  "items": { "theme": { "version": "0.1.0-alpha.0" } }
}
```

`paths.ui` is the folder for components, hooks and utils; `paths.theme` receives the theme and is the `@/theme` target; `sandbox` is optional. Set the paths before the first `init`, or move the files yourself afterwards. `items` is written by loom.

## When a file already exists

Before writing, loom compares each file with what is already in the project. Identical files are left alone. For a file that differs, in a terminal it asks, one file at a time:

- **Overwrite** with loom's version;
- **Skip (keep mine)**;
- **Show diff**, then asks again.

Nothing is written until every conflict is decided. `--overwrite` or `--skip-existing` answer for every file at once. Without a terminal (CI, scripts), a conflict without one of those flags stops loom with the list of files, and nothing is written.

## Getting a newer version of a component

There is no `update` command in v1. Run `add` again with a newer loom (`npx @red_dial/loom@<version> add button`) and decide each changed file in the conflict flow; **Show diff** shows your version against loom's. Since the code is yours, an automatic update could overwrite your changes, so loom shows them to you instead. A `loom diff` command and a remote registry come later.

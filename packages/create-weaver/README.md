# @red_dial/create-weaver

Creates an Expo Router app with [Loomworks](https://github.com/RedDial256/loomworks#readme) already set up: the theme, the components you pick, ESLint and Prettier with `@red_dial/rn-tooling-config`, installed dependencies and a first git commit.

```sh
npm create @red_dial/weaver
```

`pnpm create`, `yarn create` and `bun create` work too; the app then uses that package manager. The app needs a development build (no Expo Go), so its `ios` and `android` scripts run `expo run:ios` and `expo run:android`.

## Prompts and flags

Each prompt has a flag; a flag skips its prompt. With npm, flags go after `--`.

| Prompt                        | Flag                                         | `--yes` default       |
| ----------------------------- | -------------------------------------------- | --------------------- |
| Project name, also the folder | first argument (`my-app`)                    | none: always required |
| Components to add             | `--components button,switch` (`""` for none) | all                   |
| Hooks to add                  | `--hooks boolean,timeout` (`""` for none)    | all                   |
| Install dependencies now?     | `--install` / `--no-install`                 | yes                   |
| Initialize a git repository?  | `--git` / `--no-git`                         | yes                   |
| Set up ESLint and Prettier?   | `--tooling` / `--no-tooling`                 | yes                   |

`--yes` (`-y`) fills in the defaults for everything the flags leave out. Without a terminal, weaver cannot ask, so pass every flag or `--yes`:

```sh
npm create @red_dial/weaver my-app -- --yes --no-git
```

The name takes lowercase letters, digits and dashes, starting with a letter. The component and hook lists only offer what the template does not already include, and take the names `loom add` uses ([list](https://github.com/RedDial256/loomworks#components-and-hooks)).

## What the app contains

- Expo Router with two tabs: **Home**, with a light, dark and system theme picker, and **Sandbox**, with a searchable drawer and one page per installed component demo.
- The theme in `src/theme` and the components under `src/components` and `src/hooks`, copied by `loom init` and `loom add`. The template always brings `Box`, `Text`, `Button`, `Pressable`, `Input`, `Background` and `useDebounce`, plus what they depend on.
- A `loom.json` with `sandbox` set, so each later `npx @red_dial/loom add <item>` also adds that item's demo to the sandbox.
- `@/*` mapped to `./src/*`, `expo-image` and LegendList.
- With tooling: `eslint.config.mjs`, `prettier.config.mjs` and the `lint` and `format` scripts, on `@red_dial/rn-tooling-config`.

To add more components later, use [`loom`](https://github.com/RedDial256/loomworks/tree/main/packages/cli#readme) from the app folder.

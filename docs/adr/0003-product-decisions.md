# ADR 0003: Product decisions (distribution, CLI, components, release)

Status: accepted. Decisions from the initial design session; tokens are in [ADR 0002](0002-design-tokens.md) and Expo compatibility in [ADR 0001](0001-expo-56-57-compatibility.md).

## Goal

An open-ended React Native UI kit (Unistyles 3) distributed shadcn-style by a CLI that copies source into the user's project, plus a published project scaffolder (Expo Router, Unistyles, a sandbox to browse and learn the components).

## Packages and names

| Folder | npm package | Published | Role |
|---|---|---|---|
| `packages/ui` | `@red_dial/loom-ui` | no (embedded in the CLI at build time) | Component and hook sources, tests, demos |
| `packages/cli` | `@red_dial/loom` | yes | `loom init`, `loom add`, and a programmatic API |
| `packages/create-weaver` | `@red_dial/create-weaver` | yes | `npm create @red_dial/weaver`; uses the `loom` API |
| `templates/app` | embedded in `create-weaver` | no | Expo 57 template |

- Repo: `RedDial256/loomworks` (public, MIT), single monorepo. npm scope `@red_dial`. Everything (code, folders, docs, CLI messages) is in English.
- pnpm workspaces, no Turborepo or Nx. Lint and format with `@red_dial/rn-tooling-config` (pinned; it is alpha).

## Distribution

- The CLI embeds the component source in its package, so the CLI version is the component version. The manifest (item to files, npm deps, item deps, optional demo, minimum versions) is source-agnostic so a remote registry can replace the embedded source later.
- Release: lockstep versions via Changesets (`fixed` group), pre-release `alpha` until stable, GitHub Actions with the Changesets action and npm provenance.
- Testing an old release means using the published artifacts (`npx @red_dial/loom@x.y.z`, `npm create @red_dial/weaver@x.y.z`) or checking out its tag.

## Support policy

- `loom` supports Expo SDK 56 and 57 (minimums in ADR 0001, validated by the CLI). The template targets SDK 57 only. Unistyles 3 needs the New Architecture and a development build (no Expo Go). SDK 57 on iOS could not be launched yet (see issue #9).

## CLI behavior

- `loom init`: creates the light and dark themes with the typed `Theme` (ADR 0002), configures Unistyles, adds the `@/theme` alias to `tsconfig`, writes `loom.json`, installs dependencies (Unistyles, Gesture Handler, AsyncStorage).
- `loom add <items>`: resolves item dependencies, copies files, installs npm deps, records installed versions in `loom.json`. On an existing file it asks per file (overwrite, skip, show diff). Flags `--overwrite` and `--skip-existing`; in non-interactive mode a conflict without a flag fails with a clear error.
- No `update` command in v1: users re-run `add` and go through the conflict flow. `loom diff` and a remote registry come later.
- `loom.json` (T05): `paths.ui` (default `src`) is the base for components, hooks and utils and keeps the registry layout (`components/…`, `hooks/…`), so relative imports between items always resolve; `paths.theme` (default `src/theme`) receives the theme and is the `@/theme` alias target; `items` records each installed item with the loom version. The Unistyles Babel plugin `root` is the top folder of `paths.ui` (the plugin rejects the project root).
- The theme is a manifest item of kind `theme` (files under `theme/`), installed by `init`; it carries the init packages. `init` edits only what it can do safely and idempotently (`tsconfig` paths, `index.ts` entry and `main`, a new `babel.config.js`, `app.json` plugins, `expo.install.exclude`); an existing Babel config, a dynamic `app.config.*` and the root layout's `GestureHandlerRootView` are left as printed notes.
- `loom.json` has the target folders and an optional `sandbox` path. Demos (`*.demo.tsx`, next to each component) are copied, and the sandbox index updated, only when `sandbox` is set. Test files are never copied.

## Component conventions

- Open-ended: props extend the native props of the main element, defaults are overridable, and the user's `style` is always last (`[styles.container, style]`).
- Visual variants use native Unistyles variants (`useVariants`). Size variants are `'S' | 'M' | 'L'` (plus `'XS'` / `'XL'` when needed).
- Imports between components and hooks are relative. The only alias is `@/theme`.
- v1 components: `Box`, `Text`, `Card`, `Divider`, `Button`, `Pressable`, `Input`, `Switch`, `Spinner`, `Skeleton`. Hooks: `useThemeMode`, `useDebounce`, `useDisclosure`. Out of v1: `Modal`/`Sheet`, `Toast`, `Select`, `Checkbox`/`Radio`, lists.
- `Button` and `Pressable` use the Gesture Handler 3 `Pressable`. `Button`, `Text`, `Input` and `Switch` take a `loading` prop that renders a `Skeleton` and sets `a11y.busy`.
- `useThemeMode`: `system | light | dark`, persisted in AsyncStorage, installed by `init`, built on Unistyles themes named `light` and `dark`.

## Accessibility architecture (`easyA11y`)

- A utility takes a simplified `a11y` object and returns native props. Keys: `label`, `hint`, `role`, `value`, `disabled`, `selected`, `checked`, `busy`, `expanded`, `hidden`, `live`.
- Output uses only the legacy family: `accessible`, `accessibilityLabel`, `accessibilityHint`, `accessibilityRole`, `accessibilityState`, `accessibilityValue`, `accessibilityElementsHidden` with `importantForAccessibility`, `accessibilityLiveRegion`.
- Three-tier cascade, weakest to strongest: the component's defaults, the `a11y` object passed by the user, and native props passed straight to the element (bypassing the utility). React Native gives `aria-*` precedence over the legacy props, so a user-supplied `aria-*` wins naturally.

## Scaffolder (`weaver`)

- Prompts with `@clack/prompts`: project name, components, hooks, install now, git init, use `@red_dial/rn-tooling-config` for ESLint and Prettier. The package manager is detected from `npm_config_user_agent`, and `loom init` always runs.
- Flags: `--yes` (full automatic setup with defaults, tooling included), `--components`, `--hooks`, `--no-install`, `--no-git`, `--no-tooling`.
- Template: Expo Router and Unistyles, two tabs (home and sandbox), a side drawer inside the sandbox listing the component demos. In the monorepo it imports `packages/ui` through the workspace and Metro `watchFolders` for hot reload; the published template uses copied files.

## Testing

1. `jest-expo` with React Native Testing Library for utilities, hooks and components (variants, `loading`, style override, accessibility).
2. CI integration: scaffold or init in a temp project, `loom add`, then `tsc --noEmit` and lint, on Expo 57 and a 56 fixture.
3. Manual: the sandbox in hot reload.

## Process

- Issues and milestones on GitHub; Phases 0 and 1 are ticketed, later phases are outlined in `docs/roadmap.md`.

## Open points

- Whether `@red_dial/loom-ui` (private) stays in the Changesets `fixed` group (currently included, keeps lockstep).

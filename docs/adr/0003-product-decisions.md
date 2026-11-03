# ADR 0003: Product decisions (distribution, CLI, components, release)

Status: accepted. Decisions from the initial design session; tokens are in [ADR 0002](0002-design-tokens.md) and Expo compatibility in [ADR 0001](0001-expo-compatibility.md).

## Goal

An open-ended React Native UI kit (Unistyles 3) distributed shadcn-style by a CLI that copies source into the user's project, plus a published project scaffolder (Expo Router, Unistyles, a sandbox to browse and learn the components).

## Packages and names

The packages and their roles are in the [README](../../README.md). `@red_dial/loom` and `@red_dial/create-weaver` are published; `@red_dial/loom-ui` and the template are embedded at build time.

- Repo: `RedDial256/loomworks` (public, MIT), single monorepo. npm scope `@red_dial`. Everything (code, folders, docs, CLI messages) is in English.
- pnpm workspaces, no Turborepo or Nx. Lint and format with `@red_dial/rn-tooling-config` (pinned; it is alpha).

## Distribution

- The CLI embeds the component source in its package, so the CLI version is the component version. The manifest (item to files, npm deps, SDK-pinned packages, item deps, optional demo, minimum versions) is source-agnostic so a remote registry can replace the embedded source later.
- Release: lockstep versions via Changesets (`fixed` group), pre-release `alpha` until stable, GitHub Actions with the Changesets action and npm provenance.
- Testing an old release means using the published artifacts (`npx @red_dial/loom@x.y.z`, `npm create @red_dial/weaver@x.y.z`) or checking out its tag.

## Support policy

- `loom` and the template support Expo SDK 58 only ([ADR 0001](0001-expo-compatibility.md); the CLI validates the SDK). Unistyles 3 needs the New Architecture and a development build (no Expo Go).

## CLI behavior

- `loom init`: creates the light and dark themes with the typed `Theme` (ADR 0002), configures Unistyles, adds the `@/theme` alias to `tsconfig`, writes `loom.json`, installs dependencies (Unistyles, Gesture Handler, AsyncStorage).
- `loom add <items>`: resolves item dependencies, copies files, installs npm deps (`packages` with their ranges; `sdkPackages` such as Reanimated and Worklets through `expo install`, which picks the pair pinned for the project's SDK), records installed versions in `loom.json`. On an existing file it asks per file (overwrite, skip, show diff). Flags `--overwrite` and `--skip-existing`; in non-interactive mode a conflict without a flag fails with a clear error.
- No `update` command in v1: users re-run `add` and go through the conflict flow. `loom diff` and a remote registry come later.
- `loom.json` (T05): `paths.ui` (default `src`) is the base for components, hooks and utils and keeps the registry layout (`components/…`, `hooks/…`), so relative imports between items always resolve; `paths.theme` (default `src/theme`) receives the theme and is the `@/theme` alias target; `items` records each installed item with the loom version. The Unistyles Babel plugin `root` is the top folder of `paths.ui` (the plugin rejects the project root).
- The theme is a manifest item of kind `theme` (files under `theme/`), installed by `init`; it carries the init packages. `init` edits only what it can do safely and idempotently (`tsconfig` paths, `index.ts` entry and `main`, a new `babel.config.js`, `app.json` plugins, `expo.install.exclude`); an existing Babel config, a dynamic `app.config.*` and the root layout's `GestureHandlerRootView` are left as printed notes.
- `loom.json` has the target folders and an optional `sandbox` path. Demos (`*.demo.tsx`, next to each component) are copied, and the sandbox index updated, only when `sandbox` is set. Test files are never copied.

## Component conventions

- Open-ended: props extend the native props of the main element, defaults are overridable, and the user's `style` is always last (`[styles.container, style]`).
- Each component keeps its public types (props and their unions) in a sibling `X.types.ts` (for example `Box.types.ts`); `X.tsx` holds the implementation and styles and imports the types from there. Both files are listed in the manifest.
- Visual variants use native Unistyles variants (`useVariants`). Size variants are `'S' | 'M' | 'L'` (plus `'XS'` / `'XL'` when needed).
- Imports between components and hooks are relative. The only alias is `@/theme`.
- v1 components: `Box`, `Text`, `Card`, `Divider`, `Button`, `Pressable`, `Input` (over `TextField` and `DateTimeInput`), `Switch`, `Spinner`, `Skeleton`. Hooks: `useThemeMode`, `useReducedMotion`, `useDebounce`, `useBoolean` (replaces `useDisclosure`), `useTimeout`. Out of v1: `Modal`/`Sheet` (`DateTimeInput` uses an inline picker instead), `Toast`, `Select`, `Checkbox`/`Radio`, a list component (the template uses LegendList directly, T35).
- Animations use Reanimated 4 (with `react-native-worklets`), declared as `sdkPackages` only by the items that animate (`useReducedMotion`, `Skeleton`, `Button`), so `init` does not install it. Reduced motion follows ADR 0002.
- `Button` and `Pressable` use the Gesture Handler 3 `Pressable`. `Button`, `Text`, `Input` and `Switch` take a `loading` prop that renders a `Skeleton` and sets `a11y.busy`.
- `Pressable` is a touch enabler with no styling or animation of its own; it passes the `pressed` state to `style` and `children` and exports a helper that derives `hitSlop` from a visual size.
- `Button`: `S` (visual 32, `hitSlop` up to `touchTarget.min`) is an accepted exception to the ADR 0002 rule of a real `minHeight` of 48 for buttons. Besides `loading` (content not ready), `pending` (action in progress) shows a `Spinner` in place of the label, keeps the width and blocks presses. An inline `Link` built on `Text` was considered and dropped.
- `Input`: a `type` prop sets keyboard, autocomplete and capitalization together. Validation is synchronous and library-agnostic: any Standard Schema plus a `validate` callback; on blur, then on change with a 300 ms debounce while there is an error. `date`, `time` and `datetime` route to `DateTimeInput` (`Date` value; the native picker inline below the field on iOS, as the HIG recommends and avoiding the open Fabric `Modal` bugs; the system dialogs on Android; `datetime` is a date and a time button); the other types to `TextField`.
- `Switch` wraps React Native's `Switch` and is controlled only (the native switch reverts when `value` is not updated); parents hold its state with `useBoolean`.
- `useThemeMode`: `system | light | dark`, persisted in AsyncStorage, installed by `init`, built on Unistyles themes named `light` and `dark`.

## Accessibility architecture (`easyA11y`)

- A utility takes a simplified `a11y` object (`easyA11y.types.ts`) and returns only the legacy native props (`accessibilityLabel`, `accessibilityState`, …), never `aria-*`, so a user-supplied `aria-*` can still win.
- `accessible` also drives `importantForAccessibility`: `hidden` wins (`'no-hide-descendants'`, and `accessible` becomes `false`), then `accessible` maps `true` to `'yes'` and `false` to `'no'`.
- Cascade, weakest to strongest: the utility's defaults (`accessible: true`), the component's defaults (`Box` sets `accessible: false`; `Text` sets the heading role), the `a11y` object passed by the user, and native props passed straight to the element. The component and user objects are merged shallowly, so a user `actions` list replaces the component's; components with default actions export them so users can extend the list. Native props spread last replace whole objects (`accessibilityState`, `onAccessibilityAction`).
- React Native gives `aria-*` precedence over the legacy props, so a user-supplied `aria-*` wins naturally, key by key. Two exceptions in React Native 0.86: `aria-hidden={false}` does not reset `importantForAccessibility` on Android (use `a11y={{ hidden: false }}`), and `aria-modal` is ignored by `View` and `Text`.

## Scaffolder (`weaver`)

- Prompts with `@clack/prompts`: project name, components, hooks, install now, git init, use `@red_dial/rn-tooling-config` for ESLint and Prettier. The package manager is detected from `npm_config_user_agent`, and `loom init` always runs.
- `--yes` gives a full automatic setup with the defaults, tooling included; every prompt has a flag (`--help`).
- Template: Expo Router and Unistyles, two tabs (home and sandbox), a side drawer inside the sandbox listing the component demos. In the monorepo it imports `packages/ui` through the workspace and Metro `watchFolders` for hot reload; the published template uses copied files.

## Testing

1. `jest-expo` with React Native Testing Library for utilities, hooks and components (variants, `loading`, style override, accessibility).
2. CI integration: scaffold or init in a temp project, `loom add`, then `tsc --noEmit` and lint, on Expo 58.
3. Manual: the sandbox in hot reload.

## Open points

- Whether `@red_dial/loom-ui` (private) stays in the Changesets `fixed` group (currently included, keeps lockstep).

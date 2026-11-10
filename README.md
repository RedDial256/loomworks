# Loomworks

Loom adds components, weaver creates projects.

Loomworks is a React Native UI kit for Expo, styled with [Unistyles 3](https://www.unistyl.es). Like shadcn/ui, it is not a dependency: the `loom` CLI copies the component source into your project, so you own it and can change anything. Components keep the native props of the element they wrap, take an `a11y` object for accessibility, and follow light and dark themes.

## Try it in the browser

The example app, the same one weaver creates, is live at **https://loom-app.expo.app**, deployed from `main`. Its sandbox tab has a demo of every component, in light and dark. The web build is a preview: Loomworks targets iOS and Android, and on web the `Button` and the sandbox drawer items lose their styles and the date and time picker opens nothing ([#97](https://github.com/RedDial256/loomworks/issues/97)).

## Requirements

- Expo SDK 58 with the New Architecture. `loom` checks the SDK and stops on any other.
- A development build (`npx expo run:ios` or `run:android`). Unistyles does not run in Expo Go.
- Node `^22.13.0 || ^24.3.0 || >=26`, the range React Native 0.88 supports.

## Start a new app

```sh
npm create @red_dial/weaver my-app -- --yes
cd my-app
npm run ios   # or: npm run android
```

`--yes` takes every default: all the components and hooks, installed dependencies, ESLint and Prettier, and a first git commit. Leave it out to choose. The app opens on a home screen with a theme switcher and a sandbox tab with a demo of each installed component. [`create-weaver`](packages/create-weaver/README.md) has the prompts, the flags and what the app contains.

Add a `Button` to the home screen, `src/app/index.tsx`:

```tsx
import { Alert } from 'react-native';

import { Button } from '@/components/button/Button';

const sayHello = () => Alert.alert('Hello from Loom');

// In the JSX, below <ThemeModePicker />:
<Button onPress={sayHello}>Say hello</Button>;
```

## Add Loomworks to an existing Expo app

```sh
npx @red_dial/loom init
npx @red_dial/loom add button
```

`init` installs the theme in `src/theme`, sets up Unistyles and writes `loom.json`. It prints the steps it cannot do safely for you; one is always there: wrap your root layout in `<GestureHandlerRootView style={{ flex: 1 }}>` from `react-native-gesture-handler`. `add` copies `src/components/button/` and what it depends on, and installs the packages they need. Then rebuild the development build, since `init` adds native modules, and import the button from `src/components/button/Button` (`@/components/button/Button` when `@/*` maps to `./src/*`). [`loom`](packages/cli/README.md) covers the commands, the folders and what happens when a file already exists.

## Components and hooks

Each name in the first column is what `loom add` takes; it brings its dependencies along. Props are documented in each component's `*.types.ts`, which your editor shows on hover. The demos are the sandbox pages of the template app.

| Item             | Export                                                                         | What it is                                                                          | Demo                                                              |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `box`            | [`Box`](packages/ui/src/components/box/Box.tsx)                                | A `View` with theme padding and surfaces                                            | [demo](packages/ui/src/components/box/Box.demo.tsx)               |
| `text`           | [`Text`](packages/ui/src/components/text/Text.tsx)                             | Text with typography presets, tones and a loading skeleton                          | [demo](packages/ui/src/components/text/Text.demo.tsx)             |
| `card`           | [`Card`](packages/ui/src/components/card/Card.tsx)                             | Raised surface with an elevation level                                              | [demo](packages/ui/src/components/card/Card.demo.tsx)             |
| `divider`        | [`Divider`](packages/ui/src/components/divider/Divider.tsx)                    | Horizontal or vertical separator                                                    | [demo](packages/ui/src/components/divider/Divider.demo.tsx)       |
| `background`     | [`Background`](packages/ui/src/components/background/Background.tsx)           | A theme color or gradient, as a wrapper or as a fill layer                          | [demo](packages/ui/src/components/background/Background.demo.tsx) |
| `pressable`      | [`Pressable`](packages/ui/src/components/pressable/Pressable.tsx)              | Unstyled touch target with the `pressed` state and a `hitSlop` helper               | [demo](packages/ui/src/components/pressable/Pressable.demo.tsx)   |
| `button`         | [`Button`](packages/ui/src/components/button/Button.tsx)                       | Six variants, five color families, three sizes, loading and pending states          | [demo](packages/ui/src/components/button/Button.demo.tsx)         |
| `input`          | [`Input`](packages/ui/src/components/input/Input.tsx)                          | Text, date and time fields with label, hint, error and validation, picked by `type` | [demo](packages/ui/src/components/input/Input.demo.tsx)           |
| `switch`         | [`Switch`](packages/ui/src/components/switch/Switch.tsx)                       | Controlled switch with an optional pressable label row                              | [demo](packages/ui/src/components/switch/Switch.demo.tsx)         |
| `spinner`        | [`Spinner`](packages/ui/src/components/spinner/Spinner.tsx)                    | Themed activity indicator in three sizes                                            | [demo](packages/ui/src/components/spinner/Spinner.demo.tsx)       |
| `skeleton`       | [`Skeleton`](packages/ui/src/components/skeleton/Skeleton.tsx)                 | Loading placeholder, static under reduced motion                                    | [demo](packages/ui/src/components/skeleton/Skeleton.demo.tsx)     |
| (`init`)         | [`useThemeMode`](packages/ui/src/theme/useThemeMode.ts)                        | `system`, `light` or `dark`, persisted; import from `@/theme`                       |                                                                   |
| `reduced-motion` | [`useReducedMotion`](packages/ui/src/hooks/reduced-motion/useReducedMotion.ts) | The live reduced-motion setting, and `useMotion` for animations                     |                                                                   |
| `debounce`       | [`useDebounce`](packages/ui/src/hooks/debounce/useDebounce.ts)                 | A value once it has stopped changing                                                |                                                                   |
| `boolean`        | [`useBoolean`](packages/ui/src/hooks/boolean/useBoolean.ts)                    | Boolean state with stable `set`, `toggle` and `setter`                              |                                                                   |
| `timeout`        | [`useTimeout`](packages/ui/src/hooks/timeout/useTimeout.ts)                    | One `setTimeout`, cleared on unmount                                                |                                                                   |

## Change the theme

The theme is yours after `loom init`: edit the files in `src/theme` (the `paths.theme` folder in `loom.json`) and every component follows. Components only read semantic roles such as `primary` or `surface`, never raw colors, so:

- **Brand colors:** change the hues in `palette.ts`, or point roles at other steps in `light.ts` and `dark.ts`.
- **Spacing, radii, type, motion, shadows:** `spacing.ts`, `typography.ts` (set `fontFamily` for a custom font), `motion.ts` and `elevation.ts`.
- **A new color family:** add it to `ColorFamily` in `contract.ts`; TypeScript then asks for its five roles in both themes.

The kit's own tests check text contrast (WCAG AA) for the shipped values; they are not copied, so check the contrast of the colors you pick.

## Contributing

Design decisions and their reasons are in [`docs/adr`](docs/adr) (Expo compatibility, design tokens, product decisions including the components left out of v1, `Background`, deploy and preview), the plan in [`docs/roadmap.md`](docs/roadmap.md) and the code conventions in [`docs/code-style.md`](docs/code-style.md).

| Folder                   | Package                   | Description                                                    |
| ------------------------ | ------------------------- | -------------------------------------------------------------- |
| `packages/ui`            | `@red_dial/loom-ui`       | Component sources (private, embedded in the CLI at build time) |
| `packages/cli`           | `@red_dial/loom`          | `loom init` / `loom add`: copies components into your project  |
| `packages/create-weaver` | `@red_dial/create-weaver` | `npm create @red_dial/weaver`: scaffolds a new Expo Router app |
| `templates/app`          | (embedded)                | Expo 58 app template used by weaver                            |

```sh
pnpm bootstrap   # install + build the CLI (idempotent, also for git worktrees)
pnpm lint
pnpm typecheck
pnpm format
```

Versions are lockstep via [Changesets](https://github.com/changesets/changesets) in pre-release mode (`alpha`).

## License

[MIT](LICENSE)

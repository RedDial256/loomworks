# Loomworks — Roadmap

Monorepo (`RedDial256/loomworks`, pnpm workspaces, MIT) with:

| Folder | npm package | Published |
|---|---|---|
| `packages/ui` | `@red_dial/loom-ui` | no (embedded in the CLI at build time) |
| `packages/cli` | `@red_dial/loom` | yes — `loom init`, `loom add` |
| `packages/create-weaver` | `@red_dial/create-weaver` | yes — `npm create @red_dial/weaver` |
| `templates/app` | (embedded in create-weaver) | no |

Versions: lockstep via Changesets, pre-release (`alpha`) until stable.
Support: `loom` on Expo 56 + 57, template on Expo 57 only.
Labels: `pkg:ui`, `pkg:loom`, `pkg:weaver`, `template`, `ci`, `docs`, `spike`.

Order follows tracer bullets: one thin slice end-to-end first (Phase 1), then widen.
Phases 0 to 4 are ticketed; later phases are outlined at the end.

---

## Phase 0 — Foundations and risk

**T01 Monorepo scaffold** `ci`
pnpm workspace, base `tsconfig`, ESLint + Prettier via `@red_dial/rn-tooling-config`, Changesets (pre mode), MIT license, root README mapping the packages.
- `pnpm lint` and `pnpm typecheck` run clean on empty packages.
- Blocked by: —

**T02 Spike: Expo 57 / 56 compatibility** `spike`
Dev build with Unistyles 3.5 + Gesture Handler 3 (`Pressable`) + AsyncStorage on Expo 57 and Expo 56. Record the outcome in an ADR; if 56 fails, document the conditional code or drop 56 support.
- ADR lists working and non-working combinations and the minimum versions for the manifest.
- Blocked by: —

**T03 CI baseline** `ci`
GitHub Actions: lint, typecheck, unit tests on every PR.
- Blocked by: T01

## Phase 1 — Tracer bullet (end-to-end thin slice)

**T04 Manifest format and embedding build** `pkg:loom`
Manifest schema (item → files, npm deps, item deps, optional demo, min versions), build step that copies `packages/ui` into the CLI package. Manifest stays source-agnostic (future remote registry).
- Built CLI contains the manifest and the component sources; schema is validated in tests.
- Blocked by: T01

**T05 `loom init` + theme** `pkg:loom` `pkg:ui`
Creates light and dark themes with the typed `Theme` contract, Unistyles `configure`, `@/theme` alias in `tsconfig`, `loom.json`, installs dependencies (Unistyles, Gesture Handler, AsyncStorage). The `Theme` contract and token scales follow [ADR 0002](adr/0002-design-tokens.md); final per-role color values for both themes are decided in this ticket.
- Running it on a fresh Expo project yields a typechecking app with a working theme.
- Blocked by: T02, T04

**T06 `loom add` core + programmatic API** `pkg:loom`
Resolves item dependencies, copies files, installs npm deps, per-file conflict prompt, `--overwrite`, `--skip-existing`, fails on conflicts in non-interactive mode, records versions in `loom.json`, exports the core as an API.
- Conflict matrix covered by tests; API used by the binary.
- Blocked by: T04, T05

**T07 `Box` and `Text`** `pkg:ui`
First components: open-ended props (`ViewProps`/`TextProps`), native Unistyles variants, user `style` last. Typography presets come from ADR 0002.
- Installable with `loom add box text`; unit tests for variants and style override.
- Blocked by: T05

**T08 First integration test** `ci`
CI job: fresh Expo 57 project → `loom init` → `loom add box text` → `tsc --noEmit` + lint.
- Job green on PRs.
- Blocked by: T06, T07, T03

---

## Phase 2 — Accessibility and primitives

Every new item lands in the manifest with its `X.types.ts`, unit tests (jest-expo + RNTL), and is added to `scripts/integration.sh`. Demos wait for the Phase 4 convention.

**T09 `easyA11y` utility** `pkg:ui`
`a11y` util item: takes the simplified object (`label`, `hint`, `role`, `value`, `disabled`, `selected`, `checked`, `busy`, `expanded`, `hidden`, `live`) and returns legacy native props only (ADR 0003). Three-tier cascade: component defaults < user `a11y` < native props. `Box` and `Text` gain an `a11y` prop; `Text` moves its heading role to the cascade.
- Unit tests for each key's mapping and for the cascade order; `aria-*` passed by the user still wins.
- Blocked by: —

**T10 `useReducedMotion` hook** `pkg:ui`
Reactive system setting through `AccessibilityInfo` and its change event (Reanimated's hook is not reactive, ADR 0002). Exposes the boolean plus a helper that maps the `none` / `fade` / `keep` behaviors to durations from `motion`.
- Tests for the initial value and the change event (mocked `AccessibilityInfo`).
- Blocked by: —

**T11 `Skeleton` and `loading` on `Text`** `pkg:ui`
`Skeleton` placeholder (size from props or from the text preset's line height), pulse animation marked `keep` (opacity only under reduced motion). `Text` takes `loading`: renders a `Skeleton` and sets `a11y.busy`. Open decision: React Native `Animated` (no new dependency) or Reanimated (recommended: `Animated`, opacity on the native driver).
- Tests for `loading` rendering, `busy` state, and reduced motion; installs with `loom add text` pulling `skeleton`.
- Blocked by: T09, T10

**T12 `Spinner`** `pkg:ui`
Wraps `ActivityIndicator` with size variants (`S` / `M` / `L`) and a color role (`primary` by default); `keep` under reduced motion; `a11y` with `progressbar` role and `busy`.
- Tests for variants, color override, accessibility props.
- Blocked by: T09

**T13 `Divider` and `Card`** `pkg:ui`
`Divider`: horizontal/vertical, `border` / `borderStrong`, hidden from accessibility. `Card`: built on `Box`, `surfaceRaised`, `radii.lg`, elevation variant (`none` / `sm` / `md` / `lg`) with the dark-mode tint and hairline from the theme.
- Tests for variants and style override; `card` depends on `box` in the manifest.
- Blocked by: T09

**T14 `useThemeMode`** `pkg:ui`
`system | light | dark`, persisted in AsyncStorage. `system` keeps Unistyles adaptive themes; `light`/`dark` disable them and call `setTheme`. Restores the stored mode at startup without a flash (decide between `initialTheme` and a restore call in `theme/unistyles.ts`).
- Tests for each mode transition and persistence (mocked AsyncStorage and Unistyles runtime).
- Blocked by: —

**T15 `useDebounce` and `useDisclosure`** `pkg:ui`
`useDebounce(value, delay)`; `useDisclosure(initial)` returning `isOpen`, `open`, `close`, `toggle` with stable callbacks.
- Tests with fake timers and for callback identity.
- Blocked by: —

**T16 Security audit in CI** `ci`
CI job running [`rnsec`](https://github.com/adnxy/rnsec) (pinned to `1.3.0`) on the fresh Expo app built by the `integration` job and on the `packages/` sources. Fails on high-severity findings (exit code 1); the Markdown report is uploaded as a workflow artifact.
- Job green on PRs; a planted secret on a throwaway branch makes it fail.
- Blocked by: —

---

## Phase 3 — Interactive components

Same convention as Phase 2. Tickets #37 to #43, milestone "Phase 3 — Interactive components".

**T17 `Pressable`** `pkg:ui` (#37)
Touch enabler over the Gesture Handler 3 `Pressable`: no styling or animation, `pressed` state passed to `style`/`children`, `a11y`, `disabled`, and a helper deriving `hitSlop` from a visual size.
- Blocked by: —

**T18 `useTimeout` hook** `pkg:ui` (#38)
Owns one `setTimeout` for `callback` and always clears it on unmount. Exposes `set` (starts or restarts it), `clear`, and a ref to the current timer. Optionally adopts an existing timer at start. Calls the latest `callback` without restarting the timer. Timer type `ReturnType<typeof setTimeout>`.
- Blocked by: —

**T19 `Button`** `pkg:ui` (#39)
On the kit `Pressable`. Variants `solid` / `subtle` / `outline` / `ghost` / `link` / `text`, `color` family, sizes `S` (32 + `hitSlop`) / `M` (48) / `L` (56). Scale press feedback (`fade` under reduced motion; opacity for `link`/`text`). `loading` renders a `Skeleton`; `pending` shows a `Spinner`, keeps the width and blocks presses.
- Blocked by: T17

**T20 `useBoolean`** `pkg:ui` (#40)
`useBoolean(initial)` with a required `initial`, returning `value`, `set`, `toggle`, `setter` (cached handler per value) and `reset`, all stable. Replaces and removes `useDisclosure`.
- Blocked by: —

**T21 `Input`** `pkg:ui` (#41)
Styled `TextInput`: `type` (`text`, `email`, `password`, `number`, `decimal`, `phone`, `url`, `search`), `label`, `placeholder`, `hint`, `error`, `required`, controlled and uncontrolled, ref (`get`, `set`, `reset`, `focus`, `blur`, `clear`, `validate`), `loading`.
- Blocked by: —

**T22 `Input` validation** `pkg:ui` (#42)
Synchronous, library-agnostic: any Standard Schema plus a `validate` callback. Validates on blur; while there is an error, on change with a 300 ms debounce.
- Blocked by: T21

**T23 `Switch`** `pkg:ui` (#43)
Native `Switch` with theme colors, controlled only (no ref), `label` row and `loading`.
- Blocked by: —

---

## Phase 4 — Demos, template and scaffolder

Expo SDK 58 only (T24 replaces the 56 + 57 support). Three parallel tracks after T24: weaver, `Input` with date and time, `Background`. Tickets #53 to #61, blocking links in each issue body.

**T24 Upgrade to Expo SDK 58** `ci` `pkg:loom` `pkg:ui` (#53)
SDK 58 only (RN 0.88.1, React 19.3.0), needed for the stable `backgroundImage` (RN 0.87+). Unistyles 3.7.0, Reanimated 4.7.1, Worklets 0.13; Gesture Handler stays on the Expo pin (`~3.3`) and leaves `expo.install.exclude`. Manifest minimums, `integration.sh` and an ADR 0004 replacing the ADR 0001 support policy.
- Blocked by: —

**T25 Template app** `template` (#54)
`templates/app` with Expo Router: home and sandbox tabs; the sandbox opens an `expo-router/drawer` with a search field (`Input` + `useDebounce`) over the component list. Imports `packages/ui` through the workspace and Metro `watchFolders`.
- Blocked by: T24

**T26 `weaver` core with `--yes`** `pkg:weaver` (#55)
Copies the embedded template, runs `loom init` through the API, installs with the detected package manager, `git init`, tooling. Flags `--yes`, `--no-install`, `--no-git`, `--no-tooling`.
- Blocked by: T25

**T27 `weaver` prompts** `pkg:weaver` (#56)
`@clack/prompts` for name, components, hooks, install, git and tooling; `--components` / `--hooks` skip their prompts; items installed through the `loom add` API.
- Blocked by: T26

**T28 Demo convention and sandbox index** `pkg:loom` `pkg:ui` `template` (#57)
`*.demo.tsx` format (title, sections, search keywords), the demo index feeding the drawer, `loom add` updating it when `sandbox` is set; `Box` demo as the reference.
- Blocked by: T25

**T29 Demos for the existing components** `pkg:ui` (#58)
One demo per v1 component; first visual pass on the Phase 3 interactive components.
- Blocked by: T28

**T30 `Input` with date and time** `pkg:ui` (#59)
Shared field logic extracted first; today's text implementation moves to a new text field; `DateTimeInput` (`date` / `time` / `datetime`, `Date` value, `@react-native-community/datetimepicker`); `Input` becomes a wrapper routing by `type` with a discriminated union.
- Blocked by: T24 (the extraction can start before)

**T31 Spike: `Background` with `backgroundImage`** `spike` (#60)
Gradients with theme colors, radius and clipping, background size/position/repeat, wrapper vs fill-parent forms, on iOS and Android. Outcome in an ADR; `expo-linear-gradient` only as a fallback.
- Blocked by: T24

**T32 `Background`** `pkg:ui` (#61)
Color or gradient background in the forms decided in T31, with a sandbox demo.
- Blocked by: T31 (and T28 for the demo)

---

## Decision gate — Design system and tokens

Done: recorded in [ADR 0002](adr/0002-design-tokens.md), backed by three benchmarks in `docs/research/`. Remaining: per-role color values in T05 and a visual pass once Phase 1 components exist.

## Later phases (outline, not ticketed yet)

- **Phase 5 — Quality and release:** check whether Expo SDK 59 exists; if so, keep 58 and add 59. accessibility audit once all v1 components exist (VoiceOver and TalkBack pass per component in the sandbox, WCAG AA contrast for theme roles in both themes, touch targets of at least 44 pt / 48 dp, reduced motion, font scaling; findings filed as issues), scaffold integration test, Expo 56 matrix and `engines` validation, release pipeline, docs, first alpha.
- **Not in v1:** `loom diff`, remote registry, `Modal`/`Sheet`, `Toast`, `Select`, `Checkbox`/`Radio`, lists, template mirror repo.

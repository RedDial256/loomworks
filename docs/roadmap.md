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
Phases 0 to 2 are ticketed; later phases are outlined at the end.

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

---

## Decision gate — Design system and tokens

Done: recorded in [ADR 0002](adr/0002-design-tokens.md), backed by three benchmarks in `docs/research/`. Remaining: per-role color values in T05 and a visual pass once Phase 1 components exist.

## Later phases (outline, not ticketed yet)

- **Phase 3 — Interactive components:** `Pressable` and `Button` (Gesture Handler 3), `Input`, `Switch`.
- **Phase 4 — Demos, template and scaffolder:** demo convention, template app (tabs + sandbox drawer), `weaver` with `--yes` and prompts.
- **Phase 5 — Quality and release:** scaffold integration test, Expo 56 matrix and `engines` validation, release pipeline, docs, first alpha.
- **Not in v1:** `loom diff`, remote registry, `Modal`/`Sheet`, `Toast`, `Select`, `Checkbox`/`Radio`, lists, template mirror repo.

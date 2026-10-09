# Loomworks — Roadmap (draft)

Monorepo (`red-dial/loomworks`, pnpm workspaces, MIT) with:

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
Only Phases 0 and 1 are ticketed for now.

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
Creates light and dark themes with the typed `Theme` contract, Unistyles `configure`, `@/theme` alias in `tsconfig`, `loom.json`, installs dependencies (Unistyles, Gesture Handler, AsyncStorage). Token values are placeholders; the real scale comes from the design system session.
- Running it on a fresh Expo project yields a typechecking app with a working theme.
- Blocked by: T02, T04

**T06 `loom add` core + programmatic API** `pkg:loom`
Resolves item dependencies, copies files, installs npm deps, per-file conflict prompt, `--overwrite`, `--skip-existing`, fails on conflicts in non-interactive mode, records versions in `loom.json`, exports the core as an API.
- Conflict matrix covered by tests; API used by the binary.
- Blocked by: T04, T05

**T07 `Box` and `Text`** `pkg:ui`
First components: open-ended props (`ViewProps`/`TextProps`), native Unistyles variants, user `style` last. Typography uses placeholder tokens.
- Installable with `loom add box text`; unit tests for variants and style override.
- Blocked by: T05

**T08 First integration test** `ci`
CI job: fresh Expo 57 project → `loom init` → `loom add box text` → `tsc --noEmit` + lint.
- Job green on PRs.
- Blocked by: T06, T07, T03

---

## Decision gate — Design system and tokens

A dedicated session (grilling) before Phase 2: token scales (color roles, spacing, radii, typography, elevation, motion, breakpoints), naming, light/dark mapping and how components consume them. The outcome replaces the placeholder values from T05/T07 and is recorded as an ADR and in `CONTEXT.md`-style docs.

## Later phases (outline, not ticketed yet)

- **Phase 2 — Accessibility and primitives:** `easyA11y` (3-tier cascade, `a11y` object), `Skeleton` + `loading`, `Divider`, `Card`, `Spinner`, `useThemeMode`, `useDebounce`, `useDisclosure`.
- **Phase 3 — Interactive components:** `Pressable` and `Button` (Gesture Handler 3), `Input`, `Switch`.
- **Phase 4 — Demos, template and scaffolder:** demo convention, template app (tabs + sandbox drawer), `weaver` with `--yes` and prompts.
- **Phase 5 — Quality and release:** scaffold integration test, Expo 56 matrix and `engines` validation, release pipeline, docs, first alpha.
- **Not in v1:** `loom diff`, remote registry, `Modal`/`Sheet`, `Toast`, `Select`, `Checkbox`/`Radio`, lists, template mirror repo.

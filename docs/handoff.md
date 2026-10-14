# Handoff

Start here when picking up the project. Written at the end of the design session; update it when the state changes.

## What this is

Loomworks: an open-ended React Native UI kit (Unistyles 3) copied into projects by a CLI (`@red_dial/loom`), plus a project scaffolder (`@red_dial/create-weaver`) with an Expo Router template and a component sandbox. Full product decisions: [ADR 0003](adr/0003-product-decisions.md). Tokens: [ADR 0002](adr/0002-design-tokens.md). Expo compatibility: [ADR 0001](adr/0001-expo-56-57-compatibility.md). Plan: [roadmap](roadmap.md). Evidence behind the decisions: `docs/research/`.

## Where things are

- GitHub: `RedDial256/loomworks`, issues #1 to #9 with milestones "Phase 0" and "Phase 1" and native blocking links. Issue number = ticket number for T01 to T08 (#1 to #8); #9 is the follow-up to the T02 spike. Phase 2 (T09 to T16) is #17 to #23 and #26, milestone "Phase 2".
- Local repo: `~/Desktop/projects/pers/loomworks`, branch `main`. The `origin` remote is SSH.

## State

| Item | State |
|---|---|
| T01 to T04 | Done and merged (#10, #11); issues closed |
| T05 `loom init` + theme | Merged (#12, #13). Verified on fresh `create-expo-app` projects: SDK 57 and SDK 56 pass `tsc --noEmit` and `expo export --platform ios`; the exact `@/theme` alias resolves in tsc and Metro; theme types are inferred in `StyleSheet.create` (an unknown role fails tsc). SDK 56 launched in the iPhone 17 Pro simulator (Release): theme applied, light/dark follow the system. SDK 57 not launched (#9); Android not built |
| T06 `loom add` + API | Merged (#13). Conflict matrix covered by unit tests; flags exercised on the real app. The interactive prompt (overwrite / skip / diff) has not been tried in a real TTY. Updating the sandbox index is left to Phase 4: demos are copied when `sandbox` is set |
| T07 `Box` and `Text` | Merged (#15); the `X.types.ts` split landed with T08 (#16). `Box`: `padding` (`none`/`S`/`M`/`L`) and `surface` variants. `Text`: `variant` (presets, default `body`) and `tone` (`muted`/`disabled`, `text` when unset); headings get `accessibilityRole="header"` and `maxFontSizeMultiplier` 1.5. `loom add box text` verified on SDK 57 and 56 (tsc, iOS export) and launched on SDK 56 in both themes |
| T08 integration test | Merged (#16). `integration` CI job running `scripts/integration.sh`: fresh SDK 57 app (`create-expo-app@5.0.0`), `loom init`, `loom add box text`, `tsc --noEmit`, `expo lint` on the files loom wrote (the template itself fails `expo lint`). Runnable locally after building the CLI |
| Phase 2 (T09 to T16) | Ticketed: #17 to #23 and #26 (T16) with blocking links. T09, T10, T14, T15 and T16 have no blockers |
| Phases 3 to 5 | Outlined in the roadmap, not ticketed on purpose |

Notes:
- A fresh SDK 57 template fails `tsc --noEmit` until `expo-env.d.ts` exists (Expo writes it on `expo start`). `scripts/integration.sh` creates it.
- `pod install` from a non-interactive shell needs `LANG=en_US.UTF-8` (CocoaPods aborts otherwise).
- `packages/ui` tests run on `jest-expo` + RNTL 14 (ADR 0003). Unistyles is replaced by `packages/ui/test/unistyles-mock.ts`, which resolves styles against the light theme and applies `useVariants` (the official mock strips variants). Unistyles reserves the `default` variant key for "unset", so variant values cannot be named `default`.

## Recommended next steps

1. Phase 2: start with T09 (`easyA11y`), which unblocks T11 to T13; T10, T14 and T15 can go in parallel.
2. Pending small items: reproduce the SDK 57 iOS build error on a clean install without local patches (#9); decide whether the private `@red_dial/loom-ui` stays in the Changesets `fixed` group.

## Working conventions

- Language: English in code, folders, docs, comments and CLI messages. Keep comments concise.
- Ask before committing, pushing, creating branches or PRs, or publishing. Do not commit agent working notes (Claude Code files such as `.claude/`, `CLAUDE.md`, memory files).
- Ignore `pnpm-lock.yaml` unless a `package.json` dependency changed; then stage only the related lines.
- Never read `.env` files.
- Git identity: the personal one (set automatically by the git config include for `~/Desktop/projects/pers/`). GitHub CLI is authenticated as `RedDial256` with the SSH protocol. A commit made from another folder would use the work identity.
- Decisions are one at a time with a recommendation, and facts that can be looked up are looked up rather than asked.
- Prefer primary sources for any benchmark, and mark what could not be verified.

## Commands

- `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, `pnpm format:check`, `pnpm changeset`.
- Node 22, pnpm 10 (pinned in `packageManager`).

## Machine notes

- Xcode 26.3 (Swift 6.2). Expo SDK 57 iOS builds fail in `expo-modules-jsi` (upstream; issue #9). SDK 56 builds and launches.
- The throwaway projects from the spike lived in a temporary scratchpad and may be gone. The `dev.t02.sdk56` test app may still be installed in the iPhone 17 Pro simulator.
- Installed global skills for RN and Expo work: `expo-router`, `expo-native-ui`, `expo-dev-client`, `expo-upgrade`, `react-native-best-practices`, `vercel-react-native-skills`, `react-native-testing`, `animate-expo`. The `mattpocock-skills` plugin provides `grilling`, `tdd`, `code-review`, `diagnosing-bugs`, `research` and others; some skills named in its flow guide (`to-spec`, `to-tickets`, `implement`, `wayfinder`) were not available in the session that wrote this.

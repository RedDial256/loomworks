# Handoff

Start here when picking up the project. Written at the end of the design session; update it when the state changes.

## What this is

Loomworks: an open-ended React Native UI kit (Unistyles 3) copied into projects by a CLI (`@red_dial/loom`), plus a project scaffolder (`@red_dial/create-weaver`) with an Expo Router template and a component sandbox. Full product decisions: [ADR 0003](adr/0003-product-decisions.md). Tokens: [ADR 0002](adr/0002-design-tokens.md). Expo compatibility: [ADR 0001](adr/0001-expo-56-57-compatibility.md). Plan: [roadmap](roadmap.md). Evidence behind the decisions: `docs/research/`.

## Where things are

- GitHub: `RedDial256/loomworks`, issues #1 to #9 with milestones "Phase 0" and "Phase 1" and native blocking links. Issue number = ticket number (T01 is #1 ... T08 is #8). #9 is the follow-up to the T02 spike.
- Local repo: `~/Desktop/projects/pers/loomworks`, branch `main`. The `origin` remote is SSH.

## State

| Item | State |
|---|---|
| T01 to T04 | Done and merged (#10, #11); issues closed |
| T05 `loom init` + theme | Implemented on `feat/t05`. Verified on a fresh `create-expo-app` SDK 57 project: `tsc --noEmit` passes and `expo export --platform ios` bundles. Not launched on a device (SDK 57 iOS build blocked, #9) |
| T06 `loom add` + API | Implemented on `feat/t06` (branched from `feat/t05`). Conflict matrix covered by unit tests; flags exercised on the real app. The interactive prompt (overwrite / skip / diff) has not been tried in a real TTY. Updating the sandbox index is left to Phase 4: demos are copied when `sandbox` is set |
| T07, T08 | Not started. T07 is unblocked once T05 lands |
| Phases 2 to 5 | Outlined in the roadmap, not ticketed on purpose |

Notes from T05:
- A fresh SDK 57 template fails `tsc --noEmit` until `expo-env.d.ts` exists (Expo writes it on `expo start`). T08 must create it before typechecking.
- `packages/ui` uses Vitest for pure-TS tests (theme contrast and contract). Component tests (T07) still follow ADR 0003 (`jest-expo` + RNTL).

## Recommended next steps

1. Review and open PRs for `feat/t05` and `feat/t06` (local commits only, nothing pushed); close #5 and #6 once merged. Then T07 and T08.
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

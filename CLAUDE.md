# Loomworks

Open-ended React Native UI kit (Unistyles 3) copied into projects by `@red_dial/loom`, plus the `@red_dial/create-weaver` scaffolder. Decisions live in `docs/adr/`; plan and status live in GitHub issues and milestones.

## Documentation

- Every fact lives in one place. Link to it instead of repeating it.
- Do not write docs that the code, `package.json`, the lint config, GitHub issues or git history already answer.
- When a change makes a doc wrong, fix or delete it in the same PR.
- Docs record decisions and their reasons, not state that changes every week (ticket status, next steps, machine notes).

## Conventions

- English in code, folders, docs, comments and CLI messages. Keep comments concise.
- Ask before committing, pushing, creating branches or PRs, or publishing.
- Never read `.env` files.
- `pnpm-lock.yaml`: commit it only when a `package.json` dependency changed. On a conflict, take `main`'s version and run `pnpm install`.
- Each ticket adds its own changeset. Changesets name `@red_dial/loom`, never the private `@red_dial/loom-ui`: Changesets writes the entry only in the named package's changelog, and the `fixed` group still bumps all three.
- Feature branches do not edit `docs/roadmap.md`; update it on `main` after merging.
- Decisions one at a time, with a recommendation. Look up facts that can be looked up instead of asking.
- Benchmarks use primary sources and mark what could not be verified.

## Gotchas

- Unistyles reserves the `default` variant key for "unset", so variant values cannot be named `default`.
- `pod install` from a non-interactive shell needs `LANG=en_US.UTF-8`.
- `pnpm security:baseline` accepts the current rnsec findings; commit the baseline in the PR that needs it.

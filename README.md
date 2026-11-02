# Loomworks

Loom adds components, weaver creates projects.

An open-ended React Native UI kit (Unistyles 3) distributed shadcn-style, plus an Expo Router project scaffolder.

| Folder                   | Package                   | Description                                                    |
| ------------------------ | ------------------------- | -------------------------------------------------------------- |
| `packages/ui`            | `@red_dial/loom-ui`       | Component sources (private, embedded in the CLI at build time) |
| `packages/cli`           | `@red_dial/loom`          | `loom init` / `loom add`: copies components into your project  |
| `packages/create-weaver` | `@red_dial/create-weaver` | `npm create @red_dial/weaver`: scaffolds a new Expo Router app |
| `templates/app`          | (embedded)                | Expo 58 app template used by weaver                            |

## Development

```sh
pnpm bootstrap   # install + build the CLI (idempotent, also for git worktrees)
pnpm lint
pnpm typecheck
pnpm format
```

Versions are lockstep via [Changesets](https://github.com/changesets/changesets) in pre-release mode (`alpha`).

## License

[MIT](./LICENSE)

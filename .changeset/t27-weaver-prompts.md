---
'@red_dial/create-weaver': minor
'@red_dial/loom': patch
---

`weaver` asks for the project name, extra components and hooks, install, git and tooling with `@clack/prompts`. `--components` and `--hooks` (comma-separated) and `--[no-]install`, `--[no-]git` and `--[no-]tooling` skip their prompts; `--yes` fills the rest with the defaults, now the whole kit. Without a terminal, missing flags are an error that lists them. The loom API now exports `isInteractive`.

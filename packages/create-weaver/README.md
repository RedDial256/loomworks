# @red_dial/create-weaver

Creates an Expo Router project from the Loomworks template: the theme and the components the template uses, ESLint and Prettier with `@red_dial/rn-tooling-config`, installed dependencies and a first git commit.

```sh
npm create @red_dial/weaver
```

It asks for the project name, the components and hooks to add, and whether to install dependencies, run `git init` and set up the tooling. Each prompt has a flag, and `--yes` takes the defaults for the rest (`npm create @red_dial/weaver my-app -- --yes`); `--help` lists them.

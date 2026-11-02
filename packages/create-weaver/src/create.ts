import {
  add,
  detectPackageManager,
  execCommand,
  init,
  type PackageManager,
  type RegistrySource,
  type RunCommand,
  runCommand,
} from '@red_dial/loom';
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupTooling } from './tooling';

/** Kit items the template imports; `loom add` copies them with their dependencies. */
export const TEMPLATE_ITEMS = [
  'box',
  'button',
  'capitalize',
  'debounce',
  'input',
  'pressable',
  'text',
];

const NAME = /^[a-z][a-z0-9-]*$/;

export interface CreateOptions {
  /** Project folder; its name is the project name. */
  dir: string;
  /** Install npm dependencies (default true). */
  install?: boolean;
  /** Run `git init` and commit (default true). */
  git?: boolean;
  /** Set up ESLint and Prettier with `@red_dial/rn-tooling-config` (default true). */
  tooling?: boolean;
  /** Output of `embedTemplate` (default: the one bundled with weaver). */
  embedDir?: string;
  /** Registry for `loom init` and `loom add` (default: the one bundled with loom). */
  source?: RegistrySource;
  run?: RunCommand;
}

export interface CreateResult {
  name: string;
  dir: string;
  packageManager: PackageManager;
  /** Kit items copied by `loom add`, dependencies included. */
  items: string[];
  /** Package specs left to install with `install: false`. */
  packages: string[];
  /** Manual steps left to the user. */
  notes: string[];
}

/** Creates a project from the template: copy, name, tooling, install, `loom init`, `loom add`, git. */
export const create = async ({
  dir,
  install = true,
  git = true,
  tooling = true,
  embedDir = fileURLToPath(new URL('./', import.meta.url)),
  source,
  run = runCommand,
}: CreateOptions): Promise<CreateResult> => {
  const target = resolve(dir);
  const name = basename(target);
  if (!NAME.test(name)) {
    throw new Error(
      `Invalid project name "${name}": use lowercase letters, digits and dashes, starting with a letter.`
    );
  }
  await ensureEmpty(target);

  await cp(join(embedDir, 'template'), target, { recursive: true });
  await rename(join(target, 'gitignore'), join(target, '.gitignore'));
  await setName(target, name);
  if (tooling) {
    const versions = JSON.parse(
      await readFile(join(embedDir, 'tooling.json'), 'utf8')
    ) as Record<string, string>;
    await setupTooling(target, versions);
  }

  const packageManager = await detectPackageManager(target);
  if (install) await run(packageManager, ['install'], target);

  const loom = { cwd: target, install, run, source };
  const initResult = await init(loom);
  const addResult = await add({ ...loom, items: TEMPLATE_ITEMS });

  // Settles the JSON files edited above to the project's Prettier config.
  if (tooling && install) {
    const prettier = ['prettier', '--write', '.', '--log-level', 'warn'];
    await run(...execCommand(packageManager, prettier), target);
  }

  const notes: string[] = [];
  if (git) {
    await run('git', ['init', '--quiet'], target);
    await run('git', ['add', '--all'], target);
    await run(
      'git',
      ['commit', '--quiet', '--message', 'Initial commit from weaver'],
      target
    ).catch(() => {
      notes.push(
        'Git could not commit (is user.name set?); the files are staged.'
      );
    });
  }

  return {
    name,
    dir: target,
    packageManager,
    items: addResult.items,
    packages: install ? [] : [...initResult.packages, ...addResult.packages],
    notes,
  };
};

const ensureEmpty = async (dir: string) => {
  const entries = await readdir(dir).catch(() => undefined);
  if (entries?.length) {
    throw new Error(`${dir} already exists and is not empty.`);
  }
  await mkdir(dir, { recursive: true });
};

/** The package name, and the app name, slug and URL scheme in app.json. */
const setName = async (dir: string, name: string) => {
  await editJson(join(dir, 'package.json'), (pkg) => ({ ...pkg, name }));
  await editJson(join(dir, 'app.json'), (app) => ({
    ...app,
    expo: { ...(app.expo as object), name, slug: name, scheme: name },
  }));
};

const editJson = async (
  file: string,
  edit: (data: Record<string, unknown>) => Record<string, unknown>
) => {
  const data = JSON.parse(await readFile(file, 'utf8')) as Record<
    string,
    unknown
  >;
  await writeFile(file, `${JSON.stringify(edit(data), null, 2)}\n`);
};

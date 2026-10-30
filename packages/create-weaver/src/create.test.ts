import {
  createFsSource,
  embedRegistry,
  type RegistrySource,
  type RunCommand,
} from '@red_dial/loom';
import {
  access,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { create, type CreateOptions } from './create';
import { embedTemplate } from './template/embed';

const repo = fileURLToPath(new URL('../../../', import.meta.url));

let built: string;
let embedDir: string;
let source: RegistrySource;
let parent: string;

beforeAll(async () => {
  built = await mkdtemp(join(tmpdir(), 'weaver-built-'));
  embedDir = join(built, 'weaver');
  await embedTemplate({
    templateRoot: join(repo, 'templates/app'),
    toolingPackageJson: join(repo, 'package.json'),
    outDir: embedDir,
  });
  await embedRegistry({
    uiRoot: join(repo, 'packages/ui'),
    outDir: join(built, 'registry'),
  });
  source = createFsSource(join(built, 'registry'));
});
afterAll(() => rm(built, { recursive: true, force: true }));
beforeEach(async () => {
  parent = await mkdtemp(join(tmpdir(), 'weaver-create-'));
  vi.stubEnv('npm_config_user_agent', 'npm/10.9.4 node/v22.22.0 linux x64');
});
afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(parent, { recursive: true, force: true });
});

const runCreate = async (options: Partial<CreateOptions> = {}) => {
  const calls: string[] = [];
  const run: RunCommand = async (command, args) => {
    calls.push([command, ...args].join(' '));
  };
  const result = await create({
    dir: join(parent, 'my-app'),
    embedDir,
    source,
    run,
    ...options,
  });
  return { result, calls };
};

const read = (path: string) => readFile(join(parent, 'my-app', path), 'utf8');
const readJson = async (path: string) => JSON.parse(await read(path));
const exists = (path: string) =>
  access(join(parent, 'my-app', path)).then(
    () => true,
    () => false
  );

describe('create', () => {
  it('runs the full setup by default', async () => {
    const { result, calls } = await runCreate();

    expect(result).toMatchObject({
      name: 'my-app',
      packageManager: 'npm',
      packages: [],
    });
    expect(calls).toEqual([
      'npm install',
      'npx prettier --write . --log-level warn',
      'git init --quiet',
      'git add --all',
      'git commit --quiet --message Initial commit from weaver',
    ]);

    const pkg = await readJson('package.json');
    expect(pkg.name).toBe('my-app');
    expect(pkg.scripts).toMatchObject({ lint: 'eslint .' });
    expect(pkg.devDependencies['@red_dial/rn-tooling-config']).toBeDefined();
    expect((await readJson('app.json')).expo).toMatchObject({
      name: 'my-app',
      slug: 'my-app',
      scheme: 'my-app',
    });
    expect(await exists('.gitignore')).toBe(true);
    expect(await exists('eslint.config.mjs')).toBe(true);
    expect(await exists('prettier.config.mjs')).toBe(true);

    // loom init and loom add ran on the copy.
    expect(await read('babel.config.js')).toContain(
      "['react-native-unistyles/plugin', { root: 'src' }]"
    );
    expect(await read('index.ts')).toBe(
      "import 'expo-router/entry';\n\nimport './src/theme/unistyles';\n"
    );
    const loom = await readJson('loom.json');
    expect(Object.keys(loom.items)).toEqual(['theme', ...result.items]);
  });

  it('copies every kit file the template imports', async () => {
    await runCreate({ install: false, git: false });
    const root = join(parent, 'my-app');
    const missing: string[] = [];
    for (const file of await listFiles(join(root, 'src'))) {
      const text = await readFile(file, 'utf8');
      for (const [, path] of text.matchAll(/from '@\/([^']+)'/g)) {
        if (!(await resolves(join(root, 'src', path as string)))) {
          missing.push(`${relative(root, file)}: @/${path}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('skips install, git and tooling', async () => {
    const { result, calls } = await runCreate({
      install: false,
      git: false,
      tooling: false,
    });

    expect(calls).toEqual([]);
    // The template declares every package the kit needs.
    expect(result.packages).toEqual([]);
    expect(await exists('eslint.config.mjs')).toBe(false);
    expect((await readJson('package.json')).devDependencies.eslint).toBe(
      undefined
    );
    expect(await exists('loom.json')).toBe(true);
  });

  it('installs with the package manager that launched it', async () => {
    vi.stubEnv('npm_config_user_agent', 'pnpm/10.34.4 npm/? node/v22.22.0');
    const { result, calls } = await runCreate({ git: false });

    expect(result.packageManager).toBe('pnpm');
    expect(calls).toEqual([
      'pnpm install',
      'pnpm exec prettier --write . --log-level warn',
    ]);
  });

  it('leaves the files staged when git cannot commit', async () => {
    const run: RunCommand = async (_command, args) => {
      if (args[0] === 'commit') throw new Error('no identity');
    };
    const { result } = await runCreate({ install: false, run });
    expect(result.notes).toEqual([expect.stringContaining('staged')]);
  });

  it('rejects an invalid name', async () => {
    await expect(runCreate({ dir: join(parent, 'My App') })).rejects.toThrow(
      'Invalid project name "My App"'
    );
  });

  it('refuses a folder that is not empty', async () => {
    await mkdir(join(parent, 'my-app'));
    await writeFile(join(parent, 'my-app', 'notes.txt'), '');
    await expect(runCreate()).rejects.toThrow('is not empty');
  });
});

const listFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
};

const resolves = async (path: string) => {
  for (const candidate of [
    `${path}.ts`,
    `${path}.tsx`,
    join(path, 'index.ts'),
  ]) {
    if (
      await access(candidate).then(
        () => true,
        () => false
      )
    ) {
      return true;
    }
  }
  return false;
};

import { rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ConflictError } from '../project/files';
import { embedRegistry } from '../registry/embed';
import { createFsSource, type RegistrySource } from '../registry/source';
import {
  expoProject,
  fakeRun,
  read,
  readJsonFile,
  tempDir,
  writeTree,
} from '../test/fixtures';
import { init } from './init';

const realUi = fileURLToPath(new URL('../../../ui/', import.meta.url));

let registry: string;
let source: RegistrySource;
let cwd: string;

beforeAll(async () => {
  registry = await tempDir('loom-registry-');
  await embedRegistry({ uiRoot: realUi, outDir: registry });
  source = createFsSource(registry);
  return () => rm(registry, { recursive: true, force: true });
});
beforeEach(async () => {
  cwd = await tempDir('loom-init-');
});
afterEach(() => rm(cwd, { recursive: true, force: true }));

const runInit = (options: Partial<Parameters<typeof init>[0]> = {}) => {
  const fake = fakeRun();
  return init({
    cwd,
    source,
    run: fake.run,
    version: '1.2.3',
    ...options,
  }).then((result) => ({ result, calls: fake.calls }));
};

describe('init', () => {
  it('sets up a fresh Expo Router project', async () => {
    await writeTree(cwd, expoProject());
    const { result, calls } = await runInit();

    expect(result.files.written).toContain('src/theme/light.ts');
    expect(result.files.written).toContain('src/theme/unistyles.ts');
    expect(await read(cwd, 'src/theme/light.ts')).toBe(
      await source.getFile('theme/light.ts')
    );

    const tsconfig = await read(cwd, 'tsconfig.json');
    expect(tsconfig).toContain('// Expo base config');
    expect(tsconfig).toMatch(/"@\/theme": \[\s*"\.\/src\/theme"\s*\]/);

    expect(await read(cwd, 'index.ts')).toBe(
      "import 'expo-router/entry';\nimport './src/theme/unistyles';\n"
    );
    expect(await read(cwd, 'babel.config.js')).toContain(
      "['react-native-unistyles/plugin', { root: 'src' }]"
    );

    const pkg = await readJsonFile(cwd, 'package.json');
    expect(pkg.main).toBe('index.ts');
    expect(pkg.expo.install.exclude).toEqual([
      'react-native-gesture-handler',
      '@react-native-async-storage/async-storage',
    ]);
    expect((await readJsonFile(cwd, 'app.json')).expo.plugins).toEqual([
      'expo-router',
      '@react-native-async-storage/expo-with-async-storage',
    ]);
    expect(await readJsonFile(cwd, 'loom.json')).toEqual({
      paths: { ui: 'src', theme: 'src/theme' },
      items: { theme: { version: '1.2.3' } },
    });

    // GH 2.x from the template is below the required range, so it is upgraded.
    expect(calls).toEqual([
      'npm install react-native-unistyles@^3.5.2 react-native-nitro-modules@^0.37.1 react-native-gesture-handler@^3.3.0 @react-native-async-storage/async-storage@^3.1.1 @react-native-async-storage/expo-with-async-storage@^1.0.0',
      'npx expo install babel-preset-expo',
    ]);
  });

  it('is idempotent', async () => {
    await writeTree(cwd, expoProject());
    await runInit();
    const before = await read(cwd, 'tsconfig.json');

    const { result } = await runInit({ install: false });
    expect(result.files.written).toEqual([]);
    expect(result.files.unchanged).toHaveLength(10);
    expect(result.configured).toEqual([]);
    expect(await read(cwd, 'tsconfig.json')).toBe(before);
    expect(await read(cwd, 'index.ts')).toBe(
      "import 'expo-router/entry';\nimport './src/theme/unistyles';\n"
    );
  });

  it('skips packages that already satisfy the required ranges', async () => {
    await writeTree(cwd, {
      ...expoProject({
        'babel-preset-expo': '~57.0.0',
        'react-native-unistyles': '3.5.2',
        'react-native-nitro-modules': '0.37.1',
        'react-native-gesture-handler': '^3.3.0',
        '@react-native-async-storage/async-storage': '^3.1.1',
        '@react-native-async-storage/expo-with-async-storage': '^1.0.0',
      }),
      'pnpm-lock.yaml': '',
    });
    const { result, calls } = await runInit();
    expect(result.packages).toEqual([]);
    expect(calls).toEqual([]);
  });

  it('uses the folders from an existing loom.json', async () => {
    await writeTree(cwd, {
      ...expoProject(),
      'loom.json': JSON.stringify({
        paths: { ui: 'app-src/ui', theme: 'app-src/design' },
      }),
    });
    await runInit({ install: false });

    expect(await read(cwd, 'app-src/design/dark.ts')).toBeTruthy();
    expect(await read(cwd, 'index.ts')).toContain(
      "import './app-src/design/unistyles';"
    );
    expect(await read(cwd, 'babel.config.js')).toContain("root: 'app-src'");
  });

  it('keeps the router entry first when taking over an existing index.ts', async () => {
    await writeTree(cwd, {
      ...expoProject(),
      'index.ts': "export * from './lib';\n",
    });
    await runInit({ install: false });

    expect(await read(cwd, 'index.ts')).toBe(
      "import 'expo-router/entry';\nexport * from './lib';\nimport './src/theme/unistyles';\n"
    );
    expect((await readJsonFile(cwd, 'package.json')).main).toBe('index.ts');
  });

  it('points main at an index.ts that already imports the setup', async () => {
    const entry =
      "import 'expo-router/entry';\nimport './src/theme/unistyles';\n";
    await writeTree(cwd, { ...expoProject(), 'index.ts': entry });
    const { result } = await runInit({ install: false });

    expect(await read(cwd, 'index.ts')).toBe(entry);
    expect((await readJsonFile(cwd, 'package.json')).main).toBe('index.ts');
    expect(result.configured).toContain('entry file');
  });

  it('appends the setup import to a custom entry file', async () => {
    const project = expoProject();
    const pkg = JSON.parse(project['package.json']);
    await writeTree(cwd, {
      ...project,
      'package.json': JSON.stringify({ ...pkg, main: 'src/entry.ts' }),
      'src/entry.ts': "import 'expo-router/entry';\n",
    });
    await runInit({ install: false });
    expect(await read(cwd, 'src/entry.ts')).toBe(
      "import 'expo-router/entry';\nimport './theme/unistyles';\n"
    );
  });

  it('leaves an existing Babel config to the user', async () => {
    const babel = "module.exports = { presets: ['babel-preset-expo'] };\n";
    await writeTree(cwd, { ...expoProject(), 'babel.config.js': babel });
    const { result } = await runInit({ install: false });

    expect(await read(cwd, 'babel.config.js')).toBe(babel);
    expect(result.notes[0]).toMatch(/react-native-unistyles\/plugin/);
  });

  it('fails on a changed theme file in non-interactive mode, before writing', async () => {
    await writeTree(cwd, expoProject());
    await runInit();
    await writeTree(cwd, {
      'src/theme/light.ts': 'mine',
      'src/theme/dark.ts': 'mine',
    });
    await rm(join(cwd, 'src/theme/palette.ts'));

    const error = await runInit({ install: false }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictError);
    expect((error as ConflictError).files).toEqual([
      'src/theme/dark.ts',
      'src/theme/light.ts',
    ]);
    await expect(read(cwd, 'src/theme/palette.ts')).rejects.toThrow();

    const { result } = await runInit({ install: false, skipExisting: true });
    expect(result.files.skipped).toEqual([
      'src/theme/dark.ts',
      'src/theme/light.ts',
    ]);
    expect(result.files.written).toEqual(['src/theme/palette.ts']);
    expect(await read(cwd, 'src/theme/light.ts')).toBe('mine');
  });

  it('rejects projects without a supported Expo version', async () => {
    await writeTree(cwd, { 'package.json': '{}' });
    await expect(runInit()).rejects.toThrow(/Expo projects only/);

    await writeTree(cwd, expoProject({ expo: '~55.0.0' }));
    await expect(runInit()).rejects.toThrow(/Expo 55\.0\.0 is not supported/);
  });
});

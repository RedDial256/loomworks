import { rm } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type Conflict, ConflictError } from '../project/files';
import { parseManifest } from '../registry/schema';
import { createFsSource, type RegistrySource } from '../registry/source';
import {
  fakeRun,
  read,
  readJsonFile,
  tempDir,
  writeTree,
} from '../test/fixtures';

import { add, resolveItems } from './add';

const manifest = {
  version: 1,
  minimums: { expo: '>=56.0.23 <58' },
  items: {
    theme: { kind: 'theme', files: ['theme/index.ts'] },
    cn: { kind: 'util', files: ['utils/cn.ts'] },
    box: {
      kind: 'component',
      files: ['components/box/Box.tsx'],
      demo: 'components/box/Box.demo.tsx',
      dependencies: ['cn'],
      packages: { 'react-native-unistyles': '^3.5.2' },
    },
    text: {
      kind: 'component',
      files: ['components/text/Text.tsx'],
      dependencies: ['box', 'cn'],
      packages: { 'react-native-unistyles': '^3.5.2', extra: '^1.0.0' },
    },
    motion: {
      kind: 'hook',
      files: ['hooks/motion/useMotion.ts'],
      sdkPackages: ['react-native-reanimated', 'react-native-worklets'],
    },
  },
};

const registryFiles = {
  'theme/index.ts': 'export const theme = 1;\n',
  'utils/cn.ts': 'export const cn = 1;\n',
  'components/box/Box.tsx': 'export const Box = 1;\n',
  'components/box/Box.demo.tsx': 'export const BoxDemo = 1;\n',
  'components/text/Text.tsx': 'export const Text = 1;\n',
  'hooks/motion/useMotion.ts': 'export const useMotion = 1;\n',
};

const config = {
  paths: { ui: 'src', theme: 'src/theme' },
  items: { theme: { version: '1.0.0' } },
};

let registry: string;
let source: RegistrySource;
let cwd: string;

beforeEach(async () => {
  registry = await tempDir('loom-registry-');
  cwd = await tempDir('loom-add-');
  await writeTree(registry, {
    'manifest.json': JSON.stringify(manifest),
    ...Object.fromEntries(
      Object.entries(registryFiles).map(([path, content]) => [
        `files/${path}`,
        content,
      ])
    ),
  });
  source = createFsSource(registry);
  await writeTree(cwd, {
    'package-lock.json': '{}',
    'loom.json': JSON.stringify(config),
    'package.json': JSON.stringify({
      dependencies: { 'react-native-unistyles': '^3.5.2' },
    }),
  });
});
afterEach(async () => {
  await rm(registry, { recursive: true, force: true });
  await rm(cwd, { recursive: true, force: true });
});

const runAdd = (
  items: string[],
  options: Partial<Parameters<typeof add>[0]> = {}
) => {
  const fake = fakeRun();
  return add({
    cwd,
    items,
    source,
    run: fake.run,
    version: '2.0.0',
    ...options,
  }).then((result) => ({ result, calls: fake.calls }));
};

describe('resolveItems', () => {
  const parsed = parseManifest(manifest);

  it('adds dependencies first, once', () => {
    expect(resolveItems(parsed, ['text'])).toEqual(['cn', 'box', 'text']);
    expect(resolveItems(parsed, ['box', 'text', 'box'])).toEqual([
      'cn',
      'box',
      'text',
    ]);
  });

  it('rejects unknown items and lists the available ones', () => {
    expect(() => resolveItems(parsed, ['box', 'ghost'])).toThrow(
      'Unknown item(s): ghost. Available: box, cn, motion, text, theme.'
    );
  });
});

describe('add', () => {
  it('copies items with their dependencies and records them', async () => {
    const { result, calls } = await runAdd(['text']);

    expect(result.items).toEqual(['cn', 'box', 'text']);
    expect(result.files.written).toEqual([
      'src/utils/cn.ts',
      'src/components/box/Box.tsx',
      'src/components/text/Text.tsx',
    ]);
    expect(await read(cwd, 'src/components/box/Box.tsx')).toBe(
      registryFiles['components/box/Box.tsx']
    );
    expect((await readJsonFile(cwd, 'loom.json')).items).toEqual({
      theme: { version: '1.0.0' },
      cn: { version: '2.0.0' },
      box: { version: '2.0.0' },
      text: { version: '2.0.0' },
    });
    // Only packages the project lacks are installed.
    expect(result.packages).toEqual(['extra@^1.0.0']);
    expect(calls).toEqual(['npm install extra@^1.0.0']);
  });

  it('copies demos only when a sandbox is set', async () => {
    await runAdd(['box']);
    await expect(
      read(cwd, 'src/components/box/Box.demo.tsx')
    ).rejects.toThrow();

    await writeTree(cwd, {
      'loom.json': JSON.stringify({ ...config, sandbox: 'src/app/sandbox' }),
    });
    const { result } = await runAdd(['box']);
    expect(result.files.written).toEqual(['src/components/box/Box.demo.tsx']);
  });

  it('installs missing SDK-pinned packages with expo install', async () => {
    await writeTree(cwd, {
      'package.json': JSON.stringify({
        dependencies: { 'react-native-reanimated': '~4.5.1' },
      }),
    });
    const { result, calls } = await runAdd(['motion']);
    expect(result.packages).toEqual(['react-native-worklets']);
    expect(calls).toEqual(['npx expo install react-native-worklets']);

    const { calls: both } = await runAdd(['motion', 'text']);
    expect(both).toEqual([
      'npm install react-native-unistyles@^3.5.2 extra@^1.0.0',
      'npx expo install react-native-worklets',
    ]);
  });

  it('does not install with install: false', async () => {
    const { result, calls } = await runAdd(['text'], { install: false });
    expect(result.packages).toEqual(['extra@^1.0.0']);
    expect(calls).toEqual([]);
  });

  it('requires loom.json', async () => {
    await rm(`${cwd}/loom.json`);
    await expect(runAdd(['box'])).rejects.toThrow(/Run `loom init` first/);
  });

  it('requires at least one item', async () => {
    await expect(runAdd([])).rejects.toThrow(/at least one item/);
  });
});

describe('add conflict matrix', () => {
  const target = 'src/components/box/Box.tsx';
  const incoming = registryFiles['components/box/Box.tsx'];
  const mine = 'export const Box = "mine";\n';

  type Mode =
    | 'prompt: overwrite'
    | 'prompt: skip'
    | 'overwrite'
    | 'skip'
    | 'non-interactive';
  const modes: Record<Mode, () => Partial<Parameters<typeof add>[0]>> = {
    'prompt: overwrite': () => ({
      resolveConflict: vi.fn(async () => 'overwrite' as const),
    }),
    'prompt: skip': () => ({
      resolveConflict: vi.fn(async () => 'skip' as const),
    }),
    overwrite: () => ({ overwrite: true }),
    skip: () => ({ skipExisting: true }),
    'non-interactive': () => ({}),
  };
  const allModes = Object.keys(modes) as Mode[];

  it.each(allModes)('%s: writes a missing file', async (mode) => {
    const options = modes[mode]();
    const { result } = await runAdd(['box'], options);
    expect(result.files.written).toContain(target);
    if (options.resolveConflict) {
      expect(options.resolveConflict).not.toHaveBeenCalled();
    }
  });

  it.each(allModes)('%s: leaves an identical file alone', async (mode) => {
    await writeTree(cwd, { [target]: incoming });
    const options = modes[mode]();
    const { result } = await runAdd(['box'], options);
    expect(result.files.unchanged).toEqual([target]);
    expect(result.files.written).toEqual(['src/utils/cn.ts']);
    if (options.resolveConflict) {
      expect(options.resolveConflict).not.toHaveBeenCalled();
    }
  });

  it.each([
    ['prompt: overwrite', incoming, 'written'],
    ['prompt: skip', mine, 'skipped'],
    ['overwrite', incoming, 'written'],
    ['skip', mine, 'skipped'],
  ] as const)('%s: resolves a changed file', async (mode, content, bucket) => {
    await writeTree(cwd, { [target]: mine });
    const options = modes[mode]();
    const { result } = await runAdd(['box'], options);

    expect(await read(cwd, target)).toBe(content);
    expect(result.files[bucket]).toContain(target);
    if (options.resolveConflict) {
      expect(options.resolveConflict).toHaveBeenCalledWith<[Conflict]>({
        target,
        current: mine,
        incoming,
      });
    }
  });

  it('non-interactive: fails on a changed file before writing anything', async () => {
    await writeTree(cwd, { [target]: mine });
    const error = await runAdd(['box']).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ConflictError);
    expect((error as Error).message).toContain(target);
    expect((error as Error).message).toMatch(/--overwrite.*--skip-existing/);
    expect(await read(cwd, target)).toBe(mine);
    await expect(read(cwd, 'src/utils/cn.ts')).rejects.toThrow();
    expect((await readJsonFile(cwd, 'loom.json')).items).not.toHaveProperty(
      'box'
    );
  });

  it('flags win over the prompt', async () => {
    await writeTree(cwd, { [target]: mine });
    const resolveConflict = vi.fn(async () => 'skip' as const);
    await runAdd(['box'], { overwrite: true, resolveConflict });
    expect(resolveConflict).not.toHaveBeenCalled();
    expect(await read(cwd, target)).toBe(incoming);
  });

  it('rejects --overwrite with --skip-existing', async () => {
    await expect(
      runAdd(['box'], { overwrite: true, skipExisting: true })
    ).rejects.toThrow(/either --overwrite or --skip-existing/);
  });
});

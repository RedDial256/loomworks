import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { embedRegistry } from './embed';
import { createFsSource } from './source';

const realUi = fileURLToPath(new URL('../../../ui/', import.meta.url));

let root: string;
beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'loom-embed-'));
});
afterEach(() => rm(root, { recursive: true, force: true }));

const writeTree = async (base: string, files: Record<string, string>) => {
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(base, path)), { recursive: true });
    await writeFile(join(base, path), content);
  }
};

const listFiles = async (dir: string, prefix = ''): Promise<string[]> => {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = `${prefix}${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...(await listFiles(join(dir, entry.name), `${rel}/`)));
    } else out.push(rel);
  }
  return out.sort();
};

const manifest = {
  version: 1,
  minimums: { expo: '>=56.0.23 <58' },
  items: {
    box: {
      kind: 'component',
      files: ['components/box/Box.tsx'],
      demo: 'components/box/Box.demo.tsx',
    },
  },
};

describe('embedRegistry', () => {
  it('copies component sources and demos, but not tests or unlisted files', async () => {
    const ui = join(root, 'ui');
    const out = join(root, 'out');
    await writeTree(ui, {
      'manifest.json': JSON.stringify(manifest),
      'src/components/box/Box.tsx': 'export const Box = 1;',
      'src/components/box/Box.demo.tsx': 'export const demo = 1;',
      'src/components/box/Box.test.tsx': 'it("works")',
      'src/components/unlisted/Other.tsx': 'export {};',
    });

    await embedRegistry({ uiRoot: ui, outDir: out });

    expect(await listFiles(out)).toEqual([
      'files/components/box/Box.demo.tsx',
      'files/components/box/Box.tsx',
      'manifest.json',
    ]);

    const source = createFsSource(out);
    expect((await source.getManifest()).items.box?.demo).toBe(
      'components/box/Box.demo.tsx'
    );
    expect(await source.getFile('components/box/Box.tsx')).toBe(
      'export const Box = 1;'
    );
    await expect(source.getFile('components/box/Box.test.tsx')).rejects.toThrow(
      /not part of/
    );
  });

  it('fails on a missing file without touching the output folder', async () => {
    const ui = join(root, 'ui');
    const out = join(root, 'out');
    await writeTree(ui, { 'manifest.json': JSON.stringify(manifest) });
    await writeTree(out, { 'keep.txt': 'previous build' });

    await expect(embedRegistry({ uiRoot: ui, outDir: out })).rejects.toThrow(
      /missing file/
    );
    expect(await readFile(join(out, 'keep.txt'), 'utf8')).toBe(
      'previous build'
    );
  });

  it('fails on an invalid manifest', async () => {
    const ui = join(root, 'ui');
    await writeTree(ui, { 'manifest.json': JSON.stringify({ version: 2 }) });

    await expect(
      embedRegistry({ uiRoot: ui, outDir: join(root, 'out') })
    ).rejects.toThrow(/Invalid manifest/);
  });

  it('embeds the real @red_dial/loom-ui package', async () => {
    const out = join(root, 'out');
    await embedRegistry({ uiRoot: realUi, outDir: out });

    const source = createFsSource(out);
    await expect(source.getManifest()).resolves.toMatchObject({ version: 1 });
  });
});

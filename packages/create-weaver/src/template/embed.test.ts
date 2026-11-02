import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { TOOLING_PACKAGES } from '../tooling';

import { embedTemplate } from './embed';

const templateRoot = fileURLToPath(
  new URL('../../../../templates/app/', import.meta.url)
);
const rootPackageJson = fileURLToPath(
  new URL('../../../../package.json', import.meta.url)
);

let outDir: string;
beforeEach(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'weaver-embed-'));
});
afterEach(() => rm(outDir, { recursive: true, force: true }));

const exists = (path: string) =>
  access(join(outDir, path)).then(
    () => true,
    () => false
  );
const read = (path: string) => readFile(join(outDir, path), 'utf8');

describe('embedTemplate', () => {
  it('embeds the template as a standalone project', async () => {
    await embedTemplate({
      templateRoot,
      toolingPackageJson: rootPackageJson,
      outDir,
    });

    expect(await exists('template/src/app/_layout.tsx')).toBe(true);
    expect(await exists('template/gitignore')).toBe(true);
    for (const path of [
      'node_modules',
      '.gitignore',
      'babel.config.js',
      'metro.config.js',
    ]) {
      expect(await exists(`template/${path}`)).toBe(false);
    }

    expect(await read('template/index.ts')).toBe(
      "import 'expo-router/entry';\n\nimport './src/theme/unistyles';\n"
    );
    const tsconfig = JSON.parse(await read('template/tsconfig.json'));
    expect(tsconfig.compilerOptions.paths).toEqual({ '@/*': ['./src/*'] });

    const tooling = JSON.parse(await read('tooling.json'));
    expect(Object.keys(tooling)).toEqual(TOOLING_PACKAGES);
    expect(tooling['@red_dial/rn-tooling-config']).toMatch(/^\d/);
  });

  it('fails when a tooling package has no version', async () => {
    const pkg = join(outDir, 'package.json');
    await writeFile(pkg, JSON.stringify({ devDependencies: { eslint: '9' } }));
    await expect(
      embedTemplate({
        templateRoot,
        toolingPackageJson: pkg,
        outDir: join(outDir, 'out'),
      })
    ).rejects.toThrow('No version for @red_dial/rn-tooling-config');
  });
});

import { cp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { TOOLING_PACKAGES } from '../tooling';

interface EmbedOptions {
  /** The template app (`templates/app`). */
  templateRoot: string;
  /** package.json that pins the tooling packages in its devDependencies. */
  toolingPackageJson: string;
  /** Output folder; receives `template/` and `tooling.json`. */
  outDir: string;
}

// Local or generated: never part of the template.
const SKIPPED = new Set([
  'node_modules',
  '.expo',
  'dist',
  'ios',
  'android',
  'expo-env.d.ts',
]);
// Monorepo-only setup: `loom init` writes the standalone Babel config, and Expo's default Metro config is enough.
const MONOREPO_FILES = ['babel.config.js', 'metro.config.js'];
// The alias reaches packages/ui in the monorepo; the copied setup is the path `loom init` looks for in the entry.
const MONOREPO_ENTRY_IMPORT = "import '@/theme/unistyles';";
const ENTRY_IMPORT = "import './src/theme/unistyles';";

/** Copies the template app into `outDir/template` as a standalone project, plus the tooling versions. */
export const embedTemplate = async ({
  templateRoot,
  toolingPackageJson,
  outDir,
}: EmbedOptions): Promise<void> => {
  const tooling = toolingVersions(
    JSON.parse(await readFile(toolingPackageJson, 'utf8')) as {
      devDependencies?: Record<string, string>;
    }
  );
  const target = join(outDir, 'template');

  await rm(target, { recursive: true, force: true });
  await cp(templateRoot, target, {
    recursive: true,
    filter: (source) => !SKIPPED.has(basename(source)),
  });
  for (const file of MONOREPO_FILES) await rm(join(target, file));

  const entry = join(target, 'index.ts');
  const text = await readFile(entry, 'utf8');
  if (!text.includes(MONOREPO_ENTRY_IMPORT)) {
    throw new Error(`index.ts no longer has ${MONOREPO_ENTRY_IMPORT}`);
  }
  await writeFile(entry, text.replace(MONOREPO_ENTRY_IMPORT, ENTRY_IMPORT));

  // Drops the packages/ui fallbacks; `loom init` adds `@/theme`.
  const tsconfigFile = join(target, 'tsconfig.json');
  const tsconfig = JSON.parse(await readFile(tsconfigFile, 'utf8')) as {
    compilerOptions: { paths?: Record<string, string[]> };
  };
  tsconfig.compilerOptions.paths = { '@/*': ['./src/*'] };
  await writeFile(tsconfigFile, `${JSON.stringify(tsconfig, null, 2)}\n`);

  // npm leaves `.gitignore` out of published packages.
  await rename(join(target, '.gitignore'), join(target, 'gitignore'));

  await writeFile(
    join(outDir, 'tooling.json'),
    `${JSON.stringify(tooling, null, 2)}\n`
  );
};

const toolingVersions = (pkg: { devDependencies?: Record<string, string> }) => {
  return Object.fromEntries(
    TOOLING_PACKAGES.map((name) => {
      const range = pkg.devDependencies?.[name];
      if (!range) throw new Error(`No version for ${name} in devDependencies.`);
      return [name, range];
    })
  );
};

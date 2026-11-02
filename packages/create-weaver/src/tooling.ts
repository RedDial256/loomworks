import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** `@red_dial/rn-tooling-config` and the peers its ESLint and Prettier configs load. */
export const TOOLING_PACKAGES = [
  '@red_dial/rn-tooling-config',
  'eslint',
  'eslint-plugin-perfectionist',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-native',
  'prettier',
  'typescript-eslint',
];

const ESLINT_CONFIG = `import base from '@red_dial/rn-tooling-config/eslint';
import expo from '@red_dial/rn-tooling-config/eslint/expo';
import typescript from '@red_dial/rn-tooling-config/eslint/typescript';

export default [
  { ignores: ['.expo/', 'dist/', 'ios/', 'android/'] },
  ...base,
  ...typescript,
  ...expo,
];
`;

const PRETTIER_CONFIG = `export { default } from '@red_dial/rn-tooling-config/prettier';
`;

interface ProjectPackageJson {
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Sets up ESLint and Prettier with `@red_dial/rn-tooling-config`: config files, scripts and dev dependencies. */
export const setupTooling = async (
  dir: string,
  versions: Record<string, string>
): Promise<void> => {
  const file = join(dir, 'package.json');
  const pkg = JSON.parse(await readFile(file, 'utf8')) as ProjectPackageJson;
  pkg.scripts = {
    ...pkg.scripts,
    lint: 'eslint .',
    format: 'prettier --write .',
  };
  pkg.devDependencies = sortKeys({ ...pkg.devDependencies, ...versions });
  await writeFile(file, `${JSON.stringify(pkg, null, 2)}\n`);

  await writeFile(join(dir, 'eslint.config.mjs'), ESLINT_CONFIG);
  await writeFile(join(dir, 'prettier.config.mjs'), PRETTIER_CONFIG);
};

const sortKeys = (record: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(record).sort(([a], [b]) => a.localeCompare(b))
  );

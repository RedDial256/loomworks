import { access, readFile, writeFile } from 'node:fs/promises';
import { join, posix } from 'node:path';

import semver from 'semver';

import {
  babelRoot,
  defaultConfig,
  type LoomConfig,
  readConfig,
  writeConfig,
} from '../project/config';
import {
  type ConflictOptions,
  writeFiles,
  type WriteReport,
} from '../project/files';
import { editJsonFile, readJson } from '../project/json';
import {
  addCommand,
  declaredRange,
  detectPackageManager,
  expoInstallCommand,
  missingPackages,
  type PackageJson,
  type RunCommand,
  runCommand,
} from '../project/packages';
import { createEmbeddedSource, type RegistrySource } from '../registry/source';
import { LOOM_VERSION } from '../version';
import { planItems } from './add';

export const THEME_ITEM = 'theme';
const UNISTYLES_PLUGIN = 'react-native-unistyles/plugin';
const ASYNC_STORAGE_PLUGIN =
  '@react-native-async-storage/expo-with-async-storage';
// Outside Expo's validated set (ADR 0001); excluded so `expo install --check` and `expo-doctor` stop flagging them.
const INSTALL_EXCLUDE = [
  'react-native-gesture-handler',
  '@react-native-async-storage/async-storage',
];

export interface InitOptions extends ConflictOptions {
  cwd: string;
  source?: RegistrySource;
  /** Install npm dependencies (default true). */
  install?: boolean;
  run?: RunCommand;
  /** Folder overrides for a new `loom.json`; ignored when one exists. */
  paths?: Partial<LoomConfig['paths']>;
  version?: string;
}

export interface InitResult {
  config: LoomConfig;
  files: WriteReport;
  /** Project files edited or created besides the theme. */
  configured: string[];
  /** Package specs installed, or that would be installed with `install: false`. */
  packages: string[];
  /** Manual steps left to the user. */
  notes: string[];
}

/** Sets up loom in an Expo project: theme, Unistyles, `@/theme` alias, `loom.json`, dependencies. */
export async function init({
  cwd,
  source = createEmbeddedSource(),
  install = true,
  run = runCommand,
  paths,
  version = LOOM_VERSION,
  ...conflicts
}: InitOptions): Promise<InitResult> {
  const pkgFile = join(cwd, 'package.json');
  if (!(await exists(pkgFile))) {
    throw new Error(
      `No package.json in ${cwd}. Run loom inside an Expo project.`
    );
  }
  const pkg = await readJson<PackageJson>(pkgFile);
  const manifest = await source.getManifest();
  await checkExpo(cwd, pkg, manifest.minimums.expo);

  if (!manifest.items[THEME_ITEM]) {
    throw new Error(`The registry has no "${THEME_ITEM}" item.`);
  }

  const defaults = defaultConfig();
  const config = (await readConfig(cwd)) ?? {
    ...defaults,
    paths: {
      ui: paths?.ui ?? defaults.paths.ui,
      theme: paths?.theme ?? defaults.paths.theme,
    },
  };

  const plan = await planItems(source, manifest, config, [THEME_ITEM]);
  const files = await writeFiles(cwd, plan.files, conflicts);

  const configured: string[] = [];
  const notes: string[] = [];
  const step = (changed: boolean | string | undefined, file: string) => {
    if (changed === true) configured.push(file);
    else if (typeof changed === 'string') notes.push(changed);
  };

  step(await configureTsconfig(cwd, config), 'tsconfig.json');
  step(await configureEntry(cwd, pkg, config), 'entry file');
  step(await configureBabel(cwd, config), 'babel.config.js');
  step(await configureAppJson(cwd), 'app.json');
  step(await configurePackageJson(pkgFile), 'package.json');

  config.items[THEME_ITEM] = { version };
  await writeConfig(cwd, config);

  const packages = missingPackages(pkg, plan.packages);
  const needsPreset = !declaredRange(pkg, 'babel-preset-expo');
  if (install) {
    const pm = await detectPackageManager(cwd);
    // Explicit ranges first, so `expo install` can resolve the config plugin added to app.json.
    if (packages.length) await run(...addCommand(pm, packages), cwd);
    if (needsPreset) {
      await run(...expoInstallCommand(pm, ['babel-preset-expo']), cwd);
    }
  }

  notes.push(
    'Wrap your root layout in <GestureHandlerRootView style={{ flex: 1 }}> from react-native-gesture-handler.',
    'Unistyles needs a development build (npx expo run:ios / run:android); Expo Go is not supported.'
  );

  return {
    config,
    files,
    configured,
    packages: needsPreset ? ['babel-preset-expo', ...packages] : packages,
    notes,
  };
}

async function checkExpo(cwd: string, pkg: PackageJson, range?: string) {
  const declared = declaredRange(pkg, 'expo');
  if (!declared) {
    throw new Error(
      'expo is not a dependency of this project. loom supports Expo projects only.'
    );
  }
  const installed = await readJson<{ version?: string }>(
    join(cwd, 'node_modules/expo/package.json')
  ).then(
    (p) => p.version,
    () => undefined
  );
  const version =
    installed ??
    (semver.validRange(declared)
      ? semver.minVersion(declared)?.version
      : undefined);
  if (range && version && !semver.satisfies(version, range)) {
    throw new Error(
      `Expo ${version} is not supported; loom needs expo ${range}.`
    );
  }
}

async function configureTsconfig(cwd: string, config: LoomConfig) {
  const file = join(cwd, 'tsconfig.json');
  const alias = [`./${config.paths.theme}`];
  if (!(await exists(file))) {
    await writeFile(
      file,
      `${JSON.stringify(
        {
          extends: 'expo/tsconfig.base',
          compilerOptions: { strict: true, paths: { '@/theme': alias } },
        },
        null,
        2
      )}\n`
    );
    return true;
  }
  return editJsonFile(file, (data) => {
    const options = data.compilerOptions as
      { paths?: Record<string, string[]> } | undefined;
    const current = options?.paths?.['@/theme'];
    return JSON.stringify(current) === JSON.stringify(alias)
      ? []
      : [[['compilerOptions', 'paths', '@/theme'], alias]];
  });
}

/** Imports the Unistyles setup from the app entry, right after `expo-router/entry` (ADR 0001). */
async function configureEntry(
  cwd: string,
  pkg: PackageJson,
  config: LoomConfig
) {
  const setup = `${config.paths.theme}/unistyles`;
  const usesRouter = !!declaredRange(pkg, 'expo-router');

  if (pkg.main === 'expo-router/entry' || (!pkg.main && usesRouter)) {
    if (!(await exists(join(cwd, 'index.ts')))) {
      await writeFile(
        join(cwd, 'index.ts'),
        `import 'expo-router/entry';\nimport './${setup}';\n`
      );
    } else if (!(await appendImport(cwd, 'index.ts', setup))) {
      return false;
    }
    await editJsonFile(join(cwd, 'package.json'), () => [
      [['main'], 'index.ts'],
    ]);
    return true;
  }

  const entry = pkg.main && (await findLocalFile(cwd, pkg.main));
  if (entry) return appendImport(cwd, entry, setup);
  return `Import ./${setup} from your app entry, after the router entry, before any component.`;
}

async function appendImport(cwd: string, entry: string, setup: string) {
  const file = join(cwd, entry);
  const text = await readFile(file, 'utf8');
  if (text.includes(setup)) return false;
  let specifier = posix.relative(posix.dirname(entry), setup);
  if (!specifier.startsWith('.')) specifier = `./${specifier}`;
  await writeFile(
    file,
    `${text.replace(/\n*$/, '\n')}import '${specifier}';\n`
  );
  return true;
}

async function configureBabel(cwd: string, config: LoomConfig) {
  const existing = await firstExisting(cwd, [
    'babel.config.js',
    'babel.config.cjs',
    'babel.config.mjs',
    '.babelrc',
    '.babelrc.js',
  ]);
  const root = babelRoot(config);
  if (!existing) {
    await writeFile(
      join(cwd, 'babel.config.js'),
      `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // \`root\` must contain every file that calls StyleSheet.create.
    plugins: [['${UNISTYLES_PLUGIN}', { root: '${root}' }]],
  };
};
`
    );
    return true;
  }
  if (
    (await readFile(join(cwd, existing), 'utf8')).includes(UNISTYLES_PLUGIN)
  ) {
    return false;
  }
  return `Add ['${UNISTYLES_PLUGIN}', { root: '${root}' }] to the plugins in ${existing}.`;
}

async function configureAppJson(cwd: string) {
  const file = join(cwd, 'app.json');
  const dynamic = await firstExisting(cwd, ['app.config.ts', 'app.config.js']);
  if (!(await exists(file))) {
    return `Add the "${ASYNC_STORAGE_PLUGIN}" plugin to ${dynamic ?? 'your Expo config'}.`;
  }
  const changed = await editJsonFile(file, (data) => {
    const expo = data.expo as { plugins?: unknown[] } | undefined;
    const plugins = expo?.plugins ?? [];
    const has = plugins.some(
      (p) =>
        p === ASYNC_STORAGE_PLUGIN ||
        (Array.isArray(p) && p[0] === ASYNC_STORAGE_PLUGIN)
    );
    return has
      ? []
      : [
          [
            ['expo', 'plugins'],
            [...plugins, ASYNC_STORAGE_PLUGIN],
          ],
        ];
  });
  if (dynamic && changed) {
    return `app.json gained the "${ASYNC_STORAGE_PLUGIN}" plugin; check that ${dynamic} keeps it.`;
  }
  return changed;
}

async function configurePackageJson(file: string) {
  return editJsonFile(file, (data) => {
    const current =
      (data.expo as { install?: { exclude?: string[] } } | undefined)?.install
        ?.exclude ?? [];
    const missing = INSTALL_EXCLUDE.filter((name) => !current.includes(name));
    return missing.length
      ? [
          [
            ['expo', 'install', 'exclude'],
            [...current, ...missing],
          ],
        ]
      : [];
  });
}

async function findLocalFile(cwd: string, main: string) {
  return firstExisting(
    cwd,
    ['', '.ts', '.tsx', '.js', '.jsx'].map((ext) => `${main}${ext}`)
  );
}

async function firstExisting(cwd: string, names: string[]) {
  for (const name of names) {
    if (await exists(join(cwd, name))) return name;
  }
  return undefined;
}

const exists = (path: string) =>
  access(path).then(
    () => true,
    () => false
  );

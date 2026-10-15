import { access } from 'node:fs/promises';
import { join } from 'node:path';

import {
  CONFIG_FILE,
  type LoomConfig,
  readConfig,
  targetPath,
  writeConfig,
} from '../project/config';
import {
  type ConflictOptions,
  type PlannedFile,
  writeFiles,
  type WriteReport,
} from '../project/files';
import { readJson } from '../project/json';
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
import type { Manifest } from '../registry/schema';
import { createEmbeddedSource, type RegistrySource } from '../registry/source';
import { LOOM_VERSION } from '../version';

export interface AddOptions extends ConflictOptions {
  cwd: string;
  /** Item names; their dependencies are added too. */
  items: string[];
  source?: RegistrySource;
  /** Install npm dependencies (default true). */
  install?: boolean;
  run?: RunCommand;
  version?: string;
}

export interface AddResult {
  /** Requested items and their dependencies, dependencies first. */
  items: string[];
  files: WriteReport;
  /** Package specs and SDK-pinned names installed, or that would be installed with `install: false`. */
  packages: string[];
}

/** Copies items (and their dependencies) into the project, installs their packages and records them in `loom.json`. */
export async function add({
  cwd,
  items,
  source = createEmbeddedSource(),
  install = true,
  run = runCommand,
  version = LOOM_VERSION,
  ...conflicts
}: AddOptions): Promise<AddResult> {
  if (!items.length) throw new Error('Name at least one item to add.');
  const config = await readConfig(cwd);
  if (!config) {
    throw new Error(`No ${CONFIG_FILE} in ${cwd}. Run \`loom init\` first.`);
  }

  const manifest = await source.getManifest();
  const resolved = resolveItems(manifest, items);
  const plan = await planItems(source, manifest, config, resolved);
  const files = await writeFiles(cwd, plan.files, conflicts);

  const pkgFile = join(cwd, 'package.json');
  const pkg = await access(pkgFile).then(
    () => readJson<PackageJson>(pkgFile),
    () => ({})
  );
  const packages = missingPackages(pkg, plan.packages);
  const sdkPackages = plan.sdkPackages.filter(
    (name) => !declaredRange(pkg, name)
  );

  for (const name of resolved) config.items[name] = { version };
  await writeConfig(cwd, config);

  if (install && (packages.length || sdkPackages.length)) {
    const pm = await detectPackageManager(cwd);
    if (packages.length) await run(...addCommand(pm, packages), cwd);
    if (sdkPackages.length) {
      await run(...expoInstallCommand(pm, sdkPackages), cwd);
    }
  }
  return { items: resolved, files, packages: [...packages, ...sdkPackages] };
}

/** The requested items plus their dependencies, in install order (dependencies first). */
export function resolveItems(manifest: Manifest, names: string[]): string[] {
  const unknown = names.filter((name) => !(name in manifest.items));
  if (unknown.length) {
    const available = Object.keys(manifest.items).sort().join(', ');
    throw new Error(
      `Unknown item(s): ${unknown.join(', ')}. Available: ${available || 'none'}.`
    );
  }

  const order: string[] = [];
  const visit = (name: string) => {
    if (order.includes(name)) return;
    // The manifest schema rejects cycles and unknown dependencies.
    manifest.items[name]?.dependencies.forEach(visit);
    order.push(name);
  };
  names.forEach(visit);
  return order;
}

/** Files to write and packages to require for already resolved items. Demos only when a sandbox is set. */
export async function planItems(
  source: RegistrySource,
  manifest: Manifest,
  config: LoomConfig,
  names: string[]
): Promise<{
  files: PlannedFile[];
  packages: Record<string, string>;
  sdkPackages: string[];
}> {
  const files: PlannedFile[] = [];
  const packages: Record<string, string> = {};
  const sdkPackages = new Set<string>();

  for (const name of names) {
    const item = manifest.items[name];
    if (!item) continue;
    const paths = [...item.files];
    if (item.demo && config.sandbox) paths.push(item.demo);
    for (const path of paths) {
      files.push({
        target: targetPath(config, path),
        content: await source.getFile(path),
      });
    }
    for (const [pkg, range] of Object.entries(item.packages)) {
      packages[pkg] ??= range;
    }
    item.sdkPackages.forEach((pkg) => sdkPackages.add(pkg));
  }
  return { files, packages, sdkPackages: [...sdkPackages] };
}

import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import semver from 'semver';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/** Runs a command in `cwd`; rejects on a non-zero exit. Injected so tests never install. */
export type RunCommand = (
  command: string,
  args: string[],
  cwd: string
) => Promise<void>;

export const runCommand: RunCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    );
  });

const lockfiles: [string, PackageManager][] = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lock', 'bun'],
  ['bun.lockb', 'bun'],
  ['package-lock.json', 'npm'],
];

/** Lockfile first, then the agent that launched loom, then npm. */
export const detectPackageManager = async (
  cwd: string
): Promise<PackageManager> => {
  for (const [file, pm] of lockfiles) {
    if (
      await access(join(cwd, file)).then(
        () => true,
        () => false
      )
    ) {
      return pm;
    }
  }
  const agent = process.env.npm_config_user_agent?.split('/')[0];
  return agent === 'pnpm' || agent === 'yarn' || agent === 'bun'
    ? agent
    : 'npm';
};

export const addCommand = (
  pm: PackageManager,
  specs: string[]
): [string, string[]] => {
  return [pm, [pm === 'npm' ? 'install' : 'add', ...specs]];
};

/** `expo install` resolves the version Expo pins for the project's SDK. */
export const expoInstallCommand = (
  pm: PackageManager,
  names: string[]
): [string, string[]] => {
  const exec: Record<PackageManager, string[]> = {
    npm: ['npx'],
    pnpm: ['pnpm', 'exec'],
    yarn: ['yarn'],
    bun: ['bunx'],
  };
  const [command, ...prefix] = exec[pm] as [string, ...string[]];
  return [command, [...prefix, 'expo', 'install', ...names]];
};

export interface PackageJson {
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export const declaredRange = (pkg: PackageJson, name: string) =>
  pkg.dependencies?.[name] ?? pkg.devDependencies?.[name];

/**
 * Packages to install as `name@range`: missing ones, and ones whose declared range
 * starts below the required range. Non-semver specs (workspace:, git, file:) are trusted.
 */
export const missingPackages = (
  pkg: PackageJson,
  required: Record<string, string>
): string[] => {
  return Object.entries(required)
    .filter(([name, range]) => {
      const declared = declaredRange(pkg, name);
      if (!declared) return true;
      const min = semver.validRange(declared)
        ? semver.minVersion(declared)
        : null;
      return min !== null && !semver.satisfies(min, range);
    })
    .map(([name, range]) => `${name}@${range}`);
};

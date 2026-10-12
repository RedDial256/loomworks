import { readFile, writeFile } from 'node:fs/promises';
import { join, posix } from 'node:path';

import { z } from 'zod';

import { isThemePath } from '../registry/schema';

export const CONFIG_FILE = 'loom.json';

const projectPath = z
  .string()
  .min(1)
  .refine(
    (p) =>
      !p.startsWith('/') &&
      !p.includes('\\') &&
      !p.split('/').some((s) => s === '' || s === '.' || s === '..'),
    'must be a relative POSIX path inside the project, without "." or ".." segments'
  );

export const configSchema = z.strictObject({
  paths: z.strictObject({
    /** Base folder for components, hooks and utils; keeps the registry layout so relative imports work. */
    ui: projectPath,
    /** Theme folder, aliased as `@/theme`. */
    theme: projectPath,
  }),
  /** Sandbox folder; demos are copied only when set. */
  sandbox: projectPath.optional(),
  /** Installed items and the loom version that installed them. */
  items: z
    .record(z.string(), z.strictObject({ version: z.string() }))
    .default({}),
});

export type LoomConfig = z.infer<typeof configSchema>;

export const defaultConfig = (): LoomConfig => ({
  paths: { ui: 'src', theme: 'src/theme' },
  items: {},
});

export async function readConfig(cwd: string): Promise<LoomConfig | undefined> {
  let raw: string;
  try {
    raw = await readFile(join(cwd, CONFIG_FILE), 'utf8');
  } catch {
    return undefined;
  }
  const result = configSchema.safeParse(JSON.parse(raw));
  if (!result.success) {
    throw new Error(
      `Invalid ${CONFIG_FILE}:\n${z.prettifyError(result.error)}`
    );
  }
  return result.data;
}

export async function writeConfig(cwd: string, config: LoomConfig) {
  await writeFile(
    join(cwd, CONFIG_FILE),
    `${JSON.stringify(config, null, 2)}\n`
  );
}

/** Project-relative target of a registry file. */
export function targetPath(config: LoomConfig, registryPath: string): string {
  return isThemePath(registryPath)
    ? posix.join(config.paths.theme, registryPath.slice('theme/'.length))
    : posix.join(config.paths.ui, registryPath);
}

/** The Unistyles Babel plugin `root`: the top folder holding loom's styled files. */
export const babelRoot = (config: LoomConfig) =>
  config.paths.ui.split('/')[0] ?? config.paths.ui;

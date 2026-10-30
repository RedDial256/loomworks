import { z } from 'zod';

const itemName = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/, 'use lowercase kebab-case');

// Relative POSIX path, resolved against the registry root (`packages/ui/src` when embedded).
const registryPath = z
  .string()
  .min(1)
  .refine(
    (p) =>
      !p.startsWith('/') &&
      !p.includes('\\') &&
      !p.split('/').some((s) => s === '' || s === '.' || s === '..'),
    'must be a relative POSIX path without "." or ".." segments'
  );

const itemSchema = z.strictObject({
  // `theme` items live under `theme/` and are copied to the theme folder (`@/theme`).
  kind: z.enum(['component', 'hook', 'util', 'theme']),
  description: z.string().optional(),
  files: z.array(registryPath).min(1),
  demo: registryPath.optional(),
  dependencies: z.array(itemName).default([]),
  packages: z.record(z.string().min(1), z.string().min(1)).default({}),
  // Versions pinned per Expo SDK (Reanimated, Worklets): installed with `expo install`.
  sdkPackages: z.array(z.string().min(1)).default([]),
});

const isTestFile = (p: string) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(p);
const isDemoFile = (p: string) => /\.demo\.[cm]?[jt]sx?$/.test(p);
export const isThemePath = (p: string) => p.startsWith('theme/');

export const manifestSchema = z
  .strictObject({
    version: z.literal(1),
    // Minimum versions for the target project, from ADR 0001.
    minimums: z.record(z.string().min(1), z.string().min(1)),
    items: z.record(itemName, itemSchema),
  })
  .superRefine((manifest, ctx) => {
    const owners = new Map<string, string>();

    for (const [name, item] of Object.entries(manifest.items)) {
      const check = (path: string, where: (string | number)[]) => {
        if (isTestFile(path)) {
          ctx.addIssue({
            code: 'custom',
            path: where,
            message: 'test files are never installed',
          });
        }
        const owner = owners.get(path);
        if (owner && owner !== name) {
          ctx.addIssue({
            code: 'custom',
            path: where,
            message: `file already owned by "${owner}"; extract it into its own item`,
          });
        }
        owners.set(path, name);
      };

      item.files.forEach((file, i) => {
        check(file, ['items', name, 'files', i]);
        if (isThemePath(file) !== (item.kind === 'theme')) {
          ctx.addIssue({
            code: 'custom',
            path: ['items', name, 'files', i],
            message: 'files under theme/ belong to theme items only',
          });
        }
      });

      if (item.demo !== undefined) {
        const where = ['items', name, 'demo'];
        if (!isDemoFile(item.demo)) {
          ctx.addIssue({
            code: 'custom',
            path: where,
            message: 'demo must be a *.demo.* file',
          });
        }
        if (item.files.includes(item.demo)) {
          ctx.addIssue({
            code: 'custom',
            path: where,
            message: 'demo must not be listed in files',
          });
        }
        check(item.demo, where);
      }

      item.sdkPackages.forEach((pkg, i) => {
        if (pkg in item.packages) {
          ctx.addIssue({
            code: 'custom',
            path: ['items', name, 'sdkPackages', i],
            message: `"${pkg}" is also listed in packages`,
          });
        }
      });

      item.dependencies.forEach((dep, i) => {
        if (!(dep in manifest.items)) {
          ctx.addIssue({
            code: 'custom',
            path: ['items', name, 'dependencies', i],
            message: `unknown item "${dep}"`,
          });
        }
      });
    }

    const cycle = findCycle(manifest.items);
    if (cycle) {
      ctx.addIssue({
        code: 'custom',
        path: ['items', cycle[0] ?? ''],
        message: `dependency cycle: ${cycle.join(' -> ')}`,
      });
    }
  });

export type Manifest = z.infer<typeof manifestSchema>;
export type ManifestItem = Manifest['items'][string];

export const parseManifest = (input: unknown): Manifest => {
  const result = manifestSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid manifest:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};

/** Every file the manifest references (item files and demos), without duplicates. */
export const manifestFiles = (manifest: Manifest): string[] => {
  const paths = new Set<string>();
  for (const item of Object.values(manifest.items)) {
    item.files.forEach((f) => paths.add(f));
    if (item.demo) paths.add(item.demo);
  }
  return [...paths];
};

const findCycle = (
  items: Record<string, { dependencies: string[] }>
): string[] | undefined => {
  const state = new Map<string, 'visiting' | 'done'>();
  const stack: string[] = [];

  const visit = (name: string): string[] | undefined => {
    if (state.get(name) === 'done') return undefined;
    if (state.get(name) === 'visiting') {
      return [...stack.slice(stack.indexOf(name)), name];
    }
    const item = items[name];
    if (!item) return undefined;
    state.set(name, 'visiting');
    stack.push(name);
    for (const dep of item.dependencies) {
      const cycle = visit(dep);
      if (cycle) return cycle;
    }
    stack.pop();
    state.set(name, 'done');
    return undefined;
  };

  for (const name of Object.keys(items)) {
    const cycle = visit(name);
    if (cycle) return cycle;
  }
  return undefined;
};

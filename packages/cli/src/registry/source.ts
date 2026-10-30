import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Manifest, manifestFiles, parseManifest } from './schema';

/** Where the CLI reads items from. A remote registry can implement the same interface. */
export interface RegistrySource {
  getManifest(): Promise<Manifest>;
  /** Content of a file listed in the manifest, by its manifest path. */
  getFile(path: string): Promise<string>;
}

/** Reads a folder produced by `embedRegistry`. */
export const createFsSource = (dir: string): RegistrySource => {
  let manifest: Promise<Manifest> | undefined;
  const getManifest = () =>
    (manifest ??= readFile(join(dir, 'manifest.json'), 'utf8').then((raw) =>
      parseManifest(JSON.parse(raw))
    ));

  return {
    getManifest,
    async getFile(path) {
      if (!manifestFiles(await getManifest()).includes(path)) {
        throw new Error(`File is not part of the manifest: ${path}`);
      }
      return readFile(join(dir, 'files', path), 'utf8');
    },
  };
};

/** The registry bundled next to the built CLI (`dist/registry`). */
export const createEmbeddedSource = (): RegistrySource => {
  return createFsSource(fileURLToPath(new URL('./registry/', import.meta.url)));
};

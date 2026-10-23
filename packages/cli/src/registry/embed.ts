import {
  access,
  copyFile,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { manifestFiles, parseManifest } from './schema';

interface EmbedOptions {
  /** Root of the UI package: holds `manifest.json` and `src/`. */
  uiRoot: string;
  /** Output folder; receives `manifest.json` and `files/`. */
  outDir: string;
}

/** Validates the UI manifest and copies exactly the files it references into `outDir`. */
export const embedRegistry = async ({
  uiRoot,
  outDir,
}: EmbedOptions): Promise<string[]> => {
  const manifest = parseManifest(
    JSON.parse(await readFile(join(uiRoot, 'manifest.json'), 'utf8'))
  );
  const srcRoot = join(uiRoot, 'src');
  const paths = manifestFiles(manifest);

  // Check everything before touching `outDir`, so a bad manifest never leaves a half-built output.
  for (const path of paths) {
    await access(join(srcRoot, path)).catch(() => {
      throw new Error(`Manifest references a missing file: ${path}`);
    });
  }

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const path of paths) {
    const target = join(outDir, 'files', path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(srcRoot, path), target);
  }
  await writeFile(
    join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  return paths;
};

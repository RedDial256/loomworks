import { defineConfig } from 'tsdown';

import { embedRegistry } from './src/registry/embed';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: 'esm',
  target: 'node20',
  dts: true,
  clean: true,
  // Bundle the UI sources and manifest next to the build (read through `createEmbeddedSource`).
  async onSuccess() {
    const files = await embedRegistry({
      uiRoot: '../ui',
      outDir: 'dist/registry',
    });
    console.log(`Embedded registry: ${files.length} file(s)`);
  },
});

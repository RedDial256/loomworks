import { defineConfig } from 'tsdown';

import { embedTemplate } from './src/template/embed';

export default defineConfig({
  entry: ['src/bin.ts'],
  format: 'esm',
  target: 'node20',
  clean: true,
  // Bundle the standalone template and the tooling versions next to the build (read by `create`).
  async onSuccess() {
    await embedTemplate({
      templateRoot: '../../templates/app',
      toolingPackageJson: '../../package.json',
      outDir: 'dist',
    });
    console.log('Embedded the template');
  },
});

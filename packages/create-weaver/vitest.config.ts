import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@red_dial/loom': fileURLToPath(
        new URL('../cli/src/index.ts', import.meta.url)
      ),
    },
  },
});

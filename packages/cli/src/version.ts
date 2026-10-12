import { readFileSync } from 'node:fs';

// `../package.json` resolves from both `src/` and the bundled `dist/`.
export const LOOM_VERSION: string = (
  JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8')
  ) as { version: string }
).version;
